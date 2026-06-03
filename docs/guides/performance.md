# Performance Optimization

This guide outlines advanced performance optimization practices, memory disposal procedures, and data batching configurations inside the Papyr runtime.

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

## 4. Unsubscribe Manual Subscriptions

Papyr automatically cleans up dependencies bound inside layout templates when elements are unmounted. However, if you establish manual watchers or database event listeners, you must invoke the returned unsubscribe functions when they are no longer needed to prevent memory leaks:

```javascript
let count = papyr.state(0);

// Establish subscriber listener
const unsubscribe = count.subscribe(val => {
    console.log("Telemetry check:", val);
});

// Teardown when component is destroyed
unsubscribe();
```

---

## 5. Enable Energy Performance Pacing

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
