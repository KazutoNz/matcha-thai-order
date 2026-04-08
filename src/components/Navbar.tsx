import { useEffect, useState, useCallback, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore, onCartAdd } from '@/lib/cart-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onCartClick: () => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

let particleCounter = 0;

const Navbar = ({ onCartClick }: NavbarProps) => {
  const totalItems = useCartStore((s) => s.totalItems());
  const [shaking, setShaking] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  const triggerAnimation = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);

    const particles: ConfettiParticle[] = Array.from({ length: 12 }, (_, i) => ({
      id: ++particleCounter,
      x: (Math.random() - 0.5) * 80,
      y: -(Math.random() * 60 + 20),
      delay: i * 0.05,
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 1400);
  }, []);

  useEffect(() => {
    return onCartAdd(triggerAnimation);
  }, [triggerAnimation]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="font-display text-2xl font-bold text-primary">
          MatchaWeb
        </a>
        <Button
          ref={cartBtnRef}
          variant="ghost"
          size="icon"
          className={`relative ${shaking ? 'animate-shake' : ''}`}
          onClick={onCartClick}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground">
              {totalItems}
            </Badge>
          )}

          {/* Confetti hearts */}
          {confetti.map((p) => (
            <span
              key={p.id}
              className="pointer-events-none absolute text-primary animate-confetti-fall"
              style={{
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
                animationDelay: `${p.delay}s`,
                fontSize: `${10 + Math.random() * 8}px`,
              }}
            >
              💚
            </span>
          ))}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
