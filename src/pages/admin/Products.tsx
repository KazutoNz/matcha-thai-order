import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Sparkles, Plus, Trash2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';

interface Variant {
  label: string;
  image_url: string;
}

interface DbProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: 'drink' | 'dessert';
  order_count: number;
  variants: Variant[];
}

type EditState = {
  id?: string;
  name: string;
  price: string;
  category: 'drink' | 'dessert';
  image_url: string;
  variants: Variant[];
};

const emptyEdit = (): EditState => ({
  name: '', price: '', category: 'drink', image_url: '', variants: [],
});

const Products = () => {
  const [items, setItems] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<EditState>(emptyEdit());
  const [generating, setGenerating] = useState<number | 'main' | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setItems(((data as any[]) ?? []).map((p) => ({ ...p, variants: Array.isArray(p.variants) ? p.variants : [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEdit(emptyEdit()); setOpen(true); };
  const openEdit = (p: DbProduct) => {
    setEdit({
      id: p.id,
      name: p.name,
      price: String(p.price),
      category: p.category,
      image_url: p.image_url ?? '',
      variants: p.variants ?? [],
    });
    setOpen(true);
  };

  const handleGenerate = async (target: 'main' | number) => {
    const promptName = target === 'main'
      ? edit.name
      : `${edit.name} ${edit.variants[target]?.label ?? ''}`.trim();
    if (!promptName.trim()) { toast.error('กรุณากรอกชื่อก่อน'); return; }
    setGenerating(target);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-image', { body: { name: promptName } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const url = (data as any).image_url as string;
      if (target === 'main') setEdit((s) => ({ ...s, image_url: url }));
      else setEdit((s) => ({ ...s, variants: s.variants.map((v, i) => i === target ? { ...v, image_url: url } : v) }));
      toast.success('สร้างรูปสำเร็จ');
    } catch (e: any) {
      toast.error(e.message ?? 'สร้างรูปไม่สำเร็จ');
    } finally {
      setGenerating(null);
    }
  };

  const addVariant = () => setEdit((s) => ({ ...s, variants: [...s.variants, { label: '', image_url: '' }] }));
  const removeVariant = (i: number) => setEdit((s) => ({ ...s, variants: s.variants.filter((_, idx) => idx !== i) }));
  const updateVariant = (i: number, patch: Partial<Variant>) =>
    setEdit((s) => ({ ...s, variants: s.variants.map((v, idx) => idx === i ? { ...v, ...patch } : v) }));

  const handleSave = async () => {
    if (!edit.name.trim() || !edit.price) { toast.error('กรุณากรอกข้อมูลให้ครบ'); return; }
    setSaving(true);
    const payload = {
      name: edit.name.trim(),
      price: Number(edit.price),
      category: edit.category,
      image_url: edit.image_url || null,
      variants: edit.variants.filter((v) => v.label.trim() || v.image_url.trim()) as any,
    };
    const { error } = edit.id
      ? await supabase.from('products').update(payload).eq('id', edit.id)
      : await supabase.from('products').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(edit.id ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มสินค้าสำเร็จ');
    setOpen(false);
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">จัดการสินค้า</h2>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> เพิ่มสินค้า
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รูปภาพ</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ตัวเลือก</TableHead>
              <TableHead className="text-right">ราคา</TableHead>
              <TableHead className="text-right">ยอดขาย</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="inline h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">ยังไม่มีสินค้า</TableCell></TableRow>
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
                <TableCell>
                  {p.variants?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {p.variants.map((v, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{v.label || `แบบ ${i + 1}`}</Badge>
                      ))}
                    </div>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right font-bold">฿{p.price}</TableCell>
                <TableCell className="text-right">{p.order_count}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{edit.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ชื่อสินค้า</Label>
              <Input value={edit.name} onChange={(e) => setEdit((s) => ({ ...s, name: e.target.value }))} placeholder="เช่น มัทฉะลาเต้" />
            </div>
            <div className="space-y-2">
              <Label>ราคา (บาท)</Label>
              <Input type="number" value={edit.price} onChange={(e) => setEdit((s) => ({ ...s, price: e.target.value }))} placeholder="75" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>หมวดหมู่</Label>
              <Select value={edit.category} onValueChange={(v) => setEdit((s) => ({ ...s, category: v as 'drink' | 'dessert' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="drink">เครื่องดื่ม</SelectItem>
                  <SelectItem value="dessert">ของหวาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>รูปภาพหลัก</Label>
              <div className="flex gap-2">
                <Input value={edit.image_url} onChange={(e) => setEdit((s) => ({ ...s, image_url: e.target.value }))} placeholder="URL หรือกดสร้างรูป AI" />
                <Button type="button" variant="outline" onClick={() => handleGenerate('main')} disabled={generating === 'main'}>
                  {generating === 'main' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className="ml-1">AI</span>
                </Button>
              </div>
              {edit.image_url && (
                <img src={edit.image_url} alt="preview" className="h-32 w-32 rounded-md object-cover border" />
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">รูปตัวเลือกเพิ่มเติม</Label>
                <p className="text-xs text-muted-foreground">เช่น "แบบม้อล", "ปั่น", "ไซส์ใหญ่" — เพิ่มได้หลายรูป</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addVariant} className="rounded-full">
                <Plus className="mr-1 h-3 w-3" /> เพิ่มตัวเลือก
              </Button>
            </div>
            {edit.variants.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">ยังไม่มีตัวเลือก</p>
            ) : (
              <div className="space-y-3">
                {edit.variants.map((v, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border bg-muted/30 p-3">
                    {v.image_url ? (
                      <img src={v.image_url} alt={v.label} className="h-16 w-16 rounded-md object-cover border" />
                    ) : (
                      <div className="h-16 w-16 rounded-md border bg-muted" />
                    )}
                    <div className="flex-1 min-w-[10rem] space-y-1">
                      <Label className="text-xs">ชื่อแบบ</Label>
                      <Input value={v.label} onChange={(e) => updateVariant(i, { label: e.target.value })} placeholder="เช่น แบบม้อล" />
                    </div>
                    <div className="flex-1 min-w-[12rem] space-y-1">
                      <Label className="text-xs">URL รูป</Label>
                      <Input value={v.image_url} onChange={(e) => updateVariant(i, { image_url: e.target.value })} placeholder="URL" />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={() => handleGenerate(i)} disabled={generating === i}>
                      {generating === i ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {edit.id ? 'บันทึกการแก้ไข' : 'บันทึกสินค้า'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
