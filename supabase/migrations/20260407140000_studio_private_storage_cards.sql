-- Studio: user_id + card_index + rendered image_path; private buckets for user assets.

ALTER TABLE public.studio_cards
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;

ALTER TABLE public.studio_cards
  ADD COLUMN IF NOT EXISTS card_index int;

ALTER TABLE public.studio_cards
  ADD COLUMN IF NOT EXISTS image_path text;

UPDATE public.studio_cards sc
SET user_id = sd.user_id
FROM public.studio_decks sd
WHERE sc.deck_id = sd.id
  AND sc.user_id IS NULL;

UPDATE public.studio_cards
SET card_index = (card_key)::int
WHERE card_index IS NULL
  AND card_key ~ '^[0-9]+$';

CREATE UNIQUE INDEX IF NOT EXISTS studio_cards_deck_id_card_index_uidx
  ON public.studio_cards (deck_id, card_index)
  WHERE card_index IS NOT NULL;

CREATE INDEX IF NOT EXISTS studio_cards_user_id_idx
  ON public.studio_cards (user_id);

COMMENT ON COLUMN public.studio_cards.image_path IS 'Object path in bucket studio-renders (rendered card PNG).';
COMMENT ON COLUMN public.studio_cards.image_url IS 'Object path in bucket studio-uploads for artwork, or legacy full URL.';

INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-renders', 'studio-renders', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-uploads', 'studio-uploads', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "studio_renders_select_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_renders_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_renders_update_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_renders_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_uploads_select_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_uploads_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_uploads_update_own" ON storage.objects;
DROP POLICY IF EXISTS "studio_uploads_delete_own" ON storage.objects;

CREATE POLICY "studio_renders_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'studio-renders'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_renders_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'studio-renders'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_renders_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'studio-renders'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_renders_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'studio-renders'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_uploads_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'studio-uploads'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_uploads_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'studio-uploads'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_uploads_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'studio-uploads'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_uploads_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'studio-uploads'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );
