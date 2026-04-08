import { useState } from 'react';
import { Product, sweetnessOptions, toppings, TOPPING_PRICE } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, open, onClose }: ProductModalProps) => {
  const [sweetness, setSweetness] = useState('100%');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  const toppingsCost = selectedToppings.length * TOPPING_PRICE;
  const unitPrice = product.price + toppingsCost;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      sweetness,
      toppings: selectedToppings,
      quantity,
      totalPrice,
    });
    toast.success('เพิ่มลงตะกร้าแล้ว!');
    setSweetness('100%');
    setSelectedToppings([]);
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <p className="text-lg font-bold text-primary">฿{product.price}</p>

        {/* Sweetness */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-semibold">ระดับความหวาน</Label>
            <p className="mt-1 text-xs text-muted-foreground">ปรับปริมาณน้ำเชื่อมตามรสที่ชอบ</p>
          </div>
          <RadioGroup
            value={sweetness}
            onValueChange={setSweetness}
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {sweetnessOptions.map((opt) => {
              const selected = sweetness === opt.value;
              const pct = parseInt(opt.value, 10);
              return (
                <Label
                  key={opt.value}
                  className={cn(
                    'relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all',
                    'hover:border-primary/35 hover:bg-muted/40',
                    selected
                      ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/25'
                      : 'border-border bg-card',
                  )}
                >
                  <RadioGroupItem value={opt.value} id={`sweet-${opt.value}`} className="sr-only" />
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-semibold leading-tight">{opt.label}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{opt.value}</span>
                  </div>
                  <p className="text-[11px] leading-snug text-muted-foreground">{opt.hint}</p>
                  <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-muted/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400/90 via-amber-300/95 to-amber-500 transition-[width] duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Toppings */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-semibold">เพิ่มท็อปปิ้ง (ทีละ ฿{TOPPING_PRICE})</Label>
            <p className="mt-1 text-xs text-muted-foreground">เลือกได้หลายอย่าง — แตะช่องเพื่อเลือก/ยกเลิก</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {toppings.map((t) => {
              const checked = selectedToppings.includes(t.id);
              return (
                <Label
                  key={t.id}
                  htmlFor={`top-${t.id}`}
                  className={cn(
                    'relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 p-2 text-center transition-all',
                    'hover:border-primary/40 hover:bg-muted/40',
                    checked
                      ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                      : 'border-border bg-card',
                  )}
                >
                  <Checkbox
                    id={`top-${t.id}`}
                    checked={checked}
                    onCheckedChange={() => toggleTopping(t.id)}
                    className="sr-only"
                  />
                  {checked && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                  <span className="text-sm font-medium leading-tight">{t.name}</span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">+฿{TOPPING_PRICE}</span>
                </Label>
              );
            })}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-4">
          <Label className="text-sm font-semibold">จำนวน</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button className="w-full text-base" size="lg" onClick={handleAdd}>
          เพิ่มลงตะกร้า — ฿{totalPrice}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
