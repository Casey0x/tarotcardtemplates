-- Bulletproof NOT NULL: server omitting border_slug still gets a value on insert.
ALTER TABLE public.studio_decks
  ALTER COLUMN border_slug SET DEFAULT 'default-border';
