# Priority Scheduler & Recovery API

This module details the scheduling queue, adaptive energy throttles, and automated UI recovery components of the Papyrus performance core.

---

## 1. Priority Scheduler (`papyr.scheduler`)

Chunk heavy tasks or execute immediate actions using priority-budgeted frames:

### Signature
```javascript
papyr.scheduler.schedule(fn, priority);
```

### Parameters
* `fn` (Function): Task block to execute.
* `priority` (String): Scheduling tier:
  * `'immediate'`: Executed in microtask queue (`queueMicrotask`).
  * `'user-blocking'`: Executed in requestAnimationFrame.
  * `'normal'`: Executed via setTimeout (16ms frame budget limit).
  * `'idle'`: Executed in requestIdleCallback or background frames.

---

## 2. Adaptive Power Throttling (`papyr.power`)

Throttles loops and rendering based on document visibility, user inactivity, and battery level:

* **`papyr.power.state`**: Reactive state, returns `'active'`, `'idle'`, `'away'`, or `'suspended'`.
* **`papyr.power.fps`**: Current target frames-per-second (e.g. `60`, `30`, `15`, `5`, or `0` when suspended).
* **`papyr.power.throttle(callback)`**: Returns a frame-throttled execution loop linked to the power state.
* **`papyr.power.adaptiveEffects`**: Reactive boolean indicator to turn off heavy animations on low-battery/low-end devices.

---

## 3. UI Freeze Recovery (`papyr.recovery`)

Monitors main UI thread health and replaces frozen component layers automatically:

* **`papyr.recovery.enable(options)`**: Spawns frame-beat monitors:
  * `{ threshold: 500 }` (Number): Milliseconds threshold to trigger freeze recovery.
* **`papyr.recovery.disable()`**: Stops monitoring.
* **`papyr.recovery.recover(element)`**: Re-mounts and recovers a frozen element using its internal rendering cache.
* **`papyr.recovery.recoverAll()`**: Forces recovery sweep across all active DOM components.
