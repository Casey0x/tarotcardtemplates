-- Persistent Studio preview projects (separate from legacy purchase-linked `decks` / `cards`).
CREATE TABLE IF NOT EXISTS public.studio_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  border_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, border_slug)
);

CREATE TABLE IF NOT EXISTS public.studio_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.studio_decks (id) ON DELETE CASCADE,
  card_key TEXT NOT NULL,
  card_name TEXT,
  numeral TEXT,
  image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (deck_id, card_key)
);

CREATE INDEX IF NOT EXISTS studio_cards_deck_id_idx ON public.studio_cards (deck_id);

ALTER TABLE public.studio_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "studio_decks_select_own" ON public.studio_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "studio_decks_insert_own" ON public.studio_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "studio_decks_update_own" ON public.studio_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "studio_decks_delete_own" ON public.studio_decks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "studio_cards_all_own" ON public.studio_cards FOR ALL USING (
  deck_id IN (SELECT id FROM public.studio_decks WHERE user_id = auth.uid())
);
