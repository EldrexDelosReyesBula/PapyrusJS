/**
 * PAPYR SECURITY KERNEL
 * Enterprise-grade XSS Sanitization and Injection Prevention.
 * Web Access Transparency Toolkit (WATT) script and storage filter.
 * Updated to run modularly inside the Papyr Kernel context.
 */

(function () {
    let tempStorage = Object.create(null);
    const trackingKeys = ['_ga', '_gid', '_fbp', '_uid_tracking_id', 'tracking', 'analytics', 'pixel', 'adsense'];

    let originalSetItem = null;
    let originalGetItem = null;
    let originalRemoveItem = null;

    if (typeof window !== 'undefined' && window.localStorage) {
        if (typeof localStorage.setItem === 'function') originalSetItem = localStorage.setItem.bind(localStorage);
        if (typeof localStorage.getItem === 'function') originalGetItem = localStorage.getItem.bind(localStorage);
        if (typeof localStorage.removeItem === 'function') originalRemoveItem = localStorage.removeItem.bind(localStorage);
    }

    coreInitializers.push((papyr) => {
        const policies = {
            camera: 'prompt',
            microphone: 'prompt',
            location: 'prompt',
            storage: 'allow'
        };

        function securityConfig(config) {
            if (typeof config === 'object' && config !== null) {
                Object.assign(policies, config);
                console.log("🔒 Papyr Security Policy Engine updated:", policies);
            }
            return policies;
        }

        Object.assign(securityConfig, {
            _isActive: true, // Enabled by default for safety
            currentTier: 'default',
            hasConsent: false,
            _scriptsBlocked: false,

            get policies() {
                return policies;
            },

            setTier(tier) {
                this.currentTier = tier;
                if (tier === 'high') {
                    this.blockThirdPartyScripts();
                }
            },

            setConsent(granted) {
                this.hasConsent = !!granted;
                if (granted) {
                    // Flush tempStorage back to real localStorage
                    try {
                        if (originalSetItem) {
                            Object.entries(tempStorage).forEach(([k, v]) => {
                                originalSetItem(k, v);
                            });
                        }
                        tempStorage = Object.create(null);
                    } catch (e) { }
                } else {
                    // Clear tracking keys from real localStorage
                    try {
                        if (originalRemoveItem) {
                            const keysToDelete = [];
                            for (let i = 0; i < localStorage.length; i++) {
                                let key = localStorage.key(i);
                                if (key) {
                                    const lowerKey = key.toLowerCase();
                                    if (trackingKeys.some(tk => lowerKey.includes(tk))) {
                                        keysToDelete.push(key);
                                    }
                                }
                            }
                            keysToDelete.forEach(key => originalRemoveItem(key));
                        }
                    } catch (e) { }
                }
            },

            shouldBlockScript(src) {
                if (this.currentTier === 'none') return false;
                if (!src || typeof src !== 'string') return false;

                const trackingDomains = ['analytics', 'pixel', 'doubleclick', 'google-analytics', 'adsense', 'ad-tracker', 'facebook.net', 'adnxs'];
                const isTracker = trackingDomains.some(d => src.toLowerCase().includes(d));

                if (this.currentTier === 'high' && isTracker) return true;
                if (this.currentTier === 'default' && !this.hasConsent && isTracker) return true;
                return false;
            },

            blockThirdPartyScripts() {
                if (typeof document === 'undefined') return;
                if (this._scriptsBlocked) return;
                this._scriptsBlocked = true;

                const originalCreateElement = document.createElement;
                document.createElement = function (tag, options) {
                    const el = originalCreateElement.call(document, tag, options);
                    if (tag && tag.toLowerCase() === 'script') {
                        const originalSetAttribute = el.setAttribute;
                        el.setAttribute = function (k, v) {
                            if (k && k.toLowerCase() === 'src' && papyr.security.shouldBlockScript(v)) {
                                console.warn(`Papyr Security Kernel: Blocked tracking script from ${v}`);
                                return;
                            }
                            originalSetAttribute.apply(this, arguments);
                        };
                        Object.defineProperty(el, 'src', {
                            set(v) {
                                if (papyr.security.shouldBlockScript(v)) {
                                    console.warn(`Papyr Security Kernel: Blocked tracking script from ${v}`);
                                    return;
                                }
                                originalSetAttribute.call(el, 'src', v);
                            },
                            get() { return el.getAttribute('src'); },
                            configurable: true
                        });
                    }
                    return el;
                };
            },

            shouldSandboxStorage(key) {
                if (this.currentTier === 'none') return false;
                
                const policy = policies.storage;
                if (policy === 'deny') return true;
                if (policy === 'prompt') {
                    return !this.hasConsent;
                }

                if (this.currentTier === 'high') return true;
                if (!this.hasConsent) {
                    return trackingKeys.some(tk => key.toLowerCase().includes(tk));
                }
                return false;
            },

            sanitize(html) {
                if (!this._isActive || typeof html !== 'string') return html;

                let clean = html;
                if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'a', 'img', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'form', 'label', 'input', 'textarea', 'select', 'option', 'pre', 'code', 'strong', 'em', 'small', 'hr', 'br', 'canvas', 'svg', 'path', 'rect', 'circle'];
                        const allowedAttrs = ['class', 'style', 'id', 'href', 'src', 'alt', 'title', 'placeholder', 'type', 'name', 'value', 'checked', 'disabled', 'rows', 'cols', 'width', 'height', 'viewBox', 'd', 'role', 'aria-live', 'aria-modal', 'aria-labelledby', 'tabindex', 'aria-label'];

                        const cleanNode = (node) => {
                            if (node.nodeType === 1) { // Element
                                const tagName = node.tagName.toLowerCase();
                                if (!allowedTags.includes(tagName) || tagName === 'script') {
                                    node.parentNode.removeChild(node);
                                    return;
                                }

                                const attrs = Array.from(node.attributes);
                                attrs.forEach(attr => {
                                    const name = attr.name.toLowerCase();
                                    const val = attr.value.toLowerCase().trim();
                                    if (!allowedAttrs.includes(name) || name.startsWith('on') || val.includes('javascript:')) {
                                        node.removeAttribute(attr.name);
                                    }
                                });

                                Array.from(node.childNodes).forEach(cleanNode);
                            }
                        };

                        Array.from(doc.body.childNodes).forEach(cleanNode);
                        clean = doc.body.innerHTML;
                    } catch (e) { }
                }

                if (clean === html || typeof DOMParser === 'undefined') {
                    clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                    clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
                    clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');
                    clean = clean.replace(/\s+on\w+\s*=\s*\w+/gi, '');
                    clean = clean.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
                    clean = clean.replace(/src\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'src=""');
                }

                if (html !== clean) {
                    if (papyr.warn) papyr.warn("Papyr Security Interceptor blocked a potential XSS payload.");
                }
                return clean;
            },

            use(provider) {
                if (provider === 'disable') {
                    this._isActive = false;
                    if (papyr.warn) papyr.warn("Papyr Security Kernel DISABLED. You are vulnerable to XSS.");
                }
            },

            encrypt(text, password) {
                if (!text) return text;
                const utf8Text = typeof window !== 'undefined' ? unescape(encodeURIComponent(text)) : Buffer.from(text, 'utf8').toString('binary');
                let result = '';
                let keyFeedback = 0;
                for (let i = 0; i < utf8Text.length; i++) {
                    let keyChar = password.charCodeAt(i % password.length);
                    let mixedKey = (keyChar + i + keyFeedback) & 255;
                    let encryptedChar = utf8Text.charCodeAt(i) ^ mixedKey;
                    result += String.fromCharCode(encryptedChar);
                    keyFeedback = encryptedChar;
                }
                return typeof window !== 'undefined' ? window.btoa(result) : Buffer.from(result, 'binary').toString('base64');
            },

            decrypt(encodedText, password) {
                if (!encodedText) return encodedText;
                try {
                    let binaryStr = typeof window !== 'undefined' ? window.atob(encodedText) : Buffer.from(encodedText, 'base64').toString('binary');
                    let result = '';
                    let keyFeedback = 0;
                    for (let i = 0; i < binaryStr.length; i++) {
                        let keyChar = password.charCodeAt(i % password.length);
                        let mixedKey = (keyChar + i + keyFeedback) & 255;
                        let decryptedChar = binaryStr.charCodeAt(i) ^ mixedKey;
                        result += String.fromCharCode(decryptedChar);
                        keyFeedback = binaryStr.charCodeAt(i);
                    }
                    return typeof window !== 'undefined' ? decodeURIComponent(escape(result)) : Buffer.from(result, 'binary').toString('utf8');
                } catch (e) {
                    if (papyr.warn) papyr.warn("Papyr Security: Decryption failed (invalid key or corrupted data).");
                    return null;
                }
            },

            async encryptAsync(text, password) {
                if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
                    return this.encrypt(text, password);
                }
                try {
                    const encoder = new TextEncoder();
                    const salt = window.crypto.getRandomValues(new Uint8Array(16));
                    const iv = window.crypto.getRandomValues(new Uint8Array(12));

                    const keyMaterial = await window.crypto.subtle.importKey(
                        "raw",
                        encoder.encode(password),
                        "PBKDF2",
                        false,
                        ["deriveKey"]
                    );

                    const key = await window.crypto.subtle.deriveKey(
                        {
                            name: "PBKDF2",
                            salt: salt,
                            iterations: 100000,
                            hash: "SHA-256"
                        },
                        keyMaterial,
                        { name: "AES-GCM", length: 256 },
                        false,
                        ["encrypt"]
                    );

                    const ciphertext = await window.crypto.subtle.encrypt(
                        { name: "AES-GCM", iv: iv },
                        key,
                        encoder.encode(text)
                    );

                    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
                    combined.set(salt, 0);
                    combined.set(iv, salt.length);
                    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

                    let binary = '';
                    for (let i = 0; i < combined.byteLength; i++) {
                        binary += String.fromCharCode(combined[i]);
                    }
                    return window.btoa(binary);
                } catch (e) {
                    console.error("Papyr Security: Async Encryption failed, falling back to sync.", e);
                    return this.encrypt(text, password);
                }
            },

            async decryptAsync(encodedText, password) {
                if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
                    return this.decrypt(encodedText, password);
                }
                try {
                    const binaryStr = window.atob(encodedText);
                    const combined = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) {
                        combined[i] = binaryStr.charCodeAt(i);
                    }

                    const salt = combined.slice(0, 16);
                    const iv = combined.slice(16, 28);
                    const ciphertext = combined.slice(28);

                    const encoder = new TextEncoder();
                    const keyMaterial = await window.crypto.subtle.importKey(
                        "raw",
                        encoder.encode(password),
                        "PBKDF2",
                        false,
                        ["deriveKey"]
                    );

                    const key = await window.crypto.subtle.deriveKey(
                        {
                            name: "PBKDF2",
                            salt: salt,
                            iterations: 100000,
                            hash: "SHA-256"
                        },
                        keyMaterial,
                        { name: "AES-GCM", length: 256 },
                        false,
                        ["decrypt"]
                    );

                    const decrypted = await window.crypto.subtle.decrypt(
                        { name: "AES-GCM", iv: iv },
                        key,
                        ciphertext
                    );

                    return new TextDecoder().decode(decrypted);
                } catch (e) {
                    console.error("Papyr Security: Async Decryption failed, falling back to sync.", e);
                    return this.decrypt(encodedText, password);
                }
            },

            aiConsent(details) {
                return new Promise((resolve) => {
                    if (papyr.isServer()) {
                        resolve(true);
                        return;
                    }
                    
                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        const description = [
                            `Destination: ${details.destination}`,
                            `Payload size: ${details.prompt.length} chars`
                        ];
                        if (details.attachments && details.attachments.length > 0) {
                            description.push(`Attachments: ${details.attachments.length} files`);
                        }
                        
                        papyr.watt.triggerWattPrompt("AI Data Transparency Request", () => {
                            resolve(true);
                        }, () => {
                            resolve(false);
                        }, description);
                    } else {
                        // In case WATT UI is not loaded yet, check basic alert/confirm or allow
                        const ok = confirm(`AI Data Transparency Alert:\nSending prompt of length ${details.prompt.length} to ${details.destination}.\n\nAllow?`);
                        resolve(ok);
                    }
                });
            },

            detectLeakage(data) {
                if (!data) return false;
                const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
                
                const patterns = {
                    openai_key: /sk-[a-zA-Z0-9]{48}/g,
                    google_key: /AIzaSy[a-zA-Z0-9-_]{35}/g,
                    anthropic_key: /sk-ant-sid01-[a-zA-Z0-9-_]{93}/g,
                    generic_secret: /(password|secret|passwd|private_key|privatekey)\s*[:=]\s*["'][a-zA-Z0-9-_]{8,}["']/gi
                };

                let leaks = [];
                for (const [name, regex] of Object.entries(patterns)) {
                    if (regex.test(dataStr)) {
                        leaks.push(name);
                    }
                }

                if (leaks.length > 0) {
                    const msg = `⚠️ [WATT Data Leakage Warning] Potential secrets exposed in data: ${leaks.join(', ')}`;
                    console.warn(msg);
                    if (papyr.diagnostics && typeof papyr.diagnostics.reportError === 'function') {
                        papyr.diagnostics.reportError(new Error(msg));
                    }
                    return true;
                }
                return false;
            }
        });

        // 1. Geolocation Access Interception
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            const geo = navigator.geolocation;
            const originalGetCurrentPosition = geo.getCurrentPosition;
            const originalWatchPosition = geo.watchPosition;

            geo.getCurrentPosition = function (successCb, errorCb, options) {
                const policy = policies.location;
                if (policy === 'deny') {
                    if (errorCb) errorCb({ code: 1, message: "Location permission denied by Papyr security policy." });
                    return;
                }
                if (policy === 'allow') {
                    originalGetCurrentPosition.call(geo, successCb, errorCb, options);
                    return;
                }
                // 'prompt'
                if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                    papyr.watt.triggerWattPrompt("Location Access", () => {
                        originalGetCurrentPosition.call(geo, successCb, errorCb, options);
                    }, () => {
                        if (errorCb) errorCb({ code: 1, message: "User denied location access through WATT." });
                    });
                } else {
                    originalGetCurrentPosition.call(geo, successCb, errorCb, options);
                }
            };

            geo.watchPosition = function (successCb, errorCb, options) {
                const policy = policies.location;
                if (policy === 'deny') {
                    if (errorCb) errorCb({ code: 1, message: "Location tracking denied by Papyr security policy." });
                    return -1;
                }
                if (policy === 'allow') {
                    return originalWatchPosition.call(geo, successCb, errorCb, options);
                }
                // 'prompt'
                let watchId = -1;
                if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                    papyr.watt.triggerWattPrompt("Location Tracking", () => {
                        watchId = originalWatchPosition.call(geo, successCb, errorCb, options);
                    }, () => {
                        if (errorCb) errorCb({ code: 1, message: "User denied location access through WATT." });
                    });
                } else {
                    watchId = originalWatchPosition.call(geo, successCb, errorCb, options);
                }
                return watchId;
            };
        }

        // 2. Camera & Microphone getUserMedia Interception
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = function (constraints) {
                const hasCamera = !!(constraints && constraints.video);
                const hasMic = !!(constraints && constraints.audio);
                
                const cameraPolicy = policies.camera;
                const micPolicy = policies.microphone;

                if ((hasCamera && cameraPolicy === 'deny') || (hasMic && micPolicy === 'deny')) {
                    return Promise.reject(new DOMException("Permission denied by Papyr security policy.", "NotAllowedError"));
                }

                if ((!hasCamera || cameraPolicy === 'allow') && (!hasMic || micPolicy === 'allow')) {
                    return originalGetUserMedia.call(navigator.mediaDevices, constraints);
                }

                // 'prompt'
                return new Promise((resolve, reject) => {
                    let capName = "Hardware API Access";
                    if (hasCamera && hasMic) capName = "Camera & Microphone Access";
                    else if (hasCamera) capName = "Camera Access";
                    else if (hasMic) capName = "Microphone Access";

                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        papyr.watt.triggerWattPrompt(capName, () => {
                            originalGetUserMedia.call(navigator.mediaDevices, constraints)
                                .then(resolve)
                                .catch(reject);
                        }, () => {
                            reject(new DOMException("Permission denied by user through WATT.", "NotAllowedError"));
                        });
                    } else {
                        originalGetUserMedia.call(navigator.mediaDevices, constraints)
                            .then(resolve)
                            .catch(reject);
                    }
                });
            };
        }

        papyr.security = securityConfig;

        papyr.safeGet = (obj, key) => {
            if (!obj || typeof obj !== 'object') return undefined;
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                throw new Error("Security Violation: Unsafe property access");
            }
            return obj[key];
        };
    });

    // Install LocalStorage Interception
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem = function (key, val) {
            if (window.papyr && window.papyr.security && window.papyr.security.shouldSandboxStorage(key)) {
                if (key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
                    // eslint-disable-next-line security/detect-object-injection
                    tempStorage[key] = val;
                }
                return;
            }
            if (originalSetItem) originalSetItem(key, val);
        };

        localStorage.getItem = function (key) {
            if (window.papyr && window.papyr.security && window.papyr.security.shouldSandboxStorage(key)) {
                // eslint-disable-next-line security/detect-object-injection
                return (key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype' && Object.prototype.hasOwnProperty.call(tempStorage, key)) ? tempStorage[key] : null;
            }
            return originalGetItem ? originalGetItem(key) : null;
        };

        localStorage.removeItem = function (key) {
            if (window.papyr && window.papyr.security && window.papyr.security.shouldSandboxStorage(key)) {
                if (key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype' && Object.prototype.hasOwnProperty.call(tempStorage, key)) {
                    // eslint-disable-next-line security/detect-object-injection
                    delete tempStorage[key];
                }
                return;
            }
            if (originalRemoveItem) originalRemoveItem(key);
        };
    }
})();
