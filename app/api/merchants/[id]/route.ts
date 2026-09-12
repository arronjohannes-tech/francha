import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { merchants } from '@/db/schema';
import { getSessionUser } from '@/lib/auth';
import { handleApiError, json, readJson, requiredString } from '@/lib/api';

const assignableStatuses = [
  'in_bearbeitung',
  'angelegt',
  'aktiv',
  'gesperrt',
  'obsolet',
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser(request);
    if (!user)
      return json({ error: 'Authentication required' }, { status: 401 });
    const { id } = await params;
    const body = await readJson<Record<string, unknown>>(request);
    const status = requiredString(body.status, 'status');
    if (
      !assignableStatuses.includes(
        status as (typeof assignableStatuses)[number],
      )
    ) {
      return json(
        { error: `status must be one of ${assignableStatuses.join(', ')}` },
        { status: 400 },
      );
    }
    const db = getDb();
    const existing = await db
      .select({ id: merchants.id })
      .from(merchants)
      .where(eq(merchants.id, id))
      .limit(1);
    if (!existing.length)
      return json({ error: 'Merchant not found' }, { status: 404 });
    await db
      .update(merchants)
      .set({
        status: status as (typeof assignableStatuses)[number],
        updatedAt: new Date(),
      })
      .where(eq(merchants.id, id));
    return json({ data: { id, status } });
  } catch (error) {
    return handleApiError(error);
  }
}
