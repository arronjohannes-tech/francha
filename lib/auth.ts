import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { restaurantUsers, users } from "@/db/schema";

const encoder = new TextEncoder();
const sessionCookie = "serviceflow_session";

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function derivePassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt);
  return `pbkdf2$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [, saltValue, hashValue] = stored.split("$");
  if (!saltValue || !hashValue) return false;
  const actual = await derivePassword(password, base64ToBytes(saltValue));
  const expected = base64ToBytes(hashValue);
  if (actual.length !== expected.length) return false;
  return actual.every((value, index) => value === expected[index]);
}

export async function createSession(userId: string) {
  const payload = bytesToBase64(encoder.encode(JSON.stringify({
    userId,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  })));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.AUTH_SECRET ?? "development-only-secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return `${payload}.${bytesToBase64(signature)}`;
}

export async function getSessionUser(request: Request) {
  const cookie = request.headers.get("cookie")?.match(new RegExp(`${sessionCookie}=([^;]+)`))?.[1];
  if (!cookie) return null;
  const [payload, signature] = cookie.split(".");
  if (!payload || !signature) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.AUTH_SECRET ?? "development-only-secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify("HMAC", key, base64ToBytes(signature), encoder.encode(payload));
  if (!valid) return null;
  const session = JSON.parse(new TextDecoder().decode(base64ToBytes(payload))) as {
    userId: string;
    expiresAt: number;
  };
  if (session.expiresAt <= Date.now()) return null;
  const user = await getDb().select({
    id: users.id,
    name: users.name,
    email: users.email,
    active: users.active,
    restaurantId: restaurantUsers.restaurantId,
    role: restaurantUsers.role,
  }).from(users).innerJoin(restaurantUsers, eq(users.id, restaurantUsers.userId))
    .where(and(eq(users.id, session.userId), eq(users.active, true))).limit(1);
  return user[0] ?? null;
}

export const authCookie = sessionCookie;
