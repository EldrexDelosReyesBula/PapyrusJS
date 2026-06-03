# Core Concepts

This guide details the fundamentals of the Papyr.js execution model, focusing on state management, computed operations, elements rendering, and events tracking.

---

## The Reactivity Flow

Reactivity in Papyr operates in a single, predictable direction:

```
[User Input / Event] 
        │
        ▼
   [State Mutation] (.value = newValue)
        │
        ▼
 [Computed Re-evaluation] (only if dependencies changed)
        │
        ▼
   [Targeted DOM Updates] (directly mutates nodes)
```

---

## 1. Reactive State (`papyr.state` / `papyr.signal`)

A reactive state object is a wrapper around any standard JavaScript value (numbers, strings, arrays, objects). 

```javascript
let theme = papyr.state("dark");
```

* **Accessing Value:** Read or modify the value using the `.value` getter/setter property:
  ```javascript
  console.log(theme.value); // "dark"
  theme.value = "light";    // Triggers subscribers
  ```
* **Tracking Subscriptions:** When a function runs inside a reactive context (like rendering or computed evaluation), Papyr's reactivity manager intercepts the state's `.value` getter call, registering the current execution block as a subscriber.
* **Deep Object Observation:** Under the hood, Papyr wraps arrays and nested objects in a deep ES6 Proxy. This ensures operations like `tasks.value.push(newItem)` or nested modifications automatically trigger subscriber updates.

---

## 2. Computed Properties (`papyr.computed`)

Computed properties generate derived, read-only values based on other reactive states.

```javascript
let price = papyr.state(100);
let discount = papyr.state(20);

let salePrice = papyr.computed(() => price.value - discount.value);
```

* **Caching:** Computed states store their calculated value and mark themselves as clean. They re-evaluate only when their dependencies change. Reading a computed state multiple times is inexpensive.
* **Granular Cleanups:** Whenever a computed function re-evaluates, it cleans up dependencies from its previous run, preventing memory leaks caused by unused subscriptions.

---

## 3. Direct DOM Rendering

Papyr does not parse templates or use virtual DOM layers. Instead, components return native HTML elements created via functional builders.

When you pass a reactive state or a function to a tag creator, the builder binds it dynamically:

```javascript
let isVisible = papyr.state(true);

let box = papyr.div(
    // Evaluates condition and sets style display attribute
    { style: { display: () => isVisible.value ? 'block' : 'none' } },
    "I am a toggled viewport!"
);
```

Under the hood:
1. The tag builder creates a native DOM `div` node.
2. It wraps the inline function inside a fine-grained `effect`.
3. When `isVisible.value` is modified, the updater changes `el.style.display` directly, without touching any other node.

---

## 4. Lifecycle & Event Handling

### Native Events Integration
Pass standard inline event attributes (`onclick`, `oninput`, etc.) directly inside the options object:

```javascript
papyr.button("Submit", {
    onclick: (event) => console.log("Button clicked!", event)
});
```

### Element Lifecycles
Papyr's Intelligent Web Runtime Kernel monitors element additions and removals in the document using a global `MutationObserver`:

```javascript
let listCard = papyr.div({
    onMounted: (el) => console.log("Element is now attached to the DOM:", el),
    onUnmounted: (el) => console.log("Element has been removed:", el),
    onUpdated: (el) => console.log("Attributes or children mutated:", el)
}, "Content");
```

* **Automated Cleanup:** When an element is unmounted, Papyr automatically traverses its child tree and runs cleanup operations. This unsubscribes state listeners and removes event listeners, preventing memory leaks.
