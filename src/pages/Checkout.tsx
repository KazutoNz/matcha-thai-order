import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/lib/cart-store';
import { toppings } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Banknote, QrCode, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const paymentMethods = [
  { value: 'cash', label: 'เงินสด', icon: Banknote },
  { value: 'card', label: 'บัตรเครดิต/เดบิต', icon: CreditCard },
  { value: 'promptpay', label: 'พร้อมเพย์', icon: QrCode },
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Checkout = () => {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('cash');
  const [busy, setBusy] = useState(false);

  if (!authLoading && !user) {
    toast.info('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
    return <Navigate to="/login" replace />;
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">ตะกร้าว่างเปล่า</p>
        <Button onClick={() => navigate('/menu')}>กลับไปดูเมนู</Button>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (!user) return;

    setBusy(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({ user_id: user.id, total: totalPrice, status: 'pending' })
        .select()
        .single();
      if (error || !order) throw error || new Error('ไม่สามารถสร้างออเดอร์ได้');

      const validItems = items.filter((i) => UUID_RE.test(String(i.productId)));
      if (validItems.length > 0) {
        const rows = validItems.map((i) => ({
          order_id: order.id,
          product_id: String(i.productId),
          qty: i.quantity,
          price: i.totalPrice,
        }));
        const { error: e2 } = await supabase.from('order_items').insert(rows);
        if (e2) console.error('order_items insert', e2);
      }

      clearCart();
      await refreshProfile();
      toast.success('สั่งซื้อสำเร็จ! ได้รับ 10 แต้มสะสม 🎉');
      navigate('/tracking');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">ชำระเงิน</h1>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">ข้อมูลการจัดส่ง</h2>
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ-นามสกุล" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0XX-XXX-XXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="บ้านเลขที่ ซอย ถนน แขวง เขต จังหวัด รหัสไปรษณีย์" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">วิธีการชำระเงิน</h2>
            <RadioGroup value={payment} onValueChange={setPayment} className="grid gap-3 sm:grid-cols-3">
              {paymentMethods.map((m) => {
                const selected = payment === m.value;
                return (
                  <Label
                    key={m.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all',
                      selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    )}
                  >
                    <RadioGroupItem value={m.value} className="sr-only" />
                    <m.icon className={cn('h-5 w-5', selected ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', selected && 'text-primary')}>{m.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6 lg:sticky lg:top-20 space-y-4">
            <h2 className="text-lg font-semibold">สรุปคำสั่งซื้อ</h2>
            <div className="max-h-[40vh] space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col gap-0.5 text-sm">
                    <span className="font-semibold">{item.name} x{item.quantity}</span>
                    <span className="text-muted-foreground">
                      หวาน {item.sweetness}
                      {item.toppings.length > 0 && ` • ${item.toppings.map((t) => toppingNameMap[t] || t).join(', ')}`}
                    </span>
                    <span className="font-bold text-primary">฿{item.totalPrice}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>ยอดรวม</span>
              <span className="text-primary">฿{totalPrice}</span>
            </div>
            <Button size="lg" className="w-full" onClick={handleConfirm} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ยืนยันคำสั่งซื้อ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
