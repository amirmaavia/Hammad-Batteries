import { NextResponse } from "next/server";
import { createDiscount, getAllDiscounts } from "@/lib/db/discounts";

export async function GET() {
  try {
    const discounts = await getAllDiscounts();
    return NextResponse.json({ discounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load discounts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.code || !body.type || Number(body.value) <= 0) {
      return NextResponse.json({ error: "Code, type, and value are required." }, { status: 400 });
    }

    const discount = await createDiscount({
      code: body.code,
      type: body.type,
      value: Number(body.value),
      active: Boolean(body.active),
    });

    return NextResponse.json({ discount }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create discount.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
