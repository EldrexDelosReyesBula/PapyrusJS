/**
 * PAPYR ISR ENGINE (Incremental Static Regeneration)
 * Server-side stale-while-revalidate HTML cache with background regeneration.
 * Requires a persistent Node.js or server process to maintain cache state.
 * Part of the PSSR (Papyrus Server Side Rendering) architecture.
 */

coreInitializers.push((papyr) => {
    // In-memory HTML cache store
    const isrStore = new Map();

    /**
     * @typedef {Object} ISREntry
     * @property {string} html - Cached rendered HTML
     * @property {number} timestamp - Unix ms when cached
     * @property {number} ttl - TTL in seconds
     * @property {boolean} revalidating - Background revalidation in progress
     */

    papyr.isr = {

        /**
         * Serve or generate cached HTML for a given cache key.
         * Uses stale-while-revalidate: returns stale cache immediately while regenerating in background.
         *
         * @param {string} key - Unique cache key (typically a route path)
         * @param {Function} renderFn - Async function that returns a Papyrus element or HTML string
         * @param {number} [ttlSeconds=60] - Cache TTL in seconds
         * @returns {Promise<{ html: string, hit: boolean, stale: boolean, age: number }>}
         *
         * @example
         * app.get('/blog', async (req, res) => {
         *   const { html } = await papyr.isr.cache('/blog', () => BlogPage(), 300);
         *   res.send(html);
         * });
         */
        async cache(key, renderFn, ttlSeconds = 60) {
            const now = Date.now();
            const entry = isrStore.get(key);

            // Fresh cache hit
            if (entry && (now - entry.timestamp) < entry.ttl * 1000 && !entry.revalidating) {
                return {
                    html: entry.html,
                    hit: true,
                    stale: false,
                    age: Math.floor((now - entry.timestamp) / 1000)
                };
            }

            // Stale cache: return immediately, revalidate in background
            if (entry) {
                if (!entry.revalidating) {
                    entry.revalidating = true;
                    // Background regeneration — non-blocking
                    Promise.resolve().then(async () => {
                        try {
                            const result = await renderFn();
                            const html = (typeof result === 'string') ? result : papyr.ssr(result);
                            isrStore.set(key, {
                                html,
                                timestamp: Date.now(),
                                ttl: ttlSeconds,
                                revalidating: false
                            });
                            if (papyr.diagnostics) {
                                papyr.diagnostics.emit('isr', {
                                    type: 'revalidated',
                                    key,
                                    timestamp: Date.now()
                                });
                            }
                        } catch (err) {
                            console.error(`[Papyr ISR] Background revalidation failed for "${key}":`, err);
                            // Reset revalidating flag so next request retries
                            const current = isrStore.get(key);
                            if (current) current.revalidating = false;
                        }
                    });
                }

                return {
                    html: entry.html,
                    hit: true,
                    stale: true,
                    age: Math.floor((now - entry.timestamp) / 1000)
                };
            }

            // Cache miss: render synchronously and store
            try {
                const result = await renderFn();
                const html = (typeof result === 'string') ? result : papyr.ssr(result);
                isrStore.set(key, {
                    html,
                    timestamp: Date.now(),
                    ttl: ttlSeconds,
                    revalidating: false
                });

                if (papyr.diagnostics) {
                    papyr.diagnostics.emit('isr', {
                        type: 'generated',
                        key,
                        timestamp: Date.now()
                    });
                }

                return { html, hit: false, stale: false, age: 0 };
            } catch (err) {
                throw new Error(`[Papyr ISR] Initial render failed for key "${key}": ${err.message}`);
            }
        },

        /**
         * Immediately invalidate a single cache entry, forcing regeneration on next request.
         * @param {string} key - Cache key to invalidate
         * @returns {boolean} True if the key existed and was removed
         */
        invalidate(key) {
            const existed = isrStore.has(key);
            if (existed) isrStore.delete(key);
            return existed;
        },

        /**
         * Invalidate all ISR cache entries.
         * @returns {number} Number of entries cleared
         */
        invalidateAll() {
            const count = isrStore.size;
            isrStore.clear();
            return count;
        },

        /**
         * Get the current cache status for a key without triggering a render.
         * @param {string} key - Cache key
         * @returns {{ exists: boolean, hit?: boolean, stale?: boolean, age?: number, ttl?: number, revalidating?: boolean }}
         */
        status(key) {
            const entry = isrStore.get(key);
            if (!entry) return { exists: false };

            const now = Date.now();
            const age = Math.floor((now - entry.timestamp) / 1000);
            const fresh = age < entry.ttl;

            return {
                exists: true,
                hit: fresh,
                stale: !fresh,
                age,
                ttl: entry.ttl,
                revalidating: entry.revalidating || false
            };
        },

        /**
         * Express/Node.js middleware. Intercepts requests and serves from ISR cache.
         * Attach route-specific TTLs via `res.papyrISR.ttl` before calling next().
         *
         * @param {Object} [options]
         * @param {number} [options.defaultTtl=60] - Default TTL for all routes
         * @param {Function} [options.keyFn] - Custom key derivation: (req) => string
         * @returns {Function} Express-compatible middleware function
         *
         * @example
         * app.use(papyr.isr.middleware({ defaultTtl: 300 }));
         * app.get('/blog', async (req, res) => {
         *   res.papyrISR.ttl = 600;
         *   const html = papyr.ssr(BlogPage());
         *   res.papyrISR.save(html);
         *   res.send(html);
         * });
         */
        middleware(options = {}) {
            const { defaultTtl = 60, keyFn = null } = options;

            return (req, res, next) => {
                const key = keyFn ? keyFn(req) : req.url;
                const entry = isrStore.get(key);
                const now = Date.now();

                if (entry && (now - entry.timestamp) < entry.ttl * 1000) {
                    res.setHeader('X-Papyr-ISR', 'HIT');
                    res.setHeader('X-Papyr-ISR-Age', Math.floor((now - entry.timestamp) / 1000));
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    return res.send(entry.html);
                }

                // Attach ISR helpers to response
                res.papyrISR = {
                    key,
                    ttl: defaultTtl,
                    save(html, ttl) {
                        const effectiveTtl = ttl || defaultTtl;
                        isrStore.set(key, {
                            html,
                            timestamp: Date.now(),
                            ttl: effectiveTtl,
                            revalidating: false
                        });
                    }
                };

                res.setHeader('X-Papyr-ISR', 'MISS');
                next();
            };
        },

        /**
         * Total number of cached entries.
         * @returns {number}
         */
        size() {
            return isrStore.size;
        },

        /**
         * All currently cached keys.
         * @returns {string[]}
         */
        keys() {
            return Array.from(isrStore.keys());
        },

        /**
         * Returns a snapshot of cache metadata (without HTML content, for inspection).
         * @returns {Array<{ key: string, age: number, ttl: number, stale: boolean }>}
         */
        inspect() {
            const now = Date.now();
            return Array.from(isrStore.entries()).map(([key, entry]) => {
                const age = Math.floor((now - entry.timestamp) / 1000);
                return {
                    key,
                    age,
                    ttl: entry.ttl,
                    stale: age >= entry.ttl,
                    revalidating: entry.revalidating || false
                };
            });
        }
    };
});
