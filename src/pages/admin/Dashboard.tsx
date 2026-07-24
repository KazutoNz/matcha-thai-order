import { useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_LABEL } from '@/lib/order-status';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { Package, CheckCircle2, ChefHat, Truck, PackageCheck, Clock, ShoppingBag, Wallet } from 'lucide-react';

const fmtTHB = (n: number) => `฿${n.toLocaleString('th-TH')}`;


const Dashboard = () => {
  const { orders, loading } = useOrders({ all: true });

  const stats = useMemo(() => {
    const count = (s: string) => orders.filter((o) => o.status === s).length;
    return {
      total: orders.length,
      pending: count('pending'),
      confirmed: count('confirmed'),
      preparing: count('preparing'),
      ready: count('ready'),
      out_for_delivery: count('out_for_delivery'),
      delivered: count('delivered') + count('completed'),
      revenue: orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((s, o) => s + Number(o.total), 0),
    };
  }, [orders]);

  // last 7 days revenue
  const dailyData = useMemo(() => {
    const days: { date: string; label: string; revenue: number; orders: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        revenue: 0,
        orders: 0,
      });
    }
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      const day = days.find((d) => d.date === key);
      if (day) { day.revenue += Number(o.total); day.orders += 1; }
    });
    return days;
  }, [orders]);

  // top menus
  const topMenus = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      o.order_items.forEach((it) => {
        const name = it.product?.name ?? 'สินค้า';
        const cur = map.get(name) ?? { name, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += Number(it.price);
        map.set(name, cur);
      });
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const cards = [
    { label: 'ออเดอร์ทั้งหมด', value: stats.total, icon: Package, color: 'text-foreground' },
    { label: STATUS_LABEL.confirmed, value: stats.confirmed, color: 'text-cyan-600', icon: CheckCircle2 },
    { label: STATUS_LABEL.preparing, value: stats.preparing, color: 'text-blue-600', icon: ChefHat },
    { label: STATUS_LABEL.out_for_delivery, value: stats.out_for_delivery, color: 'text-orange-600', icon: Truck },
    { label: STATUS_LABEL.delivered, value: stats.delivered, color: 'text-emerald-600', icon: PackageCheck },
    { label: STATUS_LABEL.pending, value: stats.pending, color: 'text-yellow-600', icon: Clock },
    { label: STATUS_LABEL.ready, value: stats.ready, color: 'text-purple-600', icon: ShoppingBag },
    { label: 'รายได้รวม', value: fmtTHB(stats.revenue), color: 'text-primary', icon: Wallet },
  ];

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  const cards = [
    { label: 'ออเดอร์ทั้งหมด', value: stats.total },
    { label: STATUS_LABEL.confirmed, value: stats.confirmed, color: 'text-cyan-600' },
    { label: STATUS_LABEL.preparing, value: stats.preparing, color: 'text-blue-600' },
    { label: STATUS_LABEL.out_for_delivery, value: stats.out_for_delivery, color: 'text-orange-600' },
    { label: STATUS_LABEL.delivered, value: stats.delivered, color: 'text-emerald-600' },
    { label: STATUS_LABEL.pending, value: stats.pending, color: 'text-yellow-600' },
    { label: STATUS_LABEL.ready, value: stats.ready, color: 'text-purple-600' },
    { label: 'รายได้รวม', value: fmtTHB(stats.revenue), color: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-xl font-bold">ภาพรวม</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((s) => (
            <div key={s.label} className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.color || 'text-muted-foreground'} opacity-70`} />
              </div>
              <p className={`text-2xl font-bold ${s.color || ''}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">ยอดขาย 7 วันล่าสุด</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                formatter={(v: any, n: any) => n === 'revenue' ? [fmtTHB(Number(v)), 'รายได้'] : [v, 'จำนวนออเดอร์']}
              />
              <Legend formatter={(v) => v === 'revenue' ? 'รายได้' : 'จำนวนออเดอร์'} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} />
              <Line type="monotone" dataKey="orders" stroke="hsl(var(--accent-foreground))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">เมนูยอดนิยม (Top 5)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topMenus}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                formatter={(v: any) => [v, 'จำนวน']}
              />
              <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">สรุปยอดขายรายวัน</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 text-left">วันที่</th>
                <th className="py-2 text-right">จำนวนออเดอร์</th>
                <th className="py-2 text-right">รายได้</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((d) => (
                <tr key={d.date} className="border-b last:border-0">
                  <td className="py-2">{d.label}</td>
                  <td className="py-2 text-right">{d.orders}</td>
                  <td className="py-2 text-right font-semibold text-primary">{fmtTHB(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
