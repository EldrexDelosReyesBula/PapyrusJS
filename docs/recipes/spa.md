# 🧭 Single Page App (SPA) Routing

A complete navigation solution for single-page applications using **hash-based routing**.

Features include active link highlighting, dynamic URL parameters, and a declarative router outlet.

[![Papyr.js](https://img.shields.io/badge/Papyr.js-SPA_Router-blue)](https://papyrus-js.vercel.app)

---

## 🚀 Live Demo Concept

### Features

- Client-side navigation with no page reloads
- Hash-based routing using URLs such as `#/profile/alice`
- Dynamic route parameters
- Automatic active-link highlighting
- Declarative router outlet rendering
- Fully reactive route state

---

## 🧠 Key Concepts

| Concept | Implementation |
|----------|----------------|
| **Route State** | `papyr.state()` tracks the current route |
| **Route Definitions** | `papyr.route(path, component)` maps URLs to views |
| **Dynamic Parameters** | `papyr.useParams()` extracts values from matched routes |
| **Navigation** | `papyr.navigate(path)` updates the URL and triggers routing |
| **Router Outlet** | `papyr.router()` renders the active route |
| **Active Navigation Classes** | Dynamic classes based on `activeRoute.value` |

---

## 📦 Full Example

Create an `index.html` file and paste the following:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: SPA Router</title>

    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>

    <style>
        .app-shell {
            max-width: 600px;
            margin: 40px auto;
            font-family: sans-serif;
        }

        .nav-bar {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
        }

        .nav-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: #f3f4f6;
            color: #374151;
            cursor: pointer;
        }

        .nav-btn.active {
            background: #6366f1;
            color: white;
        }

        .view-box {
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            min-height: 150px;
        }
    </style>
</head>

<body>
    <div id="spa-mount"></div>

    <script>
        // Route state
        let activeRoute = papyr.state("/");

        window.addEventListener("hashchange", () => {
            activeRoute.value =
                window.location.hash.slice(1) || "/";
        });

        // Home
        papyr.route("/", () =>
            papyr.div(
                papyr.h3("🏠 Home Screen"),
                papyr.p(
                    "Welcome to the homepage. Navigation is fully client-side hash routing."
                )
            )
        );

        // Specs
        papyr.route("/specs", () =>
            papyr.div(
                papyr.h3("📋 Specifications Details"),
                papyr.p(
                    "Check core configuration details here."
                )
            )
        );

        // Dynamic route
        papyr.route("/profile/:username", () => {
            let params = papyr.useParams();

            return papyr.div(
                papyr.h3(
                    () =>
                        `👤 User Profile: ${params.value.username}`
                ),
                papyr.p(
                    "Loaded route parameter tokens successfully."
                )
            );
        });

        // App shell
        let App = papyr.div(
            ".app-shell",

            papyr.nav(
                ".nav-bar",

                papyr.button("Home", {
                    class: () =>
                        `nav-btn ${
                            activeRoute.value === "/"
                                ? "active"
                                : ""
                        }`,
                    onclick: () => papyr.navigate("/")
                }),

                papyr.button("Specs", {
                    class: () =>
                        `nav-btn ${
                            activeRoute.value === "/specs"
                                ? "active"
                                : ""
                        }`,
                    onclick: () =>
                        papyr.navigate("/specs")
                }),

                papyr.button("Profile: Alice", {
                    class: () =>
                        `nav-btn ${
                            activeRoute.value ===
                            "/profile/alice"
                                ? "active"
                                : ""
                        }`,
                    onclick: () =>
                        papyr.navigate(
                            "/profile/alice"
                        )
                }),

                papyr.button("Profile: Bob", {
                    class: () =>
                        `nav-btn ${
                            activeRoute.value ===
                            "/profile/bob"
                                ? "active"
                                : ""
                        }`,
                    onclick: () =>
                        papyr.navigate("/profile/bob")
                })
            ),

            papyr.div(
                ".view-box",
                papyr.router()
            )
        );

        papyr.mount("#spa-mount", App);
    </script>
</body>
</html>
```

---

## 🔍 How It Works

### 1. Route State Tracking

```js
let activeRoute = papyr.state("/");

window.addEventListener("hashchange", () => {
    activeRoute.value =
        window.location.hash.slice(1) || "/";
});
```

- Stores the current route path.
- Updates whenever the URL hash changes.
- Triggers reactive UI updates automatically.

Example:

```text
#/                 -> /
#/specs            -> /specs
#/profile/alice    -> /profile/alice
```

---

### 2. Registering Routes

```js
papyr.route("/profile/:username", () => {
    let params = papyr.useParams();

    return papyr.div(
        papyr.h3(
            () => `👤 ${params.value.username}`
        )
    );
});
```

- Registers a route handler.
- Supports dynamic parameters using `:param`.
- Executes the component when the route matches.
- Makes parameters available through `papyr.useParams()`.

---

### 3. Programmatic Navigation

```js
papyr.navigate("/profile/alice");
```

Example button:

```js
papyr.button("Profile: Alice", {
    onclick: () =>
        papyr.navigate("/profile/alice")
});
```

When called:

1. Updates the URL hash
2. Fires the `hashchange` event
3. Updates route state
4. Re-renders the router outlet

---

### 4. Router Outlet

```js
papyr.router()
```

The router outlet:

- Watches route changes
- Finds the matching route
- Extracts dynamic parameters
- Renders the correct component

Think of it as the view container for your SPA.

---

### 5. Active Navigation Highlighting

```js
class: () =>
    `nav-btn ${
        activeRoute.value === "/"
            ? "active"
            : ""
    }`
```

Benefits:

- Automatically updates styling
- No manual DOM manipulation
- Always reflects the current route

---

## 🧩 Route Matching Rules

| Registered Route | URL | `useParams()` Result |
|------------------|------|---------------------|
| `/` | `#/` | `{}` |
| `/specs` | `#/specs` | `{}` |
| `/profile/:username` | `#/profile/alice` | `{ username: "alice" }` |
| `/profile/:username` | `#/profile/bob` | `{ username: "bob" }` |
| `/user/:id/post/:slug` | `#/user/42/post/hello-world` | `{ id: "42", slug: "hello-world" }` |

> Routes are matched in the order they are defined. Place more specific routes before generic routes.

---

## 💡 Advanced Patterns

### Nested Routes

```js
papyr.route("/dashboard/:section", () => {
    let params = papyr.useParams();

    return papyr.div(
        papyr.h3("Dashboard"),
        papyr.router()
    );
});

papyr.route(
    "/dashboard/:section/stats",
    () => {
        let params = papyr.useParams();

        return papyr.div(
            `Stats for ${params.value.section}`
        );
    }
);
```

---

### 404 Route

```js
papyr.route("*", () =>
    papyr.div(
        papyr.h3("404 - Page Not Found"),
        papyr.p(
            "The requested route does not exist."
        )
    )
);
```

---

### Route Guards

```js
papyr.route("/admin", () => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
        papyr.navigate("/login");

        return papyr.div(
            "Redirecting..."
        );
    }

    return papyr.div("Admin Panel");
});
```

---

### Reactive Route Parameters

```js
papyr.route("/product/:id", () => {
    let params = papyr.useParams();

    let product = papyr.computed(() => {
        return fetchProduct(
            params.value.id
        );
    });

    return papyr.div(
        () =>
            `Product: ${product.value.name}`
    );
});
```

---

## 🎨 Customization Ideas

### Browser History API

Replace hash routing with `history.pushState()` and `popstate` for cleaner URLs.

Example:

```text
/about
/profile/alice
/products/42
```

---

### Route Transitions

Add animations when routes change.

Ideas:

- Fade transitions
- Slide transitions
- Scale animations
- Shared element transitions

---

### Query Parameters

Support URLs such as:

```text
#/search?q=papyr
#/products?page=2
```

---

### Lazy Loading

Load route components only when needed.

Benefits:

- Faster startup
- Smaller bundle sizes
- Better scalability

---

### Breadcrumb Navigation

Generate navigation trails automatically:

```text
Home
 └─ Dashboard
     └─ Analytics
```

---

## 📚 Router API Reference

| API | Description |
|-------|-------------|
| `papyr.route(path, componentFn)` | Register a route |
| `papyr.router()` | Render the current route |
| `papyr.navigate(path)` | Navigate programmatically |
| `papyr.useParams()` | Access route parameters |
| `papyr.useRoute()` | Access route metadata |

---

### Supported Route Syntax

#### Static Routes

```text
/about
/contact
/specs
```

#### Dynamic Routes

```text
/user/:id
/post/:slug
/profile/:username
```

#### Multiple Parameters

```text
/user/:id/post/:slug
```

#### Wildcard Route

```text
*
```

Typically used for:

- 404 pages
- Catch-all routes
- Fallback navigation

---

## ✅ Summary

This recipe demonstrates a complete SPA routing system built with **Papyr.js**.

### Included Features

- ✅ Hash-based routing
- ✅ Client-side navigation
- ✅ Dynamic route parameters
- ✅ Active navigation highlighting
- ✅ Reactive route state
- ✅ Declarative router outlet
- ✅ No page reloads
- ✅ Fully self-contained
- ✅ Single HTML file
- ✅ No build tools required

Simply copy the code into `index.html`, open it in any modern browser, and start navigating between routes instantly.
