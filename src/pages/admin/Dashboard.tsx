import { useCartStore } from '@/lib/cart-store';

const Dashboard = () => {
  const orders = useCartStore((s) => s.orders);
  const pending = orders.filter((o) => o.status === 'pending').length;
  const preparing = orders.filter((o) => o.status === 'preparing').length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'ออเดอร์ทั้งหมด', value: orders.length },
    { label: 'รอดำเนินการ', value: pending, color: 'text-yellow-600' },
    { label: 'กำลังเตรียม', value: preparing, color: 'text-blue-600' },
    { label: 'จัดส่งแล้ว', value: completed, color: 'text-green-600' },
    { label: 'รายได้รวม', value: `฿${totalRevenue}` },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold">ภาพรวม</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
