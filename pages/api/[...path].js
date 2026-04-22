import app from "../../lib/server";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const pathname = `/${pathSegments.join("/")}`.replace(/\/+$/, "") || "/";
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue;
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
      continue;
    }
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  const nextUrl = query ? `${pathname}?${query}` : pathname;
  req.url = nextUrl;
  req.originalUrl = nextUrl;
  delete req._parsedUrl;
  return app(req, res);
}
