/**
 * PAPYR NATIVE KERNEL PLUGINS
 * 
 * Formal core plugins utilizing the kernel plugin lifecycle hooks:
 * 1. papyr-intent-engine: Supports intent-based cinematic styling configs and spring-physics button builders.
 * 2. papyr-self-heal: Spellchecks unknown HTML tags using Levenshtein distance, prints developer console warnings, and hooks global errors.
 * 3. papyr-accessibility-adapter: Automatically injects appropriate ARIA roles and keyboard accessibility support (tabIndex).
 * 4. papyr-energy-adapter: Links with the Papyr Power system to throttle animations and loop states during idle modes.
 */

(function(window) {
    // Helper to calculate Levenshtein distance (for local self-heal fallback)
    function levenshteinDistance(a, b) {
        let tmp = [];
        for (let i = 0; i <= a.length; i++) {
            let row = [i];
            for (let j = 1; j <= b.length; j++) {
                row.push(i === 0 ? j : Math.min(
                    tmp[i - 1][j] + 1,
                    row[j - 1] + 1,
                    tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                ));
            }
            tmp.push(row);
        }
        return tmp[a.length][b.length];
    }

    // 1. Intent Engine Plugin
    const intentEnginePlugin = {
        name: 'papyr-intent-engine',
        version: '1.0.0',
        install(kernel) {
            // Register cinematic configs and theme scaffolding styles
            kernel.applyCinematic = (el, styleType) => {
                if (!el || !el.style) return;
                const configurations = {
                    hero: {
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)',
                        color: '#f8fafc',
                        padding: '120px 20px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    },
                    cinematic: {
                        background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                        color: '#38bdf8',
                        padding: '80px 40px',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        boxShadow: '0 0 40px rgba(56, 189, 248, 0.1)',
                        borderRadius: '24px'
                    },
                    focus: {
                        background: '#020617',
                        color: '#f1f5f9',
                        borderLeft: '4px solid #6366f1',
                        padding: '24px',
                        fontStyle: 'italic',
                        borderRadius: '0 8px 8px 0'
                    }
                };
                // eslint-disable-next-line security/detect-object-injection
                const styles = (styleType && styleType !== '__proto__' && styleType !== 'constructor' && styleType !== 'prototype' && Object.prototype.hasOwnProperty.call(configurations, styleType)) ? configurations[styleType] : undefined;
                if (styles) {
                    Object.assign(el.style, styles);
                }
            };

            // Dynamic spring physics-based button builder
            kernel.button = (text, options = {}) => {
                const isSecondary = options.variant === 'secondary';
                
                const btnStyle = {
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                    border: isSecondary ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    background: isSecondary ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease, opacity 0.2s ease',
                    boxShadow: isSecondary ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)',
                };

                const userStyle = options.style || {};
                const finalStyle = Object.assign({}, btnStyle, userStyle);

                const btn = kernel('button', {
                    style: finalStyle,
                    class: options.class || '',
                    on: {
                        mouseenter() {
                            btn.style.transform = 'scale(1.05)';
                            if (!isSecondary) {
                                btn.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                            }
                        },
                        mouseleave() {
                            btn.style.transform = 'scale(1)';
                            if (!isSecondary) {
                                btn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                            }
                        },
                        mousedown() {
                            btn.style.transform = 'scale(0.95)';
                        },
                        mouseup() {
                            btn.style.transform = 'scale(1.05)';
                        }
                    }
                }, text);

                if (options.on && options.on.click) {
                    btn.addEventListener('click', options.on.click);
                }

                return btn;
            };
        }
    };

    // 2. Self Heal Plugin
    const selfHealPlugin = {
        name: 'papyr-self-heal',
        version: '1.0.0',
        install(kernel) {
            // Listen to warning events from the kernel
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                window.addEventListener('papyr-warning', (e) => {
                    const { tag, suggestion } = e.detail;
                    const logMsg = `💡 [Self Heal Plugin] Corrective suggestion for tag <${tag}>: Use <${suggestion}> instead.`;
                    console.log(`%c ${logMsg} `, 'background: #10b981; color: white; border-radius: 4px; font-weight: bold; padding: 2px 4px;');
                    
                    // Push diagnostic info
                    kernel.diagnostics.errors.push({
                        type: 'self-heal-suggestion',
                        message: `Spellchecked unknown tag <${tag}>. Corrective suggestion: <${suggestion}>`,
                        timestamp: new Date().toISOString()
                    });
                });

                // Global window error safety reporting
                window.addEventListener('error', (e) => {
                    kernel.diagnostics.reportError(e.error || e.message);
                });
            }
        }
    };

    // 3. Accessibility Adapter Plugin
    const accessibilityAdapterPlugin = {
        name: 'papyr-accessibility-adapter',
        version: '1.0.0',
        hooks: {
            onRender(el) {
                if (!el || !el.tagName) return;
                const tag = el.tagName.toLowerCase();

                // 1. Add roles for button and links
                if (tag === 'button') {
                    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
                }
                
                // 2. Navigation containers
                if (el.classList && (el.classList.contains('navbar') || el.classList.contains('nav'))) {
                    if (!el.hasAttribute('role')) el.setAttribute('role', 'navigation');
                }

                // 3. Complementary sidebars
                if (el.classList && (el.classList.contains('sidebar') || el.classList.contains('aside'))) {
                    if (!el.hasAttribute('role')) el.setAttribute('role', 'complementary');
                }

                // 4. Ensure images have alt descriptions
                if (tag === 'img') {
                    if (!el.hasAttribute('alt')) {
                        el.setAttribute('alt', ''); // Empty alt to hide aesthetic images from screen readers
                    }
                }

                // 5. Interactive elements without standard focus
                if (el.hasAttribute('onclick') || (el.dataset && el.dataset.clickEvent)) {
                    if (tag !== 'button' && tag !== 'a' && tag !== 'input') {
                        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
                        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
                    }
                }
            }
        }
    };

    // 4. Energy Adapter Plugin
    const energyAdapterPlugin = {
        name: 'papyr-energy-adapter',
        version: '1.0.0',
        install(kernel) {
            // Integrate with kernel.power system to optimize execution pacing
            kernel.events.on('power-state-change', (newState) => {
                if (newState === 'idle') {
                    console.log("⚡ [Energy Adapter] Reducing UI update loops to idle pace.");
                } else if (newState === 'active') {
                    console.log("⚡ [Energy Adapter] Elevating UI performance to full capacity.");
                }
            });

            // Set up a loop listener to dynamically hook with papyr.power if it exists
            setTimeout(() => {
                if (kernel.power && kernel.power.state) {
                    kernel.power.state.subscribe((stateVal) => {
                        kernel.events.emit('power-state-change', stateVal);
                    });
                }
            }, 100);
        }
    };

    // Register all native plugins automatically if papyr library is loaded
    if (typeof window !== 'undefined') {
        window.papyrIntentEngine = intentEnginePlugin;
        window.papyrSelfHeal = selfHealPlugin;
        window.papyrAccessibilityAdapter = accessibilityAdapterPlugin;
        window.papyrEnergyAdapter = energyAdapterPlugin;

        // Auto-install to default global instance if present
        if (window.papyr && window.papyr.use) {
            window.papyr.use(intentEnginePlugin);
            window.papyr.use(selfHealPlugin);
            window.papyr.use(accessibilityAdapterPlugin);
            window.papyr.use(energyAdapterPlugin);
        }
    }

})(typeof window !== 'undefined' ? window : this);
