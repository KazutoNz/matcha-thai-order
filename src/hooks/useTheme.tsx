import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
export type PaletteId = 'matcha' | 'sakura' | 'ocean' | 'sunset' | 'lavender';

export interface Palette {
  id: PaletteId;
  label: string;
  primary: string; // HSL triplet
  ring: string;
}

export const PALETTES: Palette[] = [
  { id: 'matcha',   label: 'มัทฉะ',   primary: '142 40% 40%',  ring: '142 40% 40%' },
  { id: 'sakura',   label: 'ซากุระ',  primary: '340 65% 58%',  ring: '340 65% 58%' },
  { id: 'ocean',    label: 'ทะเล',    primary: '205 75% 45%',  ring: '205 75% 45%' },
  { id: 'sunset',   label: 'พระอาทิตย์ตก', primary: '20 85% 55%', ring: '20 85% 55%' },
  { id: 'lavender', label: 'ลาเวนเดอร์', primary: '270 55% 55%', ring: '270 55% 55%' },
];

interface ThemeCtx {
  mode: ThemeMode;
  palette: PaletteId;
  setMode: (m: ThemeMode) => void;
  setPalette: (p: PaletteId) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

const KEY_MODE = 'mm-theme-mode';
const KEY_PAL = 'mm-theme-palette';

const applyTheme = (mode: ThemeMode, paletteId: PaletteId) => {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  const p = PALETTES.find((x) => x.id === paletteId) ?? PALETTES[0];
  root.style.setProperty('--primary', p.primary);
  root.style.setProperty('--ring', p.ring);
  root.style.setProperty('--accent', p.primary);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(KEY_MODE) as ThemeMode) || 'light';
  });
  const [palette, setPaletteState] = useState<PaletteId>(() => {
    if (typeof window === 'undefined') return 'matcha';
    return (localStorage.getItem(KEY_PAL) as PaletteId) || 'matcha';
  });

  useEffect(() => {
    applyTheme(mode, palette);
  }, [mode, palette]);

  const setMode = (m: ThemeMode) => {
    localStorage.setItem(KEY_MODE, m);
    setModeState(m);
  };
  const setPalette = (p: PaletteId) => {
    localStorage.setItem(KEY_PAL, p);
    setPaletteState(p);
  };
  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ mode, palette, setMode, setPalette, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
