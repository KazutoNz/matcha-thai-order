import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DbProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: 'drink' | 'dessert';
  order_count: number;
}

const Products = () => {
  const [items, setItems] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'drink' | 'dessert'>('drink');
  const [imageUrl, setImageUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as DbProduct[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!name.trim()) { toast.error('กรุณากรอกชื่อสินค้าก่อน'); return; }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-image', { body: { name } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setImageUrl((data as any).image_url);
      toast.success('สร้างรูปสำเร็จ');
    } catch (e: any) {
      toast.error(e.message ?? 'สร้างรูปไม่สำเร็จ');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price) { toast.error('กรุณากรอกข้อมูลให้ครบ'); return; }
    setSaving(true);
    const { error } = await supabase.from('products').insert({
      name: name.trim(),
      price: Number(price),
      category,
      image_url: imageUrl || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('เพิ่มสินค้าสำเร็จ');
    setName(''); setPrice(''); setImageUrl(''); setCategory('drink');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันลบสินค้านี้?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('ลบสำเร็จ');
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">จัดการสินค้า</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />เพิ่มสินค้าใหม่</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>ชื่อสินค้า</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น มัทฉะลาเต้" />
          </div>
          <div className="space-y-2">
            <Label>ราคา (บาท)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="75" />
          </div>
          <div className="space-y-2">
            <Label>หมวดหมู่</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as 'drink' | 'dessert')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="drink">เครื่องดื่ม</SelectItem>
                <SelectItem value="dessert">ของหวาน</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>รูปภาพ</Label>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL หรือกดสร้างรูป AI" />
              <Button type="button" variant="outline" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-1">AI</span>
              </Button>
            </div>
          </div>
          {imageUrl && (
            <div className="md:col-span-2">
              <img src={imageUrl} alt="preview" className="h-40 w-40 rounded-md object-cover border" />
            </div>
          )}
          <div className="md:col-span-2">
            <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              บันทึกสินค้า
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รูปภาพ</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead className="text-right">ราคา</TableHead>
              <TableHead className="text-right">ยอดขาย</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="inline h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">ยังไม่มีสินค้า</TableCell></TableRow>
            ) : items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{p.category === 'drink' ? 'เครื่องดื่ม' : 'ของหวาน'}</Badge>
                </TableCell>
                <TableCell className="text-right font-bold">฿{p.price}</TableCell>
                <TableCell className="text-right">{p.order_count}</TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Products;
