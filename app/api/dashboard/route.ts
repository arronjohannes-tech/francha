import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { expenses, orders, shifts, stockMovements } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { handleApiError, json } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return json({ error: "Authentication required" }, { status: 401 });
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const db = getDb();
    const [orderStats] = await db.select({
      count: sql<number>`count(*)`,
      revenueCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
    }).from(orders).where(and(
      eq(orders.restaurantId, user.restaurantId),
      gte(orders.openedAt, start),
    ));
    const [expenseStats] = await db.select({
      totalCents: sql<number>`coalesce(sum(${expenses.amountCents}), 0)`,
    }).from(expenses).where(and(eq(expenses.restaurantId, user.restaurantId), gte(expenses.occurredOn, start)));
    const [shiftStats] = await db.select({
      count: sql<number>`count(*)`,
    }).from(shifts).where(and(eq(shifts.restaurantId, user.restaurantId), eq(shifts.status, "active")));
    const stockRows = await db.select({
      ingredientId: stockMovements.ingredientId,
      quantity: sql<number>`sum(case when ${stockMovements.type} in ('purchase', 'adjustment') then ${stockMovements.quantity} else -${stockMovements.quantity} end)`,
    }).from(stockMovements).where(eq(stockMovements.restaurantId, user.restaurantId))
      .groupBy(stockMovements.ingredientId);
    return json({
      data: {
        user,
        orders: { count: orderStats?.count ?? 0, revenueCents: orderStats?.revenueCents ?? 0 },
        expenses: { totalCents: expenseStats?.totalCents ?? 0 },
        staff: { activeShifts: shiftStats?.count ?? 0 },
        stock: stockRows,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
