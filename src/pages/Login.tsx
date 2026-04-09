import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    toast.success('เข้าสู่ระบบสำเร็จ (โหมดสาธิต — ยังไม่เชื่อมฐานข้อมูล)');
    navigate('/');
  };

  return (
    <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-10">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="font-display text-2xl">เข้าสู่ระบบ</CardTitle>
          <CardDescription>ใช้อีเมลและรหัสผ่านของคุณ — ระบบนี้เป็นตัวอย่างหน้าตาเท่านั้น</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">อีเมล</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">รหัสผ่าน</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <Button type="submit" className="w-full sm:w-auto">
              เข้าสู่ระบบ
            </Button>
            <p className="text-center text-sm text-muted-foreground sm:text-right">
              ยังไม่มีบัญชี?{' '}
              <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                สมัครสมาชิก
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
