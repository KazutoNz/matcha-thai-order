import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing' | 'ready'
  | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';

export interface DbOrderItem {
  id: string;
  product_id: string;
  qty: number;
  price: number;
  sweetness: string | null;
  toppings: string[];
  product?: { name: string; image_url: string | null } | null;
}

export interface DbOrder {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  rider_id?: string | null;
  order_items: DbOrderItem[];
}

interface Opts {
  all?: boolean;
  riderId?: string;            // see only orders for this rider OR unassigned
  statuses?: OrderStatus[];
}

export const useOrders = (opts?: Opts) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!opts?.all && !opts?.riderId && !user) {
      setOrders([]); setLoading(false); return;
    }
    setLoading(true);
    let q = supabase
      .from('orders')
      .select('id, user_id, total, status, created_at, rider_id, order_items(id, product_id, qty, price, sweetness, toppings, product:products(name, image_url))')
      .order('created_at', { ascending: false });
    if (!opts?.all && !opts?.riderId && user) q = q.eq('user_id', user.id);
    if (opts?.statuses && opts.statuses.length) q = q.in('status', opts.statuses as any);
    const { data, error } = await q;
    if (error) console.error('useOrders', error);
    setOrders((data as any as DbOrder[]) ?? []);
    setLoading(false);
  }, [user, opts?.all, opts?.riderId, JSON.stringify(opts?.statuses)]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const channel = supabase
      .channel('orders-changes-' + Math.random())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  return { orders, loading, refresh: fetchOrders };
};
