# The Papyr Way

Papyr.js is designed to be lightweight and simple, but like all toolkits, it has a specific mental model. To build highly performant, bug-free web interfaces, you must write code according to **The Papyr Way**.

---

## 1. UI is a Function of State

In Papyr, you never query an element to get its value or mutate its content manually. Instead, you declare the relationship between your data and your elements.

$$\text{State} \rightarrow \text{UI}$$

Mutate the data state, and let the library mutate the DOM automatically.

---

## 2. No Virtual DOM (Direct Targeted Updates)

Traditional frameworks like React construct a full Virtual DOM tree and diff it on every update. This adds CPU overhead and requires compilers.

Papyr tracks reactive dependencies at a granular level. When a state modifies, only the specific text node or attribute registered in that state's subscribers list updates, leaving the rest of the element tree completely untouched.

---

## 3. Keep Heavy Logic Outside UI Templates

Because Papyr executes reactive updater expressions whenever dependencies mutate, placing heavy operations inline will degrade performance.

### ❌ BAD (Inline computations run on every trigger)
```javascript
let count = papyr.state(100);

let el = papyr.p(() => {
    // This expensive calculation runs every single time count is updated!
    return computePrimes(count.value);
});
```

### ✅ GOOD (Leveraging cached calculations)
```javascript
let count = papyr.state(100);

// Computed cached state. Re-evaluates only when count changes.
let primeResult = papyr.computed(() => computePrimes(count.value));

let el = papyr.p(() => primeResult.value);
```

---

## 4. Prefer Computed States Over Inline Logic

Use `papyr.computed` to wrap calculations that depend on multiple states. This encapsulates the logic, keeps your layout code clean, and prevents redundant updates:

```javascript
let price = papyr.state(49.99);
let quantity = papyr.state(3);
let taxPercent = papyr.state(0.12);

// Combined computed total
let totalPrice = papyr.computed(() => {
    let subtotal = price.value * quantity.value;
    return subtotal * (1 + taxPercent.value);
});

// Clean rendering declaration
let checkoutUI = papyr.div(
    papyr.p(() => `Subtotal items: ${quantity.value}`),
    papyr.h3(() => `Total cost: $${totalPrice.value.toFixed(2)}`)
);
```

---

## 5. Build with Small Reusable Functions

Instead of massive monolithic blocks, break components down into simple functions that return elements. This keeps code readable and maintainable:

```javascript
// Reusable component function
function Header(titleText) {
    return papyr.header(".app-header",
        papyr.h1(titleText),
        { style: { borderBottom: '1px solid #ccc', paddingBottom: '10px' } }
    );
}

function Layout() {
    return papyr.div(".wrapper",
        Header("Settings Panel"),
        papyr.main(
            papyr.p("Edit configuration settings here.")
        )
    );
}
```

---

## 6. Papyr is Reactive, Not Declarative-Only

Unlike declarative frameworks that force you to work completely within component templates, Papyr is fully compatible with procedural styles. You can read, write, and observe state changes anywhere in your application:

```javascript
let pageTitle = papyr.state("Home");

// Set up watcher outside component render tree
papyr.watch(pageTitle, (newTitle) => {
    document.title = `${newTitle} | My Portal`;
});

// Mutate states pro-actively inside async fetch callbacks
setTimeout(() => {
    pageTitle.value = "Dashboard";
}, 2000);
```
