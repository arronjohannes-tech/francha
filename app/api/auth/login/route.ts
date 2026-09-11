import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { authCookie, createSession, verifyPassword } from "@/lib/auth";
import { handleApiError, json, readJson, requiredString } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await readJson<Record<string, unknown>>(request);
    const email = requiredString(body.email, "email").toLowerCase();
    const password = requiredString(body.password, "password");
    const result = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];
    if (!user?.passwordHash || !user.active || !(await verifyPassword(password, user.passwordHash))) {
      return json({ error: "E-Mail oder Passwort ist falsch" }, { status: 401 });
    }
    const token = await createSession(user.id);
    return json({ data: { id: user.id, name: user.name, email: user.email } }, {
      headers: { "set-cookie": `${authCookie}=${token}; HttpOnly; Path=/; SameSite=Lax; Secure` },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
