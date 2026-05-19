import { Outlet, Navigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { Bike, ClipboardList } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';

const RiderLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { isRider, loading } = useRole();

  if (authLoading || loading) return <div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isRider) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Bike className="h-5 w-5" />
            <span>โหมดไรเดอร์</span>
          </div>
          <NavLink to="/rider" end className="text-sm" activeClassName="text-primary font-semibold">
            <span className="inline-flex items-center gap-1"><ClipboardList className="h-4 w-4" /> งานจัดส่ง</span>
          </NavLink>
        </div>
      </header>
      <main className="container py-6"><Outlet /></main>
    </div>
  );
};

export default RiderLayout;
