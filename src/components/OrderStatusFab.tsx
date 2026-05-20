import { Link } from 'react-router-dom';
import { Clock, CheckCheck, ChefHat, PackageCheck, Bike, Home as HomeIcon } from 'lucide-react';
import { useOrders, type OrderStatus } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { STATUS_LABEL } from '@/lib/order-status';

const ICON: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCheck,
  preparing: ChefHat,
  ready: PackageCheck,
  out_for_delivery: Bike,
  delivered: HomeIcon,
  completed: HomeIcon,
  cancelled: Clock,
};

const ACTIVE: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];

const OrderStatusFab = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  if (!user) return null;

  const active = orders.find((o) => ACTIVE.includes(o.status));
  if (!active) return null;

  const Icon = ICON[active.status];
  const label = STATUS_LABEL[active.status];

  return (
    <Link
      to={`/tracking/${active.id}`}
      aria-label={`สถานะออเดอร์: ${label}`}
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2 sm:bottom-6 sm:right-6"
    >
      <span className="hidden rounded-full bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-md backdrop-blur sm:inline-block">
        {label}
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/30 [animation-delay:600ms]" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background transition-transform hover:scale-105">
          <Icon className={`h-6 w-6 ${active.status === 'out_for_delivery' ? 'animate-bounce' : ''}`} />
        </span>
      </span>
    </Link>
  );
};

export default OrderStatusFab;
