# WATT SDK Developer Guide

> WATT SDK extends WATT without modifying its protected enforcement core.

The WATT SDK (`papyr.watt.sdk`) lets you build privacy-aware user experiences — permission flows, consent banners, transparency dialogs, and third-party disclosures — without touching WATT's internal enforcement mechanisms.

---

## Permission Flows

```js
// Guided UX for requesting hardware access
papyr.watt.sdk.flow({
  name: 'camera-onboarding',
  apis: ['camera'],
  onGranted: () => startCamera(),
  onDenied: () => showTextFallback()
});

// Multi-API flow
papyr.watt.sdk.flow({
  name: 'av-setup',
  apis: ['camera', 'microphone'],
  onGranted: (apis) => initAVStream(apis),
  onDenied: (apis) => console.log('Denied:', apis)
});
```

Shows a dialog explaining what API is needed and why, with Allow/Deny buttons. All decisions are logged through the WATT monitor.

---

## Transparency Dialogs

```js
papyr.watt.sdk.dialog({
  title: 'How we use your location',
  body: 'Your location is used to show nearby results. It is never stored on our servers.',
  actions: [
    { label: 'Allow', value: 'allow', primary: true },
    { label: 'Not now', value: 'deny' }
  ],
  onAction: (value) => {
    if (value === 'allow') papyr.controls.watt.setPolicy('location', 'allow');
  }
});
```

---

## Consent Management

```js
// Show consent banner with category selection
papyr.watt.sdk.consent({
  categories: ['analytics', 'marketing', 'personalization'],
  defaultState: 'none',              // Start with nothing granted
  storageKey: 'my-app-consent',      // localStorage key for persistence
  onConsentChange: (granted) => {
    if (granted.includes('analytics')) initGA();
    if (granted.includes('marketing')) initAds();
  }
});
```

Consent is persisted to `localStorage`. On subsequent page loads, the stored consent is restored without re-showing the banner.

---

## Privacy Notices

```js
// GDPR cookie notice
papyr.watt.sdk.notice({
  type: 'gdpr',
  message: 'We use cookies to improve your experience and analyze traffic.',
  actionLabel: 'Accept',
  privacyUrl: '/privacy-policy',
  onAccept: () => console.log('Notice accepted')
});

// CCPA notice (California)
papyr.watt.sdk.notice({
  type: 'ccpa',
  message: 'We do not sell your personal information.',
  actionLabel: 'Got it'
});
```

---

## API Access Monitor

Read-only event stream from WATT's enforcement layer. Never modifies policies.

```js
// Listen to all WATT intercepts
papyr.watt.sdk.monitor.on('intercept', ({ api, policy, blocked, url, timestamp }) => {
  console.log(`[WATT] ${api}: ${policy}, blocked=${blocked}, ts=${timestamp}`);
});

// Listen to consent events
papyr.watt.sdk.monitor.on('consent', ({ action, categories, timestamp }) => {
  console.log(`[Consent] ${action}: ${categories.join(', ')}`);
});

// Listen to disclosures
papyr.watt.sdk.monitor.on('disclosure', ({ service, timestamp }) => {
  console.log(`[Disclosed] ${service.name}`);
});

// Unsubscribe
papyr.watt.sdk.monitor.off(myHandler);
```

---

## Third-Party Disclosures

Registering disclosures prevents services from appearing in `papyr.trust.undisclosed()` audit warnings.

```js
papyr.watt.sdk.disclose({
  name: 'Google Analytics',
  domain: 'google-analytics.com',
  type: 'analytics',
  dataCollected: ['page_views', 'device_info', 'session_duration'],
  privacyUrl: 'https://policies.google.com/privacy'
});

papyr.watt.sdk.disclose({
  name: 'Stripe',
  domain: 'stripe.com',
  type: 'payment',
  dataCollected: ['payment_intent', 'card_fingerprint'],
  privacyUrl: 'https://stripe.com/privacy'
});
```

---

## Full Privacy Flow Example

```js
// 1. Disclose all third-party services
papyr.watt.sdk.disclose({ name: 'Google Analytics', domain: 'google-analytics.com', type: 'analytics' });
papyr.watt.sdk.disclose({ name: 'Stripe', domain: 'stripe.com', type: 'payment' });

// 2. Show consent banner
papyr.watt.sdk.consent({
  categories: ['analytics'],
  onConsentChange: (granted) => {
    if (granted.includes('analytics')) {
      initGA();
    }
  }
});

// 3. Monitor all API intercepts in development
if (import.meta.env.DEV) {
  papyr.watt.sdk.monitor.on('intercept', (e) => console.debug('[WATT]', e));
}

// 4. Audit trust state
papyr.trust.audit(); // Warns if anything is missing
```

---

## Bundle

```html
<!-- Standalone WATT SDK bundle -->
<script src="https://cdn.papyrjs.com/papyr-watt.js"></script>

<!-- ESM -->
<script type="module">
  import papyr from 'https://cdn.papyrjs.com/papyr-watt.esm.js';
</script>
```

```bash
npm install @eldrex/papyr-watt
```
