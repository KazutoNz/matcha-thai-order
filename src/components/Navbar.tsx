import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cat, LogOut, Menu, Sparkles, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const NAV_LINKS: { href: string; label: string }[] = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/menu', label: 'เมนู' },
  { href: '/tracking', label: 'ติดตามออเดอร์' },
];

const navLinkBase =
  'text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const initial = (profile?.full_name || user?.email || '?').charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 md:gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-bold text-primary sm:text-xl md:text-2xl">
            <Cat className="h-6 w-6 shrink-0 sm:h-7 sm:w-7 md:h-8 md:w-8" aria-hidden />
            MatchaMew
          </Link>
          <nav className="hidden min-w-0 items-center gap-2 md:gap-4 lg:gap-5 sm:flex" aria-label="เมนูหลัก">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} to={href} className={cn(navLinkBase, location.pathname === href && 'text-primary font-semibold')}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeSwitcher />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 gap-2 px-2 sm:px-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initial}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
                    {profile?.full_name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="space-y-1">
                  <p className="text-sm font-semibold">{profile?.full_name || 'สมาชิก'}</p>
                  <p className="text-xs font-normal text-muted-foreground">{profile?.customer_code}</p>
                  <p className="flex items-center gap-1 text-xs font-medium text-primary">
                    <Sparkles className="h-3 w-3" /> {profile?.reward_points ?? 0} แต้ม
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" /> โปรไฟล์
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/tracking')}>
                  ประวัติออเดอร์
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link to="/login">เข้าสู่ระบบ</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login">สมัครสมาชิก</Link>
              </Button>
            </div>
          )}

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
                    <Link to={href} className={cn(navLinkBase, 'block py-2 text-base')}>{label}</Link>
                  </SheetClose>
                ))}
              </nav>
              {!user && (
                <div className="mt-8 flex flex-col gap-2 border-t pt-6">
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login">เข้าสู่ระบบ / สมัครสมาชิก</Link>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
