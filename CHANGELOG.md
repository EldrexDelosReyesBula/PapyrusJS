# Changelog

All notable changes to **Papyr.js** will be documented in this file.

---

## [3.1.2] - 2026-06-05

### Added
* **Papyrus Shapes Engine (PSE):** Comprehensive vector shape primitives (`rect`, `circle`, `triangle`, `ellipse`, `polygon`), curves (`line`, `curve`, `arc`, `spline`), morphing blobs (`blob`, `organic`, `liquid`), pattern generator (`pattern` checkerboard, grids, hex), CSS 3D projections (`cube`, `sphere`, `cylinder`, `cone`, `torus`), pointer tilt interactive elements (`card`), and integrated Three.js adapter bindings.
* **Built-in Physics Engine Adapter:** Simulated gravity, viewport wall bounds collision, friction, and bounce coefficients dynamically mapped onto registered DOM elements.
* **Legacy Modernization & Renovation (`papyr.renovate`):** Live element auditing and progressive component replacements supporting non-destructive layout/styling preservation.
* **Framework Bridges:** Dedicated bridges for React/Next.js (supporting isomorphic SSR rendering and hydration), Vue 2/3 (`Bridge`), Svelte (Action mount action), and Angular life cycle binders.
* **Storage Continuity Engine:** Automatic state persistence and recovery option (`persist: true`, `key`) integrated into `papyr.state`.
* **Unified Database defaults (`papyr.db.use`):** Supported selecting a default database driver globally and added modular adapter registers for Supabase, Firebase, PostgreSQL, MySQL, and MongoDB.
* **Isomorphic Server Safety:** Made storage and session helper hooks safe for Node/Server-side execution.
* **Priority Scheduler & UI Recovery:** Frametime-budgeted prioritization queue (`scheduler.js`) and UI block performance observers with auto recovery.
* **WATT Security 2.0:** SANDBOX credential scanning, geolocation/media interceptors, and AI data transparency prompt consent overlays.

---

## [3.1.1] - 2026-06-04

### Fixed
* **Compiler Syntax Error**: Resolved an unexpected token syntax error `]` at line 530 in `src/plugins/ui-components.js` virtual list.

### Security Hardening
* **Prototype Pollution Guard Layer**: Updated mock document fallbacks, dynamic styles, and element attribute updaters inside `src/core/papyr-core.js` to utilize safe `Reflect` APIs and filter unsafe keys (`__proto__`, `constructor`, `prototype`).
* **ReDoS Mitigation Guards**:
  * Added route path whitelisting checking `/^[a-zA-Z0-9_/:.\-@~]*$/` inside `src/core/router.js` to protect routing template compilation from regular expression injection.
  * Refactored the natural language number schema parser inside `src/plugins/ai.js` to use safe string substring index scanning, removing the dynamic `new RegExp` constructor entirely.

### Performance
* **1D Typed Array Levenshtein Optimization**: Rewrote the spellchecking Levenshtein distance solver in `src/core/papyr-core.js` using a single 1D flat typed array mapping to reduce garbage collection overhead and improve check speeds.

---

## [3.1.0] - 2026-06-03
* **Predictive Reactivity Engine:** Implemented 1D/2D Kalman Filters and velocity-based linear extrapolation in `papyr.state` allowing 16ms/2-frame future predictions via `state.predicted` / `state.predict(dt)`.
* **GPU-Accelerated Layout Engine (`papyr.layout.gpu`):** Implemented a high-performance WebGL2 canvas box layout compiler running entirely on shaders (avoiding CPU layout calculations).
* **Biometric & Behavioral UI Cadences:** Background interactive trackers evaluating click tempo, scroll jitter, and mouse speeds to auto-toggle stress levels (`papyr.user.stress`) and reading mode (`papyr.user.reading`) with matching CSS responsive target overrides.
* **Self-Healing State Mesh (`papyr.api.fetch`):** Integrated IndexedDB caching, AES encrypted relational storage mapping, deterministic local mock success writes for offline sessions, and transaction re-sync loops.
* **Pythonic Declarative Wrapper API (`papyr.py`):** Added a python-inspired layout namespace exposing simple keyword-driven widgets (`Box`, `Text`, `Button`, `Input`).

---

## [3.0.0] - 2026-06-02

### Added
* **Agile Monorepo Architecture:** Split codebase into separate workspaces (`packages/core`, `packages/db`, `packages/router`, `packages/animate`, `packages/charts`, `packages/ai`) for optimized loading and size controls.
* **Deep Proxy Reactivity:** Support deep object property mutations and array methods interceptors (`push`, `pop`, `splice`, `shift`, `unshift`, `sort`, `reverse`) triggering fine-grained targeted updates.
* **Web Access Transparency Toolkit (WATT):** Added dynamic proxy intercepts on `localStorage` calls and script elements injections to sandbox tracker keys (`_ga`, `_gid`, `_fbp`) into memory-only cache maps until active consent is granted. Also intercepts hardware location/camera permissions for modal confirmations.
* **Asymmetric & Symmetric Storage Vaults:** Added async storage wrappers (`secureSetAsync` / `secureGetAsync`) powered by native browser Web Crypto API executing AES-256-GCM encryption with PBKDF2 password derivation.
* **Unified Database Engine (`papyr.db`):** Upgraded transaction-safe CRUD drivers mapping local collections seamlessly to `localStorage`, `sessionStorage`, `indexeddb`, or `sqlite` (SQL.js or Cordova).
* **Verlet 2D Rigid Physics Simulator:** Added zero-dependency physical bounce, drag forces, and coordinates mapping under `papyr.physics.verlet`.
* **Immersive 3D Space fallback:** Implemented Canvas2D interactive pointer-displacement stars environment if Three.js loader is absent.

### Changed
* **Responsive Breakpoints:** Selector mapping system updated to support responsive class prefixes (`sm:flex-col`, `md:flex-row`) bound via dynamically injected styles in a runtime CSS stylesheet.
* **Lifecycle Garbage Cleaner:** Mutation observers trace elements removal from DOM, executing recursive `_cleanups` callbacks to prevent state memory leaks.
* **Improved CRUD Queries:** Upgraded filter object matching, direction-sorting (`asc`/`desc`), and database slice pagination parameters.

---

## [2.0.0] - 2026-04-20

### Added
* **First Isomorphic Render Support:** Server Side Rendering (`papyr.ssr()`) compiling component templates to HTML strings in Node.js backend.
* **Mathematical Operations calculator:** Auto-updating computed equations helpers (`sum`, `sub`, `mul`, `div`).
* **Interactive Dialogs plugin:** First release of toast notifications and modals.

---

## [1.0.0] - 2026-03-20

### Added
* **Baseline Kernel Release:** Tag selector builders, basic state reactivity, and single-page routing hashes.
