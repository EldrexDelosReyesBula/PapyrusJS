/**
 * PAPYR SCHEDULER & PERFORMANCE ENGINE
 * Coordinates priority scheduling, energy-aware frame optimization, and UI freeze recovery.
 */

coreInitializers.push((papyr) => {
    // 1. Device capability estimator
    const estimateDeviceCapability = () => {
        if (typeof navigator === 'undefined') return 'Mid Range';
        const cores = navigator.hardwareConcurrency || 4;
        const ram = navigator.deviceMemory || 4;
        if (cores <= 2 || ram <= 2) return 'Low End';
        if (cores >= 8 && ram >= 8) return 'High End';
        return 'Mid Range';
    };

    const deviceCapability = estimateDeviceCapability();

    // 2. Priority Scheduling System
    const taskQueue = [];
    let isScheduled = false;

    papyr.scheduler = {
        schedule(fn, priority = 'normal') {
            taskQueue.push({ fn, priority });
            taskQueue.sort((a, b) => {
                const priorityMap = { 'immediate': 0, 'user-blocking': 1, 'normal': 2, 'idle': 3 };
                return priorityMap[a.priority] - priorityMap[b.priority];
            });
            this.requestFlush();
        },

        requestFlush() {
            if (isScheduled) return;
            isScheduled = true;
            
            const nextTask = taskQueue[0];
            if (nextTask && nextTask.priority === 'immediate') {
                if (typeof queueMicrotask === 'function') {
                    queueMicrotask(() => this.flush());
                } else {
                    Promise.resolve().then(() => this.flush());
                }
            } else if (nextTask && nextTask.priority === 'user-blocking') {
                if (typeof requestAnimationFrame === 'function') {
                    requestAnimationFrame(() => this.flush());
                } else {
                    setTimeout(() => this.flush(), 16);
                }
            } else if (nextTask && nextTask.priority === 'idle') {
                if (typeof requestIdleCallback === 'function') {
                    requestIdleCallback(() => this.flush());
                } else {
                    setTimeout(() => this.flush(), 50);
                }
            } else {
                // normal
                setTimeout(() => this.flush(), 0);
            }
        },

        flush() {
            isScheduled = false;
            const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
            while (taskQueue.length > 0) {
                const task = taskQueue[0];
                if (task.priority !== 'immediate' && task.priority !== 'user-blocking') {
                    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
                    if (now - startTime > 16) { // 16ms frame budget
                        this.requestFlush();
                        break;
                    }
                }
                taskQueue.shift();
                try {
                    task.fn();
                } catch (err) {
                    if (papyr.diagnostics) papyr.diagnostics.reportError(err);
                }
            }
        }
    };

    // 3. Power Engine & Background Activity Manager
    const powerState = papyr.state('active'); // 'active', 'idle', 'away', 'suspended'
    const targetFps = papyr.state(deviceCapability === 'Low End' ? 30 : 60);
    const powerFps = papyr.state(deviceCapability === 'Low End' ? 30 : 60);
    const isBackground = papyr.state(typeof document !== 'undefined' ? document.hidden : false);
    const adaptiveEffects = papyr.state(deviceCapability !== 'Low End');

    const batteryState = {
        level: papyr.state(1.0),
        charging: papyr.state(true)
    };

    papyr.power = {
        state: powerState,
        fps: powerFps,
        targetFps: targetFps,
        isBackground: isBackground,
        adaptiveEffects: adaptiveEffects,
        deviceCapability: deviceCapability,
        battery: batteryState,
        activity() {
            resetIdleTimer();
        },
        throttle(callback) {
            let active = true;
            
            const tick = () => {
                if (!active) return;
                const state = powerState.value;
                if (state === 'suspended') return;

                let delay = 0;
                if (state === 'away') delay = 200; // ~5 FPS
                else if (state === 'idle') delay = 66; // ~15 FPS
                else if (targetFps.value === 30) delay = 33; // ~30 FPS

                if (delay > 0) {
                    setTimeout(() => {
                        if (active && powerState.value === state) {
                            callback();
                            if (typeof requestAnimationFrame === 'function') {
                                requestAnimationFrame(tick);
                            } else {
                                setTimeout(tick, 16);
                            }
                        } else if (active) {
                            if (typeof requestAnimationFrame === 'function') {
                                requestAnimationFrame(tick);
                            } else {
                                setTimeout(tick, 16);
                            }
                        }
                    }, delay);
                } else {
                    callback();
                    if (typeof requestAnimationFrame === 'function') {
                        requestAnimationFrame(tick);
                    } else {
                        setTimeout(tick, 16);
                    }
                }
            };

            const unsubscribe = powerState.subscribe((state) => {
                if (state === 'active' && active) {
                    if (typeof requestAnimationFrame === 'function') {
                        requestAnimationFrame(tick);
                    } else {
                        setTimeout(tick, 16);
                    }
                }
            });

            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(tick);
            } else {
                setTimeout(tick, 16);
            }

            return () => {
                active = false;
                unsubscribe();
            };
        }
    };

    // Idle management timers
    let idleTimeout = null;
    let awayTimeout = null;
    const IDLE_DELAY_MS = 10000;
    const AWAY_DELAY_MS = 60000;

    const resetIdleTimer = () => {
        if (powerState.value === 'suspended') return;
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

    // Battery API hookup
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
        navigator.getBattery().then(battery => {
            const updateBattery = () => {
                batteryState.level.value = battery.level;
                batteryState.charging.value = battery.charging;
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

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
        events.forEach(evt => {
            window.addEventListener(evt, resetIdleTimer, { passive: true });
        });

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

        resetIdleTimer();

        adaptiveEffects.subscribe((enabled) => {
            if (document.documentElement && document.documentElement.classList) {
                document.documentElement.classList.toggle('papyr-low-end', !enabled);
            }
        });
    }

    // 4. UI Freeze Recovery System
    let recoveryEnabled = false;
    papyr.recovery = {
        enable(options = {}) {
            if (recoveryEnabled) return;
            recoveryEnabled = true;
            const threshold = options.threshold || 500; // ms threshold to trigger recovery

            // Heartbeat Frame Monitor
            let lastTick = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const monitor = () => {
                if (!recoveryEnabled) return;
                const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
                const diff = now - lastTick;
                if (diff > threshold) {
                    console.warn(`[Papyr Recovery] UI Thread frozen for ${diff.toFixed(1)}ms. Recovering component views.`);
                    this.recoverAll();
                }
                lastTick = now;
                if (typeof requestAnimationFrame === 'function') {
                    requestAnimationFrame(monitor);
                } else {
                    setTimeout(monitor, 16);
                }
            };
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(monitor);
            } else {
                setTimeout(monitor, 16);
            }

            // Native Long Tasks Observer
            if (typeof PerformanceObserver !== 'undefined') {
                try {
                    const observer = new PerformanceObserver((list) => {
                        list.getEntries().forEach((entry) => {
                            if (entry.duration > threshold) {
                                console.warn(`[Papyr Recovery] Long Task Detected: ${entry.duration.toFixed(1)}ms. Activating recovery.`);
                                this.recoverAll();
                            }
                        });
                    });
                    observer.observe({ entryTypes: ['longtask'] });
                } catch (e) {}
            }
        },

        disable() {
            recoveryEnabled = false;
        },

        recover(el) {
            if (el && el._renderFn && el.parentNode) {
                const parent = el.parentNode;
                try {
                    const newEl = el._renderFn(el._props);
                    newEl._renderFn = el._renderFn;
                    newEl._props = el._props;
                    
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(el);
                    }
                    parent.replaceChild(newEl, el);
                    console.log(`[Papyr Recovery] Recovered frozen component <${el.tagName.toLowerCase()}>.`);
                } catch (err) {
                    console.error("[Papyr Recovery] Recovery failed:", err);
                }
            }
        },

        recoverAll() {
            if (papyr.components && papyr.components.registered) {
                papyr.components.registered.forEach(el => {
                    if (el._renderFn && document.body && document.body.contains(el)) {
                        this.recover(el);
                    }
                });
            }
        }
    };
});
