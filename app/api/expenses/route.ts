import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { expenses } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { handleApiError, json, readJson, requiredNumber, requiredString } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) return json({ error: "Authentication required" }, { status: 401 });
    const rows = await getDb().select().from(expenses)
      .where(eq(expenses.restaurantId, session.restaurantId)).orderBy(desc(expenses.occurredOn));
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
    const category = requiredString(body.category, "category");
    const amountCents = requiredNumber(body.amountCents, "amountCents");
    if (!Number.isInteger(amountCents) || amountCents < 0) throw new Error("amountCents must be a non-negative integer");
    const expense = {
      id: crypto.randomUUID(),
      restaurantId: session.restaurantId,
      category,
      amountCents,
      taxCents: typeof body.taxCents === "number" ? body.taxCents : 0,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      occurredOn: body.occurredOn ? new Date(String(body.occurredOn)) : new Date(),
      createdAt: new Date(),
    };
    await getDb().insert(expenses).values(expense);
    return json({ data: expense }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
