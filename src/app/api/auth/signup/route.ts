import { NextResponse } from "next/server";
import { createUser } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!name || !email || password.length < 6) {
      return NextResponse.json({ error: "Name, email, and a 6 character password are required." }, { status: 400 });
    }

    const user = await createUser(name, email, password);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
