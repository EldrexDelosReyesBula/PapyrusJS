/**
 * PAPYR CRUD STORAGE ENGINE
 * 
 * Auto-synchronizing reactive database store mapped directly to persistent LocalStorage.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    papyr.crud = (name, initialData = []) => {
        let getStored = () => {
            try {
                return papyr.storage(name) || initialData;
            } catch(e) {
                return initialData;
            }
        };

        let items = papyr.state(getStored());

        let sync = () => {
            try {
                papyr.storage(name, items.value);
            } catch(e) {
                console.warn("PaperStorageWarning: LocalStorage sync failed.", e);
            }
        };

        return {
            state: items,

            list() {
                return items.value;
            },

            query(options = {}) {
                let result = [...items.value];
                if (typeof options.filter === 'function') {
                    result = result.filter(options.filter);
                } else if (options.filter && typeof options.filter === 'object') {
                    result = result.filter(item => 
                        Object.entries(options.filter).every(([k, v]) => {
                            if (k === '__proto__' || k === 'constructor' || k === 'prototype') return false;
                            // eslint-disable-next-line security/detect-object-injection
                            return Object.prototype.hasOwnProperty.call(item, k) ? item[k] === v : false;
                        })
                    );
                }
                if (options.sort) {
                    const { field, direction = 'asc' } = options.sort;
                    result.sort((a, b) => {
                        if (field === '__proto__' || field === 'constructor' || field === 'prototype') return 0;
                        // eslint-disable-next-line security/detect-object-injection
                        let valA = Object.prototype.hasOwnProperty.call(a, field) ? a[field] : undefined;
                        // eslint-disable-next-line security/detect-object-injection
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

            /**
             * Appends a new item to the store and generates a unique Base36 string ID.
             * 
             * @param {Record<string, *>} item Payload fields dictionary
             * @returns {Record<string, *>} Newly registered record with id attached
             */
            create(item) {
                let newItem = { 
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), 
                    createdAt: new Date().toISOString(),
                    ...item 
                };
                items.value = [...items.value, newItem];
                sync();
                return newItem;
            },

            /**
             * Finds a record by its unique ID.
             * 
             * @param {string} id Unique record ID
             * @returns {Record<string, *>|undefined} Target record or undefined if not found
             */
            read(id) {
                return items.value.find(item => item.id === id);
            },

            /**
             * Finds a record by its unique ID (Alias for read).
             * 
             * @param {string} id Unique record ID
             * @returns {Record<string, *>|undefined} Target record or undefined if not found
             */
            findById(id) {
                return this.read(id);
            },

            /**
             * Merges updates reactively into an existing record.
             * 
             * @param {string} id Unique record ID
             * @param {Record<string, *>} updates Target fields updates mapping
             */
            update(id, updates) {
                items.value = items.value.map(item => 
                    item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
                );
                sync();
            },

            /**
             * Deletes a record from the database store reactively.
             * 
             * @param {string} id Unique record ID
             */
            delete(id) {
                items.value = items.value.filter(item => item.id !== id);
                sync();
            },

            /**
             * Completely resets the persistent local store database.
             */
            clear() {
                items.value = [];
                sync();
            }
        };
    };
});
