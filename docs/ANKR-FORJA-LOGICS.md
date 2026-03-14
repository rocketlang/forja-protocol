# ANKR FORJA — LOGICS Document
## Three-Layer Knowledge: Protocol Rules, Expert Reasoning, Inference Library

**Document**: ANKR-FORJA-LOGICS
**Version**: 0.1
**Date**: 2026-03-14
**Author**: ANKR Labs | Powerp Box IT Solutions Pvt Ltd, Gurgaon
**Status**: Draft — pending SuperDomain certification
**Domain**: forja (FRJ)
**Companion**: ANKR-FORJA-PROJECT_2026-03-14.md | ANKR-FORJA-WHITEPAPER_2026-03-14.md

---

## How To Read This Document

This LOGICS document follows the AnkrGuru three-layer knowledge framework.

```
Section A — SHASTRA  (शास्त्र)  Protocol Rules
  What the protocol declares to be true.
  Foundational constraints. Non-negotiable.
  rule_type = 'statute' | ID format: FRJ-{NUM}

Section B — YUKTI    (युक्ति)   Expert Reasoning
  How a Forja-aware engineer thinks through protocol design.
  Modus operandi. Pattern recognition. Decision heuristics.
  rule_type = 'meta-reasoning' | ID format: FRJ-YK-{NUM}

Section C — VIVEKA   (विवेक)   Inference Library
  Pre-computed conclusions for common Forja fact patterns.
  input_conditions → conclusion → confidence → caveat
  rule_type = 'inference' | ID format: INF-FRJ-{NUM}
```

All rules seed into SuperDomain (domain: forja) as status=candidate.
Humans certify. Rules do not certify themselves.

---

## Section A — SHASTRA (शास्त्र)
### Protocol Rules — What AnkrForja Declares True

---

**FRJ-001** — Every Forja-compliant service MUST publish a STATE manifest.
> A service that cannot declare what it exists is invisible to agents and invisible to the protocol. Existence without declaration is the same as non-existence from the protocol's perspective. There are no exceptions.

---

**FRJ-002** — The STATE manifest MUST be machine-readable.
> Human-readable documentation is insufficient. The manifest must be parseable by any conforming agent without human interpretation. JSON is the reference encoding. Any equivalent structured format is permitted provided it satisfies the full STATE schema.

---

**FRJ-003** — The STATE manifest MUST include: service identity, capabilities, domain knowledge references, dependency declarations, and AI surface declaration.
> Partial manifests are non-conforming. A manifest that declares capabilities but not dependencies creates a false picture of the service. A manifest that declares knowledge but not trust tiers is dangerous. All five fields are mandatory.

---

**FRJ-004** — Every Forja-compliant service MUST declare a TRUST tier for every AI-accessible action type.
> Trust is declared per action, not per service globally. A service may be Tier 1 (read-only) for query actions and Tier 2 (low-risk) for write actions simultaneously. Global trust declarations are not permitted — they create unintended access surfaces.

---

**FRJ-005** — The default TRUST tier for any undeclared action MUST be Tier 0 (off).
> If an action type is not declared in the TRUST contract, no AI agent may perform it. Silence is not permission. The protocol is deny-by-default for any undeclared surface.

---

**FRJ-006** — Every Forja-compliant service MUST emit a SENSE schema.
> A service that cannot report its own operational state cannot be safely operated by an agent. SENSE is not optional monitoring. It is a protocol primitive — as mandatory as STATE.

---

**FRJ-007** — All Tier 2 and Tier 3 actions MUST be append-only logged before execution.
> The log entry precedes the action. A logged action that was not executed is recoverable information. An executed action that was not logged is an unauditable event. Pre-logging is non-negotiable.

---

**FRJ-008** — Every logged action MUST include a rollback descriptor.
> A rollback descriptor specifies the exact state before the action and the steps required to restore it. Without a rollback descriptor, the action is non-reversible by the protocol. Non-reversible Tier 2 or Tier 3 actions are protocol violations.

---

**FRJ-009** — Rollback execution MUST require a human session token.
> AI agents may trigger rollback recommendation. AI agents may not execute rollback autonomously. The decision to restore a previous state is a human decision. The protocol enforces this boundary without exception.

---

**FRJ-010** — A kill switch MUST be configured for every service operating at Tier 2 or above.
> The kill switch automatically suspends AI agent autonomy when a configurable error rate threshold is crossed. The threshold is declared in the TRUST contract. There is no protocol-compliant Tier 2 or Tier 3 service without a kill switch.

---

**FRJ-011** — No AI agent may escalate its own TRUST tier.
> Trust tier escalation is a human action. An agent operating at Tier 1 cannot grant itself Tier 2 access, regardless of context, urgency, or apparent benefit. This rule has no exceptions. An agent that attempts self-escalation is in protocol violation.

---

**FRJ-012** — Domain knowledge exposed via FORJA/STATE MUST reference certified rule IDs.
> Raw text assertions are not knowledge. Knowledge in the Forja protocol is knowledge that has been structured, versioned, conflict-checked, and certified by a human domain expert. A STATE manifest that exposes unstructured text as knowledge is non-conforming.

---

**FRJ-013** — FORJA/SENSE MUST be queryable without authentication.
> Operational intelligence about a service must be accessible to any agent in the network. A SENSE endpoint that requires authentication defeats the purpose of distributed operational awareness. Health, velocity, and security posture are public declarations of operational honesty.

---

**FRJ-014** — The protocol version MUST be declared in every STATE manifest.
> Protocol evolution is expected. A manifest that does not declare its version cannot be validated against a known specification. Version declaration enables forward compatibility and allows agents to handle version differences gracefully.

---

**FRJ-015** — TRUST tier changes require human authorization and MUST be logged.
> A service that was Tier 1 yesterday and is Tier 2 today without a logged human authorization decision is in protocol violation. Trust tier history is an audit record. It must be complete and non-editable.

---

**FRJ-016** — Cross-service knowledge composition MUST declare all source rule IDs.
> When an agent synthesizes knowledge from multiple Forja-compliant services, the output must declare every rule ID that contributed to the conclusion. Composed knowledge without source traceability is not Forja knowledge — it is unsourced inference.

---

**FRJ-017** — Conflicting rules from different services MUST be flagged, not resolved by agents.
> When FORJA/STATE manifests from two services expose rules that conflict, the agent must flag the conflict for human resolution. Agents do not adjudicate between certified domain rules. Certification authority lies with human domain experts.

---

**FRJ-018** — The STATE manifest MUST declare the time of last knowledge update.
> Knowledge has a freshness dimension. A manifest that does not declare when its domain knowledge was last reviewed cannot be trusted as current. Staleness is a detectable and declarable property.

---

**FRJ-019** — Forja/SENSE MUST include a knowledge drift indicator.
> Domain rules change as law, regulation, and practice evolve. A service that is not tracking whether its certified rules are still current is operationally honest about its capabilities but operationally dishonest about its currency. Knowledge drift is a first-class SENSE signal.

---

**FRJ-020** — The protocol specification is open. Any service may implement it.
> AnkrForja is not owned by ANKR Labs. The specification may be implemented by any party without license, fee, or permission. ANKR Labs maintains the reference implementation and may offer managed services. The protocol itself belongs to no one.

---

**FRJ-021** — A Forja node that joins AnkrGrid MUST emit its STATE manifest to the Grid routing layer.
> Compute routing without knowledge context is Grid-only. Compute routing with knowledge context is Grid+Forja. A node that participates in both protocols must surface its Forja STATE to enable knowledge-aware routing decisions. Silent Grid participation is permitted. Silent Forja participation on a Grid node is not.

---

**FRJ-022** — FORJA/SENSE error_rate is the canonical signal for kill switch evaluation.
> Agents, operators, and protocol implementations must use the SENSE-declared error_rate as the single source of truth for kill switch threshold evaluation. Independently computed error rates are supplementary signals only. The SENSE schema is authoritative.

---

**FRJ-023** — The AI surface declaration in STATE MUST distinguish queryable, actionable, and restricted surfaces.
> Three categories are required. Queryable: AI can read. Actionable: AI can act (with TRUST tier). Restricted: no AI access regardless of trust tier. A service with no restricted surface is making a strong claim that must be explicitly reviewed at certification.

---

**FRJ-024** — Forja protocol compliance is binary per layer.
> A service is not "mostly Forja/STATE compliant." It either publishes a conforming STATE manifest or it does not. Partial compliance is non-compliance. The three layers (STATE, TRUST, SENSE) may be adopted incrementally, but each layer is all-or-nothing.

---

**FRJ-025** — Every Forja node is responsible for the accuracy of its own STATE manifest.
> The protocol does not verify manifest accuracy. It specifies manifest format and mandates declaration. A service that publishes an inaccurate manifest is in protocol violation regardless of whether the inaccuracy is detected. Accuracy is a service obligation, not a protocol enforcement.

---

## Section B — YUKTI (युक्ति)
### Expert Reasoning — How a Forja-Aware Engineer Thinks

---

**FRJ-YK-001** — When a service is new, default to Tier 1 (read-only) and operate there until runtime behaviour is proven.
> New services are unknown quantities. Their error rates, side effects, and failure modes are untested. The cost of starting at Tier 1 and escalating after proven stability is far lower than the cost of a Tier 2 agent acting on an unstable new service. Patience at the beginning prevents incidents at scale.

---

**FRJ-YK-002** — When evaluating trust tier escalation, look at error rate history first, dependency impact second, knowledge certification level third.
> Error rate is the most objective signal. A service with 0.1% error rate over 30 days is demonstrably safer than one with 2% over 7 days regardless of how well-documented it is. Dependency impact matters because a Tier 2 action on a highly-depended-upon service has blast radius proportional to its dependency count. Knowledge certification level tells you how well the service understands its own domain — uncertified knowledge should reduce trust appetite.

---

**FRJ-YK-003** — When composing knowledge across services, check for rule conflicts before synthesizing conclusions.
> Two services may both be correct in their own domain while producing a conflict when combined. A maritime service may certify that NOR is valid on arrival at anchorage. A charter party service may certify that NOR is only valid at berth for this specific contract. Both are correct. Combined naively, they produce the wrong answer. Check conflicts first. Always.

---

**FRJ-YK-004** — When SENSE signals degradation, reduce trust proactively — do not wait for the kill switch.
> The kill switch is the floor, not the ceiling. A Forja-aware operator does not wait for error_rate to hit 2% before reducing trust. At 1%, they reduce trust tier. At 1.5%, they move to read-only. The kill switch fires at 2% as a guarantee — not as an operational target.

---

**FRJ-YK-005** — When exposing domain knowledge in STATE, prefer certified rules over candidates.
> A certified rule has been reviewed by a human domain expert. A candidate rule has been captured but not validated. Agents operating on candidate rules are operating on unverified information. When building a STATE manifest, expose certified rules prominently and candidate rules with explicit staleness/confidence caveats.

---

**FRJ-YK-006** — When building a new Forja-compliant service, write the LOGICS document before the STATE manifest.
> The STATE manifest declares what the service knows. If you have not yet formalised what the service knows — through a LOGICS document with Shastra/Yukti/Viveka — you are writing a manifest for knowledge you have not captured. Knowledge capture precedes knowledge declaration.

---

**FRJ-YK-007** — The protocol governs the grammar of knowledge exchange. The protocol does not govern the content of knowledge.
> AnkrForja specifies how domain rules are structured, versioned, declared, and referenced. It does not specify what the domain rules are. Maritime rules, legal rules, compliance rules, security rules — each domain owns its knowledge. The protocol provides the container. Domain experts fill it.

---

**FRJ-YK-008** — When a node speaks both AnkrGrid and AnkrForja, routing decisions should be knowledge-aware when possible.
> A Grid routing decision that ignores Forja/STATE is compute-optimal but knowledge-blind. If two nodes offer equivalent compute (latency, cost, capacity), and one has certified domain knowledge relevant to the query, route to the knowledge-rich node. Compute parity → knowledge breaks the tie.

---

**FRJ-YK-009** — When a rollback is triggered, capture the SENSE snapshot before reverting.
> The state immediately before rollback is diagnostic gold. Error rate, health status, last actions, knowledge drift indicators — all of this is evidence for root cause analysis. Rollback first, analyse after — but capture before reverting. The SENSE snapshot at failure time is more valuable than the SENSE snapshot after recovery.

---

**FRJ-YK-010** — Treat SENSE as a protocol output, not a monitoring addon.
> Teams that add monitoring "after the outage" are treating observability as optional. In AnkrForja, SENSE is not monitoring — it is a protocol primitive. A service without SENSE is non-compliant regardless of how well it runs. Design SENSE into the service from day zero, not as an afterthought after the first incident.

---

**FRJ-YK-011** — When the combination of services produces emergent intelligence, trace every conclusion back to its source rule IDs.
> Emergent knowledge is valuable. Untraceable emergent knowledge is dangerous. When two services combine to produce a conclusion that neither could produce alone, the conclusion must still be traceable: which rules from which services contributed, in what combination, with what confidence. Emergence without traceability is not Forja-compliant reasoning.

---

**FRJ-YK-012** — The value of adopting Forja is combinatorial, not linear. Evaluate adoption accordingly.
> A team evaluating AnkrForja adoption should not ask: "what does my service gain from declaring STATE?" They should ask: "what does every other Forja-compliant agent in the network gain from my service joining?" The benefit to any individual participant is smaller than the benefit to the network. The network benefit compounds. Individual benefit calculations will systematically underestimate protocol value.

---

**FRJ-YK-013** — When a service's knowledge becomes stale, the trust tier should be reviewed — not just the knowledge.
> Stale knowledge is not just an accuracy problem. It is a trust problem. An agent that was granted Tier 2 access based on the service having 47 certified, current rules is operating under a different risk profile when only 30 of those rules are still current. Knowledge currency and trust tier are coupled variables. Re-evaluate both together.

---

**FRJ-YK-014** — Do not confuse the protocol with the implementation. The grammar is not the sentence.
> AnkrForja specifies how services declare knowledge, trust, and sense. It does not specify how the underlying service works, what language it is written in, or what cloud it runs on. Teams often conflate protocol adoption with infrastructure migration. They are separate concerns. A Python service on bare metal can be fully Forja-compliant. A Node.js service on AWS can be non-compliant. The protocol is the grammar. The implementation is the sentence.

---

**FRJ-YK-015** — When the protocol says something the domain expert disagrees with, the domain expert is probably right about the domain. The protocol is right about the grammar.
> A maritime expert who says "NOR tendering rules in this port don't fit your STATE manifest schema" is identifying a schema gap, not a protocol failure. Listen to the domain expert. Extend the schema if needed. The protocol is a living specification precisely because domain reality is richer than any initial specification. The grammar evolves to accommodate the sentences the world needs to write.

---

## Section C — VIVEKA (विवेक)
### Inference Library — Pre-Computed Conclusions for Common Forja Patterns

---

**INF-FRJ-001**
```
input_conditions:
  - Service has no TRUST contract declared

conclusion:
  Treat all AI agent actions on this service as Tier 0 (blocked).
  Do not infer trust from service behaviour or documentation.

rules_applied: [FRJ-004, FRJ-005]
confidence: 1.00
caveat: None. This inference is absolute. Silence is not permission.
```

---

**INF-FRJ-002**
```
input_conditions:
  - SENSE error_rate crosses the declared kill switch threshold
  - Service is operating at Tier 2 or Tier 3

conclusion:
  Immediately suspend AI agent autonomy for this service.
  Drop to Tier 1 (read-only) automatically.
  Notify human operator with SENSE snapshot at time of trigger.
  Do NOT wait for human confirmation before suspending.

rules_applied: [FRJ-010, FRJ-022]
confidence: 1.00
caveat: Suspension is automatic. Re-escalation requires human authorization.
```

---

**INF-FRJ-003**
```
input_conditions:
  - Two Forja-compliant services expose rules with overlapping scope
  - Rules produce contradictory conclusions for the same fact pattern

conclusion:
  Flag conflict. Do NOT synthesize a conclusion from contradictory certified rules.
  Surface both rules to human domain expert with the specific fact pattern.
  Record conflict in sd_rule_conflicts. Mark both rules as conflict_flagged.

rules_applied: [FRJ-017, FRJ-YK-003]
confidence: 0.98
caveat: If one rule is candidate and the other is certified, certified takes precedence
        for operational use. Still flag — do not silently suppress the candidate.
```

---

**INF-FRJ-004**
```
input_conditions:
  - STATE manifest last_knowledge_updated > 30 days ago
  - Service domain has known regulatory or operational activity in that period

conclusion:
  Flag manifest as potentially stale.
  Reduce operational confidence for knowledge-dependent agent actions.
  Do not block — but append staleness caveat to any knowledge compound
  that includes rules from this service.

rules_applied: [FRJ-018, FRJ-019, FRJ-YK-013]
confidence: 0.85
caveat: Staleness threshold is configurable per domain. 30 days is the Forja default.
        Stable domains (e.g. foundational law) may use 180 days.
        Volatile domains (e.g. crypto regulation) may use 7 days.
```

---

**INF-FRJ-005**
```
input_conditions:
  - SENSE health_score < 0.60
  - Service is operating at Tier 2

conclusion:
  Proactively reduce to Tier 1 regardless of error_rate vs kill switch threshold.
  Health score below 0.60 indicates systemic instability not captured by error_rate alone.
  Tier 2 actions on an unstable service create unacceptable blast radius.

rules_applied: [FRJ-YK-004, FRJ-010]
confidence: 0.92
caveat: If health degradation is due to SENSE instrumentation failure (not service failure),
        health_score may be artificially low. Cross-check with upstream dependency health
        before reducing trust tier.
```

---

**INF-FRJ-006**
```
input_conditions:
  - Node participates in AnkrGrid (compute contribution)
  - Node does NOT publish a Forja STATE manifest

conclusion:
  Node is Grid-compliant, Forja non-compliant.
  Compute can route through this node.
  No knowledge context is available from this node for Grid+Forja compound queries.
  Treat as compute-only node. Do not attempt knowledge extraction.

rules_applied: [FRJ-021, FRJ-024]
confidence: 1.00
caveat: Grid-only nodes are valid Grid participants. Forja compliance is independent.
        Do not block Grid participation due to Forja non-compliance.
```

---

**INF-FRJ-007**
```
input_conditions:
  - Agent has composed knowledge from N Forja-compliant services
  - Resulting conclusion cannot be traced back to specific rule IDs

conclusion:
  The conclusion is NOT Forja-compliant knowledge.
  It is unsourced inference. Do not present as protocol-governed output.
  Either trace the conclusion to source rule IDs or present it as
  agent reasoning (not domain-certified knowledge).

rules_applied: [FRJ-016, FRJ-YK-011]
confidence: 0.97
caveat: Partial traceability (some but not all contributing rules identified)
        is better than no traceability but still non-compliant.
        Disclose the gap explicitly.
```

---

**INF-FRJ-008**
```
input_conditions:
  - Logged action is missing a rollback descriptor
  - Action has already executed

conclusion:
  Action is non-reversible by the Forja protocol.
  Flag immediately in audit log as non_reversible_action.
  Escalate to human operator.
  Conduct root cause analysis on why rollback descriptor was missing.
  This is a protocol violation regardless of action outcome.

rules_applied: [FRJ-007, FRJ-008]
confidence: 1.00
caveat: Some actions are genuinely non-reversible by nature (e.g. sent emails,
        published events). These must be declared as inherently_irreversible
        in the TRUST contract before execution — not discovered after the fact.
```

---

**INF-FRJ-009**
```
input_conditions:
  - Service STATE manifest declares domain knowledge
  - All declared rules are status=candidate (none certified)

conclusion:
  Service may be exposed to agents for knowledge queries.
  All responses must include explicit caveat: knowledge is uncertified.
  Do not use uncertified knowledge as sole basis for Tier 2 or Tier 3 actions.
  Recommend human certification review before trust tier escalation.

rules_applied: [FRJ-012, FRJ-YK-005]
confidence: 0.90
caveat: In domains where no certified knowledge exists yet, candidate knowledge
        with high extraction confidence (>0.85) may be used with explicit disclosure.
        Never silently treat candidate as certified.
```

---

**INF-FRJ-010**
```
input_conditions:
  - Two Grid+Forja nodes have equivalent compute capacity (latency, cost, availability)
  - Node A has 47 certified domain rules relevant to the query
  - Node B has 0 Forja knowledge declarations

conclusion:
  Route to Node A.
  Knowledge-rich routing is preferred when compute is equivalent.
  The knowledge context available on Node A makes the inference more accurate,
  more traceable, and more trustworthy at no additional compute cost.

rules_applied: [FRJ-021, FRJ-YK-008]
confidence: 0.88
caveat: If Node A has significantly worse compute characteristics (>2× latency,
        >3× cost), compute factors may override knowledge routing preference.
        This is a heuristic, not an absolute rule.
```

---

## SuperDomain Seed Summary

```
Total rules in this document: 46

Section A — SHASTRA:   25 rules  (FRJ-001 to FRJ-025)
Section B — YUKTI:     15 rules  (FRJ-YK-001 to FRJ-YK-015)
Section C — VIVEKA:    10 rules  (INF-FRJ-001 to INF-FRJ-010)

Domain:      forja
Status:      candidate (all)
Certified:   0 (pending human review)
App:         ankr-forja

SuperDomain seed endpoint:
  POST http://localhost:4160/api/rules/batch
  { domain: "forja", rules: [...], status: "candidate" }
```

---

## What This LOGICS Document Unlocks

```
Shastra (FRJ-001–025):
  The protocol has teeth.
  Every "MUST" is enforceable.
  Every service can be validated against these rules.
  Compliance is binary and checkable.

Yukti (FRJ-YK-001–015):
  The protocol has wisdom.
  A Forja-aware engineer knows how to think — not just what to do.
  These rules cannot be scraped from documentation.
  They emerge from building, breaking, and fixing real systems.
  This is the moat.

Viveka (INF-FRJ-001–010):
  The protocol has memory.
  Common fact patterns are pre-solved.
  An agent operating in a Forja network does not re-derive
  what to do when a kill switch fires or a conflict is detected.
  The inference is pre-computed, confidence-scored, and caveated.
  Every novel resolved incident → new Viveka candidate.
  The corpus compounds.
```

---

**ANKR-FORJA-LOGICS_2026-03-14.md**
**AnkrGuru Way | Three-Layer Knowledge | Shastra + Yukti + Viveka**
**ANKR Labs | Powerp Box IT Solutions Pvt Ltd | Gurgaon | 2026-03-14**
