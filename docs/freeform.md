# Papyrus Freeform Freedom

> Papyrus does not force developers into a single architecture.

Freeform Freedom is a core Papyrus principle. Papyrus acts as an orchestration layer that allows different technologies to coexist without vendor lock-in. Developers may progressively adopt Papyrus without rewriting existing projects.

---

## Framework Detection

```js
const env = papyr.freeform.detect();
// {
//   react: true,
//   vue: false,
//   angular: false,
//   svelte: false,
//   nextjs: true,
//   nuxt: false,
//   tailwind: true,
//   bootstrap: false,
//   materialDesign: false
// }
```

---

## Selective Subsystem Activation

In mixed-stack apps, you may only want specific Papyrus capabilities. Use `papyr.freeform.use()` to activate only what you need:

```js
// In a React app: use only reactivity and animation
papyr.freeform.use(['state', 'animate', 'theme', 'config']);

// In a Vue app: use routing and design tokens
papyr.freeform.use(['router', 'design', 'controls']);

// Minimal: only state signals and trust
papyr.freeform.use(['state', 'signal', 'trust']);

// Inspect what's active
papyr.freeform.activeSubsystems(); // ['state', 'animate', 'theme', 'config']

// Restore all subsystems
papyr.freeform.reset();
```

---

## Vanilla Mode

Prevents Papyrus from auto-initializing the router and PSSR hydration. All APIs remain fully accessible.

```js
// Disable auto-initialization — all APIs still accessible
papyr.freeform.vanilla();

// Use papyr.state() and papyr.animate() directly
const count = papyr.state(0);
count.subscribe(n => console.log('Count:', n));
count.value++;

// Check mode
papyr.freeform.isVanilla(); // true
```

---

## Vue 3 Bridge

```js
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// Install papyr bridge — injects papyr into Vue's global context
const { useSignal, useComputed } = papyr.freeform.vue(app);

app.mount('#app');

// --- In a Vue component (Options API) ---
// this.$papyr.state(0)
// this.$signal(0)

// --- In a Vue component (Composition API) ---
// import { inject } from 'vue';
// const papyr = inject('papyr');

// Use papyr signals as Vue-compatible refs
const counter = useSignal(0);
const doubled = useComputed(() => counter.value * 2);
```

---

## React Bridge

```js
// Via papyr-complete.js (full bridge):
const { useSignal, useComputed } = papyr.freeform.react();

// In a React component:
function Counter() {
  const count = papyr.state(0);
  const [value, setValue] = useSignal(0);

  return <button onClick={() => setValue(v => v + 1)}>{value}</button>;
}
```

---

## Progressive Adoption

You can adopt Papyrus incrementally without rewriting your project:

### Step 1: State only
```html
<script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
<script>
  papyr.freeform.use(['state', 'animate']);
  const dark = papyr.state(false);
  dark.subscribe(d => document.documentElement.classList.toggle('dark', d));
</script>
```

### Step 2: Add animation
```js
papyr.freeform.use(['state', 'animate', 'theme']);
papyr.controls.design.setTheme('dark');
papyr.controls.animation.setDuration(300);
```

### Step 3: Add WATT transparency
```js
papyr.freeform.use(['state', 'animate', 'watt', 'trust']);
papyr.watt.sdk.consent({ categories: ['analytics'] });
```

### Step 4: Full adoption
```js
papyr.freeform.reset(); // Activate everything
```

---

## Supported Technologies

Papyrus coexists with:

| Technology | Compatibility |
|-----------|--------------|
| Vanilla JavaScript | ✅ Full — `freeform.vanilla()` |
| React | ✅ Full — `freeform.react()` bridge |
| Vue 3 | ✅ Full — `freeform.vue(app)` bridge |
| Angular | ✅ Selective — use `papyr.freeform.use([...])` |
| Svelte | ✅ Selective — signals compatible |
| Next.js | ✅ Full — PSSR SDK compatible |
| Nuxt | ✅ Full — SSR compatible |
| Tailwind CSS | ✅ Full — no conflicts |
| Bootstrap | ✅ Full — no conflicts |
| Material Design | ✅ Coexists via CSS layers |
| Custom design systems | ✅ Full — design tokens extensible |
