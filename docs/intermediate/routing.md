# SPA Routing System

Papyr features two client-side single page application (SPA) routing systems natively built-in:
1.  **Clean URL System (`papyr.page`)**: Standard HTML5 History routing (`/about`, `/user/:id`) with auto link-interception.
2.  **Hash Routing System (`papyr.route`)**: Classic hash-based routing (`#/about`, `#/user/:id`) useful for static CDN hosts without rewrite capabilities.

You can inspect the router engine implementation at [router.js](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/src/core/router.js).

---

## 🌐 1. Clean URL System (`papyr.page`)

The Clean URL system utilizes the browser's `history.pushState` API and intercepts standard HTML anchor links to perform single-page routing without page refreshes.

### Defining Routes
Use `papyr.page(path, componentFn)` to define routes. You can pass a path string (supporting parameters prefixed with `:`) and a functional component:

```javascript
// Static Route
papyr.page('/', () => papyr.div("🏠 Home page contents"));

// Parameterized Route
papyr.page('/profile/:username', () => {
  const params = papyr.usePageParams();
  return papyr.div(
    papyr.h2(() => `User: ${params.value.username}`),
    papyr.p("Loaded dynamically from URL parameters.")
  );
});
```

### Rendering the Router Viewport
Render the router in your UI shell using `papyr.page()` or `papyr.pageRouter()`:

```javascript
const appShell = papyr.div(
  papyr.header(
    papyr.a({ href: '/' }, "Home"),
    papyr.a({ href: '/profile/alice' }, "Alice's Profile")
  ),
  papyr.main(
    papyr.page() // Yields active route component here
  )
);

papyr.mount("#app", appShell);
```

### Programmatic Navigation
Use `papyr.page.navigate(path)` to navigate programmatically:

```javascript
papyr.button("Go Home", {
  onclick: () => papyr.page.navigate('/')
});
```

### Automatic Link Interception
Any anchor tag `<a>` matching the same origin, without a hash (`#`), a download attribute, or `target="_blank"` is intercepted automatically. Clicking it triggers History API routing rather than a full page reload.

---

## 📑 2. Hash Routing System (`papyr.route`)

Hash routing operates under the `#` fragment and requires zero server rewrites.

### Defining Routes & Rendering
```javascript
// Define hash routes
papyr.route('/', () => papyr.div("Home View"));
papyr.route('/user/:id', () => {
  const params = papyr.useParams();
  return papyr.div(() => `User ID: ${params.value.id}`);
});

// Build app shell
const shell = papyr.div(
  papyr.div(
    papyr.button("Home", { onclick: () => papyr.navigate('/') }),
    papyr.button("User 42", { onclick: () => papyr.navigate('/user/42') })
  ),
  papyr.router() // Yields active hash-based view
);

papyr.mount("#app", shell);
```

---

## ⚡ Server Configuration for Clean URLs

When deploying an app using clean HTML5 URLs (`papyr.page`), the server must rewrite all page requests to `index.html`. 

For example, on Vercel, deploy with a [vercel.json](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/vercel.json):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
