// Vercel serverless function — cumulative visitor counter.
//   POST /api/visits  → increments and returns { count }
//   GET  /api/visits  → returns { count } without incrementing
//
// Works with whichever Redis the Vercel project has connected:
//   • Upstash (REST):  KV_REST_API_URL + KV_REST_API_TOKEN, UPSTASH_REDIS_REST_URL + _TOKEN,
//                      or any custom-prefixed  <PREFIX>_KV_REST_API_URL / _TOKEN pair
//   • Redis (TCP):     REDIS_URL, KV_URL, or any  <PREFIX>_REDIS_URL  (redis:// or rediss://)

import { createClient } from 'redis';

const KEY = 'portfolio:visits';
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless/i;

function findEnv(test) {
  const name = Object.keys(process.env).find(k => test(k) && process.env[k]);
  return name ? process.env[name] : undefined;
}

function restConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    findEnv(k => /REST_API_URL$|REDIS_REST_URL$/.test(k));
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    findEnv(k => /(REST_API_TOKEN|REDIS_REST_TOKEN)$/.test(k) && !/READ_ONLY/.test(k));
  return url && token ? { url, token } : null;
}

function tcpUrl() {
  return (
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    findEnv(k => /(REDIS_URL|KV_URL)$/.test(k) && /^rediss?:\/\//.test(process.env[k] || ''))
  );
}

// ---- Upstash REST ----
async function viaRest({ url, token }, command) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error(`Redis REST responded ${r.status}`);
  const { result } = await r.json();
  return Number(result) || 0;
}

// ---- Redis TCP (client reused across warm invocations) ----
let clientPromise = null;
function getClient(url) {
  if (!clientPromise) {
    const client = createClient({ url, socket: { connectTimeout: 5000 } });
    client.on('error', err => console.error('redis error', err));
    clientPromise = client.connect().then(() => client).catch(err => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}
async function viaTcp(url, increment) {
  const client = await getClient(url);
  const value = increment ? await client.incr(KEY) : await client.get(KEY);
  return Number(value) || 0;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const increment = req.method === 'POST' && !BOT.test(req.headers['user-agent'] || '');
  const rest = restConfig();
  const tcp = rest ? null : tcpUrl();

  if (!rest && !tcp) {
    // names only (never values) to make setup problems easy to spot
    const seen = Object.keys(process.env).filter(k => /REDIS|KV_|UPSTASH/.test(k));
    return res.status(503).json({ error: 'Visitor counter is not configured', redisEnvVarsFound: seen });
  }

  try {
    const count = rest ? await viaRest(rest, increment ? ['INCR', KEY] : ['GET', KEY]) : await viaTcp(tcp, increment);
    return res.status(200).json({ count });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'Counter unavailable' });
  }
}
