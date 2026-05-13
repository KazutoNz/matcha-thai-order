import { useOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { orders, loading } = useOrders({ all: true });

  const pending = orders.filter((o) => o.status === 'pending').length;
  const preparing = orders.filter((o) => o.status === 'preparing').length;
  const ready = orders.filter((o) => o.status === 'ready').length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);

  const stats = [
    { label: 'ออเดอร์ทั้งหมด', value: orders.length },
    { label: 'รอดำเนินการ', value: pending, color: 'text-yellow-600' },
    { label: 'กำลังเตรียม', value: preparing, color: 'text-blue-600' },
    { label: 'พร้อมส่ง', value: ready, color: 'text-purple-600' },
    { label: 'เสร็จสิ้น', value: completed, color: 'text-green-600' },
    { label: 'รายได้รวม', value: `฿${totalRevenue.toLocaleString()}` },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold">ภาพรวม</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color || ''}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
