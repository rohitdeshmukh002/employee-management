/**
 * Production entry for self-hosted Docker deploys.
 * Nitro's node-server preset serves index.html for all routes (white screen);
 * this runs TanStack SSR + static assets from .output/public instead.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { l as serve } from "./.output/server/_libs/h3+rou3+srvx.mjs";
import ssrHandler from "./.output/server/_ssr/ssr.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, ".output/public");

const MIME = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

async function tryStatic(pathname) {
  if (pathname === "/") return null;
  const safe = pathname.split("?")[0].replace(/\.\./g, "");
  const filePath = join(publicDir, safe);
  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) return null;
  try {
    const data = await readFile(filePath);
    const ext = extname(safe);
    const headers = { "content-type": MIME[ext] ?? "application/octet-stream" };
    if (safe.startsWith("/assets/")) {
      headers["cache-control"] = "public, max-age=31536000, immutable";
    }
    return new Response(data, { headers });
  } catch {
    return null;
  }
}

const port = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "3000", 10);
const host = process.env.NITRO_HOST ?? process.env.HOST ?? "0.0.0.0";

serve({
  port,
  hostname: host,
  fetch: async (req) => {
    const url = new URL(req.url);
    const staticRes = await tryStatic(url.pathname);
    if (staticRes) return staticRes;
    return ssrHandler.fetch(req, {}, {});
  },
});

console.log(`Listening on http://${host}:${port}/ (SSR + static assets)`);
