# Changelog

All notable changes to **Papyr.js** will be documented in this file.

---

## [3.0.0] - 2026-06-03

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

## [2.0.0] - 2025-08-12

### Added
* **First Isomorphic Render Support:** Server Side Rendering (`papyr.ssr()`) compiling component templates to HTML strings in Node.js backend.
* **Mathematical Operations calculator:** Auto-updating computed equations helpers (`sum`, `sub`, `mul`, `div`).
* **Interactive Dialogs plugin:** First release of toast notifications and modals.

---

## [1.0.0] - 2024-03-20

### Added
* **Baseline Kernel Release:** Tag selector builders, basic state reactivity, and single-page routing hashes.
