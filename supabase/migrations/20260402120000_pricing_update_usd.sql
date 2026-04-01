-- Apr 2026 pricing: borders (USD cents), templates (decimal USD).
-- Run in Supabase SQL editor or via migration pipeline.

UPDATE public.borders
SET
  price_major_arcana = 895,
  price_full_deck = 895;

UPDATE public.templates
SET
  template_price = 18.95,
  print_price = 24.95;
