import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { stockMovements } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { handleApiError, json, readJson, requiredNumber, requiredString } from "@/lib/api";

const movementTypes = ["purchase", "consumption", "adjustment", "waste"] as const;

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    const params = new URL(request.url).searchParams;
    const restaurantId = params.get("restaurantId");
    if (!restaurantId) return json({ error: "restaurantId is required" }, { status: 400 });
    if (!user || restaurantId !== user.restaurantId) return json({ error: user ? "Forbidden" : "Authentication required" }, { status: user ? 403 : 401 });
    const rows = await getDb().select().from(stockMovements)
      .where(eq(stockMovements.restaurantId, restaurantId))
      .orderBy(desc(stockMovements.createdAt));
    return json({ data: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return json({ error: "Authentication required" }, { status: 401 });
    const body = await readJson<Record<string, unknown>>(request);
    const type = requiredString(body.type, "type");
    if (!movementTypes.includes(type as typeof movementTypes[number])) throw new Error("type must be one of purchase, consumption, adjustment, waste");
    const restaurantId = requiredString(body.restaurantId, "restaurantId");
    if (restaurantId !== user.restaurantId) return json({ error: "Forbidden" }, { status: 403 });
    const movement = {
      id: crypto.randomUUID(),
      restaurantId,
      ingredientId: requiredString(body.ingredientId, "ingredientId"),
      type: type as typeof movementTypes[number],
      quantity: requiredNumber(body.quantity, "quantity"),
      unitCostCents: typeof body.unitCostCents === "number" ? body.unitCostCents : null,
      reason: typeof body.reason === "string" ? body.reason : null,
      orderId: typeof body.orderId === "string" ? body.orderId : null,
      createdAt: new Date(),
    };
    if (movement.quantity <= 0) throw new Error("quantity must be greater than zero");
    await getDb().insert(stockMovements).values(movement);
    return json({ data: movement }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
