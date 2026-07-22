import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Beta namespace not in generated types yet.
type OAuthClient = { supabase: { auth: { oauth: any } } };
const oauth = () => (supabase as unknown as OAuthClient["supabase"]).auth.oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("ไม่พบรหัสคำขออนุญาต (authorization_id)");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) return setError(error.message);
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        setError(e?.message ?? "โหลดคำขออนุญาตไม่สำเร็จ");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth().approveAuthorization(authorizationId)
        : await oauth().denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        return setError(error.message);
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        return setError("ไม่ได้รับ redirect URL จากระบบยืนยันสิทธิ์");
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "ดำเนินการไม่สำเร็จ");
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {details?.client?.name ? `เชื่อมต่อ ${details.client.name}` : "อนุญาตการเชื่อมต่อ"}
          </CardTitle>
          <CardDescription>
            {details?.client?.name
              ? `${details.client.name} จะสามารถใช้เครื่องมือของ MatchaMew ในนามของคุณได้`
              : "ยืนยันการเข้าถึงบัญชี MatchaMew ของคุณ"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {!error && !details && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
            </div>
          )}
          {details && (
            <>
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium">สิทธิ์ที่ร้องขอ</p>
                <p className="mt-1 text-muted-foreground">
                  เรียกใช้เครื่องมือของ MatchaMew ในฐานะผู้ใช้งานของคุณ (ดูเมนู, ประวัติออเดอร์, โปรไฟล์)
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  การอนุญาตนี้ไม่ได้ข้ามสิทธิ์การเข้าถึงข้อมูลของแอปหรือกฎความปลอดภัยฝั่งเซิร์ฟเวอร์
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} อนุญาต
                </Button>
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
                  ปฏิเสธ
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
