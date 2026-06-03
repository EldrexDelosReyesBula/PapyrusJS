# State & Reactivity

Papyr.js relies on a granular, dependency-tracking reactivity engine that bypasses the Virtual DOM. Updates are executed directly on the affected DOM elements.

The full source code of the reactivity system is located at [reactivity.js](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/src/core/reactivity.js).

---

## ⚡ 1. Reactive State (`papyr.state` / `papyr.signal`)

A reactive state object wraps any primitive or object value and tracks subscribers during execution.

```javascript
// Initialize state (or use its alias papyr.signal)
const theme = papyr.state("dark");
const count = papyr.signal(0);
```

### Reading and Writing Values
Read or modify state using the `.value` getter and setter:
```javascript
console.log(theme.value); // "dark"
theme.value = "light";    // Notifies all active subscribers
```

### Deep Reactivity & Proxies
When wrapping objects or arrays, Papyr uses an ES6 `Proxy` to monitor nested changes recursively:
```javascript
const list = papyr.state([{ id: 1, text: "Buy milk" }]);

// Auto-tracked array modifications:
list.value.push({ id: 2, text: "Buy eggs" }); // Triggers updates automatically

// Nested object modifications:
list.value[0].text = "Buy organic milk";      // Triggers updates automatically
```

---

## 🧠 2. Computed Properties (`papyr.computed`)

Computeds generate derived, read-only values that cache their results. They re-evaluate only when their reactive dependencies mutate.

```javascript
const price = papyr.state(100);
const quantity = papyr.state(2);

const total = papyr.computed(() => price.value * quantity.value);

console.log(total.value); // 200
```

---

## 👁️ 3. Effects & Watchers

### Effects (`papyr.effect`)
Runs a function immediately and re-runs it whenever any tracked dependencies update. Returns an unsubscribe cleanup function.

```javascript
const unsubscribe = papyr.effect(() => {
  console.log(`Current price is: ${price.value}`);
});
```

### Watchers (`papyr.watch`)
Allows watching a specific state, computed, or getter function. The callback receives both the new and old values:

```javascript
papyr.watch(count, (newVal, oldVal) => {
  console.log(`Count mutated from ${oldVal} to ${newVal}`);
});
```

---

## 📑 4. Control Flow & Rendering Helpers

### Conditional Swap (`papyr.if`)
Reactively swaps visual DOM nodes based on a condition:

```javascript
const isLoggedIn = papyr.state(false);

const element = papyr.if(
  isLoggedIn,
  () => papyr.button("Logout"),
  () => papyr.button("Login")
);
```

### Keyed List Diffing (`papyr.for`)
Takes a reactive array and maps it to a list of elements. If items are re-ordered or pushed, elements are moved in-place rather than recreated, maximizing speed and preserving local state.

```javascript
const items = papyr.state(["Apple", "Banana"]);

const list = papyr.ul(
  papyr.for(items, (item) => papyr.li(item))
);
```

---

## 🔄 5. Two-Way Data Bindings

### Option A: Inline Component Binding (`papyr.model`)
Simplifies form element updates using object destructuring:

```javascript
const message = papyr.state("");

const input = papyr.input("text", {
  ...papyr.model(message)
});
```

### Option B: Programmatic Element Binding (`papyr.bind`)
Binds an existing DOM node to a reactive state:

```javascript
const searchInput = document.getElementById("search");
papyr.bind(searchInput, message);
```
