import { NextResponse } from "next/server";
import { getAllDiscounts } from "@/lib/db/discounts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Math.max(0, Number(body.subtotal) || 0);

    if (!code || subtotal <= 0) {
      return NextResponse.json({ error: "Promo code and cart subtotal are required." }, { status: 400 });
    }

    const discount = (await getAllDiscounts()).find((item) => item.code === code && item.active);

    if (!discount) {
      return NextResponse.json({ error: "Promo code is not valid or is disabled." }, { status: 404 });
    }

    const rawAmount = discount.type === "percent" ? (subtotal * discount.value) / 100 : discount.value;
    const discountAmount = Math.min(subtotal, Math.max(0, Math.round(rawAmount)));

    return NextResponse.json({
      promo: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to validate promo code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
