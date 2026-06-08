/**
 * PAPYR STUDIO & IDE SDK FOUNDATION
 * Diagnostics, structural tree inspectors, layout grid overlays, and dev-tooling integration.
 */

coreInitializers.push((papyr) => {
    papyr.sdk = {
        getComponentTree() {
            if (!papyr.isBrowser()) return {};
            const root = document.body;
            
            const buildNode = (node) => {
                if (node.nodeType === 3) {
                    const txt = node.nodeValue.trim();
                    return txt ? { type: 'text', content: txt } : null;
                }
                if (node.nodeType !== 1) return null;

                const info = {
                    tag: node.tagName.toLowerCase(),
                    id: node.id || undefined,
                    classes: node.className ? node.className.split(' ').filter(Boolean) : undefined,
                    isMounted: node._isMounted || false
                };

                if (node._renderFn) {
                    info.componentName = node._renderFn.name || 'AnonymousComponent';
                }

                const children = Array.from(node.childNodes)
                    .map(buildNode)
                    .filter(Boolean);
                
                if (children.length > 0) info.children = children;
                return info;
            };

            return buildNode(root);
        },

        inspectState() {
            if (papyr.state && typeof papyr.state.list === 'function') {
                return papyr.state.list().map((s, idx) => ({
                    id: idx,
                    value: s.value,
                    subscribersCount: s._subscribers ? s._subscribers.size : 0
                }));
            }
            return [];
        },

        onHotReload(cb) {
            if (typeof window !== 'undefined') {
                window.addEventListener('papyr-hot-reload', (e) => {
                    cb(e.detail);
                });
            }
        },

        toggleDesignGrid(enable, spacing = 8) {
            if (!papyr.isBrowser()) return;
            
            let gridOverlay = document.getElementById('papyr-design-grid-overlay');
            if (!enable) {
                if (gridOverlay) gridOverlay.remove();
                return;
            }
            
            if (gridOverlay) {
                gridOverlay.style.backgroundSize = `${spacing}px ${spacing}px`;
                return;
            }

            gridOverlay = document.createElement('div');
            gridOverlay.id = 'papyr-design-grid-overlay';
            gridOverlay.style.cssText = `
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                pointer-events: none;
                z-index: 999999;
                background-image: 
                    linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
                background-size: ${spacing}px ${spacing}px;
            `;
            document.body.appendChild(gridOverlay);
        },

        // ─── Plugin SDK ───────────────────────────────────────────────────────

        plugin: {
            /**
             * Validate a plugin object before registration.
             * Checks for required fields and warns about missing metadata.
             *
             * @param {Object} plugin - Plugin object to validate
             * @returns {{ valid: boolean, warnings: string[] }}
             */
            validate(plugin) {
                const warnings = [];
                if (!plugin || typeof plugin !== 'object') {
                    return { valid: false, warnings: ['Plugin must be an object.'] };
                }
                if (!plugin.name) warnings.push('Plugin is missing a "name" field.');
                if (!plugin.install && !plugin.apply && !plugin.fn) {
                    warnings.push('Plugin has no install(), apply(), or fn() handler.');
                }
                if (!plugin.version) warnings.push('Plugin is missing a "version" field.');
                if (!plugin.scope) warnings.push('Plugin is missing a "scope" field (e.g. "animation", "layout").');

                warnings.forEach(w => console.warn(`[Papyr SDK Plugin] ${w}`));
                return { valid: warnings.filter(w => w.includes('missing a "name"') || w.includes('no install')).length === 0, warnings };
            },

            /**
             * List all currently registered plugins.
             * @returns {Array}
             */
            list() {
                if (papyr.trust && papyr.trust.report) {
                    return papyr.trust.report().zone2.plugins;
                }
                return [];
            },

            /**
             * Get a registered plugin's declared scope.
             * @param {string} name - Plugin name
             * @returns {string|null}
             */
            scope(name) {
                const plugins = this.list();
                const plugin = plugins.find(p => p.name === name);
                return plugin ? plugin.scope : null;
            }
        },

        // ─── Adapter Registry ─────────────────────────────────────────────────

        adapter: {
            _registry: [],

            /**
             * Register a custom adapter (e.g. for a framework or rendering target).
             *
             * @param {string} name - Adapter name
             * @param {Object} adapter - Adapter implementation
             * @param {Object} [meta] - Metadata { type, version, description }
             *
             * @example
             * papyr.sdk.adapter.register('preact', preactAdapter, { type: 'framework' });
             */
            register(name, adapter, meta = {}) {
                if (!name || !adapter) return;
                const existing = this._registry.findIndex(a => a.name === name);
                const entry = { name, adapter, type: meta.type || 'custom', version: meta.version || '1.0.0', registeredAt: new Date().toISOString() };
                if (existing !== -1) {
                    this._registry[existing] = entry;
                } else {
                    this._registry.push(entry);
                }
                console.log(`[Papyr SDK] Adapter "${name}" registered (${entry.type}).`);
            },

            /**
             * List all registered adapters.
             * @returns {Array<{ name: string, type: string, version: string }>}
             */
            list() {
                return this._registry.map(({ name, type, version, registeredAt }) => ({ name, type, version, registeredAt }));
            },

            /**
             * Get a registered adapter by name.
             * @param {string} name
             * @returns {Object|null}
             */
            get(name) {
                const entry = this._registry.find(a => a.name === name);
                return entry ? entry.adapter : null;
            },

            /**
             * Remove an adapter from the registry.
             * @param {string} name
             */
            unregister(name) {
                this._registry = this._registry.filter(a => a.name !== name);
            }
        },

        // ─── Config Snapshot ──────────────────────────────────────────────────

        config: {
            /**
             * Take a snapshot of the current papyr.config() state.
             * @returns {Object} Deep clone of all config domains
             *
             * @example
             * const snapshot = papyr.sdk.config.snapshot();
             * // ... make changes ...
             * papyr.sdk.config.restore(snapshot);
             */
            snapshot() {
                if (!papyr.config || typeof papyr.config.getAll !== 'function') return {};
                return papyr.config.getAll();
            },

            /**
             * Restore a previously taken config snapshot.
             * @param {Object} snapshot - Snapshot from papyr.sdk.config.snapshot()
             */
            restore(snapshot) {
                if (!snapshot || !papyr.config) return;
                Object.entries(snapshot).forEach(([domain, values]) => {
                    papyr.config(domain, values);
                });
                console.log('[Papyr SDK] Config restored from snapshot.');
            },

            /**
             * List a summary of all current config values across domains.
             * @returns {Object}
             */
            summary() {
                if (!papyr.config || typeof papyr.config.getAll !== 'function') return {};
                const all = papyr.config.getAll();
                return Object.entries(all).reduce((acc, [domain, values]) => {
                    acc[domain] = Object.keys(values);
                    return acc;
                }, {});
            }
        },

        // ─── Controls Introspection ───────────────────────────────────────────

        controls: {
            /**
             * List all available control namespaces and their methods.
             * @returns {Object} Map of namespace → method names
             */
            list() {
                if (!papyr.controls) return {};
                return Object.keys(papyr.controls).reduce((acc, ns) => {
                    acc[ns] = Object.keys(papyr.controls[ns]).filter(k => typeof papyr.controls[ns][k] === 'function');
                    return acc;
                }, {});
            }
        }
    };
});

