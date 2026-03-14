# AnkrForja Conformance Checklist

Use this checklist to verify your service before claiming a conformance level.

---

## Level 1 — `state-only`

### STATE Manifest (`GET /forja/state`)

- [ ] Endpoint exists and returns 200
- [ ] Response is valid JSON
- [ ] `forja_version` field present (currently `"0.1"`)
- [ ] `identity.id` is a globally unique reverse-domain string (e.g. `org.example.my-service`)
- [ ] `identity.name` is human-readable
- [ ] `identity.domain` matches your service's operational domain
- [ ] `identity.owner` is declared
- [ ] `capabilities` array has at least one entry
- [ ] Each capability has `id`, `name`, `type` (query/action/event), `description`
- [ ] `knowledge.rule_count` reflects the number of domain rules this service knows
- [ ] `knowledge.certified_count` reflects certified-only count
- [ ] `knowledge.last_updated` is an ISO 8601 timestamp
- [ ] `dependencies` array is present (may be empty)
- [ ] Each dependency has `service_id`, `health_impact` (critical/degraded/none), `fallback`
- [ ] `ai_surface.queryable` lists all read-safe endpoints
- [ ] `ai_surface.actionable` lists write endpoints with `trust_tier_required`
- [ ] `ai_surface.restricted` lists human-only endpoints with `reason`
- [ ] No undeclared endpoints exist that agents could accidentally discover
- [ ] Schema validates against `schemas/forja-state-schema.json`

```bash
npx ajv validate -s schemas/forja-state-schema.json -d <(curl -s http://localhost:<PORT>/forja/state)
```

---

## Level 2 — `state-trust`

All Level 1 checks, plus:

### TRUST Contract (`GET /forja/trust`)

- [ ] Endpoint exists and returns 200
- [ ] `default_tier` is `0` (deny-by-default — FRJ-005)
- [ ] `action_tiers` array covers every actionable surface declared in STATE
- [ ] No undeclared action has a tier above 0 (silence = off)
- [ ] `kill_switch.enabled` is `true` for any service with Tier 2+ actions
- [ ] `kill_switch.error_rate_threshold` is ≤ 0.05 (recommended ≤ 0.02)
- [ ] `kill_switch.fallback_tier` is declared
- [ ] `self_escalation_prevention.enabled` is `true` (FRJ-011)
- [ ] `self_escalation_prevention.rejection_code` is `"FRJ-011"`
- [ ] Every Tier 2+ action has a rollback descriptor at execution time (FRJ-008)
- [ ] Trust tier changes are logged with `authorized_by` and human session token
- [ ] Schema validates against `schemas/forja-trust-schema.json`

```bash
npx ajv validate -s schemas/forja-trust-schema.json -d <(curl -s http://localhost:<PORT>/forja/trust)
```

---

## Level 3 — `full`

All Level 1 + Level 2 checks, plus:

### SENSE Snapshot (`GET /forja/sense`)

- [ ] Endpoint exists and returns 200
- [ ] Endpoint is **unauthenticated** (no auth headers required — FRJ-013)
- [ ] `health.score` is between 0 and 1
- [ ] `health.status` reflects actual operational state
- [ ] `health.error_rate` is derived from actual request logs (FRJ-022)
- [ ] `health.error_rate` is the canonical kill switch signal — not computed separately
- [ ] `velocity.requests_per_minute` reflects real traffic
- [ ] `velocity.ai_agent_traffic_pct` is tracked separately from human traffic
- [ ] `security.current_trust_tier` matches the active tier (post-kill-switch evaluation)
- [ ] `security.kill_switch_active` reflects current kill switch state
- [ ] `knowledge_drift.stale_rules` is computed from rule last-reviewed dates
- [ ] `knowledge_drift.drift_score` is between 0 and 1
- [ ] SENSE data is ≤ 60 seconds stale at time of response
- [ ] SENSE snapshot is captured before any rollback execution (FRJ-YK-009)
- [ ] Schema validates against `schemas/forja-sense-schema.json`

```bash
npx ajv validate -s schemas/forja-sense-schema.json -d <(curl -s http://localhost:<PORT>/forja/sense)
```

---

## Rule Compliance Matrix

| Rule | Description | Check |
|------|-------------|-------|
| FRJ-005 | Default tier = 0. Silence is not permission. | `default_tier: 0` in TRUST contract |
| FRJ-008 | Rollback descriptor mandatory for Tier 2+ | Present on every low-risk/full action |
| FRJ-011 | No AI self-escalation | `self_escalation_prevention.enabled: true` |
| FRJ-013 | SENSE is unauthenticated | `/forja/sense` returns 200 without auth |
| FRJ-019 | Knowledge drift tracked | `knowledge_drift` block present in SENSE |
| FRJ-022 | `error_rate` is canonical kill switch signal | Kill switch reads from SENSE, not separately |
| FRJ-024 | Conformance is binary per layer | No "partial" STATE or "partial" TRUST |

---

*Full rule set: [FORJA-SPEC-v0.1.md](./FORJA-SPEC-v0.1.md) — 50 rules across Shastra, Yukti, Viveka layers.*
