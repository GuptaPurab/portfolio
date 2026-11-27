// Vercel serverless function — cumulative visitor counter backed by Upstash Redis.
//   POST /api/visits  → increments and returns { count }
//   GET  /api/visits  → returns { count } without incrementing
//
// Env vars (either pair works; the Vercel ↔ Upstash integration sets the KV_* ones):
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
//   KV_REST_API_URL        / KV_REST_API_TOKEN

const KEY = 'portfolio:visits';
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless/i;

export default async function handler(req, res) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  res.setHeader('Cache-Control', 'no-store');

  if (!url || !token) {
    return res.status(503).json({ error: 'Visitor counter is not configured' });
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isBot = BOT.test(req.headers['user-agent'] || '');
  const command = req.method === 'POST' && !isBot ? ['INCR', KEY] : ['GET', KEY];

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    if (!r.ok) throw new Error(`Upstash responded ${r.status}`);
    const { result } = await r.json();
    return res.status(200).json({ count: Number(result) || 0 });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'Counter unavailable' });
  }
}
