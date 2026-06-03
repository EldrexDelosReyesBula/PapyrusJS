# Routing API

This module details the zero-configuration hash SPA router.

---

## Defining Routes

Registers route renderer callback hooks. Supports static paths and dynamic parameter tokens.

### Signature
```javascript
papyr.route(path, component)
```

### Arguments
* `path` (String): Route pattern (e.g. `"/"`, `"/about"`, `"/user/:name"`).
* `component` (Function | Class): A function returning a DOM Element tree or a class extending `papyr.component`.

### Examples
```javascript
// Static Route
papyr.route("/", () => papyr.div("h1:Home Screen"));

// Dynamic Parameter Route
papyr.route("/user/:name", () => {
    let params = papyr.useParams();
    return papyr.div(
        papyr.h2(() => `Profile: ${params.value.name}`)
    );
});
```

---

## Route Parameter Access (`papyr.useParams`)

Returns a reactive state containing URL parameter key-value pairs.

### Signature
```javascript
let params = papyr.useParams();
```

### Accessing Parameters
Read properties from the `.value` dictionary:
```javascript
// If URL is #/user/alice
console.log(params.value.name); // "alice"
```
Because `useParams()` returns a reactive state, elements referencing parameter properties inside calculations update dynamically when route parameters shift.

---

## Navigation (`papyr.navigate`)

Changes the URL hash programmatically.

### Signature
```javascript
papyr.navigate(path)
```

### Example
```javascript
papyr.button("Go to Profile", {
    onclick: () => papyr.navigate("/user/bob")
});
```

---

## Routing Viewport Container (`papyr.router`)

Renders and swaps active route component viewports. Place this call in your layout templates where route content should yield.

### Signature
```javascript
let viewport = papyr.router();
```

### Scaffolding Router App
```javascript
// Register routes
papyr.route("/", () => papyr.div("Welcome to Homepage"));
papyr.route("/settings", () => papyr.div("Settings Panel"));

// Layout template
let AppLayout = papyr.div(".app",
    papyr.nav(
        papyr.button("Home", { onclick: () => papyr.navigate("/") }),
        papyr.button("Settings", { onclick: () => papyr.navigate("/settings") })
    ),
    papyr.main(
        papyr.router() // Yield active viewports here
    )
);

papyr.mount("#app", AppLayout);
```
* Note: Unmatched paths will display a default `404 - Route Not Found` layout.
