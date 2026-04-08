import { useEffect, useRef, useState } from 'react';
import { Github, MapPin, MessageCircle, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

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

      <section id="about" className="scroll-mt-20 border-t bg-muted/30 py-16">
        <div className="container max-w-3xl">
          <h2 className="mb-4 text-center text-3xl font-bold">เกี่ยวกับเรา</h2>
          <p className="text-center text-muted-foreground">
            MatchaMew คัดสรรผงมัทฉะคุณภาพ ผสมเครื่องดื่มและของหวานสไตล์ญี่ปุ่น–ไทย
            เพื่อให้ได้รสชาติเข้มข้น หอมหวาน ในราคาที่เข้าถึงได้ทุกวัน
          </p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 py-16">
        <div className="container max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold">ติดต่อ / ช่องทาง</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex min-h-full flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
              <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">โทรศัพท์</p>
                <a href="tel:0812345678" className="text-muted-foreground underline-offset-4 hover:underline">
                  081-234-5678
                </a>
              </div>
            </li>
            <li className="flex min-h-full flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
              <MessageCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">LINE</p>
                <p className="text-muted-foreground">@matchaweb (ตัวอย่าง — แก้เป็นไอดีจริงของร้านได้)</p>
              </div>
            </li>
            <li className="flex min-h-full flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold text-primary" aria-hidden>
                FB
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Facebook / Instagram</p>
                <p className="text-muted-foreground">facebook.com/matchaweb · @matchaweb.th</p>
              </div>
            </li>
            <li className="flex min-h-full flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
              <Github className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">GitHub</p>
                <a
                  href="https://github.com/KazutoNz/matcha-thai-order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-muted-foreground underline-offset-4 hover:underline"
                >
                  KazutoNz/matcha-thai-order
                </a>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section id="location" className="scroll-mt-20 border-t bg-muted/30 py-16">
        <div className="container max-w-3xl">
          <h2 className="mb-6 text-center text-3xl font-bold">สถานที่ตั้ง</h2>
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-start sm:gap-6">
            <MapPin className="h-8 w-8 shrink-0 text-primary" aria-hidden />
            <div className="space-y-2">
              <p className="font-medium leading-relaxed">
                123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง
                <br />
                กรุงเทพมหานคร 10110
              </p>
              <p className="text-sm text-muted-foreground">เปิดทุกวัน 10:00–20:00 น. (แก้เวลา/ที่อยู่ตามร้านจริงได้)</p>
              <a
                href="https://maps.google.com/?q=13.7563,100.5018"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                เปิดใน Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

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
