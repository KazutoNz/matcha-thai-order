import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    if (password.length < 6) {
      toast.error('รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirm) {
      toast.error('รหัสผ่านยืนยันไม่ตรงกัน');
      return;
    }
    toast.success('สมัครสมาชิกสำเร็จ (โหมดสาธิต — ยังไม่เชื่อมฐานข้อมูล)');
    navigate('/login');
  };

  return (
    <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-10">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="font-display text-2xl">สมัครสมาชิก</CardTitle>
          <CardDescription>สร้างบัญชีใหม่เพื่อรับข่าวสารและโปรโมชัน — หน้านี้เป็นตัวอย่าง UI เท่านั้น</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">ชื่อที่แสดง</Label>
              <Input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="ชื่อของคุณ"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">อีเมล</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">รหัสผ่าน</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">ยืนยันรหัสผ่าน</Label>
              <Input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <Button type="submit" className="w-full sm:w-auto">
              สมัครสมาชิก
            </Button>
            <p className="text-center text-sm text-muted-foreground sm:text-right">
              มีบัญชีแล้ว?{' '}
              <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
