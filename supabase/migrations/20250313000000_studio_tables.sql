-- Studio: purchases, decks, cards (run in Supabase SQL editor)

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  border_slug TEXT NOT NULL,
  border_name TEXT NOT NULL,
  templated_template_id TEXT NOT NULL,
  suite_size TEXT NOT NULL,
  card_count INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  purchase_id UUID REFERENCES purchases(id),
  border_slug TEXT NOT NULL,
  border_name TEXT NOT NULL,
  templated_template_id TEXT NOT NULL,
  total_cards INTEGER NOT NULL,
  completed_cards INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id),
  card_index INTEGER NOT NULL,
  numeral TEXT,
  card_name TEXT,
  artwork_url TEXT,
  render_url TEXT,
  status TEXT DEFAULT 'empty',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deck_id, card_index)
);

-- Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_purchases" ON purchases
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_decks" ON decks
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_cards" ON cards
  FOR ALL USING (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );
