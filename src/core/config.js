/**
 * PAPYR CONFIG ENGINE
 * Unified runtime configuration and imperative control surface.
 * papyr.config(domain, values) — declarative settings
 * papyr.controls.*             — imperative runtime actions
 *
 * Domains: rendering | animation | layout | design | watt | ssr
 */

coreInitializers.push((papyr) => {

    // ─── Internal Config Store ───────────────────────────────────────────────

    const _store = {
        rendering: {
            mode: 'csr',
            schedulerMode: 'adaptive',
            targetFps: 60,
            frameBudget: 16,
            backgroundProcessing: true,
            virtualization: true
        },
        animation: {
            duration: 300,
            curve: 'ease-in-out',
            reducedMotion: 'auto',
            gpuAcceleration: true,
            springStiffness: 200,
            springDamping: 20
        },
        layout: {
            autoFlex: true,
            breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280 },
            adaptiveNavigation: true
        },
        design: {
            theme: 'system',
            colorMode: 'auto',
            typography: { fontFamily: 'system-ui', scale: 1.0 },
            reducedTransparency: 'auto'
        },
        watt: {
            mode: 'default',
            policies: {
                camera: 'prompt',
                microphone: 'prompt',
                location: 'prompt',
                notifications: 'prompt',
                bluetooth: 'prompt',
                usb: 'prompt',
                sensors: 'prompt',
                clipboard: 'prompt'
            },
            banners: true,
            trackingConsent: true
        },
        ssr: {
            hydrationStrategy: 'islands',
            streaming: true,
            edge: false
        }
    };

    const _defaults = JSON.parse(JSON.stringify(_store));
    const _changeListeners = [];

    function _notify(domain, value) {
        _changeListeners.forEach(fn => {
            try { fn({ domain, value }); } catch (e) {}
        });
    }

    function _applyWattMode(mode) {
        if (mode === 'none') {
            // Option A: full WATT disable — developer opts in, owns responsibility
            if (papyr.security) papyr.security._wattEnabled = false;
            console.warn(
                '[Papyr Config] WATT mode set to "none". ' +
                'All hardware API interceptions and protections are disabled. ' +
                'This is entirely the developer\'s responsibility.'
            );
        } else if (mode === 'default') {
            if (papyr.security) papyr.security._wattEnabled = true;
        } else if (mode === 'strict') {
            if (papyr.security && papyr.security.policies) {
                const hwApis = Object.keys(_store.watt.policies);
                hwApis.forEach(api => { papyr.security.policies[api] = 'deny'; });
            }
        }
    }

    // ─── papyr.config() ───────────────────────────────────────────────────────

    /**
     * Set configuration for a named domain.
     *
     * @param {string} domain - 'rendering' | 'animation' | 'layout' | 'design' | 'watt' | 'ssr'
     * @param {Object} values - Partial config values to merge into the domain
     *
     * @example
     * papyr.config('animation', { duration: 500, reducedMotion: 'force-reduce' });
     * papyr.config('watt', { mode: 'strict' });
     * papyr.config('rendering', { targetFps: 30, frameBudget: 33 });
     */
    const configFn = (domain, values) => {
        if (!domain || typeof values !== 'object') return;

        if (!_store[domain]) {
            console.warn(
                `[Papyr Config] Unknown config domain "${domain}". ` +
                `Available: ${Object.keys(_store).join(', ')}`
            );
            return;
        }

        // Deep-merge into store
        _store[domain] = { ..._store[domain], ...values };

        // Side effects per domain
        if (domain === 'watt' && values.mode !== undefined) {
            _applyWattMode(values.mode);
        }
        if (domain === 'watt' && values.policies) {
            if (papyr.security && papyr.security.policies) {
                Object.assign(papyr.security.policies, values.policies);
            }
        }
        if (domain === 'rendering' && values.targetFps !== undefined && papyr.power) {
            papyr.power.targetFps.value = values.targetFps;
        }
        if (domain === 'animation') {
            if (values.reducedMotion !== undefined && typeof document !== 'undefined') {
                if (values.reducedMotion === 'force-reduce') {
                    document.documentElement.classList.add('papyr-reduced-motion');
                } else if (values.reducedMotion === 'force-normal') {
                    document.documentElement.classList.remove('papyr-reduced-motion');
                }
            }
            if (values.duration !== undefined && typeof document !== 'undefined') {
                document.documentElement.style.setProperty('--papyr-duration', `${values.duration}ms`);
            }
        }
        if (domain === 'design') {
            if (values.theme !== undefined && typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-papyr-theme', values.theme);
                document.documentElement.classList.toggle('dark', values.theme === 'dark');
            }
            if (values.typography && typeof document !== 'undefined') {
                if (values.typography.fontFamily) {
                    document.documentElement.style.setProperty('--papyr-font', values.typography.fontFamily);
                }
                if (values.typography.scale) {
                    document.documentElement.style.setProperty('--papyr-scale', values.typography.scale);
                }
            }
        }
        if (domain === 'ssr' && values.hydrationStrategy && papyr.pssr) {
            papyr.pssr._hydrationStrategy = values.hydrationStrategy;
        }

        _notify(domain, _store[domain]);
    };

    /**
     * Read config value(s).
     * @param {string} path - Domain name or dotted path ('rendering.mode')
     * @returns {*} Config value or domain object
     */
    configFn.get = (path) => {
        if (!path) return null;
        const parts = path.split('.');
        if (parts.length === 1) return _store[parts[0]] ? { ..._store[parts[0]] } : undefined;
        if (parts.length === 2) {
            const domain = _store[parts[0]];
            return domain !== undefined ? domain[parts[1]] : undefined;
        }
        return undefined;
    };

    /** Get a full snapshot of all config domains. */
    configFn.getAll = () => JSON.parse(JSON.stringify(_store));

    /**
     * Reset config to defaults.
     * @param {string} [domain] - Reset a single domain, or all if omitted
     */
    configFn.reset = (domain) => {
        if (domain && _defaults[domain]) {
            _store[domain] = JSON.parse(JSON.stringify(_defaults[domain]));
            _notify(domain, _store[domain]);
        } else {
            Object.keys(_defaults).forEach(d => {
                _store[d] = JSON.parse(JSON.stringify(_defaults[d]));
            });
            _notify('all', _store);
        }
    };

    /**
     * Subscribe to config changes.
     * @param {'change'} event
     * @param {Function} handler - ({ domain, value }) => void
     */
    configFn.on = (event, handler) => {
        if (event === 'change' && typeof handler === 'function') {
            _changeListeners.push(handler);
        }
    };

    /** Unsubscribe a change handler. */
    configFn.off = (handler) => {
        const idx = _changeListeners.indexOf(handler);
        if (idx !== -1) _changeListeners.splice(idx, 1);
    };

    papyr.config = configFn;

    // ─── papyr.controls ───────────────────────────────────────────────────────

    /**
     * Imperative runtime controls. Unlike papyr.config(), these are
     * immediate actions rather than declarative state changes.
     */
    papyr.controls = {

        /** Rendering runtime controls */
        rendering: {
            setPriority(level) {
                const map = { low: 'idle', normal: 'normal', high: 'user-blocking', critical: 'immediate' };
                _store.rendering.priority = level;
                if (papyr.scheduler) {
                    papyr.scheduler._defaultPriority = map[level] || 'normal';
                }
            },
            setSchedulerMode(mode) {
                _store.rendering.schedulerMode = mode;
                console.log(`[Papyr Controls] Scheduler mode → ${mode}`);
            },
            setVirtualization(opts) {
                _store.rendering.virtualization = opts;
                if (papyr.virtualize && papyr.virtualize._config) {
                    Object.assign(papyr.virtualize._config, typeof opts === 'object' ? opts : {});
                }
            },
            setTargetFps(fps) {
                _store.rendering.targetFps = fps;
                if (papyr.power) papyr.power.targetFps.value = fps;
            },
            setFrameBudget(ms) {
                _store.rendering.frameBudget = ms;
            }
        },

        /** Animation runtime controls */
        animation: {
            setDuration(ms) {
                _store.animation.duration = ms;
                if (typeof document !== 'undefined') {
                    document.documentElement.style.setProperty('--papyr-duration', `${ms}ms`);
                }
            },
            setCurve(curve) {
                _store.animation.curve = curve;
                if (typeof document !== 'undefined') {
                    document.documentElement.style.setProperty('--papyr-curve', curve);
                }
            },
            enableGPU() {
                _store.animation.gpuAcceleration = true;
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.add('papyr-gpu');
                }
            },
            disableGPU() {
                _store.animation.gpuAcceleration = false;
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.remove('papyr-gpu');
                }
            },
            /** Accessibility override: disable all motion */
            disableAll() {
                _store.animation.reducedMotion = 'force-reduce';
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.add('papyr-reduced-motion');
                }
            },
            enableAll() {
                _store.animation.reducedMotion = 'force-normal';
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.remove('papyr-reduced-motion');
                }
            },
            setSpring(stiffness, damping) {
                _store.animation.springStiffness = stiffness;
                _store.animation.springDamping = damping;
            }
        },

        /** Layout runtime controls */
        layout: {
            setBreakpoints(breakpoints) {
                _store.layout.breakpoints = { ..._store.layout.breakpoints, ...breakpoints };
            },
            setResponsive(enabled) {
                _store.layout.autoFlex = enabled;
            },
            setAdaptiveNav(enabled) {
                _store.layout.adaptiveNavigation = enabled;
            }
        },

        /** Design system runtime controls */
        design: {
            setTheme(theme) {
                _store.design.theme = theme;
                if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-papyr-theme', theme);
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                }
                if (papyr.theme) papyr.theme(theme);
            },
            /**
             * Set CSS design tokens on the root element.
             * @param {Object} tokens - e.g. { primary: '#6C63FF', radius: '8px' }
             */
            setTokens(tokens) {
                if (typeof document !== 'undefined') {
                    Object.entries(tokens).forEach(([key, value]) => {
                        document.documentElement.style.setProperty(`--papyr-${key}`, value);
                    });
                }
            },
            setTypography(opts) {
                _store.design.typography = { ..._store.design.typography, ...opts };
                if (typeof document !== 'undefined') {
                    if (opts.fontFamily) {
                        document.documentElement.style.setProperty('--papyr-font', opts.fontFamily);
                    }
                    if (opts.scale) {
                        document.documentElement.style.setProperty('--papyr-scale', opts.scale);
                    }
                }
            },
            setScale(scale) {
                _store.design.typography.scale = scale;
                if (typeof document !== 'undefined') {
                    document.documentElement.style.setProperty('--papyr-scale', scale);
                }
            }
        },

        /** WATT permission and UI controls */
        watt: {
            setPolicy(api, policy) {
                if (_store.watt.policies) _store.watt.policies[api] = policy;
                if (papyr.security && papyr.security.policies) {
                    papyr.security.policies[api] = policy;
                }
            },
            setMode(mode) {
                _store.watt.mode = mode;
                _applyWattMode(mode);
            },
            showBanner(type) {
                if (papyr.watt && papyr.watt.sdk) {
                    papyr.watt.sdk.dialog({ type });
                }
            },
            dismissBanner() {
                if (typeof document !== 'undefined') {
                    document.querySelectorAll('[data-papyr-watt-banner]').forEach(b => b.remove());
                }
            },
            requestConsent(type, callback) {
                if (papyr.watt && papyr.watt.sdk) {
                    papyr.watt.sdk.consent({ categories: [type], onConsentChange: callback });
                } else if (papyr.isBrowser && papyr.isBrowser()) {
                    const granted = window.confirm(`Allow ${type}?`);
                    if (callback) callback(granted ? [type] : []);
                }
            }
        },

        /** Scheduler and power runtime controls */
        scheduler: {
            setFrameBudget(ms) {
                _store.rendering.frameBudget = ms;
            },
            setPowerMode(mode) {
                if (!papyr.power) return;
                const map = {
                    'performance': 'active',
                    'balanced': 'active',
                    'low-power': 'idle',
                    'ultra-low': 'away'
                };
                papyr.power.state.value = map[mode] || 'active';
            },
            pause() {
                if (papyr.power) papyr.power.state.value = 'suspended';
            },
            resume() {
                if (papyr.power) {
                    papyr.power.state.value = 'active';
                    if (typeof papyr.power.activity === 'function') papyr.power.activity();
                }
            }
        }
    };
});
