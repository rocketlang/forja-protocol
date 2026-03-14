# AnkrForja Protocol Specification
## Version 0.1

**Document**: FORJA-SPEC-v0.1
**Date**: 2026-03-14
**Status**: Candidate
**License**: Apache 2.0 — open specification, no permission required
**Author**: ANKR Labs | Powerp Box IT Solutions Pvt Ltd, Gurgaon
**Schemas**: `forja-state-schema.json` | `forja-trust-schema.json` | `forja-sense-schema.json`

---

> *AnkrForja is not a deployment tool. It is not a monitoring tool. It is not a service registry.*
> *It is a protocol for knowledge exchange between AI-operated services.*
> *The grammar for what services know, what agents may do, and what the network can observe.*

---

## 1. What This Document Is

This specification defines the AnkrForja protocol. It is sufficient to implement a conforming Forja node.

A developer with no prior knowledge of ANKR Labs, AnkrCodex, or any internal ANKR system can read this document and build a Forja-compliant service. That is the test. If any section fails that test, the specification has a gap.

---

## 2. The Problem This Protocol Solves

AI agents are operating on services they cannot understand.

A coding agent generates a service. The service runs. Six months later, 200 services exist. A new agent needs to interact with them. It has no structured way to know:

- What any service is for
- What the service knows about its domain
- What the agent is allowed to do
- Whether the service is healthy right now
- Whether the service's domain knowledge is current

This is not a documentation problem. Documentation is written by humans for humans. It decays. It lies. It cannot be queried.

AnkrForja makes services self-declaring in a machine-readable protocol that agents can consume directly.

---

## 3. The Three Protocol Layers

```
┌─────────────────────────────────────────────────────┐
│              FORJA/STATE                            │
│   What the service is. What it knows. What it       │
│   can do. Who depends on it. What AI can see.       │
├─────────────────────────────────────────────────────┤
│              FORJA/TRUST                            │
│   What AI agents may do. At what tier. Under what   │
│   conditions. With what kill switch.                │
├─────────────────────────────────────────────────────┤
│              FORJA/SENSE                            │
│   What is happening right now. Health. Errors.      │
│   Throughput. Knowledge drift. Security posture.    │
│   Public. Unauthenticated. Always on.               │
└─────────────────────────────────────────────────────┘
```

Each layer is independently adoptable. Each layer is all-or-nothing within itself — partial compliance is non-compliance. (FRJ-024)

---

## 4. Trust Tier System

All AI agent permissions are governed by four tiers:

| Tier | Name | What AI May Do |
|------|------|----------------|
| 0 | Off | Nothing. No AI access. |
| 1 | Read-Only | Query and observe. No state change. |
| 2 | Low-Risk Write | State-changing actions with rollback descriptor and logging. |
| 3 | Full Autonomy | All declared actions, including irreversible ones. |

**Critical rules:**
- Trust is declared per action, not per service globally. (FRJ-004)
- Any undeclared action defaults to Tier 0. Silence is not permission. (FRJ-005)
- No AI agent may escalate its own tier. (FRJ-011)
- Tier changes require human authorization and must be logged. (FRJ-015)
- Kill switch fires at declared error_rate threshold. Auto-drops to fallback tier. (FRJ-010, FRJ-022)

---

## 5. FORJA/STATE — Full Specification

### 5.1 Endpoint

```
GET /forja/state
```

Returns: JSON conforming to `forja-state-schema.json`
Authentication: Required (caller must be authenticated)
Caching: Max 60 seconds

### 5.2 Required Fields

A STATE manifest that omits any required field is non-conforming.

```json
{
  "forja_version": "0.1",

  "identity": {
    "id":          "org.example.myservice",   // globally unique, reverse-domain
    "name":        "My Service — Purpose",
    "version":     "1.0.0",
    "domain":      "maritime",
    "owner":       "Team Name"
  },

  "capabilities": [
    {
      "id":    "capability-id",
      "name":  "Capability Name",
      "type":  "query"              // query|mutation|subscription|webhook|batch|stream
    }
  ],

  "knowledge": {
    "rule_count":       47,
    "certified_count":  15,
    "last_updated":     "2026-03-14T00:00:00Z"   // ISO 8601 — freshness signal
  },

  "dependencies": [
    {
      "id":            "org.example.dep",
      "health_impact": "critical"    // critical|degraded|cosmetic
    }
  ],

  "ai_surface": {
    "queryable":   [...],   // AI can read — Tier 1 minimum
    "actionable":  [...],   // AI can act — Tier 2+ required, trust_tier_required declared
    "restricted":  [...]    // No AI access — ever. Reason declared.
  }
}
```

### 5.3 Knowledge Block

The knowledge block connects the STATE manifest to the SuperDomain rule registry.

- `rule_count`: Total rules declared (candidate + certified)
- `certified_count`: Rules reviewed and certified by a human domain expert
- `certified_rule_ids`: Explicit list of certified rule IDs
- `last_updated`: Last time any rule was reviewed

Domain knowledge in STATE must reference certified rule IDs. Raw text assertions are not knowledge under this protocol. (FRJ-012)

### 5.4 AI Surface Declaration

Three categories are required. A service with no `restricted` surface is making a strong claim:

```json
"ai_surface": {
  "queryable": [
    {
      "id": "voyage-list",
      "description": "List voyages with status.",
      "knowledge_rules": ["LAY-001"]   // which rules govern the returned data
    }
  ],
  "actionable": [
    {
      "id": "laytime-submit",
      "description": "Submit laytime statement.",
      "trust_tier_required": 2,
      "inherently_irreversible": false
    }
  ],
  "restricted": [
    {
      "id": "admin-delete-user",
      "reason": "Destructive. Human-only."
    }
  ]
}
```

`inherently_irreversible: true` must be declared before execution, not discovered after. (FRJ-008)

---

## 6. FORJA/TRUST — Full Specification

### 6.1 Endpoint

```
GET /forja/trust
```

Returns: JSON conforming to `forja-trust-schema.json`
Authentication: Required
Caching: Max 5 seconds (trust state changes rapidly)

### 6.2 Required Fields

```json
{
  "forja_version": "0.1",
  "service_id":    "org.example.myservice",
  "default_tier":  0,           // deny-by-default — MUST be 0

  "action_tiers": [
    {
      "action_id":                 "voyage-list",
      "action_type":               "query",
      "tier":                      1,
      "requires_rollback_descriptor": false,
      "inherently_irreversible":   false,
      "log_before_execute":        false
    },
    {
      "action_id":               "laytime-submit",
      "action_type":             "write",
      "tier":                    2,
      "requires_rollback_descriptor": true,   // mandatory for Tier 2+
      "log_before_execute":      true          // mandatory for Tier 2+
    }
  ],

  "kill_switch": {
    "enabled":               true,     // required for Tier 2+ services
    "error_rate_threshold":  0.02,     // 2% default
    "fallback_tier":         1
  }
}
```

### 6.3 Kill Switch Requirements

Any service operating at Tier 2 or above MUST declare a kill switch. (FRJ-010)

The kill switch monitors `FORJA/SENSE.health.error_rate`. When `error_rate` crosses `kill_switch.error_rate_threshold`, the service automatically drops to `kill_switch.fallback_tier`. This is automatic. It does not wait for human instruction.

Re-escalation after kill switch fires requires human authorization. (FRJ-009)

### 6.4 Action Logging Requirements

For Tier 2 and Tier 3 actions:

1. **Log entry must be written before the action executes.** (FRJ-007)
2. **Log entry must include a rollback descriptor.** (FRJ-008)
3. **Rollback execution requires a human session token.** (FRJ-009)

Log schema minimum:
```json
{
  "action_id":              "laytime-submit",
  "service_id":             "org.example.myservice",
  "agent_id":               "agent-identifier",
  "tier_used":              2,
  "timestamp_logged":       "2026-03-14T08:30:00Z",
  "rollback_descriptor":    { ... },   // state before + restoration steps
  "outcome":                null       // null until executed
}
```

---

## 7. FORJA/SENSE — Full Specification

### 7.1 Endpoint

```
GET /forja/sense
```

Returns: JSON conforming to `forja-sense-schema.json`
Authentication: **None required.** SENSE is public. (FRJ-013)
Caching: Max 30 seconds

### 7.2 Required Fields

```json
{
  "forja_version": "0.1",
  "service_id":    "org.example.myservice",
  "timestamp":     "2026-03-14T08:30:00Z",

  "health": {
    "score":       0.97,          // 0.0–1.0. Below 0.60 → proactive trust reduction
    "status":      "healthy",     // healthy|degraded|critical|unknown
    "error_rate":  0.003          // CANONICAL kill switch signal (FRJ-022)
  },

  "velocity": {
    "requests_per_minute": 47
  },

  "security": {
    "current_trust_tier": 2       // active tier, may differ from TRUST contract
  },

  "knowledge_drift": {
    "stale_rules":    2,          // rules not reviewed since last domain change
    "last_rule_update": "2026-03-10T14:00:00Z",
    "conflict_count": 0           // open rule conflicts requiring human resolution
  }
}
```

### 7.3 error_rate is Canonical

`health.error_rate` is the single source of truth for kill switch evaluation. (FRJ-022)

Other error rate computations (infrastructure metrics, APM tools) are supplementary signals. They do not trigger the Forja kill switch. Only `FORJA/SENSE.health.error_rate` is authoritative.

### 7.4 Knowledge Drift

Knowledge drift is a first-class SENSE signal — not a monitoring afterthought. (FRJ-019)

```json
"knowledge_drift": {
  "stale_rules":                  2,
  "last_rule_update":             "2026-03-10T14:00:00Z",
  "conflict_count":               0,
  "days_since_last_certification": 4,
  "certified_rule_count":         15,
  "candidate_rule_count":         32,
  "drift_score":                  0.08   // 0.0=no drift, 1.0=critical
}
```

When `drift_score` rises, it should inform trust tier review — not just trigger a knowledge alert. Stale knowledge and trust tier are coupled variables. (FRJ-YK-013)

---

## 8. Conformance Requirements

### 8.1 Compliance is Binary

A service is not "mostly Forja/STATE compliant." For each layer:

- Either the endpoint exists and returns a schema-valid response → **compliant**
- Or it does not → **non-compliant**

Partial compliance is non-compliance. (FRJ-024)

### 8.2 Incremental Adoption

Layers may be adopted incrementally:

| Conformance Level | What is Required |
|-------------------|-----------------|
| `state-only` | `/forja/state` returning valid STATE manifest |
| `state-trust` | STATE + `/forja/trust` returning valid TRUST contract |
| `full` | STATE + TRUST + `/forja/sense` returning valid SENSE schema |

Declare current conformance level in `manifest_meta.conformance_level`.

### 8.3 Conformance Validation

A conformance validator must:

1. Call `GET /forja/state` → validate against `forja-state-schema.json`
2. Call `GET /forja/trust` → validate against `forja-trust-schema.json`
3. Call `GET /forja/sense` → validate against `forja-sense-schema.json` (no auth)
4. Cross-check: `trust.service_id` == `state.identity.id` == `sense.service_id`
5. Cross-check: `state.ai_surface.actionable[*].id` all declared in `trust.action_tiers`
6. Verify: `trust.default_tier` == 0
7. Verify: if any action tier >= 2, `trust.kill_switch.enabled` == true

---

## 9. Schema Files

All three schemas are machine-validatable JSON Schema v7:

| File | Layer | Implements |
|------|-------|------------|
| `forja-state-schema.json` | FORJA/STATE | FRJ-001–003, FRJ-012, FRJ-014, FRJ-018, FRJ-023, FRJ-025 |
| `forja-trust-schema.json` | FORJA/TRUST | FRJ-004–011, FRJ-015 |
| `forja-sense-schema.json` | FORJA/SENSE | FRJ-006, FRJ-013, FRJ-019, FRJ-022 |

All schema files and this specification are licensed Apache 2.0.

---

## 10. Rule Traceability

Every requirement in this specification maps to a rule ID in `ANKR-FORJA-LOGICS_2026-03-14.md`.

A requirement without a rule ID should not exist. A rule ID without a requirement in this specification is a gap to be filled.

| Rule | Location in Spec |
|------|-----------------|
| FRJ-001 | Section 5 — STATE mandatory |
| FRJ-002 | Section 5 — machine-readable |
| FRJ-003 | Section 5.2 — five required fields |
| FRJ-004 | Section 6.2 — per-action trust |
| FRJ-005 | Section 6.2 — default_tier: 0 |
| FRJ-006 | Section 7 — SENSE mandatory |
| FRJ-007 | Section 6.4 — log before execute |
| FRJ-008 | Section 6.4 — rollback descriptor |
| FRJ-009 | Section 6.3 — human token for rollback |
| FRJ-010 | Section 6.3 — kill switch for Tier 2+ |
| FRJ-011 | Section 6, trust_schema — self-escalation prevention |
| FRJ-012 | Section 5.3 — certified rule IDs in knowledge |
| FRJ-013 | Section 7.1 — SENSE unauthenticated |
| FRJ-014 | Sections 5, 6, 7 — forja_version in every schema |
| FRJ-015 | Section 6, trust_schema — tier change logging |
| FRJ-016–017 | Section 5.3, INF-FRJ-003 — conflict flagging |
| FRJ-018 | Section 5.3 — last_updated in knowledge |
| FRJ-019 | Section 7.4 — knowledge_drift in SENSE |
| FRJ-020 | This document — Apache 2.0 |
| FRJ-021 | Companion: ANKR-FORJA-GRID-USECASE |
| FRJ-022 | Section 7.3 — error_rate canonical |
| FRJ-023 | Section 5.4 — three AI surface categories |
| FRJ-024 | Section 8.1 — binary compliance |
| FRJ-025 | Section 5 — service owns manifest accuracy |

---

## 11. Open Protocol Statement

AnkrForja is an open protocol. (FRJ-020)

The specification may be implemented by any party — individual, startup, enterprise, government, research institution — without license, fee, permission, or notification.

ANKR Labs maintains:
- The reference implementation (`ankrlabs/forja-reference` — forthcoming)
- The canonical schema files
- The specification versioning process

ANKR Labs does not own:
- The protocol
- Your implementation
- The knowledge your services declare
- The network that emerges from adoption

The grammar belongs to everyone. The sentences belong to whoever writes them.

---

## 12. Versioning

This specification is version **0.1** — candidate.

Version increments:

| Increment | When |
|-----------|------|
| Patch (0.1.x) | Bug fixes in schema, clarifications |
| Minor (0.x.0) | New optional fields, backward-compatible additions |
| Major (x.0.0) | Breaking changes to required fields or endpoint contracts |

A service declaring `forja_version: "0.1"` is conforming to this specification.

---

## Appendix A — Minimum Viable Forja Service

The smallest possible Forja-compliant service (state-only level):

**`GET /forja/state`** returns:
```json
{
  "forja_version": "0.1",
  "identity": {
    "id": "com.example.hello-service",
    "name": "Hello Service",
    "version": "1.0.0",
    "domain": "example",
    "owner": "Example Team"
  },
  "capabilities": [
    { "id": "hello", "name": "Say Hello", "type": "query" }
  ],
  "knowledge": {
    "rule_count": 0,
    "certified_count": 0,
    "last_updated": "2026-03-14T00:00:00Z"
  },
  "dependencies": [],
  "ai_surface": {
    "queryable": [
      { "id": "hello", "description": "Returns a greeting." }
    ],
    "actionable": [],
    "restricted": []
  }
}
```

This service makes an honest claim: zero domain knowledge, one queryable surface, no restricted surfaces. It is protocol-honest. Any agent can understand it without reading documentation.

---

## Appendix B — Glossary

| Term | Definition |
|------|------------|
| **Forja node** | Any service that implements one or more Forja protocol layers |
| **STATE manifest** | Machine-readable declaration of what a service is and knows |
| **TRUST contract** | Machine-readable declaration of what AI agents may do |
| **SENSE schema** | Unauthenticated operational intelligence endpoint |
| **Trust tier** | Integer 0–3 governing AI agent permission level |
| **Kill switch** | Automatic tier suspension triggered by SENSE error_rate |
| **Rollback descriptor** | Pre-execution record of state + restoration steps |
| **Knowledge drift** | Gap between certified knowledge and current domain reality |
| **SuperDomain** | Rule registry where domain knowledge is structured and certified |
| **Certified rule** | A domain rule reviewed and approved by a human domain expert |
| **Candidate rule** | A captured rule not yet reviewed — may not be used as sole basis for Tier 2+ actions |
| **AI surface** | The set of capabilities AI agents may interact with, in three categories |

---

**FORJA-SPEC-v0.1.md**
**AnkrForja Protocol | Open Specification | Apache 2.0**
**ANKR Labs | Powerp Box IT Solutions Pvt Ltd | Gurgaon | 2026-03-14**
