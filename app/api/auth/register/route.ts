import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { restaurantUsers, restaurants, users } from "@/db/schema";
import { createSession, hashPassword, authCookie } from "@/lib/auth";
import { handleApiError, json, readJson, requiredString } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await readJson<Record<string, unknown>>(request);
    const name = requiredString(body.name, "name");
    const email = requiredString(body.email, "email").toLowerCase();
    const password = requiredString(body.password, "password");
    if (password.length < 8) return json({ error: "Das Passwort muss mindestens 8 Zeichen enthalten" }, { status: 400 });
    const db = getDb();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) return json({ error: "Die E-Mail-Adresse ist bereits registriert" }, { status: 409 });
    const restaurantId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const now = new Date();
    await db.batch([
      db.insert(restaurants).values({ id: restaurantId, name: "Mein Restaurant", createdAt: now }),
      db.insert(users).values({ id: userId, name, email, passwordHash: await hashPassword(password), createdAt: now }),
      db.insert(restaurantUsers).values({ restaurantId, userId, role: "owner", createdAt: now }),
    ]);
    const token = await createSession(userId);
    return json({ data: { id: userId, name, email, role: "owner" } }, {
      status: 201,
      headers: { "set-cookie": `${authCookie}=${token}; HttpOnly; Path=/; SameSite=Lax; Secure` },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
