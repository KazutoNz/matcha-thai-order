import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/products';
import { cn } from '@/lib/utils';
import type { PublicOutletContext } from '@/layouts/PublicLayout';

const categories = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'drink', label: 'เครื่องดื่มมัทฉะ' },
  { id: 'dessert', label: 'ของหวาน' },
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { openProduct } = useOutletContext<PublicOutletContext>();

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">เมนูของเรา</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Category sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-fit lg:w-48 shrink-0">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1" aria-label="หมวดหมู่">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} onClick={openProduct} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">ไม่มีสินค้าในหมวดหมู่นี้</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
