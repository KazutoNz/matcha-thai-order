import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Cat, Github, MapPin, MessageCircle, Phone } from 'lucide-react';
import Hero from '@/components/Hero';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import { products } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';
import type { PublicOutletContext } from '@/layouts/PublicLayout';

const bestSellers = products.slice(0, 3);

const Home = () => {
  const { openProduct } = useOutletContext<PublicOutletContext>();
  const orders = useCartStore((s) => s.orders);
  const latestOrder = orders.length > 0 ? orders[orders.length - 1] : null;

  const statusToStep = (status: string | undefined) => {
    if (status === 'preparing') return 1;
    if (status === 'completed') return 3;
    return 0;
  };

  return (
    <>
      {latestOrder && (
        <OrderStatusTracker currentStep={statusToStep(latestOrder.status)} />
      )}
      <Hero />

      {/* Best Sellers — รูปเมนูอย่างเดียว */}
      <section className="container py-16">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">สินค้าขายดี</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-2 sm:gap-4">
          {bestSellers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openProduct(p)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`เปิดเมนู ${p.name}`}
            >
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ดูเมนูทั้งหมด
          </Link>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 border-t bg-muted/30 py-16">
        <div className="container max-w-3xl">
          <h2 className="mb-4 text-center text-3xl font-bold">เกี่ยวกับเรา</h2>
          <p className="text-center text-muted-foreground">
            MatchaMew คัดสรรผงมัทฉะคุณภาพ ผสมเครื่องดื่มและของหวานสไตล์ญี่ปุ่น–ไทย
            เพื่อให้ได้รสชาติเข้มข้น หอมหวาน ในราคาที่เข้าถึงได้ทุกวัน
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 py-16">
        <div className="container max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold">ติดต่อ / ช่องทาง</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex min-h-full flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
              <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">โทรศัพท์</p>
                <a href="tel:0812345678" className="text-muted-foreground underline-offset-4 hover:underline">081-234-5678</a>
              </div>
            </li>
            <li className="flex min-h-full flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
              <MessageCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">LINE</p>
                <p className="text-muted-foreground">@matchaweb</p>
              </div>
            </li>
            <li className="flex min-h-full flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold text-primary" aria-hidden>FB</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Facebook / Instagram</p>
                <p className="text-muted-foreground">facebook.com/matchaweb · @matchaweb.th</p>
              </div>
            </li>
            <li className="flex min-h-full flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
              <Github className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">GitHub</p>
                <a href="https://github.com/KazutoNz/matcha-thai-order" target="_blank" rel="noopener noreferrer" className="break-all text-muted-foreground underline-offset-4 hover:underline">KazutoNz/matcha-thai-order</a>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="scroll-mt-20 border-t bg-muted/30 py-16">
        <div className="container max-w-3xl">
          <h2 className="mb-6 text-center text-3xl font-bold">สถานที่ตั้ง</h2>
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-start sm:gap-6">
            <MapPin className="h-8 w-8 shrink-0 text-primary" aria-hidden />
            <div className="space-y-2">
              <p className="font-medium leading-relaxed">123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง<br />กรุงเทพมหานคร 10110</p>
              <p className="text-sm text-muted-foreground">เปิดทุกวัน 10:00–20:00 น.</p>
              <a href="https://www.google.com/maps/search/?api=1&query=13.7563,100.5018" target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline">เปิดใน Google Maps</a>
            </div>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=13.7563,100.5018"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block overflow-hidden rounded-lg border shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="เปิดแผนที่ใน Google Maps"
          >
            <iframe
              title="แผนที่ร้าน MatchaMew"
              src="https://www.google.com/maps?q=13.7563,100.5018&hl=th&z=16&output=embed"
              width="100%"
              height="320"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="pointer-events-none block w-full border-0"
            />
          </a>
        </div>
      </section>
    </>
  );
};

export default Home;
