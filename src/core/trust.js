/**
 * PAPYR TRUST BOUNDARIES
 * Runtime trust audit API. Documents and surfaces the 4-zone trust model:
 *   Zone 1 — Papyrus Framework Core (framework-controlled, immutable)
 *   Zone 2 — Plugin Layer (developer-installed, scoped)
 *   Zone 3 — Third-Party Services (external, monitored by WATT)
 *   Zone 4 — Developer Responsibility (application-owned)
 *
 * papyr.trust.report()     — full trust state snapshot
 * papyr.trust.audit()      — surfaced warnings and violations
 * papyr.trust.owns(ns)     — check if Papyrus owns a namespace
 * papyr.trust.zone(ns)     — resolve namespace to a trust zone (1-4)
 * papyr.trust.undisclosed() — surface untracked third-party services
 * papyr.trust.disclose()   — register a known third-party service
 */

coreInitializers.push((papyr) => {

    // Zone 1: namespaces owned by the Papyrus framework
    const _zone1Namespaces = new Set([
        'watt', 'security', 'scheduler', 'power', 'recovery',
        'pssr', 'isr', 'edge', 'router', 'reactivity', 'config',
        'controls', 'access', 'trust', 'seo', 'sdk', 'diagnostics',
        'ssr', 'hydrate', 'island', 'registerIsland', 'theme',
        'state', 'signal', 'computed', 'effect', 'watch',
        'component', 'mount', 'h', 'isBrowser', 'isServer',
        'warn', 'plugin', 'style', 'layout', 'animate', 'math',
        'db', 'auth', 'api', 'payments', 'orm', 'crud',
        'game', 'physics', 'ml', 'ocr', 'ai', 'charts',
        'virtualize', 'accessibility', 'renovate', 'gateway',
        'freeform', 'user'
    ]);

    // Zone 2: plugins registered by developers
    const _zone2Plugins = [];

    // Zone 3: detected and disclosed third-party services
    const _zone3Detected = new Set();
    const _zone3Disclosed = [];

    // Zone 4: developer responsibilities (canonical static list)
    const _zone4Responsibilities = [
        'Application business logic',
        'Authentication & authorization (sessions, tokens, roles)',
        'Data validation & input sanitization',
        'API key security (never expose in client bundles)',
        'Privacy policy compliance (GDPR, CCPA, COPPA)',
        'Content security (what is rendered)',
        'Plugin auditing (third-party plugins)',
        'Dependency security (npm packages)',
        'Infrastructure & TLS certificates',
        'AI prompt safety (Papyrus does not filter AI content)',
        'ISR cache invalidation timing',
        'Edge deployment secrets & environment variables'
    ];

    papyr.trust = {

        /**
         * Full trust state report for the current runtime.
         * @returns {Object} Trust zone snapshot
         */
        report() {
            const zone1 = {};
            _zone1Namespaces.forEach(ns => {
                zone1[ns] = papyr[ns] !== undefined ? 'active' : 'inactive';
            });

            return {
                timestamp: new Date().toISOString(),
                papyrusVersion: '3.1.3',
                zone1: {
                    description: 'Papyrus Framework Core — immutable, framework-controlled',
                    systems: zone1
                },
                zone2: {
                    description: 'Plugin Layer — developer-installed, scoped, additive',
                    plugins: [..._zone2Plugins],
                    adapters: (papyr.sdk && papyr.sdk.adapter) ? papyr.sdk.adapter.list() : []
                },
                zone3: {
                    description: 'Third-Party Services — external, monitored by WATT, not controlled by Papyrus',
                    monitoredOrigins: _zone3Detected.size,
                    disclosedServices: _zone3Disclosed.map(s => s.name),
                    undisclosedDetected: this.undisclosed()
                },
                zone4: {
                    description: 'Developer Responsibility — application-owned, not managed by Papyrus',
                    responsibilities: [..._zone4Responsibilities]
                }
            };
        },

        /**
         * Check if Papyrus owns and is responsible for a given namespace.
         * @param {string} namespace - e.g. 'watt.policies', 'state', 'my-plugin'
         * @returns {boolean}
         */
        owns(namespace) {
            const root = namespace.split('.')[0];
            return _zone1Namespaces.has(root);
        },

        /**
         * Resolve a namespace or service name to its trust zone (1–4).
         * @param {string} namespace
         * @returns {1|2|3|4}
         */
        zone(namespace) {
            const root = namespace.split('.')[0];
            if (_zone1Namespaces.has(root)) return 1;
            if (_zone2Plugins.some(p => p.name === root)) return 2;
            // Zone 4: common developer-owned concepts
            const zone4Patterns = ['auth', 'business', 'api-key', 'prompt', 'content', 'state'];
            if (zone4Patterns.some(p => root.includes(p))) return 4;
            return 3; // Unknown = third-party by default
        },

        /**
         * List third-party origins detected by WATT that have not been disclosed.
         * @returns {string[]}
         */
        undisclosed() {
            const disclosedDomains = _zone3Disclosed.map(s =>
                s.domain || (s.name || '').toLowerCase().replace(/\s+/g, '')
            );
            return Array.from(_zone3Detected).filter(origin =>
                !disclosedDomains.some(d => origin.includes(d))
            );
        },

        /**
         * Disclose a known third-party service to WATT.
         * Prevents it from appearing in undisclosed() warnings.
         *
         * @param {Object} service
         * @param {string} service.name - Display name (e.g. 'Google Analytics')
         * @param {string} [service.domain] - Domain pattern (e.g. 'google-analytics.com')
         * @param {string} [service.type] - 'analytics' | 'marketing' | 'payment' | 'auth' | 'cdn'
         * @param {string[]} [service.dataCollected] - What data is collected
         * @param {string} [service.privacyUrl] - Vendor privacy policy URL
         *
         * @example
         * papyr.trust.disclose({
         *   name: 'Google Analytics',
         *   domain: 'google-analytics.com',
         *   type: 'analytics',
         *   dataCollected: ['page_views', 'device_info'],
         *   privacyUrl: 'https://policies.google.com/privacy'
         * });
         */
        disclose(service) {
            if (!service || !service.name) return;
            _zone3Disclosed.push(service);
            console.log(`[Papyr Trust] Third-party service disclosed: "${service.name}" (${service.type || 'unknown type'})`);
        },

        /**
         * Run a trust audit and surface all active warnings and violations.
         * Emits console warnings/errors. Returns a structured result.
         *
         * @returns {{ passed: boolean, violations: Array, warnings: Array }}
         *
         * @example
         * const result = papyr.trust.audit();
         * if (!result.passed) process.exit(1); // Use in CI
         */
        audit() {
            const violations = [];
            const warnings = [];

            // Check WATT mode
            if (papyr.config) {
                const wattConfig = papyr.config.get('watt');
                if (wattConfig && wattConfig.mode === 'none') {
                    violations.push({
                        code: 'WATT_DISABLED',
                        level: 'critical',
                        message: 'WATT mode is "none". All hardware API protections and network interceptions are disabled.'
                    });
                }
            }

            // Check undisclosed services
            const undisclosed = this.undisclosed();
            if (undisclosed.length > 0) {
                warnings.push({
                    code: 'UNDISCLOSED_SERVICES',
                    level: 'warn',
                    message: `${undisclosed.length} undisclosed third-party origin(s) detected: ${undisclosed.join(', ')}`
                });
            }

            // Check consent banner presence
            if (papyr.isBrowser && papyr.isBrowser() && typeof document !== 'undefined') {
                const hasBanner = document.querySelector('[data-papyr-watt-banner]') ||
                                  document.querySelector('[data-papyr-consent]');
                if (!hasBanner && _zone3Disclosed.length > 0) {
                    warnings.push({
                        code: 'MISSING_CONSENT_BANNER',
                        level: 'warn',
                        message: 'Third-party services are disclosed but no consent banner was detected. GDPR/CCPA compliance may be missing.'
                    });
                }
            }

            // Check for plugins with no declared scope
            const unscopedPlugins = _zone2Plugins.filter(p => !p.scope || p.scope === 'unknown');
            if (unscopedPlugins.length > 0) {
                warnings.push({
                    code: 'UNSCOPED_PLUGINS',
                    level: 'warn',
                    message: `${unscopedPlugins.length} plugin(s) have no declared scope: ${unscopedPlugins.map(p => p.name).join(', ')}`
                });
            }

            // Emit to console
            violations.forEach(v => {
                console.error(`[Papyr Trust Audit] ⛔ ${v.code}: ${v.message}`);
            });
            warnings.forEach(w => {
                console.warn(`[Papyr Trust Audit] ⚠️  ${w.code}: ${w.message}`);
            });

            if (violations.length === 0 && warnings.length === 0) {
                console.log('[Papyr Trust Audit] ✅ No trust violations detected.');
            }

            return {
                passed: violations.length === 0,
                violations,
                warnings,
                timestamp: new Date().toISOString()
            };
        },

        // ─── Internal APIs (used by WATT and plugin system) ──────────────────

        /**
         * @internal Called by WATT network monitor to register a detected origin.
         */
        _detectOrigin(url) {
            try {
                const origin = new URL(url).hostname;
                _zone3Detected.add(origin);
            } catch (e) {
                if (url) _zone3Detected.add(String(url));
            }
        },

        /**
         * @internal Called by papyr.plugin() to register a plugin in Zone 2.
         */
        _registerPlugin(name, meta = {}) {
            if (!_zone2Plugins.find(p => p.name === name)) {
                _zone2Plugins.push({
                    name,
                    scope: meta.scope || 'unknown',
                    version: meta.version || 'unknown',
                    trustedBy: 'developer',
                    registeredAt: new Date().toISOString()
                });
            }
        }
    };
});
