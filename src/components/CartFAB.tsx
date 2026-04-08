import { useEffect, useCallback, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore, onCartAdd } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';

interface CartFABProps {
  onClick: () => void;
}

const CartFAB = ({ onClick }: CartFABProps) => {
  const totalItems = useCartStore((s) => s.totalItems());
  const [pop, setPop] = useState(false);

  const triggerPop = useCallback(() => {
    setPop(true);
    setTimeout(() => setPop(false), 400);
  }, []);

  useEffect(() => {
    return onCartAdd(triggerPop);
  }, [triggerPop]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Pulsing ring when items exist */}
      {totalItems > 0 && (
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
      )}
      <Button
        size="icon"
        className={`relative h-14 w-14 rounded-full shadow-lg transition-transform ${pop ? 'scale-110' : 'scale-100'}`}
        onClick={onClick}
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
            {totalItems}
          </span>
        )}
      </Button>
    </div>
  );
};

export default CartFAB;
