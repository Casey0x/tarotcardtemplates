-- image_path points at studio-renders; it is only set after a successful /api/studio/render.
-- save-card may INSERT/UPDATE rows with artwork in image_url but no render yet — image_path must be nullable.
ALTER TABLE public.studio_cards
  ALTER COLUMN image_path DROP NOT NULL;

COMMENT ON COLUMN public.studio_cards.image_path IS 'Object path in bucket studio-renders (rendered card PNG). NULL until first render.';

-- PostgREST: NOTIFY pgrst, 'reload schema';
