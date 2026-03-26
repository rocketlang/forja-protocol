# AnkrForja Conformance

A Forja-compliant service exposes four endpoints at a standard prefix and returns responses that match the defined schemas. This document specifies exactly what is required at each conformance level.

---

## Conformance Levels

| Level | Endpoints required | Suitable for |
|---|---|---|
| **BASIC** | STATE | Read-only services, static registries |
| **STANDARD** | STATE + TRUST | Services with role-based access |
| **FULL** | STATE + TRUST + SENSE + ANNOUNCE | Production AI-native services |

The `ankr-forja` npm package achieves **FULL** conformance with a single `codexAgent()` call.

---

## Default Route Prefix

```
/api/v2/forja
```

Override with `routePrefix` option. The prefix must be consistent across all four endpoints on a given service.

---

## Required Endpoints

### 1. STATE — `GET /api/v2/forja/state`

Returns the service's capability manifest. This is what AnkrCodex crawls. This is what orchestrators query.

**Required response fields:**

```typescript
{
  forja_version: string,          // "0.1" or "0.2"
  identity: {
    id: string,                   // globally unique service ID, e.g. "org.ankrlabs.portwatch"
    name: string,
    version: string,
    domain: string,               // e.g. "maritime-port"
    owner: string,
  },
  capabilities: Array<{
    id: string,                   // slug, e.g. "vessel.ukc-status"
    name: string,
    type: "query" | "action" | "event",
    description: string,
  }>,
  knowledge: {
    rule_count: number,
    certified_count: number,
    last_updated: string,         // ISO 8601
  },
  dependencies: Array<{
    service_id: string,
    health_impact: "critical" | "degraded" | "none",
  }>,
  ai_surface: {
    queryable: Array<{ id: string, description: string }>,
    actionable: Array<{ id: string, trust_tier_required: 0 | 1 | 2 | 3, description?: string }>,
    restricted: Array<{ id: string, reason: string }>,
  },
}
```

**Conformance rules:**
- `can_answer` slugs in `codex.json` must appear in `ai_surface.queryable`
- `can_do` action IDs in `codex.json` must appear in `ai_surface.actionable`
- `forja_version` must be a non-empty string
- `identity.id` must be unique across the service fleet
- Response must be returned with HTTP 200 and `Content-Type: application/json`

---

### 2. TRUST — `GET /api/v2/forja/trust`

Returns the service's permission contract: action tiers, kill switch configuration, and self-escalation prevention status.

**Required response fields:**

```typescript
{
  forja_version: string,
  service_id: string,
  default_tier: 0,                // FRJ-005: deny-by-default — always 0
  action_tiers: Array<{
    action_id: string,
    action_type: string,
    tier: 0 | 1 | 2 | 3,         // 0=off, 1=read-only, 2=low-risk, 3=full
    description?: string,
    rollback_descriptor?: string, // required for tier 2+ DELETE actions
  }>,
  kill_switch: {
    enabled: boolean,
    error_rate_threshold: number, // e.g. 0.02 for 2%
    fallback_tier: 0 | 1 | 2 | 3,
  },
  self_escalation_prevention: {
    enabled: true,                // must be true — FRJ-011
    rejection_code: "FRJ-011",
  },
}
```

**Conformance rules:**
- `default_tier` must be `0` — deny-by-default is not optional (FRJ-005)
- `self_escalation_prevention.enabled` must be `true` — this is not configurable (FRJ-011)
- `trust_mask` — if present, must be a 32-bit integer conforming to the [ANKR bit allocation](https://github.com/ankrlabs/trust-constants). Import bit constants from `ankr-trust-constants` — never hardcode magic numbers.
- Services that include `trust_mask` in TRUST responses must keep it in sync with `action_tiers`

**Trust tiers:**

| Tier | Meaning | Default for |
|---|---|---|
| 0 | Off — human-only, no agent access | `/admin/*` routes |
| 1 | Read-only — observe, query, no side effects | `GET` routes |
| 2 | Low-risk write — reversible actions | `POST`, `PUT`, `PATCH` routes |
| 3 | Full — irreversible or high-blast-radius | Escalated on explicit human authorisation |

---

### 3. SENSE — `GET /api/v2/forja/sense`

Returns a real-time health and operational snapshot. Must be unauthenticated — any agent or monitoring tool can query it without credentials (FRJ-013).

**Required response fields:**

```typescript
{
  forja_version: string,
  service_id: string,
  timestamp: string,              // ISO 8601, current time
  health: {
    score: number,                // 0.0–1.0
    status: "healthy" | "degraded" | "critical" | "unknown",
    error_rate: number,           // 0.0–1.0
    uptime_seconds: number,
  },
  velocity: {
    requests_per_minute: number,
    ai_agent_traffic_pct: number, // 0.0–1.0
    total_requests: number,
  },
  security: {
    current_trust_tier: 0 | 1 | 2 | 3,
    kill_switch_active: boolean,
    self_escalation_attempt_count: number,
  },
  knowledge_drift: {
    stale_rules: number,
    last_rule_update: string,     // ISO 8601
    conflict_count: number,
    drift_score: number,          // 0.0–1.0, 0 = fully certified
  },
}
```

**Conformance rules:**
- Must return HTTP 200 even when `kill_switch_active: true`
- `health.score` is informational — no defined formula required, but must be in [0.0, 1.0]
- No authentication header required — enforced at the routing level

---

### 4. ANNOUNCE — `POST /api/v2/forja/announce` (on AnkrCodex, not on the service)

ANNOUNCE is a push event sent **by the service** to the AnkrCodex registry. The service calls Codex's announce endpoint — it does not expose one itself.

**Payload sent by the service:**

```typescript
{
  forja: "0.2",
  event: "announce" | "update" | "offline",
  service: {
    id: string,
    port: number,
    domain: string,
    version: string,
  },
  capabilities: {
    can_answer: string[],
    can_do: string[],
    emits: string[],
  },
  announced_at: string,           // ISO 8601
  ttl_hours: number,              // default 168 (7 days)
}
```

**Conformance rules:**
- `announce` sent on service ready
- `offline` sent on graceful shutdown
- `update` sent when capabilities change at runtime
- TTL refresh is the service's responsibility — Codex may evict after TTL expires
- `codexAgent()` handles all three automatically

---

## Conformance Test Suite

```bash
npx ankr-forja-conformance http://localhost:4000
```

Output:

```
AnkrForja Conformance v0.2
Target: http://localhost:4000

[STATE]  GET /api/v2/forja/state          ✓  200 OK
[STATE]  forja_version present            ✓
[STATE]  identity.id present              ✓
[STATE]  can_answer → ai_surface.queryable ✓
[STATE]  can_do → ai_surface.actionable   ✓

[TRUST]  GET /api/v2/forja/trust          ✓  200 OK
[TRUST]  default_tier === 0              ✓  FRJ-005
[TRUST]  self_escalation_prevention.enabled ✓  FRJ-011

[SENSE]  GET /api/v2/forja/sense          ✓  200 OK (unauthenticated)
[SENSE]  health.score in [0.0, 1.0]      ✓
[SENSE]  security.kill_switch_active     ✓  false

Conformance level: FULL
```

The conformance CLI is planned for a future release. In the interim, validate manually against the schemas in this document.

---

## Quick Validation (curl)

```bash
# STATE — does this service know what it knows?
curl -s http://localhost:4000/api/v2/forja/state | jq '{id: .identity.id, can_answer: .ai_surface.queryable | length, can_do: .ai_surface.actionable | length}'

# TRUST — is deny-by-default enforced?
curl -s http://localhost:4000/api/v2/forja/trust | jq '{default_tier, fRJ_011: .self_escalation_prevention.enabled}'

# SENSE — is the kill switch off?
curl -s http://localhost:4000/api/v2/forja/sense | jq '{status: .health.status, kill_switch: .security.kill_switch_active}'
```

---

## Non-Fastify Implementations

Any language or framework can be Forja-compliant. The contract is the response shapes above — not the `ankr-forja` npm package. Implement the four endpoint schemas, return correct `Content-Type: application/json`, and you pass conformance.

Reference implementation (Fastify/TypeScript): [`ankr-forja` on npm](https://www.npmjs.com/package/ankr-forja)

---

*AnkrForja Protocol v0.2 | Apache 2.0 | ANKR Labs*
