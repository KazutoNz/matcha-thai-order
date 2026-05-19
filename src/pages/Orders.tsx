import { Link, Navigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_LABEL, STATUS_BADGE } from '@/lib/order-status';
import { toppings } from '@/lib/products';
import { MapPin, Phone } from 'lucide-react';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading } = useOrders();

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="mb-6 text-3xl font-bold">ประวัติการสั่งซื้อ</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-muted-foreground">ยังไม่มีคำสั่งซื้อ</p>
          <Button asChild><Link to="/menu">เริ่มสั่งซื้อ</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">รหัสออเดอร์</p>
                  <p className="font-mono text-sm font-semibold">{order.id.slice(0, 8)}</p>
                </div>
                <Badge className={STATUS_BADGE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleString('th-TH')}
              </div>

              <div className="space-y-1 text-sm">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product?.name ?? 'สินค้า'} x{item.qty}
                      {item.sweetness && <span className="text-muted-foreground"> · หวาน {item.sweetness}</span>}
                      {item.toppings?.length > 0 && (
                        <span className="text-muted-foreground"> · {item.toppings.map((t) => toppingNameMap[t] || t).join(', ')}</span>
                      )}
                    </span>
                    <span className="font-semibold text-primary">฿{Number(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm">ยอดรวม</span>
                <span className="text-lg font-bold text-primary">฿{Number(order.total)}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild size="sm" variant="default">
                  <Link to={`/tracking?id=${order.id}`}>
                    <MapPin className="mr-1 h-4 w-4" /> ติดตามออเดอร์
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href="tel:020000000">
                    <Phone className="mr-1 h-4 w-4" /> ติดต่อร้าน
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
