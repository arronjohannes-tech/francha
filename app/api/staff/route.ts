import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { staffProfiles, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { handleApiError, json, readJson, requiredNumber, requiredString } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) return json({ error: "Authentication required" }, { status: 401 });
    const rows = await getDb().select({
      id: staffProfiles.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      position: staffProfiles.position,
      hourlyRateCents: staffProfiles.hourlyRateCents,
      active: staffProfiles.active,
    }).from(staffProfiles).innerJoin(users, eq(users.id, staffProfiles.userId))
      .where(eq(staffProfiles.restaurantId, session.restaurantId)).orderBy(asc(users.name));
    return json({ data: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) return json({ error: "Authentication required" }, { status: 401 });
    const body = await readJson<Record<string, unknown>>(request);
    const userId = requiredString(body.userId, "userId");
    const position = requiredString(body.position, "position");
    const hourlyRateCents = requiredNumber(body.hourlyRateCents, "hourlyRateCents");
    if (!Number.isInteger(hourlyRateCents) || hourlyRateCents < 0) throw new Error("hourlyRateCents must be a non-negative integer");
    const profile = { id: crypto.randomUUID(), restaurantId: session.restaurantId, userId, position, hourlyRateCents, active: true };
    await getDb().insert(staffProfiles).values(profile);
    return json({ data: profile }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
