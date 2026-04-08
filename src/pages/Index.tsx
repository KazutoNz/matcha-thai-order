import { useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import CartFAB from '@/components/CartFAB';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import { products, type Product } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const gridRef = useRef<HTMLElement>(null);
  const orders = useCartStore((s) => s.orders);
  const latestOrder = orders.length > 0 ? orders[orders.length - 1] : null;

  const statusToStep = (status: string | undefined) => {
    if (status === 'preparing') return 1;
    if (status === 'completed') return 3;
    return 0;
  };

  return (
    <div className="min-h-screen">
      <Navbar onCartClick={() => setCartOpen(true)} />
      {latestOrder && (
        <OrderStatusTracker currentStep={statusToStep(latestOrder.status)} />
      )}
      <Hero onExplore={() => gridRef.current?.scrollIntoView({ behavior: 'smooth' })} />

      <section ref={gridRef} className="container py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">เมนูของเรา</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} onClick={setSelectedProduct} index={i} />
          ))}
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <CartFAB onClick={() => setCartOpen(true)} />
    </div>
  );
};

export default Index;
