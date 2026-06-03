# Monorepo Architecture & Builds

Papyr.js is managed as a monorepo workspace. This allows publishing the core framework alongside modular subpackages.

The monorepo configuration is defined in the root [package.json](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/package.json) and built using the compiler script [build.js](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/build.js).

---

## 📂 1. Workspace Layout

The code is split into several workspaces in the `packages/` folder:

*   **`packages/core` (`@eldrex/papyr`):** The reactive engine, base DOM builder, security wrappers, and standard element APIs.
*   **`packages/router` (`@eldrex/papyr-router`):** SPA router supporting hash and clean URL navigation.
*   **`packages/animate` (`@eldrex/papyr-animate`):** Motion, Verlet physics engine, and touch gesture interactions.
*   **`packages/charts` (`@eldrex/papyr-charts`):** Lightweight canvas-based graphing plotters and data charts.
*   **`packages/db` (`@eldrex/papyr-db`):** Unified storage layer (LocalStorage, SessionStorage, IndexedDB, SQLite, Firebase).
*   **`packages/ai` (`@eldrex/papyr-ai`):** Speech synthesizers, recognizers, and NLP semantic converters.
*   **`packages/auth` (`@eldrex/papyr-auth`):** Client-side authentication helpers.
*   **`packages/ssr` (`@eldrex/papyr-ssr`):** Lightweight Server-Side Rendering (SSR) bundle.

---

## ⚙️ 2. Build Pipeline (`build.js`)

The compilation script processes all files in `src/` to output production-ready scripts.

### Build Phases
1.  **Merge:** Concatenates separate ES modules and source files into singular packages.
2.  **ESM Wrap:** Wraps code in ESM export blocks supporting named exports.
    ```javascript
    export const signal = papyr.signal;
    export const computed = papyr.computed;
    ```
3.  **Minify:** Compresses code using `uglify-js` and generates sourcemaps.
4.  **Distribute:** Copies the generated assets and documentation files into `packages/<package-name>/dist/`.

### Standalone SSR Build
The build script compiles a dedicated SSR module. This module merges the reactivity engine and core DOM builder but omits heavy browser-only dependencies (like WebGL, Canvas, and machine learning models), maintaining a small package size.

---

## 🛠️ Running a Build

To build the packages locally, install developer dependencies and run the build script:

```bash
# Install dependencies (such as uglify-js)
npm install

# Run the compiler
npm run build
```
