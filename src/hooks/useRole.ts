import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AppRole = 'admin' | 'manager' | 'rider' | 'user';

export const useRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setRoles([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (cancelled) return;
      setRoles(((data ?? []).map((r: any) => r.role)) as AppRole[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const has = (r: AppRole) => roles.includes(r);
  const isAdmin = has('admin');
  const isManager = has('manager');
  const isRider = has('rider');
  const isStaff = isAdmin || isManager;

  return { roles, has, isAdmin, isManager, isRider, isStaff, loading };
};
