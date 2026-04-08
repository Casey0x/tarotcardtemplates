-- Copy/paste into Supabase SQL editor (same as migration 20260412120000_studio_artwork_library.sql).

CREATE TABLE IF NOT EXISTS public.studio_artwork (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_url TEXT,
  original_filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_artwork_user_id_created_at_idx
  ON public.studio_artwork (user_id, created_at DESC);

ALTER TABLE public.studio_cards
  ADD COLUMN IF NOT EXISTS artwork_id UUID REFERENCES public.studio_artwork (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS studio_cards_artwork_id_idx ON public.studio_cards (artwork_id);

ALTER TABLE public.studio_artwork ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "studio_artwork_select_own" ON public.studio_artwork;
DROP POLICY IF EXISTS "studio_artwork_insert_own" ON public.studio_artwork;
DROP POLICY IF EXISTS "studio_artwork_delete_own" ON public.studio_artwork;

CREATE POLICY "studio_artwork_select_own" ON public.studio_artwork
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "studio_artwork_insert_own" ON public.studio_artwork
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "studio_artwork_delete_own" ON public.studio_artwork
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.studio_artwork IS 'User artwork library; paths live under studio-uploads/{userId}/artwork-library/.';
