import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  order_items: DbOrderItem[];
}

export const useOrders = (opts?: { all?: boolean }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!opts?.all && !user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let q = supabase
      .from('orders')
      .select('id, user_id, total, status, created_at, order_items(id, product_id, qty, price, sweetness, toppings, product:products(name, image_url))')
      .order('created_at', { ascending: false });
    if (!opts?.all && user) q = q.eq('user_id', user.id);
    const { data, error } = await q;
    if (error) console.error('useOrders', error);
    setOrders((data as any as DbOrder[]) ?? []);
    setLoading(false);
  }, [user, opts?.all]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  return { orders, loading, refresh: fetchOrders };
};
