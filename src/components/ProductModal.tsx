import { useState } from 'react';
import { Product, sweetnessLevels, toppings, TOPPING_PRICE } from '@/lib/products';
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
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

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
        <div className="space-y-2">
          <Label className="text-sm font-semibold">ระดับความหวาน</Label>
          <RadioGroup value={sweetness} onValueChange={setSweetness} className="flex gap-3">
            {sweetnessLevels.map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <RadioGroupItem value={level} id={`sweet-${level}`} />
                <Label htmlFor={`sweet-${level}`} className="text-sm cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Toppings */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">ท็อปปิ้ง (+฿{TOPPING_PRICE}/อย่าง)</Label>
          <div className="flex flex-col gap-2">
            {toppings.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <Checkbox
                  id={`top-${t.id}`}
                  checked={selectedToppings.includes(t.id)}
                  onCheckedChange={() => toggleTopping(t.id)}
                />
                <Label htmlFor={`top-${t.id}`} className="cursor-pointer text-sm">
                  {t.name}
                </Label>
              </div>
            ))}
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
