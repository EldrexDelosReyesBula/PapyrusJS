# Architecture, Monorepo & Isomorphic Builds

This document serves as the technical reference manual for Papyr.js's monorepo architecture, compile-time distribution systems, and isomorphic server-side rendering configurations.

---

## 1. Workspace Monorepo Layout

Papyr is managed as a decoupled monorepo structure. This maintains a lean baseline kernel size (~10KB) while allowing optional, high-capacity subpackages to be imported independently.

The workspace definitions reside in the root `package.json`, splitting functions into separate directories under `packages/`:

*   **`packages/core` (`@eldrex/papyr`):** The reactive engine, base DOM builder, security wrappers, and standard element APIs.
*   **`packages/router` (`@eldrex/papyr-router`):** SPA router supporting hash and clean URL navigation.
*   **`packages/animate` (`@eldrex/papyr-animate`):** Motion, Verlet physics engine, and touch gesture interactions.
*   **`packages/charts` (`@eldrex/papyr-charts`):** Lightweight canvas-based graphing plotters and data charts.
*   **`packages/db` (`@eldrex/papyr-db`):** Unified storage layer (LocalStorage, SessionStorage, IndexedDB, SQLite, Firebase).
*   **`packages/ai` (`@eldrex/papyr-ai`):** Speech synthesizers, recognizers, and NLP semantic converters.
*   **`packages/auth` (`@eldrex/papyr-auth`):** Client-side authentication helpers.
*   **`packages/ssr` (`@eldrex/papyr-ssr`):** Lightweight Server-Side Rendering (SSR) bundle.

---

## 2. Compilation Pipeline (`build.js`)

The root `build.js` script handles raw module resolution, IIFE bundling, ES Modules compilation, CDN distributions, and minification.

```
       [src/core/* Modules]           [src/plugins/* Modules]
                │                                │
                ▼                                ▼
       ┌─────────────────┐              ┌─────────────────┐
       │ Concatenate Core│              │Concatenate Plugs│
       └────────┬────────┘              └────────┬────────┘
                │                                │
                ├────────────────────────────────┘
                ▼
       [Bundling Targets]
       ├── papyr.js             (Browser Core IIFE)
       ├── papyr-complete.js    (IIFE Bundle + All Plugins + Styles)
       ├── papyr.esm.js         (ES Module Core)
       ├── papyr-complete.esm.js(ES Module Complete)
       └── papyr-ssr.js         (Decoupled Server Side Module)
```

### Bundle Architectures & Layouts
1.  **IIFE Wrappers**: For legacy browser CDNs, code is wrapped in an immediately invoked function expression (IIFE) exporting the isomorphic `papyrInstance` directly to the `window` scope.
2.  **ES Module (ESM)**: Generates explicit named exports for Reactivity, Router, and System bindings (e.g. `export { papyr, signal, computed, watch, effect, mount }`).
3.  **Style Injections**: CSS stylesheets (`complete.css`) are parsed, escaped, and compiled into the complete bundles as inline string literals. When the script loads in a browser environment, it dynamically injects these stylesheet nodes into the document header.

---

## 3. Package Workspaces Distribution Specs

Once compilation resolves in the `/public` folder, the build pipeline automatically packages and distributes assets into the target monorepo subworkspaces:

```javascript
// Distributes compiled outputs and synchronizes docs
copyFile(path.join(publicDir, 'papyr.js'),          path.join(corePackDir, 'papyr.js'));
copyFile(path.join(publicDir, 'papyr.esm.js'),      path.join(corePackDir, 'papyr.esm.js'));
syncSharedDocs(path.join(packagesDir, 'core'));
```

### Shared Documentation Sync
To avoid documentation fragmentation, root manuals (`README.md`, `DOCS.md`, `LICENSE`, `TRANSLATION_GUIDE.md`) are automatically synchronized across all nested workspace folders during the distribution phase, maintaining a single source of truth.

---

## 4. Standalone Isomorphic SSR Architecture

The SSR build compiles a dedicated package target (`papyr-ssr.js` / `@eldrex/papyr-ssr`). 

### Core DOM Fallback Layer
When running in Node.js, `document` and `window` objects are absent. Papyr compiles these targets by initializing a mock environment fallback (`docFallback`):

```javascript
docFallback = {
    createElement(tag) {
        return {
            tagName: tag.toUpperCase(),
            attributes: {},
            style: {
                setProperty(k, v) { Reflect.set(this, k, v); }
            },
            childNodes: [],
            appendChild(c) { this.childNodes.push(c); },
            setAttribute(k, v) { Reflect.set(this.attributes, k, v); },
            getAttribute(k) { return Reflect.get(this.attributes, k); },
            get innerHTML() {
                // Serializes elements dynamically to HTML strings
            }
        };
    }
}
```

This mock fallback is lightweight (~2KB) and serializes the DOM trees to standard strings inside `papyr.ssr()`. Browser-only plugins (like WebGL layouts, 3D immersive renders, and camera trackers) detect the node environment and fallback to simple semantic placeholder tags.
