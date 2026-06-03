# Storage API

This module details the browser LocalStorage and SessionStorage wrappers, sync obfuscation feedback ciphers, and asynchronous Web Crypto AES-256-GCM encryption vaults.

---

## Standard Storage Wrappers (`papyr.storage` / `papyr.session`)

Papyr provides simplified, dual-signature storage wrappers for LocalStorage (`papyr.storage`) and SessionStorage (`papyr.session`).

### Dual Call Signatures
You can read and write keys using direct function calls or explicitly via helper methods:

```javascript
// 1. Direct Calls (Write and Read)
papyr.storage("theme", "dark");       // Write key
let activeTheme = papyr.storage("theme"); // Read key (automatically parsed from JSON)

// 2. Explicit Helper Methods
papyr.storage.set("username", "Eldrex");
let name = papyr.storage.get("username");
papyr.storage.remove("username");
papyr.storage.clear(); // Clear all keys
```

---

## Synchronous Storage Obfuscation

Sync obfuscation is useful for preventing casual inspection of browser localStorage (e.g. by users opening devtools).

### Signature
```javascript
papyr.storage.secureSet(key, value, password)
let value = papyr.storage.secureGet(key, password)
```

### Warning
> [!WARNING]
> The synchronous methods `secureSet()` and `secureGet()` utilize **XOR + Base64 feedback obfuscation**. This does **NOT** provide true cryptographic security or defense against automated memory scrapers and malicious browser extensions.

---

## Asynchronous Real Cryptography (AES-256-GCM)

For sensitive user identifiers, tokens, and credentials, you **must** use the asynchronous methods. These utilize the browser's native **Web Crypto API**:
1. Derives keys using **PBKDF2** with SHA-256 iterations.
2. Encrypts data using **AES-256-GCM** with a random salt and IV.
3. Packages IV, Salt, and ciphertext into a single Base64 string wrapper.

### Signatures
```javascript
await papyr.storage.secureSetAsync(key, value, password)
let value = await papyr.storage.secureGetAsync(key, password)
```

### Example
```javascript
async function saveToken() {
    let credentials = { token: "secret-jwt-hash", expires: 3600 };
    let passphrase = "my-user-password";
    
    // ✅ Safely encrypted in storage using AES-256-GCM
    await papyr.storage.secureSetAsync("user_session", credentials, passphrase);
    
    // ✅ Retrieve and decrypt
    let session = await papyr.storage.secureGetAsync("user_session", passphrase);
    console.log("Decrypted session:", session.token);
}
```
* Note: If browser cryptography APIs are absent, it automatically falls back to sync obfuscation.
* Session storage (`papyr.session`) features identical secure async methods: `secureSetAsync` and `secureGetAsync`.
