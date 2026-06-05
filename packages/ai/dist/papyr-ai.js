/**
 * PAPYR STATIC SITE LIBRARY - Advanced Engineering Modular Bundle
 * v3.1.2 - Core Reactivity, AI/ML Toolkits, 3D Immersive Graphics, 2D Verlet Physics, and PDF Exporter
 * Released under MIT License.
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
            storage: 'allow'
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

        // 1. Geolocation Access Interception
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

    papyr.page = (path, componentFn) => {
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



    // Export isomorphic context BEFORE loading plugins
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    const papyr = papyrInstance;

// --- MODULE: plugins/particles.js ---
/**
 * PAPYR PARTICLES ENGINE
 * High-performance, zero-dependency HTML5 Canvas Particle System.
 */
(function() {
    papyr.particles = (options = {}) => {
        const { type = 'snow', count = 100, speed = 1, color = '#ffffff' } = options;
        
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none'; // Let clicks pass through
        canvas.style.zIndex = '0';

        let ctx = canvas.getContext('2d');
        let particles = [];
        let width = 0, height = 0;

        const resize = () => {
            // Match parent container size
            let parent = canvas.parentElement || document.body;
            width = parent.clientWidth || window.innerWidth;
            height = parent.clientHeight || window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: Math.random() * 2 + 1, // radius
                    d: Math.random() * count, // density
                    vx: (Math.random() - 0.5) * speed,
                    vy: (Math.random() * speed) + (type === 'snow' ? 1 : -1) // Snow falls down, fire/sparks float up
                });
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = color;
            ctx.beginPath();
            
            for (let i = 0; i < count; i++) {
                let p = particles[i];
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
            }
            ctx.fill();
            update();
        };

        const update = () => {
            for (let i = 0; i < count; i++) {
                let p = particles[i];
                p.y += p.vy;
                p.x += p.vx;

                // Wrap around edges
                if (p.x > width + 5 || p.x < -5 || p.y > height) {
                    if (type === 'snow') {
                        // Reset to top
                        particles[i] = { x: Math.random() * width, y: -10, r: p.r, d: p.d, vx: p.vx, vy: p.vy };
                    } else {
                        // Reset to bottom
                        particles[i] = { x: Math.random() * width, y: height + 10, r: p.r, d: p.d, vx: p.vx, vy: p.vy };
                    }
                }
            }
        };

        let stopThrottle = null;
        let animId = null;

        const resizeHandler = () => {
            resize();
            initParticles();
        };

        // Mount hook
        setTimeout(() => {
            resize();
            initParticles();
            window.addEventListener('resize', resizeHandler);
            
            if (papyr.power && typeof papyr.power.throttle === 'function') {
                stopThrottle = papyr.power.throttle(render);
            } else {
                const legacyLoop = () => {
                    if (typeof document !== 'undefined' && !document.body.contains(canvas)) {
                        if (animId) cancelAnimationFrame(animId);
                        return;
                    }
                    render();
                    animId = requestAnimationFrame(legacyLoop);
                };
                animId = requestAnimationFrame(legacyLoop);
            }
        }, 50);

        const cleanup = () => {
            window.removeEventListener('resize', resizeHandler);
            if (stopThrottle) stopThrottle();
            if (animId) cancelAnimationFrame(animId);
        };
        if (!canvas._cleanups) canvas._cleanups = [];
        canvas._cleanups.push(cleanup);

        return canvas;
    };
})();


// --- MODULE: plugins/immersive.js ---
/**
 * PAPYR 3D / IMMERSIVE ENGINE
 * High-performance, zero-dependency cinematic three-dimensional scene orchestration.
 * v2.0 - Intelligent Three.js bindings, parallax depth, and Canvas2D holographic fallbacks.
 */
(function(window) {
    // Isomorphic/reactive value retriever
    function getValue(val) {
        if (val && typeof val === 'object' && val.subscribe && 'value' in val) {
            return val.value;
        }
        if (typeof val === 'function') {
            return val();
        }
        return val;
    }

    // Custom 3D Shape generators for the HTML5 Canvas2D fallback
    function generateCube(size) {
        const s = size / 2;
        const vertices = [
            {x: -s, y: -s, z: -s}, {x: s, y: -s, z: -s}, {x: s, y: s, z: -s}, {x: -s, y: s, z: -s},
            {x: -s, y: -s, z: s},  {x: s, y: -s, z: s},  {x: s, y: s, z: s},  {x: -s, y: s, z: s}
        ];
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // back face
            [4, 5], [5, 6], [6, 7], [7, 4], // front face
            [0, 4], [1, 5], [2, 6], [3, 7]  // connections
        ];
        return { vertices, edges };
    }

    function generateSphere(radius, latCount = 8, lonCount = 8) {
        const vertices = [];
        const edges = [];
        for (let lat = 0; lat <= latCount; lat++) {
            const theta = lat * Math.PI / latCount;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let lon = 0; lon < lonCount; lon++) {
                const phi = lon * 2 * Math.PI / lonCount;
                const x = radius * sinTheta * Math.cos(phi);
                const y = radius * cosTheta;
                const z = radius * sinTheta * Math.sin(phi);
                vertices.push({ x, y, z });
                
                const currIdx = lat * lonCount + lon;
                
                // Connect to next longitude ring
                const nextLonIdx = lat * lonCount + ((lon + 1) % lonCount);
                edges.push([currIdx, nextLonIdx]);
                
                // Connect to next latitude ring
                if (lat < latCount) {
                    const nextLatIdx = (lat + 1) * lonCount + lon;
                    edges.push([currIdx, nextLatIdx]);
                }
            }
        }
        return { vertices, edges };
    }

    function generateTorus(radius, tube, mainSeg = 12, tubeSeg = 8) {
        const vertices = [];
        const edges = [];
        for (let i = 0; i < mainSeg; i++) {
            const u = i * 2 * Math.PI / mainSeg;
            const cosU = Math.cos(u);
            const sinU = Math.sin(u);
            
            for (let j = 0; j < tubeSeg; j++) {
                const v = j * 2 * Math.PI / tubeSeg;
                const x = (radius + tube * Math.cos(v)) * cosU;
                const y = (radius + tube * Math.cos(v)) * sinU;
                const z = tube * Math.sin(v);
                vertices.push({ x, y, z });

                const currIdx = i * tubeSeg + j;
                
                // Connect around tube circle
                const nextTubeIdx = i * tubeSeg + ((j + 1) % tubeSeg);
                edges.push([currIdx, nextTubeIdx]);
                
                // Connect around torus ring
                const nextMainIdx = ((i + 1) % mainSeg) * tubeSeg + j;
                edges.push([currIdx, nextMainIdx]);
            }
        }
        return { vertices, edges };
    }

    function rotatePoint(x, y, z, rx, ry, rz) {
        // X-axis rotation
        let cosX = Math.cos(rx), sinX = Math.sin(rx);
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        // Y-axis rotation
        let cosY = Math.cos(ry), sinY = Math.sin(ry);
        let x2 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;

        // Z-axis rotation
        let cosZ = Math.cos(rz), sinZ = Math.sin(rz);
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        return { x: x3, y: y3, z: z2 };
    }

    // Helper: Smart Three.js WebGL Orchestrator
    function bootThreeJS(canvas, config) {
        try {
            const w = canvas.width;
            const h = canvas.height;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            camera.position.z = 5;

            // Load environments using lights and particles
            let particlesMesh;
            if (config.particles) {
                const particlesGeometry = new THREE.BufferGeometry();
                const particlesCount = config.environment === 'cyberpunk' ? 400 : 800;
                const posArray = new Float32Array(particlesCount * 3);

                for (let i = 0; i < particlesCount * 3; i++) {
                    posArray[i] = (Math.random() - 0.5) * 10;
                }

                particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

                let particleColor = '#ffffff';
                if (config.environment === 'cyberpunk') particleColor = '#ff007f';
                if (config.environment === 'underwater') particleColor = '#00f0ff';

                const material = new THREE.PointsMaterial({
                    size: 0.02,
                    color: particleColor,
                    transparent: true,
                    opacity: 0.8
                });

                particlesMesh = new THREE.Points(particlesGeometry, material);
                scene.add(particlesMesh);
            }

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0x6366f1, 2);
            pointLight.position.set(2, 3, 4);
            scene.add(pointLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
            dirLight.position.set(-2, 4, 3);
            scene.add(dirLight);

            // Objects mapping and reactive tracking
            const meshTrackers = [];
            if (config.objects && Array.isArray(config.objects)) {
                config.objects.forEach(obj => {
                    let geom;
                    const type = getValue(obj.type);
                    const size = getValue(obj.size !== undefined ? obj.size : 1);
                    
                    if (type === 'cube') {
                        const width = getValue(obj.width || size);
                        const height = getValue(obj.height || size);
                        const depth = getValue(obj.depth || size);
                        geom = new THREE.BoxGeometry(width, height, depth);
                    } else if (type === 'sphere') {
                        const radius = getValue(obj.radius !== undefined ? obj.radius : size);
                        geom = new THREE.SphereGeometry(radius, 32, 32);
                    } else if (type === 'torus') {
                        const radius = getValue(obj.radius !== undefined ? obj.radius : size * 0.8);
                        const tube = getValue(obj.tube !== undefined ? obj.tube : size * 0.2);
                        geom = new THREE.TorusGeometry(radius, tube, 16, 100);
                    } else {
                        geom = new THREE.BoxGeometry(size, size, size);
                    }

                    const isWire = getValue(obj.wireframe !== undefined ? obj.wireframe : false);
                    const matColor = getValue(obj.color || '#6366f1');
                    const mat = new THREE.MeshStandardMaterial({
                        color: matColor,
                        wireframe: isWire,
                        roughness: 0.3,
                        metalness: 0.8
                    });

                    const mesh = new THREE.Mesh(geom, mat);
                    const pos = getValue(obj.position) || [0, 0, 0];
                    mesh.position.set(pos[0], pos[1], pos[2]);
                    scene.add(mesh);

                    const tracker = { mesh, obj };
                    meshTrackers.push(tracker);

                    // Reactive subscriptions
                    if (obj.color && typeof obj.color.subscribe === 'function') {
                        obj.color.subscribe(c => {
                            mesh.material.color.set(c);
                        });
                    }
                    if (obj.position && typeof obj.position.subscribe === 'function') {
                        obj.position.subscribe(p => {
                            if (!tracker.physicsInitialized) {
                                mesh.position.set(p[0], p[1], p[2]);
                            }
                        });
                    }
                    if (obj.size && typeof obj.size.subscribe === 'function') {
                        obj.size.subscribe(s => {
                            mesh.scale.set(s, s, s);
                        });
                    }
                    if (obj.radius && typeof obj.radius.subscribe === 'function') {
                        obj.radius.subscribe(r => {
                            mesh.scale.set(r, r, r);
                        });
                    }
                });
            }

            // Motion tracker
            let mouseX = 0, mouseY = 0;
            let mouseMoveHandler = null;
            if (config.depth) {
                mouseMoveHandler = (e) => {
                    mouseX = (e.clientX / window.innerWidth) - 0.5;
                    mouseY = (e.clientY / window.innerHeight) - 0.5;
                };
                window.addEventListener('mousemove', mouseMoveHandler);
            }

            const clock = new THREE.Clock();
            let animId = null;
            const tick = () => {
                if (typeof document !== 'undefined' && !document.body.contains(canvas)) {
                    if (animId) cancelAnimationFrame(animId);
                    return;
                }
                const elapsedTime = clock.getElapsedTime();

                // Rotate particles mesh
                if (particlesMesh) {
                    particlesMesh.rotation.y = elapsedTime * 0.05;
                    if (config.environment === 'underwater') {
                        particlesMesh.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
                    }
                }

                // Physics/Gravity Update
                const gravityActive = getValue(config.gravityActive);

                // Spin and position updates
                meshTrackers.forEach(t => {
                    if (gravityActive) {
                        if (!t.physicsInitialized) {
                            t.pos = [...(getValue(t.obj.position) || [0, 0, 0])];
                            t.vel = [
                                (Math.random() - 0.5) * 0.04,
                                0.0,
                                (Math.random() - 0.5) * 0.04
                            ];
                            t.physicsInitialized = true;
                        }
                        t.vel[1] += -0.005; // gravity acceleration
                        t.pos[0] += t.vel[0];
                        t.pos[1] += t.vel[1];
                        t.pos[2] += t.vel[2];

                        // Collisions
                        if (t.pos[1] <= -1.8) {
                            t.pos[1] = -1.8;
                            t.vel[1] = -t.vel[1] * 0.75; // bounce
                            t.vel[0] += (Math.random() - 0.5) * 0.01;
                            t.vel[2] += (Math.random() - 0.5) * 0.01;
                        }
                        if (t.pos[1] >= 2.5) {
                            t.pos[1] = 2.5;
                            t.vel[1] = -t.vel[1] * 0.75;
                        }
                        if (t.pos[0] <= -3.0) { t.pos[0] = -3.0; t.vel[0] = -t.vel[0] * 0.9; }
                        if (t.pos[0] >= 3.0) { t.pos[0] = 3.0; t.vel[0] = -t.vel[0] * 0.9; }
                        if (t.pos[2] <= -2.0) { t.pos[2] = -2.0; t.vel[2] = -t.vel[2] * 0.9; }
                        if (t.pos[2] >= 2.0) { t.pos[2] = 2.0; t.vel[2] = -t.vel[2] * 0.9; }

                        t.mesh.position.set(t.pos[0], t.pos[1], t.pos[2]);
                    } else {
                        if (t.physicsInitialized) {
                            const origPos = getValue(t.obj.position) || [0, 0, 0];
                            t.mesh.position.set(origPos[0], origPos[1], origPos[2]);
                            t.physicsInitialized = false;
                            t.pos = null;
                            t.vel = null;
                        }
                    }

                    const spin = getValue(t.obj.spin) || [0, 0, 0];
                    t.mesh.rotation.x += getValue(spin[0]);
                    t.mesh.rotation.y += getValue(spin[1]);
                    t.mesh.rotation.z += getValue(spin[2]);
                });

                // Smooth camera depth panning
                if (config.depth) {
                    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
                    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
                    camera.lookAt(scene.position);
                }

                renderer.render(scene, camera);
                animId = requestAnimationFrame(tick);
            };
            tick();

            // Resize support
            const resizeHandler = () => {
                const parent = canvas.parentElement;
                if (parent) {
                    const newW = parent.clientWidth;
                    const newH = parent.clientHeight;
                    canvas.width = newW;
                    canvas.height = newH;
                    camera.aspect = newW / newH;
                    camera.updateProjectionMatrix();
                    renderer.setSize(newW, newH);
                }
            };
            window.addEventListener('resize', resizeHandler);

            if (!canvas._cleanups) canvas._cleanups = [];
            canvas._cleanups.push(() => {
                if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler);
                window.removeEventListener('resize', resizeHandler);
                if (animId) cancelAnimationFrame(animId);
                try { renderer.dispose(); } catch(e) {}
            });
        } catch (e) {
            console.warn("Three.js WebGL context initialization failed, falling back to Canvas2D.", e);
            bootFallbackCanvas(canvas, config);
        }
    }

    // Helper: Ultra-Premium Canvas2D Dynamic Perspective Engine
    function bootFallbackCanvas(canvas, config) {
        const ctx = canvas.getContext('2d');
        let w = canvas.width;
        let h = canvas.height;
        let particles = [];
        let mouseX = 0, mouseY = 0;
        let currentMouseX = 0, currentMouseY = 0;
        let animId = null;
        let mouseMoveHandler = null;

        // Trace pointer coordinates for micro-smooth inertia panning depth
        if (config.depth) {
            mouseMoveHandler = (e) => {
                mouseX = (e.clientX / window.innerWidth) - 0.5;
                mouseY = (e.clientY / window.innerHeight) - 0.5;
            };
            window.addEventListener('mousemove', mouseMoveHandler);
        }

        // Initialize particles based on environment configuration
        const count = config.environment === 'cyberpunk' ? 120 : 250;
        
        const initParticles = () => {
            particles = [];
            for (let i = 0; i < count; i++) {
                if (config.environment === 'space') {
                    // Space: 3D coordinates (x, y, z) for realistic perspective starfield warp
                    particles.push({
                        x: (Math.random() - 0.5) * w * 2,
                        y: (Math.random() - 0.5) * h * 2,
                        z: Math.random() * w, // depth parameter
                        r: Math.random() * 1.5 + 0.5,
                        color: `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.5})`
                    });
                } else if (config.environment === 'cyberpunk') {
                    // Cyberpunk: Sparks floating up, code blocks, grid coordinate nodes
                    particles.push({
                        x: Math.random() * w,
                        y: Math.random() * h,
                        vy: -(Math.random() * 1.2 + 0.3),
                        vx: (Math.random() - 0.5) * 0.4,
                        r: Math.random() * 2 + 1,
                        color: Math.random() > 0.4 ? 'rgba(255, 0, 127, 0.7)' : 'rgba(0, 240, 255, 0.7)',
                        sparkle: Math.random() > 0.7
                    });
                } else {
                    // Underwater: Bubbles floating upwards with smooth horizontal sine waves
                    particles.push({
                        x: Math.random() * w,
                        y: h + Math.random() * 100,
                        vy: -(Math.random() * 0.8 + 0.4),
                        amplitude: Math.random() * 1.5 + 0.5,
                        frequency: Math.random() * 0.02 + 0.005,
                        phase: Math.random() * Math.PI * 2,
                        r: Math.random() * 3 + 1,
                        opacity: Math.random() * 0.4 + 0.2
                    });
                }
            }
        };
        initParticles();

        // 3D holographic rendering loop
        const draw = () => {
            // Check and update backing store size to match CSS display size perfectly
            const rect = canvas.getBoundingClientRect();
            const displayW = Math.floor(rect.width) || 300;
            const displayH = Math.floor(rect.height) || 300;
            if (canvas.width !== displayW || canvas.height !== displayH) {
                canvas.width = displayW;
                canvas.height = displayH;
                w = displayW;
                h = displayH;
                initParticles();
            }

            ctx.clearRect(0, 0, w, h);

            // Interpolate pointer displacement smoothly for camera lag
            currentMouseX += (mouseX - currentMouseX) * 0.05;
            currentMouseY += (mouseY - currentMouseY) * 0.05;

            const camX = currentMouseX * 100;
            const camY = currentMouseY * 100;

            if (config.environment === 'space') {
                // Background deep void space
                const spaceGrad = ctx.createRadialGradient(w/2 - camX, h/2 - camY, 10, w/2, h/2, w);
                spaceGrad.addColorStop(0, '#070a1a');
                spaceGrad.addColorStop(1, '#020308');
                ctx.fillStyle = spaceGrad;
                ctx.fillRect(0, 0, w, h);

                // Draw deep stardust nebula glow
                ctx.fillStyle = 'rgba(99, 102, 241, 0.03)';
                ctx.beginPath();
                ctx.arc(w/2 - camX*0.5, h/2 - camY*0.5, 300, 0, Math.PI * 2);
                ctx.fill();

                // Project 3D coordinate star points
                for (let i = 0; i < count; i++) {
                    const p = particles[i];
                    p.z -= 1.5; // fly forward

                    // Loop back stars that fly past the screen
                    if (p.z <= 0) {
                        p.z = w;
                        p.x = (Math.random() - 0.5) * w * 2;
                        p.y = (Math.random() - 0.5) * h * 2;
                    }

                    // 3D perspective scaling factor
                    const fov = 400;
                    const scale = fov / (fov + p.z);
                    const projX = (p.x - camX) * scale + w / 2;
                    const projY = (p.y - camY) * scale + h / 2;

                    if (projX >= 0 && projX < w && projY >= 0 && projY < h) {
                        ctx.fillStyle = p.color;
                        ctx.beginPath();
                        ctx.arc(projX, projY, p.r * scale * 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } 
            else if (config.environment === 'cyberpunk') {
                // Cyberpunk: Synthwave neon vector horizon background
                const darkGrad = ctx.createLinearGradient(0, 0, 0, h);
                darkGrad.addColorStop(0, '#090514');
                darkGrad.addColorStop(1, '#030206');
                ctx.fillStyle = darkGrad;
                ctx.fillRect(0, 0, w, h);

                // Draw moving 3D wireframe perspective floor grid
                ctx.strokeStyle = 'rgba(255, 0, 127, 0.07)';
                ctx.lineWidth = 1;
                const gridHorizon = h * 0.55 - camY * 0.3;
                const gridYOffset = (Date.now() * 0.05) % 40;

                // Perspective grid lines crossing horizon
                for (let i = -10; i <= 10; i++) {
                    const lineX = w / 2 + i * 80;
                    ctx.beginPath();
                    ctx.moveTo(w / 2 - camX * 0.8, gridHorizon);
                    ctx.lineTo(lineX - camX * 1.5, h);
                    ctx.stroke();
                }

                // Horizontal moving waves compressing near horizon
                for (let y = gridHorizon; y < h; y += 25) {
                    const progress = (y - gridHorizon) / (h - gridHorizon);
                    // Add scrolling offset
                    let nextY = gridHorizon + progress * (h - gridHorizon) + gridYOffset * progress;
                    if (nextY < h) {
                        ctx.beginPath();
                        ctx.moveTo(0, nextY);
                        ctx.lineTo(w, nextY);
                        ctx.stroke();
                    }
                }

                // Render neon glowing nodes
                for (let i = 0; i < count; i++) {
                    const p = particles[i];
                    p.y += p.vy;
                    p.x += p.vx;

                    if (p.y < 0) {
                        p.y = h;
                        p.x = Math.random() * w;
                    }

                    // Render glows around particles
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x - camX * 0.6, p.y - camY * 0.6, p.r * (p.sparkle ? (Math.sin(Date.now() * 0.01) * 0.4 + 1.2) : 1), 0, Math.PI * 2);
                    ctx.fill();
                }
            } 
            else {
                // Underwater: vertical shafts of light (caustics) and rising organic bubbles
                const waterGrad = ctx.createLinearGradient(0, 0, 0, h);
                waterGrad.addColorStop(0, '#001a33');
                waterGrad.addColorStop(1, '#000812');
                ctx.fillStyle = waterGrad;
                ctx.fillRect(0, 0, w, h);

                // Rotating shifting caustics light shafts
                ctx.fillStyle = 'rgba(0, 240, 255, 0.015)';
                const shaftsCount = 4;
                for (let i = 0; i < shaftsCount; i++) {
                    const offset = Math.sin(Date.now() * 0.0004 + i) * 80;
                    ctx.beginPath();
                    ctx.moveTo(w * 0.2 + i * 200 + offset - camX, 0);
                    ctx.lineTo(w * 0.35 + i * 200 + offset * 1.5 - camX, h);
                    ctx.lineTo(w * 0.15 + i * 200 + offset * 1.2 - camX, h);
                    ctx.closePath();
                    ctx.fill();
                }

                // Draw bubbles
                for (let i = 0; i < count; i++) {
                    const p = particles[i];
                    p.y += p.vy;
                    
                    // Sine wave horizontal drift
                    const angle = p.phase + Date.now() * p.frequency;
                    const shiftX = Math.sin(angle) * p.amplitude;

                    if (p.y < -20) {
                        p.y = h + Math.random() * 50;
                        p.x = Math.random() * w;
                    }

                    // Render hollow translucent bubbles
                    ctx.strokeStyle = `rgba(0, 240, 255, ${p.opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(p.x + shiftX - camX * 0.4, p.y - camY * 0.4, p.r, 0, Math.PI * 2);
                    ctx.stroke();

                    // Bubble highlight
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(p.x + shiftX - camX * 0.4 - p.r*0.3, p.y - camY * 0.4 - p.r*0.3, p.r * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw custom 3D wireframe objects
            if (config.objects && Array.isArray(config.objects)) {
                const gravityActive = getValue(config.gravityActive);

                config.objects.forEach(obj => {
                    const type = getValue(obj.type);
                    const size = getValue(obj.size !== undefined ? obj.size : 1);
                    const color = getValue(obj.color || '#6366f1');
                    const spin = getValue(obj.spin) || [0.01, 0.01, 0.01];

                    let pos;
                    if (gravityActive) {
                        if (!obj._physicsInitialized) {
                            obj._physicsPos = [...(getValue(obj.position) || [0, 0, 0])];
                            obj._physicsVel = [
                                (Math.random() - 0.5) * 0.04,
                                0.0,
                                (Math.random() - 0.5) * 0.04
                            ];
                            obj._physicsInitialized = true;
                        }
                        obj._physicsVel[1] += -0.005; // gravity force
                        obj._physicsPos[0] += obj._physicsVel[0];
                        obj._physicsPos[1] += obj._physicsVel[1];
                        obj._physicsPos[2] += obj._physicsVel[2];

                        // Collisions
                        if (obj._physicsPos[1] <= -1.8) {
                            obj._physicsPos[1] = -1.8;
                            obj._physicsVel[1] = -obj._physicsVel[1] * 0.75; // bounce
                            obj._physicsVel[0] += (Math.random() - 0.5) * 0.01;
                            obj._physicsVel[2] += (Math.random() - 0.5) * 0.01;
                        }
                        if (obj._physicsPos[1] >= 2.5) {
                            obj._physicsPos[1] = 2.5;
                            obj._physicsVel[1] = -obj._physicsVel[1] * 0.75;
                        }
                        if (obj._physicsPos[0] <= -3.0) { obj._physicsPos[0] = -3.0; obj._physicsVel[0] = -obj._physicsVel[0] * 0.9; }
                        if (obj._physicsPos[0] >= 3.0) { obj._physicsPos[0] = 3.0; obj._physicsVel[0] = -obj._physicsVel[0] * 0.9; }
                        if (obj._physicsPos[2] <= -2.0) { obj._physicsPos[2] = -2.0; obj._physicsVel[2] = -obj._physicsVel[2] * 0.9; }
                        if (obj._physicsPos[2] >= 2.0) { obj._physicsPos[2] = 2.0; obj._physicsVel[2] = -obj._physicsVel[2] * 0.9; }

                        pos = obj._physicsPos;
                    } else {
                        if (obj._physicsInitialized) {
                            obj._physicsInitialized = false;
                            obj._physicsPos = null;
                            obj._physicsVel = null;
                        }
                        pos = getValue(obj.position) || [0, 0, 0];
                    }

                    if (!obj._rx) { obj._rx = 0; obj._ry = 0; obj._rz = 0; }
                    obj._rx += getValue(spin[0]);
                    obj._ry += getValue(spin[1]);
                    obj._rz += getValue(spin[2]);

                    let geom;
                    if (type === 'cube') {
                        geom = generateCube(size);
                    } else if (type === 'sphere') {
                        geom = generateSphere(size * 0.8);
                    } else if (type === 'torus') {
                        geom = generateTorus(size * 0.8, size * 0.2);
                    } else {
                        geom = generateCube(size);
                    }

                    const projectedVertices = geom.vertices.map(v => {
                        const rot = rotatePoint(v.x, v.y, v.z, obj._rx, obj._ry, obj._rz);
                        const worldX = rot.x + pos[0];
                        const worldY = rot.y + pos[1];
                        const worldZ = rot.z + pos[2] + 4; // offset forward

                        const fov = 400;
                        const scale = fov / (fov + worldZ);
                        const screenX = (worldX - camX * 0.02) * scale * 150 + w / 2;
                        const screenY = (worldY - camY * 0.02) * scale * 150 + h / 2;
                        return { x: screenX, y: screenY };
                    });

                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1.5;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 10;

                    geom.edges.forEach(([idxA, idxB]) => {
                        const ptA = projectedVertices[idxA];
                        const ptB = projectedVertices[idxB];
                        if (ptA && ptB) {
                            ctx.beginPath();
                            ctx.moveTo(ptA.x, ptA.y);
                            ctx.lineTo(ptB.x, ptB.y);
                            ctx.stroke();
                        }
                    });
                    
                    ctx.shadowBlur = 0;
                });
            }

            animId = requestAnimationFrame(draw);
        };
        animId = requestAnimationFrame(draw);

        const resizeHandler = () => {
            const parent = canvas.parentElement;
            if (parent) {
                w = parent.clientWidth;
                h = parent.clientHeight;
                canvas.width = w;
                canvas.height = h;
                initParticles();
            }
        };
        window.addEventListener('resize', resizeHandler);

        if (!canvas._cleanups) canvas._cleanups = [];
        canvas._cleanups.push(() => {
            if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('resize', resizeHandler);
            if (animId) cancelAnimationFrame(animId);
        });
    }

    const immersivePlugin = {
        name: 'papyr-immersive',
        version: '2.0.0',
        install(papyr) {
            const papyr3d = {
                cube(options = {}) {
                    return {
                        type: 'cube',
                        size: options.size !== undefined ? options.size : 1,
                        width: options.width,
                        height: options.height,
                        depth: options.depth,
                        color: options.color || '#6366f1',
                        position: options.position || [0, 0, 0],
                        spin: options.spin || [0.01, 0.02, 0.01],
                        wireframe: options.wireframe !== undefined ? options.wireframe : false
                    };
                },
                sphere(options = {}) {
                    return {
                        type: 'sphere',
                        radius: options.radius !== undefined ? options.radius : 1,
                        color: options.color || '#f43f5e',
                        position: options.position || [0, 0, 0],
                        spin: options.spin || [0.01, 0.01, 0.02],
                        wireframe: options.wireframe !== undefined ? options.wireframe : false
                    };
                },
                torus(options = {}) {
                    return {
                        type: 'torus',
                        radius: options.radius !== undefined ? options.radius : 0.8,
                        tube: options.tube !== undefined ? options.tube : 0.2,
                        color: options.color || '#a855f7',
                        position: options.position || [0, 0, 0],
                        spin: options.spin || [0.02, 0.01, 0.02],
                        wireframe: options.wireframe !== undefined ? options.wireframe : false
                    };
                },
                /**
                 * Orchestrates an immersive 3D/holographic backdrop.
                 * Detects Three.js globally, otherwise boots a gorgeous, pointer-aware fallback particle environment.
                 */
                scene(options = {}, ...children) {
                    const config = Object.assign({
                        environment: 'space', // 'space', 'cyberpunk', 'underwater'
                        particles: true,
                        depth: true,
                        overlay: null,
                        objects: []
                    }, options);

                    const container = papyr.div('.papyr-3d-container', {
                        style: {
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            minHeight: '400px',
                            overflow: 'hidden',
                            background: '#04060d',
                            borderRadius: '16px'
                        }
                    });

                    // Create Canvas element
                    const canvas = document.createElement('canvas');
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.zIndex = '0';
                    canvas.style.pointerEvents = 'none';
                    container.appendChild(canvas);

                    // Mount child overlay elements
                    if (config.overlay) {
                        const overlayWrapper = papyr.div('.papyr-3d-overlay', {
                            style: {
                                position: 'relative',
                                zIndex: '2',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '24px',
                                pointerEvents: 'auto'
                            }
                        }, config.overlay);
                        container.appendChild(overlayWrapper);
                    }

                    // Append any additional children inside the container
                    children.forEach(child => {
                        if (child) {
                            if (child instanceof Element) {
                                child.style.position = 'relative';
                                child.style.zIndex = '2';
                            }
                            container.appendChild(child);
                        }
                    });

                    // Boot renderers after mount paint
                    setTimeout(() => {
                        const w = container.clientWidth || window.innerWidth;
                        const h = container.clientHeight || window.innerHeight;
                        canvas.width = w;
                        canvas.height = h;

                        if (window.THREE) {
                            bootThreeJS(canvas, config);
                        } else {
                            bootFallbackCanvas(canvas, config);
                        }
                    }, 50);

                    return container;
                },
                tilt(el, options = {}) {
                    if (!el || typeof window === 'undefined') return el;
                    const { max = 15, perspective = 1000, scale = 1.02 } = options;

                    const onMouseMove = (e) => {
                        const rect = el.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const xc = rect.width / 2;
                        const yc = rect.height / 2;
                        const rotateX = ((yc - y) / yc) * max;
                        const rotateY = -((xc - x) / xc) * max;
                        el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
                        el.style.transition = 'none';
                    };

                    const onMouseLeave = () => {
                        el.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
                        el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                    };

                    el.addEventListener('mousemove', onMouseMove);
                    el.addEventListener('mouseleave', onMouseLeave);

                    return el;
                }
            };


            // Attach to namespace
            window.papyr3d = papyr3d;
            papyr['3d'] = papyr3d; // both references work cleanly
        }
    };

    // Auto-register in global window environment for backwards compatibility
    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
    if (targetPapyr) {
        targetPapyr.use(immersivePlugin);
    }

    // Export the plugin object for ESM/CommonJS contexts
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = immersivePlugin;
    } else if (typeof exports !== 'undefined') {
        exports.default = immersivePlugin;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return immersivePlugin; });
    } else {
        window.papyrImmersive = immersivePlugin;
    }
})(typeof window !== 'undefined' ? window : this);


// --- MODULE: plugins/ml.js ---
/**
 * PAPYR MACHINE LEARNING ENGINE
 * Browser-native machine learning abstraction with zero-dependency fallbacks.
 * v2.0 - Built-in training solvers (perceptrons), alongside smart TensorFlow.js and ONNX model wrappers.
 */
(function(window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading ml plugins.");
        return;
    }

    const papyr = window.papyr;

    // Simple built-in Perceptron/Neural Classifier for zero-dependency client training
    class SimpleClassifier {
        constructor() {
            this.weights = [];
            this.bias = 0;
            this.trained = false;
        }

        train(inputs, outputs, lr = 0.1, epochs = 200) {
            if (inputs.length === 0) return;
            const inputDim = inputs[0].length;
            this.weights = new Array(inputDim).fill(0).map(() => Math.random() * 2 - 1);
            this.bias = Math.random() * 2 - 1;

            for (let e = 0; e < epochs; e++) {
                for (let i = 0; i < inputs.length; i++) {
                    const x = inputs[i];
                    const target = outputs[i];
                    
                    // Feedforward activation (using tanh activation function)
                    let sum = this.bias;
                    for (let d = 0; d < inputDim; d++) {
                        sum += x[d] * this.weights[d];
                    }
                    const prediction = Math.tanh(sum);

                    // Backpropagation gradient delta calculations
                    const error = target - prediction;
                    const gradient = error * (1 - prediction * prediction); // tanh derivative
                    
                    // Adjust weights & bias
                    for (let d = 0; d < inputDim; d++) {
                        this.weights[d] += lr * gradient * x[d];
                    }
                    this.bias += lr * gradient;
                }
            }
            this.trained = true;
        }

        predict(input) {
            if (!this.trained) return 0;
            let sum = this.bias;
            for (let d = 0; d < input.length; d++) {
                sum += input[d] * (this.weights[d] || 0);
            }
            return Math.tanh(sum);
        }
    }

    class Perceptron {
        constructor(options = {}) {
            this.inputs = options.inputs || 2;
            this.lr = options.lr || 0.1;
            this.weights = new Array(this.inputs).fill(0).map(() => Math.random() * 2 - 1);
            this.bias = Math.random() * 2 - 1;
        }

        train(input, target) {
            if (Array.isArray(input[0])) {
                for (let i = 0; i < input.length; i++) {
                    this._trainSingle(input[i], Array.isArray(target) ? target[i] : target);
                }
            } else {
                this._trainSingle(input, target);
            }
        }

        _trainSingle(input, target) {
            let sum = this.bias;
            for (let i = 0; i < this.inputs; i++) {
                sum += (input[i] || 0) * this.weights[i];
            }
            const prediction = Math.tanh(sum);
            const error = target - prediction;
            const gradient = error * (1 - prediction * prediction);
            for (let i = 0; i < this.inputs; i++) {
                this.weights[i] += this.lr * gradient * (input[i] || 0);
            }
            this.bias += this.lr * gradient;
        }

        predict(input) {
            let sum = this.bias;
            for (let i = 0; i < this.inputs; i++) {
                sum += (input[i] || 0) * this.weights[i];
            }
            return Math.tanh(sum);
        }
    }

    const activeClassifier = new SimpleClassifier();

    papyr.ml = {
        /**
         * Creates a custom Perceptron instance.
         */
        perceptron(options = {}) {
            return new Perceptron(options);
        },

        /**
         * Trains the built-in lightweight classifier.
         * Useful for quick statistical predictions without heavy libraries.
         */
        train(data = {}, options = {}) {
            const { inputs = [], outputs = [] } = data;
            const { learningRate = 0.1, epochs = 250 } = options;

            if (inputs.length === 0 || outputs.length === 0) {
                console.warn("Papyr ML: Missing inputs/outputs training datasets.");
                return false;
            }

            activeClassifier.train(inputs, outputs, learningRate, epochs);
            return true;
        },

        /**
         * Infers predictions on trained datasets or routes to TensorFlow.js models if present.
         */
        predict(options = {}) {
            const { model = 'local', input = null } = options;

            if (input === null) {
                return Promise.reject(new Error("Input dataset is required for classification predictions."));
            }

            // TensorFlow.js integration
            if (window.tf) {
                return new Promise((resolve, reject) => {
                    try {
                        if (typeof model === 'string' && model.startsWith('http')) {
                            // Load web model dynamic wrap
                            window.tf.loadLayersModel(model).then(loadedModel => {
                                const tensor = window.tf.browser.fromPixels(input).resizeNearestNeighbor([224, 224]).toFloat().expandDims();
                                const prediction = loadedModel.predict(tensor);
                                prediction.data().then(data => {
                                    resolve(Array.from(data));
                                }).catch(reject);
                            }).catch(reject);
                        } else if (model === 'image-classifier' && window.cocoSsd) {
                            // If object detection model is loaded
                            window.cocoSsd.load().then(loadedModel => {
                                loadedModel.detect(input).then(resolve).catch(reject);
                            }).catch(reject);
                        } else {
                            // Local tfjs custom operations
                            const tensor = window.tf.tensor(input);
                            const result = tensor.sum();
                            result.data().then(data => resolve(data[0])).catch(reject);
                        }
                    } catch (err) {
                        reject(err);
                    }
                });
            }

            // Pure-JS statistical fallback inference
            if (Array.isArray(input)) {
                if (!activeClassifier.trained) {
                    return Promise.reject(new Error("Model Prediction Error: The classifier perceptron engine has not been trained yet. Call papyr.ml.train() first."));
                }
                return Promise.resolve(activeClassifier.predict(input));
            }

            // Reject image element parsing when tfjs is absent (prevents static mock representations)
            if (input instanceof HTMLElement || (input && input.tagName && ['IMG', 'CANVAS'].includes(input.tagName))) {
                return Promise.reject(new Error("Missing Dependency Error: TensorFlow.js (window.tf) or coco-ssd is required to perform real image classification natively."));
            }

            return Promise.reject(new Error("Input Type Error: Inputs to the perceptron engine must be a numeric array. Image inputs require TensorFlow.js."));
        }
    };

})(typeof window !== 'undefined' ? window : this);


// --- MODULE: plugins/ocr.js ---
/**
 * PAPYR OCR & VOICE EXTRACTOR
 * Browser-native optical character scanning, speech synthesis, and voice recognition wrappers.
 * v2.0 - Intelligent Tesseract.js wraps, native speech synthesis bindings, and web speech helpers.
 */
(function(window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading OCR plugins.");
        return;
    }

    const papyr = window.papyr;

    papyr.ocr = {
        /**
         * Scans image elements for characters and text.
         * Auto-upgrades to Tesseract.js if available globally, falling back to a DOM-attribute meta-extractor.
         */
        scan(image, options = {}) {
            if (!image) {
                return Promise.reject(new Error("Image element or source URL is required for OCR scanning."));
            }

            const config = Object.assign({
                lang: 'eng',
                logger: null
            }, options);

            // Tesseract.js integration
            if (window.Tesseract) {
                return new Promise((resolve, reject) => {
                    window.Tesseract.recognize(image, config.lang, {
                        logger: config.logger
                    }).then(({ data: { text } }) => {
                        resolve(text);
                    }).catch(reject);
                });
            }

            // High-fidelity fallback scanner: extract real DOM alternate parameters
            if (image instanceof HTMLElement) {
                if (image.alt) {
                    return Promise.resolve(image.alt);
                }
                if (image.dataset && image.dataset.ocrText) {
                    return Promise.resolve(image.dataset.ocrText);
                }
            }

            return Promise.reject(new Error("Missing Dependency Error: Tesseract.js is required to perform live optical character recognition on this image."));
        },

        /**
         * System Speech Synthesis (TTS).
         * Speaks aloud any text string using native Web Speech Synthesis API.
         */
        speak(text, options = {}) {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
                console.log(`[papyr.ocr.speak] TTS speak: ${text}`);
                return false;
            }

            const config = Object.assign({
                pitch: 1.0,
                rate: 1.0,
                volume: 1.0,
                lang: 'en-US'
            }, options);

            try {
                window.speechSynthesis.cancel(); // Cancel active queues
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.pitch = config.pitch;
                utterance.rate = config.rate;
                utterance.volume = config.volume;
                utterance.lang = config.lang;
                window.speechSynthesis.speak(utterance);
                return true;
            } catch (err) {
                console.error("Speech synthesis failed:", err);
                return false;
            }
        },

        /**
         * Web Speech Recognition (Speech-to-Text).
         * Listens to the microphone and returns recognized text strings.
         */
        listen(options = {}) {
            const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
            
            if (!SpeechRecognition) {
                return Promise.reject(new Error("Speech Recognition API is not supported in this browser."));
            }

            const config = Object.assign({
                continuous: false,
                interimResults: false,
                lang: 'en-US'
            }, options);

            return new Promise((resolve, reject) => {
                try {
                    const recognition = new SpeechRecognition();
                    recognition.continuous = config.continuous;
                    recognition.interimResults = config.interimResults;
                    recognition.lang = config.lang;

                    recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        resolve(transcript);
                    };

                    recognition.onerror = (event) => {
                        reject(new Error(`Speech recognition error: ${event.error}`));
                    };

                    recognition.start();
                } catch (err) {
                    reject(err);
                }
            });
        }
    };

    // Add voice aliases under papyr.ai for documentation consistency
    if (!papyr.ai) papyr.ai = {};
    papyr.ai.speak = papyr.ocr.speak;
    papyr.ai.listen = papyr.ocr.listen;

})(typeof window !== 'undefined' ? window : this);


// --- MODULE: plugins/physics.js ---
/**
 * PAPYR RIGID 2D PHYSICS SIMULATOR
 * Modern, high-performance physical simulation engine with zero-dependency Verlet fallbacks.
 * v2.0 - Multibody Verlet collisions, elastic bounce solvers, mouse drag tracking, and Matter.js auto-upgraders.
 */
(function(window) {
    // Advanced Zero-Dependency 2D Verlet Integration Collision Solver
    class VerletWorld {
        constructor(canvas, options = {}) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.gravity = options.gravity !== undefined ? options.gravity : 0.5;
            this.friction = options.friction !== undefined ? options.friction : 0.99;
            this.bodies = [];
            this.running = false;
            this.draggedBody = null;
            this.mouseX = 0;
            this.mouseY = 0;

            this.setupInteraction();
        }

        addBody(x, y, radius, options = {}) {
            const body = {
                x: x,
                y: y,
                px: x - (options.vx || 0), // previous x
                py: y - (options.vy || 0), // previous y
                r: radius,
                mass: radius,
                color: options.color || '#6366f1',
                elasticity: options.elasticity !== undefined ? options.elasticity : 0.75,
                isStatic: options.isStatic || false
            };
            this.bodies.push(body);
            return body;
        }

        setupInteraction() {
            if (typeof window === 'undefined') return;
            
            const getPos = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                return {
                    x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
                    y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
                };
            };

            this.canvas.addEventListener('mousedown', (e) => {
                const pos = getPos(e);
                this.mouseX = pos.x;
                this.mouseY = pos.y;
                
                // Find body under cursor
                for (let b of this.bodies) {
                    if (b.isStatic) continue;
                    const dist = Math.hypot(b.x - pos.x, b.y - pos.y);
                    if (dist < b.r * 1.5) {
                        this.draggedBody = b;
                        break;
                    }
                }
            });

            window.addEventListener('mousemove', (e) => {
                const pos = getPos(e);
                this.mouseX = pos.x;
                this.mouseY = pos.y;
                if (this.draggedBody) {
                    this.draggedBody.x = pos.x;
                    this.draggedBody.y = pos.y;
                }
            });

            window.addEventListener('mouseup', () => {
                this.draggedBody = null;
            });
        }

        start() {
            if (this.running) return;
            this.running = true;
            
            const loop = () => {
                this.update();
                this.render();
            };
            
            if (window.papyr && window.papyr.power && typeof window.papyr.power.throttle === 'function') {
                this.stopThrottle = window.papyr.power.throttle(loop);
            } else {
                const legacyLoop = () => {
                    if (!this.running) return;
                    loop();
                    requestAnimationFrame(legacyLoop);
                };
                requestAnimationFrame(legacyLoop);
            }
        }

        stop() {
            this.running = false;
            if (this.stopThrottle) {
                this.stopThrottle();
                this.stopThrottle = null;
            }
        }

        update() {
            const w = this.canvas.width;
            const h = this.canvas.height;

            // 1. Verlet Integration movement solver
            for (let b of this.bodies) {
                if (b.isStatic || b === this.draggedBody) continue;

                const vx = (b.x - b.px) * this.friction;
                const vy = (b.y - b.py) * this.friction;

                b.px = b.x;
                b.py = b.y;

                b.x += vx;
                b.y += vy + this.gravity; // Gravity vector
            }

            // 2. Multibody sphere collision solvers
            for (let i = 0; i < this.bodies.length; i++) {
                for (let j = i + 1; j < this.bodies.length; j++) {
                    const b1 = this.bodies[i];
                    const b2 = this.bodies[j];

                    const dx = b2.x - b1.x;
                    const dy = b2.y - b1.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = b1.r + b2.r;

                    if (dist < minDist) {
                        const overlap = minDist - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;

                        // Separate overlapping nodes based on mass
                        if (!b1.isStatic) {
                            b1.x -= nx * overlap * 0.5;
                            b1.y -= ny * overlap * 0.5;
                        }
                        if (!b2.isStatic) {
                            b2.x += nx * overlap * 0.5;
                            b2.y += ny * overlap * 0.5;
                        }

                        // Elastic rebound calculation
                        const kx = b1.x - b1.px - (b2.x - b2.px);
                        const ky = b1.y - b1.py - (b2.y - b2.py);
                        const m = b1.mass + b2.mass;

                        if (!b1.isStatic) {
                            b1.px += kx * (b2.mass / m) * b1.elasticity;
                            b1.py += ky * (b2.mass / m) * b1.elasticity;
                        }
                        if (!b2.isStatic) {
                            b2.px -= kx * (b1.mass / m) * b2.elasticity;
                            b2.py -= ky * (b1.mass / m) * b2.elasticity;
                        }
                    }
                }
            }

            // 3. Boundary collision limits
            for (let b of this.bodies) {
                if (b.isStatic || b === this.draggedBody) continue;

                const vx = b.x - b.px;
                const vy = b.y - b.py;

                // Floor collision
                if (b.y > h - b.r) {
                    b.y = h - b.r;
                    b.py = b.y + vy * b.elasticity;
                }
                // Ceiling collision
                if (b.y < b.r) {
                    b.y = b.r;
                    b.py = b.y + vy * b.elasticity;
                }
                // Right border
                if (b.x > w - b.r) {
                    b.x = w - b.r;
                    b.px = b.x + vx * b.elasticity;
                }
                // Left border
                if (b.x < b.r) {
                    b.x = b.r;
                    b.px = b.x + vx * b.elasticity;
                }
            }
        }

        render() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw rigid bodies
            for (let b of this.bodies) {
                this.ctx.fillStyle = b.color;
                this.ctx.beginPath();
                this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                this.ctx.fill();

                // Sleek specular lighting effect
                this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                this.ctx.beginPath();
                this.ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Draw drag lines
            if (this.draggedBody) {
                this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(this.draggedBody.x, this.draggedBody.y);
                this.ctx.lineTo(this.mouseX, this.mouseY);
                this.ctx.stroke();
            }
        }
    }

    const physicsPlugin = {
        name: 'papyr-physics',
        version: '2.0.0',
        install(papyr) {
            const physicsObj = {
                /**
                 * Creates a dynamic physics orchestration layer inside a canvas element.
                 * Auto-upgrades to Matter.js if loaded globally, otherwise boots our high-performance Verlet engine.
                 */
                world(options = {}) {
                    const container = papyr.div('.papyr-physics-wrapper', {
                        style: {
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            minHeight: '350px',
                            background: '#04060d',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }
                    });

                    const canvas = document.createElement('canvas');
                    canvas.style.display = 'block';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    container.appendChild(canvas);

                    // Setup sizes after painting
                    setTimeout(() => {
                        const w = container.clientWidth || 600;
                        const h = container.clientHeight || 350;
                        canvas.width = w;
                        canvas.height = h;

                        // Matter.js Integration
                        if (window.Matter) {
                            try {
                                const Engine = window.Matter.Engine;
                                const Render = window.Matter.Render;
                                const Runner = window.Matter.Runner;
                                const Bodies = window.Matter.Bodies;
                                const Composite = window.Matter.Composite;

                                const engine = Engine.create({ gravity: { y: options.gravity || 1 } });
                                const render = Render.create({
                                    canvas: canvas,
                                    engine: engine,
                                    options: {
                                        width: w,
                                        height: h,
                                        wireframes: false,
                                        background: '#04060d'
                                    }
                                });

                                Render.run(render);
                                const runner = Runner.create();
                                Runner.run(runner, engine);

                                // Bound borders
                                const ground = Bodies.rectangle(w/2, h + 30, w, 60, { isStatic: true });
                                const leftWall = Bodies.rectangle(-30, h/2, 60, h, { isStatic: true });
                                const rightWall = Bodies.rectangle(w + 30, h/2, 60, h, { isStatic: true });
                                Composite.add(engine.world, [ground, leftWall, rightWall]);

                                // Add some dynamic items
                                for (let i = 0; i < 8; i++) {
                                    const radius = Math.random() * 20 + 15;
                                    const circle = Bodies.circle(Math.random() * w, 50, radius, {
                                        restitution: 0.8,
                                        render: { fillStyle: i % 2 === 0 ? '#6366f1' : '#14b8a6' }
                                    });
                                    Composite.add(engine.world, circle);
                                }
                            } catch (e) {
                                console.warn("Matter.js loading failed, falling back to Verlet engine.", e);
                                bootVerlet(canvas, options);
                            }
                        } else {
                            bootVerlet(canvas, options);
                        }
                    }, 50);

                    function bootVerlet(cv, opt) {
                        const world = new VerletWorld(cv, opt);
                        
                        // Add initial bouncing rigid bodies
                        world.addBody(100, 100, 24, { vx: 2, vy: 0, color: '#6366f1' });
                        world.addBody(200, 80, 18, { vx: -3, vy: 0, color: '#14b8a6' });
                        world.addBody(300, 150, 30, { vx: 1, vy: -2, color: '#ff007f' });
                        world.addBody(400, 120, 20, { vx: 0, vy: 0, color: '#00f0ff' });

                        world.start();
                        container._verletWorld = world; // attach reference for developer inspections
                    }

                    return container;
                },

                /**
                 * Applies the 2D gravity-bouncing physics decorator onto a DOM element.
                 * Satisfies the documented signature in DOCS.md: papyr.physics.verlet(element, config)
                 */
                verlet(el, config) {
                    if (typeof papyr.physics === 'function') {
                        return papyr.physics(config)(el);
                    }
                    return el;
                }
            };

            // Build hybrid callable/object namespace to resolve all collision bugs!
            if (typeof papyr.physics === 'function') {
                const originalPhysics = papyr.physics;
                const hybridPhysics = function(options = {}) {
                    return originalPhysics(options);
                };
                Object.assign(hybridPhysics, physicsObj);
                papyr.physics = hybridPhysics;
            } else {
                papyr.physics = Object.assign(papyr.physics || {}, physicsObj);
            }
        }
    };

    // Auto-register in global window environment for backwards compatibility
    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
    if (targetPapyr) {
        targetPapyr.use(physicsPlugin);
    }

    // Export the plugin object for ESM/CommonJS contexts
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = physicsPlugin;
    } else if (typeof exports !== 'undefined') {
        exports.default = physicsPlugin;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return physicsPlugin; });
    } else {
        window.papyrPhysics = physicsPlugin;
    }
})(typeof window !== 'undefined' ? window : this);


// --- MODULE: plugins/ai.js ---
/**
 * PAPYR AI PLATFORM GATEWAY & PROMPT OPTIMIZER
 * Unified, zero-dependency connector for OpenAI, Anthropic, Gemini, and local Ollama models.
 * v2.0 - Prompts template managers, semantic DOM token-minimizer serialization, and offline simulator fallbacks.
 */
(function(window) {
    const aiPlugin = {
        name: 'papyr-ai',
        version: '2.0.0',
        install(papyr) {
            papyr.ai = Object.assign(papyr.ai || {}, {
                /**
                 * Reusable prompt templates with simple curly-braces variable interpolation.
                 * Usage: papyr.ai.prompt("Hello {{name}}!", { name: "World" }) => "Hello World!"
                 */
                prompt(template, variables = {}) {
                    if (typeof template !== 'string') return '';
                    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
                        return variables[key] !== undefined ? String(variables[key]) : match;
                    });
                },

                /**
                 * Semantic DOM JSON minimizer and NLP structured schema extractor.
                 */
                toSemanticJSON(elOrConfig) {
                    // 1. NLP Structured Schema Extraction Mode: toSemanticJSON({ input, schema })
                    if (elOrConfig && typeof elOrConfig === 'object' && elOrConfig.input && elOrConfig.schema) {
                        const input = String(elOrConfig.input);
                        const schema = elOrConfig.schema;
                        const result = {};
                        for (let key in schema) {
                            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
                            const type = Reflect.get(schema, key);
                            let val = null;
                            if (type === 'number') {
                                // Safe alternative to dynamic RegExp to avoid ReDoS and security warnings
                                const lowerInput = input.toLowerCase();
                                const lowerKey = String(key).toLowerCase();
                                const keyIndex = lowerInput.indexOf(lowerKey);
                                if (keyIndex !== -1) {
                                    const sub = input.slice(keyIndex + lowerKey.length);
                                    const m = sub.match(/\b(\d+)\b/);
                                    if (m) {
                                        val = Number(m[1]);
                                    }
                                }
                                if (val === null) {
                                    const anyNum = input.match(/\b(\d+)\b/);
                                    if (anyNum) val = Number(anyNum[0]);
                                }
                            } else {
                                if (key === 'name') {
                                    const nameRegex = /([A-Z][a-z]+)/;
                                    const m = input.match(nameRegex);
                                    if (m) val = m[1];
                                } else {
                                    const words = input.split(/\s+/);
                                    const idx = words.findIndex(w => w.toLowerCase().includes(key.toLowerCase()));
                                    if (idx !== -1 && idx + 1 < words.length) {
                                        if (words[idx + 1] === 'is' || words[idx + 1] === '=') {
                                            val = words.slice(idx + 2).join(' ').replace(/[,.]/g, '').trim();
                                        } else {
                                            val = words.slice(idx + 1).join(' ').replace(/[,.]/g, '').trim();
                                        }
                                        if (key === 'profession' || key === 'job') {
                                            const profRegex = /works\s+as\s+a\s+([A-Za-z\s]+)/i;
                                            const pm = input.match(profRegex);
                                            if (pm) val = pm[1].trim();
                                        }
                                    }
                                }
                            }
                            Reflect.set(result, key, val);
                        }
                        return result;
                    }

                    // 2. DOM Token-Minimizer Mode
                    if (typeof document === 'undefined') {
                        return { status: "non-browser-node", info: "Document undefined in non-browser context" };
                    }
                    const element = typeof elOrConfig === 'string' ? document.querySelector(elOrConfig) : elOrConfig;
                    if (!element) return null;

                    function extract(node) {
                        if (node.nodeType === 3) {
                            const txt = node.textContent.trim();
                            return txt ? txt : null;
                        }
                        if (node.nodeType !== 1) return null;

                        const data = {
                            tag: node.tagName.toLowerCase(),
                        };

                        if (node.id) data.id = node.id;
                        if (node.className) data.class = node.className;
                        if (node.type) data.type = node.type;
                        if (node.value) data.value = node.value;
                        if (node.name) data.name = node.name;
                        if (node.placeholder) data.placeholder = node.placeholder;
                        
                        const ds = Object.keys(node.dataset || {});
                        if (ds.length > 0) {
                            data.dataset = {};
                            ds.forEach(k => {
                                data.dataset[k] = node.dataset[k];
                            });
                        }

                        const children = [];
                        node.childNodes.forEach(child => {
                            const res = extract(child);
                            if (res) {
                                if (typeof res === 'string') {
                                    if (!data.text) data.text = '';
                                    data.text = (data.text + ' ' + res).trim();
                                } else {
                                    children.push(res);
                                }
                            }
                        });

                        if (children.length > 0) {
                            data.children = children;
                        }

                        return data;
                    }

                    return extract(element);
                },

                use(name) {
                    this._config = this._config || {};
                    this._config.provider = name;
                    return this;
                },

                normalizeResponse(provider, data) {
                    const prov = (provider || 'openai').toLowerCase();
                    if (prov === 'openai') {
                        const message = data.choices?.[0]?.message;
                        if (!message) {
                            return { success: false, content: null, refusal: "No response returned" };
                        }
                        if (message.refusal) {
                            return { success: false, content: null, refusal: message.refusal };
                        }
                        return { success: true, content: message.content, refusal: null };
                    } else if (prov === 'anthropic') {
                        const text = data.content?.[0]?.text;
                        if (!text) {
                            return { success: false, content: null, refusal: "No response returned" };
                        }
                        return { success: true, content: text, refusal: null };
                    } else if (prov === 'gemini') {
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (!text) {
                            return { success: false, content: null, refusal: "No response returned" };
                        }
                        return { success: true, content: text, refusal: null };
                    } else if (prov === 'ollama') {
                        const content = data.message?.content || data.response || '';
                        if (!content) {
                            return { success: false, content: null, refusal: "No response returned" };
                        }
                        return { success: true, content: content, refusal: null };
                    }
                    return { success: false, content: null, refusal: `Unknown provider: ${provider}` };
                },

                /**
                 * Unified AI Provider interface mapping OpenAI, Anthropic, Gemini, and Ollama endpoints.
                 * Enforces strict real-world connections, API key validations, and secure data privacy protocols.
                 */
                chat(options = {}) {
                    let provider = (options.provider || (this._config && this._config.provider) || 'openai').toLowerCase();
                    if (provider === 'google') provider = 'gemini';
                    
                    const apiKey = options.apiKey || '';
                    const messages = options.messages || [];
                    const model = options.model;
                    
                    const isLocal = provider === 'ollama';
                    
                    if (!isLocal && !apiKey) {
                        return Promise.reject(new Error(`Security Validation Error: A secure API key is required to initiate real-world chat completions with provider '${provider}'.`));
                    }

                    const hasFetch = typeof fetch !== 'undefined';
                    if (!hasFetch) {
                        return Promise.reject(new Error("Environment Error: global fetch() API is required to communicate with AI endpoints."));
                    }

                    const promptText = messages.map(m => m.content).join('\n');

                    // Data Leakage Scan
                    if (papyr.security && typeof papyr.security.detectLeakage === 'function') {
                        papyr.security.detectLeakage(promptText);
                        if (options.context) papyr.security.detectLeakage(options.context);
                    }

                    // WATT AI Consent Transparency
                    let consentPromise = Promise.resolve(true);
                    if (papyr.security && typeof papyr.security.aiConsent === 'function') {
                        consentPromise = papyr.security.aiConsent({
                            destination: provider,
                            prompt: promptText,
                            context: options.context,
                            attachments: options.attachments
                        });
                    }

                    return consentPromise.then(allowed => {
                        if (!allowed) {
                            throw new Error("AI Request denied by user through WATT Transparency Layer.");
                        }

                        let url = options.endpoint || '';
                        let headers = {
                            'Content-Type': 'application/json'
                        };
                        let body = {};

                        if (provider === 'openai') {
                            url = url || 'https://api.openai.com/v1/chat/completions';
                            headers['Authorization'] = `Bearer ${apiKey}`;
                            body = {
                                model: model || 'gpt-4o-mini',
                                messages: messages
                            };
                        } else if (provider === 'anthropic') {
                            url = url || 'https://api.anthropic.com/v1/messages';
                            headers['x-api-key'] = apiKey;
                            headers['anthropic-version'] = '2023-06-01';
                            body = {
                                model: model || 'claude-3-5-sonnet-20241022',
                                messages: messages.filter(m => m.role !== 'system'),
                                max_tokens: 1024
                            };
                            const systemMsg = messages.find(m => m.role === 'system');
                            if (systemMsg) {
                                body.system = systemMsg.content;
                            }
                        } else if (provider === 'gemini') {
                            const gemModel = model || 'gemini-2.5-flash';
                            url = url || `https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${apiKey}`;
                            
                            const contents = messages.filter(m => m.role !== 'system').map(m => {
                                return {
                                    role: m.role === 'assistant' ? 'model' : 'user',
                                    parts: [{ text: m.content }]
                                };
                            });
                            
                            body = { contents: contents };
                            
                            const systemMsg = messages.find(m => m.role === 'system');
                            if (systemMsg) {
                                body.systemInstruction = {
                                    parts: [{ text: systemMsg.content }]
                                };
                            }
                        } else if (provider === 'ollama') {
                            url = url || 'http://localhost:11434/api/chat';
                            body = {
                                model: model || 'llama3',
                                messages: messages,
                                stream: false
                            };
                        }

                        return fetch(url, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(body)
                        })
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`API error: ${res.status} ${res.statusText}`);
                            }
                            return res.json();
                        })
                        .then(data => {
                            const norm = this.normalizeResponse(provider, data);
                            return {
                                ...norm,
                                text: norm.content || '',
                                provider: provider,
                                simulated: false,
                                raw: data
                            };
                        });
                    });
                }
            });
        }
    };

    // Auto-register in global window environment for backwards compatibility
    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
    if (targetPapyr) {
        targetPapyr.use(aiPlugin);
    }

    // Export the plugin object for ESM/CommonJS contexts
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = aiPlugin;
    } else if (typeof exports !== 'undefined') {
        exports.default = aiPlugin;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return aiPlugin; });
    } else {
        window.papyrAI = aiPlugin;
    }
})(typeof window !== 'undefined' ? window : this);


// --- MODULE: plugins/pdf.js ---
/**
 * PAPYR DOCUMENT & CANVAS EXPORTER (PDF)
 * Zero-dependency client-side PDF document compiler and DOM element exporter.
 * v2.0 - High-fidelity printing stylesheet isolates, alongside dynamic jsPDF/html2canvas vectorized auto-upgraders.
 */
(function(window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading PDF plugins.");
        return;
    }

    const papyr = window.papyr;

    papyr.pdf = {
        /**
         * Exports a DOM element or canvas to PDF/document format.
         * Auto-upgrades to global jsPDF/html2canvas if loaded, falling back to clean print stylesheet wrappers.
         */
        export(elementOrSelector, filename = 'document.pdf') {
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                console.log(`[papyr.pdf.export] Non-browser context export: ${filename}`);
                return Promise.resolve(filename);
            }

            const target = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
            if (!target) {
                return Promise.reject(new Error("Target element not found for PDF export."));
            }

            // jsPDF / html2canvas auto-upgrade if global jsPDF/jspdf is defined
            const jsPDFLib = window.jspdf ? window.jspdf.jsPDF : (window.jsPDF || null);
            if (jsPDFLib) {
                return new Promise((resolve, reject) => {
                    try {
                        const pdf = new jsPDFLib('p', 'mm', 'a4');
                        
                        // If html2canvas is present, we can do highly precise pixel rendering
                        if (window.html2canvas) {
                            window.html2canvas(target, {
                                scale: 2,
                                useCORS: true
                            }).then(canvas => {
                                const imgData = canvas.toDataURL('image/png');
                                const imgWidth = 210; // A4 page width in mm
                                const pageHeight = 295;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                let heightLeft = imgHeight;
                                let position = 0;

                                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                                heightLeft -= pageHeight;

                                while (heightLeft >= 0) {
                                    position = heightLeft - imgHeight;
                                    pdf.addPage();
                                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                                    heightLeft -= pageHeight;
                                }
                                pdf.save(filename);
                                resolve(filename);
                            }).catch(reject);
                        } else {
                            // Single-page fallback vector representation using jsPDF element rendering
                            pdf.html(target, {
                                callback: function (doc) {
                                    doc.save(filename);
                                    resolve(filename);
                                },
                                x: 10,
                                y: 10,
                                width: 190,
                                windowWidth: target.clientWidth || 800
                            }).catch(reject);
                        }
                    } catch (err) {
                        reject(err);
                    }
                });
            }

            // Zero-dependency fallback: Isolated media-print style injection and window.print dialog
            return new Promise((resolve) => {
                try {
                    // Create isolated print stylesheet
                    const style = document.createElement('style');
                    style.id = 'papyr-transient-print-style';
                    style.textContent = `
                        @media print {
                            body * {
                                visibility: hidden !important;
                            }
                            #${target.id || 'papyr-print-target'}, #${target.id || 'papyr-print-target'} * {
                                visibility: visible !important;
                            }
                            #${target.id || 'papyr-print-target'} {
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                height: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                border: none !important;
                                background: white !important;
                                color: black !important;
                            }
                        }
                    `;
                    
                    // Assign temporary id if not present
                    const hasId = !!target.id;
                    if (!hasId) target.id = 'papyr-print-target';

                    document.head.appendChild(style);
                    
                    // Trigger native print flow
                    window.print();
                    
                    // Cleanup
                    setTimeout(() => {
                        document.head.removeChild(style);
                        if (!hasId) target.removeAttribute('id');
                        resolve(filename);
                    }, 500);
                } catch (e) {
                    console.warn("Print fallback failed. Downloading raw HTML/text copy instead.", e);
                    // Absolute fallback: download HTML content as a standalone HTML file
                    const htmlContent = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>${filename}</title>
                            <style>
                                body { font-family: system-ui, sans-serif; padding: 2rem; background: #fafafa; }
                                .container { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; max-width: 800px; margin: 0 auto; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                ${target.innerHTML}
                            </div>
                        </body>
                        </html>
                    `;
                    
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename.replace('.pdf', '.html');
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        resolve(filename);
                    }, 100);
                }
            });
        }
    };
})(typeof window !== 'undefined' ? window : this);


// --- MODULE: plugins/science.js ---
/**
 * PAPYR STEM, GRAPHING, & BUSINESS ACCOUNTING ENGINE
 * Sleek, zero-dependency science graphing, scientific converters, and accounting invoice computations.
 * v2.0 - Beautiful responsive Canvas2D grid equation graphers, conversions, and standard tax invoice models.
 */
(function(window) {
    function drawGraphOnCanvas(canvas, options = {}) {
        const parent = canvas.parentElement;
        const w = parent ? (parent.clientWidth || canvas.width || 400) : (canvas.width || 400);
        const h = parent ? (parent.clientHeight || canvas.height || 280) : (canvas.height || 280);
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, w, h);

        const equation = options.equation || ((x) => Math.sin(x));
        let range = options.range;
        if (!range && options.scale) {
            const sc = options.scale;
            range = [-sc, sc, -sc * (h / w), sc * (h / w)];
        }
        range = range || [-10, 10, -5, 5];
        const [minX, maxX, minY, maxY] = range;
        
        const plotColor = options.color || '#10b981';
        const gridColor = options.gridColor || 'rgba(255, 255, 255, 0.05)';
        const axisColor = options.axisColor || 'rgba(255, 255, 255, 0.3)';

        // Map coordinates from graph dimensions to screen pixels
        const toScreenX = (x) => ((x - minX) / (maxX - minX)) * w;
        const toScreenY = (y) => h - ((y - minY) / (maxY - minY)) * h;

        // 1. Draw Grid Lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let x = Math.ceil(minX); x <= Math.floor(maxX); x++) {
            const sx = toScreenX(x);
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, h);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
            const sy = toScreenY(y);
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(w, sy);
            ctx.stroke();
        }

        // 2. Draw Axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1.5;

        // Y Axis (X = 0)
        if (minX <= 0 && maxX >= 0) {
            const sx0 = toScreenX(0);
            ctx.beginPath();
            ctx.moveTo(sx0, 0);
            ctx.lineTo(sx0, h);
            ctx.stroke();
        }

        // X Axis (Y = 0)
        if (minY <= 0 && maxY >= 0) {
            const sy0 = toScreenY(0);
            ctx.beginPath();
            ctx.moveTo(0, sy0);
            ctx.lineTo(w, sy0);
            ctx.stroke();
        }

        // 3. Draw Equation Curve
        let eqFunc = equation;
        if (typeof equation === 'string') {
            try {
                // Safe evaluation fallback for basic math expressions
                eqFunc = (x) => {
                    let cleanEq = equation.replace(/sin/g, 'Math.sin')
                                            .replace(/cos/g, 'Math.cos')
                                            .replace(/tan/g, 'Math.tan')
                                            .replace(/pi/g, 'Math.PI')
                                            .replace(/exp/g, 'Math.exp')
                                            .replace(/pow/g, 'Math.pow');
                    cleanEq = cleanEq.replace(/Math\.Math\./g, 'Math.');
                    return new Function('x', `return ${cleanEq}`)(x);
                };
            } catch (e) {
                console.error("Failed to parse equation string:", e);
                eqFunc = (x) => 0;
            }
        }

        ctx.strokeStyle = plotColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        let first = true;
        const resolution = w; // evaluate at every pixel column
        for (let i = 0; i <= resolution; i++) {
            const cx = minX + (i / resolution) * (maxX - minX);
            try {
                const cy = eqFunc(cx);
                if (!isNaN(cy) && isFinite(cy)) {
                    const sx = toScreenX(cx);
                    const sy = toScreenY(cy);
                    
                    if (first) {
                        ctx.moveTo(sx, sy);
                        first = false;
                    } else {
                        ctx.lineTo(sx, sy);
                    }
                }
            } catch (err) {
                // skip drawing invalid points
            }
        }
        ctx.stroke();

        // Draw equation label overlay
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(typeof equation === 'string' ? `y = ${equation}` : 'y = f(x)', 12, 20);
    }

    const sciencePlugin = {
        name: 'papyr-science',
        version: '2.0.0',
        install(papyr) {
            // ==========================================
            // 1. SCIENTIFIC GRAPHING & STEM (papyr.science)
            // ==========================================
            papyr.science = {
                /**
                 * Renders standard mathematical equations onto a Canvas element.
                 * Supports both container-based scaffolding and direct (canvas, equation) plotting.
                 */
                graph(optionsOrCanvas = {}, equationStr, config = {}) {
                    const isElement = (x) => {
                        if (!x || typeof x !== 'object') return false;
                        return (typeof Element !== 'undefined' && x instanceof Element) || 
                               (typeof DocumentFragment !== 'undefined' && x instanceof DocumentFragment) || 
                               (typeof x.tagName === 'string' && typeof x.appendChild === 'function') ||
                               (x.nodeType === 1 || x.nodeType === 11);
                    };

                    let targetCanvas = null;
                    let drawOptions = {};

                    if (isElement(optionsOrCanvas) || (typeof optionsOrCanvas === 'string' && typeof document !== 'undefined' && document.querySelector(optionsOrCanvas))) {
                        targetCanvas = typeof optionsOrCanvas === 'string' ? document.querySelector(optionsOrCanvas) : optionsOrCanvas;
                        drawOptions = typeof equationStr === 'object' ? equationStr : { equation: equationStr, ...config };
                        
                        if (targetCanvas) {
                            setTimeout(() => {
                                drawGraphOnCanvas(targetCanvas, drawOptions);
                            }, 50);
                            return targetCanvas;
                        }
                    }

                    // Otherwise, return standard wrapper container
                    const container = papyr.div('.papyr-graph-wrapper', {
                        style: {
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            minHeight: '280px',
                            background: '#0a0d1a',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '8px'
                        }
                    });

                    const canvas = document.createElement('canvas');
                    canvas.style.display = 'block';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    container.appendChild(canvas);

                    setTimeout(() => {
                        drawGraphOnCanvas(canvas, optionsOrCanvas);
                    }, 50);

                    return container;
                },

                /**
                 * STEM scientific converters.
                 */
                convert(val, from, to) {
                    const key = `${from.toLowerCase()}->${to.toLowerCase()}`;
                    const conversions = {
                        'c->f': (v) => v * 1.8 + 32,
                        'f->c': (v) => (v - 32) / 1.8,
                        'm->ft': (v) => v * 3.28084,
                        'ft->m': (v) => v / 3.28084,
                        'kg->lbs': (v) => v * 2.20462,
                        'lbs->kg': (v) => v / 2.20462,
                        'km->mi': (v) => v * 0.621371,
                        'mi->km': (v) => v / 0.621371
                    };

                    if (conversions[key]) {
                        return conversions[key](val);
                    }
                    console.warn(`STEM Convert: Conversion from "${from}" to "${to}" is not defined.`);
                    return val;
                },

                /**
                 * BMI Scientific Calculator.
                 */
                bmi(weightKg, heightM) {
                    if (heightM <= 0) return { score: 0, category: 'Invalid' };
                    const score = parseFloat((weightKg / (heightM * heightM)).toFixed(2));
                    let category = 'Normal';
                    if (score < 18.5) category = 'Underweight';
                    else if (score >= 25 && score < 30) category = 'Overweight';
                    else if (score >= 30) category = 'Obese';
                    return { score, category };
                }
            };

            // ==========================================
            // 2. FINANCIAL BUSINESS ENGINES (papyr.business)
            // ==========================================
            papyr.business = {
                /**
                 * Computes line-item invoicing, taxation, and subtotal parameters.
                 */
                invoice(data = {}) {
                    const items = data.items || [];
                    const taxRate = data.taxRate !== undefined ? data.taxRate : 0.08; // 8% default
                    
                    let subtotal = 0;
                    const computedItems = items.map(item => {
                        const qty = item.qty !== undefined ? item.qty : 1;
                        const price = item.price !== undefined ? item.price : 0;
                        const total = parseFloat((qty * price).toFixed(2));
                        subtotal += total;
                        return Object.assign({}, item, { qty, price, total });
                    });

                    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
                    const grandTotal = parseFloat((subtotal + taxAmount).toFixed(2));

                    return {
                        items: computedItems,
                        subtotal: parseFloat(subtotal.toFixed(2)),
                        taxRate: taxRate,
                        taxAmount: taxAmount,
                        total: grandTotal,
                        invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
                        date: data.date || new Date().toLocaleDateString()
                    };
                }
            };
        }
    };

    // Auto-register in global window environment for backwards compatibility
    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
    if (targetPapyr) {
        targetPapyr.use(sciencePlugin);
    }

    // Export the plugin object for ESM/CommonJS contexts
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = sciencePlugin;
    } else if (typeof exports !== 'undefined') {
        exports.default = sciencePlugin;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return sciencePlugin; });
    } else {
        window.papyrScience = sciencePlugin;
    }
})(typeof window !== 'undefined' ? window : this);



    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
