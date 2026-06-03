import { NextResponse } from "next/server";
import { createOrder, getAllOrders, getOrdersByUser } from "@/lib/db/orders";

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

    const order = await createOrder({
      userId: body.userId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      items: body.items,
      subtotal: Number(body.subtotal) || Number(body.total) || 0,
      discountCode: body.discountCode || "",
      discountAmount: Number(body.discountAmount) || 0,
      total: Number(body.total) || 0,
      paymentMethod: body.paymentMethod,
      status: body.status || "Pending",
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
