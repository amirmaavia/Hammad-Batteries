import { NextResponse } from "next/server";
import { getStripe, parseRupeeAmount } from "@/lib/stripe";

type CheckoutItem = {
  _id?: string;
  name?: string;
  brand?: string;
  defaultPrice?: string;
  quantity?: number;
};

function getOrigin(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? (body.items as CheckoutItem[]) : [];
    const requestedTotal = Math.max(0, Number(body.total) || 0);

    if (items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => {
      return sum + parseRupeeAmount(item.defaultPrice) * Math.max(1, Number(item.quantity) || 1);
    }, 0);
    const checkoutTotal = requestedTotal > 0 ? requestedTotal : subtotal;

    if (checkoutTotal <= 0) {
      return NextResponse.json({ error: "Checkout total must be greater than zero." }, { status: 400 });
    }

    const lineItems = [
      {
        price_data: {
          currency: process.env.STRIPE_CURRENCY || "pkr",
          product_data: {
            name: "Hammad Batteries order",
            description: items.map((item) => `${item.name} x${Math.max(1, Number(item.quantity) || 1)}`).join(", "),
          },
          unit_amount: checkoutTotal * 100,
        },
        quantity: 1,
      },
    ];

    const origin = getOrigin(request);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/store?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store?stripe=cancelled`,
      metadata: {
        source: "hammad-batteries-cart",
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Stripe checkout.";
    console.error("Stripe checkout failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
