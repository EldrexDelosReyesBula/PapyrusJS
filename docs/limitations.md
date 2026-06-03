# Known Limitations

While Papyr.js provides a simple and lightweight developer experience, it has specific architectural limitations that you should consider before using it in production.

---

## 1. No Server-Side Rendering (SSR) Hydration

Papyr supports basic SSR string compilation:

```javascript
// Runs on Node.js server to output static string
const htmlString = papyr.ssr(papyr.div(".panel", "Server Data"));
```

However, it **does not support isomorphic hydration**. When the client receives this static markup:
* The client cannot automatically hook reactivity listeners onto the existing HTML elements.
* Instead, the client must recreate the component tree and mount it, completely replacing the static HTML.

**Recommended Workaround:** Use Papyr for client-rendered applications (SPAs) or static dashboards where initial search engine optimization (SEO) payload indexing is not a hard constraint.

---

## 2. DOM Rendering Reflows on Large Lists

Because Papyr utilizes native DOM reconciliation rather than a virtual diff engine, rendering large lists (e.g. 5,000+ items) can cause performance bottlenecks.

* **Reconciliation Cost:** Although `papyr.for()` reconciles elements in-place and preserves DOM nodes, appending hundreds of elements in a single tick triggers significant browser layouts (reflows).
* **Memory Footprint:** Each list item registers active state dependencies and cleanup hooks (`_cleanups`), which increases memory usage.

**Recommended Workarounds:**
* Implement pagination or infinite scrolling.
* Restrict list rendering size using queries:
  ```javascript
  let tasksList = myCrud.query({ limit: 50 });
  ```

---

## 3. Lack of Dedicated Browser DevTools

Unlike mature frameworks like React or Vue, Papyr does not have a browser extension for inspecting component state and dependency graphs.

**Recommended Workarounds:**
* Enable debug warnings:
  ```javascript
  papyr.debug(true);
  ```
* Register standard console logs inside watchers:
  ```javascript
  papyr.watch(myState, (val) => console.log("State updated:", val));
  ```
* Export the runtime context for inspection:
  ```javascript
  console.dir(papyr.exportContext());
  ```

---

## 4. Workaround Required for TypeScript Autocomplete

Papyr is written in Vanilla JS. While a declaration file `public/papyr.d.ts` is provided for VS Code, typescript configurations require manual setups:

* Autocomplete is active only if you reference `papyr.d.ts` inside your project's `tsconfig.json` files list.
* Native types compilation checks during compiler stages are not automatically generated in modular builds.
