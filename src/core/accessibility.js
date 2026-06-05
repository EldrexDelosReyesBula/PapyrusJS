/**
 * PAPYR ACCESSIBILITY & THEME ENGINE
 * Implements themes, adaptive battery-aware layouts, True Tone warmth overlays, and accessibility presets.
 */

coreInitializers.push((papyr) => {
    // 1. Accessibility Configuration API
    let reducedMotion = false;
    let largeTextEnabled = false;
    let accessibilityContrast = 'normal';

    papyr.accessibility = {
        motion(enable) {
            reducedMotion = !enable;
            if (typeof document !== 'undefined' && document.documentElement) {
                document.documentElement.classList.toggle('papyr-reduced-motion', !enable);
                // Set CSS to disable transitions
                if (!enable) {
                    papyr.style(`
                        .papyr-reduced-motion *, .papyr-reduced-motion *::before, .papyr-reduced-motion *::after {
                            animation-delay: -1ms !important;
                            animation-duration: 1ms !important;
                            animation-iteration-count: 1 !important;
                            background-attachment: initial !important;
                            scroll-behavior: auto !important;
                            transition-duration: 0s !important;
                            transition-delay: 0s !important;
                        }
                    `);
                }
            }
            console.log(`♿ Accessibility: Reduced Motion set to ${!enable}`);
            return this;
        },

        largeText(enable) {
            largeTextEnabled = !!enable;
            if (typeof document !== 'undefined' && document.documentElement) {
                document.documentElement.classList.toggle('papyr-large-text', enable);
                if (enable) {
                    papyr.style(`
                        .papyr-large-text {
                            font-size: 115% !important;
                        }
                    `);
                }
            }
            console.log(`♿ Accessibility: Large Text set to ${enable}`);
            return this;
        },

        contrast(level) {
            accessibilityContrast = level;
            if (typeof document !== 'undefined' && document.documentElement) {
                const enable = level === 'high';
                document.documentElement.classList.toggle('papyr-high-contrast', enable);
                if (enable) {
                    // Set high contrast CSS variables
                    papyr.theme({
                        'bg-primary': '#000000',
                        'text-primary': '#ffffff',
                        'primary': '#ffff00',
                        'border-color': '#ffffff'
                    });
                } else {
                    // Reset to standard
                    papyr.theme({
                        'bg-primary': '',
                        'text-primary': '',
                        'primary': '',
                        'border-color': ''
                    });
                }
            }
            console.log(`♿ Accessibility: Contrast level set to ${level}`);
            return this;
        },

        // Helper to auto-inject ARIA role and attributes on element creation
        autoAria(el, tag) {
            if (!el || typeof el.setAttribute !== 'function') return;

            const t = tag.toLowerCase();
            // Fallback Role
            if (!el.hasAttribute('role')) {
                if (t === 'button') el.setAttribute('role', 'button');
                else if (t === 'a' && el.hasAttribute('href')) el.setAttribute('role', 'link');
                else if (t === 'input' && el.getAttribute('type') === 'checkbox') el.setAttribute('role', 'checkbox');
                else if (t === 'input' && el.getAttribute('type') === 'radio') el.setAttribute('role', 'radio');
                else if (['nav', 'header', 'footer', 'main', 'aside'].includes(t)) el.setAttribute('role', t);
            }

            // Fallback aria-label if element is interactive but has no text label or aria-label
            if (!el.hasAttribute('aria-label') && ['button', 'a'].includes(t)) {
                const text = el.textContent || el.getAttribute('title') || el.getAttribute('placeholder');
                if (text) {
                    el.setAttribute('aria-label', text.trim());
                }
            }
        }
    };

    // 2. Keyboard Focus Ring Visibility Tracker
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const handleFirstTab = (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('papyr-user-is-tabbing');
                // Inject styling for visible focus outline
                papyr.style(`
                    .papyr-user-is-tabbing *:focus {
                        outline: 3px solid var(--primary, #6366f1) !important;
                        outline-offset: 2px !important;
                    }
                `);
                window.removeEventListener('keydown', handleFirstTab);
            }
        };
        window.addEventListener('keydown', handleFirstTab);
    }

    // 3. Theme Engine Configuration (Themes support)
    let currentTheme = 'light';
    let adaptiveThemeUnsubscribe = null;
    let batteryThreshold = 0.20; // Default: 20% battery trigger

    const applyThemeVariables = (name) => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        
        // Remove old theme classes
        const themes = ['light', 'dark', 'dim', 'oled', 'high-contrast'];
        themes.forEach(t => root.classList.remove(`papyr-theme-${t}`));
        root.classList.add(`papyr-theme-${name}`);

        // Set variables base
        const palette = {
            light: { bg: '#ffffff', text: '#0f172a', primary: '#6366f1', border: '#e2e8f0' },
            dark: { bg: '#0f172a', text: '#f8fafc', primary: '#818cf8', border: '#334155' },
            dim: { bg: '#1e293b', text: '#cbd5e1', primary: '#6366f1', border: '#475569' },
            oled: { bg: '#000000', text: '#f8fafc', primary: '#818cf8', border: '#1e293b' },
            'high-contrast': { bg: '#000000', text: '#ffffff', primary: '#ffff00', border: '#ffffff' }
        }[name] || palette.light;

        Object.entries(palette).forEach(([k, v]) => {
            root.style.setProperty(`--papyr-${k}-color`, v);
            root.style.setProperty(`--${k}`, v);
        });
    };

    papyr.theme = (config, options = {}) => {
        if (typeof document === 'undefined') return papyr;

        // Clean up active adaptive watchers
        if (adaptiveThemeUnsubscribe) {
            adaptiveThemeUnsubscribe();
            adaptiveThemeUnsubscribe = null;
        }

        // True Tone warmth overlay cleanup
        const overlay = document.getElementById('papyr-true-tone-overlay');
        if (overlay) overlay.remove();

        if (typeof config === 'string') {
            const nameLower = config.toLowerCase();
            
            // True Tone Warmth Theme (sepia & brightness warm filter)
            if (nameLower === 'true-tone') {
                const warmthOverlay = document.createElement('div');
                warmthOverlay.id = 'papyr-true-tone-overlay';
                warmthOverlay.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    pointer-events: none; z-index: 999999;
                    background: rgba(253, 186, 116, 0.05); /* warm light orange tint */
                    backdrop-filter: sepia(0.06) brightness(0.97);
                    -webkit-backdrop-filter: sepia(0.06) brightness(0.97);
                `;
                document.body.appendChild(warmthOverlay);
                console.log("🌞 Theme: True Tone Warmth Filter applied.");
                return papyr;
            }

            // Adaptive Theme: System scheme, ambient light, and battery options
            if (nameLower === 'adaptive') {
                if (options.batteryThreshold !== undefined) {
                    batteryThreshold = options.batteryThreshold;
                }
                
                const syncAdaptiveTheme = () => {
                    let target = 'light';
                    
                    // a. System color preferences (media query prefers-color-scheme)
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) target = 'dark';
                    
                    // b. Battery Awareness (OLED mode if battery level drops below threshold and not charging)
                    if (papyr.power && papyr.power.battery) {
                        const isCharging = papyr.power.battery.charging.value;
                        const batteryLevel = papyr.power.battery.level.value;
                        
                        if (!isCharging && batteryLevel < batteryThreshold) {
                            console.log(`🔋 Low Battery Alert (${Math.round(batteryLevel * 100)}%): Switching adaptive theme to OLED.`);
                            target = 'oled';
                        }
                    }
                    
                    applyThemeVariables(target);
                };

                // Subscribe to battery changes
                let unsubBatteryCharging = () => {};
                let unsubBatteryLevel = () => {};
                if (papyr.power && papyr.power.battery) {
                    unsubBatteryCharging = papyr.power.battery.charging.subscribe(syncAdaptiveTheme);
                    unsubBatteryLevel = papyr.power.battery.level.subscribe(syncAdaptiveTheme);
                }

                // Listen to media query changes
                const systemMatcher = window.matchMedia('(prefers-color-scheme: dark)');
                systemMatcher.addEventListener('change', syncAdaptiveTheme);

                syncAdaptiveTheme();

                adaptiveThemeUnsubscribe = () => {
                    unsubBatteryCharging();
                    unsubBatteryLevel();
                    systemMatcher.removeEventListener('change', syncAdaptiveTheme);
                };
                
                console.log(`🤖 Theme: Adaptive Theme Engine enabled (Battery Threshold: ${Math.round(batteryThreshold * 100)}%).`);
                return papyr;
            }

            // Standard Themes
            applyThemeVariables(nameLower);
            currentTheme = nameLower;

        } else if (typeof config === 'object') {
            // Apply custom CSS custom variables overrides
            Object.entries(config).forEach(([key, val]) => {
                document.documentElement.style.setProperty(`--papyr-${key}`, val);
                document.documentElement.style.setProperty(`--${key}`, val);
            });
        }
        return papyr;
    };
});
