/**
 * AnkrForja — Minimal Express Implementation
 *
 * Conformance level: full (STATE + TRUST + SENSE)
 * Time to implement: ~30 minutes
 *
 * Prerequisites:
 *   npm install express
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Track metrics ───────────────────────────────────────────────────────────

let requestCount = 0;
let errorCount = 0;
let aiRequestCount = 0;

app.use((req, res, next) => {
  requestCount++;
  if (req.headers['x-agent-id']) aiRequestCount++;
  res.on('finish', () => { if (res.statusCode >= 500) errorCount++; });
  next();
});

// ── Your service logic here ─────────────────────────────────────────────────

app.get('/api/data', (req, res) => {
  res.json({ items: [] });
});

// ── FORJA/STATE — Identity and Capability ───────────────────────────────────

app.get('/forja/state', (req, res) => {
  res.json({
    forja_version: '0.1',
    identity: {
      id: 'org.example.my-service',
      name: 'My Service',
      version: '1.0.0',
      domain: 'your-domain',
      owner: 'Your Team',
    },
    capabilities: [
      {
        id: 'data-query',
        name: 'Data Query',
        type: 'query',
        description: 'Query service data.',
        domain_rules_applied: [],
      },
    ],
    knowledge: {
      rule_count: 0,
      certified_count: 0,
      last_updated: new Date().toISOString(),
    },
    dependencies: [],
    ai_surface: {
      queryable: [
        { id: 'data-query', description: 'Read-only data query via GET /api/data.' },
      ],
      actionable: [],
      restricted: [
        { id: 'admin-delete', reason: 'Destructive. Human-only.' },
      ],
    },
  });
});

// ── FORJA/TRUST — Per-Action Trust Tiers ────────────────────────────────────

app.get('/forja/trust', (req, res) => {
  res.json({
    forja_version: '0.1',
    service_id: 'org.example.my-service',
    default_tier: 0,                    // FRJ-005: deny-by-default
    action_tiers: [
      {
        action_id: 'data-query',
        action_type: 'query',
        tier: 1,                        // Read-only: safe for agents
        description: 'GET /api/data — read-only, no state change',
      },
    ],
    kill_switch: {
      enabled: true,
      error_rate_threshold: 0.02,       // 2% error rate triggers downgrade
      fallback_tier: 1,
    },
    self_escalation_prevention: {
      enabled: true,                    // FRJ-011: agents cannot raise own tier
      rejection_code: 'FRJ-011',
    },
  });
});

// ── FORJA/SENSE — Live Operational Intelligence ──────────────────────────────
// Unauthenticated by design (FRJ-013). Operational honesty is public.

app.get('/forja/sense', (req, res) => {
  const errorRate = requestCount > 0 ? errorCount / requestCount : 0;
  const killSwitchActive = errorRate > 0.02;

  res.json({
    forja_version: '0.1',
    service_id: 'org.example.my-service',
    timestamp: new Date().toISOString(),
    health: {
      score: killSwitchActive ? 0.5 : 0.99,
      status: killSwitchActive ? 'degraded' : 'healthy',
      error_rate: errorRate,            // FRJ-022: canonical kill switch signal
    },
    velocity: {
      requests_per_minute: requestCount,   // simplification: total, not per-minute
      ai_agent_traffic_pct: requestCount > 0 ? aiRequestCount / requestCount : 0,
    },
    security: {
      current_trust_tier: killSwitchActive ? 1 : 1,
      kill_switch_active: killSwitchActive,
      self_escalation_attempt_count: 0,
    },
    knowledge_drift: {
      stale_rules: 0,
      last_rule_update: new Date().toISOString(),
      conflict_count: 0,
      drift_score: 0.0,
    },
  });
});

// ── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
  console.log(`Forja STATE:  http://localhost:${PORT}/forja/state`);
  console.log(`Forja TRUST:  http://localhost:${PORT}/forja/trust`);
  console.log(`Forja SENSE:  http://localhost:${PORT}/forja/sense`);
});
