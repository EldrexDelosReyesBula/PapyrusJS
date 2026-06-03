# Computed & Effects API

This module details the derived computed signals, reactivity caching, tracking loops, and effects engine.

---

## Computed Properties (`papyr.computed`)

Creates a read-only reactive computed state. It tracks other state dependencies accessed inside the function and recalculates only when those dependencies change.

### Signature
```javascript
let double = papyr.computed(fn);
```

### Example
```javascript
let count = papyr.state(5);
let doubleCount = papyr.computed(() => count.value * 2);

console.log(doubleCount.value); // 10

count.value = 10;
console.log(doubleCount.value); // 20 (re-evaluated!)
```

### Caching Mechanism
Computed properties cache their evaluation. If accessed multiple times while their dependencies remain unchanged, they return the cached value directly without running the function again:

```javascript
let callCount = 0;
let base = papyr.state(10);
let computedVal = papyr.computed(() => {
    callCount++;
    return base.value * 5;
});

console.log(computedVal.value); // Runs calculations (callCount = 1)
console.log(computedVal.value); // Returns cached value (callCount = 1)
```

---

## Reactive Effects (`papyr.effect`)

Creates a fine-grained reactive effect. It executes the function immediately, tracks any state dependencies accessed, and re-runs the function whenever those dependencies update.

### Signature
```javascript
let unsubscribe = papyr.effect(fn);
```

### Example
```javascript
let status = papyr.state("idle");

// Sets up dynamic logger
let cleanEffect = papyr.effect(() => {
    console.log("Current status log:", status.value);
});

status.value = "running"; // Logs: "Current status log: running"

// Call return function to stop observing dependencies
cleanEffect();
```

---

## Dependency Tracking & Cleanups

Under the hood:
1. **Dependency Registry:** Papyr uses an internal active effect stack. When a computed property or effect runs, it pushes itself onto the stack.
2. **Dynamic Subscriptions:** When `state.value` is read, the state checks the top of the stack and adds it as a subscriber.
3. **Tracking Cleanups:** On every new evaluation, the computed property or effect clears its old dependency list before running. This ensures that conditionally bypassed states do not trigger redundant re-runs:
   ```javascript
   let active = papyr.state(true);
   let dataA = papyr.state("A");
   let dataB = papyr.state("B");
   
   // If active is false, mutations on dataA will no longer trigger recalculation updates!
   let computedText = papyr.computed(() => {
       return active.value ? dataA.value : dataB.value;
   });
   ```
4. **Subscription Cleanup:** On element unmounting, Papyr's garbage collector walks the tree and executes stored unsubscribe functions, preventing memory leaks in single-page applications.
