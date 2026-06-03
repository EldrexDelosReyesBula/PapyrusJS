# Architecture & Kernel Lifecycles

This guide details the runtime kernel architecture, subsystems dependencies, and isomorphic server fallback hooks of Papyr.js.

---

## 1. Runtime Kernel Overview

When you call `createPapyr()`, the framework instantiates an Intelligent Web Runtime Kernel context and attaches its core subsystems:

```
┌──────────────────────────────────────────────────────────────────┐
│                   Papyr Runtime Kernel Context                    │
├───────────────┬─────────────────┬───────────────┬────────────────┤
│   EventBus    │  StateManager   │  Diagnostics  │  PluginSystem  │
│  (events.on)  │  (state.states) │  (errors.box) │   (use/hooks)  │
└───────────────┴─────────────────┴───────────────┴────────────────┘
                                  │
                                  ▼
                    [declarative selector parsing]
                                  │
                                  ▼
                    [isomorphic fallback checks]
```

These subsystems work together to provide state tracking, custom plugin hooks, and error boundaries.

---

## 2. Core Subsystems

* **`EventBus` (papyr.events):** The internal communication bus. Emits updates and error logs, which you can listen to using `papyr.on()`.
* **`StateManager` (papyr.state):** Registers all active state signals. Enables context exports and debug traces.
* **`ComponentRegistry` (papyr.components):** Tracks mounted elements. Removes unused nodes and executes unmount lifecycles automatically.
* **`PluginSystem` (papyr.plugins):** Manages external plugins. Integrates official addons (like physics and charts) and runs hook callbacks.
* **`DiagnosticsEngine` (papyr.diagnostics):** Catches errors and tracks state updates. Detects infinite re-render loops if a state updates more than 100 times in a single tick.

---

## 3. The Lifecycle Pipeline

```
1. createPapyr() instantiates core systems & docFallback
              │
              ▼
2. Use plugins registered via papyr.use()
              │
              ▼
3. Render tags: papyrInstance() parses selectors & classes
              │
              ▼
4. Inject reactive attributes (State / computed effects)
              │
              ▼
5. onMounted() executes when elements enter document.body
              │
              ▼
6. MutationObserver tracks updates, triggering onUpdated()
              │
              ▼
7. onUnmounted() sweeps reactive _cleanups upon element removal
```

---

## 4. Isomorphic Fallback (`docFallback`)

To support server-side rendering (SSR), the kernel checks if a global `document` is present:

```javascript
let docFallback = null;
if (typeof document === 'undefined') {
    docFallback = {
        createElement(tag) { ... },
        createTextNode(text) { ... },
        createDocumentFragment() { ... }
        // Mock properties to prevent Node.js environment failures
    };
}
```

If the runtime is executing in a server environment (like Node.js), Papyr routes calls to `docFallback` instead of the browser's APIs. This mock layer outputs valid static HTML strings when `papyr.ssr(component)` is called, preventing server crashes.
