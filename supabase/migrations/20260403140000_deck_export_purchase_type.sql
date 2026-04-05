-- Deck export product: extend purchases for purchase_type + optional legacy columns
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS purchase_type text DEFAULT 'border_pack',
  ADD COLUMN IF NOT EXISTS email text;

UPDATE public.purchases SET purchase_type = 'border_pack' WHERE purchase_type IS NULL;

ALTER TABLE public.purchases
  ALTER COLUMN templated_template_id DROP NOT NULL,
  ALTER COLUMN suite_size DROP NOT NULL,
  ALTER COLUMN card_count DROP NOT NULL;
