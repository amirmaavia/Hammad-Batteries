import { createHmac, timingSafeEqual } from "crypto";
import type { StoreUser } from "@/lib/ecommerce";

export const AUTH_COOKIE_NAME = "cToken";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

type AuthTokenPayload = Pick<StoreUser, "id" | "name" | "email" | "phone" | "address" | "city" | "role" | "createdAt"> & {
  sub: string;
  iat: number;
  exp: number;
};

function getAuthSecret() {
  return process.env.AUTH_TOKEN_SECRET || process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "hammad-batteries-dev-auth-secret";
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

export function createAuthToken(user: StoreUser) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    role: user.role,
    createdAt: user.createdAt,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const header = { alg: "HS256", typ: "JWT" };
  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyAuthToken(token: string) {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = sign(`${header}.${payload}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(base64UrlDecode(payload)) as AuthTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!parsedPayload.sub || parsedPayload.exp <= now) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  };
}
