# Components & Lifecycles

Papyr supports two styles of component modeling:
1.  **Functional Components**: Lightweight JavaScript functions that return elements.
2.  **Class Components**: Object-oriented structures extending the base `papyr.component` class.

Additionally, Papyr's Intelligent Web Runtime Kernel features a built-in MutationObserver-driven **Element Lifecycle Engine** to monitor element insertions and teardowns, which prevents memory leaks.

You can inspect the lifecycle runtime logic in [papyr-core.js](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/src/core/papyr-core.js#L1049-L1100).

---

## 🛠️ 1. Functional Components

Functional components are standard JavaScript closures. They accept an options/props object and return one or more elements:

```javascript
const TaskCard = (props) => {
  return papyr.div(".card", { style: { padding: '16px', background: '#1e293b' } },
    papyr.h3(props.title),
    papyr.p(props.description),
    papyr.button("Complete", { onclick: props.onComplete })
  );
};

// Usage
const element = TaskCard({
  title: "Write Documentation",
  description: "Restructure Papyr.js documentation guides.",
  onComplete: () => console.log("Done!")
});
```

---

## 🏗️ 2. Class Components

For complex objects or encapsulation, extend the base `papyr.component` class:

```javascript
class CounterWidget extends papyr.component {
  constructor(props) {
    super();
    this.props = props;
    this.localCount = papyr.state(0);
  }

  render() {
    return papyr.div(".widget",
      papyr.h4(this.props.title),
      papyr.button(
        () => `Count: ${this.localCount.value}`,
        { onclick: () => this.localCount.value++ }
      )
    );
  }
}

// Usage in routing or layouts:
papyr.route('/widget', CounterWidget);
```

---

## ⏱️ 3. Element Lifecycles

Every element created via Papyr's tag builders can declare lifecycle callbacks inside its options object:

```javascript
const userProfile = papyr.div({
  onMounted: (el) => {
    console.log("Profile component mounted to active DOM:", el);
  },
  onUnmounted: (el) => {
    console.log("Profile component unmounted, performing teardown:", el);
  },
  onUpdated: (el) => {
    console.log("Attributes or children of this profile changed:", el);
  }
}, "User Profile Content");
```

### How the Lifecycle Engine Works
-   **Mounting:** A global `MutationObserver` watches `document.body`. When an element is added, the engine recursively triggers `_onMounted(el)`.
-   **Unmounting & Teardown:** When an element is removed, the engine recursively triggers `_cleanupElement(el)`.
-   **Automatic Cleanup:** The unmount hook automatically clears all state subscriptions (`_cleanups`) registered on that element during its render lifecycle. This ensures event listeners and state dependencies are disposed of, preventing memory leaks without manual code.
