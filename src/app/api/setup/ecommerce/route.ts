import { NextResponse } from "next/server";
import { setupEcommerceCollections } from "@/lib/db/ecommerce-setup";

export async function POST() {
  try {
    const result = await setupEcommerceCollections();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to setup ecommerce collections.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
