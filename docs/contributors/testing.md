# Testing & Verification Guide

Papyr.js verifies functionality through a combination of compilation checks and browser-based test suites.

---

## ⚙️ 1. Compilation Verification

Before running tests, ensure the workspace compiles successfully. The compiler tests syntax correctness, bundle compression, and module wrapping:

```bash
# Execute the compiler script
node build.js
```

---

## 🧪 2. Browser Test Suites

The `tests/` directory contains interactive, browser-based sandboxes that serve as functional integration tests. You can open these files directly in your web browser:

*   **[todo.html](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/tests/todo.html):** Verifies reactive lists, state bindings, cleanups, and task toggles.
*   **[crud.html](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/tests/crud.html):** Asserts local, session, and async IndexedDB storage reads/writes.
*   **[animation.html](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/tests/animation.html):** Validates touch gesture tracking, spring animation properties, and physics ticks.
*   **[charts.html](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/tests/charts.html):** Verifies rendering of canvas formulas and dynamic plotting nodes.

---

## 🛠️ 3. Adding a New Test

When adding features or patching bugs, add a matching test:

1.  Create an HTML file in `tests/` (e.g. `tests/my-feature.html`).
2.  Import the compiled complete package:
    ```html
    <script src="../public/papyr-complete.js"></script>
    ```
3.  Implement your scenario and append diagnostic checks:
    ```javascript
    // Verify core behavior
    const testState = papyr.state("pass");
    if (testState.dump() !== "pass") {
      throw new Error("State dump failed!");
    }
    ```
