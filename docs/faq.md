# Frequently Asked Questions (FAQ)

---

### Why should I use Papyr instead of React, Vue, or Svelte?

Traditional frameworks introduce complex development workflows (npm, bundlers, Webpack/Vite compilers) and require massive runtime files.

**Use Papyr if:**
* You want to build interactive interfaces using simple HTML files.
* You need a lightweight solution (13KB core gzipped) with no external dependencies.
* You want direct DOM performance with fine-grained reactivity.
* You are teaching web development and want to avoid complex build tools.

---

### Is Papyr.js ready for production?

Papyr.js is currently in an active **Beta** stage. It is suitable for dashboard utilities, interactive prototypes, internal tools, and lightweight single-page applications.

For high-traffic, mission-critical enterprise applications, consider the [Known Limitations](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/limitations.md). The software is provided under the MIT License on an "AS-IS" basis.

---

### Does it support Server-Side Rendering (SSR)?

**Yes, with multiple modes.** Papyrus 3.1.3 supports four rendering strategies via the PSSR SDK:

| Mode | Description |
|------|-------------|
| CSR  | Client-Side Rendering (default) |
| SSR  | Server-Side Rendering with hydration |
| SSG  | Static Site Generation at build time |
| ISR  | Incremental Static Regeneration with TTL cache |

```js
papyr.pssr.sdk.strategy({
    default: 'ssr',
    routes: { '/blog/*': 'ssg', '/dashboard': 'ssr' }
}).apply();
```

---

### How does Papyr prevent Cross-Site Scripting (XSS)?

By default, all elements created via tag builders treat string parameters as text nodes. This automatically escapes characters like `<` or `>` and prevents HTML injection:

```javascript
// Safe: The string is rendered as plain text, script is not executed
papyr.p("<script>alert('exploit')</script>");
```

If you need to render raw HTML strings safely, run them through the built-in sanitizer:

```javascript
let rawHTML = "<img src=x onerror='alert(1)'>";
let safeHTML = papyr.security.sanitize(rawHTML); // Strips the onerror attribute

// Render safely
let element = papyr.html(safeHTML);
```

---

### How do I use Papyr with Tailwind CSS or Bootstrap?

You can load CSS frameworks dynamically at runtime without any bundlers or link tags:

```javascript
// Inject Tailwind CSS dynamically
papyr.loadFramework('tailwind');

// Inject Bootstrap dynamically
papyr.loadFramework('bootstrap');
```

Or use **Freeform Freedom** to detect what's already loaded and activate only the Papyrus subsystems you need:

```js
const env = papyr.freeform.detect();
// { tailwind: true, react: false, vue: false, ... }

if (env.tailwind) {
    papyr.freeform.use(['state', 'animate', 'watt']);
}
```

---

### Can I use Papyr inside an existing React/Next.js/Vue/Svelte project?

**Yes, completely.** Papyr 3.1.3 introduces the `papyr.freeform` interoperability layer:

```js
// Vue 3 bridge
const { useSignal, useComputed } = papyr.freeform.vue(app);

// React bridge
const { useSignal } = papyr.freeform.react();

// Detect what's running
papyr.freeform.detect(); // { react: true, vue: false, nextjs: true, ... }

// Activate only the subsystems you need
papyr.freeform.use(['state', 'animate', 'watt', 'trust']);

// Vanilla mode — disable auto-init, keep all APIs
papyr.freeform.vanilla();
```

---

### What is `papyr.config()` and how does it differ from `papyr.controls`?

These are complementary systems:

| | `papyr.config()` | `papyr.controls.*` |
|--|---|---|
| Style | **Declarative** — "what the settings are" | **Imperative** — "do this now" |
| Use | App initialization, build-time | Runtime responses to user/system events |
| Persistence | Merged into internal store | Immediate side effect |

```js
// Declarative config at startup:
papyr.config('animation', { duration: 300, reducedMotion: 'auto' });

// Imperative controls at runtime:
window.matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', () => papyr.controls.animation.disableAll());
```

---

### What is the Trust Boundaries model in 3.1.3?

The Trust Boundaries model documents **who is responsible for what** in the Papyrus execution environment:

| Zone | Owner | Examples |
|------|-------|---------|
| Zone 1 | Papyrus Framework | WATT enforcement, scheduler, security kernel |
| Zone 2 | Developer (plugins) | Custom plugins, adapters |
| Zone 3 | Third-party (monitored) | Analytics, payment processors, CDNs |
| Zone 4 | Developer (app) | Business logic, auth, data validation |

```js
papyr.trust.owns('watt.policies');   // true — Zone 1, Papyrus
papyr.trust.zone('my-plugin');       // 2 — Plugin layer
papyr.trust.audit();                 // { passed, violations, warnings }
```

Use `papyr-trust.js` for **CI/CD trust audits** without a browser engine.

---

### What is the WATT mode and what does `mode: 'none'` do?

WATT has three operating modes, configurable via `papyr.config('watt', { mode })`:

| Mode | Behavior |
|------|----------|
| `'default'` | Standard enforcement — APIs prompted, network monitored |
| `'strict'` | Deny all hardware APIs automatically, maximum privacy |
| `'none'` | **Full WATT disable** — your complete responsibility |

> **Warning:** `mode: 'none'` disables ALL WATT interception including hardware API policies, consent flows, and network monitoring. Only use this if you are implementing your own full privacy/consent layer.

---

### How does isomorphic state persistence (`persist: true`) work under the hood?

When creating a state like `papyr.state(0, { persist: true, key: "user_clicks" })`:
1. During initialization, the engine checks for `localStorage` presence (safe from server-side Node crash).
2. It attempts to load any previous values mapped to `"user_clicks"`.
3. Whenever the reactive value changes, the setter serializes and stores the new value back to storage.

---

### What is Legacy Renovation Mode and when should I use it?

`papyr.renovate()` is a progressive migration tool designed for legacy pages (e.g. jQuery CRM, old PHP sites). It runs audits for accessibility, responsiveness, and outdated layouts, then replaces selected elements with modernized, reactive Papyr components on the fly without breaking surrounding markup or styling rules.

---

### Does Papyr's physics simulation run on a separate thread?

No, the built-in physics simulation runs a lightweight isomorphic update loop on the main browser thread. It uses an energy-aware manager to throttle updates when the window is inactive or when the device goes into low-battery mode, ensuring zero page lag.
