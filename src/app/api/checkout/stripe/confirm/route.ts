import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db/orders";
import { sendOrderPlacedEmails } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { STANDARD_DELIVERY_CHARGE } from "@/lib/ecommerce";
import type { StoreOrder } from "@/lib/ecommerce";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const pendingOrder = body.order as Partial<StoreOrder>;

    if (!sessionId || !pendingOrder || !Array.isArray(pendingOrder.items)) {
      return NextResponse.json({ error: "Missing Stripe session or order details." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Stripe payment is not paid yet." }, { status: 400 });
    }

    const subtotal = Number(pendingOrder.subtotal) || Math.max(0, Number(pendingOrder.total) - STANDARD_DELIVERY_CHARGE) || 0;
    const discountAmount = Number(pendingOrder.discountAmount) || 0;
    const deliveryCharge = Number(pendingOrder.deliveryCharge) || STANDARD_DELIVERY_CHARGE;
    const total = Number(pendingOrder.total) || Math.max(0, subtotal - discountAmount) + deliveryCharge;
    const paidTotal = Math.round((session.amount_total || 0) / 100);

    if (pendingOrder.items.length === 0 || total <= 0 || paidTotal !== total) {
      return NextResponse.json({ error: "Stripe payment does not match this order." }, { status: 400 });
    }

    if (!pendingOrder.userId || !pendingOrder.customerName || !pendingOrder.customerEmail || !pendingOrder.customerPhone || !pendingOrder.deliveryAddress || !pendingOrder.deliveryCity) {
      return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
    }

    const stripePaymentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || session.id;
    const order = await createOrder({
      userId: String(pendingOrder.userId || ""),
      customerName: String(pendingOrder.customerName || ""),
      customerEmail: String(pendingOrder.customerEmail || ""),
      customerPhone: String(pendingOrder.customerPhone || ""),
      deliveryAddress: String(pendingOrder.deliveryAddress || ""),
      deliveryCity: String(pendingOrder.deliveryCity || ""),
      items: pendingOrder.items,
      subtotal,
      discountCode: pendingOrder.discountCode || "",
      discountAmount,
      deliveryCharge,
      total,
      paymentMethod: "stripe",
      paymentStatus: "Online Paid",
      stripePaymentId,
      status: "Pending",
    });

    try {
      await sendOrderPlacedEmails(order);
    } catch (emailError) {
      console.error("Unable to send paid order email:", emailError);
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to confirm Stripe payment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
