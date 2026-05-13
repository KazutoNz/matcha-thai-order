import { useOrders } from '@/hooks/useOrders';
import { toppings } from '@/lib/products';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const statusToStep = (status: string) => {
  if (status === 'preparing') return 1;
  if (status === 'ready') return 2;
  if (status === 'completed') return 3;
  return 0;
};

const Tracking = () => {
  const { orders, loading } = useOrders();

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

  const latestOrder = orders[0];

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">ติดตามคำสั่งซื้อ</h1>
      <OrderStatusTracker currentStep={statusToStep(latestOrder.status)} />
      <div className="mt-8 rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">รหัสออเดอร์</span>
          <span className="font-mono font-semibold text-xs">{latestOrder.id.slice(0, 8)}</span>
        </div>
        <div className="space-y-2">
          {latestOrder.order_items.map((item) => (
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
          <span className="text-primary">฿{Number(latestOrder.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
