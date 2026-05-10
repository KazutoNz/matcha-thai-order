import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  if (!authLoading && user) return <Navigate to="/profile" replace />;

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
    navigate('/');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร'); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name.trim() || email.split('@')[0] },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes('already registered') ? 'อีเมลนี้สมัครไว้แล้ว' : error.message);
      return;
    }
    toast.success('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
    navigate('/');
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
                <Field id="si-pw" label="รหัสผ่าน" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} เข้าสู่ระบบ
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Field id="su-name" label="ชื่อ" value={name} onChange={setName} placeholder="ชื่อของคุณ" autoComplete="name" />
                <Field id="su-email" label="อีเมล" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
                <Field id="su-pw" label="รหัสผ่าน (อย่างน้อย 6 ตัว)" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="new-password" />
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} สมัครสมาชิก
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const Field = ({ id, label, value, onChange, type = 'text', ...rest }: any) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  </div>
);

export default Login;
