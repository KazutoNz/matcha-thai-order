import { useOrders, type DbOrder } from '@/hooks/useOrders';
import { toppings } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
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

type Status = DbOrder['status'];

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending:    { label: 'รอดำเนินการ', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  preparing:  { label: 'กำลังเตรียม', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  ready:      { label: 'พร้อมส่ง',    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
  completed:  { label: 'เสร็จสิ้น',   className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  cancelled:  { label: 'ยกเลิก',      className: 'bg-red-100 text-red-800 hover:bg-red-100' },
};

const Orders = () => {
  const { orders, loading, refresh } = useOrders({ all: true });

  const handleStatusChange = async (orderId: string, status: Status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      toast.error('อัปเดตสถานะไม่สำเร็จ');
      console.error(error);
      return;
    }
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

  if (orders.length === 0) {
    return <p className="text-muted-foreground">ยังไม่มีออเดอร์</p>;
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">รายการออเดอร์</h2>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสออเดอร์</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>รายการสินค้า</TableHead>
              <TableHead className="text-right">ยอดรวม</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const sc = statusConfig[order.status];
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString('th-TH')}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex flex-col gap-1 text-sm">
                      {order.order_items.map((item) => (
                        <span key={item.id}>
                          {item.product?.name ?? 'สินค้า'} x{item.qty}
                          {item.sweetness && ` (หวาน ${item.sweetness}`}
                          {item.toppings?.length > 0 && `, ${item.toppings.map((t) => toppingNameMap[t] || t).join(', ')}`}
                          {item.sweetness && ')'}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">฿{Number(order.total)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-auto p-0">
                          <Badge className={sc.className}>
                            {sc.label}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(Object.keys(statusConfig) as Status[]).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => handleStatusChange(order.id, s)}>
                            {statusConfig[s].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Orders;
