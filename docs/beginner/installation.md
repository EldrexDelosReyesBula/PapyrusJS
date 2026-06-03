# Installing Papyr.js

Getting started with Papyr is designed to be frictionless. Whether you are building a simple sandbox page or setting up a full-scale web application, Papyr adapts to your development workflow.

---

## 🚀 Option 1: CDN (Zero-Build Setup)

The quickest way to start using Papyr is by including the runtime compiler directly from the CDN. Add one of the following script tags to the `<head>` of your HTML document:

### A. Complete Standard Build (Includes AI, DB, and Physics)
For full-featured local prototyping:
```html
<script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
```

### B. Core Only Build (Ultra-Lightweight)
If you only need reactivity, DOM building, and basic routing:
```html
<script src="https://papyrus-js.vercel.app/papyr.js"></script>
```

### C. ES Module Build (For modern import workflows)
```html
<script type="module">
  import { papyr, signal, computed, watch } from 'https://papyrus-js.vercel.app/papyr-complete.esm.js';
</script>
```

---

## 📦 Option 2: Package Manager (npm)

For modern monorepos or standard bundler systems (like Vite or Webpack), install Papyr via your package manager:

```bash
# Core package
npm install @eldrex/papyr
```

### Subpackages & Extension Modules

Papyr 3.0.1 introduces modular subpackages that you can install as needed:

*   **Authentication Hub:**
    ```bash
    npm install @eldrex/papyr-auth
    ```
*   **Server-Side Rendering (SSR):**
    ```bash
    npm install @eldrex/papyr-ssr
    ```
*   **Database Storage Sync:**
    ```bash
    npm install @eldrex/papyr-db
    ```
*   **Physics, Canvas, and Motion:**
    ```bash
    npm install @eldrex/papyr-animate
    ```

---

## 🛠️ TypeScript Support

Papyr ship with comprehensive TypeScript typings. If you are using VS Code or any modern IDE, IntelliSense autocompletes automatically.

You can inspect the full typing signatures in [papyr.d.ts](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/public/papyr.d.ts).

---

## Next Steps

Now that you've installed Papyr, let's build your very first app! Head over to the [First App Guide](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/docs/beginner/first-app.md).
