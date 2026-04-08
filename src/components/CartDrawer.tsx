import { useState } from 'react';
import { useCartStore, type Order } from '@/lib/cart-store';
import { toppings } from '@/lib/products';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const addOrder = useCartStore((s) => s.addOrder);
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleConfirmOrder = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customerName: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: [...items],
      total: totalPrice,
      status: 'pending',
      createdAt: new Date(),
    };
    addOrder(order);
    clearCart();
    setCheckout(false);
    setName('');
    setPhone('');
    setAddress('');
    onClose();
    toast.success('สั่งซื้อเรียบร้อยแล้ว!');
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { onClose(); setCheckout(false); } }}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{checkout ? 'ชำระเงิน' : 'ตะกร้าสินค้า'}</SheetTitle>
        </SheetHeader>

        {checkout ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
            <div className="space-y-2">
              <Label>ชื่อ</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ-นามสกุล" />
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทรศัพท์</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0XX-XXX-XXXX" />
            </div>
            <div className="space-y-2">
              <Label>ที่อยู่จัดส่ง</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ที่อยู่จัดส่ง" />
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>ยอดรวม</span>
              <span className="text-primary">฿{totalPrice}</span>
            </div>
            <Button size="lg" className="w-full" onClick={handleConfirmOrder}>
              ยืนยันคำสั่งซื้อ
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setCheckout(false)}>
              กลับ
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-2">
              {items.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">ตะกร้าว่างเปล่า</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div className="flex flex-1 flex-col gap-0.5 text-sm">
                        <span className="font-semibold">{item.name} x{item.quantity}</span>
                        <span className="text-muted-foreground">
                          หวาน {item.sweetness}
                          {item.toppings.length > 0 &&
                            ` • ${item.toppings.map((t) => toppingNameMap[t] || t).join(', ')}`}
                        </span>
                        <span className="font-bold text-primary">฿{item.totalPrice}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>ยอดรวม</span>
                  <span className="text-primary">฿{totalPrice}</span>
                </div>
                <Button size="lg" className="w-full" onClick={() => setCheckout(true)}>
                  ดำเนินการชำระเงิน
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
