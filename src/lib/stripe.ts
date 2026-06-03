import Stripe from "stripe";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment settings.");
  }

  return new Stripe(secretKey);
}

export function parseRupeeAmount(price?: string) {
  if (!price) return 0;
  return Number(price.replace(/[^\d]/g, "")) || 0;
}
