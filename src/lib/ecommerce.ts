import type { CartItem } from "./cart";

export type UserRole = "user" | "admin";

export type StoreUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  role: UserRole;
  createdAt: string;
};

export type StoreOrder = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  items: CartItem[];
  subtotal?: number;
  discountCode?: string;
  discountAmount?: number;
  total: number;
  paymentMethod: "stripe" | "cod" | "manual";
  status: "Pending" | "Paid" | "Processing" | "Completed" | "Cancelled";
  createdAt: string;
};

export type StoreDiscount = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  createdAt: string;
};

export type AppliedPromo = {
  code: string;
  type: StoreDiscount["type"];
  value: number;
  discountAmount: number;
};

const SESSION_KEY = "hb_current_user";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "") || fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function readApiError(response: Response, fallback: string) {
  try {
    const result = await response.json();
    return result.error || fallback;
  } catch {
    return fallback;
  }
}

export function getCurrentUser() {
  const user = read<StoreUser | string | null>(SESSION_KEY, null);

  if (!user || typeof user === "string" || !user.id) {
    if (typeof window !== "undefined" && typeof user === "string") {
      localStorage.removeItem(SESSION_KEY);
    }
    return null;
  }

  return user;
}

export async function getUsers() {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to load users."));
  }

  const result = await response.json();
  const users = result.users || [];
  return users as StoreUser[];
}

export async function signupUser(name: string, email: string, password: string) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to create account."));
  }

  const result = await response.json();
  write(SESSION_KEY, result.user);
  window.dispatchEvent(new Event("auth-update"));
  return result.user as StoreUser;
}

export async function loginUser(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to login."));
  }

  const result = await response.json();
  write(SESSION_KEY, result.user);
  window.dispatchEvent(new Event("auth-update"));
  return result.user as StoreUser;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("auth-update"));
}

export async function updateUserRole(userId: string, role: UserRole) {
  const actor = getCurrentUser();
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, actorId: actor?.id }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to update user role."));
  }

  const users = await getUsers();
  window.dispatchEvent(new Event("auth-update"));
  return users;
}

export async function updateUserProfile(userId: string, updates: Pick<StoreUser, "name" | "phone" | "address" | "city">) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to update user profile."));
  }

  const result = await response.json();
  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    write(SESSION_KEY, result.user);
  }
  window.dispatchEvent(new Event("auth-update"));
  return result.user as StoreUser;
}

export async function getOrders(userId?: string) {
  const response = await fetch(userId ? `/api/orders?userId=${encodeURIComponent(userId)}` : "/api/orders");
  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to load orders."));
  }

  const result = await response.json();
  return (result.orders || []) as StoreOrder[];
}

export async function createOrder(order: Omit<StoreOrder, "id" | "createdAt">) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to create order."));
  }

  const result = await response.json();
  return result.order as StoreOrder;
}

export async function updateOrderStatus(orderId: string, status: StoreOrder["status"]) {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to update order."));
  }

  return getOrders();
}

export async function getDiscounts() {
  const response = await fetch("/api/discounts");
  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to load discounts."));
  }

  const result = await response.json();
  return (result.discounts || []) as StoreDiscount[];
}

export async function saveDiscount(discount: Omit<StoreDiscount, "id" | "createdAt">) {
  const response = await fetch("/api/discounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discount),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to create discount."));
  }

  return getDiscounts();
}

export async function updateDiscount(discountId: string, updates: Partial<StoreDiscount>) {
  const response = await fetch(`/api/discounts/${discountId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to update discount."));
  }

  return getDiscounts();
}

export async function deleteDiscount(discountId: string) {
  const response = await fetch(`/api/discounts/${discountId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to delete discount."));
  }

  return getDiscounts();
}

export async function validatePromoCode(code: string, subtotal: number) {
  const response = await fetch("/api/discounts/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Invalid promo code."));
  }

  const result = await response.json();
  return result.promo as AppliedPromo;
}
