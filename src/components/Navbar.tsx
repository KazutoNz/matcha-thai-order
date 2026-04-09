import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cat, Menu, ShoppingCart } from 'lucide-react';
import { useCartStore, onCartAdd } from '@/lib/cart-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_LINKS: { href: string; label: string }[] = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/menu', label: 'เมนู' },
  { href: '/tracking', label: 'ติดตามออเดอร์' },
];

const navLinkBase =
  'text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm';

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
  const location = useLocation();
  const navigate = useNavigate();
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
      <div className="container flex h-16 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 md:gap-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 font-display text-lg font-bold text-primary sm:text-xl md:text-2xl"
          >
            <Cat className="h-6 w-6 shrink-0 sm:h-7 sm:w-7 md:h-8 md:w-8" aria-hidden />
            MatchaMew
          </Link>
          <nav className="hidden min-w-0 items-center gap-2 md:gap-4 lg:gap-5 sm:flex" aria-label="เมนูหลัก">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className={cn(navLinkBase, location.pathname === href && 'text-primary font-semibold')}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden" aria-label="เปิดเมนู">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader className="text-left">
                <SheetTitle>เมนู</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4" aria-label="เมนูมือถือ">
                {NAV_LINKS.map(({ href, label }) => (
                  <SheetClose asChild key={href}>
                    <Link to={href} className={cn(navLinkBase, 'block py-2 text-base')}>
                      {label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
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
      </div>
    </header>
  );
};

export default Navbar;
