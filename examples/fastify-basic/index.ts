// AnkrForja — minimal Fastify example
// Wires STATE + TRUST + SENSE + ANNOUNCE from codex.json in one call.
// Run: npx ts-node index.ts

import Fastify from 'fastify'
import { codexAgent } from 'ankr-forja'

const app = Fastify({ logger: true })

// Wire all four Forja layers — reads ./codex.json automatically
await codexAgent(app, {
  codexPath: './codex.json',
  codexUrl: process.env.CODEX_URL ?? 'http://localhost:4585',
})

// Your application routes go here
app.get('/api/bookings/:id', async (req, reply) => {
  const { id } = req.params as { id: string }
  return reply.send({ booking_id: id, status: 'confirmed', vessel: 'MV ANKR PIONEER' })
})

app.post('/api/bookings', async (req, reply) => {
  // In production: check trust tier before executing
  return reply.code(201).send({ booking_id: 'BK-2026-001', status: 'created' })
})

await app.listen({ port: 4000, host: '0.0.0.0' })

// After startup, your service exposes:
//   GET  /api/v2/forja/state   — capability manifest (crawled by AnkrCodex)
//   GET  /api/v2/forja/trust   — permission matrix + kill switch config
//   GET  /api/v2/forja/sense   — real-time health snapshot (unauthenticated)
//   POST /api/v2/forja/trust/restore — kill switch restore (human_session_token required)
