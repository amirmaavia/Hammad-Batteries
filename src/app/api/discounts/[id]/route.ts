import { NextResponse } from "next/server";
import { deleteDiscount, updateDiscount } from "@/lib/db/discounts";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const discount = await updateDiscount(id, body);
    return NextResponse.json({ discount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update discount.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteDiscount(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete discount.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
