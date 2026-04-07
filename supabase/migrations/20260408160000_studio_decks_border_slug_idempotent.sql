-- Deck-level border for Studio (all 78 cards share one border).
-- Safe to run in Supabase SQL editor if the column already exists.
ALTER TABLE public.studio_decks
  ADD COLUMN IF NOT EXISTS border_slug TEXT;

COMMENT ON COLUMN public.studio_decks.border_slug IS 'Templated border slug for the entire deck; applies to every studio_cards row.';
