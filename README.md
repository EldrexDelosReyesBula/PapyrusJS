# 📄 Papyr.js — Simple Inside, Beautiful Outside

> **Write modern, secure, and reactive web applications with zero dependencies and zero compile steps.**

---

## ⏱️ Start in 60 Seconds

Create an HTML file and run this minimal working code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello Papyr.js</title>
    <!-- Include CDN -->
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        // Create reactive state
        let count = papyr.state(0);

        // Render UI
        let app = papyr.div({ style: { padding: '40px', fontFamily: 'sans-serif' } },
            papyr.h1("Greetings from Papyr.js! 🚀"),
            papyr.button(
                () => `Clicked ${count.value} times`,
                { 
                    onclick: () => count.value++,
                    style: { padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }
                }
            )
        );

        papyr.mount("#app", app);
    </script>
</body>
</html>
```

---

## 💡 What is Papyr?
* **Direct DOM Rendering:** Updates only the targeted DOM nodes when state changes—bypassing Virtual DOM diff overhead.
* **Reactive State Engine:** Precise, dependency-tracking subscription-based reactivity (inspired by SolidJS and Vue).
* **Zero Dependencies:** A single unified file that packages layout grids, animations, local storage databases, and AI helpers.

---

## 🛠️ What You Can Build
* **Aesthetic Portals & Dashboards:** Built-in HSL theme engines, collapsible persistent sidebars, and responsive viewport folding structures.
* **Offline-First CRUD Apps:** Synchronized SQLite, IndexedDB, and LocalStorage drivers.
* **Cinematic Micro-Interactions:** Touch gesture trackers, particle backgrounds, and hardware-accelerated Verlet physics integrations.

---

## 🎯 Core Idea

$$ \text{State} \rightarrow \text{UI updates automatically} $$

When a state's `.value` mutations occur, the Papyr Runtime Engine executes targeted updates specifically on the elements that referenced that state.

---

## 📚 Learn Next

Explore the official documentation:

* 🚀 [Getting Started](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/docs/getting-started.md)
* 🧠 [The Papyr Way](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/docs/papyr-way.md)
* 📦 [Core Concepts](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/docs/core-concepts.md)
* 📖 [Master API Reference](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/docs/api/)
* 🍔 [Practical Recipes](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/docs/recipes/)
* 🛡️ [Security & WATT](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/docs/guides/security.md)
---

## 🧪 Interactive Demos

Run and inspect the interactive test suites inside the browser:
* 📝 [Interactive Todo Checklist](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/tests/todo.html)
* 💾 [Multi-Engine CRUD Database Sandbox](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/tests/crud.html)
* 🎬 [Touch Gestures & Spring Physics Sandbox](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/tests/animation.html)
* 📈 [Canvas Formula Graphing Plotter](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/tests/charts.html)
---

## ⚙️ Installation

### CDN (Zero Build Setup)
Include the compiled single runtime module inside your HTML:
```html
<script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
```

### Package Manager
```bash
npm install @eldrex/papyr
```

```javascript
import { papyr } from '@eldrex/papyr';
```

---

## 📄 License
Papyr.js is distributed under the [MIT License](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/LICENSE).
