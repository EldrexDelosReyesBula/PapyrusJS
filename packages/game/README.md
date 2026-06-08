# 📄 Papyr.js — Simple Inside, Beautiful Outside

> **Write modern, secure, reactive, and privacy-first web applications with zero dependencies and zero compile steps.**

[![npm](https://img.shields.io/badge/npm-3.1.3-blue)](https://www.npmjs.com/package/@eldrex/papyr)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![CDN](https://img.shields.io/badge/CDN-papyrus--js.vercel.app-indigo)](https://papyrus-js.vercel.app/)

---

## ⏱️ Start in 60 Seconds

Create an HTML file and run this minimal working code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello Papyr.js</title>
    <!-- Include CDN -->
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        // Create reactive state
        let count = papyr.state(0);

        // Render UI
        let app = papyr.div({ style: { padding: '40px', fontFamily: 'sans-serif' } },
            papyr.h1("Greetings from Papyr.js! 🚀"),
            papyr.button(
                () => `Clicked ${count.value} times`,
                {
                    onclick: () => count.value++,
                    style: { padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }
                }
            )
        );

        papyr.mount("#app", app);
    </script>
</body>
</html>
```

---

## 💡 What is Papyr?

* **Direct DOM Rendering:** Updates only the targeted DOM nodes when state changes — bypassing Virtual DOM diff overhead.
* **Reactive State Engine:** Precise, dependency-tracking subscription-based reactivity (inspired by SolidJS and Vue) with **isomorphic storage persistence** (`persist: true`).
* **Framework Interoperability & Bridges:** Coexists alongside React, Next.js (SSR & Hydration), Vue, Svelte (Action mounts), Angular, and legacy jQuery without app-wide lock-in.
* **Legacy App Renovation (`papyr.renovate`):** Live audits (accessibility, performance, responsiveness) and progressive component replacements preserving existing styles.
* **Unified DB Adapter APIs:** Decoupled drivers for SQLite, Local/SessionStorage, and IndexedDB, plus external registers (`papyr.db.use`) for Supabase, Firebase, Postgres, MySQL, and MongoDB.
* **Papyrus Shapes Engine (PSE):** Built-in math geometry vectors (`rect`, `circle`, `ellipse`), curves (`bezier`, `spline`), morphing blobs, SVG pattern generators, and CSS 3D projections (`cube`, `sphere`, `card` tilt).
* **Built-in Physics Adapter:** Gravity, friction, bounds collision, and bounce forces simulated on elements natively.
* **Lag-Proof Predictive States:** Extrapolates user pointer interactions 16ms (2-frames) ahead using an integrated Kalman filter state estimator.
* **WebGL2 GPU Layouts (`papyr.layout.gpu`):** Renders box hierarchies directly on WebGL2 fragment shaders to completely bypass CPU layout reflow computations.
* **Biometric & Behavioral UI Adaptation:** Detects user interaction speeds (scroll rate, click tempo) to adapt hit targets and kerning states dynamically.
* **Self-Healing State Mesh Network (`papyr.api.fetch`):** API interceptors caching JSON objects into an encrypted IndexedDB offline vault and queuing mutation ledgers for background sync.
* **Pythonic Syntax Wrapper (`papyr.py`):** Declarative layout builder aliases (`Box`, `Text`, `Button`, `Input`) designed to look and write like clean, semantic Python code.
* **Zero Dependencies:** A single unified file that packages layout grids, animations, local storage databases, and AI helpers.

---

## 🏛️ What's New in 3.1.3 — Foundation Strengthening Release

> **Philosophy: Powerful by default. Flexible by design. Transparent by architecture.**

Papyrus 3.1.3 adds zero new end-user features. It adds the **formal control surface, SDK maturity layer, and trust architecture** required before the ecosystem expands further.

### New APIs

| API | Description |
|-----|-------------|
| `papyr.config(domain, values)` | Unified declarative configuration engine for all runtime settings |
| `papyr.controls.*` | Imperative runtime controls for rendering, animation, design, WATT, and scheduler |
| `papyr.trust` | 4-zone trust boundary model with runtime audit and CI/CD support |
| `papyr.access` | Advisory 3-tier namespace access classification (Full / Restricted / Protected) |
| `papyr.watt.sdk` | WATT developer SDK — permission flows, consent banners, transparency dialogs |
| `papyr.pssr.sdk` | PSSR SDK — per-route rendering strategy, lazy islands, meta pipelines, edge config |
| `papyr.freeform` | Framework detection, selective subsystem activation, Vue/React bridges |
| `papyr.sdk` (extended) | Plugin validator, adapter registry, config snapshot/restore, controls introspection |

### New Packages

| Package | Description |
|---------|-------------|
| `@eldrex/papyr-watt` | WATT SDK standalone — `npm install @eldrex/papyr-watt` |
| `@eldrex/papyr-pssr` | PSSR SDK standalone — `npm install @eldrex/papyr-pssr` |

### New Bundles

| Bundle | Use |
|--------|-----|
| `papyr-watt.js` / `papyr-watt.esm.js` | WATT SDK standalone |
| `papyr-pssr.js` / `papyr-pssr.esm.js` | PSSR SDK standalone |
| `papyr-trust.js` | Trust audit for CI/CD (no browser engine) |

### Quick Examples

```js
// Configuration (declarative)
papyr.config('rendering', { mode: 'ssr', targetFps: 60 });
papyr.config('animation', { duration: 300, reducedMotion: 'auto' });
papyr.config('watt', { mode: 'strict' });

// Controls (imperative)
papyr.controls.rendering.setPriority('high');
papyr.controls.animation.disableAll();        // accessibility
papyr.controls.design.setTheme('dark');
papyr.controls.scheduler.pause();

// WATT SDK
papyr.watt.sdk.flow({ name: 'camera', apis: ['camera'], onGranted, onDenied });
papyr.watt.sdk.consent({ categories: ['analytics'], onConsentChange });
papyr.watt.sdk.disclose({ name: 'Stripe', domain: 'stripe.com', type: 'payment' });

// PSSR SDK
papyr.pssr.sdk.strategy({ default: 'ssr', routes: { '/blog/*': 'ssg' } }).apply();
papyr.pssr.sdk.islands({ lazy: true, threshold: 0.1 });
await papyr.pssr.sdk.build.prerender({ routes, concurrency: 4 });

// Trust Boundaries
papyr.trust.owns('watt.policies');     // true — Zone 1
papyr.trust.zone('my-plugin');         // 2 — Plugin layer
papyr.trust.audit();                   // { passed, violations, warnings }

// Freeform Freedom
papyr.freeform.detect();               // { react: true, vue: false, tailwind: true }
papyr.freeform.use(['state', 'watt']); // selective activation
papyr.freeform.vue(app);               // Vue 3 bridge
```

---

## 🛠️ What You Can Build

* **Aesthetic Portals & Dashboards:** Built-in HSL theme engines, collapsible persistent sidebars, and responsive viewport folding structures.
* **Offline-First CRUD Apps:** Synchronized SQLite, IndexedDB, and LocalStorage drivers.
* **Cinematic Micro-Interactions:** Touch gesture trackers, particle backgrounds, and hardware-accelerated Verlet physics integrations.
* **Privacy-First Applications:** WATT SDK flows, GDPR/CCPA consent banners, and hardware permission lifecycle management.
* **Isomorphic Web Apps:** SSR, SSG, ISR, and CSR rendering per route via the PSSR SDK.
* **Multi-Framework Hybrid Apps:** Embed Papyrus state and animations inside React, Vue, Svelte, or Angular without conflicts.

---

## 🎯 Core Idea

$$\text{State} \rightarrow \text{UI updates automatically}$$

When a state's `.value` mutations occur, the Papyr Runtime Engine executes targeted updates specifically on the elements that referenced that state.

---

## ⚙️ Installation

### CDN (Zero Build Setup)

Include the compiled single runtime module inside your HTML:
```html
<script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
```

### Package Manager

```bash
# Core framework
npm install @eldrex/papyr

# WATT SDK (privacy & consent)
npm install @eldrex/papyr-watt

# PSSR SDK (rendering strategies)
npm install @eldrex/papyr-pssr
```

```javascript
import { papyr } from '@eldrex/papyr';
import { watt } from '@eldrex/papyr-watt';
import { pssr } from '@eldrex/papyr-pssr';
```

---

## 📚 Learn Next

### Core Docs
* 🚀 [Getting Started](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/getting-started.md)
* 🧠 [The Papyr Way](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/papyr-way.md)
* 📦 [Core Concepts](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/core-concepts.md)
* 📖 [Master API Reference](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/api/)
* 🍔 [Practical Recipes](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/recipes/)
* ❓ [FAQ](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/faq.md)

### 3.1.3 Foundation
* ⚙️ [Configuration API](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/configuration.md)
* 🎮 [Controls Reference](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/controls.md)
* 🛡️ [WATT SDK Guide](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/watt-sdk.md)
* 🖥️ [PSSR SDK Guide](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/pssr-sdk.md)
* 🏛️ [Trust Boundaries](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/trust-boundaries.md)
* 🔐 [Access Tier System](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/access.md)
* 🔌 [Freeform Freedom](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/freeform.md)

### Security & Privacy
* 🛡️ [Security & WATT](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/guides/security.md)
* 🔄 [Migration Guides](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/guides/migration.md)
* ⚖️ [Copyright & Attribution](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/attribution.md)

---

## 🧪 Interactive Demos

Run and inspect the interactive test suites inside the browser:
* 📝 [Interactive Todo Checklist](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/tests/todo.html)
* 💾 [Multi-Engine CRUD Database Sandbox](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/tests/crud.html)
* 🎬 [Touch Gestures & Spring Physics Sandbox](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/tests/animation.html)
* 📈 [Canvas Formula Graphing Plotter](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/tests/charts.html)

---

## 🛡️ Security & Network Disclosure

Papyr is a front-end framework running client-side in the user's browser. It includes standard, developer-facing AJAX wrapper utilities (`papyr.api.get`, `papyr.api.post`, and `papyr.fetch`) that reference the native browser `fetch()` API.

Because the compiled JavaScript bundles contain these standard `fetch()` API calls, static security analysis scanners (such as **Socket**) will flag the packages with a **Network Access / Supply Chain Security** alert.

Please rest assured:
- Papyr **does not** contain any telemetry, tracking, background logging, or malicious data transmission code.
- Network references are solely wrapper declarations provided to simplify HTTP requests for your application code.
- WATT is available to monitor and intercept any network-adjacent calls at the application layer.

---

## 🏛️ Trust Architecture

Papyrus 3.1.3 introduces a formally documented **4-Zone Trust Model**:

| Zone | Owner | Responsibility |
|------|-------|---------------|
| 1 | Papyrus Framework | Core enforcement, WATT, security kernel |
| 2 | Plugins (developer-installed) | Additive-only, scoped APIs |
| 3 | Third-Party Services | Monitored by WATT, not controlled |
| 4 | Developer | App logic, auth, data validation, compliance |

```js
// CI/CD audit
const { trust } = require('./papyr-trust.js');
const result = trust.audit();
if (!result.passed) process.exit(1);
```

---

## 📄 License

Papyr.js is distributed under the [MIT License](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/LICENSE).
