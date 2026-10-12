import { CartItem, Product } from "@/types";
import { create } from "zustand";

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
}

const FREE_DELIVERY_ABOVE = 500;
const DELIVERY_FEE = 40

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product: Product) => {
    const items = get().items;
    const existing = items.find((i) => i.product.id === product.id);

    if (existing) {
      set({
        items: items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      })
    } else {
      set({ items: [...items, { product, quantity: 1 }] })
    }
  },

  removeItem: (productId: string) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) })
  },

  incrementQuantity: (productId: string) => {
    set({
      items: get().items.map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i)
    })
  },

  decrementQuantity: (productId: string) => {
    const items = get().items;
    const item = items.find((i) => i.product.id === productId);

    if (item && item.quantity <= 1) {
      set({ items: items.filter((i) => i.product.id !== productId) })
    } else {
      set({
        items: items.map((i) => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
      })
    }
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity, 0
    )
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    return subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  },

  getTotal: () => {
    return get().getSubtotal() + get().getDeliveryFee()
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  getItemQuantity: (productId: string) => {
    return get().items.find((i) => i.product.id === productId)?.quantity || 0
  }

}))