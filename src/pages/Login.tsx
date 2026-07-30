import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const rawNext = params.get('next') ?? '';
  const nextPath = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/profile';
  const goNext = () => { window.location.href = nextPath; };

  if (!authLoading && user) return <Navigate to={nextPath} replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : error.message);
      return;
    }
    toast.success('เข้าสู่ระบบสำเร็จ');
    goNext();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร'); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${nextPath}`,
        data: { full_name: name.trim() || email.split('@')[0] },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes('already registered') ? 'อีเมลนี้สมัครไว้แล้ว' : error.message);
      return;
    }
    toast.success('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
    goNext();
  };

  const openForgot = () => {
    setForgotEmail(email);
    setForgotSent(false);
    setForgotOpen(true);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = forgotEmail.trim();
    if (!target) { toast.error('กรุณากรอกอีเมล'); return; }
    setForgotBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(target, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotBusy(false);
    if (error) { toast.error(error.message); return; }
    setForgotSent(true);
    toast.success('ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว');
  };

  return (
    <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-10">
      <Card className="w-full max-w-md border-border/70 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-display text-2xl">ยินดีต้อนรับสู่ MatchaMew</CardTitle>
          <CardDescription>สมาชิกได้รับ 10 แต้มสะสมทุกออเดอร์</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <Field id="si-email" label="อีเมล" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
                <PasswordField id="si-pw" label="รหัสผ่าน" value={password} onChange={setPassword} autoComplete="current-password" />
                <div className="text-right">
                  <button type="button" onClick={openForgot} className="text-sm text-primary underline-offset-4 hover:underline">
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} เข้าสู่ระบบ
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Field id="su-name" label="ชื่อ" value={name} onChange={setName} placeholder="ชื่อของคุณ" autoComplete="name" />
                <Field id="su-email" label="อีเมล" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
                <PasswordField id="su-pw" label="รหัสผ่าน (อย่างน้อย 6 ตัว)" value={password} onChange={setPassword} autoComplete="new-password" />
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} สมัครสมาชิก
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ลืมรหัสผ่าน</DialogTitle>
            <DialogDescription>
              กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
            </DialogDescription>
          </DialogHeader>
          {forgotSent ? (
            <div className="space-y-4 py-2 text-center">
              <MailCheck className="mx-auto h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">
                ส่งลิงก์ไปที่ <span className="font-medium text-foreground">{forgotEmail}</span> แล้ว
                กรุณาตรวจสอบกล่องจดหมาย (รวมถึงอีเมลขยะ)
              </p>
              <Button className="w-full" onClick={() => setForgotOpen(false)}>ปิด</Button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <Field id="fp-email" label="อีเมล" type="email" value={forgotEmail} onChange={setForgotEmail} placeholder="you@example.com" autoComplete="email" />
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={forgotBusy}>
                  {forgotBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} ส่งลิงก์รีเซ็ตรหัสผ่าน
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ id, label, value, onChange, type = 'text', ...rest }: any) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  </div>
);

const PasswordField = ({ id, label, value, onChange, ...rest }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="pr-10"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default Login;
