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

    const cleanupElement = (n) => {
        if (!n) return;
        if (n._cleanups) {
            n._cleanups.forEach(c => {
                if (typeof c === 'function') {
                    try { c(); } catch(e) { papyr.diagnostics.reportError(e); }
                }
            });
            n._cleanups = [];
        }
        if (n._onUnmounted) {
            n._isMounted = false;
            try { n._onUnmounted(n); } catch(e) { papyr.diagnostics.reportError(e); }
        }
        if (n._updateObserver) {
            try { n._updateObserver.disconnect(); } catch(e) {}
        }
        Array.from(n.children || []).forEach(cleanupElement);
    };

    papyr._cleanupElement = cleanupElement;

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
        let isDirty = true;
        
        let effect = () => {
            isDirty = true;
            Array.from(subscribers).forEach(sub => sub(computedObj.value));
        };
        effect._deps = new Set();
        effect._addDep = (stateObj) => {
            effect._deps.add(stateObj);
        };
        
        let computedObj = {
            _subscribers: subscribers,
            get value() {
                if (isDirty) {
                    // Clear old dependencies before re-evaluating
                    effect._deps.forEach(s => {
                        if (s._subscribers) s._subscribers.delete(effect);
                    });
                    effect._deps.clear();

                    effectStack.push(effect);
                    activeEffect = effect;
                    try {
                        currentVal = fn();
                        isDirty = false;
                    } catch (err) {
                        papyr.diagnostics.reportError(err);
                    } finally {
                        effectStack.pop();
                        activeEffect = effectStack[effectStack.length - 1] || null;
                    }
                }
                
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
                sub(computedObj.value);
                return () => {
                    subscribers.delete(sub);
                    if (subscribers.size === 0) {
                        // Cleanup dependencies to avoid memory leaks
                        effect._deps.forEach(s => {
                            if (s._subscribers) s._subscribers.delete(effect);
                        });
                        effect._deps.clear();
                        isDirty = true;
                    }
                };
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
            
            if (container.childNodes) {
                Array.from(container.childNodes).forEach(cleanupElement);
            }
            container.innerHTML = '';
            
            let target = truthy ? trueVal : falseVal;
            if (target) {
                currentEl = typeof target === 'function' ? target() : target;
                container.appendChild(currentEl);
            } else {
                currentEl = null;
            }
        };
        
        let unsubscribe;
        if (conditionState && typeof conditionState.subscribe === 'function') {
            unsubscribe = conditionState.subscribe(update);
        } else if (typeof conditionState === 'function') {
            let comp = papyr.computed(() => !!conditionState());
            unsubscribe = comp.subscribe(update);
        } else {
            update(!!conditionState);
        }
        if (unsubscribe) {
            if (!container._cleanups) container._cleanups = [];
            container._cleanups.push(unsubscribe);
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
            let keyCounts = new Map();
            
            arr.forEach((item, index) => {
                let baseKey = (item && typeof item === 'object' && item.id !== undefined) 
                    ? item.id 
                    : (item && typeof item === 'object') 
                        ? item 
                        : item;
                
                let occurrence = (keyCounts.get(baseKey) || 0) + 1;
                keyCounts.set(baseKey, occurrence);
                
                let key = occurrence === 1 ? baseKey : (typeof baseKey === 'object' ? ('dup::' + occurrence) : (baseKey + '::dup::' + occurrence));
                newKeys.add(key);
                
                let entry = nodeMap.get(key);
                let el;
                if (!entry || entry.item !== item) {
                    if (entry) {
                        cleanupElement(entry.el);
                    }
                    el = renderCallback(item, index);
                    if (el && el.nodeType === 11) { // DocumentFragment
                        if (typeof document !== 'undefined') {
                            let wrapper = document.createElement('span');
                            wrapper.style.display = 'contents';
                            wrapper.appendChild(el);
                            el = wrapper;
                        }
                    }
                    if (isElement(el)) {
                        nodeMap.set(key, { el, item });
                        if (entry && entry.el && entry.el.parentNode) {
                            entry.el.parentNode.replaceChild(el, entry.el);
                        }
                    }
                } else {
                    el = entry.el;
                }
                if (isElement(el)) {
                    newElements.push(el);
                }
            });
            
            // 2. Remove elements that are no longer in the array and trigger their cleanups
            nodeMap.forEach((entry, key) => {
                if (!newKeys.has(key)) {
                    cleanupElement(entry.el);
                    
                    if (entry.el.parentNode === container) {
                        if (typeof container.removeChild === 'function') {
                            container.removeChild(entry.el);
                        } else if (typeof entry.el.remove === 'function') {
                            entry.el.remove();
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
            const unsubscribe = arrayState.subscribe(update);
            if (!container._cleanups) container._cleanups = [];
            container._cleanups.push(unsubscribe);
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
            } else if (inputEl.type === 'number' || inputEl.type === 'range') {
                stateObj.value = parseFloat(e.target.value) || 0;
            } else {
                stateObj.value = e.target.value;
            }
        };
        
        const eventType = isCheckbox ? 'change' : 'input';
        inputEl.addEventListener(eventType, listener);
        
        // Store cleanup hook on element
        if (!inputEl._cleanups) inputEl._cleanups = [];
        inputEl._cleanups.push(() => {
            unsubscribe();
            inputEl.removeEventListener(eventType, listener);
        });
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
                } else if (e.target.type === 'number' || e.target.type === 'range') {
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

