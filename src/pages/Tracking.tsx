import { useCartStore } from '@/lib/cart-store';
import { toppings } from '@/lib/products';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const statusToStep = (status: string) => {
  if (status === 'preparing') return 1;
  if (status === 'completed') return 3;
  return 0;
};

const Tracking = () => {
  const orders = useCartStore((s) => s.orders);

  if (orders.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">ยังไม่มีคำสั่งซื้อ</p>
        <Button asChild><Link to="/menu">กลับไปดูเมนู</Link></Button>
      </div>
    );
  }

  const latestOrder = orders[orders.length - 1];

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">ติดตามคำสั่งซื้อ</h1>
      <OrderStatusTracker currentStep={statusToStep(latestOrder.status)} />
      <div className="mt-8 rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">รหัสออเดอร์</span>
          <span className="font-mono font-semibold">{latestOrder.id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">ชื่อ</span>
          <span className="font-medium">{latestOrder.customerName}</span>
        </div>
        <div className="space-y-2">
          {latestOrder.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span className="font-semibold text-primary">฿{item.totalPrice}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-lg font-bold">
          <span>ยอดรวม</span>
          <span className="text-primary">฿{latestOrder.total}</span>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
