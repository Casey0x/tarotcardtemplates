-- Paid Studio ZIP exports (Stripe checkout → studio-renders PNGs).
CREATE TABLE IF NOT EXISTS public.studio_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  deck_id UUID NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('major_arcana', 'full_deck')),
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_exports_user_deck_type_unique UNIQUE (user_id, deck_id, export_type)
);

CREATE UNIQUE INDEX IF NOT EXISTS studio_exports_stripe_session_id_uidx
  ON public.studio_exports (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS studio_exports_user_id_deck_id_idx ON public.studio_exports (user_id, deck_id);

ALTER TABLE public.studio_exports ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.studio_exports IS 'Stripe Studio export purchases; API uses service role to read/write.';
