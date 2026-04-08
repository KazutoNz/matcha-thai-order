import { Cat } from 'lucide-react';
import heroImage from '@/assets/hero-matcha.jpg';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onExplore: () => void;
}

const Hero = ({ onExplore }: HeroProps) => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="มัทฉะ"
          className="h-full w-full object-cover"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 bg-foreground/40" />
      </div>
      <div className="container relative flex min-h-[420px] flex-col items-center justify-center gap-6 py-20 text-center">
        <h1 className="flex flex-wrap items-center justify-center gap-3 font-display text-4xl font-bold tracking-tight text-primary-foreground md:gap-4 md:text-6xl">
          <Cat className="h-10 w-10 shrink-0 md:h-16 md:w-16" aria-hidden />
          <span>ยินดีต้อนรับสู่ MatchaMew</span>
        </h1>
        <p className="max-w-lg text-lg text-primary-foreground/90">
          เครื่องดื่มและขนมมัทฉะคุณภาพพรีเมียม สดใหม่ทุกวัน
        </p>
        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onExplore}
        >
          สำรวจเมนู
        </Button>
      </div>
    </section>
  );
};

export default Hero;
