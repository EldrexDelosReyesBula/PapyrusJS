# Official Plugin Modules & Lifecycle Cleanups

This guide details the official plugin modules packaged with Papyr.js, explaining their architectures, usage, and how they utilize standard lifecycle enforcements to prevent memory leaks and performance regression.

---

## 1. Shapes Plugin (`shapes.js`)

Provides canvas-based custom background effects and dynamic geometric decorations:

*   **`papyr.wave(options)`**: Spawns an animated fluid wave drawing onto a canvas element. Options include `amplitude`, `frequency`, `waveColor`, and `speed`.
*   **`papyr.polygon(options)`**: Renders morphing geometric shapes.

### Lifecycle Cleanups
Both shapes start a continuous `requestAnimationFrame` render loop. To prevent memory leaks when elements leave the DOM, the loops store animation IDs:
```javascript
let animId;
const tick = () => {
    draw();
    animId = requestAnimationFrame(tick);
};
el._cleanups.push(() => cancelAnimationFrame(animId));
```

---

## 2. Particles Plugin (`particles.js`)

Draws interactive, glassmorphic particle backgrounds that respond to pointer movement:

*   **`papyr.particles(options)`**: Spawns particles on a canvas. Options include `particleCount`, `particleColor`, `maxSpeed`, and `interactive` (reacting to pointer hover).

### Global Listener Disposal
Particle canvasses require tracking screen size changes to rebuild boundaries. To avoid retaining window context, resize event listeners are wrapped and cleaned up when unmounted:
```javascript
const resizeHandler = () => resize();
window.addEventListener('resize', resizeHandler);
el._cleanups.push(() => window.removeEventListener('resize', resizeHandler));
```

---

## 3. Immersive 3D Space Plugin (`immersive.js`)

Initializes high-fidelity 3D graphics inside the browser:

*   **`papyr.immersive(options)`**: Spawns an interactive three-dimensional viewport. If Three.js (`window.Three` or `window.THREE`) is present, it sets up a WebGL 3D environment. If absent, it automatically cascades to a lightweight, canvas-based space fallback (pointer particle displacement).

### Resource Deallocation
Immersive viewports allocate substantial GPU memory. On unmount, the plugin performs complete garbage collection:
1. Cancels active render loops using `cancelAnimationFrame`.
2. Disposes of geometries, materials, and textures.
3. Invokes WebGLRenderer disposal (`renderer.dispose()`).
4. Disposes of mouse move and window resize listeners.

---

## 4. Power Throttling Plugin (`power.js` / `papyr-energy-adapter`)

Automatically adjusts drawing rates to preserve device battery:

*   **`papyr.power.state`**: Reactive state tracking battery levels and page visibility.
*   **`papyr.power.mode`**: Auto-toggles between `'normal'`, `'low'`, and `'idle'`.
*   **Actionable Pacing**: Loops check `papyr.power.mode` to introduce throttling `setTimeout` delays in idle or backgrounded tabs, saving device resource cycles.

---

## 5. Server-Side Rendering Integrations (`integrations.js` / `papyr-ssr`)

Provides connectors for server contexts:

*   **`papyr.ssr(component)`**: Compiles reactive declarations directly to static HTML strings. Heavy visual properties (WebGL, Canvas) fallback to simple structural wrappers on the server.
*   **Express Middleware**: Provides simple routers to serve pre-rendered HTML to search crawlers while keeping hydration bundles available for interactive clients.

---

## 6. Behind the Scenes: The `_cleanups` Registry

Every element instantiated by the Papyr DOM builder (`papyrInstance`) has an optional hidden `_cleanups` array.

1. **Registration**: When a plugin or watcher starts a task attached to an element, it pushes a teardown function into `el._cleanups`.
2. **Mutation Monitoring**: The core framework maintains a global, low-overhead `MutationObserver` watching elements removed from the document tree.
3. **Execution**: Once an element is removed, the framework recursively runs all cleanup functions in `_cleanups` for the element and all its children, ensuring complete memory recycling.
