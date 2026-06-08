/**
 * PAPYR PSSR SDK
 * Advanced rendering strategy builder for complex applications.
 * Extends papyr.pssr without modifying its core hydration integrity.
 *
 * papyr.pssr.sdk.strategy()   — rendering strategy builder
 * papyr.pssr.sdk.islands()    — lazy island orchestration
 * papyr.pssr.sdk.meta.pipe()  — metadata pipeline
 * papyr.pssr.sdk.stream()     — priority-lane streaming renderer
 * papyr.pssr.sdk.edge()       — edge deployment configuration
 * papyr.pssr.sdk.build.*      — build-time SSG tools
 */

coreInitializers.push((papyr) => {

    // ─── Route Pattern Matcher ────────────────────────────────────────────────

    function _matchesPattern(path, pattern) {
        if (pattern === path) return true;
        // Wildcard: '/blog/*' matches '/blog/my-post'
        if (pattern.endsWith('/*')) {
            const prefix = pattern.slice(0, -2);
            return path.startsWith(prefix + '/') || path === prefix;
        }
        // Param: '/products/:id'
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) return false;
        return patternParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
    }

    // ─── Metadata Pipeline ────────────────────────────────────────────────────

    const _metaPipeline = [];

    const metaSDK = {
        /**
         * Add a metadata transform to the SEO pipeline.
         * Each function receives (context, previousMeta) and returns a meta object.
         *
         * @param {Function|Function[]} transforms
         *
         * @example
         * papyr.pssr.sdk.meta.pipe([
         *   (ctx) => ({ title: ctx.route.title }),
         *   (ctx, prev) => ({ ...prev, og: { image: ctx.route.image } })
         * ]);
         */
        pipe(transforms) {
            const fns = Array.isArray(transforms) ? transforms : [transforms];
            fns.forEach(fn => { if (typeof fn === 'function') _metaPipeline.push(fn); });
        },

        /**
         * Run the metadata pipeline for a given context.
         * @param {Object} context - Route/page context
         * @returns {Object} Merged meta object
         */
        run(context = {}) {
            let meta = {};
            _metaPipeline.forEach(fn => {
                try {
                    const result = fn(context, { ...meta });
                    if (result && typeof result === 'object') {
                        meta = { ...meta, ...result };
                    }
                } catch (e) {
                    console.error('[PSSR SDK Meta] Pipeline transform error:', e);
                }
            });

            // Apply to papyr.seo if available
            if (papyr.seo && typeof papyr.seo === 'function' && Object.keys(meta).length > 0) {
                papyr.seo(meta);
            }

            return meta;
        },

        /** Clear the meta pipeline */
        clear() {
            _metaPipeline.length = 0;
        }
    };

    // ─── PSSR SDK Object ──────────────────────────────────────────────────────

    const pssrSDK = {

        meta: metaSDK,

        /**
         * Build and apply a rendering strategy across multiple routes.
         * Registers each route in the PSSR mode registry.
         *
         * @param {Object} options
         * @param {'csr'|'ssr'|'ssg'|'isr'} [options.default='csr'] - Default mode
         * @param {Object} [options.routes] - Route pattern → mode map
         * @returns {{ apply: Function, list: Function }} Strategy object
         *
         * @example
         * const strategy = papyr.pssr.sdk.strategy({
         *   default: 'ssr',
         *   routes: {
         *     '/blog/*': 'ssg',
         *     '/dashboard': 'ssr',
         *     '/chat': 'csr',
         *     '/products/:id': 'isr'
         *   }
         * });
         * strategy.apply();
         */
        strategy(options = {}) {
            const { default: defaultMode = 'csr', routes = {} } = options;

            return {
                _routes: routes,
                _default: defaultMode,

                /** Apply all route modes to the PSSR registry */
                apply() {
                    if (!papyr.pssr || typeof papyr.pssr.setRouteMode !== 'function') {
                        console.warn('[PSSR SDK] papyr.pssr.setRouteMode not available. Load PSSR core first.');
                        return;
                    }

                    Object.entries(routes).forEach(([pattern, mode]) => {
                        papyr.pssr.setRouteMode(pattern, mode);
                    });

                    papyr.pssr._defaultMode = defaultMode;
                    console.log(`[PSSR SDK] Strategy applied. Default: ${defaultMode}. Routes: ${Object.keys(routes).length}`);
                },

                /** Get the mode for a specific path */
                resolve(path) {
                    for (const [pattern, mode] of Object.entries(routes)) {
                        if (_matchesPattern(path, pattern)) return mode;
                    }
                    return defaultMode;
                },

                /** List all strategy entries */
                list() {
                    return Object.entries(routes).map(([pattern, mode]) => ({ pattern, mode }));
                }
            };
        },

        /**
         * Lazy island orchestration — hydrates islands only when they enter viewport.
         * Uses IntersectionObserver for performance.
         *
         * @param {Object} options
         * @param {string} [options.selector='[data-papyr-island]'] - Island selector
         * @param {boolean} [options.lazy=true] - Use IntersectionObserver for lazy hydration
         * @param {number} [options.threshold=0.1] - IO visibility threshold
         * @param {number} [options.rootMargin=50] - IO root margin in px
         *
         * @example
         * papyr.pssr.sdk.islands({ lazy: true, threshold: 0.2 });
         */
        islands(options = {}) {
            const {
                selector = '[data-papyr-island]',
                lazy = true,
                threshold = 0.1,
                rootMargin = 50
            } = options;

            if (!papyr.isBrowser || !papyr.isBrowser()) return;

            const islandEls = Array.from(document.querySelectorAll(selector));

            if (!lazy || typeof IntersectionObserver === 'undefined') {
                // Eager hydration fallback
                if (papyr.pssr && typeof papyr.pssr.hydrate === 'function') {
                    papyr.pssr.hydrate('body', null, { islandsOnly: true });
                }
                return;
            }

            // Lazy: hydrate when visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    if (el.getAttribute('data-papyr-hydrated') === 'true') return;

                    const name = el.getAttribute('data-papyr-island');
                    const Component = papyr._islandRegistry && papyr._islandRegistry.get(name);

                    if (Component) {
                        let props = {};
                        try {
                            const raw = el.getAttribute('data-papyr-island-props');
                            if (raw) props = JSON.parse(raw.replace(/&quot;/g, '"'));
                        } catch (e) {}

                        try {
                            if (papyr.hydrate) papyr.hydrate(el, () => Component(props));
                            el.setAttribute('data-papyr-hydrated', 'true');
                            console.log(`[PSSR SDK Islands] Lazy-hydrated "${name}" ✓`);
                        } catch (err) {
                            console.error(`[PSSR SDK Islands] Failed to hydrate "${name}":`, err);
                        }
                    }

                    observer.unobserve(el);
                });
            }, { threshold, rootMargin: `${rootMargin}px` });

            islandEls.forEach(el => observer.observe(el));
            console.log(`[PSSR SDK] Observing ${islandEls.length} island(s) for lazy hydration.`);
        },

        /**
         * Priority-lane streaming renderer with SEO-first delivery.
         *
         * @param {Function|Object} App - Component to render
         * @param {Object} [options]
         * @param {Function} [options.shell] - (head, body) => fullHtml
         * @param {string[]} [options.priority] - Ordered render priority lanes
         * @returns {ReadableStream}
         */
        stream(App, options = {}) {
            const { shell = null, chunkSize = 1024 } = options;

            if (!papyr.pssr || typeof papyr.pssr.stream !== 'function') {
                throw new Error('[PSSR SDK] papyr.pssr.stream not available.');
            }

            // Use the core PSSR priority stream (SEO head first, then body chunks)
            return papyr.pssr.stream(App, { chunkSize });
        },

        /**
         * Configure edge deployment for PSSR rendering.
         *
         * @param {Object} options
         * @param {'cloudflare'|'deno'|'bun'|'node'|'auto'} [options.runtime='auto']
         * @param {Object} [options.kv] - Edge KV namespace for ISR cache
         * @param {string[]} [options.regions] - Deployment regions
         * @param {number} [options.isrTtl=300] - Default ISR TTL for edge
         *
         * @example
         * papyr.pssr.sdk.edge({ runtime: 'cloudflare', isrTtl: 600 });
         */
        edge(options = {}) {
            const {
                runtime = 'auto',
                kv = null,
                regions = ['auto'],
                isrTtl = 300
            } = options;

            const detectedRuntime = runtime === 'auto'
                ? (papyr.edge && papyr.edge.isEdge() ? 'edge' : 'node')
                : runtime;

            papyr.pssr._edgeConfig = { runtime: detectedRuntime, kv, regions, isrTtl };

            // If KV is provided, override ISR cache with KV-backed storage
            if (kv && papyr.isr) {
                const originalCache = papyr.isr.cache.bind(papyr.isr);
                papyr.isr.cache = async (key, renderFn, ttlSeconds) => {
                    // Try KV first
                    try {
                        const cached = await kv.get(key);
                        if (cached) {
                            return { html: cached, hit: true, stale: false, age: 0 };
                        }
                    } catch (e) {}

                    // Fallback to memory cache
                    const result = await originalCache(key, renderFn, ttlSeconds || isrTtl);

                    // Write to KV
                    if (kv && result.html) {
                        try { await kv.put(key, result.html, { expirationTtl: isrTtl }); }
                        catch (e) {}
                    }

                    return result;
                };
            }

            console.log(`[PSSR SDK] Edge config applied. Runtime: ${detectedRuntime}, Regions: ${regions.join(', ')}, ISR TTL: ${isrTtl}s`);
            return papyr.pssr._edgeConfig;
        },

        /** Build-time SSG utilities */
        build: {
            /**
             * Generate static pages for all SSG routes.
             * @param {Array<{ path: string, componentFn: Function }>} routes
             * @returns {Promise<Array<{ path: string, html: string }>>}
             */
            async manifest(routes) {
                if (!papyr.pssr || typeof papyr.pssr.generateStaticManifest !== 'function') {
                    console.warn('[PSSR SDK] generateStaticManifest not available.');
                    return [];
                }
                return papyr.pssr.generateStaticManifest(routes);
            },

            /**
             * Prerender a list of routes concurrently.
             * @param {Object} options
             * @param {Array<{ path: string, componentFn: Function }>} options.routes
             * @param {number} [options.concurrency=4]
             * @returns {Promise<Array<{ path: string, html: string, duration: number }>>}
             */
            async prerender(options = {}) {
                const { routes = [], concurrency = 4 } = options;
                const results = [];

                // Process in batches of `concurrency`
                for (let i = 0; i < routes.length; i += concurrency) {
                    const batch = routes.slice(i, i + concurrency);
                    const batchResults = await Promise.all(
                        batch.map(async route => {
                            const start = Date.now();
                            try {
                                const element = typeof route.componentFn === 'function'
                                    ? route.componentFn({})
                                    : route.componentFn;
                                const html = papyr.ssr ? papyr.ssr(element) : '';
                                return { path: route.path, html, duration: Date.now() - start };
                            } catch (err) {
                                console.error(`[PSSR SDK Prerender] Failed: ${route.path}`, err);
                                return { path: route.path, html: '', duration: Date.now() - start, error: err.message };
                            }
                        })
                    );
                    results.push(...batchResults);
                    console.log(`[PSSR SDK Prerender] Batch ${Math.floor(i / concurrency) + 1}: ${batch.length} pages rendered.`);
                }

                const total = results.reduce((acc, r) => acc + r.duration, 0);
                console.log(`[PSSR SDK Prerender] ✅ ${results.length} pages prerendered in ${total}ms.`);
                return results;
            }
        }
    };

    // ─── Attach to papyr.pssr ─────────────────────────────────────────────────

    if (papyr.pssr) {
        papyr.pssr.sdk = pssrSDK;
    } else {
        // Defer until pssr is available
        papyr._pssrSDKPending = pssrSDK;
    }
});
