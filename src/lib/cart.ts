export type CartItem = {
  _id: string;
  name: string;
  brand: string;
  defaultPrice: string;
  image?: string;
  quantity: number;
};

const CART_KEY = "hb_cart";

export const cartStore = {
  getItems(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  },
  addItem(item: Omit<CartItem, "quantity">) {
    const items = this.getItems();
    const existing = items.find((currentItem) => currentItem._id === item._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-update"));
  },
  removeItem(id: string) {
    const items = this.getItems().filter((item) => item._id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-update"));
  },
  getTotalCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },
  clear() {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("cart-update"));
  },
};
