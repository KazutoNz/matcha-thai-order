import { create } from 'zustand';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  basePrice: number;
  sweetness: string;
  toppings: string[];
  variation?: string;
  quantity: number;
  totalPrice: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

let counter = 0;

type CartListener = () => void;
const cartAddListeners: CartListener[] = [];
export const onCartAdd = (fn: CartListener) => {
  cartAddListeners.push(fn);
  return () => {
    const idx = cartAddListeners.indexOf(fn);
    if (idx >= 0) cartAddListeners.splice(idx, 1);
  };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => ({
      items: [...state.items, { ...item, id: `item-${++counter}` }],
    }));
    cartAddListeners.forEach((fn) => fn());
  },
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  totalPrice: () => get().items.reduce((s, i) => s + i.totalPrice, 0),
}));
