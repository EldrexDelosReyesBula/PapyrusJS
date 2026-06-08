/**
 * PAPYR FREEFORM FREEDOM
 * Framework-agnostic interoperability layer.
 * Papyrus acts as an orchestration layer — it does not replace your stack.
 *
 * papyr.freeform.detect()    — detect frameworks currently on the page
 * papyr.freeform.use([...])  — selectively activate Papyrus subsystems
 * papyr.freeform.vanilla()   — vanilla JS compatibility mode (C: fully enabled, no auto-init)
 * papyr.freeform.vue(app)    — Vue 3 reactivity bridge
 * papyr.freeform.react(opts) — React hooks bridge (extends papyr.react if present)
 *
 * Resolution for Q2: vanilla() mode remains fully enabled.
 * It prevents auto-initialization only — all papyr APIs stay accessible.
 */

coreInitializers.push((papyr) => {

    // ─── Framework Detection ──────────────────────────────────────────────────

    function _detectFrameworks() {
        const detected = {
            react: false,
            vue: false,
            angular: false,
            svelte: false,
            nextjs: false,
            nuxt: false,
            tailwind: false,
            bootstrap: false,
            materialDesign: false
        };

        if (typeof window === 'undefined') return detected;

        // React
        if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) detected.react = true;
        if (document.querySelector('[data-reactroot]') || document.querySelector('[data-reactid]')) detected.react = true;

        // Vue
        if (window.Vue || window.__VUE__) detected.vue = true;
        if (document.querySelector('[data-v-app]') || document.querySelector('#app.__vue_app__')) detected.vue = true;

        // Angular
        if (window.ng || window.getAllAngularRootElements) detected.angular = true;
        if (document.querySelector('[ng-version]') || document.querySelector('app-root')) detected.angular = true;

        // Svelte
        if (window.__svelte || document.querySelector('[class*="svelte-"]')) detected.svelte = true;

        // Next.js
        if (window.__NEXT_DATA__ || window.next) detected.nextjs = true;

        // Nuxt
        if (window.__NUXT__ || window.$nuxt) detected.nuxt = true;

        // Tailwind — look for utility class patterns in stylesheets
        try {
            const sheets = Array.from(document.styleSheets);
            const hasTailwind = sheets.some(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    return rules.some(r => r.selectorText && r.selectorText.match(/\.(flex|grid|text-|bg-|p-\d|m-\d)/));
                } catch (e) { return false; }
            });
            if (hasTailwind) detected.tailwind = true;
        } catch (e) {}

        // Bootstrap
        if (window.bootstrap) detected.bootstrap = true;
        if (document.querySelector('.container-fluid, .navbar-toggler') || window.jQuery) detected.bootstrap = true;

        // Material Design (MDC Web or Angular Material)
        if (window.mdc || document.querySelector('.mdc-button, .mat-button')) detected.materialDesign = true;

        return detected;
    }

    // ─── Selective Subsystem Activation ──────────────────────────────────────

    const _allSubsystems = [
        'state', 'signal', 'computed', 'effect', 'watch',
        'component', 'mount', 'h', 'router', 'page', 'route',
        'theme', 'style', 'animate', 'layout',
        'config', 'controls', 'access', 'trust',
        'pssr', 'isr', 'edge', 'seo',
        'scheduler', 'power', 'recovery',
        'watt', 'security',
        'db', 'auth', 'api', 'payments',
        'sdk', 'plugin', 'freeform'
    ];

    let _activeSubsystems = new Set(_allSubsystems); // All active by default
    let _vanillaMode = false;

    // ─── Vue 3 Reactivity Bridge ──────────────────────────────────────────────

    function _vueAdapter(app) {
        if (!app || typeof app.config === 'undefined') {
            console.warn('[Papyr Freeform] papyr.freeform.vue() requires a Vue 3 app instance.');
            return;
        }

        // Expose papyr signals as Vue global properties
        app.config.globalProperties.$papyr = papyr;
        app.config.globalProperties.$signal = papyr.signal || papyr.state;
        app.config.globalProperties.$computed = papyr.computed;

        // Vue plugin install
        app.provide('papyr', papyr);

        console.log('[Papyr Freeform] Vue 3 bridge installed. Access papyr via inject("papyr") or this.$papyr.');

        return {
            /** Create a Vue ref backed by a Papyrus signal */
            useSignal(initialValue) {
                const sig = papyr.signal ? papyr.signal(initialValue) : papyr.state(initialValue);
                // Return an object compatible with Vue's ref interface
                return {
                    get value() { return sig.value; },
                    set value(v) { sig.value = v; },
                    subscribe: sig.subscribe ? sig.subscribe.bind(sig) : () => {}
                };
            },

            /** Create a Vue computed backed by papyr.computed */
            useComputed(fn) {
                return papyr.computed ? papyr.computed(fn) : { value: fn() };
            }
        };
    }

    // ─── papyr.freeform ───────────────────────────────────────────────────────

    papyr.freeform = {

        /**
         * Detect which frameworks and libraries are currently active on the page.
         * @returns {Object} Boolean map of detected frameworks
         *
         * @example
         * const env = papyr.freeform.detect();
         * // { react: true, tailwind: true, vue: false, ... }
         */
        detect() {
            const frameworks = _detectFrameworks();
            console.log('[Papyr Freeform] Detected environment:', frameworks);
            return frameworks;
        },

        /**
         * Selectively activate specific Papyrus subsystems.
         * Disables all others to minimize footprint in mixed-stack apps.
         *
         * @param {string[]} subsystems - Subsystem names to keep active
         *
         * @example
         * // Use only reactivity and animation in a React app
         * papyr.freeform.use(['state', 'animate', 'theme']);
         */
        use(subsystems = []) {
            if (!Array.isArray(subsystems) || subsystems.length === 0) {
                console.warn('[Papyr Freeform] use() requires a non-empty array of subsystem names.');
                return;
            }

            _activeSubsystems = new Set(subsystems);
            console.log(`[Papyr Freeform] Active subsystems: ${subsystems.join(', ')}`);

            // Null-op non-active subsystems (advisory — does not remove APIs)
            _allSubsystems.forEach(sys => {
                if (!_activeSubsystems.has(sys) && papyr[sys]) {
                    papyr[sys]._papyrActive = false;
                }
            });

            return papyr;
        },

        /**
         * Vanilla JS compatibility mode.
         * Prevents auto-mount and auto-router initialization.
         * All papyr APIs remain fully accessible (Option C).
         *
         * @returns {Object} papyr instance
         *
         * @example
         * papyr.freeform.vanilla();
         * // Use papyr.state() and papyr.animate() directly in vanilla JS
         */
        vanilla() {
            _vanillaMode = true;
            papyr._vanillaMode = true;

            // Prevent auto-initialization behaviors
            if (papyr.router) papyr.router._autoInit = false;
            if (papyr.pssr) papyr.pssr._autoHydrate = false;

            console.log(
                '[Papyr Freeform] Vanilla mode active. Auto-init disabled. ' +
                'All papyr APIs remain fully available.'
            );

            return papyr;
        },

        /**
         * Vue 3 integration bridge.
         * Injects Papyrus reactivity into a Vue app without replacing Vue's own system.
         *
         * @param {Object} app - Vue 3 app instance (from createApp())
         * @returns {Object} Bridge utilities (useSignal, useComputed)
         *
         * @example
         * import { createApp } from 'vue';
         * const app = createApp(App);
         * const { useSignal } = papyr.freeform.vue(app);
         * app.mount('#app');
         */
        vue(app) {
            return _vueAdapter(app);
        },

        /**
         * React bridge — wraps existing papyr.react() if present, adds bridge utilities.
         *
         * @example
         * const { useSignal } = papyr.freeform.react();
         */
        react() {
            if (papyr.react && typeof papyr.react === 'function') {
                return papyr.react();
            }
            // Basic bridge when papyr-complete.js is not loaded
            console.warn('[Papyr Freeform] Full React bridge requires papyr-complete.js or papyr-plugins.js.');
            return {
                useSignal: (initialValue) => {
                    const sig = papyr.state ? papyr.state(initialValue) : { value: initialValue };
                    return [sig.value, (v) => { sig.value = v; }];
                }
            };
        },

        /** @returns {boolean} True if vanilla mode is active */
        isVanilla() {
            return _vanillaMode;
        },

        /** @returns {string[]} List of currently active subsystems */
        activeSubsystems() {
            return Array.from(_activeSubsystems);
        },

        /** Restore all subsystems to active */
        reset() {
            _activeSubsystems = new Set(_allSubsystems);
            _vanillaMode = false;
            papyr._vanillaMode = false;
            _allSubsystems.forEach(sys => {
                if (papyr[sys]) papyr[sys]._papyrActive = true;
            });
            console.log('[Papyr Freeform] All subsystems restored.');
            return papyr;
        }
    };
});
