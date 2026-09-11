import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import {
  handleApiError,
  json,
  readJson,
  requiredNumber,
  requiredString,
} from "@/lib/api";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return json({ error: "Authentication required" }, { status: 401 });
    const restaurantId = new URL(request.url).searchParams.get("restaurantId");
    if (!restaurantId) return json({ error: "restaurantId is required" }, { status: 400 });
    if (restaurantId !== user.restaurantId) return json({ error: "Forbidden" }, { status: 403 });
    const rows = await getDb().select().from(products)
      .where(eq(products.restaurantId, restaurantId)).orderBy(asc(products.name));
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
    const restaurantId = requiredString(body.restaurantId, "restaurantId");
    if (restaurantId !== user.restaurantId) return json({ error: "Forbidden" }, { status: 403 });
    const name = requiredString(body.name, "name");
    const sellingPriceCents = requiredNumber(body.sellingPriceCents, "sellingPriceCents");
    if (!Number.isInteger(sellingPriceCents) || sellingPriceCents < 0) {
      throw new Error("sellingPriceCents must be a non-negative integer");
    }
    const product = {
      id: crypto.randomUUID(),
      restaurantId,
      categoryId: typeof body.categoryId === "string" ? body.categoryId : null,
      name,
      sellingPriceCents,
      taxRate: typeof body.taxRate === "number" ? body.taxRate : 19,
      active: body.active === undefined ? true : Boolean(body.active),
      createdAt: new Date(),
    };
    await getDb().insert(products).values(product);
    return json({ data: product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
