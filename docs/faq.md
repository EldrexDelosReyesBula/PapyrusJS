# Frequently Asked Questions (FAQ)

---

### Why should I use Papyr instead of React, Vue, or Svelte?

Traditional frameworks introduce complex development workflows (npm, bundlers, Webpack/Vite compilers) and require massive runtime files. 

**Use Papyr if:**
* You want to build interactive interfaces using simple HTML files.
* You need a lightweight solution (13KB core gzipped) with no external dependencies.
* You want direct DOM performance with fine-grained reactivity.
* You are teaching web development and want to avoid complex build tools.

---

### Is Papyr.js ready for production?

Papyr.js is currently in a active **Beta** stage. It is suitable for dashboard utilities, interactive prototypes, internal tools, and lightweight single-page applications. 

For high-traffic, mission-critical enterprise applications, consider the [Known Limitations](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/limitations.md). The software is provided under the MIT License on an "AS-IS" basis.

---

### Does it support Server-Side Rendering (SSR)?

**Partially.** The core module includes a static HTML string compiler:

```javascript
const staticHTML = papyr.ssr(
    papyr.div(".panel", papyr.h1("Welcome Server Rendered!"))
);
```

You can run this on a Node.js server (e.g. Express) to return formatted markup. However, it does not support hydration; the client must rebuild the reactive DOM tree upon load.

---

### How does Papyr prevent Cross-Site Scripting (XSS)?

By default, all elements created via tag builders treat string parameters as text nodes. This automatically escapes characters like `<` or `>` and prevents HTML injection:

```javascript
// Safe: The string is rendered as plain text, script is not executed
papyr.p("<script>alert('exploit')</script>");
```

If you need to render raw HTML strings safely, run them through the built-in sanitizer:

```javascript
let rawHTML = "<img src=x onerror='alert(1)'>";
let safeHTML = papyr.security.sanitize(rawHTML); // Strips the onerror attribute

// Render safely
let element = papyr.html(safeHTML);
```

---

### How do I use Papyr with Tailwind CSS or Bootstrap?

You can load CSS frameworks dynamically at runtime without any bundlers or link tags:

```javascript
// Inject Tailwind CSS dynamically
papyr.loadFramework('tailwind');

// Inject Bootstrap dynamically
papyr.loadFramework('bootstrap');
```
* Note: Loading Bootstrap automatically sets dark theme variables (`data-bs-theme="dark"`) on your document nodes.

---

### Can I use Papyr inside an existing React/Next.js/Vue/Svelte project?

**Yes, completely.** Papyr 3.1.2 introduces official framework bridges. You can mount Papyr components into Svelte using actions (`use:papyr.svelte.mount`), bind reactive state into React functional components via custom hooks, or render interactive islands in Next.js SSR apps without routing conflicts.

---

### How does isomorphic state persistence (`persist: true`) work under the hood?

When creating a state like `papyr.state(0, { persist: true, key: "user_clicks" })`:
1. During initialization, the engine checks for `localStorage` presence (safe from server-side Node crash).
2. It attempts to load any previous values mapped to `"user_clicks"`.
3. Whenever the reactive value changes, the setter serializes and stores the new value back to storage.

---

### What is Legacy Renovation Mode and when should I use it?

`papyr.renovate()` is a progressive migration tool designed for legacy pages (e.g. jQuery CRM, old PHP sites). It runs audits for accessibility, responsiveness, and outdated layouts, then replaces selected elements with modernized, reactive Papyr components on the fly without breaking surrounding markup or styling rules.

---

### Does Papyr's physics simulation run on a separate thread?

No, the built-in physics simulation runs a lightweight isomorphic update loop on the main browser thread. It uses an energy-aware manager to throttle updates when the window is inactive or when the device goes into low-battery mode, ensuring zero page lag.

