import { NextResponse } from "next/server";
import { createOrder, getAllOrders, getOrdersByUser } from "@/lib/db/orders";
import { sendOrderPlacedEmails } from "@/lib/email";
import { STANDARD_DELIVERY_CHARGE } from "@/lib/ecommerce";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const orders = userId ? await getOrdersByUser(userId) : await getAllOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load orders.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.userId || !body.customerName || !body.customerEmail || !body.customerPhone || !body.deliveryAddress || !body.deliveryCity || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
    }

    if (body.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const paymentMethod = body.paymentMethod === "stripe" || body.paymentMethod === "cod" || body.paymentMethod === "manual"
      ? body.paymentMethod
      : "manual";
    const subtotal = Number(body.subtotal) || Math.max(0, Number(body.total) - STANDARD_DELIVERY_CHARGE) || 0;
    const discountAmount = Number(body.discountAmount) || 0;
    const deliveryCharge = Number(body.deliveryCharge) || STANDARD_DELIVERY_CHARGE;
    const total = Number(body.total) || Math.max(0, subtotal - discountAmount) + deliveryCharge;

    const order = await createOrder({
      userId: body.userId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      items: body.items,
      subtotal,
      discountCode: body.discountCode || "",
      discountAmount,
      deliveryCharge,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "COD" : "Online Pending",
      status: "Pending",
    });

    try {
      await sendOrderPlacedEmails(order);
    } catch (emailError) {
      console.error("Unable to send order email:", emailError);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
