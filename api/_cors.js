const ALLOWED = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);

export function setCors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED.length === 0 || ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}
