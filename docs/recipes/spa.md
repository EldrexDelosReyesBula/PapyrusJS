# Recipe: Single Page App (SPA) Routing

This recipe details how to structure a single-page application with navigation links, hash routers, dynamic parameter screens, and layout containers.

---

## Code Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: SPA router</title>
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
    <style>
        .app-shell { max-width: 600px; margin: 40px auto; font-family: sans-serif; }
        .nav-bar { display: flex; gap: 12px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
        .nav-btn { padding: 8px 16px; border: none; border-radius: 4px; background: #f3f4f6; color: #374151; cursor: pointer; }
        .nav-btn.active { background: #6366f1; color: white; }
        .view-box { padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; min-height: 150px; }
    </style>
</head>
<body>
    <div id="spa-mount"></div>
    <script>
        // 1. Navigation tracking state
        let activeRoute = papyr.state("/");

        // Track path string for nav-btn highlighting
        window.addEventListener('hashchange', () => {
            activeRoute.value = window.location.hash.slice(1) || "/";
        });

        // 2. Define route view renderers
        papyr.route("/", () => papyr.div(
            papyr.h3("🏠 Home Screen"),
            papyr.p("Welcome to the homepage. Navigation is fully client-side hash routing.")
        ));

        papyr.route("/specs", () => papyr.div(
            papyr.h3("📋 Specifications Details"),
            papyr.p("Check core configuration details here.")
        ));

        papyr.route("/profile/:username", () => {
            // Retrieve dynamic path params
            let params = papyr.useParams();
            return papyr.div(
                papyr.h3(() => `👤 User Profile: ${params.value.username}`),
                papyr.p("Loaded route parameter tokens successfully.")
            );
        });

        // 3. Main shell template
        let App = papyr.div(".app-shell",
            // Navigation Row
            papyr.nav(".nav-bar",
                papyr.button("Home", {
                    class: () => `nav-btn ${activeRoute.value === '/' ? 'active' : ''}`,
                    onclick: () => papyr.navigate("/")
                }),
                papyr.button("Specs", {
                    class: () => `nav-btn ${activeRoute.value === '/specs' ? 'active' : ''}`,
                    onclick: () => papyr.navigate("/specs")
                }),
                papyr.button("Profile: Alice", {
                    class: () => `nav-btn ${activeRoute.value === '/profile/alice' ? 'active' : ''}`,
                    onclick: () => papyr.navigate("/profile/alice")
                }),
                papyr.button("Profile: Bob", {
                    class: () => `nav-btn ${activeRoute.value === '/profile/bob' ? 'active' : ''}`,
                    onclick: () => papyr.navigate("/profile/bob")
                })
            ),

            // Yield Router element container
            papyr.div(".view-box",
                papyr.router()
            )
        );

        papyr.mount("#spa-mount", App);
    </script>
</body>
</html>
```

---

## Key Design Principles
* **`papyr.navigate` Shortcuts:** Triggers hash mutations (`#/specs`) which automatically trigger browser `hashchange` events.
* **Dynamic Parameter Parsing:** `papyr.useParams()` retrieves path tokens (e.g. `:username`).
* **Router Yield viewport:** The `papyr.router()` container wraps the active route rendering function in a conditional mount (`papyr.if`), swapping elements in place when the route changes.
