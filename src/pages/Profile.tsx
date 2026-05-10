import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, IdCard, Sparkles, User } from 'lucide-react';

const Profile = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="container py-20 text-center text-muted-foreground">กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const initial = (profile?.full_name || user.email || '?').charAt(0).toUpperCase();
  const joined = profile ? new Date(profile.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

  return (
    <div className="container max-w-3xl py-10">
      <Card className="overflow-hidden border-border/70 shadow-lg">
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-8">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">{initial}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-2xl font-bold">{profile?.full_name || 'สมาชิก'}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-2 gap-1">
                <Sparkles className="h-3 w-3" /> {profile?.reward_points ?? 0} คะแนน
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-4 p-8 sm:grid-cols-2">
          <InfoRow icon={User} label="ชื่อ" value={profile?.full_name || '-'} />
          <InfoRow icon={IdCard} label="รหัสสมาชิก" value={profile?.customer_code || '-'} mono />
          <InfoRow icon={CalendarDays} label="วันที่สมัคร" value={joined} />
          <InfoRow icon={Sparkles} label="แต้มสะสม" value={`${profile?.reward_points ?? 0} แต้ม`} highlight />
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
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold ${mono ? 'font-mono tracking-wider' : ''} ${highlight ? 'text-primary' : ''}`}>{value}</p>
    </div>
  </div>
);

export default Profile;
