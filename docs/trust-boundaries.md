# Papyrus Trust Boundaries

> Papyrus does not pretend to control what it cannot control.

Trust Boundaries formally document **who owns and is responsible for what** across the Papyrus execution environment. This model prevents security theater — where a framework claims responsibility it cannot actually enforce.

---

## Trust Zone Map

```
┌────────────────────────────────────────────────────────┐
│  ZONE 1 — Papyrus Framework Core                      │
│  Framework-controlled. Immutable at runtime.           │
├────────────────────────────────────────────────────────┤
│  ZONE 2 — Plugin Layer                                 │
│  Developer-installed. Scoped. Additive only.           │
├────────────────────────────────────────────────────────┤
│  ZONE 3 — Third-Party Services                         │
│  External vendors. Monitored by WATT. Not controlled.  │
├────────────────────────────────────────────────────────┤
│  ZONE 4 — Developer Responsibility                     │
│  Application-owned. Not managed by Papyrus.            │
└────────────────────────────────────────────────────────┘
```

---

## Zone 1 — Papyrus Framework Core

**What Papyrus controls and guarantees:**

| System | Guarantee |
|--------|-----------|
| WATT enforcement | Hardware API intercepts active; cannot be bypassed by plugins |
| Security kernel | XSS sanitization, CSP helpers, cookie policy |
| Rendering scheduler | Frame budget, task priority, UI freeze recovery |
| PSSR pipeline | SSR safety, island hydration integrity, streaming correctness |
| Reactivity engine | Signal consistency, computed correctness, memory cleanup |
| Recovery system | Component crash recovery, frozen UI detection |
| Access tier system | Protected namespaces emit warnings when accessed incorrectly |

**What Papyrus does NOT guarantee:**
- Security of data passed to third-party APIs
- Business logic correctness (developer-owned)
- HTTPS transport (hosting infrastructure responsibility)
- Content of data flowing through AI gateways

---

## Zone 2 — Plugin Layer

**What plugins can do:**
- Register new `papyr.*` namespaces (scoped to plugin name)
- Extend existing APIs (animation, layout, design) — additive only
- Access `papyr.state`, `papyr.signal`, `papyr.component` — full
- Add custom rendering adapters via `papyr.sdk.adapter.register()`
- Schedule background tasks via `papyr.scheduler` (frame budget applies)
- Emit custom events via `papyr.diagnostics`

**What plugins cannot do:**
- Modify `papyr.security.policies` directly (protected)
- Override WATT hardware intercepts (protected)
- Access internal scheduler task queue (restricted — use public API)
- Call `papyr.access.seal()` after initialization (no-op)
- Suppress WATT transparency dialogs (protected — user consent is not a plugin decision)

> **Plugin Trust Contract:** A plugin installed by the developer inherits the developer's trust level. Papyrus does not vouch for third-party plugin security. Developers are responsible for auditing installed plugins.

---

## Zone 3 — Third-Party Services

**WATT monitors but does not control:**

| Service Type | WATT Visibility | Developer Action Required |
|-------------|-----------------|---------------------------|
| Analytics (GA, Mixpanel) | Network intercept logged | Disclose via `papyr.watt.sdk.disclose()` |
| Ad networks | Network intercept logged | Require user consent before loading |
| AI APIs (OpenAI, Gemini) | Request/response headers logged | Developer owns prompt safety |
| Payment processors (Stripe) | Network intercept logged | PCI compliance is developer responsibility |
| CDN-hosted scripts | Load event logged | Use Subresource Integrity (SRI) |
| Social embeds (Twitter, YouTube) | iframe origin logged | Consent before rendering |
| OAuth providers | Redirect tracked | Token storage is developer-owned |

> **WATT Monitoring Boundary:** WATT intercepts requests within the Papyrus runtime. It **cannot** intercept service workers, native modules, or separately loaded scripts with no Papyrus context.

---

## Zone 4 — Developer Responsibility

**Always the developer's responsibility:**

| Area | Developer Owns |
|------|---------------|
| Application business logic | State, data models, workflows |
| Authentication & authorization | Sessions, tokens, role checks |
| Data validation | Input sanitization before API calls |
| API key security | Never expose in client bundles |
| Privacy compliance | GDPR, CCPA, COPPA — legal obligations |
| Content security | What content is displayed |
| Plugin auditing | Third-party plugins installed into the project |
| Dependency security | npm packages beyond the Papyrus ecosystem |
| Infrastructure | Hosting, TLS, server configuration |
| AI prompt safety | Papyrus does not filter AI content |
| ISR cache invalidation | When to invalidate and what to cache |
| Edge secrets | Environment variables and edge worker secrets |

---

## `papyr.trust` API

```js
// Full trust report
const report = papyr.trust.report();
// {
//   zone1: { watt: 'active', security: 'active', pssr: 'active', ... },
//   zone2: { plugins: [...], adapters: [...] },
//   zone3: { monitoredOrigins: 3, disclosedServices: ['GA'], undisclosedDetected: [] },
//   zone4: { responsibilities: [...] }
// }

// Check framework ownership of a namespace
papyr.trust.owns('watt.policies');    // true  — Papyrus Zone 1
papyr.trust.owns('state.myCounter'); // false — Developer Zone 4

// Resolve trust zone
papyr.trust.zone('security');    // 1
papyr.trust.zone('my-plugin');   // 2
papyr.trust.zone('openai-api');  // 3

// Surface unregistered third-party origins
papyr.trust.undisclosed();
// ['cdn.tracker.com', 'api.analytics.example.com']

// Disclose a known service
papyr.trust.disclose({
  name: 'Google Analytics',
  domain: 'google-analytics.com',
  type: 'analytics',
  dataCollected: ['page_views', 'device_info'],
  privacyUrl: 'https://policies.google.com/privacy'
});

// Audit — emits console warnings for all active violations
const result = papyr.trust.audit();
// { passed: true, violations: [], warnings: [] }
```

---

## CI/CD Trust Auditing

Use `papyr-trust.js` for server-side trust audits without a rendering engine:

```js
// In a CI/CD build script or pre-commit hook:
const { trust } = require('./public/papyr-trust.js');

const result = trust.audit();

if (!result.passed) {
  console.error('Trust violations detected:');
  result.violations.forEach(v => console.error(' -', v.code, ':', v.message));
  process.exit(1);  // Fail the CI build
}

if (result.warnings.length > 0) {
  console.warn('Trust warnings:');
  result.warnings.forEach(w => console.warn(' -', w.code, ':', w.message));
}

console.log('Trust audit passed ✅');
```

**Bundle:** `papyr-trust.js` — lightweight, no rendering engine, Node.js compatible.
