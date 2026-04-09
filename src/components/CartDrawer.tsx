import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/lib/cart-store';
import { toppings } from '@/lib/products';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import UpsellPopup from '@/components/UpsellPopup';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>ตะกร้าสินค้า</SheetTitle>
        </SheetHeader>

        <UpsellPopup cartOpen={open} />

        <div className="flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">ตะกร้าว่างเปล่า</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-lg border p-3 animate-slide-up">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
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
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>ยอดรวม</span>
              <span className="text-primary">฿{totalPrice}</span>
            </div>
            <Button size="lg" className="w-full" onClick={handleCheckout}>
              ดำเนินการชำระเงิน
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
