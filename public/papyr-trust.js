/**
 * PAPYR TRUST — Trust Boundaries Audit Utility
 * v3.1.3 - Zone-based trust model, runtime audit, third-party disclosure, access tiers
 * Released under MIT License.
 * Lightweight: no rendering engine. For CI/CD trust audits and runtime transparency.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

// --- MODULE: core/papyr-core.js ---
/**
 * PAPYR CORE DOM ENGINE
 * 
 * Compiles standard JS parameter lists, selectors, and states to native, styled HTML elements.
 * Transitioned to a Modular Intelligent Web Runtime Kernel architecture.
 */

const tagList = ['html','head','body','title','div','span','p','h1','h2','h3','h4','h5','h6','button','a','img',
                  'input','textarea','select','option','optgroup','ul','ol','li','dl','dt','dd',
                  'table','thead','tbody','tfoot','tr','td','th','caption','colgroup','col',
                  'form','label','fieldset','legend','datalist','output',
                  'section','article','header','footer','nav','aside','main',
                  'pre','code','hr','br','strong','em','small','mark','sub','sup','i','b','u','s',
                  'tt','cite','address','blockquote',
                  'audio','video','source','track','picture','embed','iframe','canvas','svg',
                  'details','summary','dialog','menu','menuitem','template','slot'];

let docFallback = null;
if (typeof document === 'undefined') {
    docFallback = {
        documentElement: {
            style: {
                setProperty() {}
            },
            setAttribute() {}
        },
        body: {
            appendChild() {},
            setAttribute() {}
        },
        head: {
            appendChild() {}
        },
        createElement(tag) {
            return {
                tagName: tag.toUpperCase(),
                attributes: {},
                style: {
                    setProperty(k, v) {
                        if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
                            Reflect.set(this, k, v);
                        }
                    }
                },
                classList: {
                    _classes: [],
                    add(c) { if (!this._classes.includes(c)) this._classes.push(c); },
                    remove(c) { this._classes = this._classes.filter(item => item !== c); },
                    contains(c) { return this._classes.includes(c); }
                },
                childNodes: [],
                appendChild(c) { 
                    this.childNodes.push(c); 
                    if (c && typeof c === 'object') c.parentNode = this;
                },
                insertBefore(n, ref) {
                    const idx = this.childNodes.indexOf(ref);
                    if (idx !== -1) this.childNodes.splice(idx, 0, n);
                    else this.childNodes.push(n);
                    if (n && typeof n === 'object') n.parentNode = this;
                },
                removeChild(n) {
                    this.childNodes = this.childNodes.filter(c => c !== n);
                },
                setAttribute(k, v) {
                    if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
                        Reflect.set(this.attributes, k, v);
                    }
                },
                getAttribute(k) {
                    if (k === '__proto__' || k === 'constructor' || k === 'prototype') return undefined;
                    return Reflect.get(this.attributes, k);
                },
                removeAttribute(k) {
                    if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
                        Reflect.deleteProperty(this.attributes, k);
                    }
                },
                hasAttribute(k) {
                    if (k === '__proto__' || k === 'constructor' || k === 'prototype') return false;
                    return Reflect.has(this.attributes, k);
                },
                addEventListener() {},
                removeEventListener() {},
                get innerHTML() {
                    const attrs = Object.entries(this.attributes).map(([k, v]) => `${k}="${v}"`).join(' ');
                    const styles = Object.entries(this.style).filter(([k]) => typeof Reflect.get(this.style, k) !== 'function').map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v}`).join('; ');
                    const classStr = this.classList._classes.length > 0 ? `class="${this.classList._classes.join(' ')}"` : '';
                    const allAttrs = [classStr, attrs, styles ? `style="${styles}"` : ''].filter(Boolean).join(' ');
                    const inner = this.childNodes.map(c => typeof c === 'string' ? c : (c.innerHTML || c.text || '')).join('');
                    return `<${this.tagName.toLowerCase()}${allAttrs ? ' ' + allAttrs : ''}>${inner}</${this.tagName.toLowerCase()}>`;
                }
            };
        },
        createTextNode(text) {
            return {
                nodeType: 3,
                text,
                get innerHTML() { return text; }
            };
        },
        createDocumentFragment() {
            return {
                nodeType: 11,
                childNodes: [],
                appendChild(c) { this.childNodes.push(c); },
                get innerHTML() { return this.childNodes.map(c => typeof c === 'string' ? c : (c.innerHTML || c.text || '')).join(''); }
            };
        },
        querySelector() { return null; },
        getElementById() { return null; }
    };
}

/**
 * Parses standard JS class arrays and objects into a space-separated string.
 * @private
 */
function parseClass(val) {
    if (Array.isArray(val)) return val.filter(Boolean).join(' ');
    if (typeof val === 'object' && val !== null) {
        return Object.keys(val).filter(k => Reflect.get(val, k)).join(' ');
    }
    return String(val);
}

/**
 * Bulletproof check to verify if a value is a DOM Element or DocumentFragment.
 * Supports standard browser elements and test mock elements.
 * @private
 */
const isElement = (x) => {
    if (!x || typeof x !== 'object') return false;
    return (typeof Element !== 'undefined' && x instanceof Element) || 
           (typeof DocumentFragment !== 'undefined' && x instanceof DocumentFragment) || 
           (typeof x.tagName === 'string' && typeof x.appendChild === 'function') ||
           (x.nodeType === 1 || x.nodeType === 11);
};

// --- PAPYR UTILITY STYLING SYSTEM ---
const papyrUtilities = {
    'flex': { display: 'flex' },
    'block': { display: 'block' },
    'inline': { display: 'inline' },
    'inline-flex': { display: 'inline-flex' },
    'grid': { display: 'grid' },
    'hidden': { display: 'none' },
    'center': { justifyContent: 'center', alignItems: 'center' },
    'items-center': { alignItems: 'center' },
    'justify-between': { justifyContent: 'space-between' },
    'flex-col': { flexDirection: 'column' },
    'flex-row': { flexDirection: 'row' },
    'flex-wrap': { flexWrap: 'wrap' },
    'rounded-sm': { borderRadius: '2px' },
    'rounded': { borderRadius: '4px' },
    'rounded-md': { borderRadius: '6px' },
    'rounded-lg': { borderRadius: '8px' },
    'rounded-xl': { borderRadius: '12px' },
    'rounded-2xl': { borderRadius: '16px' },
    'rounded-full': { borderRadius: '9999px' },
    'shadow-sm': { boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    'shadow': { boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
    'shadow-md': { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
    'shadow-lg': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    'shadow-xl': { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
    'w-full': { width: '100%' },
    'h-full': { height: '100%' },
};

let dynamicSheet = null;
const getDynamicSheet = () => {
    if (dynamicSheet) return dynamicSheet;
    if (typeof document === 'undefined') return null;
    let style = null;
    if (typeof document.querySelector === 'function') {
        style = document.querySelector('#papyr-dynamic-utilities');
    }
    if (!style) {
        if (typeof document.createElement === 'function') {
            style = document.createElement('style');
            style.id = 'papyr-dynamic-utilities';
            if (document.head && typeof document.head.appendChild === 'function') {
                document.head.appendChild(style);
            }
        }
    }
    dynamicSheet = style ? (style.sheet || style) : null;
    return dynamicSheet;
};

const addedRules = new Set();
const injectRule = (mediaQuery, ruleBody) => {
    let sheet = getDynamicSheet();
    if (!sheet) return;
    let fullRule = `${mediaQuery} { ${ruleBody} }`;
    if (addedRules.has(fullRule)) return;
    addedRules.add(fullRule);
    if (sheet.insertRule) {
        try {
            sheet.insertRule(fullRule, sheet.cssRules.length);
        } catch (e) {
            sheet.textContent += '\n' + fullRule;
        }
    } else {
        sheet.textContent += '\n' + fullRule;
    }
};

const parsePapyrUtilities = (el, utilities) => {
    if (!utilities) return;
    let list = Array.isArray(utilities) ? utilities : String(utilities).split(/\s+/);
    
    list.forEach(item => {
        let trimmedItem = item.trim();
        if (!trimmedItem) return;
        
        // Check if it's responsive (e.g. md:flex)
        if (trimmedItem.includes(':')) {
            let parts = trimmedItem.split(':');
            if (parts.length === 2) {
                let bp = parts[0];
                let ut = parts[1];
                
                let bpWidth = {
                    'sm': '640px',
                    'md': '768px',
                    'lg': '1024px',
                    'xl': '1280px'
                }[bp];
                
                let utilitySet = papyrUtilities[ut] ? papyrUtilities : (typeof paperUtilities !== 'undefined' ? paperUtilities : {});
                
                if (bpWidth && utilitySet[ut]) {
                    let uniqueClass = el._papyrUniqueClass;
                    if (!uniqueClass) {
                        uniqueClass = `papyr-u-${Math.random().toString(36).substring(2, 8)}`;
                        el.classList.add(uniqueClass);
                        el._papyrUniqueClass = uniqueClass;
                    }
                    
                    let styleText = Object.entries(Reflect.get(utilitySet, ut))
                        .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v};`)
                        .join(' ');
                    
                    let query = `@media (min-width: ${bpWidth})`;
                    injectRule(query, `.${uniqueClass} { ${styleText} }`);
                }
            }
        } else {
            // Standard utility class
            let utilitySet = Reflect.get(papyrUtilities, trimmedItem) ? papyrUtilities : (typeof paperUtilities !== 'undefined' ? paperUtilities : {});
            let targetUtility = Reflect.get(utilitySet, trimmedItem);
            if (targetUtility) {
                Object.entries(targetUtility).forEach(([k, v]) => {
                    if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
                        Reflect.set(el.style, k, v);
                    }
                });
            } else {
                el.classList.add(trimmedItem);
            }
        }
    });
};

/**
 * Compute Levenshtein distance between two tags for developer spellcheck hints.
 * @private
 */
const levenshteinCache = new Map();
function levenshtein(a, b) {
    const key = a < b ? a + ',' + b : b + ',' + a;
    if (levenshteinCache.has(key)) return levenshteinCache.get(key);

    const m = a.length;
    const n = b.length;
    let prev = new Int32Array(n + 1);
    let curr = new Int32Array(n + 1);

    for (let j = 0; j <= n; j++) {
        prev[j] = j;
    }

    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            curr[j] = Math.min(
                prev[j] + 1,
                curr[j - 1] + 1,
                prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
        let temp = prev;
        prev = curr;
        curr = temp;
    }
    const result = prev[n];
    levenshteinCache.set(key, result);
    return result;
}

const coreInitializers = [];

// 1. EventBus Subsystem
class EventBus {
    constructor(kernel) {
        this.kernel = kernel;
        this.listeners = new Map();
    }
    on(event, callback) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event).push(callback);
    }
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        this.listeners.set(event, this.listeners.get(event).filter(cb => cb !== callback));
    }
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => {
                try { cb(data); } catch(e) { this.kernel.diagnostics.reportError(e); }
            });
        }
    }
}

// 2. StateManager Subsystem
class StateManager {
    constructor(kernel) {
        this.kernel = kernel;
        this.states = new Set();
    }
    register(stateObj) {
        this.states.add(stateObj);
    }
    list() {
        return Array.from(this.states);
    }
    dump() {
        const result = {};
        let idx = 0;
        this.states.forEach(s => {
            Reflect.set(result, `state_${idx++}`, s.value);
        });
        return result;
    }
}

// 3. ComponentRegistry Subsystem
class ComponentRegistry {
    constructor(kernel) {
        this.kernel = kernel;
        this.registered = new Set();
    }
    register(el) {
        this.registered.add(el);
    }
    list() {
        return Array.from(this.registered).filter(el => {
            if (typeof document !== 'undefined') {
                if (typeof document.contains === 'function') {
                    return document.contains(el);
                }
                if (document.body && typeof document.body.contains === 'function') {
                    return document.body.contains(el);
                }
            }
            return true;
        }).map(el => {
            return {
                tag: el.tagName ? el.tagName.toLowerCase() : 'unknown',
                id: el.id || '',
                classes: el.className || ''
            };
        });
    }
}

// 4. PluginSystem Subsystem
class PluginSystem {
    constructor(kernel) {
        this.kernel = kernel;
        this.installed = new Map();
    }
    register(plugin) {
        if (!plugin || typeof plugin !== 'object') return;
        this.installed.set(plugin.name, plugin);
        if (typeof plugin.install === 'function') {
            plugin.install(this.kernel);
        }
        if (plugin.hooks && typeof plugin.hooks.onInit === 'function') {
            plugin.hooks.onInit();
        }
    }
    resolve(name) {
        return this.installed.get(name);
    }
    list() {
        return Array.from(this.installed.keys()).map(name => {
            const p = this.installed.get(name);
            return { name: p.name, version: p.version || '1.0.0' };
        });
    }
    triggerHook(hookName, ...args) {
        this.installed.forEach(plugin => {
            if (plugin.hooks && hookName !== '__proto__' && hookName !== 'constructor' && hookName !== 'prototype') {
                const hookFn = Reflect.get(plugin.hooks, hookName);
                if (typeof hookFn === 'function') {
                    try {
                        hookFn(...args);
                    } catch(e) {
                        this.kernel.diagnostics.reportError(e);
                    }
                }
            }
        });
    }
}

// 5. RuntimeContext Subsystem
class RuntimeContext {
    constructor(kernel) {
        this.kernel = kernel;
        this.routes = [];
        this.intent = null;
    }
}

// 6. DiagnosticsEngine Subsystem
class DiagnosticsEngine {
    constructor(kernel) {
        this.kernel = kernel;
        this.errors = [];
        this.listeners = new Map();
        this.updateCounts = new Map();
        this.warnedStates = new Set();
    }
    on(event, callback) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event).push(callback);
    }
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }
    reportError(err) {
        const errorObj = {
            type: 'error',
            message: err.message || String(err),
            timestamp: new Date().toISOString(),
            stack: err.stack || ''
        };
        this.errors.push(errorObj);
        this.kernel.events.emit('error', errorObj);
    }
    trackUpdate(stateObj, newVal, oldVal) {
        let count = (this.updateCounts.get(stateObj) || 0) + 1;
        this.updateCounts.set(stateObj, count);
        if (count > 100 && !this.warnedStates.has(stateObj)) {
            this.warnedStates.add(stateObj);
            this.emit('performance', {
                type: 'High Re-renders',
                message: `State variable updated ${count} times, potential infinite re-render loop detected!`,
                state: stateObj,
                count: count
            });
        }
    }
}

/**
 * Creates a Papyr Runtime Kernel Instance
 * @returns {PapyrKernel} callable element creator function with subsystems attached
 */
function createPapyr() {
    const doc = typeof document !== 'undefined' ? document : docFallback;
    // 1. Functional DOM creator
    function papyrInstance(tag, ...args) {
        // Spelling/tag validation checks
        if (isDebug && !tagList.includes(tag)) {
            let min = Infinity, match = '';
            tagList.forEach(t => {
                let d = levenshtein(tag, t);
                if (d < min) { min = d; match = t; }
            });
            const warnMsg = `Unknown tag "${tag}".${min < 3 ? ` Did you mean "${match}"?` : ''}`;
            console.warn(`PapyrWarning: ${warnMsg}`);
            
            papyrInstance.diagnostics.errors.push({
                type: 'warning',
                message: warnMsg,
                timestamp: new Date().toISOString()
            });

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('papyr-warning', { 
                    detail: { tag, suggestion: min < 3 ? match : '' } 
                }));
            }
        }

        let el;
        if (tag && tag.toLowerCase() === 'script') {
            el = doc.createElement(tag);
            const originalSetAttribute = el.setAttribute;
            el.setAttribute = function(k, v) {
                if (k && k.toLowerCase() === 'src' && papyrInstance.security && typeof papyrInstance.security.shouldBlockScript === 'function' && papyrInstance.security.shouldBlockScript(v)) {
                    console.warn(`Papyr Security Kernel: Blocked tracking script from ${v}`);
                    return;
                }
                originalSetAttribute.apply(this, arguments);
            };
            Object.defineProperty(el, 'src', {
                set(v) {
                    if (papyrInstance.security && typeof papyrInstance.security.shouldBlockScript === 'function' && papyrInstance.security.shouldBlockScript(v)) {
                        console.warn(`Papyr Security Kernel: Blocked tracking script from ${v}`);
                        return;
                    }
                    originalSetAttribute.call(el, 'src', v);
                },
                get() { return el.getAttribute('src'); },
                configurable: true
            });
        } else {
            el = doc.createElement(tag);
        }

        // Intercept addEventListener to keep track of element listeners
        el._listeners = [];
        const originalAddEventListener = el.addEventListener;
        if (typeof originalAddEventListener === 'function') {
            el.addEventListener = function(event, handler, options) {
                el._listeners.push({ event, handler, options });
                return originalAddEventListener.apply(this, arguments);
            };
        } else {
            el.addEventListener = function(event, handler, options) {
                el._listeners.push({ event, handler, options });
            };
        }

        // Register in ComponentRegistry
        papyrInstance.components.register(el);

        let mountDynamicChild = (childSource) => {
            let anchor = doc.createTextNode('');
            el.appendChild(anchor);
            
            let currentNodes = [anchor];
            let isUpdating = false;

            let update = (newValue) => {
                if (isUpdating) return;
                isUpdating = true;
                try {
                    let newNodes = [];
                    const process = (val) => {
                        if (val === null || val === undefined || val === false) {
                            return;
                        }
                        if (isElement(val)) {
                            newNodes.push(val);
                        } else if (Array.isArray(val)) {
                            val.forEach(process);
                        } else if (typeof val === 'function') {
                            process(val());
                        } else {
                            newNodes.push(doc.createTextNode(String(val)));
                        }
                    };
                    process(newValue);

                    if (newNodes.length === 0) {
                        newNodes.push(doc.createTextNode(''));
                    }

                    let firstOldNode = currentNodes[0];
                    let parent = firstOldNode.parentNode;
                    if (parent) {
                        newNodes.forEach(node => {
                            parent.insertBefore(node, firstOldNode);
                        });
                        currentNodes.forEach(node => {
                            if (node.parentNode === parent) {
                                if (typeof parent.removeChild === 'function') {
                                    parent.removeChild(node);
                                } else if (typeof node.remove === 'function') {
                                    node.remove();
                                }
                            }
                        });
                        currentNodes = newNodes;
                    }
                } finally {
                    isUpdating = false;
                }
            };

            let unsubscribe;
            if (childSource && typeof childSource.subscribe === 'function') {
                unsubscribe = childSource.subscribe(update);
            } else if (typeof childSource === 'function') {
                unsubscribe = papyrInstance.effect(() => {
                    update(childSource());
                });
            }
            if (unsubscribe) {
                if (!el._cleanups) el._cleanups = [];
                el._cleanups.push(unsubscribe);
            }
        };

        let appendChild = (child) => {
            if (child === null || child === undefined) return;
            
            if ((typeof child === 'object' && typeof child.subscribe === 'function') || typeof child === 'function') {
                mountDynamicChild(child);
            }
            else if (isElement(child)) {
                el.appendChild(child);
            }
            else if (Array.isArray(child)) {
                child.forEach(appendChild);
            }
            else {
                let str = String(child);
                let hasColon = str.includes(':') && !str.startsWith('http://') && !str.startsWith('https://');
                
                if (str.startsWith('.') || str.startsWith('#')) {
                    let selector = str;
                    let text = '';
                    if (hasColon) {
                        let colonIdx = str.indexOf(':');
                        selector = str.substring(0, colonIdx);
                        text = str.substring(colonIdx + 1);
                    }
                    
                    let parts = selector.match(/[.#][^.#]+/g);
                    if (parts) {
                        parts.forEach(part => {
                            if (part.startsWith('#')) {
                                el.id = part.slice(1).trim();
                            } else if (part.startsWith('.')) {
                                part.slice(1).trim().split(/\s+/).forEach(c => {
                                    if (c) el.classList.add(c);
                                });
                            }
                        });
                    }
                    
                    if (hasColon) {
                        el.appendChild(doc.createTextNode(text));
                    }
                }
                else if (hasColon) {
                    let colonIdx = str.indexOf(':');
                    let t = str.substring(0, colonIdx);
                    let [_, ...rest] = str.split(':');
                    let c = rest.join(':');
                    if (tagList.includes(t.toLowerCase())) {
                        let childEl = doc.createElement(t);
                        childEl.textContent = c;
                        el.appendChild(childEl);
                    } else {
                        el.appendChild(doc.createTextNode(str));
                    }
                }
                else {
                    el.appendChild(doc.createTextNode(str));
                }
            }
        };

        if (tag && tag.toLowerCase() === 'button') {
            el.classList.add('papyr-btn');
        }

        args.forEach(arg => {
            if (arg !== null && typeof arg === 'object' && !isElement(arg) && !Array.isArray(arg) && typeof arg.subscribe !== 'function') {
                
                // Extract natural language style properties
                if (papyrInstance.style && typeof papyrInstance.style.translate === 'function') {
                    const extractedStyles = {};
                    const styleKeys = ['bg', 'radius', 'shadow', 'bold', 'italic', 'underline', 'strike', 'small', 'large', 'thin', 'normal', 'thick', 'black', 'white', 'gray', 'red', 'green', 'blue', 'yellow', 'left', 'center', 'right', 'justify', 'flex', 'grid', 'column', 'row', 'wrap'];
                    Object.keys(arg).forEach(k => {
                        if (styleKeys.includes(k)) {
                            extractedStyles[k] = arg[k];
                            delete arg[k];
                        }
                    });
                    if (Object.keys(extractedStyles).length > 0) {
                        arg.style = Object.assign(arg.style || {}, extractedStyles);
                    }
                }

                // Handle layout responsive flag
                if (arg.responsive !== undefined) {
                    if (papyrInstance.layout && typeof papyrInstance.layout.observeResponsive === 'function') {
                        papyrInstance.layout.observeResponsive(el, arg.responsive);
                    }
                    delete arg.responsive;
                }

                if (arg.style) {
                    const translatedStyle = (papyrInstance.style && typeof papyrInstance.style.translate === 'function')
                        ? papyrInstance.style.translate(arg.style)
                        : arg.style;
                    
                    Object.entries(translatedStyle).forEach(([key, val]) => {
                        const updateStyle = (v) => {
                            if (key.startsWith('--')) {
                                el.style.setProperty(key, String(v));
                            } else if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
                                Reflect.set(el.style, key, v);
                            }
                        };
                        let unsubscribe;
                        if (val && typeof val.subscribe === 'function') {
                            unsubscribe = val.subscribe(updateStyle);
                        } else if (typeof val === 'function') {
                            unsubscribe = papyrInstance.effect(() => {
                                updateStyle(val());
                            });
                        } else {
                            updateStyle(val);
                        }
                        if (unsubscribe) {
                            if (!el._cleanups) el._cleanups = [];
                            el._cleanups.push(unsubscribe);
                        }
                    });
                }
                if (arg.data) Object.assign(el.dataset, arg.data);
                if (arg.attrs) Object.assign(el, arg.attrs);
                
                Object.entries(arg).forEach(([k, v]) => {
                    if (['style', 'data', 'attrs'].includes(k)) return;
                    
                    if (k === 'onMounted') {
                        el._onMounted = v;
                    }
                    else if (k === 'onUnmounted') {
                        el._onUnmounted = v;
                    }
                    else if (k === 'onUpdated') {
                        el._onUpdated = v;
                        const updateObserver = new MutationObserver(() => {
                            try { el._onUpdated(el); } catch(e) { papyrInstance.diagnostics.reportError(e); }
                        });
                        updateObserver.observe(el, { attributes: true, childList: true, subtree: false });
                        el._updateObserver = updateObserver;
                    }
                    else if (k === 'on' && typeof v === 'object' && v !== null) {
                        Object.entries(v).forEach(([evt, handler]) => {
                            el.addEventListener(evt, handler);
                        });
                    }
                    else if (k.startsWith('on')) {
                        let evName = k.slice(2).toLowerCase();
                        el.addEventListener(evName, v);
                    }
                    else if (k.startsWith('--')) {
                        el.style.setProperty(k, String(v));
                    }
                    else if (k === 'paper' || k === 'papyr') {
                        const updatePaper = (val) => {
                            parsePapyrUtilities(el, val);
                        };
                        let unsubscribe;
                        if (v && typeof v.subscribe === 'function') {
                            unsubscribe = v.subscribe(updatePaper);
                        } else if (typeof v === 'function') {
                            unsubscribe = papyrInstance.effect(() => {
                                updatePaper(v());
                            });
                        } else {
                            updatePaper(v);
                        }
                        if (unsubscribe) {
                            if (!el._cleanups) el._cleanups = [];
                            el._cleanups.push(unsubscribe);
                        }
                    }
                    else {
                        // General reactive attribute / property updater
                        const updateAttr = (newVal) => {
                            if (k === 'class' || k === 'className') {
                                let parsed = parseClass(newVal);
                                if (el._prevReactiveClasses) {
                                    el._prevReactiveClasses.forEach(c => {
                                        if (c) el.classList.remove(c);
                                    });
                                }
                                el._prevReactiveClasses = [];
                                if (parsed) {
                                    parsed.split(' ').forEach(c => {
                                        if (c) {
                                            el.classList.add(c);
                                            el._prevReactiveClasses.push(c);
                                        }
                                    });
                                }
                            } else if (k in el && k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
                                if (typeof newVal === 'boolean') {
                                    Reflect.set(el, k, newVal);
                                    if (newVal) el.setAttribute(k, '');
                                    else el.removeAttribute(k);
                                } else {
                                    Reflect.set(el, k, newVal);
                                }
                            } else {
                                if (newVal === null || newVal === undefined || newVal === false) {
                                    el.removeAttribute(k);
                                } else {
                                    el.setAttribute(k, String(newVal));
                                }
                            }
                        };

                        let unsubscribe;
                        if (v && typeof v.subscribe === 'function') {
                            unsubscribe = v.subscribe(updateAttr);
                        } else if (typeof v === 'function') {
                            unsubscribe = papyrInstance.effect(() => {
                                updateAttr(v());
                            });
                        } else {
                            updateAttr(v);
                        }
                        if (unsubscribe) {
                            if (!el._cleanups) el._cleanups = [];
                            el._cleanups.push(unsubscribe);
                        }
                    }
                });
            } else {
                appendChild(arg);
            }
        });

        // Trigger autoAria accessibility generator
        if (papyrInstance.accessibility && typeof papyrInstance.accessibility.autoAria === 'function') {
            papyrInstance.accessibility.autoAria(el, tag);
        }

        // Trigger onRender hook
        papyrInstance.plugins.triggerHook('onRender', el);

        return el;
    }

    // 2. Instantiate systems
    papyrInstance.state = new StateManager(papyrInstance);
    let compRegistry = new ComponentRegistry(papyrInstance);
    Object.defineProperty(papyrInstance, 'components', {
        get() {
            return compRegistry;
        },
        set(value) {
            if (value && typeof value === 'object') {
                Object.assign(compRegistry, value);
            } else {
                console.warn("Papyr: Attempted to set papyr.components to a non-object value, ignored.");
            }
        },
        configurable: true
    });
    papyrInstance.events = new EventBus(papyrInstance);
    papyrInstance.plugins = new PluginSystem(papyrInstance);
    papyrInstance.runtime = new RuntimeContext(papyrInstance);
    papyrInstance.diagnostics = new DiagnosticsEngine(papyrInstance);

    // Event aliases
    papyrInstance.on = (evt, cb) => papyrInstance.events.on(evt, cb);
    papyrInstance.off = (evt, cb) => papyrInstance.events.off(evt, cb);
    papyrInstance.emit = (evt, data) => papyrInstance.events.emit(evt, data);

    // Context Export API
    papyrInstance.exportContext = () => {
        return {
            components: papyrInstance.components ? papyrInstance.components.list() : [],
            state: papyrInstance.state ? papyrInstance.state.dump() : {},
            routes: papyrInstance.runtime ? (papyrInstance.runtime.routes || []) : [],
            errors: papyrInstance.diagnostics ? papyrInstance.diagnostics.errors : [],
            plugins: papyrInstance.plugins ? papyrInstance.plugins.list() : [],
            power: papyrInstance.power ? {
                state: papyrInstance.power.state ? papyrInstance.power.state.value : 'unknown',
                fps: papyrInstance.power.fps ? papyrInstance.power.fps.value : 0,
                targetFps: papyrInstance.power.targetFps ? papyrInstance.power.targetFps.value : 0,
                battery: papyrInstance.power.battery ? {
                    level: papyrInstance.power.battery.level ? papyrInstance.power.battery.level.value : 1.0,
                    charging: papyrInstance.power.battery.charging ? papyrInstance.power.battery.charging.value : true
                } : {}
            } : {},
            gateways: papyrInstance.gateway ? papyrInstance.gateway.list() : [],
            diagnostics: papyrInstance.diagnostics ? {
                updateCounts: Array.from(papyrInstance.diagnostics.updateCounts || []).map(([k, v]) => ({ key: k, count: v }))
            } : {}
        };
    };

    // Plugin registry supporting legacy function plugins and formal object layouts
    papyrInstance.use = (plugin) => {
        if (typeof plugin === 'function') {
            plugin(papyrInstance);
        } else if (plugin && typeof plugin === 'object') {
            papyrInstance.plugins.register(plugin);
        }
        return papyrInstance;
    };

    // Design Tokens Theme engine for dynamic custom property updates
    papyrInstance.theme = (config) => {
        if (!config || typeof doc === 'undefined') return papyrInstance;
        if (typeof config === 'string') {
            const presets = ['liquid', 'material', 'minimal', 'enterprise'];
            const presetLower = config.toLowerCase();
            if (presets.includes(presetLower)) {
                const rootEl = doc.documentElement || doc.body;
                if (rootEl && rootEl.classList) {
                    presets.forEach(p => rootEl.classList.remove(`papyr-theme-${p}`));
                    rootEl.classList.add(`papyr-theme-${presetLower}`);
                }
            }
        } else if (typeof config === 'object') {
            Object.entries(config).forEach(([key, val]) => {
                if (doc.documentElement && doc.documentElement.style) {
                    doc.documentElement.style.setProperty(`--papyr-${key}`, val);
                    doc.documentElement.style.setProperty(`--${key}`, val);
                }
            });
        }
        return papyrInstance;
    };


    // Dynamic plugin registration alias matching the roadmap API layout
    papyrInstance.plugin = (p) => papyrInstance.use(p);

    // Tag shortcuts
    tagList.forEach(tag => {
        papyrInstance[tag] = (...args) => papyrInstance(tag, ...args);
    });

    // Flex/grid dynamic layout shortcuts
    papyrInstance.flex = {
        row: (...args) => papyrInstance('div', '.flex-row', ...args),
        col: (...args) => papyrInstance('div', '.flex-col', ...args),
        center: (...args) => papyrInstance('div', '.flex-center', ...args),
        between: (...args) => papyrInstance('div', '.flex-between', ...args),
        around: (...args) => papyrInstance('div', '.flex-around', ...args),
        wrap: (...args) => papyrInstance('div', '.flex-wrap', ...args)
    };
    papyrInstance.grid = (...args) => papyrInstance('div', '.grid', ...args);
    papyrInstance.container = (...args) => papyrInstance('div', '.container', ...args);
    papyrInstance.row = (...args) => papyrInstance('div', '.row', ...args);
    papyrInstance.col = (...args) => papyrInstance('div', '.col', ...args);

    // OOP Class-based component support
    class PapyrComponent {
        constructor() {
            if (this.render === undefined) {
                throw new Error("PapyrComponent must implement a render() method");
            }
        }
    }
    papyrInstance.component = PapyrComponent;
    papyrInstance.defineComponent = (renderFn) => {
        return (props) => {
            const el = renderFn(props);
            if (el && typeof el === 'object') {
                el._renderFn = renderFn;
                el._props = props;
            }
            return el;
        };
    };

    // Python-like syntax wrapper (papyr.py namespace)
    papyrInstance.py = {
        state: (val, options) => papyrInstance.state(val, options),
        computed: (fn) => papyrInstance.computed(fn),
        effect: (fn) => papyrInstance.effect(fn),

        Box: (...args) => {
            let props = {};
            let children = args;
            if (args[0] && typeof args[0] === 'object' && !args[0].tagName && !args[0]._subscribers && !args[0].value) {
                props = args[0];
                children = args.slice(1);
            }
            const style = {
                display: 'flex',
                flexDirection: props.direction || 'column',
                padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding,
                margin: typeof props.margin === 'number' ? `${props.margin}px` : props.margin,
                gap: typeof props.gap === 'number' ? `${props.gap}px` : props.gap,
                alignItems: props.align || 'stretch',
                justifyContent: props.justify || 'flex-start',
                background: props.bg,
                color: props.color,
                borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
                ...props.style
            };
            const elProps = { style, class: props.class, id: props.id };
            if (props.on_click) elProps.onClick = props.on_click;
            return papyrInstance.div(elProps, ...children);
        },

        Text: (content, props = {}) => {
            const style = {
                fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
                color: props.color,
                fontWeight: props.weight,
                lineHeight: props.line_height,
                letterSpacing: props.kerning,
                ...props.style
            };
            const elProps = { style, class: props.class, id: props.id };
            if (props.on_click) elProps.onClick = props.on_click;
            return papyrInstance.span(elProps, content);
        },

        Button: (label, on_click, props = {}) => {
            const style = {
                padding: props.padding || '8px 16px',
                borderRadius: props.radius || '8px',
                background: props.bg,
                color: props.color,
                ...props.style
            };
            const elProps = { style, class: props.class, id: props.id };
            elProps.onClick = on_click;
            return papyrInstance.button(elProps, label);
        },

        Input: (props = {}) => {
            const style = {
                padding: props.padding || '8px 12px',
                borderRadius: props.radius || '6px',
                border: props.border,
                ...props.style
            };
            const elProps = {
                style,
                class: props.class,
                id: props.id,
                type: props.type || 'text',
                placeholder: props.placeholder || '',
                value: props.value !== undefined ? props.value : ''
            };
            if (props.on_change) elProps.onInput = (e) => props.on_change(e.target.value, e);
            return papyrInstance.input(elProps);
        }
    };

    // Error boundary wrapper
    papyrInstance.errorBoundary = (renderFn, fallbackFn) => {
        try {
            return renderFn();
        } catch (err) {
            papyrInstance.diagnostics.reportError(err);
            if (typeof fallbackFn === 'function') {
                try {
                    return fallbackFn(err);
                } catch (fallbackErr) {
                    return papyrInstance.div('.papyr-error-fallback', 'Component failed to render.');
                }
            }
            return papyrInstance.div('.papyr-error-fallback', { style: { padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem' } }, '⚠️ Component Rendering Error: ' + err.message);
        }
    };

    // Security validation schemas
    papyrInstance.validate = (schema) => {
        return (data) => {
            let errors = Object.create(null);
            for (let key in schema) {
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
                if (Object.prototype.hasOwnProperty.call(schema, key)) {
                    // eslint-disable-next-line security/detect-object-injection
                    let rule = schema[key];
                    // eslint-disable-next-line security/detect-object-injection
                    let value = (data && Object.prototype.hasOwnProperty.call(data, key)) ? data[key] : undefined;
                    if (rule.required && (value === undefined || value === null || value === '')) {
                        // eslint-disable-next-line security/detect-object-injection
                        errors[key] = "Required field";
                    }
                    if (rule.type && typeof value !== rule.type) {
                        // eslint-disable-next-line security/detect-object-injection
                        errors[key] = `Must be of type ${rule.type}`;
                    }
                }
            }
            return Object.keys(errors).length ? errors : null;
        };
    };

    // Standard utilities
    papyrInstance.inspect = (component) => {
        let container = doc.createElement('div');
        container.appendChild(component.cloneNode(true));
        return container.innerHTML;
    };

    papyrInstance.mount = (selector, component) => {
        let target = typeof selector === 'string' ? doc.querySelector(selector) : selector;
        if (target) {
            // Clean up existing children event listeners and reactive subscriptions
            Array.from(target.children || []).forEach(child => {
                if (typeof papyrInstance._cleanupElement === 'function') {
                    papyrInstance._cleanupElement(child);
                }
            });
            target.innerHTML = '';
            let rendered = typeof component === 'function' ? component() : component;
            if (rendered) {
                target.appendChild(rendered);
            }
        }
        return target;
    };

    papyrInstance.ready = (cb) => {
        if (typeof document === 'undefined') {
            cb();
            return;
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', cb);
        } else {
            cb();
        }
    };

    papyrInstance.debug = (enable) => {
        isDebug = enable;
        if (enable) console.log("📄 Papyr Debug Mode Enabled.");
    };

    papyrInstance.delay = (ms) => new Promise(res => setTimeout(res, ms));
    papyrInstance.copy = (text) => navigator.clipboard.writeText(text);

    papyrInstance.fragment = (...children) => {
        let frag = doc.createDocumentFragment();
        children.forEach(child => {
            if (Array.isArray(child)) {
                child.forEach(c => {
                    if (c instanceof Element) frag.appendChild(c);
                    else frag.appendChild(doc.createTextNode(String(c)));
                });
            } else if (child instanceof Element || child instanceof DocumentFragment) {
                frag.appendChild(child);
            } else if (child !== null && child !== undefined) {
                frag.appendChild(doc.createTextNode(String(child)));
            }
        });
        return frag;
    };

    papyrInstance.html = (htmlString) => {
        let template = doc.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.cloneNode(true);
    };

    // Visual animations transition engine
    papyrInstance.fadeIn = (el, duration = 400) => {
        el.style.opacity = '0';
        el.style.transition = `opacity ${duration}ms ease`;
        requestAnimationFrame(() => { el.style.opacity = '1'; });
    };

    papyrInstance.fadeOut = (el, duration = 400) => {
        el.style.opacity = '1';
        el.style.transition = `opacity ${duration}ms ease`;
        requestAnimationFrame(() => { el.style.opacity = '0'; });
        setTimeout(() => el.remove(), duration);
    };

    papyrInstance.animate = (el, properties, duration = 400) => {
        const nonGpuProps = ['top', 'left', 'right', 'bottom', 'width', 'height', 'margin', 'padding'];
        const badProps = Object.keys(properties || {}).filter(p => nonGpuProps.includes(p));
        if (badProps.length > 0) {
            console.warn(`💡 [Papyr Animation Tip]: Non-GPU property animation detected for [${badProps.join(', ')}]. Prefer CSS transitions with 'transform' and 'opacity' to achieve high frame-rate rendering.`);
        }
        
        el.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => {
                Object.assign(el.style, properties);
            });
        } else {
            Object.assign(el.style, properties);
        }
    };

    papyrInstance.loadFramework = (framework) => {
        let id = `papyr-fw-${framework}`;
        if (document.getElementById(id)) return;
        
        if (framework === 'tailwind') {
            let script = document.createElement('script');
            script.id = id;
            script.src = 'https://cdn.tailwindcss.com';
            document.head.appendChild(script);
        } else if (framework === 'bootstrap') {
            let link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
            
            let customStyle = doc.getElementById('papyr-complete-styles') || doc.querySelector('link[href*="styles.css"]') || doc.querySelector('style');
            if (customStyle && customStyle.parentNode) {
                customStyle.parentNode.insertBefore(link, customStyle);
            } else if (doc.head) {
                doc.head.appendChild(link);
            }
            
            if (doc && doc.documentElement) {
                doc.documentElement.setAttribute('data-bs-theme', 'dark');
            }
            if (doc && doc.body) {
                doc.body.setAttribute('data-bs-theme', 'dark');
            }
        }
    };

    papyrInstance.init = (config = {}) => {
        if (config.privacy) {
            if (papyrInstance.security && typeof papyrInstance.security.setTier === 'function') {
                papyrInstance.security.setTier(config.privacy);
            } else {
                papyrInstance._initialPrivacy = config.privacy;
            }
        }
        if (config.debug !== undefined) {
            papyrInstance.debug(config.debug);
        }
    };

    let previousPapyr = typeof window !== 'undefined' ? window.papyr : null;
    papyrInstance.noConflict = () => {
        if (typeof window !== 'undefined') {
            window.papyr = previousPapyr;
        }
        return papyrInstance;
    };

    papyrInstance.el = papyrInstance;



    // Run registered core initializers!
    coreInitializers.forEach(init => {
        try { init(papyrInstance); } catch(e) { console.error("Error during core initialization", e); }
    });

    // Setup global MutationObserver for element lifecycle mounted/unmounted hooks
    if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
        const lifecycleObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element
                        const checkMounted = (n) => {
                            if (n._onMounted && !n._isMounted) {
                                n._isMounted = true;
                                try { n._onMounted(n); } catch(e) { papyrInstance.diagnostics.reportError(e); }
                            }
                            Array.from(n.children || []).forEach(checkMounted);
                        };
                        checkMounted(node);
                    }
                });
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element
                        if (typeof papyrInstance._cleanupElement === 'function') {
                            papyrInstance._cleanupElement(node);
                        } else {
                            const checkUnmounted = (n) => {
                                if (n._cleanups) {
                                    n._cleanups.forEach(c => {
                                        if (typeof c === 'function') {
                                            try { c(); } catch(e) { papyrInstance.diagnostics.reportError(e); }
                                        }
                                    });
                                    n._cleanups = [];
                                }
                                if (n._onUnmounted) {
                                    n._isMounted = false;
                                    try { n._onUnmounted(n); } catch(e) { papyrInstance.diagnostics.reportError(e); }
                                }
                                Array.from(n.children || []).forEach(checkUnmounted);
                            };
                            checkUnmounted(node);
                        }
                    }
                });
            });
        });
        
        const startObserving = () => {
            if (document.body) {
                lifecycleObserver.observe(document.body, { childList: true, subtree: true });
            }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startObserving);
        } else {
            startObserving();
        }
    }

    return papyrInstance;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = createPapyr;
} else if (typeof window !== 'undefined') {
    window.createPapyr = createPapyr;
}


// --- MODULE: core/security.js ---
/**
 * PAPYR SECURITY KERNEL
 * Enterprise-grade XSS Sanitization and Injection Prevention.
 * Web Access Transparency Toolkit (WATT) script and storage filter.
 * Updated to run modularly inside the Papyr Kernel context.
 */

(function () {
    let tempStorage = Object.create(null);
    const trackingKeys = ['_ga', '_gid', '_fbp', '_uid_tracking_id', 'tracking', 'analytics', 'pixel', 'adsense'];

    let originalSetItem = null;
    let originalGetItem = null;
    let originalRemoveItem = null;

    if (typeof window !== 'undefined' && window.localStorage) {
        if (typeof localStorage.setItem === 'function') originalSetItem = localStorage.setItem.bind(localStorage);
        if (typeof localStorage.getItem === 'function') originalGetItem = localStorage.getItem.bind(localStorage);
        if (typeof localStorage.removeItem === 'function') originalRemoveItem = localStorage.removeItem.bind(localStorage);
    }

    coreInitializers.push((papyr) => {
        const policies = {
            camera: 'prompt',
            microphone: 'prompt',
            location: 'prompt',
            storage: 'allow',
            notifications: 'prompt',
            clipboard: 'prompt',
            bluetooth: 'prompt',
            usb: 'prompt',
            sensors: 'prompt'
        };

        function securityConfig(config) {
            if (typeof config === 'object' && config !== null) {
                Object.assign(policies, config);
                console.log("🔒 Papyr Security Policy Engine updated:", policies);
            }
            return policies;
        }

        Object.assign(securityConfig, {
            _isActive: true, // Enabled by default for safety
            currentTier: 'default',
            hasConsent: false,
            _scriptsBlocked: false,

            get policies() {
                return policies;
            },

            setTier(tier) {
                this.currentTier = tier;
                if (tier === 'high') {
                    this.blockThirdPartyScripts();
                }
            },

            setConsent(granted) {
                this.hasConsent = !!granted;
                if (granted) {
                    // Flush tempStorage back to real localStorage
                    try {
                        if (originalSetItem) {
                            Object.entries(tempStorage).forEach(([k, v]) => {
                                originalSetItem(k, v);
                            });
                        }
                        tempStorage = Object.create(null);
                    } catch (e) { }
                } else {
                    // Clear tracking keys from real localStorage
                    try {
                        if (originalRemoveItem) {
                            const keysToDelete = [];
                            for (let i = 0; i < localStorage.length; i++) {
                                let key = localStorage.key(i);
                                if (key) {
                                    const lowerKey = key.toLowerCase();
                                    if (trackingKeys.some(tk => lowerKey.includes(tk))) {
                                        keysToDelete.push(key);
                                    }
                                }
                            }
                            keysToDelete.forEach(key => originalRemoveItem(key));
                        }
                    } catch (e) { }
                }
            },

            shouldBlockScript(src) {
                if (this.currentTier === 'none') return false;
                if (!src || typeof src !== 'string') return false;

                const trackingDomains = ['analytics', 'pixel', 'doubleclick', 'google-analytics', 'adsense', 'ad-tracker', 'facebook.net', 'adnxs'];
                const isTracker = trackingDomains.some(d => src.toLowerCase().includes(d));

                if (this.currentTier === 'high' && isTracker) return true;
                if (this.currentTier === 'default' && !this.hasConsent && isTracker) return true;
                return false;
            },

            blockThirdPartyScripts() {
                if (typeof document === 'undefined') return;
                if (this._scriptsBlocked) return;
                this._scriptsBlocked = true;

                const originalCreateElement = document.createElement;
                document.createElement = function (tag, options) {
                    const el = originalCreateElement.call(document, tag, options);
                    if (tag && tag.toLowerCase() === 'script') {
                        const originalSetAttribute = el.setAttribute;
                        el.setAttribute = function (k, v) {
                            if (k && k.toLowerCase() === 'src' && papyr.security.shouldBlockScript(v)) {
                                console.warn(`Papyr Security Kernel: Blocked tracking script from ${v}`);
                                return;
                            }
                            originalSetAttribute.apply(this, arguments);
                        };
                        Object.defineProperty(el, 'src', {
                            set(v) {
                                if (papyr.security.shouldBlockScript(v)) {
                                    console.warn(`Papyr Security Kernel: Blocked tracking script from ${v}`);
                                    return;
                                }
                                originalSetAttribute.call(el, 'src', v);
                            },
                            get() { return el.getAttribute('src'); },
                            configurable: true
                        });
                    }
                    return el;
                };
            },

            shouldSandboxStorage(key) {
                if (this.currentTier === 'none') return false;
                
                const policy = policies.storage;
                if (policy === 'deny') return true;
                if (policy === 'prompt') {
                    return !this.hasConsent;
                }

                if (this.currentTier === 'high') return true;
                if (!this.hasConsent) {
                    return trackingKeys.some(tk => key.toLowerCase().includes(tk));
                }
                return false;
            },

            sanitize(html) {
                if (!this._isActive || typeof html !== 'string') return html;

                let clean = html;
                if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'a', 'img', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'form', 'label', 'input', 'textarea', 'select', 'option', 'pre', 'code', 'strong', 'em', 'small', 'hr', 'br', 'canvas', 'svg', 'path', 'rect', 'circle'];
                        const allowedAttrs = ['class', 'style', 'id', 'href', 'src', 'alt', 'title', 'placeholder', 'type', 'name', 'value', 'checked', 'disabled', 'rows', 'cols', 'width', 'height', 'viewBox', 'd', 'role', 'aria-live', 'aria-modal', 'aria-labelledby', 'tabindex', 'aria-label'];

                        const cleanNode = (node) => {
                            if (node.nodeType === 1) { // Element
                                const tagName = node.tagName.toLowerCase();
                                if (!allowedTags.includes(tagName) || tagName === 'script') {
                                    node.parentNode.removeChild(node);
                                    return;
                                }

                                const attrs = Array.from(node.attributes);
                                attrs.forEach(attr => {
                                    const name = attr.name.toLowerCase();
                                    const val = attr.value.toLowerCase().trim();
                                    if (!allowedAttrs.includes(name) || name.startsWith('on') || val.includes('javascript:')) {
                                        node.removeAttribute(attr.name);
                                    }
                                });

                                Array.from(node.childNodes).forEach(cleanNode);
                            }
                        };

                        Array.from(doc.body.childNodes).forEach(cleanNode);
                        clean = doc.body.innerHTML;
                    } catch (e) { }
                }

                if (clean === html || typeof DOMParser === 'undefined') {
                    clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                    clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
                    clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');
                    clean = clean.replace(/\s+on\w+\s*=\s*\w+/gi, '');
                    clean = clean.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
                    clean = clean.replace(/src\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'src=""');
                }

                if (html !== clean) {
                    if (papyr.warn) papyr.warn("Papyr Security Interceptor blocked a potential XSS payload.");
                }
                return clean;
            },

            use(provider) {
                if (provider === 'disable') {
                    this._isActive = false;
                    if (papyr.warn) papyr.warn("Papyr Security Kernel DISABLED. You are vulnerable to XSS.");
                }
            },

            encrypt(text, password) {
                if (!text) return text;
                const utf8Text = typeof window !== 'undefined' ? unescape(encodeURIComponent(text)) : Buffer.from(text, 'utf8').toString('binary');
                let result = '';
                let keyFeedback = 0;
                for (let i = 0; i < utf8Text.length; i++) {
                    let keyChar = password.charCodeAt(i % password.length);
                    let mixedKey = (keyChar + i + keyFeedback) & 255;
                    let encryptedChar = utf8Text.charCodeAt(i) ^ mixedKey;
                    result += String.fromCharCode(encryptedChar);
                    keyFeedback = encryptedChar;
                }
                return typeof window !== 'undefined' ? window.btoa(result) : Buffer.from(result, 'binary').toString('base64');
            },

            decrypt(encodedText, password) {
                if (!encodedText) return encodedText;
                try {
                    let binaryStr = typeof window !== 'undefined' ? window.atob(encodedText) : Buffer.from(encodedText, 'base64').toString('binary');
                    let result = '';
                    let keyFeedback = 0;
                    for (let i = 0; i < binaryStr.length; i++) {
                        let keyChar = password.charCodeAt(i % password.length);
                        let mixedKey = (keyChar + i + keyFeedback) & 255;
                        let decryptedChar = binaryStr.charCodeAt(i) ^ mixedKey;
                        result += String.fromCharCode(decryptedChar);
                        keyFeedback = binaryStr.charCodeAt(i);
                    }
                    return typeof window !== 'undefined' ? decodeURIComponent(escape(result)) : Buffer.from(result, 'binary').toString('utf8');
                } catch (e) {
                    if (papyr.warn) papyr.warn("Papyr Security: Decryption failed (invalid key or corrupted data).");
                    return null;
                }
            },

            async encryptAsync(text, password) {
                if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
                    return this.encrypt(text, password);
                }
                try {
                    const encoder = new TextEncoder();
                    const salt = window.crypto.getRandomValues(new Uint8Array(16));
                    const iv = window.crypto.getRandomValues(new Uint8Array(12));

                    const keyMaterial = await window.crypto.subtle.importKey(
                        "raw",
                        encoder.encode(password),
                        "PBKDF2",
                        false,
                        ["deriveKey"]
                    );

                    const key = await window.crypto.subtle.deriveKey(
                        {
                            name: "PBKDF2",
                            salt: salt,
                            iterations: 100000,
                            hash: "SHA-256"
                        },
                        keyMaterial,
                        { name: "AES-GCM", length: 256 },
                        false,
                        ["encrypt"]
                    );

                    const ciphertext = await window.crypto.subtle.encrypt(
                        { name: "AES-GCM", iv: iv },
                        key,
                        encoder.encode(text)
                    );

                    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
                    combined.set(salt, 0);
                    combined.set(iv, salt.length);
                    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

                    let binary = '';
                    for (let i = 0; i < combined.byteLength; i++) {
                        binary += String.fromCharCode(combined[i]);
                    }
                    return window.btoa(binary);
                } catch (e) {
                    console.error("Papyr Security: Async Encryption failed, falling back to sync.", e);
                    return this.encrypt(text, password);
                }
            },

            async decryptAsync(encodedText, password) {
                if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
                    return this.decrypt(encodedText, password);
                }
                try {
                    const binaryStr = window.atob(encodedText);
                    const combined = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) {
                        combined[i] = binaryStr.charCodeAt(i);
                    }

                    const salt = combined.slice(0, 16);
                    const iv = combined.slice(16, 28);
                    const ciphertext = combined.slice(28);

                    const encoder = new TextEncoder();
                    const keyMaterial = await window.crypto.subtle.importKey(
                        "raw",
                        encoder.encode(password),
                        "PBKDF2",
                        false,
                        ["deriveKey"]
                    );

                    const key = await window.crypto.subtle.deriveKey(
                        {
                            name: "PBKDF2",
                            salt: salt,
                            iterations: 100000,
                            hash: "SHA-256"
                        },
                        keyMaterial,
                        { name: "AES-GCM", length: 256 },
                        false,
                        ["decrypt"]
                    );

                    const decrypted = await window.crypto.subtle.decrypt(
                        { name: "AES-GCM", iv: iv },
                        key,
                        ciphertext
                    );

                    return new TextDecoder().decode(decrypted);
                } catch (e) {
                    console.error("Papyr Security: Async Decryption failed, falling back to sync.", e);
                    return this.decrypt(encodedText, password);
                }
            },

            aiConsent(details) {
                return new Promise((resolve) => {
                    if (papyr.isServer()) {
                        resolve(true);
                        return;
                    }
                    
                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        const description = [
                            `Destination: ${details.destination}`,
                            `Payload size: ${details.prompt.length} chars`
                        ];
                        if (details.attachments && details.attachments.length > 0) {
                            description.push(`Attachments: ${details.attachments.length} files`);
                        }
                        
                        papyr.watt.triggerWattPrompt("AI Data Transparency Request", () => {
                            resolve(true);
                        }, () => {
                            resolve(false);
                        }, description);
                    } else {
                        // In case WATT UI is not loaded yet, check basic alert/confirm or allow
                        const ok = confirm(`AI Data Transparency Alert:\nSending prompt of length ${details.prompt.length} to ${details.destination}.\n\nAllow?`);
                        resolve(ok);
                    }
                });
            },

            detectLeakage(data) {
                if (!data) return false;
                const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
                
                const patterns = {
                    openai_key: /sk-[a-zA-Z0-9]{48}/g,
                    google_key: /AIzaSy[a-zA-Z0-9-_]{35}/g,
                    anthropic_key: /sk-ant-sid01-[a-zA-Z0-9-_]{93}/g,
                    generic_secret: /(password|secret|passwd|private_key|privatekey)\s*[:=]\s*["'][a-zA-Z0-9-_]{8,}["']/gi
                };

                let leaks = [];
                for (const [name, regex] of Object.entries(patterns)) {
                    if (regex.test(dataStr)) {
                        leaks.push(name);
                    }
                }

                if (leaks.length > 0) {
                    const msg = `⚠️ [WATT Data Leakage Warning] Potential secrets exposed in data: ${leaks.join(', ')}`;
                    console.warn(msg);
                    if (papyr.diagnostics && typeof papyr.diagnostics.reportError === 'function') {
                        papyr.diagnostics.reportError(new Error(msg));
                    }
                    return true;
                }
                return false;
            }
        });

        // ─── WATT + SSR Integration ───────────────────────────────────────────────
        // When running in a server environment (SSR), all hardware APIs are automatically
        // set to 'deny'. These APIs are client-only and must never be called during SSR.
        // After hydration on the client, policies revert to configured 'prompt' defaults.

        /**
         * List of APIs that are strictly client-only and must be blocked during SSR.
         * Developers can reference this list to understand what WATT auto-blocks server-side.
         */
        securityConfig.clientOnlyApis = [
            'camera',
            'microphone',
            'location',
            'notifications',
            'bluetooth',
            'usb',
            'sensors',
            'clipboard'
        ];

        /** Internal record of SSR-blocked APIs and their reasons */
        const _ssrBlockLog = [];

        /**
         * Apply SSR mode: auto-denies all hardware/browser APIs.
         * Called automatically when isServer() is true at initialization.
         * @private
         */
        function _applySSRPolicies() {
            securityConfig.clientOnlyApis.forEach(api => {
                const prev = policies[api];
                policies[api] = 'deny';
                _ssrBlockLog.push({
                    api,
                    previousPolicy: prev,
                    reason: 'SSR mode: client-only API auto-blocked by WATT',
                    timestamp: new Date().toISOString()
                });
            });
            console.log('[WATT + SSR] Server-side mode detected. All hardware APIs set to "deny". WATT will restore policies post-hydration.');
        }

        /**
         * Returns a report of all APIs blocked during SSR by WATT.
         * Useful for debugging and auditing SSR policy compliance.
         *
         * @returns {{ ssrMode: boolean, blockedApis: Array<{ api, previousPolicy, reason, timestamp }> }}
         *
         * @example
         * if (papyr.isServer()) {
         *   console.log(papyr.security.getSSRReport());
         * }
         */
        securityConfig.getSSRReport = function() {
            return {
                ssrMode: papyr.isServer ? papyr.isServer() : false,
                currentPolicies: { ...policies },
                blockedApis: [..._ssrBlockLog]
            };
        };

        /**
         * Signals that client-side hydration is complete.
         * Restores hardware API policies from 'deny' back to 'prompt' defaults.
         * Call this after papyr.hydrate() or papyr.pssr.hydrate() completes.
         *
         * @example
         * papyr.pssr.hydrate('#app');
         * papyr.security.onHydrated();
         */
        securityConfig.onHydrated = function() {
            if (papyr.isServer && papyr.isServer()) return; // No-op on server

            // Restore client-side policies: previously 'deny' (from SSR mode) → 'prompt'
            _ssrBlockLog.forEach(({ api, previousPolicy }) => {
                if (policies[api] === 'deny' && previousPolicy !== 'deny') {
                    policies[api] = previousPolicy || 'prompt';
                }
            });

            console.log('[WATT + Hydration] Client hydration complete. Hardware API policies restored to prompt mode.');

            // Flush any pending routeModes registered before PSSR initialized
            if (papyr._pendingRouteModes && papyr.pssr && typeof papyr.pssr.setRouteMode === 'function') {
                papyr._pendingRouteModes.forEach(({ path, mode }) => {
                    papyr.pssr.setRouteMode(path, mode);
                });
                papyr._pendingRouteModes = [];
            }
        };

        // Auto-apply SSR policies if running server-side
        if (papyr.isServer && papyr.isServer()) {
            _applySSRPolicies();
        }


        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            const geo = navigator.geolocation;
            const originalGetCurrentPosition = geo.getCurrentPosition;
            const originalWatchPosition = geo.watchPosition;

            geo.getCurrentPosition = function (successCb, errorCb, options) {
                const policy = policies.location;
                if (policy === 'deny') {
                    if (errorCb) errorCb({ code: 1, message: "Location permission denied by Papyr security policy." });
                    return;
                }
                if (policy === 'allow') {
                    originalGetCurrentPosition.call(geo, successCb, errorCb, options);
                    return;
                }
                // 'prompt'
                if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                    papyr.watt.triggerWattPrompt("Location Access", () => {
                        originalGetCurrentPosition.call(geo, successCb, errorCb, options);
                    }, () => {
                        if (errorCb) errorCb({ code: 1, message: "User denied location access through WATT." });
                    });
                } else {
                    originalGetCurrentPosition.call(geo, successCb, errorCb, options);
                }
            };

            geo.watchPosition = function (successCb, errorCb, options) {
                const policy = policies.location;
                if (policy === 'deny') {
                    if (errorCb) errorCb({ code: 1, message: "Location tracking denied by Papyr security policy." });
                    return -1;
                }
                if (policy === 'allow') {
                    return originalWatchPosition.call(geo, successCb, errorCb, options);
                }
                // 'prompt'
                let watchId = -1;
                if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                    papyr.watt.triggerWattPrompt("Location Tracking", () => {
                        watchId = originalWatchPosition.call(geo, successCb, errorCb, options);
                    }, () => {
                        if (errorCb) errorCb({ code: 1, message: "User denied location access through WATT." });
                    });
                } else {
                    watchId = originalWatchPosition.call(geo, successCb, errorCb, options);
                }
                return watchId;
            };
        }

        // 2. Camera & Microphone getUserMedia Interception
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = function (constraints) {
                const hasCamera = !!(constraints && constraints.video);
                const hasMic = !!(constraints && constraints.audio);
                
                const cameraPolicy = policies.camera;
                const micPolicy = policies.microphone;

                if ((hasCamera && cameraPolicy === 'deny') || (hasMic && micPolicy === 'deny')) {
                    return Promise.reject(new DOMException("Permission denied by Papyr security policy.", "NotAllowedError"));
                }

                if ((!hasCamera || cameraPolicy === 'allow') && (!hasMic || micPolicy === 'allow')) {
                    return originalGetUserMedia.call(navigator.mediaDevices, constraints);
                }

                // 'prompt'
                return new Promise((resolve, reject) => {
                    let capName = "Hardware API Access";
                    if (hasCamera && hasMic) capName = "Camera & Microphone Access";
                    else if (hasCamera) capName = "Camera Access";
                    else if (hasMic) capName = "Microphone Access";

                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        papyr.watt.triggerWattPrompt(capName, () => {
                            originalGetUserMedia.call(navigator.mediaDevices, constraints)
                                .then(resolve)
                                .catch(reject);
                        }, () => {
                            reject(new DOMException("Permission denied by user through WATT.", "NotAllowedError"));
                        });
                    } else {
                        originalGetUserMedia.call(navigator.mediaDevices, constraints)
                            .then(resolve)
                            .catch(reject);
                    }
                });
            };
        }

        // 3. Notification API Interception
        if (typeof window !== 'undefined' && window.Notification) {
            const OriginalNotification = window.Notification;
            const originalRequestPermission = OriginalNotification.requestPermission;
            const handler = {
                construct(target, args) {
                    const policy = policies.notifications;
                    if (policy === 'deny') {
                        console.warn("Notification blocked by Papyr security policy.");
                        return {};
                    }
                    if (policy === 'allow' || target.permission === 'granted') {
                        return new target(...args);
                    }
                    // For prompt
                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        papyr.watt.triggerWattPrompt("Notifications", () => {
                            originalRequestPermission.call(target).then(perm => {
                                if (perm === 'granted') {
                                    new target(...args);
                                }
                            });
                        }, () => {});
                    } else {
                        return new target(...args);
                    }
                    return {};
                },
                get(target, prop) {
                    if (prop === 'requestPermission') {
                        return function(callback) {
                            const policy = policies.notifications;
                            if (policy === 'deny') {
                                if (callback) callback('denied');
                                return Promise.resolve('denied');
                            }
                            if (policy === 'allow') {
                                return originalRequestPermission.call(target, callback);
                            }
                            return new Promise((resolve) => {
                                if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                                    papyr.watt.triggerWattPrompt("Notifications", () => {
                                        originalRequestPermission.call(target)
                                            .then(perm => {
                                                if (callback) callback(perm);
                                                resolve(perm);
                                            })
                                            .catch(() => {
                                                if (callback) callback('default');
                                                resolve('default');
                                            });
                                    }, () => {
                                        if (callback) callback('denied');
                                        resolve('denied');
                                    });
                                } else {
                                    originalRequestPermission.call(target).then(perm => {
                                        if (callback) callback(perm);
                                        resolve(perm);
                                    });
                                }
                            });
                        };
                    }
                    return Reflect.get(target, prop);
                }
            };
            window.Notification = new Proxy(OriginalNotification, handler);
        }

        // 4. Clipboard API Interception
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            const originalReadText = navigator.clipboard.readText;
            const originalWriteText = navigator.clipboard.writeText;
            
            navigator.clipboard.readText = function() {
                const policy = policies.clipboard;
                if (policy === 'deny') {
                    return Promise.reject(new DOMException("Clipboard read denied by Papyr security policy.", "NotAllowedError"));
                }
                if (policy === 'allow') {
                    return originalReadText.call(navigator.clipboard);
                }
                return new Promise((resolve, reject) => {
                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        papyr.watt.triggerWattPrompt("Clipboard Read", () => {
                            originalReadText.call(navigator.clipboard).then(resolve).catch(reject);
                        }, () => {
                            reject(new DOMException("Clipboard read denied by user through WATT.", "NotAllowedError"));
                        });
                    } else {
                        originalReadText.call(navigator.clipboard).then(resolve).catch(reject);
                    }
                });
            };

            navigator.clipboard.writeText = function(text) {
                const policy = policies.clipboard;
                if (policy === 'deny') {
                    return Promise.reject(new DOMException("Clipboard write denied by Papyr security policy.", "NotAllowedError"));
                }
                if (policy === 'allow') {
                    return originalWriteText.call(navigator.clipboard, text);
                }
                return new Promise((resolve, reject) => {
                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        papyr.watt.triggerWattPrompt("Clipboard Write", () => {
                            originalWriteText.call(navigator.clipboard, text).then(resolve).catch(reject);
                        }, () => {
                            reject(new DOMException("Clipboard write denied by user through WATT.", "NotAllowedError"));
                        });
                    } else {
                        originalWriteText.call(navigator.clipboard, text).then(resolve).catch(reject);
                    }
                });
            };
        }

        // 5. Bluetooth API Interception
        if (typeof navigator !== 'undefined' && navigator.bluetooth) {
            const originalRequestDevice = navigator.bluetooth.requestDevice;
            navigator.bluetooth.requestDevice = function(options) {
                const policy = policies.bluetooth;
                if (policy === 'deny') {
                    return Promise.reject(new DOMException("Bluetooth access denied by Papyr security policy.", "NotAllowedError"));
                }
                if (policy === 'allow') {
                    return originalRequestDevice.call(navigator.bluetooth, options);
                }
                return new Promise((resolve, reject) => {
                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        papyr.watt.triggerWattPrompt("Bluetooth Access", () => {
                            originalRequestDevice.call(navigator.bluetooth, options).then(resolve).catch(reject);
                        }, () => {
                            reject(new DOMException("Bluetooth access denied by user through WATT.", "NotAllowedError"));
                        });
                    } else {
                        originalRequestDevice.call(navigator.bluetooth, options).then(resolve).catch(reject);
                    }
                });
            };
        }

        // 6. USB API Interception
        if (typeof navigator !== 'undefined' && navigator.usb) {
            const originalRequestDevice = navigator.usb.requestDevice;
            navigator.usb.requestDevice = function(options) {
                const policy = policies.usb;
                if (policy === 'deny') {
                    return Promise.reject(new DOMException("USB access denied by Papyr security policy.", "NotAllowedError"));
                }
                if (policy === 'allow') {
                    return originalRequestDevice.call(navigator.usb, options);
                }
                return new Promise((resolve, reject) => {
                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                        papyr.watt.triggerWattPrompt("USB Access", () => {
                            originalRequestDevice.call(navigator.usb, options).then(resolve).catch(reject);
                        }, () => {
                            reject(new DOMException("USB access denied by user through WATT.", "NotAllowedError"));
                        });
                    } else {
                        originalRequestDevice.call(navigator.usb, options).then(resolve).catch(reject);
                    }
                });
            };
        }

        // 7. Sensor API Interception
        if (typeof window !== 'undefined') {
            const interceptPermission = (obj, prop, name) => {
                if (obj && typeof obj[prop] === 'function') {
                    const original = obj[prop];
                    obj[prop] = function(...args) {
                        const policy = policies.sensors;
                        if (policy === 'deny') {
                            return Promise.resolve('denied');
                        }
                        if (policy === 'allow') {
                            return original.apply(this, args);
                        }
                        return new Promise((resolve, reject) => {
                            if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                                papyr.watt.triggerWattPrompt(name, () => {
                                    original.apply(this, args).then(resolve).catch(reject);
                                }, () => {
                                    resolve('denied');
                                });
                            } else {
                                original.apply(this, args).then(resolve).catch(reject);
                            }
                        });
                    };
                }
            };
            
            if (window.DeviceOrientationEvent) {
                interceptPermission(window.DeviceOrientationEvent, 'requestPermission', "Motion Sensors");
            }
            if (window.DeviceMotionEvent) {
                interceptPermission(window.DeviceMotionEvent, 'requestPermission', "Motion Sensors");
            }

            const sensorsList = ['Accelerometer', 'Gyroscope', 'Magnetometer', 'AmbientLightSensor'];
            sensorsList.forEach(sensorName => {
                if (window[sensorName]) {
                    const OriginalSensor = window[sensorName];
                    const handler = {
                        construct(target, args) {
                            const policy = policies.sensors;
                            if (policy === 'deny') {
                                throw new DOMException(`${sensorName} blocked by Papyr security policy.`, "SecurityError");
                            }
                            if (policy === 'allow') {
                                return new target(...args);
                            }
                            const instance = new target(...args);
                            const originalStart = instance.start;
                            instance.start = function() {
                                return new Promise((resolve, reject) => {
                                    if (papyr.watt && typeof papyr.watt.triggerWattPrompt === 'function') {
                                        papyr.watt.triggerWattPrompt(`${sensorName} Access`, () => {
                                            try {
                                                originalStart.call(instance);
                                                resolve();
                                            } catch (err) { reject(err); }
                                        }, () => {
                                            reject(new DOMException("Sensor access denied by user through WATT.", "NotAllowedError"));
                                        });
                                    } else {
                                        try {
                                            originalStart.call(instance);
                                            resolve();
                                        } catch (err) { reject(err); }
                                    }
                                });
                            };
                            return instance;
                        }
                    };
                    window[sensorName] = new Proxy(OriginalSensor, handler);
                }
            });
        }

        // 8. Network Request Interception (fetch and XMLHttpRequest)
        if (typeof window !== 'undefined') {
            const originalFetch = window.fetch;
            
            const trackingProviders = {
                'google-analytics.com': { name: 'Google Analytics', purpose: 'visitor tracking & site analytics', optOut: true },
                'google-analytics': { name: 'Google Analytics', purpose: 'visitor tracking & site analytics', optOut: true },
                'doubleclick.net': { name: 'DoubleClick', purpose: 'personalized advertising', optOut: true },
                'facebook.net': { name: 'Meta Pixel', purpose: 'conversion tracking & ads targeting', optOut: true },
                'fbevents.js': { name: 'Meta Pixel', purpose: 'conversion tracking & ads targeting', optOut: true },
                'mixpanel.com': { name: 'Mixpanel', purpose: 'user behavior analytics', optOut: true },
                'segment.io': { name: 'Segment', purpose: 'customer data platform mapping', optOut: true },
                'segment.com': { name: 'Segment', purpose: 'customer data platform mapping', optOut: true }
            };

            const detectTrackingInfo = (url) => {
                if (!url || typeof url !== 'string') return null;
                const lowerUrl = url.toLowerCase();
                for (const [key, provider] of Object.entries(trackingProviders)) {
                    if (lowerUrl.includes(key)) {
                        return { ...provider, url };
                    }
                }
                return null;
            };

            window.fetch = function(input, init) {
                const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
                const trackingInfo = detectTrackingInfo(url);
                
                if (trackingInfo && papyr.security && papyr.security.currentTier !== 'none') {
                    if (papyr.security.hasConsent) {
                        return originalFetch.apply(this, arguments);
                    }
                    
                    return new Promise((resolve, reject) => {
                        if (papyr.watt && typeof papyr.watt.triggerTrackingPrompt === 'function') {
                            papyr.watt.triggerTrackingPrompt(trackingInfo, () => {
                                resolve(originalFetch.apply(this, arguments));
                            }, (optOutSelected) => {
                                if (optOutSelected && trackingInfo.optOut) {
                                    if (trackingInfo.name === 'Google Analytics') {
                                        window['ga-disable-UA-*'] = true;
                                        window['ga-disable-G-*'] = true;
                                    }
                                }
                                reject(new TypeError("Request blocked by user tracking preferences through WATT."));
                            });
                        } else {
                            if (papyr.security.currentTier === 'high') {
                                reject(new TypeError("Request blocked by high-privacy security policy."));
                            } else {
                                resolve(originalFetch.apply(this, arguments));
                            }
                        }
                    });
                }
                
                return originalFetch.apply(this, arguments);
            };

            const OriginalXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = function() {
                const xhr = new OriginalXHR();
                const originalOpen = xhr.open;
                const originalSend = xhr.send;
                let isTrackingRequest = false;
                let trackingInfo = null;

                xhr.open = function(method, url, ...rest) {
                    trackingInfo = detectTrackingInfo(url);
                    if (trackingInfo && papyr.security && papyr.security.currentTier !== 'none' && !papyr.security.hasConsent) {
                        isTrackingRequest = true;
                    }
                    return originalOpen.apply(this, arguments);
                };

                xhr.send = function(body) {
                    if (isTrackingRequest) {
                        if (papyr.watt && typeof papyr.watt.triggerTrackingPrompt === 'function') {
                            papyr.watt.triggerTrackingPrompt(trackingInfo, () => {
                                originalSend.call(xhr, body);
                            }, (optOutSelected) => {
                                if (optOutSelected && trackingInfo.optOut) {
                                    if (trackingInfo.name === 'Google Analytics') {
                                        window['ga-disable-UA-*'] = true;
                                        window['ga-disable-G-*'] = true;
                                    }
                                }
                                xhr.dispatchEvent(new Event('error'));
                            });
                            return;
                        } else if (papyr.security && papyr.security.currentTier === 'high') {
                            xhr.dispatchEvent(new Event('error'));
                            return;
                        }
                    }
                    return originalSend.apply(this, arguments);
                };

                return xhr;
            };
            window.XMLHttpRequest.prototype = OriginalXHR.prototype;
            Object.assign(window.XMLHttpRequest, OriginalXHR);
        }

        papyr.security = securityConfig;

        papyr.safeGet = (obj, key) => {
            if (!obj || typeof obj !== 'object') return undefined;
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                throw new Error("Security Violation: Unsafe property access");
            }
            return obj[key];
        };
    });

    // Install LocalStorage Interception
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem = function (key, val) {
            if (window.papyr && window.papyr.security && window.papyr.security.shouldSandboxStorage(key)) {
                if (key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
                    // eslint-disable-next-line security/detect-object-injection
                    tempStorage[key] = val;
                }
                return;
            }
            if (originalSetItem) originalSetItem(key, val);
        };

        localStorage.getItem = function (key) {
            if (window.papyr && window.papyr.security && window.papyr.security.shouldSandboxStorage(key)) {
                // eslint-disable-next-line security/detect-object-injection
                return (key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype' && Object.prototype.hasOwnProperty.call(tempStorage, key)) ? tempStorage[key] : null;
            }
            return originalGetItem ? originalGetItem(key) : null;
        };

        localStorage.removeItem = function (key) {
            if (window.papyr && window.papyr.security && window.papyr.security.shouldSandboxStorage(key)) {
                if (key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype' && Object.prototype.hasOwnProperty.call(tempStorage, key)) {
                    // eslint-disable-next-line security/detect-object-injection
                    delete tempStorage[key];
                }
                return;
            }
            if (originalRemoveItem) originalRemoveItem(key);
        };
    }
})();


// --- MODULE: core/reactivity.js ---
/**
 * PAPYR REACTIVITY SYSTEM
 * 
 * Auto-tracking reactive state variables and computed logic nodes.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    const pendingSubscribers = new Set();
    let isSchedulerScheduled = false;
    let autoKeyCounter = 0;

    const queueSubscriber = (sub, val) => {
        if (papyr.scheduler && typeof papyr.scheduler.schedule === 'function') {
            papyr.scheduler.schedule(() => {
                try {
                    sub(val);
                } catch (err) {
                    papyr.diagnostics.reportError(err);
                }
            }, 'normal');
        } else {
            pendingSubscribers.add({ sub, val });
            if (!isSchedulerScheduled) {
                isSchedulerScheduled = true;
                if (typeof requestAnimationFrame !== 'undefined') {
                    requestAnimationFrame(flushScheduler);
                } else {
                    setTimeout(flushScheduler, 0);
                }
            }
        }
    };

    const flushScheduler = () => {
        const subsToNotify = new Map();
        pendingSubscribers.forEach(({ sub, val }) => {
            subsToNotify.set(sub, val);
        });
        pendingSubscribers.clear();
        isSchedulerScheduled = false;
        
        subsToNotify.forEach((val, sub) => {
            try {
                sub(val);
            } catch (err) {
                papyr.diagnostics.reportError(err);
            }
        });
    };

    
    /**
     * Creates an auto-tracking reactive state variable.
     * 
     * @param {*} val Initial reactive state value
     * @returns {PapyrState} Reactive State accessor interface
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
        if (n._listeners) {
            const originalRemoveEventListener = n.removeEventListener;
            n._listeners.forEach(l => {
                try {
                    if (typeof originalRemoveEventListener === 'function') {
                        originalRemoveEventListener.call(n, l.event, l.handler, l.options);
                    }
                } catch(e) {}
            });
            n._listeners = [];
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

    class KalmanFilter {
        constructor(processNoise = 0.05, measurementNoise = 0.5) {
            this.q = processNoise;
            this.r = measurementNoise;
            this.p = 1.0;
            this.x = null;
            this.v = 0.0;
        }
        update(val, dt) {
            if (this.x === null) {
                this.x = val;
                return;
            }
            if (dt <= 0) dt = 0.016;
            this.x = this.x + this.v * dt;
            this.p = this.p + this.q;
            let k = this.p / (this.p + this.r);
            let diff = val - this.x;
            this.x = this.x + k * diff;
            this.v = this.v + k * (diff / dt - this.v);
            this.p = (1.0 - k) * this.p;
        }
        predict(dtAhead) {
            if (this.x === null) return 0;
            return this.x + this.v * dtAhead;
        }
    }

    class Predictor {
        constructor(val, options = {}) {
            this.options = options;
            this.filters = {};
            this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
            this.initialize(val);
        }
        initialize(val) {
            const q = this.options.processNoise || 0.05;
            const r = this.options.measurementNoise || 0.5;
            if (typeof val === 'number') {
                this.filters['root'] = new KalmanFilter(q, r);
            } else if (Array.isArray(val)) {
                val.forEach((item, index) => {
                    if (typeof item === 'number') {
                        this.filters[index] = new KalmanFilter(q, r);
                    }
                });
            } else if (val && typeof val === 'object') {
                Object.keys(val).forEach(key => {
                    if (typeof val[key] === 'number') {
                        this.filters[key] = new KalmanFilter(q, r);
                    }
                });
            }
        }
        update(newVal) {
            let now = typeof performance !== 'undefined' ? performance.now() : Date.now();
            let dt = (now - this.lastTime) / 1000.0;
            this.lastTime = now;
            const q = this.options.processNoise || 0.05;
            const r = this.options.measurementNoise || 0.5;

            if (typeof newVal === 'number') {
                if (!this.filters['root']) this.filters['root'] = new KalmanFilter(q, r);
                this.filters['root'].update(newVal, dt);
            } else if (Array.isArray(newVal)) {
                newVal.forEach((item, index) => {
                    if (typeof item === 'number') {
                        if (!this.filters[index]) this.filters[index] = new KalmanFilter(q, r);
                        this.filters[index].update(item, dt);
                    }
                });
            } else if (newVal && typeof newVal === 'object') {
                Object.keys(newVal).forEach(key => {
                    if (typeof newVal[key] === 'number') {
                        if (!this.filters[key]) this.filters[key] = new KalmanFilter(q, r);
                        this.filters[key].update(newVal[key], dt);
                    }
                });
            }
        }
        predict(dtAheadSeconds) {
            if (this.filters['root']) {
                return this.filters['root'].predict(dtAheadSeconds);
            }
            let keys = Object.keys(this.filters);
            if (keys.length === 0) return null;

            let isArray = false;
            for (let k of keys) {
                if (!isNaN(k)) {
                    isArray = true;
                    break;
                }
            }

            if (isArray) {
                let res = [];
                keys.forEach(k => {
                    res[k] = this.filters[k].predict(dtAheadSeconds);
                });
                return res;
            } else {
                let res = {};
                keys.forEach(k => {
                    res[k] = this.filters[k].predict(dtAheadSeconds);
                });
                return res;
            }
        }
    }

    papyr.state = (val, options = {}) => {
        let subscribers = new Set();
        let predictor = options.predictive ? new Predictor(val, options) : null;
        
        const storageKey = options.key || (options.persist ? `papyr_state_auto_${++autoKeyCounter}` : null);
        
        // Restore value on load if persist is true
        if (options.persist && storageKey && typeof localStorage !== 'undefined') {
            try {
                let storedVal = localStorage.getItem(storageKey);
                if (storedVal !== null) {
                    try {
                        val = JSON.parse(storedVal);
                    } catch (e) {
                        val = storedVal;
                    }
                }
            } catch (e) {
                console.warn("Storage Continuity Engine: Failed to read from localStorage:", e);
            }
        }

        const persistState = (newVal) => {
            if (options.persist && storageKey && typeof localStorage !== 'undefined') {
                try {
                    localStorage.setItem(storageKey, typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal));
                } catch (e) {
                    console.warn("Storage Continuity Engine: Failed to write to localStorage:", e);
                }
            }
        };

        let notify = () => {
            persistState(val);
            if (predictor) predictor.update(val);
            papyr.diagnostics.trackUpdate(stateObj, val, val);
            Array.from(subscribers).forEach(sub => {
                queueSubscriber(sub, val);
            });
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
                persistState(newVal);
                if (predictor) predictor.update(newVal);
                papyr.diagnostics.trackUpdate(stateObj, newVal, oldVal);
                Array.from(subscribers).forEach(sub => {
                    queueSubscriber(sub, newVal);
                });
                
                // Trigger hooks
                papyr.plugins.triggerHook('onUpdate', stateObj);
            },
            subscribe(sub) {
                subscribers.add(sub);
                sub(val);
                return () => subscribers.delete(sub);
            },
            predict(dtAheadMs) {
                if (predictor) {
                    const pred = predictor.predict(dtAheadMs / 1000.0);
                    return pred !== null ? pred : val;
                }
                return val;
            },
            get predicted() {
                return stateObj.predict(16);
            },
            dump() {
                return val;
            }
        };
        papyr.state.register(stateObj);
        return stateObj;
    };

    papyr.predictiveState = (val, options = {}) => {
        return papyr.state(val, { ...options, predictive: true });
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
     * @param {PapyrState} conditionState Reactive condition state to track
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
     * @param {PapyrState} arrayState Reactive state containing an array
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



// --- MODULE: core/router.js ---
/**
 * PAPYR ROUTER
 * Zero-configuration Hash SPA Router.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    let routes = [];
    let currentView = papyr.state(null);
    let pathParams = papyr.state({});

    const safeRouteRegex = (cleanPath) => {
        // Enforce route string format: must only contain alphanumeric, slash, colon, hyphen, underscore, dot, at-sign, tilde.
        // This prevents injection of backtracking metacharacters (e.g. *, +, ?, (, ), [, ], etc.)
        if (!/^[a-zA-Z0-9_/:.\-@~]*$/.test(cleanPath)) {
            throw new Error("Security Violation: Unsafe characters in route path pattern");
        }
        // eslint-disable-next-line security/detect-non-literal-regexp
        return new RegExp('^' + cleanPath.replace(/:\w+/g, '([^/]+)') + '$');
    };

    /**
     * Define a hash route.
     * @param {string} path Route path (e.g., "#/about", "#/user/:id")
     * @param {function|class} componentFn Component or Class to render
     */
    papyr.route = (path, componentFn) => {
        // Strip leading hash for internal regex matching
        let cleanPath = path.startsWith('#') ? path.substring(1) : path;
        routes.push({
            path: cleanPath,
            regex: safeRouteRegex(cleanPath),
            keys: (cleanPath.match(/:\w+/g) || []).map(k => k.slice(1)),
            componentFn
        });
        
        // Attach to runtime context for context export APIs
        papyr.runtime.routes = routes;
    };

    /**
     * Navigates to a specific path using hash.
     * @param {string} path Target URL hash path
     */
    papyr.navigate = (path) => {
        if (typeof window !== 'undefined') {
            window.location.hash = path.startsWith('#') ? path : '#' + path;
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('hashchange', () => {
            let currentPath = window.location.hash.slice(1) || '/';
            let matchFound = false;

            for (let route of routes) {
                let match = currentPath.match(route.regex);
                if (match) {
                    let params = {};
                    route.keys.forEach((key, index) => {
                        params[key] = match[index + 1];
                    });
                    pathParams.value = params;
                    currentView.value = route.componentFn;
                    matchFound = true;
                    break;
                }
            }
            if (!matchFound) {
                currentView.value = () => papyr.div("404 - Route Not Found");
            }
        });
    }

    /**
     * Global accessor for route parameters
     */
    papyr.useParams = () => pathParams;

    /**
     * Initializes the router and returns the reactive router container.
     */
    papyr.router = () => {
        if (typeof window !== 'undefined' && routes.length > 0 && !currentView.value) {
            window.dispatchEvent(new Event('hashchange')); // Initial load
        }
        
        let routeNode = papyr.if(
            currentView,
            () => {
                let Component = currentView.value;
                if (Component && Component.prototype && typeof papyr.component === 'function' && Component.prototype instanceof papyr.component) {
                    return new Component().render();
                }
                if (typeof Component === 'function') {
                    return Component();
                }
                return papyr.div();
            },
            () => papyr.div()
        );

        // Persistent Workspace Check
        if (typeof document !== 'undefined') {
            // Wait for DOM to paint, then check if layout engine created a shell
            setTimeout(() => {
                let mainShell = document.querySelector('.papyr-main-content');
                if (mainShell && !mainShell.contains(routeNode)) {
                    mainShell.innerHTML = '';
                    mainShell.appendChild(routeNode);
                }
            }, 0);
        }

        return routeNode;
    };

    // Clean URL Page System Subsystem
    let pageRoutes = [];
    let currentPageView = papyr.state(null);
    let pagePathParams = papyr.state({});

    const matchPageRoute = () => {
        if (typeof window === 'undefined') return;
        let currentPath = window.location.pathname || '/';
        let matchFound = false;

        for (let route of pageRoutes) {
            let match = currentPath.match(route.regex);
            if (match) {
                let params = {};
                route.keys.forEach((key, index) => {
                    params[key] = match[index + 1];
                });
                pagePathParams.value = params;
                currentPageView.value = route.componentFn;
                matchFound = true;
                break;
            }
        }
        if (!matchFound) {
            currentPageView.value = () => papyr.div("404 - Page Not Found");
        }
    };

    papyr.page = (path, componentFn, options = {}) => {
        if (typeof path === 'undefined') {
            return papyr.pageRouter();
        }

        let cleanPath = path;
        pageRoutes.push({
            path: cleanPath,
            regex: safeRouteRegex(cleanPath),
            keys: (cleanPath.match(/:\w+/g) || []).map(k => k.slice(1)),
            componentFn
        });

        // Register rendering mode in PSSR registry if provided
        if (options && options.mode) {
            if (papyr.pssr && typeof papyr.pssr.setRouteMode === 'function') {
                papyr.pssr.setRouteMode(cleanPath, options.mode);
            } else {
                // Queue for registration once PSSR is initialized
                if (!papyr._pendingRouteModes) papyr._pendingRouteModes = [];
                papyr._pendingRouteModes.push({ path: cleanPath, mode: options.mode });
            }
        }

        if (typeof window !== 'undefined' && pageRoutes.length > 0 && !currentPageView.value) {
            setTimeout(matchPageRoute, 10);
        }
    };

    papyr.page.navigate = (path) => {
        if (typeof window !== 'undefined') {
            window.history.pushState(null, '', path);
            matchPageRoute();
        }
    };

    papyr.usePageParams = () => pagePathParams;

    papyr.pageRouter = () => {
        if (typeof window !== 'undefined' && pageRoutes.length > 0 && !currentPageView.value) {
            matchPageRoute();
        }

        let routeNode = papyr.if(
            currentPageView,
            () => {
                let Component = currentPageView.value;
                if (Component && Component.prototype && typeof papyr.component === 'function' && Component.prototype instanceof papyr.component) {
                    return new Component().render();
                }
                if (typeof Component === 'function') {
                    return Component();
                }
                return papyr.div();
            },
            () => papyr.div()
        );

        if (typeof document !== 'undefined') {
            setTimeout(() => {
                let mainShell = document.querySelector('.papyr-main-content');
                if (mainShell && !mainShell.contains(routeNode)) {
                    mainShell.innerHTML = '';
                    mainShell.appendChild(routeNode);
                }
            }, 0);
        }

        return routeNode;
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('popstate', matchPageRoute);
        window.addEventListener('click', (e) => {
            let link = e.target.closest('a');
            if (link && link.href && link.origin === window.location.origin && !link.hash && !link.getAttribute('download') && link.target !== '_blank') {
                e.preventDefault();
                papyr.page.navigate(link.pathname + link.search);
            }
        });
    }
});


// --- MODULE: core/math.js ---
/**
 * PAPYR MATHEMATICAL LOGIC SYSTEM
 * 
 * Auto-updating computed mathematical operations accepting standard numbers or reactive state nodes.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    const flatten = (arr) => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
    const getVal = (x) => {
        let v = x && typeof x.subscribe === 'function' ? x.value : x;
        if (Array.isArray(v)) {
            return v.reduce((sum, item) => sum + Number(item || 0), 0);
        }
        return Number(v || 0);
    };

    papyr.math = {
        /**
         * Calculates reactive sum of multiple states or numbers.
         */
        sum: (...args) => papyr.computed(() => {
            return flatten(args).reduce((acc, cur) => acc + getVal(cur), 0);
        }),

        /**
         * Calculates reactive subtraction of two states or numbers.
         */
        sub: (a, b) => papyr.computed(() => {
            return getVal(a) - getVal(b);
        }),

        /**
         * Calculates reactive product of multiple states or numbers.
         */
        mul: (...args) => papyr.computed(() => {
            let flat = flatten(args);
            if (flat.length === 0) return 0;
            return flat.reduce((acc, cur) => {
                let v = cur && typeof cur.subscribe === 'function' ? cur.value : cur;
                if (Array.isArray(v)) {
                    return acc * v.reduce((p, item) => p * Number(item === undefined || item === null ? 1 : item), 1);
                }
                return acc * (v === undefined || v === null ? 1 : Number(v));
            }, 1);
        }),

        /**
         * Calculates reactive division of two states or numbers.
         */
        div: (a, b) => papyr.computed(() => {
            let denominator = getVal(b);
            if (denominator === 0) return 0;
            return getVal(a) / denominator;
        }),

        /**
         * Calculates reactive average of multiple states or numbers.
         */
        avg: (...args) => papyr.computed(() => {
            let flat = flatten(args);
            if (flat.length === 0) return 0;
            let sumVal = flat.reduce((acc, cur) => acc + getVal(cur), 0);
            return sumVal / flat.length;
        }),

        /**
         * Calculates reactive percentage of a value inside a total.
         */
        percent: (val, total) => papyr.computed(() => {
            let t = getVal(total);
            if (t === 0) return 0;
            return (getVal(val) / t) * 100;
        }),

        /**
         * Calculates reactive rounded values.
         */
        round: (val, decimals = 0) => papyr.computed(() => {
            let v = getVal(val);
            let d = getVal(decimals);
            let factor = Math.pow(10, d);
            return Math.round(v * factor) / factor;
        })
    };
});


// --- MODULE: core/db.js ---
/**
 * PAPYR DATA SYSTEM (Unified DB API)
 * Seamlessly integrates LocalStorage, SessionStorage, IndexedDB, and SQLite endpoints.
 * Updated with transactional granular CRUD capabilities.
 */

coreInitializers.push((papyr) => {

    const getDB = (collectionName) => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) return reject(new Error("IndexedDB not supported"));
            const req = window.indexedDB.open("papyr_database");
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(collectionName)) {
                    const newVer = db.version + 1;
                    db.close();
                    const reqUp = window.indexedDB.open("papyr_database", newVer);
                    reqUp.onupgradeneeded = (ev) => {
                        ev.target.result.createObjectStore(collectionName, { keyPath: "id" });
                    };
                    reqUp.onsuccess = (ev) => {
                        resolve(ev.target.result);
                    };
                    reqUp.onerror = (err) => reject(err);
                } else {
                    resolve(db);
                }
            };
            req.onerror = (err) => reject(err);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(collectionName)) {
                    db.createObjectStore(collectionName, { keyPath: "id" });
                }
            };
        });
    };

    let defaultEngine = 'local';
    papyr.db = (collectionName, engine) => {
        const selectedEngine = engine || defaultEngine;

        // Engine Drivers with fully granular transaction-safe CRUD methods
        const drivers = {
            'local': {
                get: () => {
                    try {
                        let val = localStorage.getItem(`papyr_db_${collectionName}`);
                        return val ? JSON.parse(val) : [];
                    } catch (e) {
                        console.error("PapyrDB [local] get error:", e);
                        return [];
                    }
                },
                insert: (item) => {
                    try {
                        const items = drivers.local.get();
                        items.push(item);
                        localStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [local] insert error:", e);
                    }
                },
                update: (id, updates) => {
                    try {
                        const items = drivers.local.get().map(item =>
                            item.id === id ? { ...item, ...updates } : item
                        );
                        localStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [local] update error:", e);
                    }
                },
                delete: (id) => {
                    try {
                        const items = drivers.local.get().filter(item => item.id !== id);
                        localStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [local] delete error:", e);
                    }
                },
                clear: () => {
                    try {
                        localStorage.removeItem(`papyr_db_${collectionName}`);
                    } catch (e) {
                        console.error("PapyrDB [local] clear error:", e);
                    }
                }
            },
            'session': {
                get: () => {
                    try {
                        let val = sessionStorage.getItem(`papyr_db_${collectionName}`);
                        return val ? JSON.parse(val) : [];
                    } catch (e) {
                        console.error("PapyrDB [session] get error:", e);
                        return [];
                    }
                },
                insert: (item) => {
                    try {
                        const items = drivers.session.get();
                        items.push(item);
                        sessionStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [session] insert error:", e);
                    }
                },
                update: (id, updates) => {
                    try {
                        const items = drivers.session.get().map(item =>
                            item.id === id ? { ...item, ...updates } : item
                        );
                        sessionStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [session] update error:", e);
                    }
                },
                delete: (id) => {
                    try {
                        const items = drivers.session.get().filter(item => item.id !== id);
                        sessionStorage.setItem(`papyr_db_${collectionName}`, JSON.stringify(items));
                    } catch (e) {
                        console.error("PapyrDB [session] delete error:", e);
                    }
                },
                clear: () => {
                    try {
                        sessionStorage.removeItem(`papyr_db_${collectionName}`);
                    } catch (e) {
                        console.error("PapyrDB [session] clear error:", e);
                    }
                }
            },
            'indexeddb': {
                getAsync: () => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readonly");
                                const store = tx.objectStore(collectionName);
                                const getReq = store.getAll();
                                getReq.onsuccess = () => {
                                    db.close();
                                    resolve(getReq.result || []);
                                };
                                getReq.onerror = () => {
                                    db.close();
                                    resolve([]);
                                };
                            } catch (err) {
                                db.close();
                                resolve([]);
                            }
                        }).catch(() => resolve([]));
                    });
                },
                insertAsync: (item) => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readwrite");
                                const store = tx.objectStore(collectionName);
                                store.put(item).onsuccess = () => {
                                    db.close();
                                    resolve();
                                };
                                store.put(item).onerror = () => {
                                    db.close();
                                    resolve();
                                };
                            } catch (err) {
                                console.error("PapyrDB [indexeddb] insert error:", err);
                                db.close();
                                resolve();
                            }
                        }).catch(() => resolve());
                    });
                },
                updateAsync: (id, updates) => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readwrite");
                                const store = tx.objectStore(collectionName);
                                const getReq = store.get(id);
                                getReq.onsuccess = () => {
                                    const current = getReq.result;
                                    if (current) {
                                        const updated = { ...current, ...updates };
                                        store.put(updated).onsuccess = () => {
                                            db.close();
                                            resolve();
                                        };
                                        store.put(updated).onerror = () => {
                                            db.close();
                                            resolve();
                                        };
                                    } else {
                                        db.close();
                                        resolve();
                                    }
                                };
                                getReq.onerror = () => {
                                    db.close();
                                    resolve();
                                };
                            } catch (err) {
                                console.error("PapyrDB [indexeddb] update error:", err);
                                db.close();
                                resolve();
                            }
                        }).catch(() => resolve());
                    });
                },
                deleteAsync: (id) => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readwrite");
                                const store = tx.objectStore(collectionName);
                                store.delete(id).onsuccess = () => {
                                    db.close();
                                    resolve();
                                };
                                store.delete(id).onerror = () => {
                                    db.close();
                                    resolve();
                                };
                            } catch (err) {
                                console.error("PapyrDB [indexeddb] delete error:", err);
                                db.close();
                                resolve();
                            }
                        }).catch(() => resolve());
                    });
                },
                clearAsync: () => {
                    return new Promise((resolve) => {
                        getDB(collectionName).then(db => {
                            try {
                                const tx = db.transaction(collectionName, "readwrite");
                                const store = tx.objectStore(collectionName);
                                store.clear().onsuccess = () => {
                                    db.close();
                                    resolve();
                                };
                                store.clear().onerror = () => {
                                    db.close();
                                    resolve();
                                };
                            } catch (err) {
                                console.error("PapyrDB [indexeddb] clear error:", err);
                                db.close();
                                resolve();
                            }
                        }).catch(() => resolve());
                    });
                }
            },
            'sqlite': {
                getAsync: () => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`CREATE TABLE IF NOT EXISTS ${collectionName} (id TEXT PRIMARY KEY, data TEXT)`);
                                    tx.executeSql(`SELECT data FROM ${collectionName}`, [], (tx, results) => {
                                        const items = [];
                                        for (let i = 0; i < results.rows.length; i++) {
                                            try {
                                                items.push(JSON.parse(results.rows.item(i).data));
                                            } catch (e) { }
                                        }
                                        resolve(items);
                                    }, () => resolve([]));
                                }, () => resolve([]));
                            } catch (e) { resolve([]); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                db.run(`CREATE TABLE IF NOT EXISTS ${collectionName} (id TEXT PRIMARY KEY, data TEXT)`);
                                const res = db.exec(`SELECT data FROM ${collectionName}`);
                                const items = [];
                                if (res && res[0] && res[0].values) {
                                    res[0].values.forEach(row => {
                                        try { items.push(JSON.parse(row[0])); } catch (e) { }
                                    });
                                }
                                resolve(items);
                            } catch (e) { resolve([]); }
                        } else {
                            resolve([]);
                        }
                    });
                },
                insertAsync: (item) => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`CREATE TABLE IF NOT EXISTS ${collectionName} (id TEXT PRIMARY KEY, data TEXT)`);
                                    tx.executeSql(`INSERT OR REPLACE INTO ${collectionName} (id, data) VALUES (?, ?)`, [item.id, JSON.stringify(item)]);
                                }, () => resolve(), () => resolve());
                            } catch (e) { resolve(); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                db.run(`CREATE TABLE IF NOT EXISTS ${collectionName} (id TEXT PRIMARY KEY, data TEXT)`);
                                db.run(`INSERT OR REPLACE INTO ${collectionName} (id, data) VALUES (?, ?)`, [item.id, JSON.stringify(item)]);
                                resolve();
                            } catch (e) { resolve(); }
                        } else {
                            resolve();
                        }
                    });
                },
                updateAsync: (id, updates) => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`SELECT data FROM ${collectionName} WHERE id = ?`, [id], (tx, results) => {
                                        if (results.rows.length > 0) {
                                            try {
                                                const current = JSON.parse(results.rows.item(0).data);
                                                const updated = { ...current, ...updates };
                                                tx.executeSql(`INSERT OR REPLACE INTO ${collectionName} (id, data) VALUES (?, ?)`, [id, JSON.stringify(updated)], () => resolve());
                                            } catch (e) { resolve(); }
                                        } else {
                                            resolve();
                                        }
                                    }, () => resolve());
                                }, () => resolve());
                            } catch (e) { resolve(); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                const res = db.exec(`SELECT data FROM ${collectionName} WHERE id = '${id}'`);
                                if (res && res[0] && res[0].values && res[0].values[0]) {
                                    const current = JSON.parse(res[0].values[0][0]);
                                    const updated = { ...current, ...updates };
                                    db.run(`INSERT OR REPLACE INTO ${collectionName} (id, data) VALUES (?, ?)`, [id, JSON.stringify(updated)]);
                                }
                                resolve();
                            } catch (e) { resolve(); }
                        } else {
                            resolve();
                        }
                    });
                },
                deleteAsync: (id) => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`DELETE FROM ${collectionName} WHERE id = ?`, [id]);
                                }, () => resolve(), () => resolve());
                            } catch (e) { resolve(); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                db.run(`DELETE FROM ${collectionName} WHERE id = ?`, [id]);
                                resolve();
                            } catch (e) { resolve(); }
                        } else {
                            resolve();
                        }
                    });
                },
                clearAsync: () => {
                    return new Promise((resolve) => {
                        if (typeof window !== 'undefined' && window.sqlitePlugin) {
                            try {
                                const db = window.sqlitePlugin.openDatabase({ name: 'papyr.db', location: 'default' });
                                db.transaction((tx) => {
                                    tx.executeSql(`DELETE FROM ${collectionName}`);
                                }, () => resolve(), () => resolve());
                            } catch (e) { resolve(); }
                        } else if (typeof window !== 'undefined' && window.SQL && window.papyrSQLiteDB) {
                            try {
                                const db = window.papyrSQLiteDB;
                                db.run(`DELETE FROM ${collectionName}`);
                                resolve();
                            } catch (e) { resolve(); }
                        } else {
                            resolve();
                        }
                    });
                }
            }
        };

        // Dynamically instantiate registered custom drivers for this collection
        Object.keys(papyr.db.drivers).forEach(name => {
            try {
                drivers[name] = papyr.db.drivers[name](collectionName);
            } catch (e) {
                console.error(`Failed to initialize custom db driver ${name}:`, e);
            }
        });

        const isAsync = selectedEngine !== 'local' && selectedEngine !== 'session' && drivers[selectedEngine];
        // eslint-disable-next-line security/detect-object-injection
        const driver = (selectedEngine && selectedEngine !== '__proto__' && selectedEngine !== 'constructor' && selectedEngine !== 'prototype' && Object.prototype.hasOwnProperty.call(drivers, selectedEngine)) ? drivers[selectedEngine] : drivers['local'];

        let state = papyr.state([]);
        let watchers = [];

        // Async Init
        if (isAsync) {
            driver.getAsync().then(data => {
                state.value = data;
                watchers.forEach(cb => cb(data));
            });
        } else {
            state.value = driver.get();
        }

        const notifyWatchers = () => {
            watchers.forEach(cb => cb(state.value));
        };

        return {
            state,

            list() {
                return state.value;
            },

            async listAsync() {
                if (isAsync) {
                    const data = await driver.getAsync();
                    state.value = data;
                    return data;
                }
                return state.value;
            },

            find(id) {
                return state.value.find(record => record.id === id);
            },

            async findAsync(id) {
                if (isAsync) {
                    const data = await driver.getAsync();
                    state.value = data;
                }
                return state.value.find(record => record.id === id);
            },

            query(options = {}) {
                let result = [...state.value];
                if (typeof options.filter === 'function') {
                    result = result.filter(options.filter);
                } else if (options.filter && typeof options.filter === 'object') {
                    result = result.filter(item =>
                        Object.entries(options.filter).every(([k, v]) => {
                            if (k === '__proto__' || k === 'constructor' || k === 'prototype') return false;
                            return Object.prototype.hasOwnProperty.call(item, k) ? item[k] === v : false;
                        })
                    );
                }
                if (options.sort) {
                    const { field, direction = 'asc' } = options.sort;
                    result.sort((a, b) => {
                        if (field === '__proto__' || field === 'constructor' || field === 'prototype') return 0;
                        let valA = Object.prototype.hasOwnProperty.call(a, field) ? a[field] : undefined;
                        let valB = Object.prototype.hasOwnProperty.call(b, field) ? b[field] : undefined;
                        if (typeof valA === 'string') valA = valA.toLowerCase();
                        if (typeof valB === 'string') valB = valB.toLowerCase();
                        if (valA < valB) return direction === 'asc' ? -1 : 1;
                        if (valA > valB) return direction === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
                const offset = options.offset || 0;
                const limit = options.limit !== undefined ? options.limit : result.length;
                return result.slice(offset, offset + limit);
            },

            async queryAsync(options = {}) {
                if (isAsync) {
                    const data = await driver.getAsync();
                    state.value = data;
                }
                return this.query(options);
            },

            insert(item) {
                let record = { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString(), ...item };
                state.value = [...state.value, record];
                if (isAsync) {
                    driver.insertAsync(record).catch(e => console.error("PapyrDBError:", e));
                } else {
                    driver.insert(record);
                }
                notifyWatchers();
                return record;
            },

            async insertAsync(item) {
                let record = { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString(), ...item };
                state.value = [...state.value, record];
                if (isAsync) {
                    await driver.insertAsync(record);
                } else {
                    driver.insert(record);
                }
                notifyWatchers();
                return record;
            },

            update(id, data) {
                state.value = state.value.map(record =>
                    record.id === id ? { ...record, ...data, updatedAt: new Date().toISOString() } : record
                );
                const updated = this.find(id);
                if (updated) {
                    if (isAsync) {
                        driver.updateAsync(id, updated).catch(e => console.error("PapyrDBError:", e));
                    } else {
                        driver.update(id, updated);
                    }
                }
                notifyWatchers();
            },

            async updateAsync(id, data) {
                state.value = state.value.map(record =>
                    record.id === id ? { ...record, ...data, updatedAt: new Date().toISOString() } : record
                );
                const updated = this.find(id);
                if (updated) {
                    if (isAsync) {
                        await driver.updateAsync(id, updated);
                    } else {
                        driver.update(id, updated);
                    }
                }
                notifyWatchers();
            },

            delete(id) {
                state.value = state.value.filter(record => record.id !== id);
                if (isAsync) {
                    driver.deleteAsync(id).catch(e => console.error("PapyrDBError:", e));
                } else {
                    driver.delete(id);
                }
                notifyWatchers();
            },

            async deleteAsync(id) {
                state.value = state.value.filter(record => record.id !== id);
                if (isAsync) {
                    await driver.deleteAsync(id);
                } else {
                    driver.delete(id);
                }
                notifyWatchers();
            },

            clear() {
                state.value = [];
                if (isAsync) {
                    driver.clearAsync().catch(e => console.error("PapyrDBError:", e));
                } else {
                    driver.clear();
                }
                notifyWatchers();
            },

            async clearAsync() {
                state.value = [];
                if (isAsync) {
                    await driver.clearAsync();
                } else {
                    driver.clear();
                }
                notifyWatchers();
            },

            watch(callback) {
                watchers.push(callback);
                callback(state.value); // immediate execution
                return () => watchers = watchers.filter(cb => cb !== callback); // unsubscribe
            },

            async transaction(callback) {
                const snapshot = JSON.stringify(state.value);
                const tx = {
                    _ops: [],
                    insert(item) {
                        let record = { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString(), ...item };
                        this._ops.push({ type: 'insert', record });
                        return record;
                    },
                    update(id, data) {
                        this._ops.push({ type: 'update', id, data });
                    },
                    delete(id) {
                        this._ops.push({ type: 'delete', id });
                    }
                };
                
                try {
                    await callback(tx);
                    for (const op of tx._ops) {
                        if (op.type === 'insert') {
                            if (isAsync) {
                                await driver.insertAsync(op.record);
                            } else {
                                driver.insert(op.record);
                            }
                            state.value = [...state.value, op.record];
                        } else if (op.type === 'update') {
                            state.value = state.value.map(record =>
                                record.id === op.id ? { ...record, ...op.data, updatedAt: new Date().toISOString() } : record
                            );
                            const updated = state.value.find(record => record.id === op.id);
                            if (updated) {
                                if (isAsync) {
                                    await driver.updateAsync(op.id, updated);
                                } else {
                                    driver.update(op.id, updated);
                                }
                            }
                        } else if (op.type === 'delete') {
                            state.value = state.value.filter(record => record.id !== op.id);
                            if (isAsync) {
                                await driver.deleteAsync(op.id);
                            } else {
                                driver.delete(op.id);
                            }
                        }
                    }
                    notifyWatchers();
                } catch (err) {
                    state.value = JSON.parse(snapshot);
                    notifyWatchers();
                    throw err;
                }
            }
        };
    };

    papyr.db.drivers = {};
    papyr.db.registerDriver = (name, driverFactory) => {
        if (name === '__proto__' || name === 'constructor' || name === 'prototype') return;
        papyr.db.drivers[name] = driverFactory;
    };
    papyr.db.use = (engineName) => {
        if (engineName) {
            defaultEngine = engineName.toLowerCase();
        }
        return papyr.db;
    };

    // Upgraded storage helper function with dual call signature compatibility
    const storageFunc = (key, val) => {
        if (typeof localStorage === 'undefined') return null;
        if (typeof val === 'undefined') {
            let data = localStorage.getItem(key);
            if (data === null || data === undefined) return null;
            try { return JSON.parse(data); } catch (e) { return data; }
        }
        if (val === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
    };
    storageFunc.set = (k, v) => storageFunc(k, v);
    storageFunc.get = (k) => storageFunc(k);
    storageFunc.remove = (k) => typeof localStorage !== 'undefined' && localStorage.removeItem(k);
    storageFunc.clear = () => typeof localStorage !== 'undefined' && localStorage.clear();
    storageFunc.secureSet = (k, v, password) => {
        if (typeof localStorage === 'undefined') return;
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        localStorage.setItem(k, papyr.security.encrypt(JSON.stringify(v), password));
    };
    storageFunc.secureGet = (k, password) => {
        if (typeof localStorage === 'undefined') return null;
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        let enc = localStorage.getItem(k);
        if (!enc) return null;
        try { return JSON.parse(papyr.security.decrypt(enc, password)); } catch (e) { return null; }
    };
    storageFunc.secureSetAsync = async (k, v, password) => {
        if (typeof localStorage === 'undefined') return;
        if (!papyr.security || typeof papyr.security.encryptAsync !== 'function') {
            return storageFunc.secureSet(k, v, password);
        }
        const enc = await papyr.security.encryptAsync(JSON.stringify(v), password);
        localStorage.setItem(k, enc);
    };
    storageFunc.secureGetAsync = async (k, password) => {
        if (typeof localStorage === 'undefined') return null;
        if (!papyr.security || typeof papyr.security.decryptAsync !== 'function') {
            return storageFunc.secureGet(k, password);
        }
        let enc = localStorage.getItem(k);
        if (!enc) return null;
        try {
            const dec = await papyr.security.decryptAsync(enc, password);
            return JSON.parse(dec);
        } catch (e) { return null; }
    };
    papyr.storage = storageFunc;

    // Upgraded session helper function with dual call signature compatibility
    const sessionFunc = (key, val) => {
        if (typeof sessionStorage === 'undefined') return null;
        if (typeof val === 'undefined') {
            let data = sessionStorage.getItem(key);
            if (data === null || data === undefined) return null;
            try { return JSON.parse(data); } catch (e) { return data; }
        }
        if (val === null) {
            sessionStorage.removeItem(key);
        } else {
            sessionStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
    };
    sessionFunc.set = (k, v) => sessionFunc(k, v);
    sessionFunc.get = (k) => sessionFunc(k);
    sessionFunc.remove = (k) => typeof sessionStorage !== 'undefined' && sessionStorage.removeItem(k);
    sessionFunc.clear = () => typeof sessionStorage !== 'undefined' && sessionStorage.clear();
    sessionFunc.secureSet = (k, v, password) => {
        if (typeof sessionStorage === 'undefined') return;
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        sessionStorage.setItem(k, papyr.security.encrypt(JSON.stringify(v), password));
    };
    sessionFunc.secureGet = (k, password) => {
        if (typeof sessionStorage === 'undefined') return null;
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        let enc = sessionStorage.getItem(k);
        if (!enc) return null;
        try { return JSON.parse(papyr.security.decrypt(enc, password)); } catch (e) { return null; }
    };
    sessionFunc.secureSetAsync = async (k, v, password) => {
        if (typeof sessionStorage === 'undefined') return;
        if (!papyr.security || typeof papyr.security.encryptAsync !== 'function') {
            return sessionFunc.secureSet(k, v, password);
        }
        const enc = await papyr.security.encryptAsync(JSON.stringify(v), password);
        sessionStorage.setItem(k, enc);
    };
    sessionFunc.secureGetAsync = async (k, password) => {
        if (typeof sessionStorage === 'undefined') return null;
        if (!papyr.security || typeof papyr.security.decryptAsync !== 'function') {
            return sessionFunc.secureGet(k, password);
        }
        let enc = sessionStorage.getItem(k);
        if (!enc) return null;
        try {
            const dec = await papyr.security.decryptAsync(enc, password);
            return JSON.parse(dec);
        } catch (e) { return null; }
    };
    papyr.session = sessionFunc;

    // ----------------------------------------------------
    // PAPYR DATA SYSTEM 2.0
    // ----------------------------------------------------
    papyr.data = {
        local: (collectionName) => papyr.db(collectionName, 'local'),
        session: (collectionName) => papyr.db(collectionName, 'session'),
        indexed: (collectionName) => papyr.db(collectionName, 'indexeddb'),
        remote: (collectionName) => papyr.db(collectionName, 'firebase')
    };

    // ----------------------------------------------------
    // CONTINUITY ENGINE & DRAFT MANAGEMENT
    // ----------------------------------------------------
    papyr.drafts = {
        save(key, data) {
            papyr.storage.set(`papyr_draft_${key}`, { data, timestamp: Date.now() });
        },
        restore(key) {
            const record = papyr.storage.get(`papyr_draft_${key}`);
            return record ? record.data : null;
        },
        clear(key) {
            papyr.storage.remove(`papyr_draft_${key}`);
        }
    };

    papyr.continuity = {
        _intervals: new Map(),
        enable(options = {}) {
            const { key = 'default', target = null, interval = 5000, onSave = null } = options;
            if (this._intervals.has(key)) return;
            
            const saveTask = () => {
                let data = null;
                if (typeof target === 'function') {
                    data = target();
                } else if (target && typeof target === 'object' && target.value !== undefined) {
                    data = target.value;
                } else if (target && typeof target === 'string') {
                    const el = document.querySelector(target);
                    if (el) {
                        data = el.type === 'checkbox' ? el.checked : el.value;
                    }
                }
                if (data !== null) {
                    papyr.drafts.save(key, data);
                    if (typeof onSave === 'function') onSave(data);
                }
            };
            
            saveTask();
            const intervalId = setInterval(saveTask, interval);
            this._intervals.set(key, intervalId);
        },
        
        disable(key = 'default') {
            const intervalId = this._intervals.get(key);
            if (intervalId) {
                clearInterval(intervalId);
                this._intervals.delete(key);
            }
        },
        
        restore(options = {}) {
            const { key = 'default', target = null, onRestore = null } = options;
            const data = papyr.drafts.restore(key);
            if (data !== null) {
                if (typeof onRestore === 'function') {
                    onRestore(data);
                } else if (target && typeof target === 'object' && target.value !== undefined) {
                    target.value = data;
                } else if (target && typeof target === 'string') {
                    const el = document.querySelector(target);
                    if (el) {
                        if (el.type === 'checkbox') {
                            el.checked = !!data;
                        } else {
                            el.value = data;
                        }
                    }
                }
                return data;
            }
            return null;
        }
    };

    // ----------------------------------------------------
    // OFFLINE FIRST SUPPORT
    // ----------------------------------------------------
    papyr.offline = {
        _queue: [],
        _isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        _syncListeners: new Set(),
        
        enable(options = {}) {
            const { onSync = null } = options;
            if (onSync) this._syncListeners.add(onSync);
            
            if (typeof window !== 'undefined') {
                window.addEventListener('online', () => {
                    this._isOnline = true;
                    this.sync();
                });
                window.addEventListener('offline', () => {
                    this._isOnline = false;
                });
            }
            
            const savedQueue = papyr.storage.get("papyr_offline_queue");
            if (Array.isArray(savedQueue)) {
                this._queue = savedQueue;
            }
            
            if (this._isOnline) {
                this.sync();
            }
        },
        
        queueWrite(action, collection, data) {
            this._queue.push({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                action,
                collection,
                data,
                timestamp: Date.now()
            });
            papyr.storage.set("papyr_offline_queue", this._queue);
            
            if (this._isOnline) {
                this.sync();
            }
        },
        
        async sync() {
            if (!this._isOnline || this._queue.length === 0) return;
            
            const currentQueue = [...this._queue];
            this._queue = [];
            papyr.storage.remove("papyr_offline_queue");
            
            for (const item of currentQueue) {
                for (const listener of this._syncListeners) {
                    try {
                        await listener(item);
                    } catch (e) {
                        console.error("Offline sync error, pushing back to queue:", e);
                        this._queue.push(item);
                        papyr.storage.set("papyr_offline_queue", this._queue);
                    }
                }
            }
        }
    };

    // ----------------------------------------------------
    // RETRY ENGINE (RELIABILITY SUITE)
    // ----------------------------------------------------
    papyr.retry = async (fn, options = {}) => {
        const { retries = 3, delay = 1000, factor = 2, onError = null } = options;
        let currentDelay = delay;
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (err) {
                if (onError) onError(err, i + 1);
                if (i === retries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= factor;
            }
        }
    };
});


// --- MODULE: core/crud.js ---
/**
 * PAPYR CRUD STORAGE ENGINE
 * 
 * Auto-synchronizing reactive database store mapped directly to persistent LocalStorage.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    papyr.crud = (name, initialData = []) => {
        let getStored = () => {
            try {
                return papyr.storage(name) || initialData;
            } catch(e) {
                return initialData;
            }
        };

        let items = papyr.state(getStored());

        let sync = () => {
            try {
                papyr.storage(name, items.value);
            } catch(e) {
                console.warn("PapyrStorageWarning: LocalStorage sync failed.", e);
            }
        };

        return {
            state: items,

            list() {
                return items.value;
            },

            query(options = {}) {
                let result = [...items.value];
                if (typeof options.filter === 'function') {
                    result = result.filter(options.filter);
                } else if (options.filter && typeof options.filter === 'object') {
                    result = result.filter(item => 
                        Object.entries(options.filter).every(([k, v]) => {
                            if (k === '__proto__' || k === 'constructor' || k === 'prototype') return false;
                            // eslint-disable-next-line security/detect-object-injection
                            return Object.prototype.hasOwnProperty.call(item, k) ? item[k] === v : false;
                        })
                    );
                }
                if (options.sort) {
                    const { field, direction = 'asc' } = options.sort;
                    result.sort((a, b) => {
                        if (field === '__proto__' || field === 'constructor' || field === 'prototype') return 0;
                        // eslint-disable-next-line security/detect-object-injection
                        let valA = Object.prototype.hasOwnProperty.call(a, field) ? a[field] : undefined;
                        // eslint-disable-next-line security/detect-object-injection
                        let valB = Object.prototype.hasOwnProperty.call(b, field) ? b[field] : undefined;
                        if (typeof valA === 'string') valA = valA.toLowerCase();
                        if (typeof valB === 'string') valB = valB.toLowerCase();
                        if (valA < valB) return direction === 'asc' ? -1 : 1;
                        if (valA > valB) return direction === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
                const offset = options.offset || 0;
                const limit = options.limit !== undefined ? options.limit : result.length;
                return result.slice(offset, offset + limit);
            },

            /**
             * Appends a new item to the store and generates a unique Base36 string ID.
             * 
             * @param {Record<string, *>} item Payload fields dictionary
             * @returns {Record<string, *>} Newly registered record with id attached
             */
            create(item) {
                let newItem = { 
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), 
                    createdAt: new Date().toISOString(),
                    ...item 
                };
                items.value = [...items.value, newItem];
                sync();
                return newItem;
            },

            /**
             * Finds a record by its unique ID.
             * 
             * @param {string} id Unique record ID
             * @returns {Record<string, *>|undefined} Target record or undefined if not found
             */
            read(id) {
                return items.value.find(item => item.id === id);
            },

            /**
             * Finds a record by its unique ID (Alias for read).
             * 
             * @param {string} id Unique record ID
             * @returns {Record<string, *>|undefined} Target record or undefined if not found
             */
            findById(id) {
                return this.read(id);
            },

            /**
             * Merges updates reactively into an existing record.
             * 
             * @param {string} id Unique record ID
             * @param {Record<string, *>} updates Target fields updates mapping
             */
            update(id, updates) {
                items.value = items.value.map(item => 
                    item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
                );
                sync();
            },

            /**
             * Deletes a record from the database store reactively.
             * 
             * @param {string} id Unique record ID
             */
            delete(id) {
                items.value = items.value.filter(item => item.id !== id);
                sync();
            },

            /**
             * Completely resets the persistent local store database.
             */
            clear() {
                items.value = [];
                sync();
            }
        };
    };
});


// --- MODULE: core/orm.js ---
/**
 * PAPYR ORM SYSTEM
 * Object-Relational Mapping for Papyr.js
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    class PapyrModel {
        constructor(data = {}) {
            Object.assign(this, data);
        }

        // Instance method for saving to DB
        save() {
            const cname = this.constructor.name.toLowerCase() + 's';
            if (this.id) {
                papyr.db(cname).update(this.id, this);
            } else {
                let record = papyr.db(cname).insert(this);
                this.id = record.id;
            }
            return this;
        }

        // Instance method for deleting from DB
        delete() {
            const cname = this.constructor.name.toLowerCase() + 's';
            if (this.id) {
                papyr.db(cname).delete(this.id);
            }
        }

        // Static CRUD methods
        static create(data) {
            const instance = new this(data);
            return instance.save();
        }

        static find(id) {
            const cname = this.name.toLowerCase() + 's';
            const data = papyr.db(cname).find(id);
            return data ? new this(data) : null;
        }

        static all() {
            const cname = this.name.toLowerCase() + 's';
            return papyr.db(cname).state.value.map(data => new this(data));
        }

        static watch(callback) {
            const cname = this.name.toLowerCase() + 's';
            return papyr.db(cname).watch(dataList => {
                callback(dataList.map(data => new this(data)));
            });
        }
    }

    // Hybrid function wrapper to support both ORM class constructor and reactivity mixin
    function modelWrapper(stateOrData) {
        if (new.target) {
            // Called with 'new' - acts as the ORM class constructor
            Object.assign(this, stateOrData || {});
        } else {
            // Called as a function - acts as the reactivity model mixin
            return {
                value: () => stateOrData.value,
                oninput: (e) => {
                    if (e.target.type === 'checkbox') {
                        stateOrData.value = e.target.checked;
                    } else if (e.target.type === 'number' || e.target.type === 'range') {
                        stateOrData.value = parseFloat(e.target.value) || 0;
                    } else {
                        stateOrData.value = e.target.value;
                    }
                }
            };
        }
    }

    // Inherit static methods and prototype from PapyrModel
    Object.setPrototypeOf(modelWrapper, PapyrModel);
    modelWrapper.prototype = Object.create(PapyrModel.prototype);
    modelWrapper.prototype.constructor = modelWrapper;

    // Global exposure on the active kernel instance
    papyr.model = modelWrapper;
});


// --- MODULE: core/auth.js ---
/**
 * PAPYR AUTHENTICATION ENGINE
 * Handles login, logout, and registration logic. Provides a unified interface
 * for Local, JWT, Firebase Auth, and OAuth.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    papyr.auth = {
        user: papyr.state(null), // Reactive current user state
        
        _config: { provider: 'local' },
        _providers: {},

        use(name) {
            this._config.provider = name;
            return this._providers[name] || this;
        },

        registerProvider(name, providerInstance) {
            if (name === '__proto__' || name === 'constructor' || name === 'prototype') return;
            this._providers[name] = providerInstance;
        },

        async _hashPassword(password) {
            if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
                const msgBuffer = new TextEncoder().encode(password);
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            // Deterministic numeric hashing fallback for Node.js/testing environments:
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return "sha256_poly_" + Math.abs(hash).toString(16);
        },

        init(config) {
            this._config = { ...this._config, ...config };
            
            // Auto-login check for local token with expiry
            if (this._config.provider === 'local') {
                let token = papyr.storage.get("auth_token");
                if (token) {
                    let sessions = papyr.storage.get("papyr_auth_sessions") || {};
                    // eslint-disable-next-line security/detect-object-injection
                    let sessionRecord = (token && token !== '__proto__' && token !== 'constructor' && token !== 'prototype' && Object.prototype.hasOwnProperty.call(sessions, token)) ? sessions[token] : null;
                    if (sessionRecord) {
                        let username = typeof sessionRecord === 'object' ? sessionRecord.username : sessionRecord;
                        let expiresAt = typeof sessionRecord === 'object' ? sessionRecord.expiresAt : null;
                        
                        if (expiresAt && Date.now() > expiresAt) {
                            this.logout();
                        } else {
                            let users = papyr.storage.get("papyr_auth_users") || {};
                            // eslint-disable-next-line security/detect-object-injection
                            let userRecord = (username && username !== '__proto__' && username !== 'constructor' && username !== 'prototype' && Object.prototype.hasOwnProperty.call(users, username)) ? users[username] : null;
                            if (userRecord) {
                                this.user.value = { id: userRecord.id, username: username, token };
                            } else {
                                this.logout();
                            }
                        }
                    } else {
                        this.logout();
                    }
                }
            }
        },

        async login(credentials) {
            if (this._config.provider === 'local') {
                if (!credentials.username || !credentials.password) {
                    return Promise.reject(new Error("Authentication failed: Username and password are required."));
                }

                // Brute-force account lockout checks
                let lockouts = papyr.storage.get("papyr_auth_lockouts") || {};
                // eslint-disable-next-line security/detect-object-injection
                let lockoutRecord = (credentials.username && credentials.username !== '__proto__' && credentials.username !== 'constructor' && credentials.username !== 'prototype' && Object.prototype.hasOwnProperty.call(lockouts, credentials.username)) ? lockouts[credentials.username] : null;
                if (lockoutRecord) {
                    if (lockoutRecord.failedCount >= 5 && Date.now() < lockoutRecord.lockedUntil) {
                        const minsLeft = Math.ceil((lockoutRecord.lockedUntil - Date.now()) / (60 * 1000));
                        return Promise.reject(new Error(`Account locked: Too many failed login attempts. Try again in ${minsLeft} minutes.`));
                    }
                }

                let users = papyr.storage.get("papyr_auth_users") || {};
                // eslint-disable-next-line security/detect-object-injection
                let userRecord = (credentials.username && credentials.username !== '__proto__' && credentials.username !== 'constructor' && credentials.username !== 'prototype' && Object.prototype.hasOwnProperty.call(users, credentials.username)) ? users[credentials.username] : null;
                if (!userRecord) {
                    return Promise.reject(new Error("Authentication failed: Username does not exist."));
                }
                
                const hashedPassword = await this._hashPassword(credentials.password);
                if (userRecord.passwordHash !== hashedPassword) {
                    let failedCount = (lockoutRecord ? lockoutRecord.failedCount : 0) + 1;
                    let lockedUntil = null;
                    if (failedCount >= 5) {
                        lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lock
                    }
                    if (credentials.username && credentials.username !== '__proto__' && credentials.username !== 'constructor' && credentials.username !== 'prototype') {
                        // eslint-disable-next-line security/detect-object-injection
                        lockouts[credentials.username] = { failedCount, lockedUntil };
                    }
                    papyr.storage.set("papyr_auth_lockouts", lockouts);
                    
                    if (failedCount >= 5) {
                        return Promise.reject(new Error("Account locked: Too many failed login attempts. Locked for 15 minutes."));
                    }
                    return Promise.reject(new Error(`Authentication failed: Incorrect password. ${5 - failedCount} attempts remaining.`));
                }
                
                // Clear lockout on success
                if (credentials.username && credentials.username !== '__proto__' && credentials.username !== 'constructor' && credentials.username !== 'prototype' && Object.prototype.hasOwnProperty.call(lockouts, credentials.username)) {
                    // eslint-disable-next-line security/detect-object-injection
                    delete lockouts[credentials.username];
                    papyr.storage.set("papyr_auth_lockouts", lockouts);
                }

                const token = "local_session_" + Math.random().toString(36).substr(2, 9);
                let sessions = papyr.storage.get("papyr_auth_sessions") || {};
                if (token && token !== '__proto__' && token !== 'constructor' && token !== 'prototype') {
                    // eslint-disable-next-line security/detect-object-injection
                    sessions[token] = {
                        username: credentials.username,
                        expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2-hour session expiry
                    };
                }
                papyr.storage.set("papyr_auth_sessions", sessions);
                
                papyr.storage.set("auth_token", token);
                let userObj = { id: userRecord.id, username: credentials.username, token };
                this.user.value = userObj;
                return userObj;
            } else {
                const provider = this._providers[this._config.provider];
                if (provider && typeof provider.login === 'function') {
                    const user = await provider.login(credentials);
                    this.user.value = user;
                    return user;
                }
                return Promise.reject(new Error(`Auth provider "${this._config.provider}" is not registered or does not support login.`));
            }
        },

        async register(credentials) {
            if (this._config.provider === 'local') {
                if (!credentials.username || !credentials.password) {
                    return Promise.reject(new Error("Registration failed: Username and password are required."));
                }
                if (credentials.password.length < 8) {
                    return Promise.reject(new Error("Registration failed: Password must be at least 8 characters long."));
                }
                let users = papyr.storage.get("papyr_auth_users") || {};
                if (Object.prototype.hasOwnProperty.call(users, credentials.username)) {
                    return Promise.reject(new Error("Registration failed: Username already exists."));
                }
                
                const hashedPassword = await this._hashPassword(credentials.password);
                if (credentials.username && credentials.username !== '__proto__' && credentials.username !== 'constructor' && credentials.username !== 'prototype') {
                    // eslint-disable-next-line security/detect-object-injection
                    users[credentials.username] = {
                        id: Date.now(),
                        username: credentials.username,
                        passwordHash: hashedPassword
                    };
                }
                papyr.storage.set("papyr_auth_users", users);
                
                const token = "local_session_" + Math.random().toString(36).substr(2, 9);
                let sessions = papyr.storage.get("papyr_auth_sessions") || {};
                if (token && token !== '__proto__' && token !== 'constructor' && token !== 'prototype') {
                    // eslint-disable-next-line security/detect-object-injection
                    sessions[token] = {
                        username: credentials.username,
                        expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2-hour session expiry
                    };
                }
                papyr.storage.set("papyr_auth_sessions", sessions);
                
                papyr.storage.set("auth_token", token);
                
                // eslint-disable-next-line security/detect-object-injection
                let uId = (credentials.username && credentials.username !== '__proto__' && credentials.username !== 'constructor' && credentials.username !== 'prototype' && Object.prototype.hasOwnProperty.call(users, credentials.username)) ? users[credentials.username].id : Date.now();
                let userObj = { id: uId, username: credentials.username, token };
                this.user.value = userObj;
                return userObj;
            } else {
                const provider = this._providers[this._config.provider];
                if (provider && typeof provider.register === 'function') {
                    const user = await provider.register(credentials);
                    this.user.value = user;
                    return user;
                }
                return Promise.reject(new Error(`Auth provider "${this._config.provider}" is not registered or does not support registration.`));
            }
        },

        logout() {
            if (this._config.provider === 'local') {
                let token = papyr.storage.get("auth_token");
                if (token) {
                    let sessions = papyr.storage.get("papyr_auth_sessions") || {};
                    if (token && token !== '__proto__' && token !== 'constructor' && token !== 'prototype' && Object.prototype.hasOwnProperty.call(sessions, token)) {
                        // eslint-disable-next-line security/detect-object-injection
                        delete sessions[token];
                        papyr.storage.set("papyr_auth_sessions", sessions);
                    }
                }
                papyr.storage.set("auth_token", null);
                this.user.value = null;
                return Promise.resolve();
            } else {
                const provider = this._providers[this._config.provider];
                if (provider && typeof provider.logout === 'function') {
                    return Promise.resolve(provider.logout()).then(() => {
                        this.user.value = null;
                    });
                }
                this.user.value = null;
                return Promise.resolve();
            }
        }
    };
});


// --- MODULE: core/payments.js ---
/**
 * PAPYR PAYMENT GATEWAY CORE
 * 
 * Provides an abstract payment gateway registry to decouple cash flows, checkout sessions,
 * and currency transaction handling.
 * 
 * LIABILITY & DISCLAIMER:
 * Papyr.js is a zero-dependency front-end library. It does not store, transmit, or process
 * payment credentials or monetary transactions directly. Developers integrating third-party
 * gateways (e.g. Stripe, PayPal) bear full compliance and liability for data handling,
 * secure transit (PCI-DSS), and financial cash flows.
 */

coreInitializers.push((papyr) => {
    papyr.payments = {
        _gateways: {},
        _config: { provider: 'stripe' },

        use(name) {
            this._config = this._config || {};
            this._config.provider = name;
            return this._gateways[name] || this;
        },

        /**
         * Register a custom third-party payment gateway provider.
         * @param {string} name Gateway provider name (e.g. 'stripe', 'paypal')
         * @param {object} gatewayInstance Gateway implementation object
         */
        register(name, gatewayInstance) {
            if (name === '__proto__' || name === 'constructor' || name === 'prototype') return;
            this._gateways[name] = gatewayInstance;
        },

        /**
         * Resolve a registered gateway provider.
         * @param {string} name Gateway name
         * @returns {object|undefined}
         */
        resolve(name) {
            return this._gateways[name];
        },

        /**
         * Initiates a checkout or subscription process through the registered gateway.
         * @param {string} gatewayName Registered gateway name
         * @param {object} options Checkout options (amount, currency, lineItems, etc.)
         * @returns {Promise<any>}
         */
        async checkout(gatewayName, options) {
            const gw = this.resolve(gatewayName);
            if (!gw) {
                return Promise.reject(new Error(`Payment gateway "${gatewayName}" is not registered.`));
            }
            if (typeof gw.checkout !== 'function') {
                return Promise.reject(new Error(`Payment gateway "${gatewayName}" does not implement checkout().`));
            }
            return gw.checkout(options);
        }
    };
});


// --- MODULE: core/api.js ---
/**
 * PAPYR API HELPERS
 * Simplifies standard fetch() commands for beginners.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    const getCacheDB = () => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) return reject("No IndexedDB support");
            const req = window.indexedDB.open("papyr_network_cache", 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("cache")) {
                    db.createObjectStore("cache", { keyPath: "url" });
                }
            };
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = (e) => reject(e.target.error);
        });
    };

    const getCachedResponse = async (url, password) => {
        try {
            const db = await getCacheDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction("cache", "readonly");
                const store = tx.objectStore("cache");
                const getReq = store.get(url);
                getReq.onsuccess = () => {
                    db.close();
                    const item = getReq.result;
                    if (item && item.payload) {
                        try {
                            const decrypted = papyr.security ? papyr.security.decrypt(item.payload, password) : item.payload;
                            resolve(JSON.parse(decrypted));
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error("No cache entry"));
                    }
                };
                getReq.onerror = () => {
                    db.close();
                    reject(getReq.error);
                };
            });
        } catch (err) {
            return null;
        }
    };

    const cacheResponse = async (url, data, password) => {
        try {
            const db = await getCacheDB();
            const text = JSON.stringify(data);
            const encrypted = papyr.security ? papyr.security.encrypt(text, password) : text;
            return new Promise((resolve) => {
                const tx = db.transaction("cache", "readwrite");
                const store = tx.objectStore("cache");
                store.put({ url, payload: encrypted, timestamp: Date.now() }).onsuccess = () => {
                    db.close();
                    resolve();
                };
            });
        } catch (err) {
            console.error("Cache error:", err);
        }
    };

    const syncLedger = async () => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
        let ledger = [];
        try {
            ledger = JSON.parse(localStorage.getItem("papyr_mutation_ledger") || "[]");
        } catch (e) {}
        if (ledger.length === 0) return;

        const remaining = [];
        for (let op of ledger) {
            try {
                const res = await fetch(op.url, {
                    method: op.method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...op.headers
                    },
                    body: op.data ? JSON.stringify(op.data) : undefined
                });
                if (!res.ok) throw new Error("Sync server returned error " + res.status);
                if (papyr.emit) {
                    papyr.emit('sync:success', { op, response: await res.json() });
                }
            } catch (err) {
                console.error("Ledger replay failed for", op.url, err);
                remaining.push(op);
            }
        }
        localStorage.setItem("papyr_mutation_ledger", JSON.stringify(remaining));
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            syncLedger().catch(console.error);
        });
        setInterval(() => {
            syncLedger().catch(console.error);
        }, 15000);
    }

    papyr.api = {
        async fetch(url, options = {}) {
            const method = (options.method || 'GET').toUpperCase();
            const headers = options.headers || {};
            const password = options.encryptionKey || "papyr_secure_mesh_cache";
            const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

            if (method === 'GET') {
                if (isOnline) {
                    try {
                        const res = await fetch(url, { method, headers });
                        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                        const data = await res.json();
                        await cacheResponse(url, data, password);
                        return data;
                    } catch (error) {
                        const cached = await getCachedResponse(url, password);
                        if (cached) return cached;
                        throw error;
                    }
                } else {
                    const cached = await getCachedResponse(url, password);
                    if (cached) return cached;
                    throw new Error("Offline and no cached data available");
                }
            } else {
                if (isOnline) {
                    const body = options.body || options.data;
                    const res = await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            ...headers
                        },
                        body: body ? JSON.stringify(body) : undefined
                    });
                    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                    return await res.json();
                } else {
                    let ledger = [];
                    try {
                        ledger = JSON.parse(localStorage.getItem("papyr_mutation_ledger") || "[]");
                    } catch (e) {}
                    const body = options.body || options.data;
                    ledger.push({ url, method, data: body, headers, timestamp: Date.now() });
                    localStorage.setItem("papyr_mutation_ledger", JSON.stringify(ledger));

                    return {
                        id: "temp_" + Math.random().toString(36).substr(2, 9),
                        ...(typeof body === 'object' ? body : {}),
                        status: "pending_sync"
                    };
                }
            }
        },

        async get(url, headers = {}) {
            return this.fetch(url, { method: 'GET', headers });
        },

        async post(url, data, headers = {}) {
            return this.fetch(url, { method: 'POST', data, headers });
        }
    };

    papyr.cloud = {
        _providers: {},
        _config: { provider: 'vercel' },
        register(name, providerInstance) {
            if (name === '__proto__' || name === 'constructor' || name === 'prototype') return;
            this._providers[name] = providerInstance;
        },
        use(name) {
            this._config = this._config || {};
            this._config.provider = name;
            return this._providers[name] || this;
        }
    };
});


// --- MODULE: core/debug.js ---
/**
 * PAPYR DEBUGGING SUITE
 * Provides structured, educational console logs for beginners.
 * Updated to run modularly inside the Papyr Kernel context and instantiate the default global instance.
 */

coreInitializers.push((papyr) => {
    papyr.log = (...args) => {
        console.log(
            '%c Papyr Log ', 
            'background: #3b82f6; color: white; border-radius: 4px; font-weight: bold; padding: 2px 4px;',
            ...args
        );
    };

    papyr.warn = (...args) => {
        console.warn(
            '%c Papyr Warning ', 
            'background: #f59e0b; color: white; border-radius: 4px; font-weight: bold; padding: 2px 4px;',
            ...args
        );
        
        // Report warnings to the kernel diagnostics engine
        papyr.diagnostics.errors.push({
            type: 'warning',
            message: args.map(String).join(' '),
            timestamp: new Date().toISOString()
        });
    };
});

// Since debug.js is the last concatenated file in the build, instantiate the global window.papyr now!
if (typeof window !== 'undefined' && !window.papyr) {
    window.papyr = createPapyr();
}


// --- MODULE: core/ssr.js ---
/**
 * PAPYR SSR & HYDRATION RUNTIME
 * Isomorphic Server-Side Renderer, hydration engine, and Islands runtime.
 */

coreInitializers.push((papyr) => {
    // 1. Environment Detection
    papyr.isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';
    papyr.isServer = () => typeof window === 'undefined';
    papyr.isWorker = () => (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) || (typeof importScripts === 'function');

    // 2. Islands Registration
    const registeredIslands = new Map();
    
    papyr.island = (Component) => {
        const name = Component.name || `Island_${Math.random().toString(36).substring(2, 9)}`;
        registeredIslands.set(name, Component);
        
        return (props) => {
            if (papyr.isServer()) {
                // Render placeholder wrapping static content and props metadata
                const el = Component(props);
                const htmlStr = papyr.ssr(el);
                const propsStr = JSON.stringify(props || {});
                const safeProps = propsStr.replace(/"/g, '&quot;');
                
                // Wrap in marker element
                const container = papyr.div({
                    attrs: {
                        'data-papyr-island': name,
                        'data-papyr-island-props': safeProps
                    }
                });
                container.innerHTML = htmlStr;
                return container;
            } else {
                return Component(props);
            }
        };
    };
    
    papyr.registerIsland = (name, Component) => {
        registeredIslands.set(name, Component);
    };

    // 3. Hydration Engine
    papyr.hydrate = (selector, App) => {
        if (!papyr.isBrowser()) return;
        
        const realRoot = document.querySelector(selector);
        if (!realRoot) {
            console.error(`[Papyr Hydration Error] Target selector "${selector}" not found.`);
            return;
        }

        // Evaluate virtual tree
        const vRoot = typeof App === 'function' ? App() : App;
        
        // Hydrate recursively
        hydrateNode(realRoot, vRoot, selector);
        
        // Boot registered islands
        hydrateIslands();
    };

    function triggerHydrationWarning(path, message, detail) {
        console.warn(message);
        
        if (papyr.diagnostics) {
            papyr.diagnostics.errors.push({
                type: 'hydration-warning',
                message: message,
                timestamp: new Date().toISOString(),
                path: path
            });
            papyr.diagnostics.emit('performance', {
                type: 'hydration-mismatch',
                message: message,
                path: path
            });
        }
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('papyr-hydration-warning', {
                detail: { path, message, ...detail }
            }));
        }
    }

    function hydrateNode(realNode, vNode, path) {
        if (!realNode || !vNode) return;

        // NodeType mismatch
        if (realNode.nodeType !== vNode.nodeType) {
            triggerHydrationWarning(
                path,
                `[Papyr Hydration Mismatch] NodeType mismatch at ${path}. Expected ${vNode.nodeType} but got ${realNode.nodeType}. Re-mounting.`,
                { expectedType: vNode.nodeType, actualType: realNode.nodeType }
            );
            realNode.parentNode.replaceChild(vNode, realNode);
            return;
        }

        // Hydrate Text Nodes
        if (realNode.nodeType === 3) {
            if (realNode.nodeValue !== vNode.nodeValue) {
                triggerHydrationWarning(
                    path,
                    `[Papyr Hydration Mismatch] Text value mismatch at ${path}. Expected "${vNode.nodeValue}" but got "${realNode.nodeValue}". Updating text.`,
                    { expectedValue: vNode.nodeValue, actualValue: realNode.nodeValue }
                );
                realNode.nodeValue = vNode.nodeValue;
            }
            return;
        }

        // Hydrate Elements
        if (realNode.nodeType === 1) {
            const realTag = realNode.tagName.toLowerCase();
            const vTag = vNode.tagName.toLowerCase();
            if (realTag !== vTag) {
                triggerHydrationWarning(
                    path,
                    `[Papyr Hydration Mismatch] TagName mismatch at ${path}. Expected <${vTag}> but got <${realTag}>. Re-creating element.`,
                    { expectedTag: vTag, actualTag: realTag }
                );
                realNode.parentNode.replaceChild(vNode, realNode);
                return;
            }

            // Copy attributes
            if (vNode.attributes) {
                Array.from(vNode.attributes).forEach(attr => {
                    if (realNode.getAttribute(attr.name) !== attr.value) {
                        realNode.setAttribute(attr.name, attr.value);
                    }
                });
            }

            // Transfer Event Listeners
            if (vNode._listeners) {
                vNode._listeners.forEach(l => {
                    realNode.addEventListener(l.event, l.handler, l.options);
                    realNode._listeners = realNode._listeners || [];
                    realNode._listeners.push(l);
                });
            }

            // Transfer Cleanups
            if (vNode._cleanups) {
                realNode._cleanups = (realNode._cleanups || []).concat(vNode._cleanups);
                vNode._cleanups = [];
            }

            // Sync children recursively
            const realChildren = Array.from(realNode.childNodes);
            const vChildren = Array.from(vNode.childNodes);

            if (realChildren.length !== vChildren.length) {
                triggerHydrationWarning(
                    path,
                    `[Papyr Hydration Mismatch] Children count mismatch at ${path}. Expected ${vChildren.length} children but got ${realChildren.length}. Syncing.`,
                    { expectedCount: vChildren.length, actualCount: realChildren.length }
                );
                
                const minLen = Math.min(realChildren.length, vChildren.length);
                for (let i = 0; i < minLen; i++) {
                    hydrateNode(realChildren[i], vChildren[i], `${path} > ${vTag}:${i}`);
                }
                
                if (vChildren.length > realChildren.length) {
                    for (let i = minLen; i < vChildren.length; i++) {
                        realNode.appendChild(vChildren[i]);
                    }
                }
                
                if (realChildren.length > vChildren.length) {
                    for (let i = minLen; i < realChildren.length; i++) {
                        if (typeof papyr._cleanupElement === 'function') {
                            papyr._cleanupElement(realChildren[i]);
                        }
                        realNode.removeChild(realChildren[i]);
                    }
                }
            } else {
                for (let i = 0; i < realChildren.length; i++) {
                    hydrateNode(realChildren[i], vChildren[i], `${path} > ${vTag}:${i}`);
                }
            }
        }
    }

    function hydrateIslands() {
        if (!papyr.isBrowser()) return;
        const islands = document.querySelectorAll('[data-papyr-island]');
        islands.forEach(el => {
            const name = el.getAttribute('data-papyr-island');
            const Component = registeredIslands.get(name);
            if (!Component) {
                console.warn(`[Papyr Island Warning] Island component "${name}" not registered.`);
                return;
            }
            
            let props = {};
            try {
                const propsStr = el.getAttribute('data-papyr-island-props');
                if (propsStr) props = JSON.parse(propsStr);
            } catch (err) {
                console.error(`[Papyr Island Props Error] Failed to parse props for island "${name}":`, err);
            }
            
            const vEl = Component(props);
            hydrateNode(el, vEl, `[island=${name}]`);
        });
    }

    // 4. Isomorphic Server-Side Renderer
    papyr.ssr = (element) => {
        if (element === null || element === undefined) return '';
        if (typeof element === 'string' || typeof element === 'number') {
            return String(element);
        }
        if (Array.isArray(element)) {
            return element.map(papyr.ssr).join('');
        }
        if (element.nodeType === 3 || (element.textContent !== undefined && !element.tagName)) {
            return String(element.textContent || '');
        }
        if (element instanceof DocumentFragment || element.tagName === 'TEMPLATE-CONTENT' || (element.children && !element.tagName)) {
            const nodes = element.childNodes ? Array.from(element.childNodes) : (element.children ? Array.from(element.children) : []);
            return nodes.map(papyr.ssr).join('');
        }

        let tag = (element.tagName || 'DIV').toLowerCase();
        let attrsStr = '';
        if (element.id) {
            attrsStr += ` id="${element.id}"`;
        }
        if (element.className) {
            attrsStr += ` class="${element.className}"`;
        }
        if (element.style) {
            let styleKeys = Object.keys(element.style).filter(k => typeof element.style[k] !== 'function');
            if (styleKeys.length > 0) {
                let styleStr = styleKeys.map(k => {
                    let cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
                    return `${cssKey}:${element.style[k]}`;
                }).join(';');
                attrsStr += ` style="${styleStr}"`;
            }
        }
        if (element.dataset) {
            Object.entries(element.dataset).forEach(([k, v]) => {
                attrsStr += ` data-${k.replace(/([A-Z])/g, '-$1').toLowerCase()}="${v}"`;
            });
        }
        
        // Render other properties
        const ignoredKeys = ['tagName', 'style', 'dataset', 'classList', 'children', 'parentNode', 'listeners', 'className', 'id', 'textContent', 'nodeType', 'innerHTML', '_listeners', '_cleanups', '_isMounted', '_renderFn', '_props'];
        Object.entries(element).forEach(([k, v]) => {
            if (!ignoredKeys.includes(k) && typeof v !== 'function' && typeof v !== 'object') {
                attrsStr += ` ${k}="${v}"`;
            }
        });

        const selfClosing = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
        if (selfClosing.includes(tag)) {
            return `<${tag}${attrsStr} />`;
        }

        let childrenStr = '';
        if (element.childNodes && element.childNodes.length > 0) {
            childrenStr = element.childNodes.map(papyr.ssr).join('');
        } else if (element.children && element.children.length > 0) {
            childrenStr = element.children.map(papyr.ssr).join('');
        } else if (element.textContent) {
            childrenStr = String(element.textContent);
        } else if (element.innerHTML) {
            childrenStr = String(element.innerHTML);
        }

        return `<${tag}${attrsStr}>${childrenStr}</${tag}>`;
    };

    // 5. Streaming SSR
    papyr.ssr.stream = (component) => {
        return new ReadableStream({
            start(controller) {
                try {
                    const html = papyr.ssr(component);
                    const chunkSize = 1024;
                    for (let i = 0; i < html.length; i += chunkSize) {
                        controller.enqueue(html.substring(i, i + chunkSize));
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });
    };

    // ──────────────────────────────────────────────────────────────────────────
    // 6. PSSR — Papyrus Server Side Rendering Enhanced Pipeline
    // ──────────────────────────────────────────────────────────────────────────

    /** Internal render-mode registry: path → mode */
    const _renderModeRegistry = new Map();

    /** SSR-blocked globals: any component accessing these during SSR gets a warning */
    const _ssrBlockedGlobals = [
        'window', 'document', 'localStorage', 'sessionStorage',
        'navigator', 'location', 'history', 'screen',
        'canvas', 'audio', 'camera', 'IndexedDB', 'WebSocket'
    ];

    /**
     * Dynamic value detector: looks for common hydration-mismatch sources in a fn's source.
     * @param {Function} fn
     * @returns {string[]} List of detected dynamic patterns
     * @private
     */
    function _detectDynamicValues(fn) {
        if (typeof fn !== 'function') return [];
        const src = fn.toString();
        const issues = [];
        if (/Date\.now\(\)/.test(src)) issues.push('Date.now()');
        if (/Math\.random\(\)/.test(src)) issues.push('Math.random()');
        if (/new Date\(\)/.test(src)) issues.push('new Date()');
        if (/crypto\.randomUUID\(\)/.test(src)) issues.push('crypto.randomUUID()');
        if (/Math\.floor\(Math\.random/.test(src)) issues.push('random ID generation');
        return issues;
    }

    papyr.pssr = {

        /**
         * Selective hydration: hydrates only island elements marked with [data-papyr-island],
         * leaving static content untouched and unaffected.
         *
         * @param {string} selector - Root container selector (e.g. '#app')
         * @param {Function} [App] - Optional full-app component for full hydration fallback
         * @param {Object} [options]
         * @param {boolean} [options.islandsOnly=true] - If true, only hydrates islands
         * @param {boolean} [options.warnMismatches=true] - Log hydration warnings
         *
         * @example
         * papyr.pssr.hydrate('#app', null, { islandsOnly: true });
         */
        hydrate(selector, App, options = {}) {
            if (!papyr.isBrowser()) return;

            const { islandsOnly = true, warnMismatches = true } = options;

            const root = document.querySelector(selector);
            if (!root) {
                console.error(`[Papyr PSSR] Hydration target "${selector}" not found.`);
                return;
            }

            // Always hydrate islands
            const islands = root.querySelectorAll('[data-papyr-island]');
            if (islands.length > 0) {
                console.log(`[Papyr PSSR] Hydrating ${islands.length} island(s) selectively.`);
                islands.forEach(islandEl => {
                    const name = islandEl.getAttribute('data-papyr-island');
                    let props = {};
                    try {
                        const raw = islandEl.getAttribute('data-papyr-island-props');
                        if (raw) props = JSON.parse(raw.replace(/&quot;/g, '"'));
                    } catch (e) {
                        console.warn(`[Papyr PSSR Island] Could not parse props for "${name}":`, e);
                    }

                    // Look up registered island component
                    if (papyr.registerIsland) {
                        const Component = papyr._islandRegistry && papyr._islandRegistry.get(name);
                        if (Component) {
                            try {
                                const vEl = Component(props);
                                if (papyr.hydrate) papyr.hydrate(islandEl, () => vEl);
                                islandEl.setAttribute('data-papyr-hydrated', 'true');
                                console.log(`[Papyr PSSR Island] Hydrated "${name}" ✓`);
                            } catch (err) {
                                console.error(`[Papyr PSSR Island] Failed to hydrate "${name}":`, err);
                            }
                        } else {
                            if (warnMismatches) {
                                console.warn(`[Papyr PSSR Island] Component "${name}" not registered. Call papyr.registerIsland("${name}", Component) before hydration.`);
                            }
                        }
                    }
                });
            }

            // Full-app hydration if not islands-only and App is provided
            if (!islandsOnly && App) {
                console.log('[Papyr PSSR] Full-page hydration starting...');
                papyr.hydrate(selector, App);
            }
        },

        /**
         * Classify a component as static, interactive, realtime, or heavy.
         * Used internally by adaptive rendering to pick the optimal strategy.
         *
         * @param {Function} Component
         * @returns {'static'|'interactive'|'realtime'|'heavy'} Classification
         *
         * @example
         * const type = papyr.pssr.classify(ChatWidget);
         * // 'realtime'
         */
        classify(Component) {
            if (typeof Component !== 'function') return 'static';
            const src = Component.toString();

            const realtimePatterns = [/WebSocket/, /EventSource/, /setInterval/, /papyr\.realtime/, /socket\.io/];
            const interactivePatterns = [/addEventListener/, /onclick/, /onsubmit/, /papyr\.state/, /papyr\.signal/, /papyr\.form/];
            const heavyPatterns = [/WebGL/, /WebGPU/, /canvas/, /papyr\.game/, /papyr\.physics/, /Worker/, /SharedArrayBuffer/];

            if (realtimePatterns.some(p => p.test(src))) return 'realtime';
            if (heavyPatterns.some(p => p.test(src))) return 'heavy';
            if (interactivePatterns.some(p => p.test(src))) return 'interactive';
            return 'static';
        },

        /**
         * Wrap a component in an SSR safety guard.
         * Warns if the component accesses browser-only APIs during server rendering.
         *
         * @param {Function} renderFn - Component or render function to guard
         * @returns {Function} Guarded version of the function
         *
         * @example
         * const safePage = papyr.pssr.ssrSafe(MyPage);
         * const html = papyr.ssr(safePage());
         */
        ssrSafe(renderFn) {
            return function ssrSafeWrapper(...args) {
                // Hydration mismatch checks
                const issues = _detectDynamicValues(renderFn);
                if (issues.length > 0) {
                    console.warn(
                        `[Papyr PSSR SSR Safety] Component may cause hydration mismatches. ` +
                        `Detected dynamic values: ${issues.join(', ')}. ` +
                        `Wrap these in papyr.isBrowser() checks or use useEffect/onMounted.`
                    );
                    if (papyr.diagnostics) {
                        papyr.diagnostics.errors.push({
                            type: 'hydration-risk',
                            message: `Hydration mismatch risk: ${issues.join(', ')}`,
                            timestamp: new Date().toISOString()
                        });
                    }
                }

                // Server-side execution guard
                if (papyr.isServer && papyr.isServer()) {
                    // Proxy-guard the render function context to catch browser-only globals
                    try {
                        return renderFn(...args);
                    } catch (err) {
                        const blockedApi = _ssrBlockedGlobals.find(api =>
                            err.message && err.message.toLowerCase().includes(api.toLowerCase())
                        );
                        if (blockedApi) {
                            console.error(
                                `[Papyr PSSR SSR Safety] Component accessed browser-only API ` +
                                `"${blockedApi}" during SSR. Wrap with papyr.isBrowser() guard.`
                            );
                            return null;
                        }
                        throw err;
                    }
                }

                return renderFn(...args);
            };
        },

        /**
         * Check a value for hydration-mismatch risk.
         * Warns about Date.now(), Math.random(), dynamic IDs used in SSR output.
         *
         * @param {Function} fn - Function or component to inspect
         * @returns {{ safe: boolean, issues: string[] }}
         */
        checkHydrationSafety(fn) {
            const issues = _detectDynamicValues(fn);
            return { safe: issues.length === 0, issues };
        },

        /**
         * Declare the rendering mode for a route path.
         * Called internally by papyr.page() when a mode option is provided.
         *
         * @param {string} path - Route path
         * @param {'csr'|'ssr'|'ssg'|'isr'} mode - Rendering mode
         */
        setRouteMode(path, mode) {
            const validModes = ['csr', 'ssr', 'ssg', 'isr'];
            if (!validModes.includes(mode)) {
                console.warn(`[Papyr PSSR] Invalid rendering mode "${mode}" for path "${path}". Valid modes: ${validModes.join(', ')}`);
                return;
            }
            _renderModeRegistry.set(path, mode);
            console.log(`[Papyr PSSR] Route "${path}" → mode: ${mode.toUpperCase()}`);
        },

        /**
         * Get the declared rendering mode for a path.
         * Returns 'csr' (default) if not explicitly set.
         *
         * @param {string} path - Route path
         * @returns {'csr'|'ssr'|'ssg'|'isr'}
         */
        getRouteMode(path) {
            return _renderModeRegistry.get(path) || 'csr';
        },

        /**
         * Returns all registered route modes.
         * @returns {Array<{ path: string, mode: string }>}
         */
        listRouteModes() {
            return Array.from(_renderModeRegistry.entries()).map(([path, mode]) => ({ path, mode }));
        },

        /**
         * Generate a static manifest for all SSG routes.
         * Calls the registered component for each SSG route and returns { path, html } pairs.
         * Useful for build-time static HTML generation.
         *
         * @param {Array<{ path: string, componentFn: Function }>} routes - Route definitions
         * @returns {Promise<Array<{ path: string, html: string, mode: string }>>}
         *
         * @example
         * const manifest = await papyr.pssr.generateStaticManifest(routes);
         * manifest.forEach(({ path, html }) => fs.writeFileSync(`./dist${path}.html`, html));
         */
        async generateStaticManifest(routes = []) {
            const results = [];
            for (const route of routes) {
                const mode = this.getRouteMode(route.path);
                if (mode !== 'ssg') continue;

                try {
                    const element = typeof route.componentFn === 'function'
                        ? route.componentFn({})
                        : route.componentFn;
                    const html = papyr.ssr(element);
                    results.push({ path: route.path, html, mode });
                } catch (err) {
                    console.error(`[Papyr PSSR SSG] Failed to render "${route.path}":`, err);
                    results.push({ path: route.path, html: '', mode, error: err.message });
                }
            }
            return results;
        },

        /**
         * Priority streaming: flushes SEO-critical content first, then streams the body.
         * An enhanced version of papyr.ssr.stream() for PSSR use.
         *
         * @param {Function|Object} component - Component to render
         * @param {Object} [options]
         * @param {number} [options.chunkSize=1024] - Stream chunk size
         * @returns {ReadableStream}
         */
        stream(component, options = {}) {
            const { chunkSize = 1024 } = options;

            return new ReadableStream({
                start(controller) {
                    try {
                        const encoder = new TextEncoder();

                        // Flush SEO head first if available
                        let headContent = '';
                        if (papyr.seo && typeof papyr.seo._flushHead === 'function') {
                            headContent = papyr.seo._flushHead();
                        }

                        if (headContent) {
                            controller.enqueue(encoder.encode(`<!--PAPYR-SEO-START-->\n${headContent}\n<!--PAPYR-SEO-END-->\n`));
                        }

                        // Then stream body
                        const html = papyr.ssr(component);
                        for (let i = 0; i < html.length; i += chunkSize) {
                            controller.enqueue(encoder.encode(html.substring(i, i + chunkSize)));
                        }
                        controller.close();
                    } catch (err) {
                        controller.error(err);
                    }
                }
            });
        }
    };

    // Expose island registry for PSSR selective hydration
    papyr._islandRegistry = papyr._islandRegistry || new Map();
    const _origRegisterIsland = papyr.registerIsland;
    if (typeof _origRegisterIsland === 'function') {
        papyr.registerIsland = (name, Component) => {
            papyr._islandRegistry.set(name, Component);
            _origRegisterIsland(name, Component);
        };
    }
});


// --- MODULE: core/edge.js ---
/**
 * PAPYR EDGE RUNTIME
 * Universal Edge Rendering Handler for Cloudflare Workers, Deno Deploy, Bun, and Node.js.
 * Provides fetch-compatible Request/Response handlers and streaming SSR utilities.
 * Part of the PSSR (Papyrus Server Side Rendering) architecture.
 */

coreInitializers.push((papyr) => {

    papyr.edge = {

        /**
         * Detects if the current runtime is an Edge environment.
         * Supports: Cloudflare Workers, Deno Deploy, Bun.
         * @returns {boolean}
         */
        isEdge() {
            return (
                (typeof EdgeRuntime !== 'undefined') ||
                (typeof Deno !== 'undefined') ||
                (typeof Bun !== 'undefined' && typeof Bun.serve === 'function') ||
                (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers')
            );
        },

        /**
         * Detects if the current runtime is Node.js.
         * @returns {boolean}
         */
        isNode() {
            return (
                typeof process !== 'undefined' &&
                process.versions != null &&
                process.versions.node != null
            );
        },

        /**
         * Creates a fetch-compatible edge handler for a Papyrus App component.
         * Compatible with: Cloudflare Workers, Deno Deploy, Bun.serve, Node.js (via adapter).
         *
         * @param {Function} App - A Papyrus component function receiving ({ url, request })
         * @param {Object} options
         * @param {Function} [options.shell] - Wraps the body HTML in a full document shell
         * @param {Object} [options.headers] - Additional HTTP response headers
         * @param {Function} [options.onError] - Custom error handler (err) => Response
         * @returns {Function} Async fetch handler (request) => Response
         *
         * @example
         * // Cloudflare Workers
         * export default {
         *   fetch: papyr.edge.handler(App)
         * };
         *
         * // Deno Deploy
         * Deno.serve(papyr.edge.handler(App));
         */
        handler(App, options = {}) {
            const { headers: customHeaders = {}, onError = null } = options;

            return async (request) => {
                try {
                    const url = new URL(request.url);
                    const ctx = { url, request, method: request.method };

                    const element = typeof App === 'function' ? App(ctx) : App;
                    const bodyHtml = papyr.ssr(element);

                    // Build SEO head string if papyr.seo is available
                    let headHtml = '';
                    if (papyr.seo && typeof papyr.seo._flushHead === 'function') {
                        headHtml = papyr.seo._flushHead();
                    }

                    const fullHtml = options.shell
                        ? options.shell(bodyHtml, headHtml)
                        : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
</head>
<body>
${bodyHtml}
</body>
</html>`;

                    return new Response(fullHtml, {
                        status: 200,
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'X-Powered-By': 'Papyrus PSSR',
                            'Cache-Control': 'public, max-age=0, must-revalidate',
                            ...customHeaders
                        }
                    });
                } catch (err) {
                    console.error('[Papyr Edge Handler Error]', err);
                    if (onError) return onError(err);
                    return new Response(
                        `<!DOCTYPE html><html><head><title>Error</title></head><body>` +
                        `<h1>Internal Server Error</h1><pre>${err.message}</pre></body></html>`,
                        {
                            status: 500,
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        }
                    );
                }
            };
        },

        /**
         * Creates a streaming SSR edge handler using ReadableStream + TextEncoder.
         * Flushes SEO-critical head content immediately, then streams body chunks.
         *
         * @param {Function} App - Papyrus component function
         * @param {Request} request - Incoming Request object
         * @param {Object} options
         * @param {Object} [options.headers] - Additional response headers
         * @param {number} [options.chunkSize=1024] - Streaming chunk size in bytes
         * @returns {Response} Streaming Response
         *
         * @example
         * export default {
         *   fetch: (req) => papyr.edge.stream(App, req)
         * };
         */
        stream(App, request, options = {}) {
            const { headers: customHeaders = {}, chunkSize = 1024 } = options;
            const encoder = new TextEncoder();

            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        // 1. Flush shell open immediately (best TTFB)
                        let headHtml = '';
                        if (papyr.seo && typeof papyr.seo._flushHead === 'function') {
                            headHtml = papyr.seo._flushHead();
                        }

                        const shellOpen = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
</head>
<body>`;
                        controller.enqueue(encoder.encode(shellOpen));

                        // 2. Render component
                        const url = request ? new URL(request.url) : null;
                        const ctx = { url, request };
                        const element = typeof App === 'function' ? App(ctx) : App;
                        const html = papyr.ssr(element);

                        // 3. Stream body in chunks
                        for (let i = 0; i < html.length; i += chunkSize) {
                            controller.enqueue(encoder.encode(html.substring(i, i + chunkSize)));
                        }

                        // 4. Close shell
                        controller.enqueue(encoder.encode('\n</body>\n</html>'));
                        controller.close();
                    } catch (err) {
                        console.error('[Papyr Edge Stream Error]', err);
                        controller.enqueue(encoder.encode(`<p>Render Error: ${err.message}</p>`));
                        controller.close();
                    }
                }
            });

            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Transfer-Encoding': 'chunked',
                    'X-Powered-By': 'Papyrus PSSR Stream',
                    ...customHeaders
                }
            });
        },

        /**
         * Creates a Node.js-compatible HTTP handler (compatible with http.createServer).
         * @param {Function} App - Papyrus component function
         * @param {Object} options
         * @returns {Function} Node.js (req, res) => void handler
         *
         * @example
         * const http = require('http');
         * http.createServer(papyr.edge.nodeHandler(App)).listen(3000);
         */
        nodeHandler(App, options = {}) {
            const { headers: customHeaders = {} } = options;

            return async (req, res) => {
                try {
                    const baseUrl = `http://${req.headers.host || 'localhost'}`;
                    const url = new URL(req.url || '/', baseUrl);
                    const ctx = { url, request: req };

                    const element = typeof App === 'function' ? App(ctx) : App;
                    const bodyHtml = papyr.ssr(element);

                    let headHtml = '';
                    if (papyr.seo && typeof papyr.seo._flushHead === 'function') {
                        headHtml = papyr.seo._flushHead();
                    }

                    const fullHtml = options.shell
                        ? options.shell(bodyHtml, headHtml)
                        : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
</head>
<body>
${bodyHtml}
</body>
</html>`;

                    res.writeHead(200, {
                        'Content-Type': 'text/html; charset=utf-8',
                        'X-Powered-By': 'Papyrus PSSR',
                        ...customHeaders
                    });
                    res.end(fullHtml);
                } catch (err) {
                    console.error('[Papyr Edge Node Handler Error]', err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end(`<h1>Internal Server Error</h1><pre>${err.message}</pre>`);
                }
            };
        }
    };
});


// --- MODULE: core/isr.js ---
/**
 * PAPYR ISR ENGINE (Incremental Static Regeneration)
 * Server-side stale-while-revalidate HTML cache with background regeneration.
 * Requires a persistent Node.js or server process to maintain cache state.
 * Part of the PSSR (Papyrus Server Side Rendering) architecture.
 */

coreInitializers.push((papyr) => {
    // In-memory HTML cache store
    const isrStore = new Map();

    /**
     * @typedef {Object} ISREntry
     * @property {string} html - Cached rendered HTML
     * @property {number} timestamp - Unix ms when cached
     * @property {number} ttl - TTL in seconds
     * @property {boolean} revalidating - Background revalidation in progress
     */

    papyr.isr = {

        /**
         * Serve or generate cached HTML for a given cache key.
         * Uses stale-while-revalidate: returns stale cache immediately while regenerating in background.
         *
         * @param {string} key - Unique cache key (typically a route path)
         * @param {Function} renderFn - Async function that returns a Papyrus element or HTML string
         * @param {number} [ttlSeconds=60] - Cache TTL in seconds
         * @returns {Promise<{ html: string, hit: boolean, stale: boolean, age: number }>}
         *
         * @example
         * app.get('/blog', async (req, res) => {
         *   const { html } = await papyr.isr.cache('/blog', () => BlogPage(), 300);
         *   res.send(html);
         * });
         */
        async cache(key, renderFn, ttlSeconds = 60) {
            const now = Date.now();
            const entry = isrStore.get(key);

            // Fresh cache hit
            if (entry && (now - entry.timestamp) < entry.ttl * 1000 && !entry.revalidating) {
                return {
                    html: entry.html,
                    hit: true,
                    stale: false,
                    age: Math.floor((now - entry.timestamp) / 1000)
                };
            }

            // Stale cache: return immediately, revalidate in background
            if (entry) {
                if (!entry.revalidating) {
                    entry.revalidating = true;
                    // Background regeneration — non-blocking
                    Promise.resolve().then(async () => {
                        try {
                            const result = await renderFn();
                            const html = (typeof result === 'string') ? result : papyr.ssr(result);
                            isrStore.set(key, {
                                html,
                                timestamp: Date.now(),
                                ttl: ttlSeconds,
                                revalidating: false
                            });
                            if (papyr.diagnostics) {
                                papyr.diagnostics.emit('isr', {
                                    type: 'revalidated',
                                    key,
                                    timestamp: Date.now()
                                });
                            }
                        } catch (err) {
                            console.error(`[Papyr ISR] Background revalidation failed for "${key}":`, err);
                            // Reset revalidating flag so next request retries
                            const current = isrStore.get(key);
                            if (current) current.revalidating = false;
                        }
                    });
                }

                return {
                    html: entry.html,
                    hit: true,
                    stale: true,
                    age: Math.floor((now - entry.timestamp) / 1000)
                };
            }

            // Cache miss: render synchronously and store
            try {
                const result = await renderFn();
                const html = (typeof result === 'string') ? result : papyr.ssr(result);
                isrStore.set(key, {
                    html,
                    timestamp: Date.now(),
                    ttl: ttlSeconds,
                    revalidating: false
                });

                if (papyr.diagnostics) {
                    papyr.diagnostics.emit('isr', {
                        type: 'generated',
                        key,
                        timestamp: Date.now()
                    });
                }

                return { html, hit: false, stale: false, age: 0 };
            } catch (err) {
                throw new Error(`[Papyr ISR] Initial render failed for key "${key}": ${err.message}`);
            }
        },

        /**
         * Immediately invalidate a single cache entry, forcing regeneration on next request.
         * @param {string} key - Cache key to invalidate
         * @returns {boolean} True if the key existed and was removed
         */
        invalidate(key) {
            const existed = isrStore.has(key);
            if (existed) isrStore.delete(key);
            return existed;
        },

        /**
         * Invalidate all ISR cache entries.
         * @returns {number} Number of entries cleared
         */
        invalidateAll() {
            const count = isrStore.size;
            isrStore.clear();
            return count;
        },

        /**
         * Get the current cache status for a key without triggering a render.
         * @param {string} key - Cache key
         * @returns {{ exists: boolean, hit?: boolean, stale?: boolean, age?: number, ttl?: number, revalidating?: boolean }}
         */
        status(key) {
            const entry = isrStore.get(key);
            if (!entry) return { exists: false };

            const now = Date.now();
            const age = Math.floor((now - entry.timestamp) / 1000);
            const fresh = age < entry.ttl;

            return {
                exists: true,
                hit: fresh,
                stale: !fresh,
                age,
                ttl: entry.ttl,
                revalidating: entry.revalidating || false
            };
        },

        /**
         * Express/Node.js middleware. Intercepts requests and serves from ISR cache.
         * Attach route-specific TTLs via `res.papyrISR.ttl` before calling next().
         *
         * @param {Object} [options]
         * @param {number} [options.defaultTtl=60] - Default TTL for all routes
         * @param {Function} [options.keyFn] - Custom key derivation: (req) => string
         * @returns {Function} Express-compatible middleware function
         *
         * @example
         * app.use(papyr.isr.middleware({ defaultTtl: 300 }));
         * app.get('/blog', async (req, res) => {
         *   res.papyrISR.ttl = 600;
         *   const html = papyr.ssr(BlogPage());
         *   res.papyrISR.save(html);
         *   res.send(html);
         * });
         */
        middleware(options = {}) {
            const { defaultTtl = 60, keyFn = null } = options;

            return (req, res, next) => {
                const key = keyFn ? keyFn(req) : req.url;
                const entry = isrStore.get(key);
                const now = Date.now();

                if (entry && (now - entry.timestamp) < entry.ttl * 1000) {
                    res.setHeader('X-Papyr-ISR', 'HIT');
                    res.setHeader('X-Papyr-ISR-Age', Math.floor((now - entry.timestamp) / 1000));
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    return res.send(entry.html);
                }

                // Attach ISR helpers to response
                res.papyrISR = {
                    key,
                    ttl: defaultTtl,
                    save(html, ttl) {
                        const effectiveTtl = ttl || defaultTtl;
                        isrStore.set(key, {
                            html,
                            timestamp: Date.now(),
                            ttl: effectiveTtl,
                            revalidating: false
                        });
                    }
                };

                res.setHeader('X-Papyr-ISR', 'MISS');
                next();
            };
        },

        /**
         * Total number of cached entries.
         * @returns {number}
         */
        size() {
            return isrStore.size;
        },

        /**
         * All currently cached keys.
         * @returns {string[]}
         */
        keys() {
            return Array.from(isrStore.keys());
        },

        /**
         * Returns a snapshot of cache metadata (without HTML content, for inspection).
         * @returns {Array<{ key: string, age: number, ttl: number, stale: boolean }>}
         */
        inspect() {
            const now = Date.now();
            return Array.from(isrStore.entries()).map(([key, entry]) => {
                const age = Math.floor((now - entry.timestamp) / 1000);
                return {
                    key,
                    age,
                    ttl: entry.ttl,
                    stale: age >= entry.ttl,
                    revalidating: entry.revalidating || false
                };
            });
        }
    };
});


// --- MODULE: core/scheduler.js ---
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


// --- MODULE: core/style.js ---
/**
 * PAPYR STYLE ENGINE
 * Translates inline JS styles, caches CSS-in-JS rules, and maps natural language aliases.
 */

coreInitializers.push((papyr) => {
    const naturalLanguageStyles = {
        bold: { fontWeight: 'bold' },
        italic: { fontStyle: 'italic' },
        underline: { textDecoration: 'underline' },
        strike: { textDecoration: 'line-through' },
        small: { fontSize: '0.85em' },
        large: { fontSize: '1.25em' },
        thin: { fontWeight: '200' },
        normal: { fontWeight: 'normal' },
        thick: { fontWeight: '800' },
        black: { color: '#000000' },
        white: { color: '#ffffff' },
        gray: { color: '#6b7280' },
        red: { color: '#ef4444' },
        green: { color: '#10b981' },
        blue: { color: '#3b82f6' },
        yellow: { color: '#f59e0b' },
        left: { textAlign: 'left' },
        center: { textAlign: 'center' },
        right: { textAlign: 'right' },
        justify: { textAlign: 'justify' },
        flex: { display: 'flex' },
        grid: { display: 'grid' },
        column: { flexDirection: 'column' },
        row: { flexDirection: 'row' },
        wrap: { flexWrap: 'wrap' }
    };

    papyr.style = {
        translate(styleObj) {
            if (!styleObj) return {};
            const result = {};
            const radiusMap = { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' };
            const shadowMap = {
                sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
                md: '0 4px 6px rgba(0, 0, 0, 0.1)',
                lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
                xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
            };

            Object.entries(styleObj).forEach(([k, v]) => {
                if (k === 'bg') {
                    result.background = v;
                } else if (k === 'radius') {
                    result.borderRadius = radiusMap[v] || v;
                } else if (k === 'shadow') {
                    result.boxShadow = shadowMap[v] || v;
                } else if (k in naturalLanguageStyles) {
                    if (v === true) {
                        Object.assign(result, naturalLanguageStyles[k]);
                    }
                } else {
                    result[k] = v;
                }
            });
            return result;
        },

        parseNaturalLanguageArray(arr) {
            if (!Array.isArray(arr)) return {};
            const styles = {};
            arr.forEach(item => {
                if (typeof item === 'string' && naturalLanguageStyles[item]) {
                    Object.assign(styles, naturalLanguageStyles[item]);
                }
            });
            return styles;
        }
    };

    const styleFunction = (cssText) => {
        if (typeof document === 'undefined') return;
        const style = document.createElement('style');
        style.textContent = cssText;
        document.head.appendChild(style);
        return style;
    };
    
    Object.assign(styleFunction, papyr.style);
    papyr.style = styleFunction;

    // CSS-in-JS style caching & deduplication engine
    const styleCache = new Map();
    
    papyr.css = (styles) => {
        if (!styles) return '';
        const translated = papyr.style.translate(styles);
        
        // Sort keys to produce deterministic hash key
        const key = Object.entries(translated)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([k, v]) => `${k}:${v}`)
            .join(';');
        
        if (styleCache.has(key)) {
            return styleCache.get(key);
        }

        const className = `papyr-css-${Math.random().toString(36).substring(2, 9)}`;
        styleCache.set(key, className);

        if (typeof document !== 'undefined') {
            const cssRules = Object.entries(translated)
                .map(([k, v]) => {
                    const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
                    return `${cssKey}: ${v};`;
                })
                .join(' ');
            
            const style = document.createElement('style');
            style.textContent = `.${className} { ${cssRules} }`;
            document.head.appendChild(style);
        }

        return className;
    };

    // Natural Language Text helper
    papyr.text = (content, styleConfig) => {
        const extraProps = {};
        if (Array.isArray(styleConfig)) {
            extraProps.style = papyr.style.parseNaturalLanguageArray(styleConfig);
        } else if (typeof styleConfig === 'object' && styleConfig !== null) {
            extraProps.style = papyr.style.translate(styleConfig);
        } else if (typeof styleConfig === 'string') {
            if (styleConfig.startsWith('.') || styleConfig.startsWith('#')) {
                return papyr.span(styleConfig, content);
            } else {
                extraProps.style = papyr.style.parseNaturalLanguageArray([styleConfig]);
            }
        }
        return papyr.span(extraProps, content);
    };

    // Themeable styled button wrapper
    const originalButton = papyr.button;
    papyr.button = (label, styleConfig, ...children) => {
        if (styleConfig && typeof styleConfig === 'object' && !styleConfig.tagName && !styleConfig._subscribers) {
            const { variant, size, ...rest } = styleConfig;
            const customStyles = papyr.style.translate(rest);
            
            if (variant === 'primary') {
                Object.assign(customStyles, {
                    background: 'var(--primary, #6366f1)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                });
            } else if (variant === 'secondary') {
                Object.assign(customStyles, {
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                });
            }

            if (size === 'lg') {
                Object.assign(customStyles, {
                    padding: '12px 24px',
                    fontSize: '1.1rem',
                    borderRadius: '8px'
                });
            } else if (size === 'sm') {
                Object.assign(customStyles, {
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '4px'
                });
            } else if (size === 'md' || !size) {
                Object.assign(customStyles, {
                    padding: '8px 16px',
                    fontSize: '1rem',
                    borderRadius: '6px'
                });
            }

            return originalButton({ style: customStyles }, label, ...children);
        }
        
        return originalButton(label, styleConfig, ...children);
    };
});


// --- MODULE: core/layout.js ---
/**
 * PAPYR LAYOUT ENGINE
 * Handles viewport breakpoints and responsive layout bindings.
 */

coreInitializers.push((papyr) => {
    // 1. Breakpoint definitions
    const breakpoints = {
        mobile: 0,
        tablet: 768,
        laptop: 1024,
        desktop: 1440,
        ultrawide: 2560
    };

    let currentDeviceClass = 'desktop';
    
    const getDeviceClass = (width) => {
        if (width < breakpoints.tablet) return 'mobile';
        if (width < breakpoints.laptop) return 'tablet';
        if (width < breakpoints.desktop) return 'laptop';
        if (width < breakpoints.ultrawide) return 'desktop';
        return 'ultrawide';
    };

    // 2. Setup Device Class state
    if (typeof window !== 'undefined') {
        currentDeviceClass = papyr.state(getDeviceClass(window.innerWidth));
        
        const updateDeviceClass = () => {
            const width = window.innerWidth;
            const newClass = getDeviceClass(width);
            if (currentDeviceClass.value !== newClass) {
                currentDeviceClass.value = newClass;
            }
            
            // Sync with document element classes
            if (document.documentElement && document.documentElement.classList) {
                Object.keys(breakpoints).forEach(cls => {
                    document.documentElement.classList.toggle(`papyr-layout-${cls}`, cls === newClass);
                });
            }
        };

        window.addEventListener('resize', updateDeviceClass);
        updateDeviceClass();
    } else {
        currentDeviceClass = papyr.state('desktop');
    }

    papyr.layout = papyr.layout || {};
    papyr.layout.deviceClass = currentDeviceClass;

    // 3. Responsive element layout observer hook
    papyr.layout.observeResponsive = (el, enable) => {
        if (!el || typeof window === 'undefined') return;
        
        if (!enable) {
            if (el._responsiveResizeObserver) {
                el._responsiveResizeObserver.disconnect();
                delete el._responsiveResizeObserver;
            }
            return;
        }

        if (el._responsiveResizeObserver) return;

        const updateResponsiveLayout = (width) => {
            const newClass = getDeviceClass(width);
            Object.keys(breakpoints).forEach(cls => {
                el.classList.toggle(`papyr-responsive-${cls}`, cls === newClass);
            });
            // Auto flex direction adjustment for grids/flex container columns on mobile
            if (newClass === 'mobile') {
                el.style.flexDirection = 'column';
            } else {
                el.style.flexDirection = '';
            }
        };

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    updateResponsiveLayout(entry.contentRect.width || entry.target.clientWidth);
                }
            });
            observer.observe(el);
            el._responsiveResizeObserver = observer;
            
            if (!el._cleanups) el._cleanups = [];
            el._cleanups.push(() => observer.disconnect());
        } else {
            const handler = () => updateResponsiveLayout(window.innerWidth);
            window.addEventListener('resize', handler);
            handler();
            
            if (!el._cleanups) el._cleanups = [];
            el._cleanups.push(() => window.removeEventListener('resize', handler));
        }
    };
});


// --- MODULE: core/accessibility.js ---
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


// --- MODULE: core/renovate.js ---
/**
 * PAPYR LEGACY RENOVATION MODE
 * Progressive modernization layer for jQuery/Legacy CRM pages.
 * Supports non-destructive auditing and live component substitution.
 */

coreInitializers.push((papyr) => {
    papyr.renovate = (options = {}) => {
        const rootSelector = options.root || '#legacy-app';
        const doc = typeof document !== 'undefined' ? document : null;
        if (!doc) {
            console.warn("[Papyr Renovate] Document is not defined. Skipping renovation.");
            return { auditResults: null, root: null };
        }

        const rootEl = typeof rootSelector === 'string' ? doc.querySelector(rootSelector) : rootSelector;
        if (!rootEl) {
            console.warn(`[Papyr Renovate] Root element not found for selector: ${rootSelector}`);
            return { auditResults: null, root: null };
        }

        const preserveStyles = options.preserveStyles !== false;
        const preserveLayout = options.preserveLayout !== false;
        const replacements = options.replacements || {};

        const auditResults = {
            accessibility: [],
            performance: [],
            responsive: [],
            legacyElements: []
        };

        // 1. Recursive DOM Tree Audit
        const walk = (el) => {
            if (!el || el.nodeType !== 1) return;

            const tagName = el.tagName.toLowerCase();

            // A. Accessibility Auditing
            if (tagName === 'img' && !el.hasAttribute('alt')) {
                auditResults.accessibility.push({
                    element: el,
                    issue: "Missing 'alt' attribute on <img> element.",
                    severity: "high"
                });
                // Auto-inject default alt tag to improve accessibility
                el.setAttribute('alt', 'Renovated image asset');
            }

            if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName)) {
                if (!el.hasAttribute('aria-label') && !el.textContent.trim()) {
                    auditResults.accessibility.push({
                        element: el,
                        issue: `Missing 'aria-label' or text content on interactive <${tagName}> element.`,
                        severity: "medium"
                    });
                    el.setAttribute('aria-label', `Renovated ${tagName} control`);
                }
            }

            // B. Performance Auditing
            if (el.hasAttribute('style')) {
                const styleText = el.getAttribute('style');
                if (styleText && styleText.split(';').filter(Boolean).length > 2) {
                    auditResults.performance.push({
                        element: el,
                        issue: "Inline style attribute contains multiple definitions. Consider caching via CSS-in-JS.",
                        severity: "low"
                    });
                    
                    // If styles preservation is off, modernize inline styles using Papyr CSS cache engine
                    if (!preserveStyles && papyr.css) {
                        const styleObj = {};
                        styleText.split(';').forEach(pair => {
                            const [k, v] = pair.split(':');
                            if (k && v) {
                                styleObj[k.trim()] = v.trim();
                            }
                        });
                        try {
                            const className = papyr.css(styleObj);
                            el.removeAttribute('style');
                            el.classList.add(className);
                        } catch (e) {}
                    }
                }
            }

            // C. Legacy Element Detection
            if (['font', 'center', 'marquee', 'dir', 'applet', 'strike'].includes(tagName)) {
                auditResults.legacyElements.push({
                    element: el,
                    issue: `Obsolete layout element <${tagName}> detected.`,
                    severity: "high"
                });
            }

            // D. Responsive Auditing
            if (el.hasAttribute('width') && !['canvas', 'svg', 'img', 'video', 'embed'].includes(tagName)) {
                auditResults.responsive.push({
                    element: el,
                    issue: `Hardcoded width attribute on <${tagName}> reduces responsiveness.`,
                    severity: "medium"
                });
                if (!preserveLayout) {
                    el.style.width = '100%';
                    el.removeAttribute('width');
                }
            }

            if (el.hasAttribute('height') && !['canvas', 'svg', 'img', 'video', 'embed'].includes(tagName)) {
                auditResults.responsive.push({
                    element: el,
                    issue: `Hardcoded height attribute on <${tagName}>.`,
                    severity: "medium"
                });
                if (!preserveLayout) {
                    el.removeAttribute('height');
                }
            }

            Array.from(el.children).forEach(walk);
        };

        walk(rootEl);

        // 2. Component Substitutions (Progressive Modernization)
        Object.entries(replacements).forEach(([selector, componentFactory]) => {
            const targets = rootEl.querySelectorAll(selector);
            targets.forEach(target => {
                const parent = target.parentNode;
                if (!parent) return;

                // Capture legacy styles, class names and data for preservation
                let backupClasses = [];
                let backupStyles = '';
                if (preserveStyles) {
                    backupClasses = Array.from(target.classList);
                    backupStyles = target.getAttribute('style') || '';
                }

                // Instantiate the Papyr component replacing it
                const replacementNode = typeof componentFactory === 'function' ? componentFactory(target) : componentFactory;
                if (replacementNode) {
                    if (preserveStyles && replacementNode.nodeType === 1) {
                        backupClasses.forEach(cls => replacementNode.classList.add(cls));
                        if (backupStyles) {
                            const currentStyle = replacementNode.getAttribute('style') || '';
                            replacementNode.setAttribute('style', [currentStyle, backupStyles].filter(Boolean).join('; '));
                        }
                    }
                    
                    // Maintain compatibility: Clean up target events before replacement
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(target);
                    }
                    
                    parent.replaceChild(replacementNode, target);
                }
            });
        });

        console.log(`🏠 [Papyr Renovate] Legacy renovation completed on "${rootSelector}". Accessibility issues: ${auditResults.accessibility.length}, Performance issues: ${auditResults.performance.length}, Responsive: ${auditResults.responsive.length}, Legacy Tags: ${auditResults.legacyElements.length}.`);

        return {
            auditResults,
            root: rootEl
        };
    };
});


// --- MODULE: core/gateway.js ---
/**
 * PAPYR OPEN GATEWAY ARCHITECTURE
 * Core Gateway registration interface supporting unified adapters.
 */

coreInitializers.push((papyr) => {
    const registeredGateways = new Map();
    
    papyr.gateway = {
        register(name, adapter) {
            if (!name || !adapter) return;
            registeredGateways.set(name.toLowerCase(), adapter);
            console.log(`🔌 Papyr Gateway: Registered adapter "${name}" successfully.`);
            if (typeof adapter.initialize === 'function') {
                adapter.initialize(papyr);
            }
        },
        resolve(name) {
            return registeredGateways.get(name.toLowerCase());
        },
        list() {
            return Array.from(registeredGateways.keys());
        }
    };
});


// --- MODULE: core/sdk.js ---
/**
 * PAPYR STUDIO & IDE SDK FOUNDATION
 * Diagnostics, structural tree inspectors, layout grid overlays, and dev-tooling integration.
 */

coreInitializers.push((papyr) => {
    papyr.sdk = {
        getComponentTree() {
            if (!papyr.isBrowser()) return {};
            const root = document.body;
            
            const buildNode = (node) => {
                if (node.nodeType === 3) {
                    const txt = node.nodeValue.trim();
                    return txt ? { type: 'text', content: txt } : null;
                }
                if (node.nodeType !== 1) return null;

                const info = {
                    tag: node.tagName.toLowerCase(),
                    id: node.id || undefined,
                    classes: node.className ? node.className.split(' ').filter(Boolean) : undefined,
                    isMounted: node._isMounted || false
                };

                if (node._renderFn) {
                    info.componentName = node._renderFn.name || 'AnonymousComponent';
                }

                const children = Array.from(node.childNodes)
                    .map(buildNode)
                    .filter(Boolean);
                
                if (children.length > 0) info.children = children;
                return info;
            };

            return buildNode(root);
        },

        inspectState() {
            if (papyr.state && typeof papyr.state.list === 'function') {
                return papyr.state.list().map((s, idx) => ({
                    id: idx,
                    value: s.value,
                    subscribersCount: s._subscribers ? s._subscribers.size : 0
                }));
            }
            return [];
        },

        onHotReload(cb) {
            if (typeof window !== 'undefined') {
                window.addEventListener('papyr-hot-reload', (e) => {
                    cb(e.detail);
                });
            }
        },

        toggleDesignGrid(enable, spacing = 8) {
            if (!papyr.isBrowser()) return;
            
            let gridOverlay = document.getElementById('papyr-design-grid-overlay');
            if (!enable) {
                if (gridOverlay) gridOverlay.remove();
                return;
            }
            
            if (gridOverlay) {
                gridOverlay.style.backgroundSize = `${spacing}px ${spacing}px`;
                return;
            }

            gridOverlay = document.createElement('div');
            gridOverlay.id = 'papyr-design-grid-overlay';
            gridOverlay.style.cssText = `
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                pointer-events: none;
                z-index: 999999;
                background-image: 
                    linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
                background-size: ${spacing}px ${spacing}px;
            `;
            document.body.appendChild(gridOverlay);
        },

        // ─── Plugin SDK ───────────────────────────────────────────────────────

        plugin: {
            /**
             * Validate a plugin object before registration.
             * Checks for required fields and warns about missing metadata.
             *
             * @param {Object} plugin - Plugin object to validate
             * @returns {{ valid: boolean, warnings: string[] }}
             */
            validate(plugin) {
                const warnings = [];
                if (!plugin || typeof plugin !== 'object') {
                    return { valid: false, warnings: ['Plugin must be an object.'] };
                }
                if (!plugin.name) warnings.push('Plugin is missing a "name" field.');
                if (!plugin.install && !plugin.apply && !plugin.fn) {
                    warnings.push('Plugin has no install(), apply(), or fn() handler.');
                }
                if (!plugin.version) warnings.push('Plugin is missing a "version" field.');
                if (!plugin.scope) warnings.push('Plugin is missing a "scope" field (e.g. "animation", "layout").');

                warnings.forEach(w => console.warn(`[Papyr SDK Plugin] ${w}`));
                return { valid: warnings.filter(w => w.includes('missing a "name"') || w.includes('no install')).length === 0, warnings };
            },

            /**
             * List all currently registered plugins.
             * @returns {Array}
             */
            list() {
                if (papyr.trust && papyr.trust.report) {
                    return papyr.trust.report().zone2.plugins;
                }
                return [];
            },

            /**
             * Get a registered plugin's declared scope.
             * @param {string} name - Plugin name
             * @returns {string|null}
             */
            scope(name) {
                const plugins = this.list();
                const plugin = plugins.find(p => p.name === name);
                return plugin ? plugin.scope : null;
            }
        },

        // ─── Adapter Registry ─────────────────────────────────────────────────

        adapter: {
            _registry: [],

            /**
             * Register a custom adapter (e.g. for a framework or rendering target).
             *
             * @param {string} name - Adapter name
             * @param {Object} adapter - Adapter implementation
             * @param {Object} [meta] - Metadata { type, version, description }
             *
             * @example
             * papyr.sdk.adapter.register('preact', preactAdapter, { type: 'framework' });
             */
            register(name, adapter, meta = {}) {
                if (!name || !adapter) return;
                const existing = this._registry.findIndex(a => a.name === name);
                const entry = { name, adapter, type: meta.type || 'custom', version: meta.version || '1.0.0', registeredAt: new Date().toISOString() };
                if (existing !== -1) {
                    this._registry[existing] = entry;
                } else {
                    this._registry.push(entry);
                }
                console.log(`[Papyr SDK] Adapter "${name}" registered (${entry.type}).`);
            },

            /**
             * List all registered adapters.
             * @returns {Array<{ name: string, type: string, version: string }>}
             */
            list() {
                return this._registry.map(({ name, type, version, registeredAt }) => ({ name, type, version, registeredAt }));
            },

            /**
             * Get a registered adapter by name.
             * @param {string} name
             * @returns {Object|null}
             */
            get(name) {
                const entry = this._registry.find(a => a.name === name);
                return entry ? entry.adapter : null;
            },

            /**
             * Remove an adapter from the registry.
             * @param {string} name
             */
            unregister(name) {
                this._registry = this._registry.filter(a => a.name !== name);
            }
        },

        // ─── Config Snapshot ──────────────────────────────────────────────────

        config: {
            /**
             * Take a snapshot of the current papyr.config() state.
             * @returns {Object} Deep clone of all config domains
             *
             * @example
             * const snapshot = papyr.sdk.config.snapshot();
             * // ... make changes ...
             * papyr.sdk.config.restore(snapshot);
             */
            snapshot() {
                if (!papyr.config || typeof papyr.config.getAll !== 'function') return {};
                return papyr.config.getAll();
            },

            /**
             * Restore a previously taken config snapshot.
             * @param {Object} snapshot - Snapshot from papyr.sdk.config.snapshot()
             */
            restore(snapshot) {
                if (!snapshot || !papyr.config) return;
                Object.entries(snapshot).forEach(([domain, values]) => {
                    papyr.config(domain, values);
                });
                console.log('[Papyr SDK] Config restored from snapshot.');
            },

            /**
             * List a summary of all current config values across domains.
             * @returns {Object}
             */
            summary() {
                if (!papyr.config || typeof papyr.config.getAll !== 'function') return {};
                const all = papyr.config.getAll();
                return Object.entries(all).reduce((acc, [domain, values]) => {
                    acc[domain] = Object.keys(values);
                    return acc;
                }, {});
            }
        },

        // ─── Controls Introspection ───────────────────────────────────────────

        controls: {
            /**
             * List all available control namespaces and their methods.
             * @returns {Object} Map of namespace → method names
             */
            list() {
                if (!papyr.controls) return {};
                return Object.keys(papyr.controls).reduce((acc, ns) => {
                    acc[ns] = Object.keys(papyr.controls[ns]).filter(k => typeof papyr.controls[ns][k] === 'function');
                    return acc;
                }, {});
            }
        }
    };
});



// --- MODULE: core/virtualization.js ---
/**
 * PAPYR VIRTUALIZATION ENGINE
 * High-performance virtual rendering engines for massive dataset handling in lists, grids, and tables.
 */

coreInitializers.push((papyr) => {
    // 1. Virtual List
    papyr.virtualList = (options) => {
        const { items, itemHeight, renderItem, height = 400 } = options;
        
        const container = papyr.div({
            style: {
                height: typeof height === 'number' ? `${height}px` : height,
                overflowY: 'auto',
                position: 'relative'
            }
        });

        const listHeight = items.length * itemHeight;
        const innerContainer = papyr.div({
            style: {
                height: `${listHeight}px`,
                position: 'relative',
                width: '100%'
            }
        });
        container.appendChild(innerContainer);

        const visibleItems = new Map();

        const updateItems = () => {
            const scrollTop = container.scrollTop;
            const viewportHeight = container.clientHeight;
            
            const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
            const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + viewportHeight) / itemHeight) + 2);

            // Cleanup non-visible
            visibleItems.forEach((el, index) => {
                if (index < startIndex || index > endIndex) {
                    if (el.parentNode === innerContainer) {
                        innerContainer.removeChild(el);
                    }
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(el);
                    }
                    visibleItems.delete(index);
                }
            });

            // Render visible
            for (let i = startIndex; i <= endIndex; i++) {
                if (!visibleItems.has(i)) {
                    const itemEl = renderItem(items[i], i);
                    itemEl.style.position = 'absolute';
                    itemEl.style.top = `${i * itemHeight}px`;
                    itemEl.style.left = '0';
                    itemEl.style.width = '100%';
                    itemEl.style.height = `${itemHeight}px`;
                    innerContainer.appendChild(itemEl);
                    visibleItems.set(i, itemEl);
                }
            }
        };

        container.addEventListener('scroll', updateItems);
        
        // Trigger updates once mounted
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(updateItems);
        } else {
            setTimeout(updateItems, 0);
        }

        return container;
    };

    // 2. Virtual Grid
    papyr.virtualGrid = (options) => {
        const { items, itemHeight, columnsCount, renderItem, height = 400 } = options;
        
        const container = papyr.div({
            style: {
                height: typeof height === 'number' ? `${height}px` : height,
                overflowY: 'auto',
                position: 'relative'
            }
        });

        const rowsCount = Math.ceil(items.length / columnsCount);
        const listHeight = rowsCount * itemHeight;
        
        const innerContainer = papyr.div({
            style: {
                height: `${listHeight}px`,
                position: 'relative',
                width: '100%'
            }
        });
        container.appendChild(innerContainer);

        const visibleItems = new Map();

        const updateItems = () => {
            const scrollTop = container.scrollTop;
            const viewportHeight = container.clientHeight;
            
            const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
            const endRow = Math.min(rowsCount - 1, Math.floor((scrollTop + viewportHeight) / itemHeight) + 1);

            const startIndex = startRow * columnsCount;
            const endIndex = Math.min(items.length - 1, (endRow + 1) * columnsCount - 1);

            // Cleanup non-visible
            visibleItems.forEach((el, index) => {
                if (index < startIndex || index > endIndex) {
                    if (el.parentNode === innerContainer) {
                        innerContainer.removeChild(el);
                    }
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(el);
                    }
                    visibleItems.delete(index);
                }
            });

            // Render visible
            for (let i = startIndex; i <= endIndex; i++) {
                if (!visibleItems.has(i)) {
                    const row = Math.floor(i / columnsCount);
                    const col = i % columnsCount;
                    
                    const itemEl = renderItem(items[i], i);
                    itemEl.style.position = 'absolute';
                    itemEl.style.top = `${row * itemHeight}px`;
                    itemEl.style.left = `${(col * 100) / columnsCount}%`;
                    itemEl.style.width = `${100 / columnsCount}%`;
                    itemEl.style.height = `${itemHeight}px`;
                    innerContainer.appendChild(itemEl);
                    visibleItems.set(i, itemEl);
                }
            }
        };

        container.addEventListener('scroll', updateItems);
        
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(updateItems);
        } else {
            setTimeout(updateItems, 0);
        }

        return container;
    };

    // 3. Virtual Table
    papyr.virtualTable = (options) => {
        const { items, rowHeight, columns, renderCell, height = 400 } = options;
        
        const scrollContainer = papyr.div({
            style: {
                height: typeof height === 'number' ? `${height}px` : height,
                overflowY: 'auto',
                position: 'relative'
            }
        });

        const listHeight = items.length * rowHeight;
        const innerContainer = papyr.div({
            style: {
                height: `${listHeight}px`,
                position: 'relative',
                width: '100%'
            }
        });
        scrollContainer.appendChild(innerContainer);

        const visibleRows = new Map();

        const updateItems = () => {
            const scrollTop = scrollContainer.scrollTop;
            const viewportHeight = scrollContainer.clientHeight;
            
            const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
            const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + viewportHeight) / rowHeight) + 2);

            // Cleanup non-visible rows
            visibleRows.forEach((el, index) => {
                if (index < startIndex || index > endIndex) {
                    if (el.parentNode === innerContainer) {
                        innerContainer.removeChild(el);
                    }
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(el);
                    }
                    visibleRows.delete(index);
                }
            });

            // Render visible rows
            for (let i = startIndex; i <= endIndex; i++) {
                if (!visibleRows.has(i)) {
                    // Create row element (represented as absolute positioned div containing grid cells)
                    const cells = columns.map((col, cIdx) => {
                        const cellVal = items[i][col.key];
                        const cellContent = renderCell ? renderCell(cellVal, col, items[i], i) : String(cellVal || '');
                        
                        return papyr.div({
                            style: {
                                flex: col.width ? `0 0 ${col.width}` : '1',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                padding: '8px'
                            }
                        }, cellContent);
                    });

                    const rowEl = papyr.flex.row({
                        style: {
                            position: 'absolute',
                            top: `${i * rowHeight}px`,
                            left: '0',
                            width: '100%',
                            height: `${rowHeight}px`,
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                        }
                    }, ...cells);

                    innerContainer.appendChild(rowEl);
                    visibleRows.set(i, rowEl);
                }
            }
        };

        scrollContainer.addEventListener('scroll', updateItems);
        
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(updateItems);
        } else {
            setTimeout(updateItems, 0);
        }

        return scrollContainer;
    };
});


// --- MODULE: core/config.js ---
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


// --- MODULE: core/trust.js ---
/**
 * PAPYR TRUST BOUNDARIES
 * Runtime trust audit API. Documents and surfaces the 4-zone trust model:
 *   Zone 1 — Papyrus Framework Core (framework-controlled, immutable)
 *   Zone 2 — Plugin Layer (developer-installed, scoped)
 *   Zone 3 — Third-Party Services (external, monitored by WATT)
 *   Zone 4 — Developer Responsibility (application-owned)
 *
 * papyr.trust.report()     — full trust state snapshot
 * papyr.trust.audit()      — surfaced warnings and violations
 * papyr.trust.owns(ns)     — check if Papyrus owns a namespace
 * papyr.trust.zone(ns)     — resolve namespace to a trust zone (1-4)
 * papyr.trust.undisclosed() — surface untracked third-party services
 * papyr.trust.disclose()   — register a known third-party service
 */

coreInitializers.push((papyr) => {

    // Zone 1: namespaces owned by the Papyrus framework
    const _zone1Namespaces = new Set([
        'watt', 'security', 'scheduler', 'power', 'recovery',
        'pssr', 'isr', 'edge', 'router', 'reactivity', 'config',
        'controls', 'access', 'trust', 'seo', 'sdk', 'diagnostics',
        'ssr', 'hydrate', 'island', 'registerIsland', 'theme',
        'state', 'signal', 'computed', 'effect', 'watch',
        'component', 'mount', 'h', 'isBrowser', 'isServer',
        'warn', 'plugin', 'style', 'layout', 'animate', 'math',
        'db', 'auth', 'api', 'payments', 'orm', 'crud',
        'game', 'physics', 'ml', 'ocr', 'ai', 'charts',
        'virtualize', 'accessibility', 'renovate', 'gateway',
        'freeform', 'user'
    ]);

    // Zone 2: plugins registered by developers
    const _zone2Plugins = [];

    // Zone 3: detected and disclosed third-party services
    const _zone3Detected = new Set();
    const _zone3Disclosed = [];

    // Zone 4: developer responsibilities (canonical static list)
    const _zone4Responsibilities = [
        'Application business logic',
        'Authentication & authorization (sessions, tokens, roles)',
        'Data validation & input sanitization',
        'API key security (never expose in client bundles)',
        'Privacy policy compliance (GDPR, CCPA, COPPA)',
        'Content security (what is rendered)',
        'Plugin auditing (third-party plugins)',
        'Dependency security (npm packages)',
        'Infrastructure & TLS certificates',
        'AI prompt safety (Papyrus does not filter AI content)',
        'ISR cache invalidation timing',
        'Edge deployment secrets & environment variables'
    ];

    papyr.trust = {

        /**
         * Full trust state report for the current runtime.
         * @returns {Object} Trust zone snapshot
         */
        report() {
            const zone1 = {};
            _zone1Namespaces.forEach(ns => {
                zone1[ns] = papyr[ns] !== undefined ? 'active' : 'inactive';
            });

            return {
                timestamp: new Date().toISOString(),
                papyrusVersion: '3.1.3',
                zone1: {
                    description: 'Papyrus Framework Core — immutable, framework-controlled',
                    systems: zone1
                },
                zone2: {
                    description: 'Plugin Layer — developer-installed, scoped, additive',
                    plugins: [..._zone2Plugins],
                    adapters: (papyr.sdk && papyr.sdk.adapter) ? papyr.sdk.adapter.list() : []
                },
                zone3: {
                    description: 'Third-Party Services — external, monitored by WATT, not controlled by Papyrus',
                    monitoredOrigins: _zone3Detected.size,
                    disclosedServices: _zone3Disclosed.map(s => s.name),
                    undisclosedDetected: this.undisclosed()
                },
                zone4: {
                    description: 'Developer Responsibility — application-owned, not managed by Papyrus',
                    responsibilities: [..._zone4Responsibilities]
                }
            };
        },

        /**
         * Check if Papyrus owns and is responsible for a given namespace.
         * @param {string} namespace - e.g. 'watt.policies', 'state', 'my-plugin'
         * @returns {boolean}
         */
        owns(namespace) {
            const root = namespace.split('.')[0];
            return _zone1Namespaces.has(root);
        },

        /**
         * Resolve a namespace or service name to its trust zone (1–4).
         * @param {string} namespace
         * @returns {1|2|3|4}
         */
        zone(namespace) {
            const root = namespace.split('.')[0];
            if (_zone1Namespaces.has(root)) return 1;
            if (_zone2Plugins.some(p => p.name === root)) return 2;
            // Zone 4: common developer-owned concepts
            const zone4Patterns = ['auth', 'business', 'api-key', 'prompt', 'content', 'state'];
            if (zone4Patterns.some(p => root.includes(p))) return 4;
            return 3; // Unknown = third-party by default
        },

        /**
         * List third-party origins detected by WATT that have not been disclosed.
         * @returns {string[]}
         */
        undisclosed() {
            const disclosedDomains = _zone3Disclosed.map(s =>
                s.domain || (s.name || '').toLowerCase().replace(/\s+/g, '')
            );
            return Array.from(_zone3Detected).filter(origin =>
                !disclosedDomains.some(d => origin.includes(d))
            );
        },

        /**
         * Disclose a known third-party service to WATT.
         * Prevents it from appearing in undisclosed() warnings.
         *
         * @param {Object} service
         * @param {string} service.name - Display name (e.g. 'Google Analytics')
         * @param {string} [service.domain] - Domain pattern (e.g. 'google-analytics.com')
         * @param {string} [service.type] - 'analytics' | 'marketing' | 'payment' | 'auth' | 'cdn'
         * @param {string[]} [service.dataCollected] - What data is collected
         * @param {string} [service.privacyUrl] - Vendor privacy policy URL
         *
         * @example
         * papyr.trust.disclose({
         *   name: 'Google Analytics',
         *   domain: 'google-analytics.com',
         *   type: 'analytics',
         *   dataCollected: ['page_views', 'device_info'],
         *   privacyUrl: 'https://policies.google.com/privacy'
         * });
         */
        disclose(service) {
            if (!service || !service.name) return;
            _zone3Disclosed.push(service);
            console.log(`[Papyr Trust] Third-party service disclosed: "${service.name}" (${service.type || 'unknown type'})`);
        },

        /**
         * Run a trust audit and surface all active warnings and violations.
         * Emits console warnings/errors. Returns a structured result.
         *
         * @returns {{ passed: boolean, violations: Array, warnings: Array }}
         *
         * @example
         * const result = papyr.trust.audit();
         * if (!result.passed) process.exit(1); // Use in CI
         */
        audit() {
            const violations = [];
            const warnings = [];

            // Check WATT mode
            if (papyr.config) {
                const wattConfig = papyr.config.get('watt');
                if (wattConfig && wattConfig.mode === 'none') {
                    violations.push({
                        code: 'WATT_DISABLED',
                        level: 'critical',
                        message: 'WATT mode is "none". All hardware API protections and network interceptions are disabled.'
                    });
                }
            }

            // Check undisclosed services
            const undisclosed = this.undisclosed();
            if (undisclosed.length > 0) {
                warnings.push({
                    code: 'UNDISCLOSED_SERVICES',
                    level: 'warn',
                    message: `${undisclosed.length} undisclosed third-party origin(s) detected: ${undisclosed.join(', ')}`
                });
            }

            // Check consent banner presence
            if (papyr.isBrowser && papyr.isBrowser() && typeof document !== 'undefined') {
                const hasBanner = document.querySelector('[data-papyr-watt-banner]') ||
                                  document.querySelector('[data-papyr-consent]');
                if (!hasBanner && _zone3Disclosed.length > 0) {
                    warnings.push({
                        code: 'MISSING_CONSENT_BANNER',
                        level: 'warn',
                        message: 'Third-party services are disclosed but no consent banner was detected. GDPR/CCPA compliance may be missing.'
                    });
                }
            }

            // Check for plugins with no declared scope
            const unscopedPlugins = _zone2Plugins.filter(p => !p.scope || p.scope === 'unknown');
            if (unscopedPlugins.length > 0) {
                warnings.push({
                    code: 'UNSCOPED_PLUGINS',
                    level: 'warn',
                    message: `${unscopedPlugins.length} plugin(s) have no declared scope: ${unscopedPlugins.map(p => p.name).join(', ')}`
                });
            }

            // Emit to console
            violations.forEach(v => {
                console.error(`[Papyr Trust Audit] ⛔ ${v.code}: ${v.message}`);
            });
            warnings.forEach(w => {
                console.warn(`[Papyr Trust Audit] ⚠️  ${w.code}: ${w.message}`);
            });

            if (violations.length === 0 && warnings.length === 0) {
                console.log('[Papyr Trust Audit] ✅ No trust violations detected.');
            }

            return {
                passed: violations.length === 0,
                violations,
                warnings,
                timestamp: new Date().toISOString()
            };
        },

        // ─── Internal APIs (used by WATT and plugin system) ──────────────────

        /**
         * @internal Called by WATT network monitor to register a detected origin.
         */
        _detectOrigin(url) {
            try {
                const origin = new URL(url).hostname;
                _zone3Detected.add(origin);
            } catch (e) {
                if (url) _zone3Detected.add(String(url));
            }
        },

        /**
         * @internal Called by papyr.plugin() to register a plugin in Zone 2.
         */
        _registerPlugin(name, meta = {}) {
            if (!_zone2Plugins.find(p => p.name === name)) {
                _zone2Plugins.push({
                    name,
                    scope: meta.scope || 'unknown',
                    version: meta.version || 'unknown',
                    trustedBy: 'developer',
                    registeredAt: new Date().toISOString()
                });
            }
        }
    };
});


// --- MODULE: core/access.js ---
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


// --- MODULE: core/watt-sdk.js ---
/**
 * PAPYR WATT SDK
 * Developer-facing privacy and consent toolkit. Extends WATT capabilities
 * without modifying the protected WATT enforcement core.
 *
 * papyr.watt.sdk.flow()      — guided permission workflow
 * papyr.watt.sdk.dialog()    — transparency dialogs
 * papyr.watt.sdk.consent()   — tracking consent management
 * papyr.watt.sdk.notice()    — privacy notices (GDPR/CCPA)
 * papyr.watt.sdk.monitor     — API access event monitor (observe-only)
 * papyr.watt.sdk.disclose()  — third-party service disclosure
 *
 * IMPORTANT: WATT SDK extends WATT without touching:
 *   - papyr.security.policies (protected)
 *   - WATT hardware intercepts (protected)
 *   - Permission enforcement mechanisms (protected)
 */

coreInitializers.push((papyr) => {

    // ─── Consent Storage ─────────────────────────────────────────────────────

    function _readConsent(storageKey) {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(storageKey);
                return raw ? JSON.parse(raw) : null;
            }
        } catch (e) {}
        return null;
    }

    function _writeConsent(storageKey, data) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(storageKey, JSON.stringify(data));
            }
        } catch (e) {}
    }

    // ─── Monitor (Observe-Only) ───────────────────────────────────────────────

    const _monitorListeners = [];

    const _monitor = {
        /**
         * Subscribe to WATT intercept events. Read-only — cannot modify enforcement.
         * @param {'intercept'|'policy-change'|'consent'} event
         * @param {Function} handler - ({ api, policy, blocked, url, timestamp }) => void
         */
        on(event, handler) {
            if (typeof handler !== 'function') return;
            _monitorListeners.push({ event, handler });
        },

        off(handler) {
            const idx = _monitorListeners.findIndex(l => l.handler === handler);
            if (idx !== -1) _monitorListeners.splice(idx, 1);
        },

        /** @internal Emit an event to all monitor subscribers */
        _emit(event, data) {
            _monitorListeners
                .filter(l => l.event === event)
                .forEach(l => {
                    try { l.handler({ ...data, timestamp: new Date().toISOString() }); }
                    catch (e) {}
                });

            // Also register detected origins with trust module
            if (event === 'intercept' && data.url && papyr.trust) {
                papyr.trust._detectOrigin(data.url);
            }
        }
    };

    // ─── DOM Helpers ──────────────────────────────────────────────────────────

    function _createOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999998;
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        overlay.setAttribute('data-papyr-watt-overlay', 'true');
        return overlay;
    }

    function _createCard(title, body, actions) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: #fff; color: #111;
            border-radius: 12px; padding: 24px; max-width: 420px;
            width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: papyr-watt-in 0.2s ease;
        `;

        card.innerHTML = `
            <h2 style="margin:0 0 8px;font-size:1.1rem;font-weight:600;">${title}</h2>
            <p style="margin:0 0 20px;font-size:0.875rem;color:#555;line-height:1.5;">${body}</p>
            <div class="papyr-watt-actions" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
        `;

        const actionsContainer = card.querySelector('.papyr-watt-actions');
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = action.label;
            btn.style.cssText = `
                padding: 8px 16px; border-radius: 6px; cursor: pointer;
                font-size: 0.875rem; font-weight: 500; border: none;
                background: ${action.primary ? '#6C63FF' : '#f3f4f6'};
                color: ${action.primary ? '#fff' : '#111'};
                transition: opacity 0.15s;
            `;
            btn.addEventListener('click', () => action.onClick && action.onClick());
            actionsContainer.appendChild(btn);
        });

        return card;
    }

    function _injectStyles() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('papyr-watt-styles')) return;
        const style = document.createElement('style');
        style.id = 'papyr-watt-styles';
        style.textContent = `
            @keyframes papyr-watt-in {
                from { opacity: 0; transform: scale(0.95) translateY(8px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            [data-papyr-watt-banner] {
                position: fixed; bottom: 16px; left: 50%;
                transform: translateX(-50%);
                background: #1e1e2e; color: #fff;
                border-radius: 10px; padding: 14px 20px;
                display: flex; align-items: center; gap: 12px;
                font-family: system-ui, sans-serif; font-size: 0.85rem;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                z-index: 999997; max-width: 560px; width: 90%;
                animation: papyr-watt-in 0.25s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // ─── WATT SDK Object ──────────────────────────────────────────────────────

    const wattSDK = {

        monitor: _monitor,

        /**
         * Guided permission workflow — multi-step UX for requesting hardware APIs.
         *
         * @param {Object} options
         * @param {string} options.name - Workflow name (for logging)
         * @param {string[]} options.apis - Hardware APIs needed (e.g. ['camera', 'microphone'])
         * @param {string[]} [options.steps] - UX steps: 'explain' | 'request' | 'confirm' | 'fallback'
         * @param {Function} [options.onGranted] - Called when all permissions granted
         * @param {Function} [options.onDenied] - Called when any permission denied
         *
         * @example
         * papyr.watt.sdk.flow({
         *   name: 'camera-access',
         *   apis: ['camera'],
         *   onGranted: () => startCamera(),
         *   onDenied: () => showFallback()
         * });
         */
        flow(options = {}) {
            const { name = 'permission-flow', apis = [], onGranted, onDenied } = options;

            if (!papyr.isBrowser || !papyr.isBrowser()) {
                console.warn('[WATT SDK] flow() requires a browser environment.');
                return;
            }

            _injectStyles();

            const apiLabels = {
                camera: 'Camera', microphone: 'Microphone', location: 'Location',
                notifications: 'Notifications', bluetooth: 'Bluetooth', usb: 'USB'
            };
            const apiNames = apis.map(a => apiLabels[a] || a).join(', ');

            // Step: explain
            const overlay = _createOverlay();
            const card = _createCard(
                `Allow ${apiNames}?`,
                `This feature requires access to: ${apiNames}. ` +
                `Your privacy is protected by WATT — access is logged and transparent.`,
                [
                    {
                        label: 'Allow', primary: true,
                        onClick: () => {
                            overlay.remove();
                            _monitor._emit('intercept', { api: apis.join(','), policy: 'allow', blocked: false, flow: name });
                            if (onGranted) onGranted(apis);
                        }
                    },
                    {
                        label: 'Deny', primary: false,
                        onClick: () => {
                            overlay.remove();
                            _monitor._emit('intercept', { api: apis.join(','), policy: 'deny', blocked: true, flow: name });
                            if (onDenied) onDenied(apis);
                        }
                    }
                ]
            );

            overlay.appendChild(card);
            document.body.appendChild(overlay);
            console.log(`[WATT SDK] Permission flow "${name}" started for: ${apiNames}`);
        },

        /**
         * Show a custom transparency dialog.
         *
         * @param {Object} options
         * @param {string} [options.type] - Dialog type identifier
         * @param {string} [options.title] - Dialog heading
         * @param {string} [options.body] - Dialog body text
         * @param {Object[]} [options.actions] - Action buttons [{ label, value, primary }]
         * @param {Function} [options.onAction] - Called with the action value on click
         *
         * @example
         * papyr.watt.sdk.dialog({
         *   title: 'How we use your data',
         *   body: 'Your data is used only to improve your experience.',
         *   actions: [{ label: 'Got it', value: 'ok', primary: true }],
         *   onAction: (v) => console.log(v)
         * });
         */
        dialog(options = {}) {
            const {
                title = 'Privacy Notice',
                body = '',
                actions = [{ label: 'Close', value: 'close', primary: true }],
                onAction = null
            } = options;

            if (!papyr.isBrowser || !papyr.isBrowser()) return;
            _injectStyles();

            const overlay = _createOverlay();
            const card = _createCard(
                title, body,
                actions.map(a => ({
                    label: a.label,
                    primary: !!a.primary,
                    onClick: () => {
                        overlay.remove();
                        if (onAction) onAction(a.value);
                    }
                }))
            );

            overlay.setAttribute('data-papyr-watt-banner', 'dialog');
            overlay.appendChild(card);
            document.body.appendChild(overlay);
        },

        /**
         * Show a consent management banner.
         *
         * @param {Object} options
         * @param {string[]} options.categories - e.g. ['analytics', 'marketing', 'personalization']
         * @param {'none'|'all'} [options.defaultState='none'] - Default consent state
         * @param {string} [options.storageKey='papyr-consent'] - localStorage key for persistence
         * @param {Function} [options.onConsentChange] - Called with granted categories array
         *
         * @example
         * papyr.watt.sdk.consent({
         *   categories: ['analytics', 'marketing'],
         *   onConsentChange: (categories) => initAnalytics(categories)
         * });
         */
        consent(options = {}) {
            const {
                categories = [],
                defaultState = 'none',
                storageKey = 'papyr-consent',
                onConsentChange = null
            } = options;

            // Check existing stored consent
            const stored = _readConsent(storageKey);
            if (stored) {
                if (onConsentChange) onConsentChange(stored.granted || []);
                _monitor._emit('consent', { action: 'restored', categories: stored.granted });
                return;
            }

            if (!papyr.isBrowser || !papyr.isBrowser()) return;
            _injectStyles();

            const banner = document.createElement('div');
            banner.setAttribute('data-papyr-watt-banner', 'consent');
            banner.setAttribute('data-papyr-consent', 'true');
            banner.innerHTML = `
                <span style="flex:1;">
                    We use cookies for ${categories.join(', ')}.
                    <a href="#" style="color:#a5b4fc;margin-left:4px;">Learn more</a>
                </span>
                <button id="papyr-consent-accept" style="
                    background:#6C63FF;color:#fff;border:none;
                    padding:7px 14px;border-radius:6px;cursor:pointer;
                    font-size:0.8rem;font-weight:500;white-space:nowrap;
                ">Accept All</button>
                <button id="papyr-consent-reject" style="
                    background:transparent;color:#aaa;border:1px solid #444;
                    padding:7px 14px;border-radius:6px;cursor:pointer;
                    font-size:0.8rem;font-weight:500;white-space:nowrap;
                ">Reject All</button>
            `;

            document.body.appendChild(banner);

            document.getElementById('papyr-consent-accept').addEventListener('click', () => {
                _writeConsent(storageKey, { granted: categories, timestamp: Date.now() });
                banner.remove();
                _monitor._emit('consent', { action: 'accepted', categories });
                if (onConsentChange) onConsentChange(categories);
            });

            document.getElementById('papyr-consent-reject').addEventListener('click', () => {
                _writeConsent(storageKey, { granted: [], timestamp: Date.now() });
                banner.remove();
                _monitor._emit('consent', { action: 'rejected', categories: [] });
                if (onConsentChange) onConsentChange([]);
            });
        },

        /**
         * Show a privacy notice (GDPR/CCPA banner).
         *
         * @param {Object} options
         * @param {'gdpr'|'ccpa'|'custom'} [options.type='gdpr'] - Notice type
         * @param {string} [options.message] - Notice message
         * @param {string} [options.actionLabel='Accept'] - CTA label
         * @param {string} [options.privacyUrl] - Privacy policy URL
         * @param {Function} [options.onAccept] - Called when user accepts
         */
        notice(options = {}) {
            const {
                type = 'gdpr',
                message = type === 'ccpa'
                    ? 'We do not sell your personal information.'
                    : 'We use cookies to improve your experience.',
                actionLabel = 'Accept',
                privacyUrl = null,
                onAccept = null
            } = options;

            if (!papyr.isBrowser || !papyr.isBrowser()) return;
            _injectStyles();

            const banner = document.createElement('div');
            banner.setAttribute('data-papyr-watt-banner', type);
            banner.innerHTML = `
                <span style="flex:1;">${message}${
                    privacyUrl
                        ? ` <a href="${privacyUrl}" target="_blank" rel="noopener" style="color:#a5b4fc;">Privacy Policy</a>`
                        : ''
                }</span>
                <button id="papyr-notice-accept" style="
                    background:#6C63FF;color:#fff;border:none;
                    padding:7px 14px;border-radius:6px;cursor:pointer;
                    font-size:0.8rem;font-weight:500;
                ">${actionLabel}</button>
            `;

            document.body.appendChild(banner);
            document.getElementById('papyr-notice-accept').addEventListener('click', () => {
                banner.remove();
                if (onAccept) onAccept();
            });
        },

        /**
         * Disclose a third-party service to WATT transparency logs.
         * Also registers with papyr.trust.
         *
         * @param {Object} service
         * @param {string} service.name - Service display name
         * @param {string} [service.domain] - Domain pattern (e.g. 'google-analytics.com')
         * @param {'analytics'|'marketing'|'payment'|'auth'|'cdn'|'other'} [service.type]
         * @param {string[]} [service.dataCollected]
         * @param {string} [service.privacyUrl]
         */
        disclose(service) {
            if (papyr.trust && typeof papyr.trust.disclose === 'function') {
                papyr.trust.disclose(service);
            }
            _monitor._emit('disclosure', { service });
        }
    };

    // ─── Attach to papyr.watt ─────────────────────────────────────────────────

    papyr.watt = papyr.watt || {};
    papyr.watt.sdk = wattSDK;
});


// --- MODULE: core/pssr-sdk.js ---
/**
 * PAPYR PSSR SDK
 * Advanced rendering strategy builder for complex applications.
 * Extends papyr.pssr without modifying its core hydration integrity.
 *
 * papyr.pssr.sdk.strategy()   — rendering strategy builder
 * papyr.pssr.sdk.islands()    — lazy island orchestration
 * papyr.pssr.sdk.meta.pipe()  — metadata pipeline
 * papyr.pssr.sdk.stream()     — priority-lane streaming renderer
 * papyr.pssr.sdk.edge()       — edge deployment configuration
 * papyr.pssr.sdk.build.*      — build-time SSG tools
 */

coreInitializers.push((papyr) => {

    // ─── Route Pattern Matcher ────────────────────────────────────────────────

    function _matchesPattern(path, pattern) {
        if (pattern === path) return true;
        // Wildcard: '/blog/*' matches '/blog/my-post'
        if (pattern.endsWith('/*')) {
            const prefix = pattern.slice(0, -2);
            return path.startsWith(prefix + '/') || path === prefix;
        }
        // Param: '/products/:id'
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) return false;
        return patternParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
    }

    // ─── Metadata Pipeline ────────────────────────────────────────────────────

    const _metaPipeline = [];

    const metaSDK = {
        /**
         * Add a metadata transform to the SEO pipeline.
         * Each function receives (context, previousMeta) and returns a meta object.
         *
         * @param {Function|Function[]} transforms
         *
         * @example
         * papyr.pssr.sdk.meta.pipe([
         *   (ctx) => ({ title: ctx.route.title }),
         *   (ctx, prev) => ({ ...prev, og: { image: ctx.route.image } })
         * ]);
         */
        pipe(transforms) {
            const fns = Array.isArray(transforms) ? transforms : [transforms];
            fns.forEach(fn => { if (typeof fn === 'function') _metaPipeline.push(fn); });
        },

        /**
         * Run the metadata pipeline for a given context.
         * @param {Object} context - Route/page context
         * @returns {Object} Merged meta object
         */
        run(context = {}) {
            let meta = {};
            _metaPipeline.forEach(fn => {
                try {
                    const result = fn(context, { ...meta });
                    if (result && typeof result === 'object') {
                        meta = { ...meta, ...result };
                    }
                } catch (e) {
                    console.error('[PSSR SDK Meta] Pipeline transform error:', e);
                }
            });

            // Apply to papyr.seo if available
            if (papyr.seo && typeof papyr.seo === 'function' && Object.keys(meta).length > 0) {
                papyr.seo(meta);
            }

            return meta;
        },

        /** Clear the meta pipeline */
        clear() {
            _metaPipeline.length = 0;
        }
    };

    // ─── PSSR SDK Object ──────────────────────────────────────────────────────

    const pssrSDK = {

        meta: metaSDK,

        /**
         * Build and apply a rendering strategy across multiple routes.
         * Registers each route in the PSSR mode registry.
         *
         * @param {Object} options
         * @param {'csr'|'ssr'|'ssg'|'isr'} [options.default='csr'] - Default mode
         * @param {Object} [options.routes] - Route pattern → mode map
         * @returns {{ apply: Function, list: Function }} Strategy object
         *
         * @example
         * const strategy = papyr.pssr.sdk.strategy({
         *   default: 'ssr',
         *   routes: {
         *     '/blog/*': 'ssg',
         *     '/dashboard': 'ssr',
         *     '/chat': 'csr',
         *     '/products/:id': 'isr'
         *   }
         * });
         * strategy.apply();
         */
        strategy(options = {}) {
            const { default: defaultMode = 'csr', routes = {} } = options;

            return {
                _routes: routes,
                _default: defaultMode,

                /** Apply all route modes to the PSSR registry */
                apply() {
                    if (!papyr.pssr || typeof papyr.pssr.setRouteMode !== 'function') {
                        console.warn('[PSSR SDK] papyr.pssr.setRouteMode not available. Load PSSR core first.');
                        return;
                    }

                    Object.entries(routes).forEach(([pattern, mode]) => {
                        papyr.pssr.setRouteMode(pattern, mode);
                    });

                    papyr.pssr._defaultMode = defaultMode;
                    console.log(`[PSSR SDK] Strategy applied. Default: ${defaultMode}. Routes: ${Object.keys(routes).length}`);
                },

                /** Get the mode for a specific path */
                resolve(path) {
                    for (const [pattern, mode] of Object.entries(routes)) {
                        if (_matchesPattern(path, pattern)) return mode;
                    }
                    return defaultMode;
                },

                /** List all strategy entries */
                list() {
                    return Object.entries(routes).map(([pattern, mode]) => ({ pattern, mode }));
                }
            };
        },

        /**
         * Lazy island orchestration — hydrates islands only when they enter viewport.
         * Uses IntersectionObserver for performance.
         *
         * @param {Object} options
         * @param {string} [options.selector='[data-papyr-island]'] - Island selector
         * @param {boolean} [options.lazy=true] - Use IntersectionObserver for lazy hydration
         * @param {number} [options.threshold=0.1] - IO visibility threshold
         * @param {number} [options.rootMargin=50] - IO root margin in px
         *
         * @example
         * papyr.pssr.sdk.islands({ lazy: true, threshold: 0.2 });
         */
        islands(options = {}) {
            const {
                selector = '[data-papyr-island]',
                lazy = true,
                threshold = 0.1,
                rootMargin = 50
            } = options;

            if (!papyr.isBrowser || !papyr.isBrowser()) return;

            const islandEls = Array.from(document.querySelectorAll(selector));

            if (!lazy || typeof IntersectionObserver === 'undefined') {
                // Eager hydration fallback
                if (papyr.pssr && typeof papyr.pssr.hydrate === 'function') {
                    papyr.pssr.hydrate('body', null, { islandsOnly: true });
                }
                return;
            }

            // Lazy: hydrate when visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    if (el.getAttribute('data-papyr-hydrated') === 'true') return;

                    const name = el.getAttribute('data-papyr-island');
                    const Component = papyr._islandRegistry && papyr._islandRegistry.get(name);

                    if (Component) {
                        let props = {};
                        try {
                            const raw = el.getAttribute('data-papyr-island-props');
                            if (raw) props = JSON.parse(raw.replace(/&quot;/g, '"'));
                        } catch (e) {}

                        try {
                            if (papyr.hydrate) papyr.hydrate(el, () => Component(props));
                            el.setAttribute('data-papyr-hydrated', 'true');
                            console.log(`[PSSR SDK Islands] Lazy-hydrated "${name}" ✓`);
                        } catch (err) {
                            console.error(`[PSSR SDK Islands] Failed to hydrate "${name}":`, err);
                        }
                    }

                    observer.unobserve(el);
                });
            }, { threshold, rootMargin: `${rootMargin}px` });

            islandEls.forEach(el => observer.observe(el));
            console.log(`[PSSR SDK] Observing ${islandEls.length} island(s) for lazy hydration.`);
        },

        /**
         * Priority-lane streaming renderer with SEO-first delivery.
         *
         * @param {Function|Object} App - Component to render
         * @param {Object} [options]
         * @param {Function} [options.shell] - (head, body) => fullHtml
         * @param {string[]} [options.priority] - Ordered render priority lanes
         * @returns {ReadableStream}
         */
        stream(App, options = {}) {
            const { shell = null, chunkSize = 1024 } = options;

            if (!papyr.pssr || typeof papyr.pssr.stream !== 'function') {
                throw new Error('[PSSR SDK] papyr.pssr.stream not available.');
            }

            // Use the core PSSR priority stream (SEO head first, then body chunks)
            return papyr.pssr.stream(App, { chunkSize });
        },

        /**
         * Configure edge deployment for PSSR rendering.
         *
         * @param {Object} options
         * @param {'cloudflare'|'deno'|'bun'|'node'|'auto'} [options.runtime='auto']
         * @param {Object} [options.kv] - Edge KV namespace for ISR cache
         * @param {string[]} [options.regions] - Deployment regions
         * @param {number} [options.isrTtl=300] - Default ISR TTL for edge
         *
         * @example
         * papyr.pssr.sdk.edge({ runtime: 'cloudflare', isrTtl: 600 });
         */
        edge(options = {}) {
            const {
                runtime = 'auto',
                kv = null,
                regions = ['auto'],
                isrTtl = 300
            } = options;

            const detectedRuntime = runtime === 'auto'
                ? (papyr.edge && papyr.edge.isEdge() ? 'edge' : 'node')
                : runtime;

            papyr.pssr._edgeConfig = { runtime: detectedRuntime, kv, regions, isrTtl };

            // If KV is provided, override ISR cache with KV-backed storage
            if (kv && papyr.isr) {
                const originalCache = papyr.isr.cache.bind(papyr.isr);
                papyr.isr.cache = async (key, renderFn, ttlSeconds) => {
                    // Try KV first
                    try {
                        const cached = await kv.get(key);
                        if (cached) {
                            return { html: cached, hit: true, stale: false, age: 0 };
                        }
                    } catch (e) {}

                    // Fallback to memory cache
                    const result = await originalCache(key, renderFn, ttlSeconds || isrTtl);

                    // Write to KV
                    if (kv && result.html) {
                        try { await kv.put(key, result.html, { expirationTtl: isrTtl }); }
                        catch (e) {}
                    }

                    return result;
                };
            }

            console.log(`[PSSR SDK] Edge config applied. Runtime: ${detectedRuntime}, Regions: ${regions.join(', ')}, ISR TTL: ${isrTtl}s`);
            return papyr.pssr._edgeConfig;
        },

        /** Build-time SSG utilities */
        build: {
            /**
             * Generate static pages for all SSG routes.
             * @param {Array<{ path: string, componentFn: Function }>} routes
             * @returns {Promise<Array<{ path: string, html: string }>>}
             */
            async manifest(routes) {
                if (!papyr.pssr || typeof papyr.pssr.generateStaticManifest !== 'function') {
                    console.warn('[PSSR SDK] generateStaticManifest not available.');
                    return [];
                }
                return papyr.pssr.generateStaticManifest(routes);
            },

            /**
             * Prerender a list of routes concurrently.
             * @param {Object} options
             * @param {Array<{ path: string, componentFn: Function }>} options.routes
             * @param {number} [options.concurrency=4]
             * @returns {Promise<Array<{ path: string, html: string, duration: number }>>}
             */
            async prerender(options = {}) {
                const { routes = [], concurrency = 4 } = options;
                const results = [];

                // Process in batches of `concurrency`
                for (let i = 0; i < routes.length; i += concurrency) {
                    const batch = routes.slice(i, i + concurrency);
                    const batchResults = await Promise.all(
                        batch.map(async route => {
                            const start = Date.now();
                            try {
                                const element = typeof route.componentFn === 'function'
                                    ? route.componentFn({})
                                    : route.componentFn;
                                const html = papyr.ssr ? papyr.ssr(element) : '';
                                return { path: route.path, html, duration: Date.now() - start };
                            } catch (err) {
                                console.error(`[PSSR SDK Prerender] Failed: ${route.path}`, err);
                                return { path: route.path, html: '', duration: Date.now() - start, error: err.message };
                            }
                        })
                    );
                    results.push(...batchResults);
                    console.log(`[PSSR SDK Prerender] Batch ${Math.floor(i / concurrency) + 1}: ${batch.length} pages rendered.`);
                }

                const total = results.reduce((acc, r) => acc + r.duration, 0);
                console.log(`[PSSR SDK Prerender] ✅ ${results.length} pages prerendered in ${total}ms.`);
                return results;
            }
        }
    };

    // ─── Attach to papyr.pssr ─────────────────────────────────────────────────

    if (papyr.pssr) {
        papyr.pssr.sdk = pssrSDK;
    } else {
        // Defer until pssr is available
        papyr._pssrSDKPending = pssrSDK;
    }
});


// --- MODULE: core/freeform.js ---
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



    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') { window.papyr = papyrInstance; }
    else if (typeof global !== 'undefined') { global.papyr = papyrInstance; }
    const papyr = papyrInstance;

// --- MODULE: core/trust.js ---
/**
 * PAPYR TRUST BOUNDARIES
 * Runtime trust audit API. Documents and surfaces the 4-zone trust model:
 *   Zone 1 — Papyrus Framework Core (framework-controlled, immutable)
 *   Zone 2 — Plugin Layer (developer-installed, scoped)
 *   Zone 3 — Third-Party Services (external, monitored by WATT)
 *   Zone 4 — Developer Responsibility (application-owned)
 *
 * papyr.trust.report()     — full trust state snapshot
 * papyr.trust.audit()      — surfaced warnings and violations
 * papyr.trust.owns(ns)     — check if Papyrus owns a namespace
 * papyr.trust.zone(ns)     — resolve namespace to a trust zone (1-4)
 * papyr.trust.undisclosed() — surface untracked third-party services
 * papyr.trust.disclose()   — register a known third-party service
 */

coreInitializers.push((papyr) => {

    // Zone 1: namespaces owned by the Papyrus framework
    const _zone1Namespaces = new Set([
        'watt', 'security', 'scheduler', 'power', 'recovery',
        'pssr', 'isr', 'edge', 'router', 'reactivity', 'config',
        'controls', 'access', 'trust', 'seo', 'sdk', 'diagnostics',
        'ssr', 'hydrate', 'island', 'registerIsland', 'theme',
        'state', 'signal', 'computed', 'effect', 'watch',
        'component', 'mount', 'h', 'isBrowser', 'isServer',
        'warn', 'plugin', 'style', 'layout', 'animate', 'math',
        'db', 'auth', 'api', 'payments', 'orm', 'crud',
        'game', 'physics', 'ml', 'ocr', 'ai', 'charts',
        'virtualize', 'accessibility', 'renovate', 'gateway',
        'freeform', 'user'
    ]);

    // Zone 2: plugins registered by developers
    const _zone2Plugins = [];

    // Zone 3: detected and disclosed third-party services
    const _zone3Detected = new Set();
    const _zone3Disclosed = [];

    // Zone 4: developer responsibilities (canonical static list)
    const _zone4Responsibilities = [
        'Application business logic',
        'Authentication & authorization (sessions, tokens, roles)',
        'Data validation & input sanitization',
        'API key security (never expose in client bundles)',
        'Privacy policy compliance (GDPR, CCPA, COPPA)',
        'Content security (what is rendered)',
        'Plugin auditing (third-party plugins)',
        'Dependency security (npm packages)',
        'Infrastructure & TLS certificates',
        'AI prompt safety (Papyrus does not filter AI content)',
        'ISR cache invalidation timing',
        'Edge deployment secrets & environment variables'
    ];

    papyr.trust = {

        /**
         * Full trust state report for the current runtime.
         * @returns {Object} Trust zone snapshot
         */
        report() {
            const zone1 = {};
            _zone1Namespaces.forEach(ns => {
                zone1[ns] = papyr[ns] !== undefined ? 'active' : 'inactive';
            });

            return {
                timestamp: new Date().toISOString(),
                papyrusVersion: '3.1.3',
                zone1: {
                    description: 'Papyrus Framework Core — immutable, framework-controlled',
                    systems: zone1
                },
                zone2: {
                    description: 'Plugin Layer — developer-installed, scoped, additive',
                    plugins: [..._zone2Plugins],
                    adapters: (papyr.sdk && papyr.sdk.adapter) ? papyr.sdk.adapter.list() : []
                },
                zone3: {
                    description: 'Third-Party Services — external, monitored by WATT, not controlled by Papyrus',
                    monitoredOrigins: _zone3Detected.size,
                    disclosedServices: _zone3Disclosed.map(s => s.name),
                    undisclosedDetected: this.undisclosed()
                },
                zone4: {
                    description: 'Developer Responsibility — application-owned, not managed by Papyrus',
                    responsibilities: [..._zone4Responsibilities]
                }
            };
        },

        /**
         * Check if Papyrus owns and is responsible for a given namespace.
         * @param {string} namespace - e.g. 'watt.policies', 'state', 'my-plugin'
         * @returns {boolean}
         */
        owns(namespace) {
            const root = namespace.split('.')[0];
            return _zone1Namespaces.has(root);
        },

        /**
         * Resolve a namespace or service name to its trust zone (1–4).
         * @param {string} namespace
         * @returns {1|2|3|4}
         */
        zone(namespace) {
            const root = namespace.split('.')[0];
            if (_zone1Namespaces.has(root)) return 1;
            if (_zone2Plugins.some(p => p.name === root)) return 2;
            // Zone 4: common developer-owned concepts
            const zone4Patterns = ['auth', 'business', 'api-key', 'prompt', 'content', 'state'];
            if (zone4Patterns.some(p => root.includes(p))) return 4;
            return 3; // Unknown = third-party by default
        },

        /**
         * List third-party origins detected by WATT that have not been disclosed.
         * @returns {string[]}
         */
        undisclosed() {
            const disclosedDomains = _zone3Disclosed.map(s =>
                s.domain || (s.name || '').toLowerCase().replace(/\s+/g, '')
            );
            return Array.from(_zone3Detected).filter(origin =>
                !disclosedDomains.some(d => origin.includes(d))
            );
        },

        /**
         * Disclose a known third-party service to WATT.
         * Prevents it from appearing in undisclosed() warnings.
         *
         * @param {Object} service
         * @param {string} service.name - Display name (e.g. 'Google Analytics')
         * @param {string} [service.domain] - Domain pattern (e.g. 'google-analytics.com')
         * @param {string} [service.type] - 'analytics' | 'marketing' | 'payment' | 'auth' | 'cdn'
         * @param {string[]} [service.dataCollected] - What data is collected
         * @param {string} [service.privacyUrl] - Vendor privacy policy URL
         *
         * @example
         * papyr.trust.disclose({
         *   name: 'Google Analytics',
         *   domain: 'google-analytics.com',
         *   type: 'analytics',
         *   dataCollected: ['page_views', 'device_info'],
         *   privacyUrl: 'https://policies.google.com/privacy'
         * });
         */
        disclose(service) {
            if (!service || !service.name) return;
            _zone3Disclosed.push(service);
            console.log(`[Papyr Trust] Third-party service disclosed: "${service.name}" (${service.type || 'unknown type'})`);
        },

        /**
         * Run a trust audit and surface all active warnings and violations.
         * Emits console warnings/errors. Returns a structured result.
         *
         * @returns {{ passed: boolean, violations: Array, warnings: Array }}
         *
         * @example
         * const result = papyr.trust.audit();
         * if (!result.passed) process.exit(1); // Use in CI
         */
        audit() {
            const violations = [];
            const warnings = [];

            // Check WATT mode
            if (papyr.config) {
                const wattConfig = papyr.config.get('watt');
                if (wattConfig && wattConfig.mode === 'none') {
                    violations.push({
                        code: 'WATT_DISABLED',
                        level: 'critical',
                        message: 'WATT mode is "none". All hardware API protections and network interceptions are disabled.'
                    });
                }
            }

            // Check undisclosed services
            const undisclosed = this.undisclosed();
            if (undisclosed.length > 0) {
                warnings.push({
                    code: 'UNDISCLOSED_SERVICES',
                    level: 'warn',
                    message: `${undisclosed.length} undisclosed third-party origin(s) detected: ${undisclosed.join(', ')}`
                });
            }

            // Check consent banner presence
            if (papyr.isBrowser && papyr.isBrowser() && typeof document !== 'undefined') {
                const hasBanner = document.querySelector('[data-papyr-watt-banner]') ||
                                  document.querySelector('[data-papyr-consent]');
                if (!hasBanner && _zone3Disclosed.length > 0) {
                    warnings.push({
                        code: 'MISSING_CONSENT_BANNER',
                        level: 'warn',
                        message: 'Third-party services are disclosed but no consent banner was detected. GDPR/CCPA compliance may be missing.'
                    });
                }
            }

            // Check for plugins with no declared scope
            const unscopedPlugins = _zone2Plugins.filter(p => !p.scope || p.scope === 'unknown');
            if (unscopedPlugins.length > 0) {
                warnings.push({
                    code: 'UNSCOPED_PLUGINS',
                    level: 'warn',
                    message: `${unscopedPlugins.length} plugin(s) have no declared scope: ${unscopedPlugins.map(p => p.name).join(', ')}`
                });
            }

            // Emit to console
            violations.forEach(v => {
                console.error(`[Papyr Trust Audit] ⛔ ${v.code}: ${v.message}`);
            });
            warnings.forEach(w => {
                console.warn(`[Papyr Trust Audit] ⚠️  ${w.code}: ${w.message}`);
            });

            if (violations.length === 0 && warnings.length === 0) {
                console.log('[Papyr Trust Audit] ✅ No trust violations detected.');
            }

            return {
                passed: violations.length === 0,
                violations,
                warnings,
                timestamp: new Date().toISOString()
            };
        },

        // ─── Internal APIs (used by WATT and plugin system) ──────────────────

        /**
         * @internal Called by WATT network monitor to register a detected origin.
         */
        _detectOrigin(url) {
            try {
                const origin = new URL(url).hostname;
                _zone3Detected.add(origin);
            } catch (e) {
                if (url) _zone3Detected.add(String(url));
            }
        },

        /**
         * @internal Called by papyr.plugin() to register a plugin in Zone 2.
         */
        _registerPlugin(name, meta = {}) {
            if (!_zone2Plugins.find(p => p.name === name)) {
                _zone2Plugins.push({
                    name,
                    scope: meta.scope || 'unknown',
                    version: meta.version || 'unknown',
                    trustedBy: 'developer',
                    registeredAt: new Date().toISOString()
                });
            }
        }
    };
});


// --- MODULE: core/config.js ---
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


// --- MODULE: core/access.js ---
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



    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { papyr: papyrInstance, trust: papyrInstance.trust, access: papyrInstance.access };
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
        exports.trust = papyrInstance.trust;
        exports.access = papyrInstance.access;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
