import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useOrders, type DbOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { STATUS_LABEL, STATUS_BADGE, STATUS_TO_STEP } from '@/lib/order-status';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import { toppings } from '@/lib/products';
import { MapPin, Phone, Clock, CheckCheck, ChefHat, PackageCheck, Bike, Home as HomeIcon } from 'lucide-react';
import type { OrderStatus } from '@/hooks/useOrders';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const STATUS_ICON: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCheck,
  preparing: ChefHat,
  ready: PackageCheck,
  out_for_delivery: Bike,
  delivered: HomeIcon,
  completed: HomeIcon,
  cancelled: Clock,
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading } = useOrders();
  const [selected, setSelected] = useState<DbOrder | null>(null);

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const StatusIcon = selected ? STATUS_ICON[selected.status] : Clock;

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
          <Button asChild className="rounded-full"><Link to="/menu">เริ่มสั่งซื้อ</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm">
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
                <Button size="sm" className="rounded-full" onClick={() => setSelected(order)}>
                  <MapPin className="mr-1 h-4 w-4" /> ติดตามสถานะ
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href="tel:020000000">
                    <Phone className="mr-1 h-4 w-4" /> ติดต่อร้าน
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>สถานะออเดอร์</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/20 [animation-delay:600ms]" />
                  <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
                    <StatusIcon className={`h-12 w-12 ${selected.status === 'out_for_delivery' ? 'animate-bounce' : ''}`} />
                  </span>
                </div>
                <Badge className={STATUS_BADGE[selected.status] + ' text-base px-4 py-1 rounded-full'}>
                  {STATUS_LABEL[selected.status]}
                </Badge>
                <p className="font-mono text-xs text-muted-foreground">#{selected.id.slice(0, 8)}</p>
              </div>

              <OrderStatusTracker currentStep={STATUS_TO_STEP[selected.status]} />

              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild size="sm" className="flex-1 rounded-full">
                  <Link to={`/tracking?id=${selected.id}`}>ดูหน้าติดตามแบบเต็ม</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href="tel:020000000"><Phone className="mr-1 h-4 w-4" /> โทรร้าน</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
