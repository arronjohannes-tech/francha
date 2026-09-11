import { authCookie } from "@/lib/auth";

export async function POST() {
  return Response.json({ data: true }, {
    headers: { "set-cookie": `${authCookie}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure` },
  });
}
