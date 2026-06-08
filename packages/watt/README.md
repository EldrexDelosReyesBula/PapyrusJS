# @eldrex/papyr-watt

> **WATT SDK — Web Access Transparency Toolkit Developer SDK**
>
> Part of the [Papyrus.js](https://github.com/EldrexDelosReyesBula/PapyrusJS) framework ecosystem.

[![npm version](https://img.shields.io/badge/npm-3.1.3-blue)](https://www.npmjs.com/package/@eldrex/papyr-watt)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/LICENSE)

---

## What is WATT?

WATT (Web Access Transparency Toolkit) is Papyrus's built-in privacy and transparency layer. It sits between your application and the browser's sensitive APIs — intercepting hardware permissions, sandboxing tracker storage, and enforcing consent before any personal data leaves the browser.

This package (`@eldrex/papyr-watt`) gives developers a **high-level SDK** to build privacy-first UI flows on top of WATT's enforcement core, without touching its protected internals.

```
Application
    ↓
papyr.watt.sdk     ← This package
    ↓
WATT Kernel        ← Core enforcement (Zone 1, immutable)
    ↓
Browser APIs       ← camera, location, storage, network
```

---

## Installation

### As part of the full Papyrus bundle (recommended)

```html
<script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
```

The WATT SDK is already included as `papyr.watt.sdk`.

### Standalone (CI/CD or server use)

```bash
npm install @eldrex/papyr-watt
```

```js
const { watt } = require('@eldrex/papyr-watt');
// or ESM
import { watt } from '@eldrex/papyr-watt';
```

---

## API Reference

### `papyr.watt.sdk.flow(options)` — Permission Flows

Request a hardware API permission with full UI lifecycle management:

```js
papyr.watt.sdk.flow({
    name: 'camera-access',         // Unique permission name
    apis: ['camera'],              // Hardware APIs required: camera | mic | location | notifications | usb | bluetooth
    onGranted: () => startVideo(), // Called when user grants permission
    onDenied: () => showFallback() // Called when user denies or WATT blocks
});
```

### `papyr.watt.sdk.consent(options)` — Consent Management

GDPR/CCPA-compliant consent banner with localStorage persistence:

```js
papyr.watt.sdk.consent({
    categories: ['analytics', 'marketing', 'preferences'],
    storageKey: 'my-app-consent',          // key for localStorage
    onConsentChange: (grantedCategories) => {
        if (grantedCategories.includes('analytics')) initGA();
        if (grantedCategories.includes('marketing')) initAds();
    }
});
```

### `papyr.watt.sdk.notice(options)` — Privacy Notices

Show lightweight, non-blocking GDPR/CCPA notices:

```js
papyr.watt.sdk.notice({
    type: 'gdpr',                  // 'gdpr' | 'ccpa' | 'cookie'
    message: 'We use cookies to improve your experience.',
    actionLabel: 'Accept',
    privacyUrl: '/privacy',
    duration: 6000                 // auto-dismiss ms (0 = persistent)
});
```

### `papyr.watt.sdk.dialog(options)` — Transparency Dialogs

Full transparency dialogs explaining what data is collected and why:

```js
papyr.watt.sdk.dialog({
    title: 'Why we need your location',
    body: 'Your location helps us show nearby results. We never store it.',
    actions: [
        { label: 'Allow Once', value: 'once' },
        { label: 'Always Allow', value: 'always' },
        { label: 'Deny', value: 'deny' }
    ],
    onAction: (value) => handleDecision(value)
});
```

### `papyr.watt.sdk.monitor` — Read-Only Event Stream

Listen to all WATT enforcement events without modifying them:

```js
papyr.watt.sdk.monitor.on('intercept', ({ api, policy, blocked }) => {
    console.log(`[WATT] ${api} → ${policy} (blocked: ${blocked})`);
});

papyr.watt.sdk.monitor.on('consent', ({ action, categories }) => {
    analytics.track('consent_changed', { action, categories });
});

papyr.watt.sdk.monitor.on('disclosure', ({ service }) => {
    console.log('Third-party registered:', service.name);
});
```

### `papyr.watt.sdk.disclose(service)` — Third-Party Registry

Register known third-party services for trust audit compliance:

```js
papyr.watt.sdk.disclose({
    name: 'Google Analytics',
    domain: 'google-analytics.com',
    type: 'analytics',              // analytics | payment | auth | cdn | ai | other
    dataCollected: ['page_views', 'session_duration'],
    privacyUrl: 'https://policies.google.com/privacy'
});
```

### `papyr.watt.sdk.card(options)` — Transparency UI Cards

Generate branded privacy cards for your privacy settings page:

```js
const card = papyr.watt.sdk.card({
    title: 'Analytics',
    description: 'Helps us understand how you use the app.',
    icon: '📊',
    status: 'active'
});

document.getElementById('privacy-panel').appendChild(card);
```

---

## WATT Operating Modes

Configure via `papyr.config('watt', { mode })` (requires `@eldrex/papyr`):

| Mode | Behavior |
|------|----------|
| `'default'` | Standard enforcement — APIs prompted, tracker cookies sandboxed |
| `'strict'` | All hardware APIs auto-denied, maximum privacy enforcement |
| `'none'` | Full WATT disable — developer's complete responsibility |

> **Warning:** `mode: 'none'` disables ALL WATT enforcement. Only use when implementing your own full privacy stack.

---

## Trust Boundaries

WATT SDK operates in **Zone 2** (Plugin/Developer layer) of the Papyrus trust model:

- **Zone 1 (Core)** — WATT enforcement kernel. Immutable. Cannot be overridden.
- **Zone 2 (SDK)** — `papyr.watt.sdk`. This package. Additive-only.
- **Zone 3 (Third-Party)** — Services you disclose via `sdk.disclose()`.
- **Zone 4 (Developer)** — Your application logic, auth, and compliance obligations.

---

## CI/CD Trust Audit

Use the `papyr-trust.js` standalone bundle to audit WATT state without a browser:

```js
const { trust } = require('@eldrex/papyr/dist/papyr-trust.js');
const result = trust.audit();

if (!result.passed) {
    console.error('Trust violations:', result.violations);
    process.exit(1);
}
```

---

## Related Packages

| Package | Description |
|---------|-------------|
| `@eldrex/papyr` | Core Papyrus framework |
| `@eldrex/papyr-pssr` | PSSR rendering strategy SDK |

---

## Documentation

- [WATT SDK Guide](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/watt-sdk.md)
- [Trust Boundaries](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/trust-boundaries.md)
- [Security Guide](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/guides/security.md)
- [Configuration API](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/configuration.md)
- [Full Documentation](https://papyrus-js.vercel.app/)

---

## License

[MIT](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/LICENSE) © Eldrex Delos Reyes Bula
