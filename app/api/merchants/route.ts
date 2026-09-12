import { desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { merchants } from '@/db/schema';
import { getSessionUser } from '@/lib/auth';
import { handleApiError, json, readJson, requiredString } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user)
      return json({ error: 'Authentication required' }, { status: 401 });
    const rows = await getDb()
      .select()
      .from(merchants)
      .orderBy(desc(merchants.createdAt));
    return json({ data: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson<Record<string, unknown>>(request);
    const companyName = requiredString(body.companyName, 'companyName');
    const contactName = requiredString(body.contactName, 'contactName');
    const email = requiredString(body.email, 'email').toLowerCase();
    const vatId = requiredString(body.vatId, 'vatId');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(
        { error: 'email must be a valid email address' },
        { status: 400 },
      );
    }
    const db = getDb();
    const merchant = {
      id: crypto.randomUUID(),
      companyName,
      contactName,
      email,
      vatId,
      phone: typeof body.phone === 'string' ? body.phone.trim() || null : null,
      street:
        typeof body.street === 'string' ? body.street.trim() || null : null,
      postalCode:
        typeof body.postalCode === 'string'
          ? body.postalCode.trim() || null
          : null,
      city: typeof body.city === 'string' ? body.city.trim() || null : null,
      country:
        typeof body.country === 'string' ? body.country.trim() || null : null,
      website:
        typeof body.website === 'string' ? body.website.trim() || null : null,
      notes: typeof body.notes === 'string' ? body.notes.trim() || null : null,
      status: 'neu' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(merchants).values(merchant);
    return json({ data: merchant }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && /unique/i.test(error.message)) {
      return json(
        {
          error:
            'Für diese E-Mail-Adresse liegt bereits eine Registrierung vor',
        },
        { status: 409 },
      );
    }
    return handleApiError(error);
  }
}
