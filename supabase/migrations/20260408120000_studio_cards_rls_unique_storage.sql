-- Harden studio_cards RLS (user_id), enforce unique (deck_id, card_index), unify storage policies.

DELETE FROM public.studio_cards c
WHERE NOT EXISTS (SELECT 1 FROM public.studio_decks d WHERE d.id = c.deck_id);

-- Backfill and dedupe before unique constraint
UPDATE public.studio_cards sc
SET user_id = sd.user_id
FROM public.studio_decks sd
WHERE sc.deck_id = sd.id
  AND sc.user_id IS NULL;

DELETE FROM public.studio_cards WHERE user_id IS NULL;

UPDATE public.studio_cards
SET card_index = (card_key)::int
WHERE card_index IS NULL
  AND card_key ~ '^[0-9]+$';

-- Rows that cannot be keyed by index would block NOT NULL / UNIQUE; drop them (edge-case legacy data)
DELETE FROM public.studio_cards
WHERE card_index IS NULL;

-- Remove duplicate (deck_id, card_index), keep smallest id
DELETE FROM public.studio_cards a
USING public.studio_cards b
WHERE a.deck_id = b.deck_id
  AND a.card_index IS NOT NULL
  AND b.card_index IS NOT NULL
  AND a.card_index = b.card_index
  AND a.id > b.id;

ALTER TABLE public.studio_cards
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.studio_cards
  ALTER COLUMN card_index SET NOT NULL;

DROP INDEX IF EXISTS studio_cards_deck_id_card_index_uidx;

ALTER TABLE public.studio_cards
  DROP CONSTRAINT IF EXISTS unique_deck_card_index;

ALTER TABLE public.studio_cards
  ADD CONSTRAINT unique_deck_card_index UNIQUE (deck_id, card_index);

ALTER TABLE public.studio_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "studio_cards_all_own" ON public.studio_cards;
DROP POLICY IF EXISTS "Users can access their own cards" ON public.studio_cards;

CREATE POLICY "Users can access their own cards"
  ON public.studio_cards
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Replace per-operation storage policies with one policy per bucket (folder isolation)
DROP POLICY IF EXISTS "studio_renders_select_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_renders_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_renders_update_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_renders_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_uploads_select_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_uploads_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_uploads_update_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_uploads_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "Users can access their own storage" ON storage.objects;

CREATE POLICY "Users can access their own storage"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'studio-renders'
    AND (storage.foldername (name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'studio-renders'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can access their own storage uploads"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'studio-uploads'
    AND (storage.foldername (name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'studio-uploads'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );
