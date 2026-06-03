# Contributor Coding Standards

To maintain code quality, security, and visual consistency across the Papyr.js ecosystem, all contributions must adhere to the standards outlined below.

Please read the root [CONTRIBUTING.md](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/CONTRIBUTING.md) for background details.

---

## 🛡️ 1. Security & XSS Prevention

Papyr prioritizes secure-by-default rendering.
-   **No Direct `innerHTML`:** Avoid setting `innerHTML` directly on DOM nodes unless it is in the standalone SSR package or has been run through `papyr.security.sanitize()`.
-   **Text Node Binding:** Functional element builders (e.g., `papyr.div(text)`) automatically append text as safe text nodes. When handling untrusted user input, keep it bound inside variables or wrap it in a sanitizer.
-   **Sanitization:** Run user-provided raw markup through the security API, located in [security.js](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/src/core/security.js):
    ```javascript
    const cleanHTML = papyr.security.sanitize(userInput);
    ```

---

## ⚡ 2. Reactive Mutations & State

-   **State Accessors:** Read and modify reactive state variables exclusively through `.value` (e.g., `state.value = newValue`). Do not reassign the wrapper reference itself.
-   **Teardown Cleanups:** If your component or plugin creates active subscriptions, interval timers, or event listeners, register cleanups on the element's `_cleanups` array so the lifecycle observer disposes of them automatically upon unmounting.

---

## 🎨 3. Design Aesthetics & Styling

To match Papyr's premium dark mode look, new visual components must adhere to these design guidelines:
-   **Color Variables:** Use HSL variables (e.g., `--primary: #6366f1` for electric violet, `--teal: #14b8a6`, `--bg-dark: #070913`, and `--bg-card: rgba(16, 22, 42, 0.65)`).
-   **Glassmorphism:** Apply frosted-glass style elements with high blur combined with thin semi-transparent border borders:
    ```css
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    ```
-   **Typography:** Set text elements using clean modern geometric fonts, like `Outfit` or `Fira Code`.
-   **SVG Vector Icons:** Favor clean SVGs via `papyr.icon(name)` instead of raw emojis to keep rendering crisp on high-DPI screens.

---

## 🛡️ 4. Namespace Collision Prevention

To run alongside other frameworks (such as jQuery or React) without collision, ensure code exports respect `papyr.noConflict()`. Restoring the original window namespace is essential for backwards compatibility in older client environments.
