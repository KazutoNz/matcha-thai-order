import { Link, useLocation } from 'react-router-dom';
import { Cat, Menu } from 'lucide-react';
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

const Navbar = () => {
  const location = useLocation();

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
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link to="/login">เข้าสู่ระบบ</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">สมัครสมาชิก</Link>
            </Button>
          </div>
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
              <div className="mt-8 flex flex-col gap-2 border-t pt-6">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">เข้าสู่ระบบ</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button className="w-full" asChild>
                    <Link to="/register">สมัครสมาชิก</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
