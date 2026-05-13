ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS sweetness text,
  ADD COLUMN IF NOT EXISTS toppings text[] NOT NULL DEFAULT '{}'::text[];