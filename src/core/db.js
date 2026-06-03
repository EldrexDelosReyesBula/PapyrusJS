/**
 * PAPYR DATA SYSTEM (Unified DB API)
 * Seamlessly integrates LocalStorage, SessionStorage, IndexedDB, and SQLite endpoints.
 * Updated with transactional granular CRUD capabilities.
 */

coreInitializers.push((papyr) => {

    const getDB = (collectionName) => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) return reject(new Error("IndexedDB not supported"));
            const req = window.indexedDB.open("papyr_database");
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(collectionName)) {
                    const newVer = db.version + 1;
                    db.close();
                    const reqUp = window.indexedDB.open("papyr_database", newVer);
                    reqUp.onupgradeneeded = (ev) => {
                        ev.target.result.createObjectStore(collectionName, { keyPath: "id" });
                    };
                    reqUp.onsuccess = (ev) => {
                        resolve(ev.target.result);
                    };
                    reqUp.onerror = (err) => reject(err);
                } else {
                    resolve(db);
                }
            };
            req.onerror = (err) => reject(err);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(collectionName)) {
                    db.createObjectStore(collectionName, { keyPath: "id" });
                }
            };
        });
    };

    papyr.db = (collectionName, engine = 'local') => {

        // Engine Drivers with fully granular transaction-safe CRUD methods
        const drivers = {
            'local': {
                get: () => {
                    try {
                        let val = localStorage.getItem(`papyr_db_${collectionName}`);
                        return val ? JSON.parse(val) : [];
                    } catch (e) {
                        console.error("PapyrDB [local] get error:", e);
                        return [];
                    }
                },
                insert: (item) => {
                    try {
                        const items = drivers.local.get();
                        items.push(item);
                        localStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [local] insert error:", e);
                    }
                },
                update: (id, updates) => {
                    try {
                        const items = drivers.local.get().map(item =>
                            item.id === id ? { ...item, ...updates } : item
                        );
                        localStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [local] update error:", e);
                    }
                },
                delete: (id) => {
                    try {
                        const items = drivers.local.get().filter(item => item.id !== id);
                        localStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [local] delete error:", e);
                    }
                },
                clear: () => {
                    try {
                        localStorage.removeItem(`papyr_db_${collectionName}`);
                    } catch (e) {
                        console.error("PapyrDB [local] clear error:", e);
                    }
                }
            },
            'session': {
                get: () => {
                    try {
                        let val = sessionStorage.getItem(`papyr_db_${collectionName}`);
                        return val ? JSON.parse(val) : [];
                    } catch (e) {
                        console.error("PapyrDB [session] get error:", e);
                        return [];
                    }
                },
                insert: (item) => {
                    try {
                        const items = drivers.session.get();
                        items.push(item);
                        sessionStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [session] insert error:", e);
                    }
                },
                update: (id, updates) => {
                    try {
                        const items = drivers.session.get().map(item =>
                            item.id === id ? { ...item, ...updates } : item
                        );
                        sessionStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [session] update error:", e);
                    }
                },
                delete: (id) => {
                    try {
                        const items = drivers.session.get().filter(item => item.id !== id);
                        sessionStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [session] delete error:", e);
                    }
                },
                clear: () => {
                    try {
                        sessionStorage.removeItem(`papyr_db_${collectionName}`);
                    } catch (e) {
                        console.error("PapyrDB [session] clear error:", e);
                    }
                }
            },
            'indexeddb': {
                getAsync: () => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readonly");
                                const store = tx.objectStore(collectionName);
                                const getReq = store.getAll();
                                getReq.onsuccess = () => {
                                    db.close();
                                    resolve(getReq.result || []);
                                };
                                getReq.onerror = () => {
                                    db.close();
                                    resolve([]);
                                };
                            } catch (err) {
                                db.close();
                                resolve([]);
                            }
                        }).catch(() => resolve([]));
                    });
                },
                insertAsync: (item) => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readwrite");
                                const store = tx.objectStore(collectionName);
                                store.put(item).onsuccess = () => {
                                    db.close();
                                    resolve();
                                };
                                store.put(item).onerror = () => {
                                    db.close();
                                    resolve();
                                };
                            } catch (err) {
                                console.error("PapyrDB [indexeddb] insert error:", err);
                                db.close();
                                resolve();
                            }
                        }).catch(() => resolve());
                    });
                },
                updateAsync: (id, updates) => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readwrite");
                                const store = tx.objectStore(collectionName);
                                const getReq = store.get(id);
                                getReq.onsuccess = () => {
                                    const current = getReq.result;
                                    if (current) {
                                        const updated = { ...current, ...updates };
                                        store.put(updated).onsuccess = () => {
                                            db.close();
                                            resolve();
                                        };
                                        store.put(updated).onerror = () => {
                                            db.close();
                                            resolve();
                                        };
                                    } else {
                                        db.close();
                                        resolve();
                                    }
                                };
                                getReq.onerror = () => {
                                    db.close();
                                    resolve();
                                };
                            } catch (err) {
                                console.error("PapyrDB [indexeddb] update error:", err);
                                db.close();
                                resolve();
                            }
                        }).catch(() => resolve());
                    });
                },
                deleteAsync: (id) => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readwrite");
                                const store = tx.objectStore(collectionName);
                                store.delete(id).onsuccess = () => {
                                    db.close();
                                    resolve();
                                };
                                store.delete(id).onerror = () => {
                                    db.close();
                                    resolve();
                                };
                            } catch (err) {
                                console.error("PapyrDB [indexeddb] delete error:", err);
                                db.close();
                                resolve();
                            }
                        }).catch(() => resolve());
                    });
                },
                clearAsync: () => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readwrite");
                                const store = tx.objectStore(collectionName);
                                store.clear().onsuccess = () => {
                                    db.close();
                                    resolve();
                                };
                                store.clear().onerror = () => {
                                    db.close();
                                    resolve();
                                };
                            } catch (err) {
                                console.error("PapyrDB [indexeddb] clear error:", err);
                                db.close();
                                resolve();
                            }
                        }).catch(() => resolve());
                    });
                }
            },
            'sqlite': {
                getAsync: () => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`CREATE TABLE IF NOT EXISTS ${collectionName} (id TEXT PRIMARY KEY, data TEXT)`);
                                    tx.executeSql(`SELECT data FROM ${collectionName}`, [], (tx, results) => {
                                        const items = [];
                                        for (let i = 0; i < results.rows.length; i++) {
                                            try {
                                                items.push(JSON.parse(results.rows.item(i).data));
                                            } catch (e) { }
                                        }
                                        resolve(items);
                                    }, () => resolve([]));
                                }, () => resolve([]));
                            } catch (e) { resolve([]); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                db.run(`CREATE TABLE IF NOT EXISTS ${collectionName} (id TEXT PRIMARY KEY, data TEXT)`);
                                const res = db.exec(`SELECT data FROM ${collectionName}`);
                                const items = [];
                                if (res && res[0] && res[0].values) {
                                    res[0].values.forEach(row => {
                                        try { items.push(JSON.parse(row[0])); } catch (e) { }
                                    });
                                }
                                resolve(items);
                            } catch (e) { resolve([]); }
                        } else {
                            resolve([]);
                        }
                    });
                },
                insertAsync: (item) => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`CREATE TABLE IF NOT EXISTS ${collectionName} (id TEXT PRIMARY KEY, data TEXT)`);
                                    tx.executeSql(`INSERT OR REPLACE INTO ${collectionName} (id, data) VALUES (?, ?)`, [item.id, JSON.stringify(item)]);
                                }, () => resolve(), () => resolve());
                            } catch (e) { resolve(); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                db.run(`CREATE TABLE IF NOT EXISTS ${collectionName} (id TEXT PRIMARY KEY, data TEXT)`);
                                db.run(`INSERT OR REPLACE INTO ${collectionName} (id, data) VALUES (?, ?)`, [item.id, JSON.stringify(item)]);
                                resolve();
                            } catch (e) { resolve(); }
                        } else {
                            resolve();
                        }
                    });
                },
                updateAsync: (id, updates) => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`SELECT data FROM ${collectionName} WHERE id = ?`, [id], (tx, results) => {
                                        if (results.rows.length > 0) {
                                            try {
                                                const current = JSON.parse(results.rows.item(0).data);
                                                const updated = { ...current, ...updates };
                                                tx.executeSql(`INSERT OR REPLACE INTO ${collectionName} (id, data) VALUES (?, ?)`, [id, JSON.stringify(updated)], () => resolve());
                                            } catch (e) { resolve(); }
                                        } else {
                                            resolve();
                                        }
                                    }, () => resolve());
                                }, () => resolve());
                            } catch (e) { resolve(); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                const res = db.exec(`SELECT data FROM ${collectionName} WHERE id = '${id}'`);
                                if (res && res[0] && res[0].values && res[0].values[0]) {
                                    const current = JSON.parse(res[0].values[0][0]);
                                    const updated = { ...current, ...updates };
                                    db.run(`INSERT OR REPLACE INTO ${collectionName} (id, data) VALUES (?, ?)`, [id, JSON.stringify(updated)]);
                                }
                                resolve();
                            } catch (e) { resolve(); }
                        } else {
                            resolve();
                        }
                    });
                },
                deleteAsync: (id) => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`DELETE FROM ${collectionName} WHERE id = ?`, [id]);
                                }, () => resolve(), () => resolve());
                            } catch (e) { resolve(); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                db.run(`DELETE FROM ${collectionName} WHERE id = ?`, [id]);
                                resolve();
                            } catch (e) { resolve(); }
                        } else {
                            resolve();
                        }
                    });
                },
                clearAsync: () => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`DELETE FROM ${collectionName}`);
                                }, () => resolve(), () => resolve());
                            } catch (e) { resolve(); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                db.run(`DELETE FROM ${collectionName}`);
                                resolve();
                            } catch (e) { resolve(); }
                        } else {
                            resolve();
                        }
                    });
                }
            }
        };

        // Dynamically instantiate registered custom drivers for this collection
        Object.keys(papyr.db.drivers).forEach(name => {
            try {
                drivers[name] = papyr.db.drivers[name](collectionName);
            } catch (e) {
                console.error(`Failed to initialize custom db driver ${name}:`, e);
            }
        });

        const isAsync = engine !== 'local' && engine !== 'session' && drivers[engine];
        // eslint-disable-next-line security/detect-object-injection
        const driver = (engine && engine !== '__proto__' && engine !== 'constructor' && engine !== 'prototype' && Object.prototype.hasOwnProperty.call(drivers, engine)) ? drivers[engine] : drivers['local'];

        let state = papyr.state([]);
        let watchers = [];

        // Async Init
        if (isAsync) {
            driver.getAsync().then(data => {
                state.value = data;
                watchers.forEach(cb => cb(data));
            });
        } else {
            state.value = driver.get();
        }

        const notifyWatchers = () => {
            watchers.forEach(cb => cb(state.value));
        };

        return {
            state,

            list() {
                return state.value;
            },

            async listAsync() {
                if (isAsync) {
                    const data = await driver.getAsync();
                    state.value = data;
                    return data;
                }
                return state.value;
            },

            find(id) {
                return state.value.find(record => record.id === id);
            },

            async findAsync(id) {
                if (isAsync) {
                    const data = await driver.getAsync();
                    state.value = data;
                }
                return state.value.find(record => record.id === id);
            },

            query(options = {}) {
                let result = [...state.value];
                if (typeof options.filter === 'function') {
                    result = result.filter(options.filter);
                } else if (options.filter && typeof options.filter === 'object') {
                    result = result.filter(item =>
                        Object.entries(options.filter).every(([k, v]) => {
                            if (k === '__proto__' || k === 'constructor' || k === 'prototype') return false;
                            return Object.prototype.hasOwnProperty.call(item, k) ? item[k] === v : false;
                        })
                    );
                }
                if (options.sort) {
                    const { field, direction = 'asc' } = options.sort;
                    result.sort((a, b) => {
                        if (field === '__proto__' || field === 'constructor' || field === 'prototype') return 0;
                        let valA = Object.prototype.hasOwnProperty.call(a, field) ? a[field] : undefined;
                        let valB = Object.prototype.hasOwnProperty.call(b, field) ? b[field] : undefined;
                        if (typeof valA === 'string') valA = valA.toLowerCase();
                        if (typeof valB === 'string') valB = valB.toLowerCase();
                        if (valA < valB) return direction === 'asc' ? -1 : 1;
                        if (valA > valB) return direction === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
                const offset = options.offset || 0;
                const limit = options.limit !== undefined ? options.limit : result.length;
                return result.slice(offset, offset + limit);
            },

            async queryAsync(options = {}) {
                if (isAsync) {
                    const data = await driver.getAsync();
                    state.value = data;
                }
                return this.query(options);
            },

            insert(item) {
                let record = { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString(), ...item };
                state.value = [...state.value, record];
                if (isAsync) {
                    driver.insertAsync(record).catch(e => console.error("PapyrDBError:", e));
                } else {
                    driver.insert(record);
                }
                notifyWatchers();
                return record;
            },

            async insertAsync(item) {
                let record = { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString(), ...item };
                state.value = [...state.value, record];
                if (isAsync) {
                    await driver.insertAsync(record);
                } else {
                    driver.insert(record);
                }
                notifyWatchers();
                return record;
            },

            update(id, data) {
                state.value = state.value.map(record =>
                    record.id === id ? { ...record, ...data, updatedAt: new Date().toISOString() } : record
                );
                const updated = this.find(id);
                if (updated) {
                    if (isAsync) {
                        driver.updateAsync(id, updated).catch(e => console.error("PapyrDBError:", e));
                    } else {
                        driver.update(id, updated);
                    }
                }
                notifyWatchers();
            },

            async updateAsync(id, data) {
                state.value = state.value.map(record =>
                    record.id === id ? { ...record, ...data, updatedAt: new Date().toISOString() } : record
                );
                const updated = this.find(id);
                if (updated) {
                    if (isAsync) {
                        await driver.updateAsync(id, updated);
                    } else {
                        driver.update(id, updated);
                    }
                }
                notifyWatchers();
            },

            delete(id) {
                state.value = state.value.filter(record => record.id !== id);
                if (isAsync) {
                    driver.deleteAsync(id).catch(e => console.error("PapyrDBError:", e));
                } else {
                    driver.delete(id);
                }
                notifyWatchers();
            },

            async deleteAsync(id) {
                state.value = state.value.filter(record => record.id !== id);
                if (isAsync) {
                    await driver.deleteAsync(id);
                } else {
                    driver.delete(id);
                }
                notifyWatchers();
            },

            clear() {
                state.value = [];
                if (isAsync) {
                    driver.clearAsync().catch(e => console.error("PapyrDBError:", e));
                } else {
                    driver.clear();
                }
                notifyWatchers();
            },

            async clearAsync() {
                state.value = [];
                if (isAsync) {
                    await driver.clearAsync();
                } else {
                    driver.clear();
                }
                notifyWatchers();
            },

            watch(callback) {
                watchers.push(callback);
                callback(state.value); // immediate execution
                return () => watchers = watchers.filter(cb => cb !== callback); // unsubscribe
            },

            async transaction(callback) {
                const snapshot = JSON.stringify(state.value);
                const tx = {
                    _ops: [],
                    insert(item) {
                        let record = { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString(), ...item };
                        this._ops.push({ type: 'insert', record });
                        return record;
                    },
                    update(id, data) {
                        this._ops.push({ type: 'update', id, data });
                    },
                    delete(id) {
                        this._ops.push({ type: 'delete', id });
                    }
                };
                
                try {
                    await callback(tx);
                    for (const op of tx._ops) {
                        if (op.type === 'insert') {
                            if (isAsync) {
                                await driver.insertAsync(op.record);
                            } else {
                                driver.insert(op.record);
                            }
                            state.value = [...state.value, op.record];
                        } else if (op.type === 'update') {
                            state.value = state.value.map(record =>
                                record.id === op.id ? { ...record, ...op.data, updatedAt: new Date().toISOString() } : record
                            );
                            const updated = state.value.find(record => record.id === op.id);
                            if (updated) {
                                if (isAsync) {
                                    await driver.updateAsync(op.id, updated);
                                } else {
                                    driver.update(op.id, updated);
                                }
                            }
                        } else if (op.type === 'delete') {
                            state.value = state.value.filter(record => record.id !== op.id);
                            if (isAsync) {
                                await driver.deleteAsync(op.id);
                            } else {
                                driver.delete(op.id);
                            }
                        }
                    }
                    notifyWatchers();
                } catch (err) {
                    state.value = JSON.parse(snapshot);
                    notifyWatchers();
                    throw err;
                }
            }
        };
    };

    papyr.db.drivers = {};
    papyr.db.registerDriver = (name, driverFactory) => {
        if (name === '__proto__' || name === 'constructor' || name === 'prototype') return;
        papyr.db.drivers[name] = driverFactory;
    };

    // Upgraded storage helper function with dual call signature compatibility
    const storageFunc = (key, val) => {
        if (typeof val === 'undefined') {
            let data = localStorage.getItem(key);
            if (data === null || data === undefined) return null;
            try { return JSON.parse(data); } catch (e) { return data; }
        }
        if (val === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
    };
    storageFunc.set = (k, v) => storageFunc(k, v);
    storageFunc.get = (k) => storageFunc(k);
    storageFunc.remove = (k) => localStorage.removeItem(k);
    storageFunc.clear = () => localStorage.clear();
    storageFunc.secureSet = (k, v, password) => {
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        localStorage.setItem(k, papyr.security.encrypt(JSON.stringify(v), password));
    };
    storageFunc.secureGet = (k, password) => {
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        let enc = localStorage.getItem(k);
        if (!enc) return null;
        try { return JSON.parse(papyr.security.decrypt(enc, password)); } catch (e) { return null; }
    };
    storageFunc.secureSetAsync = async (k, v, password) => {
        if (!papyr.security || typeof papyr.security.encryptAsync !== 'function') {
            return storageFunc.secureSet(k, v, password);
        }
        const enc = await papyr.security.encryptAsync(JSON.stringify(v), password);
        localStorage.setItem(k, enc);
    };
    storageFunc.secureGetAsync = async (k, password) => {
        if (!papyr.security || typeof papyr.security.decryptAsync !== 'function') {
            return storageFunc.secureGet(k, password);
        }
        let enc = localStorage.getItem(k);
        if (!enc) return null;
        try {
            const dec = await papyr.security.decryptAsync(enc, password);
            return JSON.parse(dec);
        } catch (e) { return null; }
    };
    papyr.storage = storageFunc;

    // Upgraded session helper function with dual call signature compatibility
    const sessionFunc = (key, val) => {
        if (typeof val === 'undefined') {
            let data = sessionStorage.getItem(key);
            if (data === null || data === undefined) return null;
            try { return JSON.parse(data); } catch (e) { return data; }
        }
        if (val === null) {
            sessionStorage.removeItem(key);
        } else {
            sessionStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
    };
    sessionFunc.set = (k, v) => sessionFunc(k, v);
    sessionFunc.get = (k) => sessionFunc(k);
    sessionFunc.remove = (k) => sessionStorage.removeItem(k);
    sessionFunc.clear = () => sessionStorage.clear();
    sessionFunc.secureSet = (k, v, password) => {
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        sessionStorage.setItem(k, papyr.security.encrypt(JSON.stringify(v), password));
    };
    sessionFunc.secureGet = (k, password) => {
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        let enc = sessionStorage.getItem(k);
        if (!enc) return null;
        try { return JSON.parse(papyr.security.decrypt(enc, password)); } catch (e) { return null; }
    };
    sessionFunc.secureSetAsync = async (k, v, password) => {
        if (!papyr.security || typeof papyr.security.encryptAsync !== 'function') {
            return sessionFunc.secureSet(k, v, password);
        }
        const enc = await papyr.security.encryptAsync(JSON.stringify(v), password);
        sessionStorage.setItem(k, enc);
    };
    sessionFunc.secureGetAsync = async (k, password) => {
        if (!papyr.security || typeof papyr.security.decryptAsync !== 'function') {
            return sessionFunc.secureGet(k, password);
        }
        let enc = sessionStorage.getItem(k);
        if (!enc) return null;
        try {
            const dec = await papyr.security.decryptAsync(enc, password);
            return JSON.parse(dec);
        } catch (e) { return null; }
    };
    papyr.session = sessionFunc;

    // ----------------------------------------------------
    // PAPYR DATA SYSTEM 2.0
    // ----------------------------------------------------
    papyr.data = {
        local: (collectionName) => papyr.db(collectionName, 'local'),
        session: (collectionName) => papyr.db(collectionName, 'session'),
        indexed: (collectionName) => papyr.db(collectionName, 'indexeddb'),
        remote: (collectionName) => papyr.db(collectionName, 'firebase')
    };

    // ----------------------------------------------------
    // CONTINUITY ENGINE & DRAFT MANAGEMENT
    // ----------------------------------------------------
    papyr.drafts = {
        save(key, data) {
            papyr.storage.set(`papyr_draft_${key}`, { data, timestamp: Date.now() });
        },
        restore(key) {
            const record = papyr.storage.get(`papyr_draft_${key}`);
            return record ? record.data : null;
        },
        clear(key) {
            papyr.storage.remove(`papyr_draft_${key}`);
        }
    };

    papyr.continuity = {
        _intervals: new Map(),
        enable(options = {}) {
            const { key = 'default', target = null, interval = 5000, onSave = null } = options;
            if (this._intervals.has(key)) return;
            
            const saveTask = () => {
                let data = null;
                if (typeof target === 'function') {
                    data = target();
                } else if (target && typeof target === 'object' && target.value !== undefined) {
                    data = target.value;
                } else if (target && typeof target === 'string') {
                    const el = document.querySelector(target);
                    if (el) {
                        data = el.type === 'checkbox' ? el.checked : el.value;
                    }
                }
                if (data !== null) {
                    papyr.drafts.save(key, data);
                    if (typeof onSave === 'function') onSave(data);
                }
            };
            
            saveTask();
            const intervalId = setInterval(saveTask, interval);
            this._intervals.set(key, intervalId);
        },
        
        disable(key = 'default') {
            const intervalId = this._intervals.get(key);
            if (intervalId) {
                clearInterval(intervalId);
                this._intervals.delete(key);
            }
        },
        
        restore(options = {}) {
            const { key = 'default', target = null, onRestore = null } = options;
            const data = papyr.drafts.restore(key);
            if (data !== null) {
                if (typeof onRestore === 'function') {
                    onRestore(data);
                } else if (target && typeof target === 'object' && target.value !== undefined) {
                    target.value = data;
                } else if (target && typeof target === 'string') {
                    const el = document.querySelector(target);
                    if (el) {
                        if (el.type === 'checkbox') {
                            el.checked = !!data;
                        } else {
                            el.value = data;
                        }
                    }
                }
                return data;
            }
            return null;
        }
    };

    // ----------------------------------------------------
    // OFFLINE FIRST SUPPORT
    // ----------------------------------------------------
    papyr.offline = {
        _queue: [],
        _isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        _syncListeners: new Set(),
        
        enable(options = {}) {
            const { onSync = null } = options;
            if (onSync) this._syncListeners.add(onSync);
            
            if (typeof window !== 'undefined') {
                window.addEventListener('online', () => {
                    this._isOnline = true;
                    this.sync();
                });
                window.addEventListener('offline', () => {
                    this._isOnline = false;
                });
            }
            
            const savedQueue = papyr.storage.get("papyr_offline_queue");
            if (Array.isArray(savedQueue)) {
                this._queue = savedQueue;
            }
            
            if (this._isOnline) {
                this.sync();
            }
        },
        
        queueWrite(action, collection, data) {
            this._queue.push({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                action,
                collection,
                data,
                timestamp: Date.now()
            });
            papyr.storage.set("papyr_offline_queue", this._queue);
            
            if (this._isOnline) {
                this.sync();
            }
        },
        
        async sync() {
            if (!this._isOnline || this._queue.length === 0) return;
            
            const currentQueue = [...this._queue];
            this._queue = [];
            papyr.storage.remove("papyr_offline_queue");
            
            for (const item of currentQueue) {
                for (const listener of this._syncListeners) {
                    try {
                        await listener(item);
                    } catch (e) {
                        console.error("Offline sync error, pushing back to queue:", e);
                        this._queue.push(item);
                        papyr.storage.set("papyr_offline_queue", this._queue);
                    }
                }
            }
        }
    };

    // ----------------------------------------------------
    // RETRY ENGINE (RELIABILITY SUITE)
    // ----------------------------------------------------
    papyr.retry = async (fn, options = {}) => {
        const { retries = 3, delay = 1000, factor = 2, onError = null } = options;
        let currentDelay = delay;
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (err) {
                if (onError) onError(err, i + 1);
                if (i === retries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= factor;
            }
        }
    };
});
