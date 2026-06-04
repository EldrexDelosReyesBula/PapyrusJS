# Performance Optimization & Memory Management

This guide outlines advanced performance optimization practices, memory disposal procedures, data batching configurations, and garbage collection mechanisms inside the Papyr runtime.

---

## 1. Avoid Heavy Inline Calculations

Because Papyr evaluates reactive attributes on every dependency change, putting intensive calculations inside element arguments causes lagging animations.

### ❌ BAD
```javascript
// Computes prime factorization on every keystroke
let inputVal = papyr.state(0);
let inputEl = papyr.p(() => {
    return runHeavyFactorization(inputVal.value);
});
```

### ✅ GOOD
```javascript
let inputVal = papyr.state(0);
// Calculation is cached. Evaluates ONLY when inputVal changes.
let factorizedResult = papyr.computed(() => runHeavyFactorization(inputVal.value));

let inputEl = papyr.p(() => factorizedResult.value);
```

---

## 2. Batch State Updates

Mutating state elements in a loop triggers redundant DOM writes. Always batch modifications into a single transaction assignment.

### ❌ BAD (Triggers 500 individual DOM writes)
```javascript
let logsList = papyr.state([]);
for(let i = 0; i < 500; i++) {
    logsList.value.push(`Log entry ${i}`);
}
```

### ✅ GOOD (Triggers exactly 1 DOM write)
```javascript
let logsList = papyr.state([]);
let tempArray = [];
for(let i = 0; i < 500; i++) {
    tempArray.push(`Log entry ${i}`);
}
// Single atomic update
logsList.value = [...logsList.value, ...tempArray];
```

---

## 3. Leverage Document Fragments (`papyr.fragment`)

If you need to inject multiple sibling nodes into a parent container, group them using `papyr.fragment` instead of wrapper styling `div` elements. This prevents style reflows and reduces browser render tree overhead:

```javascript
// Creates children in-memory, appending to target container in a single pass
let children = papyr.fragment(
    papyr.p("Section A"),
    papyr.p("Section B"),
    papyr.p("Section C")
);

papyr.mount("#target", children);
```

---

## 4. Automatic Memory Leak & Event Listener Disposal

When elements are removed from the DOM, active loops and global event listeners can trigger memory leaks, continuing to run in the background and keeping references in memory.

### Element Cleanup Lifecycle (`_cleanups`)
Papyr introduces a standard cleanup array `_cleanups` bound directly to DOM nodes. When the runtime detects (via a Mutation Observer) that a node has been removed from the DOM:
1. It executes all callback functions stored in the node's `_cleanups` registry.
2. It triggers the component's `onUnmounted` lifecycle hooks.
3. It disconnects active Mutation Observers.
4. It recursively cleans up all child elements.

### How Plugins Prevent Memory Leaks
Official plugins hook into this lifecycle to dispose of their background tasks:

* **Canvas Shapes (`shapes.js`)**:
  Canvas drawing loops (like wave and polygon rendering) capture animation frame IDs:
  ```javascript
  const animId = requestAnimationFrame(tick);
  el._cleanups.push(() => cancelAnimationFrame(animId));
  ```
* **Particle Systems (`particles.js`)**:
  Particle systems store and remove resize listeners bound to `window`, preventing window context retention:
  ```javascript
  const resizeHandler = () => resizeCanvas();
  window.addEventListener('resize', resizeHandler);
  el._cleanups.push(() => window.removeEventListener('resize', resizeHandler));
  ```
* **3D Immersive fallbacks (`immersive.js`)**:
  Disposes of active Three.js renderer structures (`renderer.dispose()`), halts animation renders (`cancelAnimationFrame`), and cleans up global event listeners.

---

## 5. Optimized Levenshtein Spellcheck

The core self-healing plugin (`papyr-self-heal`) checks invalid tags using Levenshtein distance calculations. 

Rather than compiling a multi-dimensional array mapping (`tmp[i-1][j]`), which suffers from memory allocation overhead and triggers static analyzer prototype alerts, Papyr uses a high-performance **1D flat typed array mapping** (`Int32Array`). This reduces garbage collection pause times and ensures safe, local numeric operations.

---

## 6. Energy Performance Pacing

For apps with heavy particle backgrounds or active canvas graphing simulators, subscribe to `papyr.power` states. This throttles your loops down when the tab is backgrounded:

```javascript
let isPageIdle = false;

papyr.power.state.subscribe((energyState) => {
    isPageIdle = energyState === 'idle';
});

function animateLoop() {
    if (isPageIdle) {
        // Throttle animation checks to conserve battery
        setTimeout(() => requestAnimationFrame(animateLoop), 100);
    } else {
        requestAnimationFrame(animateLoop);
    }
}
```
