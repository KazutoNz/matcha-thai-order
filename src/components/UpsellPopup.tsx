import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { toppings, TOPPING_PRICE } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const toppingNameMap: Record<string, string> = {};
toppings.forEach((t) => (toppingNameMap[t.id] = t.name));

interface UpsellPopupProps {
  cartOpen: boolean;
}

const UpsellPopup = ({ cartOpen }: UpsellPopupProps) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useIsMobile();
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    if (cartOpen && isMobile && items.length > 0 && !dismissed) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [cartOpen, isMobile, items.length, dismissed]);

  if (!visible) return null;

  const handleAddGoldenBoba = () => {
    addItem({
      productId: 999,
      name: '🌟 Golden Boba พิเศษ',
      image: items[0]?.image || '',
      basePrice: 35,
      sweetness: '50%',
      toppings: ['golden-boba'],
      quantity: 1,
      totalPrice: 35,
    });
    toast.success('เพิ่ม Golden Boba แล้ว!');
    setVisible(false);
    setDismissed(true);
  };

  return (
    <div className="animate-slide-up mx-2 mb-3 rounded-xl border bg-gradient-to-r from-yellow-50 to-amber-50 p-3 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">💡 อย่าพลาด!</p>
          <p className="text-xs text-amber-700">เพิ่ม Golden Boba พิเศษ เพียง ฿35</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => { setVisible(false); setDismissed(true); }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Button
        size="sm"
        className="mt-2 w-full bg-amber-500 text-amber-50 hover:bg-amber-600"
        onClick={handleAddGoldenBoba}
      >
        สั่งซื้อ — ฿35
      </Button>
    </div>
  );
};

export default UpsellPopup;
