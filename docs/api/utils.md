# Utilities API

This module details standard utility helpers, namespace overrides, and Server-Side Rendering (SSR) wrappers.

---

## General Helpers

### Ready Lifecycle (`papyr.ready`)
Executes a callback when the DOM tree has painted:
```javascript
papyr.ready(() => {
    console.log("DOM is ready. Mounting app...");
});
```

### Sleep Delay (`papyr.delay`)
Returns a Promise that resolves after a specified timeout:
```javascript
await papyr.delay(1000); // Wait 1 second
```

### Clipboard Wrapper (`papyr.copy`)
Writes text strings to the client clipboard:
```javascript
papyr.copy("Text to copy").then(() => {
    papyr.toast("Copied!");
});
```

### Fragments (`papyr.fragment`)
Groups elements inside a standard `DocumentFragment`. Useful for appending child sets without introducing wrapper `div` styling nodes:
```javascript
let fragment = papyr.fragment(
    papyr.p("Para 1"),
    papyr.p("Para 2")
);
```

### Inspect Element (`papyr.inspect`)
Returns the innerHTML string of an element tree:
```javascript
let el = papyr.div(".panel", papyr.span("Content"));
console.log(papyr.inspect(el)); // '<span>Content</span>'
```

---

## External CDN Framework Loaders

Injects popular CSS frameworks dynamically at runtime:

```javascript
papyr.loadFramework(framework)
```

* **Supported Frameworks:**
  * `'tailwind'`: Loads Tailwind CSS CDN runtime scripts.
  * `'bootstrap'`: Loads Bootstrap CSS styles and configures native dark theme overrides (`data-bs-theme="dark"`).

```javascript
papyr.ready(() => {
    // Scaffold UI using utility classes, then load framework
    papyr.loadFramework('tailwind');
});
```

---

## Namespace Isolation (`papyr.noConflict`)

Restores the global `window.papyr` namespace to its previous value (if another library uses it). Returns the active Papyr instance:

```javascript
const myPapyr = papyr.noConflict();

// window.papyr is restored to original libraries. 
// myPapyr references the Papyr engine:
let state = myPapyr.state("isolated data");
```

---

## Server-Side Rendering (`papyr.ssr`)

Compiles component trees into static HTML strings on a server (e.g. Node.js backend). If document environments are absent, the engine falls back to an isomorphic DOM model mock representation (`docFallback`).

### Signature
```javascript
let html = papyr.ssr(component)
```

### Example
```javascript
// Server-Side script
const createPapyr = require('./dist/papyr.js');
const papyr = createPapyr();

const staticHTML = papyr.ssr(
    papyr.div(".panel",
        papyr.h1("Welcome from Node Server!")
    )
);

console.log(staticHTML); 
// Outputs: '<div class="panel"><h1>Welcome from Node Server!</h1></div>'
```
* Note: Since hydration is not supported, the client must recreate and mount the element tree.
