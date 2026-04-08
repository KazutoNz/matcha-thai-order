import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="font-display text-2xl font-bold text-primary">
          MatchaWeb
        </a>
        <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
