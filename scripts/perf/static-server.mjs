import { createServer } from "node:http";
import { existsSync, statSync, createReadStream, readFileSync } from "node:fs";
import { brotliCompressSync } from "node:zlib";
import { extname, join, normalize, resolve, sep } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt"]);
const brotliCache = new Map();

/** Map a request path to a file under root, with static-export clean URLs. Returns null if not found or outside root. */
export function resolveFile(root, urlPath) {
  let p;
  try {
    p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  } catch {
    return null;
  }
  const base = resolve(root);
  const full = normalize(join(base, p));
  if (full !== base && !full.startsWith(base + sep)) return null;
  const candidates = [full, `${full}.html`, join(full, "index.html")];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/** Start a static server on a free port. Resolves { url, close }. */
export function startStaticServer(root) {
  const server = createServer((req, res) => {
    const file = resolveFile(root, req.url ?? "/");
    if (!file) {
      const notFound = join(resolve(root), "404.html");
      res.writeHead(404, { "content-type": TYPES[".html"] });
      if (existsSync(notFound)) createReadStream(notFound).pipe(res);
      else res.end("not found");
      return;
    }
    const type = TYPES[extname(file)] ?? "application/octet-stream";
    // Cloudflare Pages serves text assets brotli-compressed; do the same so transfer sizes are realistic.
    if (COMPRESSIBLE.has(extname(file)) && String(req.headers["accept-encoding"] ?? "").includes("br")) {
      let body = brotliCache.get(file);
      if (!body) {
        body = brotliCompressSync(readFileSync(file));
        brotliCache.set(file, body);
      }
      res.writeHead(200, { "content-type": type, "content-encoding": "br", "content-length": body.length });
      res.end(body);
      return;
    }
    res.writeHead(200, { "content-type": type });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok, fail) => {
    server.once("error", fail);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      ok({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(() => done())),
      });
    });
  });
}
