/**
 * PAPYR ACCESS TIER SYSTEM
 * Documents and enforces the 3-tier developer access model:
 *
 *   FULL       — components, state, router, design, animations, SDKs, plugins
 *   RESTRICTED — internals with public APIs but should not be modified directly
 *   PROTECTED  — framework-immutable: security kernel, WATT enforcement, recovery
 *
 * Access tiers are advisory in nature (warn in dev, never throw) to preserve
 * Freeform Freedom. Developers are informed, not blocked.
 */

coreInitializers.push((papyr) => {

    // ─── Tier Definitions ────────────────────────────────────────────────────

    const _tiers = {
        // FULL — complete developer access
        full: new Set([
            'state', 'signal', 'computed', 'effect', 'watch',
            'component', 'mount', 'h', 'render', 'hydrate',
            'router', 'route', 'page', 'navigate',
            'theme', 'style', 'design', 'animate', 'layout',
            'config', 'controls',
            'plugin', 'sdk', 'adapter',
            'db', 'auth', 'api', 'payments', 'orm', 'crud',
            'game', 'physics', 'ml', 'ocr', 'ai', 'charts',
            'math', 'seo', 'pssr', 'isr', 'edge',
            'freeform', 'diagnostics', 'accessibility',
            'watt.sdk', 'pssr.sdk', 'trust'
        ]),

        // RESTRICTED — has public API, but internals must not be modified directly
        restricted: new Set([
            'scheduler', 'power', 'virtualize',
            'security', 'watt',
            'reactivity',
            'renovate', 'gateway',
            'user'
        ]),

        // PROTECTED — framework-owned, modification is disallowed
        protected: new Set([
            'security._enforcer',
            'security._interceptors',
            'watt._kernel',
            'recovery._monitor',
            'scheduler._taskQueue',
            'pssr._hydrationIntegrity',
            'trust._zone1Namespaces'
        ])
    };

    // ─── Access Tier Map (namespace → tier) ──────────────────────────────────

    const _tierMap = new Map();
    _tiers.full.forEach(ns => _tierMap.set(ns, 'full'));
    _tiers.restricted.forEach(ns => _tierMap.set(ns, 'restricted'));
    _tiers.protected.forEach(ns => _tierMap.set(ns, 'protected'));

    // Track sealed namespaces (one-time, init-only)
    const _sealed = new Set();
    let _initComplete = false;

    // ─── papyr.access ─────────────────────────────────────────────────────────

    papyr.access = {

        /**
         * Get the access tier for a namespace.
         * @param {string} namespace - e.g. 'security', 'state', 'watt._kernel'
         * @returns {'full'|'restricted'|'protected'|'unknown'}
         *
         * @example
         * papyr.access.tier('state');           // 'full'
         * papyr.access.tier('security');        // 'restricted'
         * papyr.access.tier('watt._kernel');    // 'protected'
         */
        tier(namespace) {
            if (!namespace) return 'unknown';

            // Check exact match first
            if (_tierMap.has(namespace)) return _tierMap.get(namespace);

            // Check root namespace
            const root = namespace.split('.')[0];
            if (_tierMap.has(root)) return _tierMap.get(root);

            return 'unknown';
        },

        /**
         * List all namespaces grouped by access tier.
         * @returns {{ full: string[], restricted: string[], protected: string[] }}
         */
        list() {
            return {
                full: Array.from(_tiers.full),
                restricted: Array.from(_tiers.restricted),
                protected: Array.from(_tiers.protected)
            };
        },

        /**
         * Check if a namespace is freely accessible.
         * @param {string} namespace
         * @returns {boolean}
         */
        isAccessible(namespace) {
            return this.tier(namespace) === 'full';
        },

        /**
         * Seal a namespace — marks it as write-protected post-initialization.
         * Only effective during the init phase (before papyr is fully loaded).
         * Subsequent calls to seal() post-init are no-ops with a warning.
         *
         * @param {string} namespace
         */
        seal(namespace) {
            if (_initComplete) {
                console.warn(
                    `[Papyr Access] papyr.access.seal("${namespace}") called after initialization. ` +
                    `Sealing is a one-time, init-phase operation. This call is ignored.`
                );
                return;
            }
            _sealed.add(namespace);
        },

        /**
         * Check if a namespace has been sealed.
         * @param {string} namespace
         * @returns {boolean}
         */
        isSealed(namespace) {
            return _sealed.has(namespace);
        },

        /**
         * Issue a framework advisory warning about access to a restricted namespace.
         * Called internally when restricted/protected APIs are touched in unsafe ways.
         *
         * @param {string} message - Warning message
         * @param {'restricted'|'protected'} tier - The access tier being violated
         */
        warn(message, tier = 'restricted') {
            if (tier === 'protected') {
                console.error(
                    `[Papyr Access] 🔒 PROTECTED NAMESPACE ACCESS: ${message}\n` +
                    `Protected systems may not be modified. If you need this capability, ` +
                    `use the official SDK or plugin APIs instead.`
                );
            } else {
                console.warn(
                    `[Papyr Access] ⚠️  RESTRICTED NAMESPACE: ${message}\n` +
                    `This namespace exposes APIs but its internals should not be modified directly. ` +
                    `Use the documented public API instead.`
                );
            }
        },

        /**
         * Declare that initialization is complete.
         * Prevents further seal() operations from taking effect.
         * Called automatically after all coreInitializers run.
         * @internal
         */
        _markInitComplete() {
            _initComplete = true;
        },

        /**
         * Validate that a plugin or developer action is operating within its declared scope.
         * Advisory only — emits warnings, does not block execution.
         *
         * @param {string} pluginName
         * @param {string} targetNamespace
         * @returns {boolean} true if within scope
         */
        validateScope(pluginName, targetNamespace) {
            const t = this.tier(targetNamespace);

            if (t === 'protected') {
                this.warn(
                    `Plugin "${pluginName}" attempted to access protected namespace "${targetNamespace}".`,
                    'protected'
                );
                return false;
            }

            if (t === 'restricted') {
                this.warn(
                    `Plugin "${pluginName}" is accessing restricted namespace "${targetNamespace}". ` +
                    `Ensure you are using only the documented public API.`,
                    'restricted'
                );
                return true; // Advisory, not blocked
            }

            return true;
        }
    };

    // Mark init complete after a short delay (post coreInitializers execution)
    if (typeof Promise !== 'undefined') {
        Promise.resolve().then(() => {
            papyr.access._markInitComplete();
        });
    }
});
