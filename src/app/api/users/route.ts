import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/db/users";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
