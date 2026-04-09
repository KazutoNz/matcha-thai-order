import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const ih = window.innerHeight;
      const sh = document.documentElement.scrollHeight;
      const maxScroll = Math.max(0, sh - ih);
      if (maxScroll <= 48) {
        setVisible(false);
        return;
      }
      const pastHalfViewport = y >= ih * 0.5;
      const pastHalfPage = y >= maxScroll * 0.5;
      const nearBottom = y + ih >= sh - 72;
      setVisible(pastHalfViewport || pastHalfPage || nearBottom);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 animate-in fade-in zoom-in-95 duration-200">
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="h-12 w-12 rounded-full border border-border/80 bg-background/95 shadow-lg backdrop-blur-sm hover:bg-muted"
        aria-label="กลับขึ้นด้านบน"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ScrollToTop;
