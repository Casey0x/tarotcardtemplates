-- Allow per-suit Studio ZIP export types (Stripe checkout metadata + studio_exports.export_type).
ALTER TABLE public.studio_exports
  DROP CONSTRAINT IF EXISTS studio_exports_export_type_check;

ALTER TABLE public.studio_exports
  ADD CONSTRAINT studio_exports_export_type_check
  CHECK (export_type IN (
    'major_arcana',
    'wands',
    'cups',
    'swords',
    'pentacles',
    'full_deck'
  ));
