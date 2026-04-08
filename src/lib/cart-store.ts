import { create } from 'zustand';

export interface CartItem {
  productId: number;
  name: string;
  basePrice: number;
  sweetness: string;
  toppings: string[];
  quantity: number;
  totalPrice: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
