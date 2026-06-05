# Framework Bridges API

This module details the official integration bridges mapping Papyrus state and component lifecycles into React, Next.js, Vue, and Svelte applications.

---

## 1. Svelte Action Mounting

Mount Papyr components into Svelte templates using Svelte actions:

```html
<script>
    import { MyComponent } from './components';
    import { papyr } from '@eldrex/papyr';
</script>

<!-- Action mounting ensures correct unmount lifecycle cleanups -->
<div use:papyr.svelte.mount={MyComponent} />
```

---

## 2. Vue Component Bridge

Interoperate Papyr components inside Vue templates using the Vue Bridge helper:

```html
<template>
  <div>
    <PapyrBridge :component="MyComponent" :props="componentProps" />
  </div>
</template>

<script>
import { papyr } from '@eldrex/papyr';

export default {
  components: {
    PapyrBridge: papyr.vue.Bridge
  },
  data() {
    return {
      MyComponent: () => papyr.div("Hello Vue!"),
      componentProps: {}
    }
  }
}
</script>
```

---

## 3. React Hooks & Next.js Islands

Synchronize React hooks with Papyr reactive states, or hydrate SSR components:

```javascript
import { usePapyrState } from '@eldrex/papyr/react';

function CounterComponent() {
    // Hooks count state and triggers React render on state updates
    const [count, setCount] = usePapyrState(myPapyrState);

    return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### Next.js SSR Island Hydration
```javascript
// Hydrates a target section on the client-side while keeping the rest static
import { PapyrHydrationIsland } from '@eldrex/papyr/next';

export default function Page() {
    return (
        <div>
            <h1>Static SSR Content</h1>
            <PapyrHydrationIsland id="interactive-chat" component={ChatComponent} />
        </div>
    );
}
```
