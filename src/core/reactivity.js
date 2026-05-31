/**
 * PAPYR REACTIVITY SYSTEM
 * 
 * Auto-tracking reactive state variables and computed logic nodes.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    
    /**
     * Creates an auto-tracking reactive state variable.
     * 
     * @param {*} val Initial reactive state value
     * @returns {PaperState} Reactive State accessor interface
     */
    // Bulletproof Element detection helper inside reactivity context
    const isElement = (x) => {
        if (!x || typeof x !== 'object') return false;
        return (typeof Element !== 'undefined' && x instanceof Element) || 
               (typeof DocumentFragment !== 'undefined' && x instanceof DocumentFragment) || 
               (typeof x.tagName === 'string' && typeof x.appendChild === 'function') ||
               (x.nodeType === 1 || x.nodeType === 11);
    };

    // Deep Proxy wrapper supporting array mutations and deep object updates
    const reactiveProxy = (obj, onNotify) => {
        if (obj === null || typeof obj !== 'object' || isElement(obj)) {
            return obj;
        }
        
        return new Proxy(obj, {
            get(target, prop, receiver) {
                const val = Reflect.get(target, prop, receiver);
                // Intercept mutating array operations
                if (Array.isArray(target) && typeof val === 'function' && ['push', 'pop', 'splice', 'shift', 'unshift', 'sort', 'reverse'].includes(prop)) {
                    return function(...args) {
                        const res = val.apply(target, args);
                        onNotify();
                        return res;
                    };
                }
                // Recursively wrap objects/arrays to support deep tracking
                if (val !== null && typeof val === 'object' && !isElement(val)) {
                    return reactiveProxy(val, onNotify);
                }
                return val;
            },
            set(target, prop, value, receiver) {
                const oldVal = target[prop];
                const res = Reflect.set(target, prop, value, receiver);
                if (oldVal !== value) {
                    onNotify();
                }
                return res;
            }
        });
    };

    papyr.state = (val) => {
        let subscribers = new Set();
        
        let notify = () => {
            papyr.diagnostics.trackUpdate(stateObj, val, val);
            Array.from(subscribers).forEach(sub => sub(val));
            papyr.plugins.triggerHook('onUpdate', stateObj);
        };

        let stateObj = {
            _subscribers: subscribers,
            get value() {
                if (activeEffect) {
                    subscribers.add(activeEffect);
                    if (typeof activeEffect._addDep === 'function') {
                        activeEffect._addDep(stateObj);
                    }
                }
                return reactiveProxy(val, notify);
            },
            set value(newVal) {
                if (val === newVal && (typeof newVal !== 'object' || newVal === null)) return;
                let oldVal = val;
                val = newVal;
                papyr.diagnostics.trackUpdate(stateObj, newVal, oldVal);
                Array.from(subscribers).forEach(sub => sub(newVal));
                
                // Trigger hooks
                papyr.plugins.triggerHook('onUpdate', stateObj);
            },
            subscribe(sub) {
                subscribers.add(sub);
                sub(val);
                return () => subscribers.delete(sub);
            },
            dump() {
                return val;
            }
        };
        papyr.state.register(stateObj);
        return stateObj;
    };

    // Initialize state registries on the state function itself for this kernel instance
    papyr.state.states = new Set();
    papyr.state.register = (s) => papyr.state.states.add(s);
    papyr.state.list = () => Array.from(papyr.state.states);
    papyr.state.dump = () => {
        let res = {};
        let idx = 0;
        papyr.state.states.forEach(s => {
            res[`state_${idx++}`] = s.value;
        });
        return res;
    };

    /**
     * Generates an auto-updating computed reactive variable.
     */
    const effectStack = [];
    papyr.computed = (fn) => {
        let subscribers = new Set();
        let currentVal;
        
        let effect = () => {
            // Clear old dependencies before re-evaluating
            effect._deps.forEach(s => {
                if (s._subscribers) s._subscribers.delete(effect);
            });
            effect._deps.clear();

            effectStack.push(effect);
            activeEffect = effect;
            try {
                currentVal = fn();
            } catch (err) {
                papyr.diagnostics.reportError(err);
            } finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1] || null;
            }
            Array.from(subscribers).forEach(sub => sub(currentVal));
        };
        effect._deps = new Set();
        effect._addDep = (stateObj) => {
            effect._deps.add(stateObj);
        };
        
        effectStack.push(effect);
        activeEffect = effect;
        try {
            currentVal = fn();
        } catch (err) {
            papyr.diagnostics.reportError(err);
        } finally {
            effectStack.pop();
            activeEffect = effectStack[effectStack.length - 1] || null;
        }
        
        let computedObj = {
            _subscribers: subscribers,
            get value() {
                if (activeEffect) {
                    subscribers.add(activeEffect);
                    if (typeof activeEffect._addDep === 'function') {
                        activeEffect._addDep(computedObj);
                    }
                }
                return currentVal;
            },
            subscribe(sub) {
                subscribers.add(sub);
                sub(currentVal);
                return () => subscribers.delete(sub);
            }
        };
        return computedObj;
    };

    /**
     * Creates a fine-grained reactive effect.
     */
    papyr.effect = (fn) => {
        let effect = () => {
            // Clean up previous run's subscriptions to keep tracking fresh
            effect._deps.forEach(s => {
                if (s._subscribers) s._subscribers.delete(effect);
            });
            effect._deps.clear();

            effectStack.push(effect);
            activeEffect = effect;
            try {
                fn();
            } catch (err) {
                papyr.diagnostics.reportError(err);
            } finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1] || null;
            }
        };
        effect._deps = new Set();
        effect._addDep = (stateObj) => {
            effect._deps.add(stateObj);
        };

        effect();

        // Return unsubscribe cleanup function
        return () => {
            effect._deps.forEach(s => {
                if (s._subscribers) s._subscribers.delete(effect);
            });
            effect._deps.clear();
        };
    };

    /**
     * Switches visual DOM subtrees reactively based on condition updates.
     * 
     * @param {PaperState} conditionState Reactive condition state to track
     * @param {HTMLElement|function} trueVal Rendered target when state is truthy
     * @param {HTMLElement|function} [falseVal] Optional target when state is falsy
     * @returns {HTMLDivElement} Content container fragment
     */
    papyr.if = (conditionState, trueVal, falseVal) => {
        let container = papyr.div({ style: { display: 'contents' } });
        let currentEl = null;
        let prevVal = undefined;
        
        let update = (val) => {
            let truthy = !!val;
            if (truthy === prevVal) return;
            prevVal = truthy;
            
            if (currentEl) currentEl.remove();
            let target = truthy ? trueVal : falseVal;
            if (target) {
                currentEl = typeof target === 'function' ? target() : target;
                container.appendChild(currentEl);
            } else {
                currentEl = null;
            }
        };
        
        if (conditionState && typeof conditionState.subscribe === 'function') {
            conditionState.subscribe(update);
        } else if (typeof conditionState === 'function') {
            let comp = papyr.computed(() => !!conditionState());
            comp.subscribe(update);
        } else {
            update(!!conditionState);
        }
        return container;
    };

    /**
     * Reactively renders a list of DOM elements from an array state.
     * 
     * @param {PaperState} arrayState Reactive state containing an array
     * @param {function} renderCallback Function returning an HTMLElement for each item
     * @returns {HTMLDivElement} Content container fragment
     */
    papyr.for = (arrayState, renderCallback) => {
        let container = papyr.div({ style: { display: 'contents' } });
        let nodeMap = new Map();
        
        let update = (arr) => {
            if (!Array.isArray(arr)) {
                container.innerHTML = '';
                nodeMap.clear();
                return;
            }
            
            // 1. Identify all keys and get/create their elements
            let newKeys = new Set();
            let newElements = [];
            
            arr.forEach((item, index) => {
                let key = (item && typeof item === 'object') ? (item.id !== undefined ? item.id : item) : item;
                newKeys.add(key);
                
                let el = nodeMap.get(key);
                if (!el) {
                    el = renderCallback(item, index);
                    if (isElement(el)) {
                        nodeMap.set(key, el);
                    }
                }
                if (isElement(el)) {
                    newElements.push(el);
                }
            });
            
            // 2. Remove elements that are no longer in the array and trigger their cleanups
            nodeMap.forEach((el, key) => {
                if (!newKeys.has(key)) {
                    const runCleanups = (n) => {
                        if (n._cleanups) {
                            n._cleanups.forEach(c => {
                                if (typeof c === 'function') {
                                    try { c(); } catch(e) { papyr.diagnostics.reportError(e); }
                                }
                            });
                            n._cleanups = [];
                        }
                        if (n._onUnmounted) {
                            try { n._onUnmounted(n); } catch(e) { papyr.diagnostics.reportError(e); }
                        }
                        Array.from(n.children || []).forEach(runCleanups);
                    };
                    runCleanups(el);
                    
                    if (el.parentNode === container) {
                        if (typeof container.removeChild === 'function') {
                            container.removeChild(el);
                        } else if (typeof el.remove === 'function') {
                            el.remove();
                        }
                    }
                    nodeMap.delete(key);
                }
            });
            
            // 3. Re-order / append elements in the container in-place
            newElements.forEach((el, index) => {
                let existingChild = container.children ? container.children[index] : null;
                if (existingChild !== el) {
                    if (existingChild) {
                        container.insertBefore(el, existingChild);
                    } else {
                        container.appendChild(el);
                    }
                }
            });
        };
        
        if (arrayState && typeof arrayState.subscribe === 'function') {
            arrayState.subscribe(update);
        } else {
            update(arrayState);
        }
        return container;
    };

    // ----------------------------------------------------
    // PAPYR SIGNAL SYSTEM & WATCHER ENGINE
    // ----------------------------------------------------

    // Signal is an elegant alias to State for modern dependency-tracking architectures
    papyr.signal = papyr.state;

    /**
     * Watches a reactive source (state/computed) or a getter function.
     * Triggers the callback immediately with the initial value and on subsequent updates.
     * Returns an unsubscribe cleanup function.
     */
    papyr.watch = (target, cb) => {
        if (target && typeof target.subscribe === 'function') {
            let isFirst = true;
            let prevVal;
            return target.subscribe(val => {
                let oldVal = prevVal;
                prevVal = val;
                if (isFirst) {
                    isFirst = false;
                    cb(val, undefined);
                } else {
                    cb(val, oldVal);
                }
            });
        } else if (typeof target === 'function') {
            let comp = papyr.computed(target);
            let isFirst = true;
            let prevVal;
            return comp.subscribe(val => {
                let oldVal = prevVal;
                prevVal = val;
                if (isFirst) {
                    isFirst = false;
                    cb(val, undefined);
                } else {
                    cb(val, oldVal);
                }
            });
        }
    };

    // ----------------------------------------------------
    // TWO-WAY DATA BINDINGS (BIND & MODEL)
    // ----------------------------------------------------

    /**
     * Binds an existing DOM input element reactively to a state variable.
     */
    papyr.bind = (inputEl, stateObj) => {
        if (!inputEl) return;
        const isCheckbox = inputEl.type === 'checkbox';
        
        // State -> DOM
        const unsubscribe = stateObj.subscribe(val => {
            if (isCheckbox) {
                inputEl.checked = !!val;
            } else {
                inputEl.value = val !== null && val !== undefined ? val : '';
            }
        });
        
        // DOM -> State
        const listener = (e) => {
            if (isCheckbox) {
                stateObj.value = e.target.checked;
            } else if (inputEl.type === 'number') {
                stateObj.value = parseFloat(e.target.value) || 0;
            } else {
                stateObj.value = e.target.value;
            }
        };
        
        const eventType = isCheckbox ? 'change' : 'input';
        inputEl.addEventListener(eventType, listener);
        
        // Store cleanup hook on element
        const oldCleanup = inputEl._bindCleanup;
        inputEl._bindCleanup = () => {
            if (oldCleanup) oldCleanup();
            unsubscribe();
            inputEl.removeEventListener(eventType, listener);
        };
    };

    /**
     * Returns a mixin attribute configuration object for element creation.
     */
    papyr.model = (stateObj) => {
        return {
            value: () => stateObj.value,
            oninput: (e) => {
                if (e.target.type === 'checkbox') {
                    stateObj.value = e.target.checked;
                } else if (e.target.type === 'number') {
                    stateObj.value = parseFloat(e.target.value) || 0;
                } else {
                    stateObj.value = e.target.value;
                }
            }
        };
    };

    // Alias plugin registration to standard .use registry
    papyr.plugin = (p) => papyr.use(p);
});

