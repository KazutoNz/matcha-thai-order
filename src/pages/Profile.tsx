import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, IdCard, Sparkles, User, MapPin, Phone, Pencil, Camera, Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Profile = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [defaultAddress, setDefaultAddress] = useState('');
  const [defaultPhone, setDefaultPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setBirthday(profile.birthday ? new Date(profile.birthday) : undefined);
      setDefaultAddress(profile.default_address ?? '');
      setDefaultPhone(profile.default_phone ?? '');
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile, open]);

  if (loading) return <div className="container py-20 text-center text-muted-foreground">กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const initial = (profile?.full_name || user.email || '?').charAt(0).toUpperCase();
  const joined = profile ? new Date(profile.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
  const bdayDisplay = profile?.birthday ? new Date(profile.birthday).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success('อัปโหลดรูปสำเร็จ');
    } catch (err: any) {
      toast.error(err.message ?? 'อัปโหลดล้มเหลว');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        birthday: birthday ? format(birthday, 'yyyy-MM-dd') : null,
        default_address: defaultAddress.trim() || null,
        default_phone: defaultPhone.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('บันทึกสำเร็จ');
    await refreshProfile();
    setOpen(false);
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card className="overflow-hidden border-border/70 shadow-lg">
        <div className="relative bg-card p-8 border-b">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">{initial}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-2xl font-bold">{profile?.full_name || 'สมาชิก'}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-2 gap-1">
                  <Sparkles className="h-3 w-3" /> {profile?.reward_points ?? 0} คะแนน
                </Badge>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
                  <Pencil className="h-4 w-4" /> แก้ไขโปรไฟล์
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {avatarUrl && <AvatarImage src={avatarUrl} />}
                      <AvatarFallback className="bg-primary/10 text-primary">{initial}</AvatarFallback>
                    </Avatar>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        เปลี่ยนรูป
                      </div>
                      <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>ชื่อผู้ใช้</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ชื่อของคุณ" />
                  </div>

                  <div className="space-y-2">
                    <Label>วันเกิด</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !birthday && 'text-muted-foreground')}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {birthday ? format(birthday, 'PPP') : 'เลือกวันเกิด'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={birthday}
                          onSelect={setBirthday}
                          captionLayout="dropdown-buttons"
                          fromYear={1940}
                          toYear={new Date().getFullYear()}
                          disabled={(d) => d > new Date()}
                          initialFocus
                          className={cn('p-3 pointer-events-auto')}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>เบอร์โทรเริ่มต้น</Label>
                    <Input value={defaultPhone} onChange={(e) => setDefaultPhone(e.target.value)} placeholder="0XX-XXX-XXXX" />
                  </div>

                  <div className="space-y-2">
                    <Label>ที่อยู่จัดส่งเริ่มต้น</Label>
                    <Textarea value={defaultAddress} onChange={(e) => setDefaultAddress(e.target.value)} placeholder="บ้านเลขที่ ซอย ถนน แขวง เขต จังหวัด รหัสไปรษณีย์" rows={3} />
                    <p className="text-xs text-muted-foreground">ที่อยู่นี้จะถูกใช้เป็นค่าเริ่มต้นในหน้าชำระเงิน</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>ยกเลิก</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    บันทึก
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CardContent className="grid gap-4 p-8 sm:grid-cols-2">
          <InfoRow icon={User} label="ชื่อ" value={profile?.full_name || '-'} />
          <InfoRow icon={IdCard} label="รหัสสมาชิก" value={profile?.customer_code || '-'} mono />
          <InfoRow icon={CalendarDays} label="วันที่สมัคร" value={joined} />
          <InfoRow icon={Sparkles} label="แต้มสะสม" value={`${profile?.reward_points ?? 0} แต้ม`} highlight />
          <InfoRow icon={CalendarIcon} label="วันเกิด" value={bdayDisplay} />
          <InfoRow icon={Phone} label="เบอร์โทร" value={profile?.default_phone || '-'} />
          <div className="sm:col-span-2">
            <InfoRow icon={MapPin} label="ที่อยู่จัดส่งเริ่มต้น" value={profile?.default_address || 'ยังไม่ได้ตั้งค่า'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, mono, highlight }: { icon: any; label: string; value: string; mono?: boolean; highlight?: boolean }) => (
  <div className="flex items-start gap-3 rounded-xl border bg-card/50 p-4">
    <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold break-words ${mono ? 'font-mono tracking-wider' : ''} ${highlight ? 'text-primary' : ''}`}>{value}</p>
    </div>
  </div>
);

export default Profile;
