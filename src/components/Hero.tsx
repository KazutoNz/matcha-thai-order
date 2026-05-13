import { useEffect, useState } from 'react';
import { Cat } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-matcha.jpg';
import productLatte from '@/assets/product-latte.jpg';
import productFrappe from '@/assets/product-frappe.jpg';
import productCheesecake from '@/assets/product-cheesecake.jpg';
import productSoftserve from '@/assets/product-softserve.jpg';
import productMochi from '@/assets/product-mochi.jpg';
import { Button } from '@/components/ui/button';

// 👇 INSERT YOUR OWN MATCHA & DESSERT IMAGE URLS HERE
// Add/remove as many entries as you like — the slideshow auto-adapts.
// You can use local imports (like below) or remote URLs (e.g. 'https://example.com/img.jpg').
const slideshowImages: string[] = [
  heroImage,
  productLatte,
  productFrappe,
  productCheesecake,
  productSoftserve,
  productMochi,
];

const SLIDE_INTERVAL_MS = 5000;

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slideshowImages.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideshowImages.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {slideshowImages.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt=""
            aria-hidden
            width={1920}
            height={800}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
              i === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-foreground/50" />
      </div>
      <div className="container relative flex min-h-[420px] flex-col items-center justify-center gap-6 py-20 text-center">
        <h1 className="flex flex-wrap items-center justify-center gap-3 font-display text-4xl font-bold tracking-tight text-white md:gap-4 md:text-6xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
          <Cat className="h-10 w-10 shrink-0 md:h-16 md:w-16" style={{ color: `hsl(var(--primary))` }} aria-hidden />
          <span>
            ยินดีต้อนรับสู่{' '}
            <span style={{ color: `hsl(var(--primary))` }}>MatchaMew</span>
          </span>
        </h1>
        <p className="max-w-lg text-lg text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
          เครื่องดื่มและขนมมัทฉะคุณภาพพรีเมียม สดใหม่ทุกวัน
        </p>
        <Button
          size="lg"
          className="relative z-10 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          asChild
        >
          <Link to="/menu">สำรวจเมนู</Link>
        </Button>
      </div>
    </section>
  );
};

export default Hero;
