-- One studio deck per user: remove duplicates, drop (user_id, border_slug) unique, add unique (user_id).

-- Remove older duplicate decks per user (keep newest by updated_at)
DELETE FROM public.studio_decks a
USING public.studio_decks b
WHERE a.user_id = b.user_id
  AND a.updated_at < b.updated_at;

-- Resolve ties (same updated_at): keep smallest id
DELETE FROM public.studio_decks a
USING public.studio_decks b
WHERE a.user_id = b.user_id
  AND a.updated_at = b.updated_at
  AND a.id > b.id;

ALTER TABLE public.studio_decks
  DROP CONSTRAINT IF EXISTS studio_decks_user_id_border_slug_key;

ALTER TABLE public.studio_decks
  DROP CONSTRAINT IF EXISTS unique_user_deck;

ALTER TABLE public.studio_decks
  ADD CONSTRAINT unique_user_deck UNIQUE (user_id);
