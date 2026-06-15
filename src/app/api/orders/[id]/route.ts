import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/db/orders";
import type { StoreOrder } from "@/lib/ecommerce";
import { sendOrderShippedEmail } from "@/lib/email";

const statuses: StoreOrder["status"][] = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!statuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const order = await updateOrderStatus(id, body.status);

    if (body.status === "Shipped") {
      try {
        await sendOrderShippedEmail(order);
      } catch (emailError) {
        console.error("Unable to send shipping email:", emailError);
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
