
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.orders';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
