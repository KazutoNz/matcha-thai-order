import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Pencil, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { AppRole } from '@/hooks/useRole';

interface UserRow {
  id: string;
  full_name: string | null;
  customer_code: string;
  reward_points: number;
  created_at: string;
  roles: AppRole[];
}

const ALL_ROLES: AppRole[] = ['admin', 'manager', 'rider', 'user'];

const ROLE_LABEL: Record<AppRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  rider: 'Rider',
  user: 'User',
};

const ROLE_BADGE: Record<AppRole, string> = {
  admin: 'bg-rose-500/15 text-rose-600 border-rose-300',
  manager: 'bg-amber-500/15 text-amber-700 border-amber-300',
  rider: 'bg-sky-500/15 text-sky-600 border-sky-300',
  user: 'bg-muted text-muted-foreground border-border',
};

const Users = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AppRole>('all');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState('0');
  const [editRoles, setEditRoles] = useState<Set<AppRole>>(new Set());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, customer_code, reward_points, created_at').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    if (e1) toast.error(e1.message);
    if (e2) toast.error(e2.message);
    const rolesByUser = new Map<string, AppRole[]>();
    (roles ?? []).forEach((r: any) => {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push(r.role);
      rolesByUser.set(r.user_id, list);
    });
    setUsers(((profiles as any[]) ?? []).map((p) => ({
      ...p,
      roles: rolesByUser.get(p.id) ?? ['user'],
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && !u.roles.includes(roleFilter)) return false;
      if (!q) return true;
      return (
        (u.full_name ?? '').toLowerCase().includes(q) ||
        u.customer_code.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setEditName(u.full_name ?? '');
    setEditPoints(String(u.reward_points));
    setEditRoles(new Set(u.roles));
    setOpen(true);
  };

  const toggleRole = (r: AppRole) => {
    setEditRoles((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { error: profErr } = await supabase
        .from('profiles')
        .update({ full_name: editName.trim() || null, reward_points: Number(editPoints) || 0 })
        .eq('id', editing.id);
      if (profErr) throw profErr;

      const current = new Set(editing.roles);
      const next = editRoles;
      const toAdd = [...next].filter((r) => !current.has(r));
      const toRemove = [...current].filter((r) => !next.has(r));

      if (toRemove.length) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', editing.id)
          .in('role', toRemove as any);
        if (error) throw error;
      }
      if (toAdd.length) {
        const { error } = await supabase
          .from('user_roles')
          .insert(toAdd.map((role) => ({ user_id: editing.id, role: role as any })));
        if (error) throw error;
      }
      toast.success('บันทึกผู้ใช้แล้ว');
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message ?? 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">จัดการผู้ใช้งาน</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ชื่อ / รหัส / ID"
              className="w-64 pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุก Role</SelectItem>
              {ALL_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>รหัสลูกค้า</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">แต้มสะสม</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="inline h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">ไม่พบผู้ใช้</TableCell></TableRow>
            ) : filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-medium">{u.full_name || '—'}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{u.id.slice(0, 8)}</div>
                </TableCell>
                <TableCell className="font-mono text-xs">{u.customer_code}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <Badge key={r} variant="outline" className={ROLE_BADGE[r]}>{ROLE_LABEL[r]}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">{u.reward_points}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขผู้ใช้</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อ-นามสกุล</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>แต้มสะสม</Label>
              <Input type="number" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_ROLES.map((r) => (
                  <Label key={r} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-muted/40">
                    <Checkbox checked={editRoles.has(r)} onCheckedChange={() => toggleRole(r)} />
                    <span className="text-sm">{ROLE_LABEL[r]}</span>
                  </Label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
