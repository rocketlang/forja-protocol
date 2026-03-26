# ankr-forja

**The knowledge exchange protocol for AI-native services.**

STATE + TRUST + SENSE + ANNOUNCE. One `codexAgent()` call wires all four layers from your `codex.json`.

[![npm](https://img.shields.io/npm/v/ankr-forja)](https://www.npmjs.com/package/ankr-forja)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)
[![Topics](https://img.shields.io/badge/topics-ai--protocol%20agent--native%20fastify--plugin-informational)](#)

```bash
npm install ankr-forja
```

---

## The Problem

At 200+ AI-native services, string-based capability discovery equals hallucination.

An orchestrator asks: *"which of these 200 services can create a booking?"* MCP tool schemas consume ~55,000 tokens to load across that fleet. Parsing, matching, interpreting — each step is a failure mode. At scale, interpretation **is** hallucination.

The solution is binary truth: a service declares exactly what it knows and can do. No inference needed.

```
(trust_mask & BOOK) !== 0
```

That expression is a proof. Either the bit is set or it isn't.

---

## Why Not MCP?

| | MCP | AnkrForja |
|---|---|---|
| Discovery payload | ~55,000 tokens per tool schema | ~800 bytes per service |
| Capability check | String matching + interpretation | Bitwise AND — one CPU instruction |
| Hallucination surface | Exists (parsing, matching) | None (binary) |
| Runtime overhead | Token budget per call | Sub-millisecond across 200 services |
| Agent safety | No built-in kill switch | Kill switch at 2% error rate, self-escalation prevention |

Forja is not a replacement for MCP tool invocation. It is the discovery and authorisation layer that sits **before** invocation — so agents know what to call before spending tokens on schemas.

---

## Quick Start

```typescript
import Fastify from 'fastify'
import { codexAgent } from 'ankr-forja'

const app = Fastify()
await codexAgent(app, { codexPath: './codex.json' })
await app.listen({ port: 4000 })
```

Your service now exposes four endpoints and announces itself to any AnkrCodex crawler. No docs needed.

---

## The Four Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v2/forja/state` | GET | Capability manifest — `can_answer`, `can_do`, `emits`, knowledge block, dependencies |
| `/api/v2/forja/trust` | GET | Permission matrix — action tiers, kill switch config, self-escalation prevention |
| `/api/v2/forja/sense` | GET | Real-time health snapshot — error rate, uptime, AI traffic %, knowledge drift score |
| `/api/v2/forja/trust/restore` | POST | Kill switch restore — requires `human_session_token` |

Conformance levels: **BASIC** (STATE only) · **STANDARD** (STATE + TRUST) · **FULL** (all four + ANNOUNCE)

---

## codex.json

Forja reads your service's `codex.json` at startup. This file is also the AnkrCodex crawler's entry point — no other documentation is required.

```json
{
  "service": "portwatch-backend",
  "port": 4080,
  "domain": "maritime-port",
  "version": "1.2.0",
  "can_answer": ["vessel.ukc-status", "vessel.cpa-alert", "berth.availability"],
  "can_do": ["MOVEMENT_AUTHORITY", "ALERT_ACK", "BERTH_ASSIGN"],
  "emits": ["ukc-breach", "cpa-alert", "vessel-arrival"],
  "depends_on": ["mari8x-backend", "ankr-codex"],
  "forja_state": "/api/v2/forja/state",
  "forja_trust": "/api/v2/forja/trust",
  "forja_sense": "/api/v2/forja/sense",
  "forja_proof": "/api/v2/forja/proof",
  "forja_version": "2.0"
}
```

`can_answer` = READ surface (queries the service can answer).
`can_do` = WRITE surface (actions the service can execute).
`can_answer` in `codex.json` and in the STATE response must stay in sync.

---

## Trust Bitmask

Pair with [`ankr-trust-constants`](https://github.com/ankrlabs/trust-constants) for zero-interpretation capability checks:

```typescript
import { BOOK, MANIFEST, BL_ISSUE, hasPerm, hasAllPerms } from 'ankr-trust-constants'

const trust = await fetch('/api/v2/forja/trust').then(r => r.json())

// Single permission — is this agent allowed to create bookings?
if (hasPerm(trust.trust_mask, BOOK)) {
  // binary truth — no string matching, no interpretation
}

// Multiple permissions — can this agent issue a Bill of Lading?
if (hasAllPerms(trust.trust_mask, MANIFEST | BL_ISSUE)) {
  // both bits must be set
}
```

The 32-bit allocation:

```
Bits 0-7   — Universal Forja    READ, QUERY, WRITE, EXECUTE, APPROVE, AUDIT, ADMIN, SUPER
Bits 8-15  — Maritime 8x block  BOOK, MANIFEST, BL_ISSUE, RATE_DESK, FEEDER_OPS, NETWORK_PLAN, VESSEL_OPS, COMPLIANCE_OVERRIDE
Bits 16-23 — Logistics block    GATE_IN, TRACK, FTA_CHECK, ALERT_ACK, PORT_OPS, [reserved×3]
Bits 24-31 — AGI autonomy tier  AI_READ, AI_QUERY, AI_SUGGEST, AI_EXECUTE, AI_APPROVE, AUTONOMOUS, [reserved×2]
```

One integer encodes the full permission surface of any service. No string arrays. No parsing.

---

## Agent Safety

Forja has two safety mechanisms built into every wired service:

**Kill switch** — if the error rate exceeds the threshold (default 2%), the trust tier drops to `read-only` automatically. Requires a `human_session_token` to restore.

**Self-escalation prevention (FRJ-011)** — an AI agent cannot request a trust tier higher than the one it was issued. Any attempt is rejected with `FRJ-011` and the attempt count is visible in the SENSE snapshot.

---

## Used in Production

205+ services across the ANKR maritime platform run on this protocol:

- Voyage intelligence and charter party management
- Electronic Bill of Lading (MLETR-compliant)
- VTS port congestion and berth analytics
- Crew management and HRMS
- Maritime BFC (trade finance)

Domain: maritime. Platform: India. Stack: Fastify + Prisma + PostgreSQL.

---

## Full API Reference

### `codexAgent(app, opts)` — recommended v0.2 entry point

Reads `codex.json`, registers all four Forja layers, sends `announce` on ready, `offline` on graceful shutdown.

```typescript
const agent = await codexAgent(app, {
  codexPath: './codex.json',           // default: ./codex.json
  codexUrl: 'http://localhost:4585',   // AnkrCodex URL
  routePrefix: '/api/v2/forja',        // default
  ttlHours: 168,                       // announce TTL — 7 days default
  killSwitchThreshold: 0.02,           // 2% error rate default
  silent: false,
})
```

### `forjaPlugin` — lower-level Fastify plugin

```typescript
await app.register(forjaPlugin, {
  serviceId: 'org.ankrlabs.my-service',
  domain: 'maritime',
  capabilities: [...],    // optional — auto-derived from routes if omitted
  actionTiers: [...],     // optional — smart defaults applied by HTTP method
})
```

### `ForjaCodexClient` — query the Codex from an orchestrator

```typescript
const client = new ForjaCodexClient({ codexUrl: 'http://localhost:4585' })
const services = await client.findByCapability('BOOK')
const state = await client.getNetworkState()
```

---

## Protocol

AnkrForja is an open protocol (Apache 2.0). Any service in any language can implement it. The contract is the four endpoint shapes — not this library.

Conformance test suite: `npx ankr-forja-conformance` (see [CONFORMANCE.md](CONFORMANCE.md))

Full specification: [ANKR-FORJA-SPEC-v0.2](https://github.com/ankrlabs/forja/blob/main/CONFORMANCE.md)

---

## Related

- [`ankr-trust-constants`](https://github.com/ankrlabs/trust-constants) — 32-bit bitmask constants. `npm install ankr-trust-constants`
- [AnkrCodex](https://github.com/ankrlabs/ankr-labs-nx) — centralised capability registry. Crawls Forja STATE across the service fleet.

---

## GitHub Topics

`ai-protocol` `agent-native` `fastify-plugin` `maritime-ai` `llm` `mcp-alternative`

---

## License

Apache 2.0 — open protocol. Anyone implements it.

---

*Built by [ANKR Labs](https://ankr.in) | PowerPbox IT Solutions Pvt Ltd*
*Capt. Anil Kumar Sharma — capt.anil.sharma@powerpbox.org*
