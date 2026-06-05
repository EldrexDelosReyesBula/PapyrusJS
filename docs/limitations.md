# Known Limitations

While Papyr.js provides a simple and lightweight developer experience, it has specific architectural limitations that you should consider before using it in production.

---

## 1. Server-Side Rendering (SSR) Hydration

Historically, Papyr only supported basic static string compilation on the server:

```javascript
// Runs on Node.js server to output static string
const htmlString = papyr.ssr(papyr.div(".panel", "Server Data"));
```

Without client-side hydration, the client would need to completely replace the server-rendered DOM.

**Update in 3.1.2:** Papyr now supports hybrid hydration islands through its React/Next.js and Vue bridges, letting you selectively hydrate reactive sub-trees while keeping the rest of the layout static.

---

## 2. DOM Rendering Reflows on Large Lists

Because Papyr utilizes native DOM reconciliation rather than a virtual diff engine, rendering large lists (e.g. 5,000+ items) in a single frame can cause layout thrashing.

* **Reconciliation Cost:** Appending hundreds of elements in a single tick triggers browser layouts (reflows).
* **Memory Footprint:** Each list item registers active state dependencies and cleanup hooks (`_cleanups`).

**Update in 3.1.2:** You can mitigate this using the new **Priority Scheduler (`scheduler.js`)** to chunk heavy rendering operations across frames. Additionally, the **List Virtualization Layer (`virtualization.js`)** is available to dynamically render only the items visible in the user's viewport.


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
