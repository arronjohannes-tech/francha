/**
 * Cloudflare Worker entrypoint used by Wrangler and the local D1 preview.
 * Vinext owns the request pipeline (including app/api routes and assets).
 */
import handler from "vinext/server/app-router-entry";

export default handler;
