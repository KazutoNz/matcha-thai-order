import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_LABEL, STATUS_BADGE } from '@/lib/order-status';
import { toast } from 'sonner';
import { Bike, CheckCircle2, PackageCheck } from 'lucide-react';

const Deliveries = () => {
  const { user } = useAuth();
  const { orders, loading, refresh } = useOrders({
    riderId: user?.id,
    statuses: ['ready', 'out_for_delivery'],
  });

  const accept = async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'out_for_delivery' as any, rider_id: user!.id } as any)
      .eq('id', id);
    if (error) { toast.error('รับงานไม่สำเร็จ'); return; }
    toast.success('รับงานแล้ว');
    refresh();
  };

  const deliver = async (id: string) => {
    const { error } = await supabase.from('orders').update({ status: 'delivered' as any }).eq('id', id);
    if (error) { toast.error('อัปเดตไม่สำเร็จ'); return; }
    toast.success('ส่งสำเร็จ');
    refresh();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">งานจัดส่งของฉัน</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">ยังไม่มีงานในตอนนี้</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString('th-TH')}
                  </p>
                </div>
                <Badge className={STATUS_BADGE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
              </div>

              <div className="text-sm space-y-1">
                {o.order_items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.product?.name ?? 'สินค้า'} x{it.qty}</span>
                    <span className="text-primary font-semibold">฿{Number(it.price)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-bold">฿{Number(o.total)}</span>
                {o.status === 'ready' && (
                  <Button size="sm" onClick={() => accept(o.id)}>
                    <Bike className="mr-1 h-4 w-4" /> รับงาน
                  </Button>
                )}
                {o.status === 'out_for_delivery' && (
                  <Button size="sm" onClick={() => deliver(o.id)}>
                    <CheckCircle2 className="mr-1 h-4 w-4" /> ส่งสำเร็จ
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deliveries;
