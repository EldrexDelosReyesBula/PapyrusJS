/**
 * PAPYR POWER SYSTEM 2.0
 * Energy-Aware, Performance-First state management, adaptive rendering and task scheduling throttler.
 * Coordinates user interaction states, page visibility, battery status, device capabilities, and loop pacing.
 */
(function(window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading power plugins.");
        return;
    }

    const papyr = window.papyr;

    // 1. Estimate Device Capability
    const estimateDeviceCapability = () => {
        if (typeof navigator === 'undefined') return 'Mid Range';
        let cores = navigator.hardwareConcurrency || 4;
        let ram = navigator.deviceMemory || 4;
        if (cores <= 2 || ram <= 2) return 'Low End';
        if (cores >= 8 && ram >= 8) return 'High End';
        return 'Mid Range';
    };

    const deviceCapability = estimateDeviceCapability();

    // 2. Setup reactive power and system state variables
    const powerState = papyr.state('active');            // 'active', 'idle', 'away', 'suspended'
    const powerFps = papyr.state(deviceCapability === 'Low End' ? 30 : 60); // Reactive FPS diagnostic
    const targetFps = papyr.state(deviceCapability === 'Low End' ? 30 : 60); // Target rendering speed
    const isBackground = papyr.state(typeof document !== 'undefined' ? document.hidden : false);
    const adaptiveEffects = papyr.state(deviceCapability !== 'Low End'); // Enable/disable heavy CSS/parallax
    
    // Battery awareness states
    const batteryState = {
        level: papyr.state(1.0),
        charging: papyr.state(true)
    };

    let idleTimeout = null;
    let awayTimeout = null;
    const IDLE_DELAY_MS = 10000;              // 10 seconds to trigger idle throttling
    const AWAY_DELAY_MS = 60000;              // 60 seconds to trigger away state

    // 3. Activity monitor triggers
    const resetIdleTimer = () => {
        if (powerState.value === 'suspended') return; // Do not wake up if tab is backgrounded
        
        if (powerState.value !== 'active') {
            powerState.value = 'active';
            powerFps.value = targetFps.value;
            adaptiveEffects.value = deviceCapability !== 'Low End' && (!batteryState.charging.value || batteryState.level.value > 0.2);
        }

        if (idleTimeout) clearTimeout(idleTimeout);
        if (awayTimeout) clearTimeout(awayTimeout);

        idleTimeout = setTimeout(() => {
            if (powerState.value === 'active') {
                powerState.value = 'idle';
                powerFps.value = Math.min(targetFps.value, 15);
                // Reduce or disable heavy animations
                adaptiveEffects.value = false;
            }
        }, IDLE_DELAY_MS);

        awayTimeout = setTimeout(() => {
            if (powerState.value === 'idle' || powerState.value === 'active') {
                powerState.value = 'away';
                powerFps.value = Math.min(targetFps.value, 5);
                adaptiveEffects.value = false;
            }
        }, AWAY_DELAY_MS);
    };

    // 4. Battery Level Observer Setup
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
        navigator.getBattery().then(battery => {
            const updateBattery = () => {
                batteryState.level.value = battery.level;
                batteryState.charging.value = battery.charging;
                
                // Low battery mode
                if (!battery.charging && battery.level < 0.2) {
                    targetFps.value = 30;
                    powerFps.value = Math.min(powerFps.value, 30);
                    adaptiveEffects.value = false;
                } else {
                    targetFps.value = deviceCapability === 'Low End' ? 30 : 60;
                }
            };
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
            updateBattery();
        });
    }

    // 5. Mount global event listeners safely (with passive: true to prevent frame drops)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
        events.forEach(evt => {
            window.addEventListener(evt, resetIdleTimer, { passive: true });
        });

        // Background / Visibility change listeners
        document.addEventListener('visibilitychange', () => {
            isBackground.value = document.hidden;
            if (document.hidden) {
                powerState.value = 'suspended';
                powerFps.value = 0;
                adaptiveEffects.value = false;
                if (idleTimeout) clearTimeout(idleTimeout);
                if (awayTimeout) clearTimeout(awayTimeout);
            } else {
                resetIdleTimer();
            }
        });

        // Initialize first idle timer
        resetIdleTimer();
    }

    // 6. Power Engine API Exports
    papyr.power = {
        state: powerState,
        fps: powerFps,
        targetFps: targetFps,
        isBackground: isBackground,
        adaptiveEffects: adaptiveEffects,
        deviceCapability: deviceCapability,
        battery: batteryState,
        
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

                if (currentState === 'away') {
                    // Away state: Throttle to ~5 FPS (200ms pacing)
                    setTimeout(() => {
                        if (active && powerState.value === 'away') {
                            callback();
                            requestAnimationFrame(tick);
                        } else if (active) {
                            requestAnimationFrame(tick);
                        }
                    }, 200);
                    return;
                }

                if (currentState === 'idle') {
                    // Idle state: Throttle to ~15 FPS (66ms pacing)
                    setTimeout(() => {
                        if (active && powerState.value === 'idle') {
                            callback();
                            requestAnimationFrame(tick);
                        } else if (active) {
                            requestAnimationFrame(tick);
                        }
                    }, 66);
                    return;
                }

                // Active state: Target FPS standard pacing
                if (targetFps.value === 30) {
                    setTimeout(() => {
                        if (active && powerState.value === 'active') {
                            callback();
                            requestAnimationFrame(tick);
                        } else if (active) {
                            requestAnimationFrame(tick);
                        }
                    }, 33);
                } else {
                    callback();
                    requestAnimationFrame(tick);
                }
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
