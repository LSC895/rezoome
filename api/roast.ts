// api/roast.ts
// Vercel serverless handler (TypeScript).
// Backend-only env variables (server-side; do NOT expose to frontend):
// - CLERK_SECRET_KEY
// - SUPABASE_SERVICE_KEY
// - SUPABASE_URL

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { analyze } from '../server/roastLogic.js' // .js extension required for ESM runtime

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).send('Method Not Allowed')
  }

  try {
    const payload = req.body
    const result = await analyze(payload)
    return res.status(200).json(result)
  } catch (err: any) {
    console.error('api/roast handler error:', err)
    return res.status(500).json({ error: String(err?.message ?? err) })
  }
}
// Vercel API adapter — forwards to the server-side handler implemented under src/server/roast
// This file is intentionally tiny so Vercel can pick it up as an API route.
import handler from '../frontend/src/server/roast/handler';

export default async function vercelHandler(req: any, res: any) {
  // The handler expects Node/Express-like req/res; simply forward the call.
  return handler(req, res);
}
