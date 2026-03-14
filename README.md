# AnkrForja Protocol

**AI Governance for Production Services**

AnkrForja is an open protocol that gives every service a machine-readable contract for what it knows, what it allows AI agents to do, and how it's performing right now.

Three endpoints. Three schemas. One rule: silence is not permission.

---

## The Three Layers

```
GET /forja/state    →  What this service is and what it knows
GET /forja/trust    →  What AI agents are permitted to do
GET /forja/sense    →  How this service is performing right now
```

### FORJA/STATE — Identity and Capability

Every Forja-compliant service publishes a STATE manifest. It declares:

- **Identity**: who this service is, what domain it operates in
- **Capabilities**: what it can do and which domain rules govern each capability
- **Knowledge**: how many certified rules it holds and when they were last reviewed
- **Dependencies**: what it depends on and what breaks if those dependencies go down
- **AI Surface**: exactly which surfaces agents can read, which they can write, and which are permanently off-limits

```json
{
  "forja_version": "0.1",
  "identity": {
    "id": "org.example.voyage-service",
    "name": "Voyage Management Service",
    "domain": "maritime"
  },
  "ai_surface": {
    "queryable": [{ "id": "voyage-list", "description": "List all voyages." }],
    "actionable": [{ "id": "voyage-create", "trust_tier_required": 2 }],
    "restricted": [{ "id": "voyage-delete", "reason": "Destructive. Human-only." }]
  }
}
```

### FORJA/TRUST — Per-Action Trust Tiers

Trust is declared per action, not per service. A service can be read-only for one action and write-capable for another. The default for any undeclared action is Tier 0 (off). Silence is not permission.

| Tier | Name | What AI can do |
|------|------|----------------|
| 0 | Off | Nothing. Human approval required for all actions. |
| 1 | Read-only | Query and read. No state changes. |
| 2 | Low-risk write | State changes with rollback descriptor + pre-logging. |
| 3 | Full autonomy | High-stakes actions. Kill switch mandatory. Human review on tier grant. |

**Kill switch**: if `SENSE.error_rate` exceeds the declared threshold, AI autonomy is automatically suspended. No human needed to trigger it. Human needed to restore it.

```json
{
  "default_tier": 0,
  "kill_switch": { "enabled": true, "error_rate_threshold": 0.02, "fallback_tier": 1 },
  "self_escalation_prevention": { "enabled": true, "rejection_code": "FRJ-011" }
}
```

### FORJA/SENSE — Live Operational Intelligence

SENSE is unauthenticated. Any agent in the network can query it. It reports:

- **Health**: composite score 0–1, status, error rate (the canonical kill switch signal)
- **Velocity**: requests per minute, AI agent traffic vs human traffic
- **Security**: current trust tier, kill switch state, self-escalation attempt count
- **Knowledge drift**: how stale the service's domain rules are

```json
{
  "health": { "score": 0.97, "status": "healthy", "error_rate": 0.003 },
  "security": { "current_trust_tier": 2, "kill_switch_active": false },
  "knowledge_drift": { "stale_rules": 2, "conflict_count": 0, "drift_score": 0.08 }
}
```

---

## Getting Started

**Minimum viable Forja service: 30 minutes.**

### Step 1 — Publish a STATE manifest (10 min)

Add one endpoint to your service:

```typescript
app.get('/forja/state', () => ({
  forja_version: '0.1',
  identity: { id: 'org.example.my-service', name: 'My Service', version: '1.0.0', domain: 'your-domain', owner: 'Your Team' },
  capabilities: [{ id: 'data-query', name: 'Data Query', type: 'query', description: 'Query service data.' }],
  knowledge: { rule_count: 0, certified_count: 0, last_updated: new Date().toISOString() },
  dependencies: [],
  ai_surface: {
    queryable: [{ id: 'data-query', description: 'Read-only data query.' }],
    actionable: [],
    restricted: [{ id: 'admin-delete', reason: 'Destructive. Human-only.' }],
  },
}));
```

Validate against the schema:
```bash
npx ajv validate -s schemas/forja-state-schema.json -d your-state.json
```

### Step 2 — Declare a TRUST contract (10 min)

```typescript
app.get('/forja/trust', () => ({
  forja_version: '0.1',
  service_id: 'org.example.my-service',
  default_tier: 0,                          // deny-by-default
  action_tiers: [
    { action_id: 'data-query', action_type: 'query', tier: 1 },  // read-only OK
  ],
  kill_switch: { enabled: true, error_rate_threshold: 0.02, fallback_tier: 1 },
  self_escalation_prevention: { enabled: true, rejection_code: 'FRJ-011' },
}));
```

### Step 3 — Emit a SENSE snapshot (10 min)

```typescript
app.get('/forja/sense', async () => ({
  forja_version: '0.1',
  service_id: 'org.example.my-service',
  timestamp: new Date().toISOString(),
  health: { score: 0.99, status: 'healthy', error_rate: 0 },
  velocity: { requests_per_minute: myMetrics.rpm },
  security: { current_trust_tier: 1, kill_switch_active: false },
  knowledge_drift: { stale_rules: 0, last_rule_update: new Date().toISOString(), conflict_count: 0 },
}));
```

You are now Forja/STATE + Forja/TRUST + Forja/SENSE compliant. Conformance level: `full`.

---

## Conformance Levels

A service can adopt Forja incrementally. Each layer is binary — either conforming or not.

| Level | Layers | What you get |
|-------|--------|--------------|
| `state-only` | STATE | Agents can discover and understand your service |
| `state-trust` | STATE + TRUST | Agents can act within declared tiers with kill switch protection |
| `full` | STATE + TRUST + SENSE | Full protocol — knowledge drift detection, live operational transparency |

---

## Key Rules

| Rule | Statement |
|------|-----------|
| FRJ-005 | Silence is not permission. Default tier is 0 (off) for any undeclared action. |
| FRJ-008 | Every Tier 2+ action must have a rollback descriptor before execution. |
| FRJ-011 | No AI agent may escalate its own trust tier. Human authorization required. |
| FRJ-013 | SENSE is unauthenticated. Operational honesty is public by design. |
| FRJ-022 | SENSE `error_rate` is the canonical kill switch signal. Not independently computed. |
| FRJ-024 | Compliance is binary per layer. There is no "mostly compliant." |

Full rule set: [FORJA-SPEC-v0.1.md](./docs/FORJA-SPEC-v0.1.md) | [LOGICS](./docs/ANKR-FORJA-LOGICS.md) (50 rules: Shastra + Yukti + Viveka)

---

## Schemas

| Schema | Purpose |
|--------|---------|
| [`schemas/forja-state-schema.json`](./schemas/forja-state-schema.json) | SERVICE STATE manifest — identity, capabilities, ai_surface |
| [`schemas/forja-trust-schema.json`](./schemas/forja-trust-schema.json) | TRUST contract — tiers, kill switch, self-escalation prevention |
| [`schemas/forja-sense-schema.json`](./schemas/forja-sense-schema.json) | SENSE snapshot — health, velocity, security, knowledge drift |

All schemas: JSON Schema Draft-07, Apache 2.0.

---

## AnkrForja × AnkrGrid

When a node participates in both AnkrGrid (compute routing) and AnkrForja (knowledge governance), routing becomes knowledge-aware.

- **Grid-only node**: compute can route through it. No knowledge context available.
- **Grid+Forja node**: compute routes through it AND agents can query its STATE. If two nodes have equivalent compute capacity, the node with more certified domain knowledge wins the routing decision.

This is FRJ-021 and FRJ-YK-008 in practice: knowledge breaks compute ties.

---

## Reference Implementation

ANKR Labs runs AnkrForja in production across 151+ services. The reference implementation is the AnkrCodex daemon — it synthesizes STATE, TRUST, and SENSE for every service in the ANKR network from a single crawl.

Endpoints:
```
GET :4585/forja/state/:serviceId
GET :4585/forja/network/state
GET :4585/forja/trust/:serviceId
GET :4585/forja/trust/history
POST :4585/forja/trust/check-escalation
GET :4585/forja/sense/:serviceId
POST :4585/forja/sense/:serviceId/snapshot
```

---

## License

Apache 2.0. AnkrForja belongs to no one. Implement it freely.

---

*ANKR Labs | Powerp Box IT Solutions Pvt Ltd | Gurgaon*
*Built 2026-03-14*
