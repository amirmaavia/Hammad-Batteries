import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || "";
  const payload = token ? verifyAuthToken(token) : null;

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUserById(payload.sub);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
