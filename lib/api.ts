export const json = (body: unknown, init: ResponseInit = {}) =>
  Response.json(body, {
    ...init,
    headers: { "cache-control": "no-store", ...(init.headers ?? {}) },
  });

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Request body must be valid JSON");
  }
}

export function requiredString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

export function requiredNumber(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${name} must be a number`);
  }
  return value;
}

export function handleApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = /required|must be|valid JSON|must be one of/i.test(message)
    ? 400
    : 500;
  return json({ error: message }, { status });
}
