-- Ensure studio_cards.numeral exists (nullable). Fixes PostgREST "schema cache" errors when
-- the column was missing from a DB that predates or diverged from 20260404180000_studio_persistent_projects.sql.
--
-- After applying in Supabase SQL Editor, reload API schema cache:
--   NOTIFY pgrst, 'reload schema';
-- Or: Project Settings → API → restart (if available) / pause & restore project.
ALTER TABLE public.studio_cards
  ADD COLUMN IF NOT EXISTS numeral TEXT;

COMMENT ON COLUMN public.studio_cards.numeral IS 'Optional Roman/Arabic numeral or label for the card face (e.g. VIII).';
