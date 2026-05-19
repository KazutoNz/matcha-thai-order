import { useSearchParams, Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { toppings } from '@/lib/products';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_LABEL, STATUS_BADGE, STATUS_TO_STEP } from '@/lib/order-status';
import { Phone } from 'lucide-react';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const Tracking = () => {
  const { orders, loading } = useOrders();
  const [params] = useSearchParams();
  const id = params.get('id');

  if (loading) {
    return (
      <div className="container max-w-2xl py-8 space-y-4">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">ยังไม่มีคำสั่งซื้อ</p>
        <Button asChild><Link to="/menu">กลับไปดูเมนู</Link></Button>
      </div>
    );
  }

  const order = (id && orders.find((o) => o.id === id)) || orders[0];

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">ติดตามคำสั่งซื้อ</h1>
      <OrderStatusTracker currentStep={STATUS_TO_STEP[order.status]} />

      <div className="mt-6 rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">รหัสออเดอร์</p>
            <p className="font-mono font-semibold text-sm">{order.id.slice(0, 8)}</p>
          </div>
          <Badge className={STATUS_BADGE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
        </div>

        <div className="space-y-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
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

        <div className="flex items-center justify-between border-t pt-3 text-lg font-bold">
          <span>ยอดรวม</span>
          <span className="text-primary">฿{Number(order.total)}</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="outline" size="sm">
            <Link to="/orders">ประวัติทั้งหมด</Link>
          </Button>
          <Button asChild size="sm">
            <a href="tel:020000000">
              <Phone className="mr-1 h-4 w-4" /> ติดต่อร้าน
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
