# Security & WATT Integration

Papyr takes application security and privacy seriously. It includes a built-in **Web Access Transparency Toolkit (WATT)** system, a security module for cryptographic vault storage, and cross-site scripting (XSS) sanitation.

The WATT source code is located at [watt.js](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/src/plugins/watt.js).

---

## 🔒 1. Web Access Transparency Toolkit (WATT)

WATT acts as a runtime gatekeeper that intercepts browser-tracking scripts and hardware APIs at the kernel level. Before allowing access, it presents a user-friendly consent modal.

### API Interceptions
WATT automatically intercepts the following capabilities:
-   **Geolocation:** Intercepts `navigator.geolocation.getCurrentPosition`.
-   **Media Devices:** Intercepts `navigator.mediaDevices.getUserMedia` (Camera and Microphone access).
-   **Plugin Installation:** Intercepts `papyr.plugins.register` if a plugin requests specific permissions.

---

## 🛡️ 2. Security Tiers & Cookie/Tracker Sandboxing

WATT lets you restrict local tracking and scripts by setting a policy tier using `papyr.watt.setTier(tier)`:

-   `'none'`: Interception is completely disabled.
-   `'default'`: Sandboxes tracker-related LocalStorage entries (e.g. `_ga`, `_gid`, `tracking`) in memory until the user explicitly grants consent.
-   `'high'`: Hard blocks all tracking dependencies and third-party scripts.

```javascript
// Configure security level
papyr.watt.setTier('default');

// Request tracking consent programmatically
papyr.watt.requestTracking({
  purpose: "We use analytics to optimize our platform's responsiveness.",
  onAllow: () => console.log("User consented to tracking."),
  onDeny: () => console.log("User requested no tracking.")
});
```

---

## 🔑 3. Safe Local Cryptographic Vaults

For client-side data persistence, Papyr provides two storage tiers:

### Obfuscated Storage (Synchronous)
> [!WARNING]
> The synchronous methods `papyr.storage.secureSet()` and `papyr.storage.secureGet()` use **XOR + Base64 obfuscation**. This protects data from casual inspection in LocalStorage, but it is **NOT** cryptographically secure.

### True AES-GCM Encryption (Asynchronous)
For storing sensitive authentication tokens or API keys, use the asynchronous Web Crypto API wrappers:

```javascript
const password = "user-passphrase-key";

// Encrypt and store data
await papyr.storage.secureSetAsync("vault_key", { jwt: "123-secret" }, password);

// Decrypt and retrieve data
const decrypted = await papyr.storage.secureGetAsync("vault_key", password);
console.log(decrypted.jwt); // "123-secret"
```

The underlying cryptography operations are detailed in [security.js](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/src/core/security.js).
