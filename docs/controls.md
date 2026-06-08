# Papyrus Controls Reference

Controls are imperative runtime capabilities that allow developers to influence how Papyrus behaves at runtime. Unlike `papyr.config()` which sets declarative state, controls are immediate actions.

---

## `papyr.controls.rendering`

Fine-grained rendering pipeline control.

| Method | Description | Example |
|--------|-------------|---------|
| `setPriority(level)` | Set task scheduling priority | `papyr.controls.rendering.setPriority('high')` |
| `setSchedulerMode(mode)` | Set the scheduler operational mode | `papyr.controls.rendering.setSchedulerMode('cooperative')` |
| `setVirtualization(opts)` | Configure virtualization settings | `papyr.controls.rendering.setVirtualization({ threshold: 50 })` |
| `setTargetFps(fps)` | Set target FPS (also updates `papyr.power`) | `papyr.controls.rendering.setTargetFps(30)` |
| `setFrameBudget(ms)` | Set per-frame budget in milliseconds | `papyr.controls.rendering.setFrameBudget(8)` |

**Priority levels:**
```
low       → 'idle' queue
normal    → 'normal' queue (default)
high      → 'user-blocking' queue
critical  → 'immediate' queue (microtask)
```

---

## `papyr.controls.animation`

Live animation system controls.

| Method | Description |
|--------|-------------|
| `setDuration(ms)` | Change default animation duration globally |
| `setCurve(curve)` | Change the default easing curve |
| `enableGPU()` | Force GPU acceleration (adds `papyr-gpu` class to root) |
| `disableGPU()` | Remove GPU acceleration |
| `disableAll()` | Force `force-reduce` motion (accessibility override) |
| `enableAll()` | Remove `force-reduce` motion override |
| `setSpring(stiffness, damping)` | Configure spring physics parameters |

```js
// Accessibility: force all motion off
papyr.controls.animation.disableAll();

// 120fps gaming mode: tight budget, GPU on
papyr.controls.rendering.setFrameBudget(8);
papyr.controls.animation.enableGPU();
papyr.controls.animation.setDuration(150);

// Reduce for low-end devices
papyr.controls.rendering.setTargetFps(30);
papyr.controls.animation.setDuration(600);
```

---

## `papyr.controls.layout`

Responsive layout runtime controls.

| Method | Description |
|--------|-------------|
| `setBreakpoints(bp)` | Override responsive breakpoints |
| `setResponsive(bool)` | Enable/disable auto-flex |
| `setAdaptiveNav(bool)` | Toggle adaptive navigation |

```js
papyr.controls.layout.setBreakpoints({ sm: 480, md: 768, lg: 1024 });
papyr.controls.layout.setResponsive(true);
```

---

## `papyr.controls.design`

Design system runtime modifications.

| Method | Description |
|--------|-------------|
| `setTheme(theme)` | Switch active theme ('light', 'dark', 'system', custom) |
| `setTokens(tokens)` | Inject CSS custom properties to root |
| `setTypography(opts)` | Update font family and type scale |
| `setScale(scale)` | Set global type scale multiplier |

```js
// Apply a branded dark theme with custom tokens
papyr.controls.design.setTheme('dark');
papyr.controls.design.setTokens({
  primary: '#6C63FF',
  secondary: '#FF6584',
  radius: '8px',
  shadow: '0 4px 16px rgba(0,0,0,0.2)'
});

papyr.controls.design.setTypography({
  fontFamily: 'Inter, system-ui, sans-serif',
  scale: 1.1
});
```

---

## `papyr.controls.watt`

WATT permission and UI controls.

| Method | Description |
|--------|-------------|
| `setPolicy(api, policy)` | Set a hardware API policy at runtime |
| `setMode(mode)` | Switch WATT operating mode |
| `showBanner(type)` | Show a WATT transparency banner |
| `dismissBanner()` | Remove all WATT banners from the DOM |
| `requestConsent(type, cb)` | Trigger a consent workflow |

```js
// Strict mode for sensitive applications
papyr.controls.watt.setPolicy('camera', 'deny');
papyr.controls.watt.setPolicy('microphone', 'deny');
papyr.controls.watt.setMode('strict');

// Show tracking transparency
papyr.controls.watt.showBanner('tracking');

// Request consent before enabling analytics
papyr.controls.watt.requestConsent('analytics', (categories) => {
  if (categories.includes('analytics')) initGA();
});
```

---

## `papyr.controls.scheduler`

Task scheduling and power management.

| Method | Description |
|--------|-------------|
| `setFrameBudget(ms)` | Milliseconds per frame budget |
| `setPowerMode(mode)` | Set power profile |
| `pause()` | Suspend all Papyrus rendering activity |
| `resume()` | Resume from suspended state |

**Power modes:**
```
performance  → full active state, max FPS
balanced     → active (default)
low-power    → idle state (15 FPS)
ultra-low    → away state (5 FPS)
```

```js
// Suspend rendering during heavy data fetch
papyr.controls.scheduler.pause();
const data = await fetchLargeDataset();
papyr.controls.scheduler.resume();

// Low-power mode for mobile battery savings
papyr.controls.scheduler.setPowerMode('low-power');
```

---

## SDK Controls Introspection

```js
// List all controls namespaces and their methods
papyr.sdk.controls.list();
// {
//   rendering: ['setPriority', 'setSchedulerMode', 'setVirtualization', ...],
//   animation: ['setDuration', 'setCurve', 'enableGPU', ...],
//   layout: ['setBreakpoints', 'setResponsive', 'setAdaptiveNav'],
//   design: ['setTheme', 'setTokens', 'setTypography', 'setScale'],
//   watt: ['setPolicy', 'setMode', 'showBanner', 'dismissBanner', 'requestConsent'],
//   scheduler: ['setFrameBudget', 'setPowerMode', 'pause', 'resume']
// }
```
