import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { type Product } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { PublicOutletContext } from '@/layouts/PublicLayout';
import productLatte from '@/assets/product-latte.jpg';
import productFrappe from '@/assets/product-frappe.jpg';
import productCheesecake from '@/assets/product-cheesecake.jpg';
import productSoftserve from '@/assets/product-softserve.jpg';
import productMochi from '@/assets/product-mochi.jpg';
import productSmoothie from '@/assets/product-smoothie.jpg';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'drink', label: 'เครื่องดื่มมัทฉะ' },
  { id: 'dessert', label: 'ของหวาน' },
];

// Pick a fallback image when DB row has no image_url yet
const FALLBACKS = [productLatte, productFrappe, productCheesecake, productSoftserve, productMochi, productSmoothie];
const fallbackImage = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return FALLBACKS[h % FALLBACKS.length];
};

interface DbProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: 'drink' | 'dessert';
  order_count: number;
}

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [items, setItems] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { openProduct } = useOutletContext<PublicOutletContext>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, category, order_count')
        .order('order_count', { ascending: false });
      if (!cancelled) {
        if (error) console.error(error);
        setItems((data as DbProduct[] | null) ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Top 3 most ordered are "best sellers"
  const bestSellerIds = useMemo(() => {
    return new Set(
      [...items].sort((a, b) => b.order_count - a.order_count).slice(0, 3).map((p) => p.id)
    );
  }, [items]);

  const filtered = activeCategory === 'all' ? items : items.filter((p) => p.category === activeCategory);

  const toProduct = (p: DbProduct): Product => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.image_url || fallbackImage(p.name),
    category: p.category,
    order_count: p.order_count,
  });

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">เมนูของเรา</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:sticky lg:top-20 lg:h-fit lg:w-48 shrink-0">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1" aria-label="หมวดหมู่">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={toProduct(p)}
                  onClick={openProduct}
                  index={i}
                  isBestSeller={bestSellerIds.has(p.id)}
                />
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">ไม่มีสินค้าในหมวดหมู่นี้</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
