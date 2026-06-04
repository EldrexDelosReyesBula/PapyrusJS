# Security & Web Access Transparency Toolkit (WATT)

This guide details the security frameworks of Papyr.js, focusing on cross-site scripting (XSS) prevention, storage proxy sandboxes, Web Access Transparency Toolkit (WATT), Prototype Pollution enforcements, and Regular Expression Denial of Service (ReDoS) defenses.

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

### Custom Consent Prompts & Open Gateways (Banners, Modals, etc.)
Developers can customize the branding and labels of the default WATT modal dialog or override WATT's prompt handler completely to render a custom banner, a drawer, or integrate with corporate Consent Management Platforms (CMPs).

#### 1. Customizing the Default Modal
You can customize the titles, text labels, and privacy policy links using `papyr.watt.configure()`:
```javascript
papyr.watt.configure({
    branding: {
        title: "Enterprise Vault Shield",
        primaryColor: "#059669" // Custom Emerald theme color
    },
    reason: "We require camera access to perform identity scans.",
    labels: {
        accept: "Verify Identity",
        deny: "Cancel",
        linkText: "Read our GDPR Data Privacy Policy"
    },
    link: "https://my-company.com/gdpr"
});
```

#### 2. Overriding WATT to Build a Custom Banner or Consent Prompt
If you want to completely replace the default glassmorphic modal with a custom floating banner or top bar, simply override `papyr.watt.triggerWattPrompt`. Your custom function must call `onAllow()` if the user grants permission, or `onDeny()` if they reject it:

```javascript
// Override WATT's prompt gateway with a custom banner
papyr.watt.triggerWattPrompt = function (capabilityName, onAllow, onDeny, permissions) {
    const banner = papyr.div(".custom-privacy-banner", {
        style: {
            position: 'fixed', bottom: '0', left: '0', width: '100%',
            background: '#1e293b', borderTop: '2px solid #6366f1',
            padding: '20px', zIndex: 99999, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', color: '#fff'
        }
    },
        papyr.p(`🛡️ Privacy Alert: This application requests access to: **${capabilityName}**.`),
        papyr.flex.row({ style: "gap: 12px;" },
            papyr.button("Deny", {
                style: "background: #ef4444; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;",
                onclick: () => { banner.remove(); onDeny(); }
            }),
            papyr.button("Accept", {
                style: "background: #10b981; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;",
                onclick: () => { banner.remove(); onAllow(); }
            })
        )
    );
    document.body.appendChild(banner);
};
```

---

## 2. Prototype Pollution Mitigation Layer

Prototype Pollution (CWE-94) is an injection vulnerability where an attacker manipulates properties of `Object.prototype` (like `__proto__`, `constructor`, or `prototype`) to inject malicious attributes or alter application flow.

### Safe Property Access via Reflect APIs
Papyr mitigates Prototype Pollution across the entire kernel runtime and component render cycles by forbidding direct bracket notation assignments (`obj[key] = val`) on unverified properties. The framework enforces dynamic lookups using standard `Reflect` methods coupled with explicit key filters:

* **Reflect Set Wrapper**:
  ```javascript
  if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      Reflect.set(targetObject, key, value);
  }
  ```
* **Reflect Get Wrapper**:
  ```javascript
  if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      const value = Reflect.get(targetObject, key);
  }
  ```

### Null-Prototype Fallback Engines
Mock document objects created by the SSR/Node fallback compiler utilize null-prototype storage wrappers to eliminate inheritance exploits:
```javascript
const attributes = Object.create(null); // Completely immune to prototype pollution
```

---

## 3. Regular Expression Denial of Service (ReDoS) Defenses

ReDoS (CWE-185) exploits regular expression engines by triggering catastrophic backtracking on patterns containing overlapping or nested groups (like `(a+)+`).

### Strict Route Pattern Sanitization
The SPA router (`papyr.route` and `papyr.page`) sanitizes developer-defined route paths before building the matching regular expressions. Route templates are checked against a strict character whitelist:
```javascript
// Enforces route paths only contain safe, non-backtracking URL path characters
if (!/^[a-zA-Z0-9_/:.\-@~]*$/.test(cleanPath)) {
    throw new Error("Security Violation: Unsafe characters in route path pattern");
}
```
Any route containing metacharacters (such as `*`, `+`, `?`, `(`, `)`, `[`, `]`) is immediately rejected, completely neutralizing ReDoS vectors.

### AI NLP Extraction Enhancements
In `papyr.ai.toSemanticJSON`, dynamic regular expressions generated from schema key names are replaced with a clean string-index parsing technique. The engine scans the input text for keyword positions and performs boundary slice extraction, removing the dynamic `new RegExp` compilation step entirely.

---

## 4. Cross-Site Scripting (XSS) Protections

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

## 5. Storage Encryption Vaults

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

## 6. Recommended Content Security Policy (CSP)

Implement defense-in-depth by configuring a strict CSP header:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://papyrus-js.vercel.app; 
               style-src 'self' 'unsafe-inline';">
```
