/**
 * AnkrForja — Minimal Fastify Implementation
 *
 * Conformance level: full (STATE + TRUST + SENSE)
 * Time to implement: ~30 minutes
 *
 * Prerequisites:
 *   npm install fastify
 */

import Fastify from 'fastify';

const app = Fastify({ logger: false });
const PORT = Number(process.env.PORT ?? 3000);

// ── Track metrics ───────────────────────────────────────────────────────────

let requestCount = 0;
let errorCount = 0;
let aiRequestCount = 0;

app.addHook('onRequest', async (req) => {
  requestCount++;
  if (req.headers['x-agent-id']) aiRequestCount++;
});
app.addHook('onResponse', async (req, reply) => {
  if (reply.statusCode >= 500) errorCount++;
});

// ── FORJA/STATE ─────────────────────────────────────────────────────────────

app.get('/forja/state', async () => ({
  forja_version: '0.1',
  identity: {
    id: 'org.example.my-service',
    name: 'My Service',
    version: '1.0.0',
    domain: 'your-domain',
    owner: 'Your Team',
  },
  capabilities: [
    { id: 'data-query', name: 'Data Query', type: 'query', description: 'Query service data.', domain_rules_applied: [] },
  ],
  knowledge: { rule_count: 0, certified_count: 0, last_updated: new Date().toISOString() },
  dependencies: [],
  ai_surface: {
    queryable: [{ id: 'data-query', description: 'Read-only data query.' }],
    actionable: [],
    restricted: [{ id: 'admin-delete', reason: 'Destructive. Human-only.' }],
  },
}));

// ── FORJA/TRUST ─────────────────────────────────────────────────────────────

app.get('/forja/trust', async () => ({
  forja_version: '0.1',
  service_id: 'org.example.my-service',
  default_tier: 0,
  action_tiers: [
    { action_id: 'data-query', action_type: 'query', tier: 1, description: 'Read-only — safe for agents.' },
  ],
  kill_switch: { enabled: true, error_rate_threshold: 0.02, fallback_tier: 1 },
  self_escalation_prevention: { enabled: true, rejection_code: 'FRJ-011' },
}));

// ── FORJA/SENSE ─────────────────────────────────────────────────────────────

app.get('/forja/sense', async () => {
  const errorRate = requestCount > 0 ? errorCount / requestCount : 0;
  const killSwitchActive = errorRate > 0.02;
  return {
    forja_version: '0.1',
    service_id: 'org.example.my-service',
    timestamp: new Date().toISOString(),
    health: { score: killSwitchActive ? 0.5 : 0.99, status: killSwitchActive ? 'degraded' : 'healthy', error_rate: errorRate },
    velocity: { requests_per_minute: requestCount, ai_agent_traffic_pct: requestCount > 0 ? aiRequestCount / requestCount : 0 },
    security: { current_trust_tier: 1, kill_switch_active: killSwitchActive, self_escalation_attempt_count: 0 },
    knowledge_drift: { stale_rules: 0, last_rule_update: new Date().toISOString(), conflict_count: 0, drift_score: 0.0 },
  };
});

app.get('/health', async () => ({ status: 'ok' }));

app.listen({ port: PORT }, () => {
  console.log(`Forja STATE:  http://localhost:${PORT}/forja/state`);
  console.log(`Forja TRUST:  http://localhost:${PORT}/forja/trust`);
  console.log(`Forja SENSE:  http://localhost:${PORT}/forja/sense`);
});
