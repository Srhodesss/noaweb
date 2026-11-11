// Vercel serverless function: POST /api/waitlist
//
// Validates a "register interest" signup and forwards it to the Google Apps
// Script attached to the team waitlist Google Sheet.
//
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   SHEET_WEBHOOK_URL  the Apps Script web app URL (ends in /exec)
//   SHEET_SECRET       a long random string, also set in the Apps Script

const ROLES = new Set(["athlete", "coach", "both"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Bump this if the consent wording on the form changes, so we know what each person agreed to
const CONSENT_VERSION = "2026-11-11";

const clean = (value, max = 100) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "Invalid request" });
  }

  // Honeypot filled in: pretend it worked so bots don't retry
  if (clean(body.company)) return res.status(200).json({ ok: true });

  const email = clean(body.email, 254).toLowerCase();
  const role = clean(body.role, 10);

  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: "Invalid email" });
  if (!ROLES.has(role)) return res.status(400).json({ ok: false, error: "Invalid role" });
  if (body.consent !== true) return res.status(400).json({ ok: false, error: "Consent required" });

  const { SHEET_WEBHOOK_URL, SHEET_SECRET } = process.env;
  if (!SHEET_WEBHOOK_URL || !SHEET_SECRET) {
    console.error("Waitlist not configured: missing SHEET_WEBHOOK_URL or SHEET_SECRET");
    return res.status(500).json({ ok: false, error: "Not configured" });
  }

  const row = {
    secret: SHEET_SECRET,
    email,
    role,
    consent: "yes",
    consent_version: CONSENT_VERSION,
    utm_source: clean(body.utm_source),
    utm_medium: clean(body.utm_medium),
    utm_campaign: clean(body.utm_campaign),
    ref: clean(body.ref),
    page: clean(body.page, 200),
  };

  try {
    // Apps Script replies with a redirect to the result, which fetch follows
    const upstream = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(row),
      redirect: "follow",
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!upstream.ok || !data || data.ok !== true) {
      console.error("Sheet rejected signup:", upstream.status, text.slice(0, 300));
      return res.status(502).json({ ok: false, error: "Could not save" });
    }
    return res.status(200).json({ ok: true, duplicate: Boolean(data.duplicate) });
  } catch (err) {
    console.error("Sheet request failed:", err);
    return res.status(502).json({ ok: false, error: "Could not save" });
  }
};
