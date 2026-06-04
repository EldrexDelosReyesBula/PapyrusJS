/**
 * PAPYR API HELPERS
 * Simplifies standard fetch() commands for beginners.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    const getCacheDB = () => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) return reject("No IndexedDB support");
            const req = window.indexedDB.open("papyr_network_cache", 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("cache")) {
                    db.createObjectStore("cache", { keyPath: "url" });
                }
            };
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = (e) => reject(e.target.error);
        });
    };

    const getCachedResponse = async (url, password) => {
        try {
            const db = await getCacheDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction("cache", "readonly");
                const store = tx.objectStore("cache");
                const getReq = store.get(url);
                getReq.onsuccess = () => {
                    db.close();
                    const item = getReq.result;
                    if (item && item.payload) {
                        try {
                            const decrypted = papyr.security ? papyr.security.decrypt(item.payload, password) : item.payload;
                            resolve(JSON.parse(decrypted));
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error("No cache entry"));
                    }
                };
                getReq.onerror = () => {
                    db.close();
                    reject(getReq.error);
                };
            });
        } catch (err) {
            return null;
        }
    };

    const cacheResponse = async (url, data, password) => {
        try {
            const db = await getCacheDB();
            const text = JSON.stringify(data);
            const encrypted = papyr.security ? papyr.security.encrypt(text, password) : text;
            return new Promise((resolve) => {
                const tx = db.transaction("cache", "readwrite");
                const store = tx.objectStore("cache");
                store.put({ url, payload: encrypted, timestamp: Date.now() }).onsuccess = () => {
                    db.close();
                    resolve();
                };
            });
        } catch (err) {
            console.error("Cache error:", err);
        }
    };

    const syncLedger = async () => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
        let ledger = [];
        try {
            ledger = JSON.parse(localStorage.getItem("papyr_mutation_ledger") || "[]");
        } catch (e) {}
        if (ledger.length === 0) return;

        const remaining = [];
        for (let op of ledger) {
            try {
                const res = await fetch(op.url, {
                    method: op.method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...op.headers
                    },
                    body: op.data ? JSON.stringify(op.data) : undefined
                });
                if (!res.ok) throw new Error("Sync server returned error " + res.status);
                if (papyr.emit) {
                    papyr.emit('sync:success', { op, response: await res.json() });
                }
            } catch (err) {
                console.error("Ledger replay failed for", op.url, err);
                remaining.push(op);
            }
        }
        localStorage.setItem("papyr_mutation_ledger", JSON.stringify(remaining));
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            syncLedger().catch(console.error);
        });
        setInterval(() => {
            syncLedger().catch(console.error);
        }, 15000);
    }

    papyr.api = {
        async fetch(url, options = {}) {
            const method = (options.method || 'GET').toUpperCase();
            const headers = options.headers || {};
            const password = options.encryptionKey || "papyr_secure_mesh_cache";
            const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

            if (method === 'GET') {
                if (isOnline) {
                    try {
                        const res = await fetch(url, { method, headers });
                        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                        const data = await res.json();
                        await cacheResponse(url, data, password);
                        return data;
                    } catch (error) {
                        const cached = await getCachedResponse(url, password);
                        if (cached) return cached;
                        throw error;
                    }
                } else {
                    const cached = await getCachedResponse(url, password);
                    if (cached) return cached;
                    throw new Error("Offline and no cached data available");
                }
            } else {
                if (isOnline) {
                    const body = options.body || options.data;
                    const res = await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            ...headers
                        },
                        body: body ? JSON.stringify(body) : undefined
                    });
                    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                    return await res.json();
                } else {
                    let ledger = [];
                    try {
                        ledger = JSON.parse(localStorage.getItem("papyr_mutation_ledger") || "[]");
                    } catch (e) {}
                    const body = options.body || options.data;
                    ledger.push({ url, method, data: body, headers, timestamp: Date.now() });
                    localStorage.setItem("papyr_mutation_ledger", JSON.stringify(ledger));

                    return {
                        id: "temp_" + Math.random().toString(36).substr(2, 9),
                        ...(typeof body === 'object' ? body : {}),
                        status: "pending_sync"
                    };
                }
            }
        },

        async get(url, headers = {}) {
            return this.fetch(url, { method: 'GET', headers });
        },

        async post(url, data, headers = {}) {
            return this.fetch(url, { method: 'POST', data, headers });
        }
    };

    papyr.cloud = {
        _providers: {},
        _config: { provider: 'vercel' },
        register(name, providerInstance) {
            if (name === '__proto__' || name === 'constructor' || name === 'prototype') return;
            this._providers[name] = providerInstance;
        },
        use(name) {
            this._config = this._config || {};
            this._config.provider = name;
            return this._providers[name] || this;
        }
    };
});
