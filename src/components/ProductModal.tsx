import { useEffect, useMemo, useState } from 'react';
import { Product, sweetnessOptions, toppings, TOPPING_PRICE, DEFAULT_SWEETNESS, Variation } from '@/lib/products';
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
import { Check, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, open, onClose }: ProductModalProps) => {
  const [sweetness, setSweetness] = useState(DEFAULT_SWEETNESS);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [variationIdx, setVariationIdx] = useState<number>(-1); // -1 = standard
  const [quantity, setQuantity] = useState(1);
  const [imageIdx, setImageIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  const gallery = useMemo(() => {
    if (!product) return [] as string[];
    const arr = [product.image, ...(product.images ?? [])].filter(Boolean);
    return Array.from(new Set(arr));
  }, [product]);

  // Reset state every time modal opens or product changes
  useEffect(() => {
    if (open && product) {
      setSweetness(DEFAULT_SWEETNESS);
      setSelectedToppings([]);
      setVariationIdx(-1);
      setQuantity(1);
      setImageIdx(0);
    }
  }, [open, product?.id]);

  if (!product) return null;

  const variations: Variation[] = product.variations ?? [];
  const chosenVariation = variationIdx >= 0 ? variations[variationIdx] : undefined;
  const toppingsCost = selectedToppings.length * TOPPING_PRICE;
  const variationDelta = chosenVariation?.price_delta ?? 0;
  const unitPrice = product.price + variationDelta + toppingsCost;
  const totalPrice = unitPrice * quantity;

  const displayImage = chosenVariation?.image_url || gallery[imageIdx] || product.image;

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: chosenVariation ? `${product.name} (${chosenVariation.label})` : product.name,
      image: displayImage,
      basePrice: product.price + variationDelta,
      sweetness,
      toppings: selectedToppings,
      variation: chosenVariation?.label,
      quantity,
      totalPrice,
    });
    toast.success('เพิ่มลงตะกร้าแล้ว!');
    onClose();
  };

  const scrollAreaClass =
    'min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-matcha-light/90 px-4 py-4 sm:px-5 ' +
    '[scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.35)_transparent] ' +
    '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent ' +
    '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/30 hover:[&::-webkit-scrollbar-thumb]:bg-primary/45';

  const showCarousel = gallery.length > 1 && !chosenVariation?.image_url;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          'flex max-h-[92vh] w-[calc(100vw-1.25rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md',
          'rounded-2xl border border-border/70 bg-background shadow-2xl',
        )}
      >
        <div className="relative shrink-0 border-b border-border/60 bg-background/95 px-5 pb-3 pt-6 pr-12 backdrop-blur-sm">
          <DialogHeader className="space-y-0 text-left">
            <DialogTitle className="font-display text-xl leading-snug tracking-tight sm:text-2xl">
              {product.name}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="relative shrink-0 border-b border-border/50 bg-muted/40 px-4 py-3">
          <div className="relative mx-auto w-full max-w-[9rem] sm:max-w-[10.5rem]">
            <img
              src={displayImage}
              alt={product.name}
              className="aspect-square w-full rounded-xl object-cover shadow-sm ring-1 ring-border/50 sm:rounded-2xl"
            />
            {showCarousel && (
              <>
                <button
                  type="button"
                  aria-label="ก่อนหน้า"
                  onClick={() => setImageIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-1 shadow ring-1 ring-border/60 hover:bg-background"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="ถัดไป"
                  onClick={() => setImageIdx((i) => (i + 1) % gallery.length)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-1 shadow ring-1 ring-border/60 hover:bg-background"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {showCarousel && (
            <div className="mt-2 flex justify-center gap-1.5">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setImageIdx(i)}
                  aria-label={`รูปที่ ${i + 1}`}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-all',
                    i === imageIdx ? 'w-4 bg-primary' : 'bg-muted-foreground/40',
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-b border-border/40 bg-background px-5 py-3">
          <p className="text-lg font-bold tabular-nums text-primary sm:text-xl">฿{unitPrice}</p>
        </div>

        <div className={scrollAreaClass}>
          <div className="space-y-4">
            {/* Special Variations */}
            {variations.length > 0 && (
              <div className="space-y-2.5 rounded-xl border border-border/60 bg-card/90 p-3 shadow-sm sm:space-y-3 sm:p-4">
                <div>
                  <Label className="text-sm font-semibold sm:text-base">ตัวเลือกพิเศษ</Label>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                    เลือกแบบที่ต้องการ — บางแบบอาจมีค่าใช้จ่ายเพิ่ม
                  </p>
                </div>
                <RadioGroup
                  value={String(variationIdx)}
                  onValueChange={(v) => setVariationIdx(parseInt(v, 10))}
                  className="grid grid-cols-2 gap-2"
                >
                  {[{ label: 'มาตรฐาน', price_delta: 0 } as Variation, ...variations].map((v, i) => {
                    const idx = i - 1; // -1 = standard
                    const selected = variationIdx === idx;
                    const delta = v.price_delta ?? 0;
                    return (
                      <Label
                        key={`${v.label}-${i}`}
                        className={cn(
                          'relative flex cursor-pointer flex-col gap-1 rounded-lg border-2 p-2.5 transition-all',
                          'hover:border-primary/35 hover:bg-muted/40',
                          selected
                            ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/25'
                            : 'border-border bg-card',
                        )}
                      >
                        <RadioGroupItem value={String(idx)} className="sr-only" />
                        <span className="text-xs font-semibold leading-tight sm:text-sm">{v.label}</span>
                        <span className="text-[10px] tabular-nums text-muted-foreground sm:text-[11px]">
                          {delta === 0 ? 'ราคาเดิม' : delta > 0 ? `+฿${delta}` : `-฿${Math.abs(delta)}`}
                        </span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {/* Sweetness */}
            <div className="space-y-2.5 rounded-xl border border-border/60 bg-card/90 p-3 shadow-sm sm:space-y-3 sm:p-4">
              <div>
                <Label className="text-sm font-semibold sm:text-base">ระดับความหวาน</Label>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                  ปรับปริมาณน้ำเชื่อมตามรสที่ชอบ
                </p>
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
                        'relative flex min-h-0 cursor-pointer flex-col gap-1 rounded-lg border-2 p-2 text-left transition-all sm:gap-1.5 sm:rounded-xl sm:p-2.5',
                        'hover:border-primary/35 hover:bg-muted/40',
                        selected
                          ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/25'
                          : 'border-border bg-card',
                      )}
                    >
                      <RadioGroupItem value={opt.value} id={`sweet-${opt.value}`} className="sr-only" />
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-xs font-semibold leading-tight sm:text-sm">{opt.label}</span>
                        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                          {opt.value}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                        {opt.hint}
                      </p>
                      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/80 sm:h-2">
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
            <div className="space-y-2.5 rounded-xl border border-border/60 bg-card/90 p-3 shadow-sm sm:space-y-3 sm:p-4">
              <div>
                <Label className="text-sm font-semibold sm:text-base">เพิ่มท็อปปิ้ง (ทีละ ฿{TOPPING_PRICE})</Label>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                  เลือกได้หลายอย่าง — แตะช่องเพื่อเลือก/ยกเลิก
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {toppings.map((t) => {
                  const checked = selectedToppings.includes(t.id);
                  return (
                    <Label
                      key={t.id}
                      htmlFor={`top-${t.id}`}
                      className={cn(
                        'relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-1.5 py-2 text-center transition-all sm:gap-1 sm:p-2.5',
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
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm sm:right-1.5 sm:top-1.5 sm:h-5 sm:w-5">
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
                        </span>
                      )}
                      <span className="text-[11px] font-medium leading-snug sm:text-xs">{t.name}</span>
                      <span className="text-[10px] tabular-nums text-muted-foreground sm:text-[11px]">
                        +฿{TOPPING_PRICE}
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 space-y-3 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <Label className="shrink-0 text-sm font-semibold text-foreground">จำนวน</Label>
            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/40 p-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 border-0 bg-background shadow-sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2rem] text-center text-base font-semibold tabular-nums">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 border-0 bg-background shadow-sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button className="w-full text-base font-semibold shadow-md" size="lg" onClick={handleAdd}>
            เพิ่มลงตะกร้า — ฿{totalPrice}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
