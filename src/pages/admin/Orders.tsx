import { useState } from 'react';
import { useCartStore, type Order } from '@/lib/cart-store';
import { toppings } from '@/lib/products';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const statusConfig: Record<Order['status'], { label: string; className: string }> = {
  pending: { label: 'รอดำเนินการ', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  preparing: { label: 'กำลังเตรียม', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  completed: { label: 'จัดส่งแล้ว', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
};

const Orders = () => {
  const orders = useCartStore((s) => s.orders);
  const updateOrderStatus = useCartStore((s) => s.updateOrderStatus);
  const [, forceUpdate] = useState(0);

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    forceUpdate((n) => n + 1);
  };

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
              <TableHead>ชื่อลูกค้า</TableHead>
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
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex flex-col gap-1 text-sm">
                      {order.items.map((item) => (
                        <span key={item.id}>
                          {item.name} x{item.quantity} (หวาน {item.sweetness}
                          {item.toppings.length > 0 && `, ${item.toppings.map((t) => toppingNameMap[t] || t).join(', ')}`})
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">฿{order.total}</TableCell>
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
                        {(Object.keys(statusConfig) as Order['status'][]).map((s) => (
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
