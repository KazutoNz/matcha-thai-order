import { create } from 'zustand';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  basePrice: number;
  sweetness: string;
  toppings: string[];
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'completed';
  createdAt: Date;
}

interface CartState {
  items: CartItem[];
  orders: Order[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

let counter = 0;

// Simple event emitter for cart add animations
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
  orders: [],
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
  addOrder: (order) =>
    set((state) => ({ orders: [...state.orders, order] })),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}));
