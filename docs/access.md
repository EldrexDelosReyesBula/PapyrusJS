# Papyrus Access Tier System

Papyrus formally separates developer access into 3 tiers. Access tiers are **advisory** — they emit warnings in development but never block execution, preserving Freeform Freedom.

---

## The Three Tiers

### Tier 1: Full Access

Developers have complete access. All documented public APIs.

```
state, signal, computed, effect, watch
component, mount, h, render, hydrate
router, route, page, navigate
theme, style, design, animate, layout
config, controls, access, trust
plugin, sdk, adapter, freeform
db, auth, api, payments, orm, crud
game, physics, ml, ocr, ai, charts, math
seo, pssr, isr, edge
watt.sdk, pssr.sdk
diagnostics, accessibility
```

### Tier 2: Restricted Access

APIs with documented public interfaces. Internals should not be modified directly. Accessing internals emits a `console.warn`.

```
scheduler     — use papyr.scheduler.schedule(), not _taskQueue
power         — use papyr.controls.scheduler, not internal timers
security      — use papyr.security.use(), not direct policy mutation
watt          — use papyr.watt.sdk, not enforcement hooks
reactivity    — use papyr.signal/computed, not internal effect graph
virtualize    — use papyr.virtualize API, not _config
user          — read-only behavioral signals
renovate      — internal hot-reload — use onHotReload()
gateway       — use papyr.gateway API only
```

### Tier 3: Protected Systems

These systems may not be modified. Accessing them emits a `console.error`.

```
security._enforcer            — WATT enforcement core
security._interceptors        — WATT intercept chain
watt._kernel                  — WATT kernel internals
recovery._monitor             — Freeze detection loop
scheduler._taskQueue          — Internal priority queue
pssr._hydrationIntegrity      — Hydration safety guards
trust._zone1Namespaces        — Trust zone definitions
```

---

## `papyr.access` API

```js
// Get the access tier for any namespace
papyr.access.tier('state');              // 'full'
papyr.access.tier('security');           // 'restricted'
papyr.access.tier('watt._kernel');       // 'protected'
papyr.access.tier('my-custom-plugin');   // 'unknown'

// List all namespaces by tier
const tiers = papyr.access.list();
// {
//   full: ['state', 'signal', 'component', 'router', ...],
//   restricted: ['scheduler', 'power', 'security', 'watt', ...],
//   protected: ['security._enforcer', 'watt._kernel', ...]
// }

// Check if a namespace is freely accessible
papyr.access.isAccessible('state');       // true
papyr.access.isAccessible('scheduler');   // false (restricted)
papyr.access.isAccessible('watt._kernel'); // false (protected)

// Seal a namespace (init-phase only, advisory)
papyr.access.seal('my-plugin._internals');

// Check if sealed
papyr.access.isSealed('my-plugin._internals'); // true

// Validate plugin scope
papyr.access.validateScope('my-plugin', 'state');          // true, no warning
papyr.access.validateScope('my-plugin', 'security');       // true + warn
papyr.access.validateScope('my-plugin', 'watt._kernel');   // false + error
```

---

## Plugin Scope Validation

When building plugins, validate your access scope before registering:

```js
const myPlugin = {
  name: 'my-animation-plugin',
  version: '1.0.0',
  scope: 'animation',
  install(papyr) {
    // Validate before accessing restricted systems
    papyr.access.validateScope('my-animation-plugin', 'animate');

    // Safe: 'animate' is full-access
    papyr.animate.extend({ /* ... */ });

    // This will warn: 'scheduler' is restricted
    // papyr.access.validateScope('my-animation-plugin', 'scheduler');
    // Use the public API instead:
    papyr.scheduler.schedule(() => { /* ... */ }, 'normal');
  }
};

// Validate plugin structure before installation
const { valid, warnings } = papyr.sdk.plugin.validate(myPlugin);
if (valid) papyr.plugin(myPlugin);
```

---

## Why Advisory, Not Enforced?

Papyrus prioritizes **Freeform Freedom**. Developers have legitimate reasons to access internals in edge cases — debugging, advanced integrations, or Papyrus extensions. The access tier system provides:

1. **Documentation** — makes the intended access model explicit
2. **Guidance** — warns when you're in territory the framework doesn't guarantee stability for
3. **No surprises** — you're never blocked, only informed

If you need to access a protected namespace, the warning tells you what SDK or documented API to use instead.
