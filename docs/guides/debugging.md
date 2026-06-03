# Debugging & Diagnostics

This guide details the debugging features in Papyr.js, including developer warnings, reactivity tracking, and console logging helpers.

---

## 1. Enabling Debug Mode

To see framework warnings and performance logs, enable debug mode:

```javascript
papyr.debug(true);
```

When active:
* The kernel logs verification details to the console.
* Displays warnings when unsupported HTML tags are used.
* Catches and reports syntax mismatches.

---

## 2. Spellcheck Typo Warnings

If you write a typo in an element tag creator name (e.g. `papyr.buton("Click")`), Papyr calculates the Levenshtein distance against valid HTML5 tags.

If the distance is small, it throws a console warning suggesting the correct tag:

```
PapyrWarning: Unknown tag "buton". Did you mean "button"?
```

This helps you catch typos immediately, especially if you are not using TypeScript.

---

## 3. Recommended Console Log Helper

If you are debugging on mobile devices or using browser consoles that truncate object properties, add this custom helper to your entry script:

```javascript
window.log = (...args) => {
    // Stringify states or objects automatically
    const formatted = args.map(arg => {
        if (arg && typeof arg.subscribe === 'function') {
            return `State(${JSON.stringify(arg.value)})`;
        }
        return typeof arg === 'object' ? JSON.stringify(arg) : arg;
    });
    console.log('[Papyr]', ...formatted);
};
```

### Usage
```javascript
let tasksList = papyr.state([{ id: 1, text: "Refactor docs" }]);

log("Active tasks list:", tasksList); 
// Logs: "[Papyr] Active tasks list: State([{\"id\":1,\"text\":\"Refactor docs\"}])"
```

---

## 4. Common Troubleshooting Patterns

### State Updates but DOM Does Not Change
* **Cause:** You did not pass a reactive context (a function or computed state) to the tag creator.
* **❌ Incorrect (Evaluated only once on initial mount):**
  ```javascript
  let count = papyr.state(0);
  let el = papyr.button(`Count: ${count.value}`);
  ```
* **✅ Correct (Pass a function to enable reactivity):**
  ```javascript
  let count = papyr.state(0);
  let el = papyr.button(() => `Count: ${count.value}`);
  ```

### Elements Are Not Rendered
* **Cause:** The target container was not found when `papyr.mount()` ran.
* **Troubleshooting:**
  * Verify that the DOM is ready using `papyr.ready()` before calling mount.
  * Ensure the target selector (e.g. `#app`) matches the element ID in your HTML markup.

### Canvas Graphs Fail to Render
* **Cause:** You called `papyr.charts()` before the canvas element was mounted.
* **✅ Correct (Run inside the `onMounted` hook):**
  ```javascript
  let chartCanvas = papyr.canvas({
      id: "sales-chart",
      onMounted: () => {
          papyr.charts("sales-chart", { type: 'bar', data: [10, 20] });
      }
  });
  ```
