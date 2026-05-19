-- Add rider_id to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_id uuid;
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON public.orders(rider_id);

-- Manager: full access to orders and order_items (like admin)
CREATE POLICY "orders_manager_all" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "order_items_manager_all" ON public.order_items
  FOR ALL USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "products_manager_all" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- Rider: see assigned orders + unassigned ones in ready/confirmed status
CREATE POLICY "orders_rider_select" ON public.orders
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rider')
    AND (rider_id = auth.uid() OR rider_id IS NULL)
  );

CREATE POLICY "orders_rider_update" ON public.orders
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'rider')
    AND (rider_id = auth.uid() OR rider_id IS NULL)
  );

CREATE POLICY "order_items_rider_select" ON public.order_items
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rider')
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.rider_id = auth.uid() OR o.rider_id IS NULL)
    )
  );