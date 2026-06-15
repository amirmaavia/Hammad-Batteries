import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, authCookieOptions, createAuthToken } from "@/lib/auth";
import { loginUserByPassword } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await loginUserByPassword(email, password);
    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE_NAME, createAuthToken(user), authCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to login.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
