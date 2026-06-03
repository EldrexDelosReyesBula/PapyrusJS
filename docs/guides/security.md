# Security & Web Access Transparency Toolkit (WATT)

This guide details the security frameworks of Papyr.js, focusing on cross-site scripting (XSS) prevention, storage proxy sandboxes, and Web Access Transparency Toolkit (WATT).

---

## 1. Web Access Transparency Toolkit (WATT)

WATT is an automated interception network built into Papyr's kernel that blocks scripts and cookies from tracking users without consent.

```
                  [Browser Storage API / Script Injection]
                                     │
                                     ▼
                      [WATT Interception Policy Check]
                                     │
                  ┌──────────────────┴──────────────────┐
        [Has Consent = True]                  [Has Consent = False]
                  │                                     │
                  ▼                                     ▼
        [Physical LocalStorage]               [Memory Sandbox Map]
```

### Storage Proxy Sandboxing
When active, WATT overrides the default browser storage API (`localStorage.setItem`, `getItem`, `removeItem`) using a proxy layer. 
* If a storage key matches a tracking signature (e.g. `_ga`, `_gid`, `_fbp`, `tracking`, `analytics`) and consent is absent, the key is redirected to a temporary in-memory `tempStorage` map.
* The real browser storage remains clean.
* When consent is granted via `papyr.security.setConsent(true)`, WATT flushes all sandboxed key-value pairs from memory into physical LocalStorage in a single transaction.

### Script Blocker Interception
If the privacy tier is configured to `'high'` or consent is denied in `'default'`, WATT overrides `document.createElement('script')` and element `src` getters. Scripts trying to load resources containing analytics domains (doubleclick, google-analytics, etc.) are blocked.

### Intercepting Hardware Permissions
WATT intercepts browser-level geolocation (`navigator.geolocation.getCurrentPosition`) and hardware media streams (`navigator.mediaDevices.getUserMedia`). When triggered, WATT displays a user-friendly consent modal. Native prompts execute only after user consent is granted in the modal.

---

## 2. Cross-Site Scripting (XSS) Protections

XSS occurs when malicious scripts are injected into trusted websites.

### Protected by Default
All tag elements created via Papyr builders automatically treat string arguments as text nodes:
```javascript
// Safe: Renders as text, scripts are not executed
papyr.p("<script>alert('xss')</script>");
```
All element properties are bound using native browser `setAttribute` or direct object assignment, which prevents standard HTML injection.

### Manual HTML Sanitization (`papyr.security.sanitize`)
If you must render raw user-supplied HTML strings, run them through the sanitizer first:
```javascript
let untrustedInput = "<img src=x onerror='alert(1)'>";
let clean = papyr.security.sanitize(untrustedInput); // Strips the onerror attribute
```

---

## 3. Storage Encryption Vaults

### Obfuscation Warning
> [!WARNING]
> The synchronous methods `papyr.storage.secureSet()` and `secureGet()` use **XOR + Base64 obfuscation**. While useful for stopping casual inspection of LocalStorage on a client machine, this does **NOT** provide true cryptographic security or protection against dedicated memory scrapers.

### Cryptographic Vault (AES-256-GCM)
For sensitive keys, tokens, or personal identifiers, use the asynchronous Web Crypto API integrations:
```javascript
// ✅ Save securely using AES-GCM 256-bit with PBKDF2 key derivation
await papyr.storage.secureSetAsync("session_token", { jwt: "secret-data" }, "user-passphrase");

// ✅ Retrieve and decrypt
let decrypted = await papyr.storage.secureGetAsync("session_token", "user-passphrase");
```

---

## 4. Recommended Content Security Policy (CSP)

Implement defense-in-depth by configuring a strict CSP header:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://papyrus-js.vercel.app; 
               style-src 'self' 'unsafe-inline';">
```
