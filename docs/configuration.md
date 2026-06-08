# Papyrus Configuration Reference

`papyr.config(domain, values)` is the single entry point for all Papyrus runtime configuration. It uses declarative domain-based settings that merge into an internal config store.

---

## Quick Reference

```js
papyr.config('rendering', { mode: 'ssr', targetFps: 60 });
papyr.config('animation', { duration: 300, reducedMotion: 'auto' });
papyr.config('layout',    { autoFlex: true, breakpoints: { sm: 640 } });
papyr.config('design',    { theme: 'dark', typography: { fontFamily: 'Inter' } });
papyr.config('watt',      { mode: 'default', banners: true });
papyr.config('ssr',       { hydrationStrategy: 'islands', streaming: true });
```

---

## Domain: `rendering`

Controls the rendering pipeline behavior.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `mode` | `'csr'|'ssr'|'ssg'|'isr'` | `'csr'` | Default rendering mode |
| `schedulerMode` | `string` | `'adaptive'` | Task scheduler strategy |
| `targetFps` | `number` | `60` | Target frames per second |
| `frameBudget` | `number` | `16` | Frame budget in ms (16 = 60fps) |
| `backgroundProcessing` | `boolean` | `true` | Allow background task processing |
| `virtualization` | `boolean` | `true` | Enable list virtualization |

```js
// Server-side rendering with 30fps for embedded devices
papyr.config('rendering', {
  mode: 'ssr',
  targetFps: 30,
  frameBudget: 33,
  backgroundProcessing: false
});
```

---

## Domain: `animation`

Global animation system configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `duration` | `number` | `300` | Default duration in ms |
| `curve` | `string` | `'ease-in-out'` | CSS easing function |
| `reducedMotion` | `'auto'|'force-reduce'|'force-normal'` | `'auto'` | Motion preference |
| `gpuAcceleration` | `boolean` | `true` | Enable GPU compositing |
| `springStiffness` | `number` | `200` | Spring physics stiffness |
| `springDamping` | `number` | `20` | Spring physics damping |

```js
// Accessible: respect OS reduced-motion preference
papyr.config('animation', { reducedMotion: 'auto' });

// Force disable for critical performance scenarios
papyr.config('animation', { reducedMotion: 'force-reduce' });

// Snappy, GPU-accelerated with spring physics
papyr.config('animation', {
  duration: 200,
  curve: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  gpuAcceleration: true,
  springStiffness: 300,
  springDamping: 25
});
```

---

## Domain: `layout`

Responsive layout system configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `autoFlex` | `boolean` | `true` | Automatic flexbox layout behavior |
| `breakpoints` | `Object` | `{ sm:640, md:768, lg:1024, xl:1280 }` | Responsive breakpoints (px) |
| `adaptiveNavigation` | `boolean` | `true` | Adaptive navigation behavior |

```js
papyr.config('layout', {
  breakpoints: { sm: 480, md: 768, lg: 1024, xl: 1440, '2xl': 1920 },
  autoFlex: true,
  adaptiveNavigation: true
});
```

---

## Domain: `design`

Design system and theming configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `theme` | `'light'|'dark'|'system'|string` | `'system'` | Active theme |
| `colorMode` | `'auto'|'light'|'dark'` | `'auto'` | Color mode preference |
| `typography.fontFamily` | `string` | `'system-ui'` | Primary font family |
| `typography.scale` | `number` | `1.0` | Typography scale multiplier |
| `reducedTransparency` | `'auto'|'force-reduce'|'force-normal'` | `'auto'` | Transparency preference |

```js
papyr.config('design', {
  theme: 'dark',
  colorMode: 'dark',
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    scale: 1.05
  },
  reducedTransparency: 'auto'
});
```

---

## Domain: `watt`

WATT (Web Access Transparency Toolkit) behavior configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `mode` | `'default'|'strict'|'none'` | `'default'` | WATT operating mode |
| `policies` | `Object` | All `'prompt'` | Per-API permission policies |
| `banners` | `boolean` | `true` | Enable transparency banners |
| `trackingConsent` | `boolean` | `true` | Require consent for tracking |

**WATT modes:**

| Mode | Behavior |
|------|----------|
| `'default'` | Standard WATT interception, `'prompt'` policies |
| `'strict'` | All hardware APIs set to `'deny'` automatically |
| `'none'` | **Full WATT disable** — developer's responsibility |

> [!CAUTION]
> Setting `mode: 'none'` disables ALL WATT interception including hardware API policies and network monitoring. This is the developer's full responsibility.

```js
// Strict privacy mode — deny all hardware access
papyr.config('watt', {
  mode: 'strict',
  banners: true,
  trackingConsent: true
});

// Per-API policies in default mode
papyr.config('watt', {
  mode: 'default',
  policies: {
    camera: 'deny',
    microphone: 'deny',
    location: 'prompt',
    notifications: 'prompt'
  }
});

// Developer opt-out (your responsibility)
papyr.config('watt', { mode: 'none' });
```

---

## Domain: `ssr`

SSR and PSSR rendering configuration.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `hydrationStrategy` | `'full'|'islands'|'lazy'|'none'` | `'islands'` | Hydration approach |
| `streaming` | `boolean` | `true` | Enable HTML streaming |
| `edge` | `boolean` | `false` | Enable edge deployment mode |

```js
papyr.config('ssr', {
  hydrationStrategy: 'islands',  // Hydrate only interactive islands
  streaming: true,               // Stream HTML chunks
  edge: true                     // Edge-optimized rendering
});
```

---

## Reading Config

```js
// Get a full domain
papyr.config.get('rendering');
// { mode: 'ssr', targetFps: 60, frameBudget: 16, ... }

// Get a specific value
papyr.config.get('watt.mode');    // 'default'
papyr.config.get('animation.duration');  // 300

// Full snapshot
const snapshot = papyr.config.getAll();
```

---

## Resetting Config

```js
// Reset a single domain to defaults
papyr.config.reset('animation');

// Reset all domains
papyr.config.reset();
```

---

## Watching Config Changes

```js
const handler = ({ domain, value }) => {
  console.log(`Config changed: ${domain}`, value);
};

papyr.config.on('change', handler);

// Unsubscribe
papyr.config.off(handler);
```

---

## Config Snapshots (via SDK)

```js
// Save current config
const snapshot = papyr.sdk.config.snapshot();

// Make temporary changes
papyr.config('animation', { reducedMotion: 'force-reduce' });

// Restore original state
papyr.sdk.config.restore(snapshot);

// Config domain summary
papyr.sdk.config.summary();
// { rendering: ['mode','schedulerMode',...], animation: [...], ... }
```
