# Migration Guides

This guide lists recipes and examples for migrating existing projects from other web technologies and libraries into the unified, dependency-free Papyr.js ecosystem.

---

## 1. From Vanilla JS to Papyr.js

In standard Vanilla JS, creating elements is verbose and requires manually updating nodes when data changes.

### Before (Vanilla JS)
```javascript
const button = document.createElement('button');
let count = 0;
button.textContent = `Clicked ${count} times`;
button.onclick = () => {
    count++;
    button.textContent = `Clicked ${count} times`;
};
document.body.appendChild(button);
```

### After (Papyr.js)
```javascript
let count = papyr.state(0);
let button = papyr.button(
    () => `Clicked ${count.value} times`,
    { onclick: () => count.value++ }
);
papyr.mount("body", button);
```

---

## 2. From React to Papyr.js

Migrate standard hooks (`useState`, `useEffect`) and JSX components to reactive builders without a compilation step.

### Before (React JSX)
```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="card">
      <p>Value: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### After (Papyr.js)
```javascript
function Counter() {
    const count = papyr.state(0);
    return papyr.div(".card",
        papyr.p(() => `Value: ${count.value}`),
        papyr.button("Increment", { onclick: () => count.value++ })
    );
}
```

---

## 3. From Vue to Papyr.js

Replace Vue's reactive refs and template syntax with inline builders.

### Before (Vue Composition API)
```html
<template>
  <div class="box">
    <h1>{{ title }}</h1>
    <input v-model="username" />
  </div>
</template>
<script setup>
import { ref } from 'vue';
const title = ref('Hello Vue');
const username = ref('');
</script>
```

### After (Papyr.js)
```javascript
const title = papyr.state('Hello Vue');
const username = papyr.state('');

const layout = papyr.div(".box",
    papyr.h1(() => title.value),
    papyr.input("text", {
        placeholder: "Enter username",
        ...papyr.model(username) // Two-way binding helper
    })
);
```

---

## 4. From Angular to Papyr.js

Simplify module systems and directive attributes.

### Before (Angular Component)
```typescript
@Component({
  selector: 'app-hello',
  template: `<button (click)="toggle()">Toggle: {{active}}</button>`
})
export class HelloComponent {
  active = false;
  toggle() { this.active = !this.active; }
}
```

### After (Papyr.js)
```javascript
const active = papyr.state(false);
const helloBtn = papyr.button(
    () => `Toggle: ${active.value}`,
    { onclick: () => active.value = !active.value }
);
```

---

## 5. From jQuery to Papyr.js

Ditch selector query cascades and state synchronization spaghetti.

### Before (jQuery)
```javascript
$(document).ready(function() {
    let items = ["Milk", "Eggs"];
    function render() {
        $("#list").empty();
        items.forEach(item => {
            $("#list").append(`<li>${item}</li>`);
        });
    }
    $("#add-btn").click(function() {
        items.push($("#input").val());
        render();
    });
    render();
});
```

### After (Papyr.js)
```javascript
const items = papyr.state(["Milk", "Eggs"]);
const app = papyr.div(
    papyr.input("text", { id: "input" }),
    papyr.button("Add", {
        onclick: () => {
            const val = document.getElementById("input").value;
            items.value = [...items.value, val];
        }
    }),
    papyr.ul(
        papyr.for(items, (item) => papyr.li(item))
    )
);
papyr.mount("body", app);
```
