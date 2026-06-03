# State API

This module details the reactive state wrappers, watchers, subscriptions, and two-way input data bindings.

---

## State Wrapper (`papyr.state` / `papyr.signal`)

Creates an auto-tracking reactive state object.

### Signature
```javascript
let count = papyr.state(initialValue);
```

### Accessing Value
* Get or set the value using `.value`:
  ```javascript
  console.log(count.value); // 0
  count.value = 5;          // Re-renders dependent elements
  ```
* **Array/Object Mutations:** Arrays and objects are wrapped in an ES6 Proxy. Common mutating operations (such as `push()`, `splice()`, etc.) will automatically trigger subscriber notifications without replacing the array:
  ```javascript
  let tasks = papyr.state(["Task 1"]);
  tasks.value.push("Task 2"); // Auto-notifies and updates the UI
  ```

### Manual Subscriptions
Allows you to run a callback immediately and whenever the state value updates. Returns an unsubscribe function.

```javascript
let count = papyr.state(0);

let unsubscribe = count.subscribe((newValue) => {
    console.log("Count value is now:", newValue);
});

// Unsubscribe when cleaning up
unsubscribe();
```

---

## State Watchers (`papyr.watch`)

Watches a reactive state, computed state, or getter function. Triggers a callback whenever a mutation occurs, passing the new value and the previous value.

### Signature
```javascript
papyr.watch(target, callback)
```

### Example
```javascript
let count = papyr.state(0);

papyr.watch(count, (newVal, oldVal) => {
    console.log(`Updated from ${oldVal} to ${newVal}`);
});

count.value = 5; // Logs: "Updated from 0 to 5"
```

---

## Two-Way Data Binding (`papyr.bind` / `papyr.model`)

Eliminates form state synchronization boilerplate.

### Inline Model Binding (`papyr.model`)
Injects `value` and `oninput` handlers directly into element tags:

```javascript
let message = papyr.state("Default text");

let textInput = papyr.input("text", {
    ...papyr.model(message) // Two-way data binding
});
```

### Programmatic Binding (`papyr.bind`)
Binds an existing native input element to a state variable. Sets up two-way synchronizations and attaches cleanup hooks on element unmounting automatically.

```javascript
let username = papyr.state("Alice");
let nativeInput = document.getElementById("search-input");

papyr.bind(nativeInput, username);
```
* Note: Works seamlessly with checkboxes (bound via `.checked`), number inputs (parsed to Float), and standard text fields.
