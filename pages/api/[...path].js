import app from "../../lib/server";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
  try {
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
    req.url = query ? `${pathname}?${query}` : pathname;
    req.originalUrl = req.url;
    return app(req, res);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
}
