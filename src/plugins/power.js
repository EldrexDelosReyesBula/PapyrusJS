/**
 * PAPYR POWER SYSTEM
 * Energy-Aware, Performance-First state management and rendering throttler.
 * Coordinates user interaction states, page visibility, and loop pacing natively.
 */
(function(window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading power plugins.");
        return;
    }

    const papyr = window.papyr;

    // 1. Setup reactive power states
    const powerState = papyr.state('active'); // 'active', 'idle', 'suspended'
    const powerFps = papyr.state(60);         // Reactive FPS diagnostic

    let idleTimeout = null;
    const IDLE_DELAY_MS = 10000;              // 10 seconds to trigger idle throttling

    // 2. Activity monitor triggers
    const resetIdleTimer = () => {
        if (powerState.value === 'suspended') return; // Do not wake up if tab is backgrounded
        
        if (powerState.value !== 'active') {
            powerState.value = 'active';
            powerFps.value = 60;
        }

        if (idleTimeout) clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            if (powerState.value === 'active') {
                powerState.value = 'idle';
                powerFps.value = 10;
            }
        }, IDLE_DELAY_MS);
    };

    // 3. Mount global event listeners safely (with passive: true to prevent frame drops)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
        events.forEach(evt => {
            window.addEventListener(evt, resetIdleTimer, { passive: true });
        });

        // Background / Visibility change listeners
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                powerState.value = 'suspended';
                powerFps.value = 0;
                if (idleTimeout) clearTimeout(idleTimeout);
            } else {
                resetIdleTimer();
            }
        });

        // Initialize first idle timer
        resetIdleTimer();
    }

    // 4. Power Engine API Exports
    papyr.power = {
        state: powerState,
        fps: powerFps,
        
        /**
         * Reset the idle timer manually (e.g. during custom script interactions)
         */
        activity() {
            resetIdleTimer();
        },

        /**
         * Wraps an animation loop or heavy computation function.
         * Automatically throttles pacing to conserve CPU, RAM, and battery.
         * 
         * @param {function} callback Rendering loop callback to execute
         * @returns {function} Cleanup hook to completely unsubscribe the loop
         */
        throttle(callback) {
            let active = true;
            
            const tick = () => {
                if (!active) return;

                const currentState = powerState.value;
                if (currentState === 'suspended') {
                    // Suspended completely. Return and wait for visibility change to re-trigger.
                    return;
                }

                if (currentState === 'idle') {
                    // Idle state: Throttle to ~10 FPS (100ms pacing)
                    setTimeout(() => {
                        if (active && powerState.value === 'idle') {
                            callback();
                            requestAnimationFrame(tick);
                        } else if (active) {
                            requestAnimationFrame(tick);
                        }
                    }, 100);
                    return;
                }

                // Active state: Full 60 FPS standard pacing
                callback();
                requestAnimationFrame(tick);
            };

            // Re-trigger loop if transitioning from suspended/idle to active
            const unsubscribe = powerState.subscribe((state) => {
                if (state === 'active' && active) {
                    requestAnimationFrame(tick);
                }
            });

            // Start loop execution
            requestAnimationFrame(tick);

            // Return unsubscribe cleanup hook
            return () => {
                active = false;
                unsubscribe();
            };
        }
    };
})(typeof window !== 'undefined' ? window : this);
