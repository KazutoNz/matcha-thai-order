import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CartFAB from '@/components/CartFAB';
import ScrollToTop from '@/components/ScrollToTop';
import ProductModal from '@/components/ProductModal';
import { type Product } from '@/lib/products';

export interface PublicOutletContext {
  openCart: () => void;
  openProduct: (product: Product) => void;
}

const PublicLayout = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const ctx: PublicOutletContext = {
    openCart: () => setCartOpen(true),
    openProduct: (p) => setSelectedProduct(p),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet context={ctx} />
      </main>
      <Footer />
      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <CartFAB onClick={() => setCartOpen(true)} />
      <ScrollToTop />
    </div>
  );
};

export default PublicLayout;
