import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { handleApiError, json, readJson, requiredString } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return json({ error: "Authentication required" }, { status: 401 });
    const params = new URL(request.url).searchParams;
    const restaurantId = params.get("restaurantId");
    if (!restaurantId) return json({ error: "restaurantId is required" }, { status: 400 });
    if (restaurantId !== user.restaurantId) return json({ error: "Forbidden" }, { status: 403 });
    const where = params.get("status")
      ? and(eq(orders.restaurantId, restaurantId), sql`${orders.status} = ${params.get("status")}`)
      : eq(orders.restaurantId, restaurantId);
    const rows = await getDb().select().from(orders).where(where).orderBy(desc(orders.openedAt));
    return json({ data: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

type ItemInput = { productId?: string; quantity?: number; notes?: string };

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return json({ error: "Authentication required" }, { status: 401 });
    const body = await readJson<Record<string, unknown>>(request);
    const restaurantId = requiredString(body.restaurantId, "restaurantId");
    if (restaurantId !== user.restaurantId) return json({ error: "Forbidden" }, { status: 403 });
    const inputItems = Array.isArray(body.items) ? body.items as ItemInput[] : [];
    if (!inputItems.length) throw new Error("items is required");
    const db = getDb();
    const resolved = [];
    for (const item of inputItems) {
      const productId = requiredString(item.productId, "items.productId");
      const quantity = item.quantity ?? 1;
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error("items.quantity must be a positive integer");
      const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!product || product.restaurantId !== restaurantId) throw new Error(`Product ${productId} was not found`);
      resolved.push({ product, quantity, notes: item.notes });
    }
    const subtotalCents = resolved.reduce((sum, item) => sum + item.product.sellingPriceCents * item.quantity, 0);
    const taxCents = resolved.reduce((sum, item) => sum + Math.round(item.product.sellingPriceCents * item.quantity * item.product.taxRate / (100 + item.product.taxRate)), 0);
    const [latest] = await db.select({ max: sql<number>`max(${orders.orderNumber})` }).from(orders).where(eq(orders.restaurantId, restaurantId));
    const order = {
      id: crypto.randomUUID(), restaurantId,
      tableId: typeof body.tableId === "string" ? body.tableId : null,
      orderNumber: (latest?.max ?? 0) + 1, status: "new" as const,
      subtotalCents, taxCents, totalCents: subtotalCents,
      openedAt: new Date(), closedAt: null,
    };
    await db.insert(orders).values(order);
    await db.insert(orderItems).values(resolved.map(({ product, quantity, notes }) => ({
      id: crypto.randomUUID(), orderId: order.id, productId: product.id,
      nameSnapshot: product.name, quantity, unitPriceCents: product.sellingPriceCents,
      taxRate: product.taxRate, status: "new" as const, notes: notes ?? null,
    })));
    return json({ data: order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
