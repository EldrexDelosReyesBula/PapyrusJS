# Plugin Registry & Adapters

Papyr.js features a modular kernel architecture. Developers can extend core behaviors by registering custom plugins.

You can inspect the `PluginSystem` registry inside [papyr-core.js](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/src/core/papyr-core.js#L345-L380), and the native kernel adapters at [kernel-plugins.js](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/src/plugins/kernel-plugins.js).

---

## 🏗️ 1. Writing a Custom Plugin

A plugin is a standard JavaScript object matching this layout structure:

```javascript
const myCustomPlugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  permissions: ['storage', 'notifications'], // Checked by WATT permission gate

  // Executed during registration
  install(kernel) {
    kernel.sayHello = () => console.log("Hello from Plugin!");
  },

  // Kernel hook subscriptions
  hooks: {
    onInit() {
      console.log("Plugin initialized.");
    },
    onRender(el) {
      // Modify elements when they are constructed by tag builders
      if (el.tagName && el.tagName.toLowerCase() === 'input') {
        el.style.border = '2px solid #6366f1';
      }
    },
    onUpdate(stateObj) {
      // Trace reactive updates
      console.log("State updated in plugin:", stateObj.value);
    }
  }
};
```

---

## ⚡ 2. Registering Plugins

Register your plugin using the global `papyr.use()` function or `papyr.plugins.register()`:

```javascript
// Register plugin
papyr.use(myCustomPlugin);

// Invoke extended functionality
papyr.sayHello(); // "Hello from Plugin!"
```

---

## 📦 3. Native Kernel Plugins

Papyr bundle four official native plugins by default to handle layout formatting, accessibility, power throttling, and self-healing:

### A. Intent Engine (`papyr-intent-engine`)
Adds cinematic inline styling (`papyr.applyCinematic(el, 'cinematic')`) and spring-physics button hover/active animations.

### B. Accessibility Adapter (`papyr-accessibility-adapter`)
Monitors the DOM dynamically to automatically inject appropriate WAI-ARIA attributes, roles (like `role="button"` or `role="navigation"`), and `tabindex` on interactive elements.

### C. Self-Heal Engine (`papyr-self-heal`)
Spellchecks invalid HTML tags using a Levenshtein distance algorithm. If you write `papyr.buttn(...)`, it suggests using `button` in the browser console.

### D. Energy Adapter (`papyr-energy-adapter`)
Monitors device power levels to throttle animation frame rates and loop updates during battery-saver or idle modes.
