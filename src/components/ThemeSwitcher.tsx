import { Moon, Palette, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PALETTES, useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const ThemeSwitcher = () => {
  const { mode, palette, setPalette, toggleMode } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="ตั้งค่าธีม" className="text-muted-foreground hover:text-primary">
          <Palette className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">โหมด</p>
          <Button onClick={toggleMode} variant="outline" className="mt-2 w-full justify-start gap-2">
            {mode === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {mode === 'light' ? 'สว่าง' : 'มืด'}
            <span className="ml-auto text-xs text-muted-foreground">คลิกเพื่อสลับ</span>
          </Button>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">สีหลัก</p>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                aria-label={p.label}
                title={p.label}
                className={cn(
                  'h-9 w-9 rounded-full border-2 transition-transform hover:scale-110',
                  palette === p.id ? 'border-foreground ring-2 ring-foreground/20' : 'border-border'
                )}
                style={{ backgroundColor: `hsl(${p.primary})` }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSwitcher;
