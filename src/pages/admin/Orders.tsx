import { useOrders } from '@/hooks/useOrders';
import { toppings } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
import { STATUS_LABEL, STATUS_BADGE, ALL_STATUSES } from '@/lib/order-status';
import type { OrderStatus } from '@/hooks/useOrders';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const OrderCard = ({
  order, statusMenu, lines,
}: { order: any; statusMenu: React.ReactNode; lines: React.ReactNode[] }) => {
  const [expanded, setExpanded] = useState(false);
  const collapsible = lines.length > 2;
  const visible = expanded || !collapsible ? lines : lines.slice(0, 2);
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
        <span className="text-right text-xs text-muted-foreground">
          {new Date(order.created_at).toLocaleString('th-TH')}
        </span>
      </div>
      <div className="mt-3 space-y-1 text-sm leading-relaxed break-words">{visible}</div>
      {collapsible && (
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0 text-xs"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'ย่อลง' : `ดูเพิ่มเติม (+${lines.length - 2})`}
        </Button>
      )}
      <div className="mt-3 flex items-center justify-end gap-3 border-t pt-3">
        <span className="font-bold">฿{Number(order.total)}</span>
        {statusMenu}
      </div>
    </div>
  );
};


const Orders = () => {
  const { orders, loading, refresh } = useOrders({ all: true });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status: status as any }).eq('id', orderId);
    if (error) { toast.error('อัปเดตสถานะไม่สำเร็จ'); console.error(error); return; }
    toast.success('อัปเดตสถานะเรียบร้อย');
    refresh();
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (orders.length === 0) return <p className="text-muted-foreground">ยังไม่มีออเดอร์</p>;

  const renderStatusMenu = (order: (typeof orders)[number]) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0">
          <Badge className={STATUS_BADGE[order.status]}>
            {STATUS_LABEL[order.status]}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ALL_STATUSES.map((s) => (
          <DropdownMenuItem key={s} onClick={() => handleStatusChange(order.id, s)}>
            {STATUS_LABEL[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const itemLines = (order: (typeof orders)[number]) =>
    order.order_items.map((item) => (
      <span key={item.id} className="block">
        {item.product?.name ?? 'สินค้า'} x{item.qty}
        {item.sweetness && ` (หวาน ${item.sweetness}`}
        {item.toppings?.length > 0 && `, ${item.toppings.map((t) => toppingNameMap[t] || t).join(', ')}`}
        {item.sweetness && ')'}
      </span>
    ));

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">รายการออเดอร์</h2>

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} statusMenu={renderStatusMenu(order)} lines={itemLines(order)} />
        ))}
      </div>

      <div className="hidden rounded-lg border overflow-x-auto md:block">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>รายการ</TableHead>
              <TableHead className="text-right">ยอด</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleString('th-TH')}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="flex flex-col gap-1 text-sm">{itemLines(order)}</div>
                </TableCell>
                <TableCell className="text-right font-bold">฿{Number(order.total)}</TableCell>
                <TableCell>{renderStatusMenu(order)}</TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Orders;
