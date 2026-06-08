/**
 * PAPYR STATIC SITE LIBRARY - UI & Layout Modular Bundle
 * v3.1.3 - Core Reactivity, SPA Routing, Layouts, Design Engine, and Premium UI Components
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



    // Export isomorphic context BEFORE loading plugins
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    const papyr = papyrInstance;

// --- MODULE: plugins/official.js ---
/**
 * PAPYR OFFICIAL PLUGINS & WIDGETS
 * 
 * Auto-registered official plugins, widgets, layout components, and vector icons.
 */

(function() {
    // Check if papyr exists
    if (typeof papyr === 'undefined') {
        console.warn("Papyr core not detected. Official plugins require papyr core to run.");
        return;
    }

    // ==========================================
    // 1. Vector Icons Library
    // ==========================================
    const icons = {
        bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        unlock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 11V7a5 5 0 019.9-1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        todo: '<path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>',
        home: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        book: '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        users: '<path d="M17 21v-2a4 4 0 00-3-3H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        folder: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        search: '<circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" fill="none"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        external: '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        bell: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        check: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        info: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        alert: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        terminal: '<path d="M4 17l6-6-6-6M12 19h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        palette: '<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14 3 16 4.5 17C5.5 17.6667 5.5 19 4 20C3 20.6667 3 22 5 22C6.5 22 8 21.5 9 20C9.66667 19.3333 10.3333 19 11 19C11.6667 19 12 20 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        code: '<path d="M16 18l6-6-6-6M8 6L2 12l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        database: '<ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        settings: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        package: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        refresh: '<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        arrowRight: '<path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        trash: '<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        edit: '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        save: '<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 01-2-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        user: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>'
    };

    /**
     * Generates a modern vector SVG element for preloaded system icons.
     */
    papyr.icon = (name, options = {}) => {
        let size = options.size || 16;
        let color = options.color || 'currentColor';
        let strokeWidth = options.strokeWidth || 2;
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', String(size));
        svg.setAttribute('height', String(size));
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.style.display = 'inline-block';
        svg.style.verticalAlign = 'middle';
        svg.style.color = color;
        if (options.style) Object.assign(svg.style, options.style);
        if (options.class) svg.setAttribute('class', options.class);
        
        // eslint-disable-next-line security/detect-object-injection
        let inner = (name && name !== '__proto__' && name !== 'constructor' && name !== 'prototype' && Object.prototype.hasOwnProperty.call(icons, name)) ? icons[name] : '';
        if (strokeWidth !== 2) {
            inner = inner.replace(/stroke-width="2"/g, `stroke-width="${strokeWidth}"`);
        }
        svg.innerHTML = inner;
        return svg;
    };

    // ==========================================
    // 2. UI Widgets
    // ==========================================

    /**
     * Auto-suggestions matching autocomplete inputs connected to remote endpoints.
     */
    papyr.autoComplete = (inputEl, apiUrl) => {
        let input;
        let isLocal = Array.isArray(inputEl);
        
        if (isLocal) {
            let placeholder = typeof apiUrl === 'string' ? apiUrl : 'Search...';
            input = papyr.input('text', placeholder, { style: { width: '100%' } });
        } else {
            input = typeof inputEl === 'string' ? papyr.input('text', inputEl, { style: { width: '100%' } }) : inputEl;
        }
        
        // Bulletproof fallback check to guarantee input supports addEventListener
        if (!input || typeof input.addEventListener !== 'function') {
            let placeholder = typeof apiUrl === 'string' ? apiUrl : (typeof inputEl === 'string' ? inputEl : 'Search...');
            input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.style.width = '100%';
            input.className = 'input-text';
        }
        
        let suggestions = papyr.ul('.suggestions');
        let container = papyr.div('.autocomplete', input, suggestions);
        let debounceTimer;
        
        if (isLocal) {
            input.addEventListener('input', (e) => {
                let value = e.target.value.toLowerCase().trim();
                suggestions.innerHTML = '';
                if (!value) return;
                
                let matches = inputEl.filter(item => item.toLowerCase().includes(value));
                matches.slice(0, 5).forEach(item => {
                    let li = papyr.li(item, {
                        on: {
                            click: () => {
                                input.value = item;
                                suggestions.innerHTML = '';
                                
                                // Dispatch both select & change events so all user subscriptions work
                                let selectEv = new CustomEvent('select', { detail: item });
                                container.dispatchEvent(selectEv);
                                let changeEv = new CustomEvent('change', { detail: item });
                                container.dispatchEvent(changeEv);
                            }
                        }
                    });
                    suggestions.appendChild(li);
                });
            });
        } else {
            input.addEventListener('input', async (e) => {
                clearTimeout(debounceTimer);
                let value = e.target.value;
                if(value.length < 2) {
                    suggestions.innerHTML = '';
                    return;
                }
                
                debounceTimer = setTimeout(async () => {
                    try {
                        let response = await fetch(`${apiUrl}${value}`);
                        let data = await response.json();
                        
                        suggestions.innerHTML = '';
                        let items = Array.isArray(data) ? data : (data.results || data.products || data.data || []);
                        items.slice(0, 5).forEach(item => {
                            let text = item.title || item.name || item.username || item;
                            let li = papyr.li(text, {
                                on: {
                                    click: () => {
                                        input.value = text;
                                        suggestions.innerHTML = '';
                                        if(papyr.onSuggestion) papyr.onSuggestion(item);
                                        
                                        let selectEv = new CustomEvent('select', { detail: item });
                                        container.dispatchEvent(selectEv);
                                        let changeEv = new CustomEvent('change', { detail: text });
                                        container.dispatchEvent(changeEv);
                                    }
                                }
                            });
                            suggestions.appendChild(li);
                        });
                    } catch(err) { console.error(err); }
                }, 300);
            });
        }
        
        document.addEventListener('click', (e) => {
            if(!container.contains(e.target)) suggestions.innerHTML = '';
        });
        
        return container;
    };

    /**
     * Highly versatile auto-builder forms creator.
     */
    papyr.form = (...args) => {
        if (args.length > 0 && Array.isArray(args[0])) {
            let [fields, onSubmit] = args;
            let form = papyr('form', '.papyr-form');
            let formElements = [];
            
            fields.forEach(field => {
                let wrapper = papyr.div('.form-field');
                let label = papyr.label(field.label, {for: field.name});
                let input;
                
                if(field.type === 'select') {
                    input = papyr.select({name: field.name, id: field.name});
                    field.options.forEach(opt => {
                        input.appendChild(papyr.option(opt, {value: opt, textContent: opt}));
                    });
                } else if(field.type === 'textarea') {
                    input = papyr.textarea('', {name: field.name, id: field.name, rows: field.rows || 3, placeholder: field.placeholder || ''});
                } else {
                    input = papyr.input('', {type: field.type || 'text', name: field.name, id: field.name, placeholder: field.placeholder || ''});
                }
                
                wrapper.appendChild(label);
                wrapper.appendChild(input);
                form.appendChild(wrapper);
                formElements.push(input);
            });
            
            let submitBtn = papyr.button('Submit', {type: 'submit', class: 'btn-primary'});
            form.appendChild(submitBtn);
            
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                let data = Object.create(null);
                formElements.forEach(el => {
                    if (el.name && el.name !== '__proto__' && el.name !== 'constructor' && el.name !== 'prototype') {
                        // eslint-disable-next-line security/detect-object-injection
                        data[el.name] = el.value;
                    }
                });
                if(onSubmit) onSubmit(data);
            });
            
            return form;
        } else {
            return papyr('form', ...args);
        }
    };

    /**
     * Glassmorphism Content Card.
     */
    papyr.card = (...args) => {
        if (args.length > 0 && typeof args[0] === 'object' && !(args[0] instanceof Element) && !(args[0] instanceof DocumentFragment) && !Array.isArray(args[0]) && typeof args[0].subscribe !== 'function') {
            let [options, ...children] = args;
            options = { ...options };
            let isInteractive = options.interactive;
            delete options.interactive;
            
            if (isInteractive) {
                options.interactive = 'true';
            }

            let hasTilt = options.tilt;
            delete options.tilt;
            
            let cardEl = papyr('div', '.papyr-card', options, ...children);
            if (hasTilt) {
                const oldMounted = cardEl._onMounted;
                cardEl._onMounted = (el) => {
                    if (oldMounted) oldMounted(el);
                    if (papyr['3d'] && typeof papyr['3d'].tilt === 'function') {
                        papyr['3d'].tilt(el);
                    }
                };
            }
            return cardEl;
        } else {
            let [title, content, footer] = args;
            let headerEl = title ? (typeof title === 'string' ? papyr.h3(title, '.card-title') : title) : null;
            let contentEl = content ? (typeof content === 'string' ? papyr.div(content, '.card-content') : content) : null;
            
            let children = [];
            if (headerEl) children.push(headerEl);
            if (contentEl) children.push(contentEl);
            if (footer) {
                let footerEl = typeof footer === 'string' ? papyr.div(footer, '.card-footer') : footer;
                children.push(footerEl);
            }
            
            return papyr.div('.papyr-card', ...children);
        }
    };


    papyr.title = (...args) => {
        return papyr('h1', '.papyr-title', ...args);
    };

    papyr.muted = (...args) => {
        return papyr('p', '.papyr-muted', ...args);
    };

    /**
     * Dialog modal frames with .show() and .hide() routines.
     * Accessible, dual-compatible signature, with Escape dismissal and focus trapping.
     */
    papyr.modal = (contentOrOptions, titleOrLegacy = "Modal") => {
        let options = {};
        let isLegacy = false;
        
        if (contentOrOptions !== null && typeof contentOrOptions === 'object' && !(contentOrOptions instanceof Element) && !(contentOrOptions instanceof DocumentFragment)) {
            options = { ...contentOrOptions };
        } else {
            options = {
                content: contentOrOptions,
                title: typeof titleOrLegacy === 'string' ? titleOrLegacy : "Modal"
            };
            isLegacy = true;
        }

        const title = options.title || 'Modal';
        const content = options.content || '';
        const animation = options.animation || 'glass-pop';
        const onClose = options.onClose;

        let overlay = papyr.div({
            style: {
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(2, 6, 23, 0.65)', backdropFilter: 'blur(12px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 9998, opacity: 0, transition: 'opacity 0.3s ease'
            },
            on: {
                click: (e) => { if (e.target === overlay) close(); }
            }
        });

        const modalId = 'papyr-modal-' + Math.random().toString(36).substring(2, 9);

        let modalBox = papyr.div('.papyr-card.papyr-modal-box', {
            id: modalId,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': modalId + '-title',
            tabIndex: -1,
            style: {
                padding: '24px', width: '90%', maxWidth: '450px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                transform: animation === 'glass-pop' ? 'scale(0.9) translateY(10px)' : 'translateY(50px)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }
        }, 
            papyr.flex.between(
                papyr.h3(title, { id: modalId + '-title', style: { margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: '600' } }),
                papyr.button("×", { 
                    class: 'close-btn',
                    ariaLabel: 'Close Dialog',
                    on: { click: () => close() },
                    style: { background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', padding: '0 4px', lineLight: 1 }
                })
            ),
            papyr.div({ style: { marginTop: '16px', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' } }, content)
        );

        overlay.appendChild(modalBox);

        const previousActiveElement = typeof document !== 'undefined' ? document.activeElement : null;

        const trapFocus = (e) => {
            if (e.key === 'Tab') {
                const focusables = modalBox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        const show = () => {
            if (typeof document === 'undefined') return;
            document.body.appendChild(overlay);
            overlay.offsetHeight;
            overlay.style.opacity = '1';
            modalBox.style.transform = animation === 'glass-pop' ? 'scale(1) translateY(0)' : 'translateY(0)';
            
            setTimeout(() => {
                const firstFocusable = modalBox.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) firstFocusable.focus();
                else modalBox.focus();
            }, 100);

            document.addEventListener('keydown', handleEscape);
            modalBox.addEventListener('keydown', trapFocus);
        };

        const close = () => {
            overlay.style.opacity = '0';
            modalBox.style.transform = animation === 'glass-pop' ? 'scale(0.9) translateY(10px)' : 'translateY(50px)';
            
            document.removeEventListener('keydown', handleEscape);
            modalBox.removeEventListener('keydown', trapFocus);
            
            setTimeout(() => {
                overlay.remove();
                if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
                    previousActiveElement.focus();
                }
                if (onClose) onClose();
            }, 300);
        };

        if (isLegacy) {
            overlay.show = show;
            overlay.hide = close;
            return overlay;
        } else {
            show();
            return { close };
        }
    };

    // Static native fallbacks for browser/OS alert & confirm
    papyr.modal.alert = (message, title = "Alert") => {
        if (typeof window !== 'undefined') {
            if (window.alert) {
                window.alert(`${title}\n\n${message}`);
            }
        }
    };

    papyr.modal.confirm = (message, callback) => {
        if (typeof window !== 'undefined' && window.confirm) {
            let res = window.confirm(message);
            if (callback) callback(res);
            return res;
        }
        if (callback) callback(false);
        return false;
    };

    /**
     * Micro-toast notification alerts. Supports OS native push notifications fallback.
     */
    let toastContainer = null;
    papyr.toast = (message, type = 'info', duration = 3000, useNative = false) => {
        if (typeof window === 'undefined') return;

        if (type === 'default') type = 'info';

        if (useNative && 'Notification' in window) {
            const fireNative = () => {
                try {
                    new Notification('Papyr Notification', {
                        body: message,
                        icon: 'https://eldrex.landecs.org/logo/eldrex-papyr-js.png'
                    });
                } catch (e) {
                    showCustomToast();
                }
            };

            if (Notification.permission === 'granted') {
                fireNative();
                return;
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        fireNative();
                    } else {
                        showCustomToast();
                    }
                });
                return;
            }
        }
        
        showCustomToast();
        
        function showCustomToast() {
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.className = 'papyr-toast-container';
                toastContainer.style.cssText = `
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(toastContainer);
            }
            
            let bg = type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                     type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 
                     type === 'warning' ? 'rgba(245, 158, 11, 0.9)' : 
                     'rgba(59, 130, 246, 0.9)';
            
            let iconSvg = type === 'error' ? '✕ ' : 
                          type === 'success' ? '✓ ' : 
                          type === 'warning' ? '⚠ ' : 
                          'ℹ ';

            let toast = document.createElement('div');
            toast.className = `papyr-toast papyr-toast-${type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
            toast.style.cssText = `
                background: ${bg};
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255,255,255,0.1);
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 16px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
                font-family: inherit;
                font-size: 0.9rem;
                font-weight: 500;
                pointer-events: auto;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.1);
            `;
            
            toast.innerHTML = `<span style="font-weight: bold; margin-right: 6px;">${iconSvg}</span>${message}`;
            toastContainer.appendChild(toast);
            
            toast.offsetHeight;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px) scale(0.95)';
                setTimeout(() => {
                    toast.remove();
                    if (toastContainer && toastContainer.children.length === 0) {
                        toastContainer.remove();
                        toastContainer = null;
                    }
                }, 350);
            }, duration);
        }
    };

    /**
     * High-performance Tabs routing widgets.
     */
    papyr.tabs = (tabs) => {
        let tabHeaders = papyr.div('.tab-headers');
        let tabContents = papyr.div('.tab-contents');
        let container = papyr.div('.tabs', tabHeaders, tabContents);
        
        tabs.forEach((tab, index) => {
            let header = papyr.button(tab.title, {
                class: index === 0 ? 'tab-header tab-active' : 'tab-header',
                on: {click: () => {
                    container.querySelectorAll('.tab-header').forEach((h, idx) => {
                        h.classList.toggle('tab-active', idx === index);
                    });
                    tabContents.innerHTML = '';
                    let contentNode = typeof tab.content === 'string' ? papyr.div(tab.content) : tab.content;
                    tabContents.appendChild(contentNode);
                }}
            });
            tabHeaders.appendChild(header);
            
            if(index === 0) {
                let contentNode = typeof tab.content === 'string' ? papyr.div(tab.content) : tab.content;
                tabContents.appendChild(contentNode);
            }
        });
        
        return container;
    };

    /**
     * Highly responsive Table renderer.
     */
    papyr.table = (...args) => {
        if (args.length > 0 && Array.isArray(args[0]) && typeof args[0][0] === 'string') {
            let [headers, data] = args;
            let table = papyr('table', '.data-table');
            let thead = papyr.thead();
            let trHead = papyr.tr();
            headers.forEach(h => {
                let formattedHeader = h.charAt(0).toUpperCase() + h.slice(1);
                trHead.appendChild(papyr.th(formattedHeader));
            });
            thead.appendChild(trHead);
            table.appendChild(thead);
            
            let tbody = papyr.tbody();
            data.forEach(row => {
                let tr = papyr.tr();
                headers.forEach(header => {
                    let cellVal = row[header] !== undefined ? row[header] : '';
                    let td = papyr.td();
                    if (cellVal instanceof Element) {
                        td.appendChild(cellVal);
                    } else {
                        td.textContent = cellVal;
                    }
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            
            return table;
        } else {
            return papyr('table', ...args);
        }
    };

    /**
     * Async data spinner fetch utility.
     */
    papyr.fetch = async (url, options = {}) => {
        let loading = papyr.div('.loading', 
            papyr.div('.spinner'),
            papyr.span('Fetching data...')
        );
        let container = papyr.div(loading);
        
        setTimeout(async () => {
            try {
                let response = await fetch(url, options);
                let data = await response.json();
                container.innerHTML = '';
                if(options.onSuccess) {
                    options.onSuccess(container, data);
                } else {
                    container.appendChild(papyr.pre(JSON.stringify(data, null, 2)));
                }
            } catch(e) {
                container.innerHTML = '';
                container.appendChild(papyr.div('.error', `⚠️ Error: ${e.message}`));
            }
        }, 400);
        
        return container;
    };

    // ==========================================
    // 3. Official Plugins (Form, Table, Charts)
    // ==========================================

    papyr.input = (type, placeholder, options = {}) => {
        if (typeof type === 'object' && type !== null) return papyr('input', type);
        if (typeof placeholder === 'object' && placeholder !== null) { options = placeholder; placeholder = options.placeholder || ''; }
        options = Object.assign({}, options);
        if (type) options.type = options.type || type;
        if (placeholder) options.placeholder = options.placeholder || placeholder;
        if (type) return papyr('input', `.input-${type}`, options);
        return papyr('input', options);
    };

    papyr.simpleTable = (data) => {
        let table = papyr('table', '.papyr-table');
        
        // Add headers
        if (data.headers) {
            let thead = papyr('thead');
            let tr = papyr('tr');
            data.headers.forEach(header => {
                tr.appendChild(papyr('th', header));
            });
            thead.appendChild(tr);
            table.appendChild(thead);
        }
        
        // Add rows
        if (data.rows) {
            let tbody = papyr('tbody');
            data.rows.forEach(row => {
                let tr = papyr('tr');
                row.forEach(cell => {
                    tr.appendChild(papyr('td', String(cell)));
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
        }
        
        return table;
    };

    /**
     * High-performance Canvas based micro-charts plugin.
     */
    papyr.chart = (type, data, options = {}) => {
        let canvas = papyr('canvas', {
            width: options.width || 300,
            height: options.height || 180,
            style: { 
                display: 'block', 
                margin: '0 auto', 
                maxWidth: '100%',
                borderRadius: '8px',
                background: 'transparent'
            }
        });
        
        requestAnimationFrame(() => {
            let ctx = canvas.getContext('2d');
            if (!ctx) return;
            let w = canvas.width;
            let h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            
            if (type === 'bar') {
                let values = data.values || [];
                let labels = data.labels || [];
                let max = Math.max(...values, 1);
                let count = values.length;
                let spacing = 16;
                let barW = (w - (spacing * (count + 1))) / count;
                
                values.forEach((val, idx) => {
                    let barH = (val / max) * (h - 50);
                    let x = spacing + idx * (barW + spacing);
                    let y = h - 30 - barH;
                    
                    ctx.fillStyle = 'rgba(255,255,255,0.02)';
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x, 10, barW, h - 40, 6);
                    } else {
                        ctx.rect(x, 10, barW, h - 40);
                    }
                    ctx.fill();
                    
                    let grad = ctx.createLinearGradient(0, y, 0, h - 30);
                    grad.addColorStop(0, options.color || '#6366f1');
                    grad.addColorStop(1, options.colorAlt || '#312e81');
                    ctx.fillStyle = grad;
                    
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
                    } else {
                        ctx.rect(x, y, barW, barH);
                    }
                    ctx.fill();
                    
                    ctx.fillStyle = '#f8fafc';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(val, x + barW / 2, y - 8);
                    
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(labels[idx] || '', x + barW / 2, h - 10);
                });
            } 
            else if (type === 'ring') {
                let val = data.value || 0;
                let cx = w / 2;
                let cy = h / 2;
                let r = Math.min(w, h) / 2.6;
                
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.lineWidth = options.lineWidth || 14;
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(cx, cy, r, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * (val / 100)));
                ctx.lineWidth = options.lineWidth || 14;
                ctx.strokeStyle = options.color || '#10b981';
                ctx.lineCap = 'round';
                ctx.stroke();
                
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${val}%`, cx, cy - 6);
                
                ctx.fillStyle = '#94a3b8';
                ctx.font = '10px sans-serif';
                ctx.fillText(data.label || '', cx, cy + 16);
            }
        });
        
        return canvas;
    };

    // ==========================================
    // 4. Pre-built Components
    // ==========================================
    Object.assign(papyr.components, {
        navbar: (logo, links) => {
            let nav = papyr.nav('.navbar');
            let navLinks = papyr.div('.nav-links');
            
            links.forEach(link => {
                navLinks.appendChild(papyr.a(link.text, {
                    href: link.href, 
                    class: 'nav-link',
                    onclick: link.onclick || null
                }));
            });
            
            let logoEl = typeof logo === 'string' ? papyr.div(logo, '.logo') : logo;
            nav.appendChild(logoEl);
            nav.appendChild(navLinks);
            return nav;
        },
        
        hero: (title, subtitle, buttonText, buttonAction) => {
            return papyr.section('.hero',
                papyr.h1(title, '.hero-title'),
                papyr.p(subtitle, '.hero-subtitle'),
                papyr.button(buttonText, {
                    class: 'hero-btn', 
                    on: {click: buttonAction}
                })
            );
        },
        
        sidebar: (items) => {
            let sidebar = papyr.aside('.sidebar');
            items.forEach(item => {
                let name = typeof item === 'string' ? item : (item.text || '');
                let sidebarItem;
                
                if (typeof item === 'object' && item.icon) {
                    sidebarItem = papyr.div('.sidebar-item', 
                        papyr.icon(item.icon, { size: 16, style: { marginRight: '8px' } }),
                        papyr.span(name)
                    );
                } else {
                    sidebarItem = papyr.div('.sidebar-item', 
                        papyr.span(name)
                    );
                }
                
                if (item.active) sidebarItem.classList.add('active');
                
                sidebarItem.addEventListener('click', () => {
                    sidebar.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
                    sidebarItem.classList.add('active');
                    if (item.onclick) item.onclick(name);
                    else papyr.toast(`Navigated to: ${name}`, 'info');
                });
                
                sidebar.appendChild(sidebarItem);
            });
            return sidebar;
        },
        
        footer: (text, links = []) => {
            let footer = papyr.footer('.footer');
            let linkContainer = papyr.div('.footer-links');
            links.forEach(link => {
                linkContainer.appendChild(papyr.a(link.text, {href: link.href}));
            });
            footer.appendChild(linkContainer);
            footer.appendChild(papyr.p(text, '.footer-text'));
            return footer;
        },
        
        carousel: (images) => {
            let current = 0;
            let img = papyr.img('', {src: images[0], class: 'carousel-img'});
            let prevBtn = papyr.button('◀', {class: 'carousel-btn prev-btn'});
            let nextBtn = papyr.button('▶', {class: 'carousel-btn next-btn'});
            
            let dotsContainer = papyr.div('.carousel-dots');
            images.forEach((_, idx) => {
                let dot = papyr.span('.carousel-dot');
                if (idx === 0) dot.classList.add('active');
                dot.onclick = () => goTo(idx);
                dotsContainer.appendChild(dot);
            });
            
            let container = papyr.div('.carousel', prevBtn, img, nextBtn, dotsContainer);
            
            function updateCarousel() {
                img.style.opacity = 0;
                setTimeout(() => {
                    img.src = images[current];
                    img.style.opacity = 1;
                }, 150);
                
                container.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === current);
                });
            }
            
            function goTo(idx) {
                current = idx;
                updateCarousel();
            }
            
            prevBtn.onclick = () => {
                current = (current - 1 + images.length) % images.length;
                updateCarousel();
            };
            nextBtn.onclick = () => {
                current = (current + 1) % images.length;
                updateCarousel();
            };
            return container;
        }
    });
})();


// --- MODULE: plugins/design.js ---
/**
 * PAPYR DESIGN ENGINE
 * Advanced, responsive layout and aesthetic helpers.
 */
(function() {
    // Structural layout helpers mapping to flexbox
    papyr.center = (...args) => papyr.div({ style: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' } }, ...args);
    papyr.left = (...args) => papyr.div({ style: { display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' } }, ...args);
    papyr.right = (...args) => papyr.div({ style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' } }, ...args);
    papyr.justify = (...args) => papyr.div({ style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' } }, ...args);

    // Aesthetic design helpers
    papyr.glass = (...args) => papyr.div({ 
        style: { 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            borderRadius: '16px'
        } 
    }, ...args);

    // Template Engine stub
    papyr.template = (name) => {
        if (name === 'glass-dashboard') {
            return papyr.div({ style: { display: 'flex', minHeight: '100vh', background: '#0f172a', padding: '20px', gap: '20px' } },
                papyr.glass({ style: { width: '250px', padding: '20px' } }, papyr.h3("Sidebar")),
                papyr.div({ style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' } },
                    papyr.glass({ style: { padding: '20px' } }, papyr.h2("Dashboard Overview")),
                    papyr.div({ style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' } },
                        papyr.glass({ style: { padding: '40px', textAlign: 'center' } }, "Metric 1"),
                        papyr.glass({ style: { padding: '40px', textAlign: 'center' } }, "Metric 2")
                    )
                )
            );
        }
        return papyr.div(`Template ${name} not found.`);
    };

    // Figma Design-to-Papyr Compiler
    const translateFigmaNode = (node) => {
        if (!node) return null;
        
        let styles = {};
        if (node.absoluteBoundingBox) {
            styles.position = 'absolute';
            styles.left = `${node.absoluteBoundingBox.x}px`;
            styles.top = `${node.absoluteBoundingBox.y}px`;
            styles.width = `${node.absoluteBoundingBox.width}px`;
            styles.height = `${node.absoluteBoundingBox.height}px`;
        }

        // Fills
        if (node.fills && node.fills.length > 0) {
            let fill = node.fills[0];
            if (fill.type === 'SOLID' && fill.color) {
                let r = Math.round(fill.color.r * 255);
                let g = Math.round(fill.color.g * 255);
                let b = Math.round(fill.color.b * 255);
                let a = fill.opacity !== undefined ? fill.opacity : (fill.color.a !== undefined ? fill.color.a : 1);
                styles.background = `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }

        // Strokes
        if (node.strokes && node.strokes.length > 0) {
            let stroke = node.strokes[0];
            let weight = node.strokeWeight || 1;
            if (stroke.type === 'SOLID' && stroke.color) {
                let r = Math.round(stroke.color.r * 255);
                let g = Math.round(stroke.color.g * 255);
                let b = Math.round(stroke.color.b * 255);
                let a = stroke.opacity !== undefined ? stroke.opacity : (stroke.color.a !== undefined ? stroke.color.a : 1);
                styles.border = `${weight}px solid rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }

        // Corner Radius
        if (node.cornerRadius) {
            styles.borderRadius = `${node.cornerRadius}px`;
        }

        // Layout Mode (Auto Layout translation)
        if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
            styles.display = 'flex';
            styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
            if (node.itemSpacing) styles.gap = `${node.itemSpacing}px`;
            
            if (node.paddingTop) styles.paddingTop = `${node.paddingTop}px`;
            if (node.paddingBottom) styles.paddingBottom = `${node.paddingBottom}px`;
            if (node.paddingLeft) styles.paddingLeft = `${node.paddingLeft}px`;
            if (node.paddingRight) styles.paddingRight = `${node.paddingRight}px`;
        }

        // Children Compilation
        let children = [];
        if (node.children && Array.isArray(node.children)) {
            children = node.children.map(translateFigmaNode).filter(Boolean);
        }

        if (node.type === 'TEXT') {
            if (node.style) {
                if (node.style.fontSize) styles.fontSize = `${node.style.fontSize}px`;
                if (node.style.fontWeight) styles.fontWeight = String(node.style.fontWeight);
                if (node.style.fontFamily) styles.fontFamily = node.style.fontFamily;
                if (node.style.textAlignHorizontal) styles.textAlign = node.style.textAlignHorizontal.toLowerCase();
            }
            return papyr.span(node.characters || '', { style: styles });
        }

        return papyr.div({ style: styles }, ...children);
    };

    papyr.import = {
        figma: (figmaJson) => {
            if (!figmaJson) return null;
            let root = figmaJson.document || figmaJson;
            if (root.children && root.children.length > 0 && root.type === 'DOCUMENT') {
                root = root.children[0];
            }
            if (root.children && root.children.length > 0 && root.type === 'CANVAS') {
                root = root.children[0];
            }
            return translateFigmaNode(root);
        }
    };
})();


// --- MODULE: plugins/layout.js ---
/**
 * PAPYR LAYOUT ENGINE
 * Structural layout orchestration and zero-conflict responsive workspace management.
 * v2.0 - Collapsible glass sidebars, adaptive layout intelligence, and foldable display panels.
 */
(function() {
    // Glassmorphism panel helper
    papyr.glass = (...args) => {
        return papyr.div({ 
            class: 'papyr-glass-panel',
            style: { 
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
                borderRadius: '16px',
                padding: '20px',
                color: '#f8fafc'
            } 
        }, ...args);
    };

    papyr.autoFlex = (container, options = {}) => {
        if (!container || typeof window === 'undefined') return container;
        const breakpoint = options.breakpoint || 768;
        const rowClass = options.rowClass || 'flex-row';
        const colClass = options.colClass || 'flex-col';

        const updateLayout = (width) => {
            if (width < breakpoint) {
                container.classList.remove(rowClass);
                container.classList.add(colClass);
                container.style.flexDirection = 'column';
            } else {
                container.classList.remove(colClass);
                container.classList.add(rowClass);
                container.style.flexDirection = 'row';
            }
        };

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    updateLayout(entry.contentRect.width || entry.target.clientWidth);
                }
            });
            observer.observe(container);
            if (!container._cleanups) container._cleanups = [];
            container._cleanups.push(() => observer.disconnect());
        } else {
            const handler = () => updateLayout(window.innerWidth);
            window.addEventListener('resize', handler);
            handler();
            if (!container._cleanups) container._cleanups = [];
            container._cleanups.push(() => window.removeEventListener('resize', handler));
        }

        return container;
    };

    papyr.layout = {
        /**
         * Responsive Flex Container
         * Automatically adjusts based on screen width CSS variables.
         */
        flex(options = {}, ...children) {
            let config = Object.assign({
                direction: 'var(--papyr-flex-dir, row)',
                wrap: 'var(--papyr-flex-wrap, wrap)',
                justify: 'var(--papyr-flex-justify, flex-start)',
                align: 'var(--papyr-flex-align, stretch)',
                gap: 'var(--papyr-flex-gap, 16px)'
            }, options);

            return papyr.div({
                class: 'papyr-layout-flex',
                style: {
                    display: 'flex',
                    flexDirection: config.direction,
                    flexWrap: config.wrap,
                    justifyContent: config.justify,
                    alignItems: config.align,
                    gap: config.gap,
                    width: '100%'
                }
            }, ...children);
        },

        /**
         * Advanced CSS Grid Container
         */
        grid(options = {}, ...children) {
            let config = Object.assign({
                cols: 'var(--papyr-grid-cols, repeat(auto-fit, minmax(250px, 1fr)))',
                rows: 'var(--papyr-grid-rows, auto)',
                gap: 'var(--papyr-grid-gap, 20px)'
            }, options);

            return papyr.div({
                class: 'papyr-layout-grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: config.cols,
                    gridTemplateRows: config.rows,
                    gap: config.gap,
                    width: '100%'
                }
            }, ...children);
        },

        /**
         * Semantic Row / Col flex wraps
         */
        row(...children) { return this.flex({ direction: 'row' }, ...children); },
        col(...children) { return this.flex({ direction: 'column' }, ...children); },

        /**
         * Foldable dual-screen screen layout adapter.
         * Auto-splits layout if a fold viewport is detected.
         */
        foldable(options = {}, ...children) {
            let config = Object.assign({
                gap: '24px'
            }, options);

            const isFold = papyr.state(false);

            if (typeof window !== 'undefined') {
                const checkFold = () => {
                    const hasSpanning = window.matchMedia('(spanning: single-fold-vertical)').matches || 
                                        window.matchMedia('(spanning: single-fold-horizontal)').matches;
                    // Dual screen detection fallback (simulating fold split on medium-sized landscape devices)
                    const isFoldDevice = hasSpanning || (window.innerWidth >= 768 && window.innerWidth < 1200 && window.innerWidth / window.innerHeight > 1.3);
                    isFold.value = isFoldDevice;
                };
                window.addEventListener('resize', checkFold);
                checkFold();
            }

            return papyr.div({
                class: 'papyr-foldable-layout',
                style: () => ({
                    display: 'grid',
                    gridTemplateColumns: isFold.value ? '1fr 1fr' : '1fr',
                    gap: config.gap,
                    width: '100%'
                })
            }, ...children);
        },


        mobile(options = {}, ...children) {
            const { header = null, nav = null } = options;
            return papyr.div({
                class: 'papyr-layout-mobile',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: '100%',
                    background: '#070913'
                }
            },
                header ? papyr('header', { style: { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(16,22,42,0.8)' } }, header) : null,
                papyr('main', { style: { flexGrow: 1, padding: '16px', overflowY: 'auto' } }, ...children),
                nav ? papyr('nav', { style: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(16,22,42,0.9)', display: 'flex', justifyContent: 'space-around' } }, nav) : null
            );
        },

        tablet(options = {}, ...children) {
            const { sidebar = null } = options;
            return papyr.div({
                class: 'papyr-layout-tablet',
                style: {
                    display: 'flex',
                    minHeight: '100vh',
                    width: '100%',
                    background: '#070913'
                }
            },
                sidebar ? papyr('aside', { style: { width: '80px', borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,36,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '20px' } }, sidebar) : null,
                papyr('main', { style: { flexGrow: 1, padding: '24px', overflowY: 'auto' } }, ...children)
            );
        },

        desktop(options = {}, ...children) {
            const { sidebar = null, inspector = null, sidebarWidth = '250px', inspectorWidth = '300px' } = options;
            return papyr.div({
                class: 'papyr-layout-desktop',
                style: {
                    display: 'flex',
                    minHeight: '100vh',
                    width: '100%',
                    background: '#070913'
                }
            },
                sidebar ? papyr('aside', { style: { width: sidebarWidth, borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,36,0.95)', overflowY: 'auto' } }, sidebar) : null,
                papyr('main', { style: { flexGrow: 1, padding: '24px', overflowY: 'auto' } }, ...children),
                inspector ? papyr('aside', { style: { width: inspectorWidth, borderLeft: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,36,0.95)', overflowY: 'auto' } }, inspector) : null
            );
        },

        /**
         * Persistent App Shell / Dashboard Template
         * Supports collapsible sidebars, mobile headers, and custom theme overrides.
         */
        dashboard(options = {}) {
            const { 
                sidebar = null, 
                header = null, 
                main = null, 
                footer = null,
                sidebarWidth = '250px',
                headerHeight = '64px'
            } = options;

            // Reactive state to control menu toggle on mobile viewport sizes
            const sidebarOpen = papyr.state(true);

            let shell = papyr.div({
                class: 'papyr-app-shell',
                style: {
                    display: 'grid',
                    gridTemplateColumns: sidebar ? `${sidebarWidth} 1fr` : '1fr',
                    gridTemplateRows: header ? `${headerHeight} 1fr auto` : '1fr auto',
                    minHeight: '100vh',
                    width: '100%',
                    background: '#070913'
                }
            });

            // Auto-collapse sidebar listener on load for mobile viewports
            if (typeof window !== 'undefined') {
                const checkScreenSize = () => {
                    if (window.innerWidth < 768) {
                        sidebarOpen.value = false;
                    } else {
                        sidebarOpen.value = true;
                    }
                };
                window.addEventListener('resize', checkScreenSize);
                // Run on tick to let element mount
                setTimeout(checkScreenSize, 10);
            }

            if (header) {
                // Header gets a menu toggle button for responsive sidebar collapse
                const menuToggleButton = papyr.button('.menu-toggle', {
                    style: {
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '10px',
                        display: sidebar ? 'inline-block' : 'none'
                    },
                    onclick: () => {
                        sidebarOpen.value = !sidebarOpen.value;
                    }
                }, '☰');

                shell.appendChild(papyr('header', { 
                    class: 'papyr-shell-header',
                    style: { 
                        gridColumn: '1 / -1', 
                        background: 'rgba(16, 22, 42, 0.8)', 
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 20px',
                        gap: '15px',
                        zIndex: 10
                    }
                }, menuToggleButton, header));
            }

            if (sidebar) {
                const asideContainer = papyr('aside', {
                    class: 'papyr-shell-sidebar',
                    style: () => ({
                        gridRow: header ? '2 / -1' : '1 / -1',
                        background: 'rgba(11, 16, 36, 0.95)',
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                        overflowY: 'auto',
                        width: sidebarOpen.value ? sidebarWidth : '0px',
                        minWidth: sidebarOpen.value ? sidebarWidth : '0px',
                        opacity: sidebarOpen.value ? 1 : 0,
                        pointerEvents: sidebarOpen.value ? 'auto' : 'none',
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s'
                    })
                }, sidebar);

                shell.appendChild(asideContainer);
            }

            // Main routing and component projection area
            shell.appendChild(papyr('main', {
                class: 'papyr-main-content',
                style: { 
                    padding: '24px', 
                    overflowY: 'auto',
                    position: 'relative',
                    zIndex: 1
                }
            }, main || papyr.div("Main Content Area")));

            if (footer) {
                shell.appendChild(papyr('footer', {
                    class: 'papyr-shell-footer',
                    style: { 
                        gridColumn: sidebar ? '2 / -1' : '1', 
                        background: 'rgba(16, 22, 42, 0.8)', 
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        padding: '12px 20px'
                    }
                }, footer));
            }

            return shell;
        },

        /**
         * Cinematic centered Hero Section template
         * Extremely human-centered and beginner friendly: scaffolds titles, descriptions, action lists, and glass backings instantly.
         */
        hero(options = {}) {
            const {
                title = "Cinematic Experience",
                subtitle = "Crafted beautifully with high performance reactivity",
                actions = [],
                theme = 'primary',
                glass = true,
                padding = '80px 40px'
            } = options;

            const primaryColor = theme === 'teal' ? '#14b8a6' : '#6366f1';
            const secondaryColor = theme === 'teal' ? '#0d9488' : '#4f46e5';

            let heroContent = papyr.flex.col({
                align: 'center',
                style: {
                    textAlign: 'center',
                    maxWidth: '800px',
                    gap: '20px',
                    zIndex: 2,
                    position: 'relative'
                }
            },
                papyr.h1(title, {
                    style: {
                        fontSize: 'var(--papyr-hero-title-size, 3.5rem)',
                        fontWeight: '800',
                        color: 'white',
                        margin: 0,
                        lineHeight: '1.1',
                        letterSpacing: '-0.025em',
                        background: `linear-gradient(135deg, #ffffff 30%, ${primaryColor} 100%)`,
                        webkitBackgroundClip: 'text',
                        webkitTextFillColor: 'transparent',
                        textFillColor: 'transparent'
                    }
                }),
                papyr.p(subtitle, {
                    style: {
                        fontSize: '1.25rem',
                        color: '#94a3b8',
                        margin: 0,
                        lineHeight: '1.6',
                        maxWidth: '600px'
                    }
                })
            );

            if (actions && actions.length > 0) {
                let actionRow = papyr.flex.row({
                    justify: 'center',
                    gap: '12px',
                    style: { marginTop: '10px' }
                });
                actions.forEach(action => {
                    if (action instanceof Element) {
                        actionRow.appendChild(action);
                    } else if (typeof action === 'object') {
                        let btn = papyr.button(action.text || 'Action', Object.assign({
                            style: Object.assign({
                                background: action.primary ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` : 'rgba(255,255,255,0.06)',
                                border: action.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.25s',
                                boxShadow: action.primary ? `0 4px 15px ${primaryColor}40` : 'none'
                            }, action.style || {})
                        }, action.attrs || {}));
                        actionRow.appendChild(btn);
                    }
                });
                heroContent.appendChild(actionRow);
            }

            let containerStyle = {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: padding,
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px'
            };

            if (glass) {
                return papyr.div({
                    class: 'papyr-hero-glass',
                    style: Object.assign(containerStyle, {
                        background: 'rgba(10, 15, 30, 0.4)',
                        backdropFilter: 'blur(20px)',
                        webkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                    })
                }, heroContent);
            }

            return papyr.div({ style: containerStyle }, heroContent);
        },

        gpu(options = {}, nodes = []) {
            const width = options.width || 800;
            const height = options.height || 600;
            
            const container = document.createElement('div');
            container.className = 'papyr-gpu-layout-container';
            container.style.position = 'relative';
            container.style.width = typeof width === 'number' ? `${width}px` : width;
            container.style.height = typeof height === 'number' ? `${height}px` : height;
            container.style.overflow = 'hidden';
            container.style.borderRadius = options.borderRadius || '12px';

            const glCanvas = document.createElement('canvas');
            glCanvas.width = typeof width === 'number' ? width : 800;
            glCanvas.height = typeof height === 'number' ? height : 600;
            glCanvas.style.position = 'absolute';
            glCanvas.style.left = '0';
            glCanvas.style.top = '0';
            glCanvas.style.width = '100%';
            glCanvas.style.height = '100%';
            container.appendChild(glCanvas);

            const textCanvas = document.createElement('canvas');
            textCanvas.width = glCanvas.width;
            textCanvas.height = glCanvas.height;
            textCanvas.style.position = 'absolute';
            textCanvas.style.left = '0';
            textCanvas.style.top = '0';
            textCanvas.style.width = '100%';
            textCanvas.style.height = '100%';
            textCanvas.style.pointerEvents = 'none';
            container.appendChild(textCanvas);

            const gl = glCanvas.getContext('webgl2', { alpha: true, antialias: true });
            const ctx2d = textCanvas.getContext('2d');

            const vsSource = `#version 300 es
            in vec2 position;
            in vec4 a_rect;
            in vec4 a_color;
            in vec4 a_borderColor;
            in vec4 a_border_radius_width;
            out vec2 v_localCoords;
            out vec2 v_size;
            out vec4 v_color;
            out vec4 v_borderColor;
            out float v_borderWidth;
            out float v_radius;
            uniform vec2 u_resolution;

            void main() {
                vec2 rectPos = a_rect.xy;
                vec2 rectSize = a_rect.zw;
                vec2 p = position * rectSize + rectPos;
                vec2 clipSpace = (p / u_resolution) * 2.0 - 1.0;
                gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);

                v_localCoords = (position - 0.5) * rectSize;
                v_size = rectSize;
                v_color = a_color;
                v_borderColor = a_borderColor;
                v_radius = a_border_radius_width.x;
                v_borderWidth = a_border_radius_width.y;
            }`;

            const fsSource = `#version 300 es
            precision highp float;
            in vec2 v_localCoords;
            in vec2 v_size;
            in vec4 v_color;
            in vec4 v_borderColor;
            in float v_borderWidth;
            in float v_radius;
            out vec4 outColor;

            float sdRoundedBox(vec2 p, vec2 b, float r) {
                vec2 q = abs(p) - b + vec2(r);
                return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
            }

            void main() {
                vec2 halfSize = v_size * 0.5;
                float d = sdRoundedBox(v_localCoords, halfSize, v_radius);
                float fillAlpha = 1.0 - smoothstep(-1.0, 1.0, d);
                
                vec4 col = v_color;
                if (v_borderWidth > 0.0) {
                    float borderDist = d + v_borderWidth;
                    float borderAlpha = smoothstep(-1.0, 1.0, d) - smoothstep(-1.0, 1.0, borderDist);
                    col = mix(v_color, v_borderColor, borderAlpha);
                }
                outColor = col;
                outColor.a *= fillAlpha;
                if (outColor.a == 0.0) discard;
            }`;

            let program, vao, instanceBuffer;
            let positionLoc, rectLoc, colorLoc, borderColorLoc, borderRadiusWidthLoc;

            if (gl) {
                const vs = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(vs, vsSource);
                gl.compileShader(vs);
                if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
                    console.error("VS compile error:", gl.getShaderInfoLog(vs));
                }

                const fs = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(fs, fsSource);
                gl.compileShader(fs);
                if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                    console.error("FS compile error:", gl.getShaderInfoLog(fs));
                }

                program = gl.createProgram();
                gl.attachShader(program, vs);
                gl.attachShader(program, fs);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error("Program link error:", gl.getProgramInfoLog(program));
                }

                gl.useProgram(program);
                const resLoc = gl.getUniformLocation(program, "u_resolution");
                gl.uniform2f(resLoc, glCanvas.width, glCanvas.height);

                vao = gl.createVertexArray();
                gl.bindVertexArray(vao);

                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                const vertices = new Float32Array([
                    0, 0,
                    1, 0,
                    0, 1,
                    0, 1,
                    1, 0,
                    1, 1
                ]);
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                
                positionLoc = gl.getAttribLocation(program, "position");
                gl.enableVertexAttribArray(positionLoc);
                gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

                instanceBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);

                const stride = 16 * 4;

                rectLoc = gl.getAttribLocation(program, "a_rect");
                gl.enableVertexAttribArray(rectLoc);
                gl.vertexAttribPointer(rectLoc, 4, gl.FLOAT, false, stride, 0);
                gl.vertexAttribDivisor(rectLoc, 1);

                colorLoc = gl.getAttribLocation(program, "a_color");
                gl.enableVertexAttribArray(colorLoc);
                gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, stride, 4 * 4);
                gl.vertexAttribDivisor(colorLoc, 1);

                borderColorLoc = gl.getAttribLocation(program, "a_borderColor");
                gl.enableVertexAttribArray(borderColorLoc);
                gl.vertexAttribPointer(borderColorLoc, 4, gl.FLOAT, false, stride, 8 * 4);
                gl.vertexAttribDivisor(borderColorLoc, 1);

                borderRadiusWidthLoc = gl.getAttribLocation(program, "a_border_radius_width");
                gl.enableVertexAttribArray(borderRadiusWidthLoc);
                gl.vertexAttribPointer(borderRadiusWidthLoc, 4, gl.FLOAT, false, stride, 12 * 4);
                gl.vertexAttribDivisor(borderRadiusWidthLoc, 1);
            }

            function solveLayout(node, parentX, parentY, parentW, parentH) {
                let solved = {
                    x: parentX + (node.x || 0),
                    y: parentY + (node.y || 0),
                    width: node.width || parentW,
                    height: node.height || parentH,
                    color: node.color || [0.1, 0.1, 0.1, 1],
                    borderColor: node.borderColor || [0, 0, 0, 0],
                    borderWidth: node.borderWidth || 0,
                    borderRadius: node.borderRadius || 0,
                    text: node.text || null,
                    textColor: node.textColor || [1, 1, 1, 1],
                    fontSize: node.fontSize || 14,
                    fontFamily: node.fontFamily || 'sans-serif'
                };

                let children = node.children || [];
                let solvedChildren = [];
                if (children.length > 0) {
                    const direction = node.direction || 'column';
                    const padding = node.padding || 0;
                    const gap = node.gap || 0;
                    
                    let curX = solved.x + padding;
                    let curY = solved.y + padding;
                    let innerW = solved.width - padding * 2;
                    let innerH = solved.height - padding * 2;

                    children.forEach(child => {
                        let childW = child.width || (direction === 'row' ? (innerW - gap * (children.length - 1)) / children.length : innerW);
                        let childH = child.height || (direction === 'column' ? (innerH - gap * (children.length - 1)) / children.length : innerH);
                        
                        let childSolved = solveLayout(child, curX, curY, childW, childH);
                        solvedChildren.push(childSolved);

                        if (direction === 'row') {
                            curX += childW + gap;
                        } else {
                            curY += childH + gap;
                        }
                    });
                }

                solved.solvedChildren = solvedChildren;
                return solved;
            }

            function flattenTree(solvedNode, list = []) {
                list.push(solvedNode);
                (solvedNode.solvedChildren || []).forEach(child => flattenTree(child, list));
                return list;
            }

            function render(nodesList = []) {
                const rootSolved = solveLayout({ children: nodesList }, 0, 0, glCanvas.width, glCanvas.height);
                const flatNodes = flattenTree(rootSolved).filter(n => n !== rootSolved);

                if (gl) {
                    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

                    const data = new Float32Array(flatNodes.length * 16);
                    for (let i = 0; i < flatNodes.length; i++) {
                        const n = flatNodes[i];
                        const offset = i * 16;
                        data[offset + 0] = n.x;
                        data[offset + 1] = n.y;
                        data[offset + 2] = n.width;
                        data[offset + 3] = n.height;
                        data[offset + 4] = n.color[0];
                        data[offset + 5] = n.color[1];
                        data[offset + 6] = n.color[2];
                        data[offset + 7] = n.color[3];
                        data[offset + 8] = n.borderColor[0];
                        data[offset + 9] = n.borderColor[1];
                        data[offset + 10] = n.borderColor[2];
                        data[offset + 11] = n.borderColor[3];
                        data[offset + 12] = n.borderRadius;
                        data[offset + 13] = n.borderWidth;
                        data[offset + 14] = 0;
                        data[offset + 15] = 0;
                    }

                    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

                    gl.useProgram(program);
                    gl.bindVertexArray(vao);
                    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, flatNodes.length);
                } else {
                    ctx2d.clearRect(0, 0, textCanvas.width, textCanvas.height);
                    flatNodes.forEach(n => {
                        ctx2d.fillStyle = `rgba(${n.color[0]*255}, ${n.color[1]*255}, ${n.color[2]*255}, ${n.color[3]})`;
                        ctx2d.fillRect(n.x, n.y, n.width, n.height);
                    });
                }

                ctx2d.clearRect(0, 0, textCanvas.width, textCanvas.height);
                flatNodes.forEach(n => {
                    if (n.text) {
                        ctx2d.fillStyle = `rgba(${n.textColor[0]*255}, ${n.textColor[1]*255}, ${n.textColor[2]*255}, ${n.textColor[3]})`;
                        ctx2d.font = `${n.fontSize}px ${n.fontFamily}`;
                        ctx2d.textBaseline = 'middle';
                        ctx2d.textAlign = 'center';
                        ctx2d.fillText(n.text, n.x + n.width / 2, n.y + n.height / 2);
                    }
                });
            }

            if (nodes && typeof nodes.subscribe === 'function') {
                const unsub = nodes.subscribe((latestNodes) => {
                    render(latestNodes);
                });
                if (!container._cleanups) container._cleanups = [];
                container._cleanups.push(unsub);
            } else {
                render(nodes);
            }

            if (options.responsive) {
                const ro = new ResizeObserver((entries) => {
                    for (let entry of entries) {
                        const w = entry.contentRect.width;
                        const h = entry.contentRect.height;
                        glCanvas.width = w;
                        glCanvas.height = h;
                        textCanvas.width = w;
                        textCanvas.height = h;
                        if (gl) {
                            gl.viewport(0, 0, w, h);
                            gl.useProgram(program);
                            const resLoc = gl.getUniformLocation(program, "u_resolution");
                            gl.uniform2f(resLoc, w, h);
                        }
                        render(nodes.value || nodes);
                    }
                });
                ro.observe(container);
                if (!container._cleanups) container._cleanups = [];
                container._cleanups.push(() => ro.disconnect());
            }

            return container;
        }
    };

    // Reactive Device Class State
    let currentDeviceClass = 'desktop';
    if (typeof window !== 'undefined') {
        const getDeviceClass = (width) => {
            if (width < 768) return 'mobile';
            if (width < 1024) return 'tablet';
            if (width < 1440) return 'laptop';
            return 'desktop';
        };
        currentDeviceClass = papyr.state(getDeviceClass(window.innerWidth));
        window.addEventListener('resize', () => {
            currentDeviceClass.value = getDeviceClass(window.innerWidth);
        });
    } else {
        currentDeviceClass = { value: 'desktop', subscribe: () => {} };
    }
    papyr.layout.deviceClass = currentDeviceClass;
})();


// --- MODULE: plugins/shapes.js ---
/**
 * PAPYR SHAPES SYSTEM (Papyrus Shapes Engine — PSE)
 * Package: @papyr/shapes
 * Premium, customizable mathematical shape generators with elastic morph, 3D CSS rendering, and built-in physics.
 */
(function(window) {
    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
    if (!targetPapyr) {
        console.warn("Papyr core not found. Load papyr.js before loading shapes.");
        return;
    }

    const papyr = targetPapyr;

    // Helper: Generate Blob Path
    function createBlobPath(rad, points, offset) {
        const angleStep = (Math.PI * 2) / points;
        const pathPoints = [];
        for (let i = 0; i < points; i++) {
            const theta = i * angleStep;
            const r = rad + offset[i];
            const x = rad + r * Math.cos(theta);
            const y = rad + r * Math.sin(theta);
            pathPoints.push({ x, y });
        }
        let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
        for (let i = 0; i < points; i++) {
            const p1 = pathPoints[i];
            const p2 = pathPoints[(i + 1) % points];
            const xc = (p1.x + p2.x) / 2;
            const yc = (p1.y + p2.y) / 2;
            d += ` Q ${p1.x} ${p1.y}, ${xc} ${yc}`;
        }
        d += " Z";
        return d;
    }

    // Helper: Dynamic Keyframes Injection
    function injectKeyframe(name, rules) {
        if (typeof document === 'undefined') return;
        const styleId = `papyr-keyframe-${name}`;
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `@keyframes ${name} { ${rules} }`;
        document.head.appendChild(style);
    }

    // Helper: Apply CSS Animation
    function applyAnimation(el, type) {
        if (!el || !type) return;
        let animStyle = '';
        if (type === 'pulse') {
            animStyle = 'papyr-pulse 2s ease-in-out infinite';
            injectKeyframe('papyr-pulse', '0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); }');
        } else if (type === 'float') {
            animStyle = 'papyr-float 3s ease-in-out infinite';
            injectKeyframe('papyr-float', '0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); }');
        } else if (type === 'spin' || type === 'rotate') {
            animStyle = 'papyr-spin 6s linear infinite';
            injectKeyframe('papyr-spin', 'from { transform: rotate(0deg); } to { transform: rotate(360deg); }');
        } else if (type === 'bounce') {
            animStyle = 'papyr-bounce 2s ease infinite';
            injectKeyframe('papyr-bounce', '0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-20px); } 60% { transform: translateY(-10px); }');
        }
        if (animStyle) {
            el.style.animation = animStyle;
        }
    }

    // Helper: Annotate elements for Studio SDK editing
    function annotateSDK(el, type, options) {
        if (!el) return;
        el.setAttribute('data-papyr-type', type);
        el.setAttribute('data-papyr-editor', 'shapes');
        if (options && typeof options === 'object') {
            el.setAttribute('data-papyr-options', JSON.stringify(Object.keys(options).reduce((acc, k) => {
                if (typeof options[k] !== 'function' && typeof options[k] !== 'object') {
                    acc[k] = options[k];
                }
                return acc;
            }, {})));
        }
    }

    const shapesPlugin = {
        name: 'papyr-shapes',
        version: '3.1.2',
        install(papyr) {
            
            // ==========================================
            // 1. BASIC GEOMETRY
            // ==========================================

            papyr.rect = (options = {}) => {
                const { width = 200, height = 100, color = 'var(--papyr-primary)', rx = 0, ry = 0, style = {}, class: className = '', animate = null } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${className}" style="overflow: visible;">
                        <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${ry}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('rect') || svgEl, animate);
                annotateSDK(svgEl, 'rect', options);
                return svgEl;
            };

            papyr.circle = (options = {}) => {
                const { radius = 50, color = 'var(--papyr-primary)', style = {}, class: className = '', animate = null } = options;
                const size = radius * 2;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}" style="overflow: visible;">
                        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('circle') || svgEl, animate);
                annotateSDK(svgEl, 'circle', options);
                return svgEl;
            };

            papyr.triangle = (options = {}) => {
                const { size = 100, color = 'var(--papyr-primary)', style = {}, class: className = '', animate = null } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}" style="overflow: visible;">
                        <polygon points="${size / 2},0 0,${size} ${size},${size}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('polygon') || svgEl, animate);
                annotateSDK(svgEl, 'triangle', options);
                return svgEl;
            };

            papyr.ellipse = (options = {}) => {
                const { rx = 120, ry = 60, color = 'var(--papyr-primary)', style = {}, class: className = '', animate = null } = options;
                const w = rx * 2;
                const h = ry * 2;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="${className}" style="overflow: visible;">
                        <ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('ellipse') || svgEl, animate);
                annotateSDK(svgEl, 'ellipse', options);
                return svgEl;
            };

            papyr.polygon = (sidesOrOptions = 5, options = {}) => {
                let sides = 5;
                let opt = options;
                if (typeof sidesOrOptions === 'object') {
                    opt = sidesOrOptions;
                    sides = opt.sides || 5;
                } else if (typeof sidesOrOptions === 'number') {
                    sides = sidesOrOptions;
                }
                const { size = 150, color = 'var(--papyr-primary)', style = {}, class: className = '', animate = false, speed = 0.02 } = opt;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}">
                        <polygon fill="${color}" />
                    </svg>
                `).firstElementChild;
                const poly = svgEl.querySelector('polygon');
                const radius = size / 2;
                const cx = size / 2;
                const cy = size / 2;
                let rotation = 0;
                const updatePoints = () => {
                    let points = [];
                    for (let i = 0; i < sides; i++) {
                        let angle = (i * 2 * Math.PI) / sides + rotation;
                        let x = cx + radius * Math.cos(angle);
                        let y = cy + radius * Math.sin(angle);
                        points.push(`${x},${y}`);
                    }
                    poly.setAttribute('points', points.join(' '));
                };
                updatePoints();
                if (animate === 'spin' || animate === true) {
                    let animId = null;
                    const loop = () => {
                        if (typeof document !== 'undefined' && !document.body.contains(svgEl)) {
                            if (animId) cancelAnimationFrame(animId);
                            return;
                        }
                        rotation += speed;
                        updatePoints();
                        animId = requestAnimationFrame(loop);
                    };
                    animId = requestAnimationFrame(loop);
                    if (!svgEl._cleanups) svgEl._cleanups = [];
                    svgEl._cleanups.push(() => {
                        if (animId) cancelAnimationFrame(animId);
                    });
                } else if (animate) {
                    applyAnimation(svgEl.querySelector('polygon') || svgEl, animate);
                }
                if (style) Object.assign(svgEl.style, style);
                annotateSDK(svgEl, 'polygon', opt);
                return svgEl;
            };

            // ==========================================
            // 2. LINE SYSTEM & CURVES
            // ==========================================

            papyr.line = (options = {}) => {
                const { x1 = 0, y1 = 0, x2 = 300, y2 = 300, color = 'var(--papyr-primary)', width = 2, dash = false, style = {}, class: className = '', animate = null } = options;
                const isDotted = options.style === 'dotted' || options.dotted === true;
                const isDashed = dash || options.dashed === true;
                const strokeDashArray = isDotted ? '2,5' : (isDashed ? '8,5' : 'none');
                const strokeLineCap = isDotted ? 'round' : 'square';
                
                const minX = Math.min(x1, x2);
                const maxX = Math.max(x1, x2);
                const minY = Math.min(y1, y2);
                const maxY = Math.max(y1, y2);
                const containerW = Math.max(maxX - minX, width);
                const containerH = Math.max(maxY - minY, width);
                
                const svgEl = papyr.html(`
                    <svg viewBox="${minX} ${minY} ${containerW} ${containerH}" width="${containerW}" height="${containerH}" class="${className}" style="overflow: visible;">
                        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-dasharray="${strokeDashArray}" stroke-linecap="${strokeLineCap}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('line') || svgEl, animate);
                annotateSDK(svgEl, 'line', options);
                return svgEl;
            };

            papyr.curve = (options = {}) => {
                const { type = 'bezier', start = {x: 0, y: 100}, end = {x: 200, y: 100}, cp1 = {x: 100, y: 0}, cp2 = {x: 150, y: 0}, color = 'var(--papyr-primary)', width = 2, fill = 'none', style = {}, class: className = '', animate = null } = options;
                let d = '';
                if (type === 'bezier') {
                    d = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
                } else {
                    d = `M ${start.x} ${start.y} Q ${cp1.x} ${cp1.y}, ${end.x} ${end.y}`;
                }
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 200 200" width="200" height="200" class="${className}" style="overflow: visible;">
                        <path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('path') || svgEl, animate);
                annotateSDK(svgEl, 'curve', options);
                return svgEl;
            };

            papyr.arc = (options = {}) => {
                const { rx = 50, ry = 50, xAxisRotation = 0, largeArcFlag = 0, sweepFlag = 1, start = {x: 0, y: 50}, end = {x: 100, y: 50}, color = 'var(--papyr-primary)', width = 2, fill = 'none', style = {}, class: className = '', animate = null } = options;
                const d = `M ${start.x} ${start.y} A ${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 100 100" width="100" height="100" class="${className}" style="overflow: visible;">
                        <path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('path') || svgEl, animate);
                annotateSDK(svgEl, 'arc', options);
                return svgEl;
            };

            papyr.spline = (options = {}) => {
                const { points = [{x: 10, y: 90}, {x: 50, y: 10}, {x: 90, y: 90}, {x: 130, y: 10}], color = 'var(--papyr-primary)', width = 2, fill = 'none', style = {}, class: className = '', animate = null } = options;
                let d = '';
                if (points.length > 0) {
                    d = `M ${points[0].x} ${points[0].y}`;
                    for (let i = 0; i < points.length - 1; i++) {
                        const p0 = points[i];
                        const p1 = points[i + 1];
                        const cpX1 = p0.x + (p1.x - p0.x) / 2;
                        const cpY1 = p0.y;
                        const cpX2 = p0.x + (p1.x - p0.x) / 2;
                        const cpY2 = p1.y;
                        d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                    }
                }
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 200 200" width="200" height="200" class="${className}" style="overflow: visible;">
                        <path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('path') || svgEl, animate);
                annotateSDK(svgEl, 'spline', options);
                return svgEl;
            };

            // ==========================================
            // 3. BLOBS & LIQUIDS
            // ==========================================

            papyr.blob = (options = {}) => {
                const { size = 200, color = 'var(--papyr-primary)', points = 6, amplitude = 20, speed = 2000, animate = false } = options;
                const offsets = Array.from({ length: points }, () => (Math.random() - 0.5) * amplitude * 2);
                const pathD = createBlobPath(size / 2, points, offsets);
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow: visible;">
                        <path d="${pathD}" fill="${color}" style="transition: d ${speed}ms cubic-bezier(0.4, 0, 0.2, 1);" />
                    </svg>
                `).firstElementChild;
                
                if (animate === 'morph' || animate === true) {
                    const interval = setInterval(() => {
                        if (typeof document !== 'undefined' && !document.body.contains(svgEl)) {
                            clearInterval(interval);
                            return;
                        }
                        const path = svgEl.querySelector('path');
                        if (path) {
                            const newOffsets = Array.from({ length: points }, () => (Math.random() - 0.5) * amplitude * 2);
                            path.setAttribute('d', createBlobPath(size / 2, points, newOffsets));
                        }
                    }, speed);
                    if (!svgEl._cleanups) svgEl._cleanups = [];
                    svgEl._cleanups.push(() => clearInterval(interval));
                }
                annotateSDK(svgEl, 'blob', options);
                return svgEl;
            };

            papyr.wave = (options = {}) => {
                const { width = 800, height = 100, color = 'var(--papyr-primary)', amplitude = 20, frequency = 0.02, speed = 0.05, animate = false } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none" style="display: block;">
                        <path fill="${color}" />
                    </svg>
                `).firstElementChild;
                const path = svgEl.querySelector('path');
                let phase = 0;
                const updatePath = () => {
                    let points = [];
                    for (let x = 0; x <= width; x += 10) {
                        let y = height / 2 + Math.sin(x * frequency + phase) * amplitude;
                        points.push(`${x},${y}`);
                    }
                    let d = `M 0,${height} L 0,${height/2} ` + points.map(p => `L ${p}`).join(' ') + ` L ${width},${height} Z`;
                    path.setAttribute('d', d);
                };
                updatePath();
                if (animate) {
                    let animId = null;
                    const loop = () => {
                        if (typeof document !== 'undefined' && !document.body.contains(svgEl)) {
                            if (animId) cancelAnimationFrame(animId);
                            return;
                        }
                        phase += speed;
                        updatePath();
                        animId = requestAnimationFrame(loop);
                    };
                    animId = requestAnimationFrame(loop);
                    if (!svgEl._cleanups) svgEl._cleanups = [];
                    svgEl._cleanups.push(() => {
                        if (animId) cancelAnimationFrame(animId);
                    });
                }
                annotateSDK(svgEl, 'wave', options);
                return svgEl;
            };

            papyr.organic = (options = {}) => {
                const { width = 200, height = 200, color = 'var(--papyr-surface)', border = '1px solid var(--papyr-border)', animate = false, speed = 3000 } = options;
                const generateBorderRadius = () => {
                    const r = () => Math.floor(Math.random() * 40) + 30;
                    return `${r()}% ${100-r()}% ${r()}% ${100-r()}% / ${r()}% ${r()}% ${100-r()}% ${100-r()}%`;
                };
                const el = papyr.div({
                    style: {
                        width: typeof width === 'number' ? `${width}px` : width,
                        height: typeof height === 'number' ? `${height}px` : height,
                        backgroundColor: color,
                        border: border,
                        borderRadius: generateBorderRadius(),
                        transition: `border-radius ${speed}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    }
                });
                if (animate === 'morph' || animate === true) {
                    const interval = setInterval(() => {
                        if (typeof document !== 'undefined' && !document.body.contains(el)) {
                            clearInterval(interval);
                            return;
                        }
                        el.style.borderRadius = generateBorderRadius();
                    }, speed);
                    if (!el._cleanups) el._cleanups = [];
                    el._cleanups.push(() => clearInterval(interval));
                }
                annotateSDK(el, 'organic', options);
                return el;
            };

            papyr.liquid = (options = {}) => {
                const { width = 300, height = 150, color = 'rgba(59, 130, 246, 0.4)', speed = 0.05, amplitude = 15, style = {}, class: className = '', animate = true } = options;
                const container = papyr.div({
                    class: className,
                    style: Object.assign({
                        position: 'relative',
                        width: typeof width === 'number' ? `${width}px` : width,
                        height: typeof height === 'number' ? `${height}px` : height,
                        overflow: 'hidden',
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }, style)
                });
                const waveEl = papyr.wave({
                    width: 400,
                    height: 150,
                    color: color,
                    amplitude: amplitude,
                    frequency: 0.03,
                    speed: speed,
                    animate: animate
                });
                waveEl.style.position = 'absolute';
                waveEl.style.bottom = '0';
                waveEl.style.left = '-50px';
                waveEl.style.width = '120%';
                waveEl.style.height = '80%';
                
                container.appendChild(waveEl);
                annotateSDK(container, 'liquid', options);
                return container;
            };

            // ==========================================
            // 4. PATTERN GENERATOR
            // ==========================================

            papyr.pattern = (type = 'dots', options = {}) => {
                const { size = 20, color = 'rgba(255,255,255,0.1)', background = 'transparent', style = {}, class: className = '' } = options;
                let svgPattern = '';
                
                if (type === 'dots') {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><circle cx="${size/2}" cy="${size/2}" r="${size/10}" fill="${color}"/></svg>`;
                } else if (type === 'grids') {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><path d="M 0 0 L 0 ${size} M 0 0 L ${size} 0" stroke="${color}" stroke-width="1" fill="none"/></svg>`;
                } else if (type === 'waves') {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><path d="M 0 ${size/2} Q ${size/4} 0, ${size/2} ${size/2} T ${size} ${size/2}" stroke="${color}" stroke-width="1" fill="none"/></svg>`;
                } else if (type === 'hexagons') {
                    const h = size * Math.sqrt(3) / 2;
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}"><rect width="100%" height="100%" fill="${background}"/><path d="M ${size/2} 0 L ${size} ${h/3} L ${size} ${2*h/3} L ${size/2} ${h} L 0 ${2*h/3} L 0 ${h/3} Z" stroke="${color}" stroke-width="1" fill="none"/></svg>`;
                } else if (type === 'checkerboards') {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><rect width="${size/2}" height="${size/2}" fill="${color}"/><rect x="${size/2}" y="${size/2}" width="${size/2}" height="${size/2}" fill="${color}"/></svg>`;
                } else {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><rect width="2" height="2" fill="${color}"/><rect x="${size/2}" y="${size/2}" width="2" height="2" fill="${color}"/></svg>`;
                }
                
                const encoded = typeof window !== 'undefined' ? window.btoa(svgPattern) : Buffer.from(svgPattern).toString('base64');
                const bgImage = `url('data:image/svg+xml;base64,${encoded}')`;
                
                const el = papyr.div({
                    class: className,
                    style: Object.assign({
                        width: '100%',
                        height: '100%',
                        backgroundImage: bgImage,
                        backgroundRepeat: 'repeat'
                    }, style)
                });
                annotateSDK(el, 'pattern', options);
                return el;
            };

            // ==========================================
            // 5. SVG & CANVAS WRAPPERS
            // ==========================================

            papyr.svg = (options = {}) => {
                const { width = 200, height = 200, content = '', style = {}, class: className = '' } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${className}">
                        ${content}
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                return svgEl;
            };

            papyr.canvas = (options = {}) => {
                const { width = 400, height = 300, onInit = null, style = {}, class: className = '' } = options;
                const cv = document.createElement('canvas');
                cv.width = width;
                cv.height = height;
                cv.className = className;
                Object.assign(cv.style, style);
                if (onInit) {
                    setTimeout(() => onInit(cv), 50);
                }
                return cv;
            };

            // ==========================================
            // 6. 3D CSS ENGINE & CARDS
            // ==========================================

            papyr.cube = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('cube', options);
                }
                const { size = 100, color = 'rgba(59, 130, 246, 0.8)', style = {}, class: className = '', animate = null } = options;
                const half = size / 2;
                const cube = papyr.div({
                    class: className,
                    style: Object.assign({
                        position: 'relative',
                        width: `${size}px`,
                        height: `${size}px`,
                        transformStyle: 'preserve-3d',
                        perspective: '800px'
                    }, style)
                });
                const faces = {
                    front:  `rotateY(0deg) translateZ(${half}px)`,
                    back:   `rotateY(180deg) translateZ(${half}px)`,
                    left:   `rotateY(-90deg) translateZ(${half}px)`,
                    right:  `rotateY(90deg) translateZ(${half}px)`,
                    top:    `rotateX(90deg) translateZ(${half}px)`,
                    bottom: `rotateX(-90deg) translateZ(${half}px)`
                };
                Object.entries(faces).forEach(([faceName, transform]) => {
                    const face = papyr.div({
                        style: {
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: color,
                            border: '1px solid rgba(255,255,255,0.2)',
                            transform: transform,
                            boxSizing: 'border-box'
                        }
                    });
                    cube.appendChild(face);
                });
                if (animate === 'spin' || animate === true) {
                    cube.style.animation = 'papyr-spin-3d 8s linear infinite';
                    injectKeyframe('papyr-spin-3d', 'from { transform: rotateX(0deg) rotateY(0deg); } to { transform: rotateX(360deg) rotateY(360deg); }');
                } else if (animate) {
                    applyAnimation(cube, animate);
                }
                annotateSDK(cube, 'cube', options);
                return cube;
            };

            papyr.card = (options = {}) => {
                const { width = 300, height = 200, color = 'var(--papyr-surface)', tilt = true, style = {}, class: className = '' } = options;
                const card = papyr.div({
                    class: className,
                    style: Object.assign({
                        width: typeof width === 'number' ? `${width}px` : width,
                        height: typeof height === 'number' ? `${height}px` : height,
                        backgroundColor: color,
                        borderRadius: '16px',
                        border: '1px solid var(--papyr-border)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        transformStyle: 'preserve-3d',
                        perspective: '1000px',
                        boxShadow: 'var(--papyr-shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '16px',
                        boxSizing: 'border-box'
                    }, style)
                });
                
                if (tilt) {
                    const onMouseMove = (e) => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const xc = rect.width / 2;
                        const yc = rect.height / 2;
                        const maxTilt = typeof tilt === 'object' && tilt.max ? tilt.max : 15;
                        const rotateY = ((x - xc) / xc) * maxTilt;
                        const rotateX = -((y - yc) / yc) * maxTilt;
                        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                        card.style.boxShadow = 'var(--papyr-shadow-xl)';
                    };
                    const onMouseLeave = () => {
                        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
                        card.style.boxShadow = 'var(--papyr-shadow-md)';
                    };
                    card.addEventListener('mousemove', onMouseMove);
                    card.addEventListener('mouseleave', onMouseLeave);
                    
                    if (!card._cleanups) card._cleanups = [];
                    card._cleanups.push(() => {
                        card.removeEventListener('mousemove', onMouseMove);
                        card.removeEventListener('mouseleave', onMouseLeave);
                    });
                }
                
                if (options.content) {
                    const rendered = typeof options.content === 'function' ? options.content() : options.content;
                    if (rendered) card.appendChild(rendered);
                }
                annotateSDK(card, 'card', options);
                return card;
            };

            papyr.sphere = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('sphere', options);
                }
                const { size = 100, color = '#3b82f6', style = {}, class: className = '', animate = null } = options;
                const radius = size / 2;
                const gradientId = `papyr-sphere-grad-${Math.random().toString(36).substring(2, 6)}`;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}" style="overflow: visible;">
                        <defs>
                            <radialGradient id="${gradientId}" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
                                <stop offset="50%" stop-color="${color}"/>
                                <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
                            </radialGradient>
                        </defs>
                        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="url(#${gradientId})" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('circle') || svgEl, animate);
                annotateSDK(svgEl, 'sphere', options);
                return svgEl;
            };

            papyr.cylinder = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('cylinder', options);
                }
                const { width = 80, height = 120, color = '#3b82f6', style = {}, class: className = '', animate = null } = options;
                const rx = width / 2;
                const ry = 15;
                const gradientId = `papyr-cyl-grad-${Math.random().toString(36).substring(2, 6)}`;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${className}">
                        <defs>
                            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
                                <stop offset="40%" stop-color="${color}"/>
                                <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
                            </linearGradient>
                        </defs>
                        <ellipse cx="${rx}" cy="${height - ry}" rx="${rx}" ry="${ry}" fill="${color}" />
                        <rect x="0" y="${ry}" width="${width}" height="${height - 2*ry}" fill="url(#${gradientId})" />
                        <ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="${color}" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl, animate);
                annotateSDK(svgEl, 'cylinder', options);
                return svgEl;
            };

            papyr.cone = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('cone', options);
                }
                const { width = 100, height = 120, color = '#3b82f6', style = {}, class: className = '', animate = null } = options;
                const rx = width / 2;
                const ry = 15;
                const gradientId = `papyr-cone-grad-${Math.random().toString(36).substring(2, 6)}`;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${className}">
                        <defs>
                            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
                                <stop offset="40%" stop-color="${color}"/>
                                <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
                            </linearGradient>
                        </defs>
                        <path d="M 0,${height - ry} L ${rx},0 L ${width},${height - ry} Z" fill="url(#${gradientId})" />
                        <ellipse cx="${rx}" cy="${height - ry}" rx="${rx}" ry="${ry}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl, animate);
                annotateSDK(svgEl, 'cone', options);
                return svgEl;
            };

            papyr.plane = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('plane', options);
                }
                const { width = 200, height = 200, color = 'rgba(59, 130, 246, 0.2)', style = {}, class: className = '' } = options;
                const el = papyr.div({
                    class: className,
                    style: Object.assign({
                        width: `${width}px`,
                        height: `${height}px`,
                        backgroundColor: color,
                        border: '1px solid rgba(255,255,255,0.2)',
                        transform: 'rotateX(60deg)'
                    }, style)
                });
                annotateSDK(el, 'plane', options);
                return el;
            };

            papyr.torus = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('torus', options);
                }
                const { size = 120, thickness = 20, color = '#3b82f6', style = {}, class: className = '', animate = null } = options;
                const radius = size / 2;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}">
                        <circle cx="${radius}" cy="${radius}" r="${radius - thickness/2}" fill="none" stroke="${color}" stroke-width="${thickness}" />
                        <circle cx="${radius}" cy="${radius}" r="${radius - thickness/2}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="${thickness/3}" />
                        <circle cx="${radius}" cy="${radius}" r="${radius - thickness/2}" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="${thickness/3}" stroke-dasharray="100,50" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl, animate);
                annotateSDK(svgEl, 'torus', options);
                return svgEl;
            };

            // ==========================================
            // 7. THREE.JS ADAPTER LAYER
            // ==========================================

            papyr.useThree = (containerEl, options = {}) => {
                const THREE = window.THREE;
                if (!THREE) {
                    console.error("Three.js not loaded globally. Run papyr.use('three') first.");
                    return null;
                }
                const width = containerEl.clientWidth || 400;
                const height = containerEl.clientHeight || 300;
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setSize(width, height);
                containerEl.appendChild(renderer.domElement);

                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(5, 5, 5).normalize();
                scene.add(light);
                scene.add(new THREE.AmbientLight(0x404040));

                camera.position.z = 5;

                let active = true;
                const animateLoop = () => {
                    if (!active) return;
                    requestAnimationFrame(animateLoop);
                    scene.traverse(node => {
                        if (node.isMesh) {
                            node.rotation.x += 0.01;
                            node.rotation.y += 0.01;
                        }
                    });
                    renderer.render(scene, camera);
                };
                animateLoop();

                papyr._activeThreeScene = { scene, camera, renderer };

                const cleanup = () => {
                    active = false;
                    renderer.dispose();
                    if (renderer.domElement && renderer.domElement.parentNode) {
                        renderer.domElement.parentNode.removeChild(renderer.domElement);
                    }
                    papyr._activeThreeScene = null;
                };

                if (!containerEl._cleanups) containerEl._cleanups = [];
                containerEl._cleanups.push(cleanup);

                return { scene, camera, renderer, cleanup };
            };

            const createThreeMesh = (type, options) => {
                const THREE = window.THREE;
                const scene = papyr._activeThreeScene.scene;
                const color = options.color || 0x3b82f6;
                const size = (options.size || 100) / 100;
                
                let geometry;
                if (type === 'cube') geometry = new THREE.BoxGeometry(size, size, size);
                else if (type === 'sphere') geometry = new THREE.SphereGeometry(size / 2, 32, 32);
                else if (type === 'cylinder') geometry = new THREE.CylinderGeometry(size / 2, size / 2, size, 32);
                else if (type === 'cone') geometry = new THREE.ConeGeometry(size / 2, size, 32);
                else if (type === 'plane') geometry = new THREE.PlaneGeometry(size, size);
                else if (type === 'torus') geometry = new THREE.TorusGeometry(size / 2, size / 6, 16, 100);

                const material = new THREE.MeshLambertMaterial({ color });
                const mesh = new THREE.Mesh(geometry, material);
                
                if (options.x !== undefined) mesh.position.x = options.x / 100;
                if (options.y !== undefined) mesh.position.y = options.y / 100;
                
                scene.add(mesh);
                return mesh;
            };

            // ==========================================
            // 8. PHYSICS ENGINE ADAPTER
            // ==========================================

            let physicsEngine = {
                _active: false,
                _loopId: null,
                _bodies: [],
                gravity: 0.5,
                enable(options = {}) {
                    if (this._active) return;
                    this._active = true;
                    this.gravity = options.gravity !== undefined ? (options.gravity ? 0.5 : 0) : 0.5;
                    const loop = () => {
                        if (!this._active) return;
                        this.update();
                        this._loopId = requestAnimationFrame(loop);
                    };
                    this._loopId = requestAnimationFrame(loop);
                    console.log("⚡ Papyr Physics Engine: Enabled.");
                },
                disable() {
                    this._active = false;
                    if (this._loopId) cancelAnimationFrame(this._loopId);
                    this._bodies = [];
                    console.log("⚡ Papyr Physics Engine: Disabled.");
                },
                add(el, options = {}) {
                    const body = {
                        el,
                        x: options.x || 0,
                        y: options.y || 0,
                        vx: options.vx || (Math.random() - 0.5) * 5,
                        vy: options.vy || 0,
                        bounce: options.bounce !== undefined ? options.bounce : 0.8,
                        friction: options.friction !== undefined ? options.friction : 0.1,
                        mass: options.mass || 1,
                        radius: options.radius || 25,
                        collision: options.collision !== false
                    };
                    this._bodies.push(body);
                    el.style.position = 'absolute';
                    el.style.left = `${body.x}px`;
                    el.style.top = `${body.y}px`;
                    
                    if (!el._cleanups) el._cleanups = [];
                    el._cleanups.push(() => {
                        this._bodies = this._bodies.filter(b => b.el !== el);
                    });
                },
                update() {
                    const parentWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
                    const parentHeight = typeof window !== 'undefined' ? window.innerHeight : 600;
                    this._bodies.forEach(b => {
                        b.vy += this.gravity;
                        b.x += b.vx;
                        b.y += b.vy;
                        
                        if (b.y + b.radius * 2 > parentHeight) {
                            b.y = parentHeight - b.radius * 2;
                            b.vy = -b.vy * b.bounce;
                            b.vx = b.vx * (1 - b.friction);
                        }
                        if (b.y < 0) {
                            b.y = 0;
                            b.vy = -b.vy * b.bounce;
                        }
                        if (b.x + b.radius * 2 > parentWidth) {
                            b.x = parentWidth - b.radius * 2;
                            b.vx = -b.vx * b.bounce;
                        }
                        if (b.x < 0) {
                            b.x = 0;
                            b.vx = -b.vx * b.bounce;
                        }
                        b.el.style.left = `${b.x}px`;
                        b.el.style.top = `${b.y}px`;
                    });
                }
            };
            papyr.physics = physicsEngine;
        }
    };

    if (targetPapyr) {
        targetPapyr.use(shapesPlugin);
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = shapesPlugin;
    } else if (typeof exports !== 'undefined') {
        exports.default = shapesPlugin;
    } else {
        window.papyrShapes = shapesPlugin;
    }
})(typeof window !== 'undefined' ? window : this);


// --- MODULE: plugins/ui-components.js ---
/**
 * PAPYR UI COMPONENTS
 * Cinematic, interactive UI elements (Toasts, Modals, Sheets, Drawers, Steppers, Banners).
 */
(function() {
    // 1. Toast System (Canonical Passthrough)
    papyr.toast = papyr.toast;

    // 2. Modal System (Canonical Passthrough)
    papyr.modal = papyr.modal;

    // 3. Mobile Bottom Sheet
    papyr.sheet = (options = {}) => {
        const { content = '' } = options;
        let overlay = papyr.div({
            style: {
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.5)', zIndex: 9998, opacity: 0, transition: 'opacity 0.3s'
            },
            onclick: (e) => { if (e.target === overlay) close(); }
        });

        let sheetBox = papyr.div({
            style: {
                position: 'absolute', bottom: 0, left: 0, width: '100%',
                background: '#1e293b', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                padding: '24px', transform: 'translateY(100%)',
                transition: 'transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
            }
        },
            papyr.div({ style: { width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px auto' } }),
            content
        );

        overlay.appendChild(sheetBox);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            sheetBox.style.transform = 'translateY(0)';
        });

        const close = () => {
            overlay.style.opacity = '0';
            sheetBox.style.transform = 'translateY(100%)';
            setTimeout(() => overlay.remove(), 300);
        };
    };

    // 4. Side sliding navigation Drawer
    papyr.drawer = (options = {}) => {
        const { content = '', position = 'left' } = options;
        let overlay = papyr.div({
            style: {
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.5)', zIndex: 9998, opacity: 0, transition: 'opacity 0.3s'
            },
            onclick: (e) => { if (e.target === overlay) close(); }
        });
        let drawerBox = papyr.div({
            style: {
                position: 'absolute', top: 0, [position]: 0, width: '300px', height: '100%',
                background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.08)',
                padding: '24px', transform: position === 'left' ? 'translateX(-100%)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
            }
        }, content);
        overlay.appendChild(drawerBox);
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            drawerBox.style.transform = 'translateX(0)';
        });
        const close = () => {
            overlay.style.opacity = '0';
            drawerBox.style.transform = position === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
            setTimeout(() => overlay.remove(), 300);
        };
        return { close };
    };

    // 5. Sticky Top Notification Banner
    papyr.banner = (options = {}) => {
        const { message = '', type = 'info', actions = [] } = options;
        let bg = type === 'error' ? '#7f1d1d' : type === 'success' ? '#064e3b' : '#1e3a8a';
        let bannerBox = papyr.div({
            class: `papyr-banner papyr-banner-${type}`,
            style: {
                position: 'sticky', top: 0, left: 0, width: '100%',
                background: bg, color: '#f8fafc', padding: '12px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 999
            }
        },
            papyr.span(message, { style: { fontWeight: '500' } }),
            papyr.flex.row({ gap: '12px' },
                ...actions.map(act => papyr.button(act.text, {
                    style: { padding: '6px 12px', fontSize: '13px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' },
                    onclick: () => { act.action(); bannerBox.remove(); }
                })),
                papyr.button('×', {
                    style: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' },
                    onclick: () => bannerBox.remove()
                })
            )
        );
        document.body.prepend(bannerBox);
    };

    // 6. Action Snackbar
    papyr.snackbar = (options = {}) => {
        const { message = '', actionText = '', onAction = null, duration = 4000 } = options;
        let snackBox = papyr.div({
            style: {
                position: 'fixed', bottom: '24px', left: '24px',
                background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '12px 20px', color: 'white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', zIndex: 9999,
                display: 'flex', alignItems: 'center', gap: '16px',
                opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s'
            }
        },
            papyr.span(message),
            actionText ? papyr.button(actionText, {
                style: { background: 'transparent', border: 'none', color: '#6366f1', fontWeight: 'bold', cursor: 'pointer' },
                onclick: () => { if (onAction) onAction(); snackBox.remove(); }
            }) : null
        );
        document.body.appendChild(snackBox);
        requestAnimationFrame(() => {
            snackBox.style.opacity = '1';
            snackBox.style.transform = 'translateY(0)';
        });
        setTimeout(() => {
            snackBox.style.opacity = '0';
            snackBox.style.transform = 'translateY(20px)';
            setTimeout(() => snackBox.remove(), 300);
        }, duration);
    };

    // 7. Tooltip Hover overlay
    papyr.tooltip = (target, text) => {
        if (!target) return;
        let tip = null;
        target.addEventListener('mouseenter', () => {
            let bounds = target.getBoundingClientRect();
            tip = papyr.div({
                style: {
                    position: 'fixed', top: `${bounds.top - 36}px`, left: `${bounds.left + bounds.width/2}px`,
                    transform: 'translateX(-50%)', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '6px 12px', color: 'white', fontSize: '12px', borderRadius: '6px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 99999, pointerEvents: 'none'
                }
            }, text);
            document.body.appendChild(tip);
        });
        target.addEventListener('mouseleave', () => {
            if (tip) { tip.remove(); tip = null; }
        });
    };

    // 8. Accordion panel
    papyr.accordion = (items) => {
        let acc = papyr.div('.accordion', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } });
        items.forEach(item => {
            let open = papyr.state(false);
            let contentNode = typeof item.content === 'string' ? papyr.div(item.content) : item.content;
            let body = papyr.div({
                style: () => ({
                    display: open.value ? 'block' : 'none',
                    padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8'
                })
            }, contentNode);
            let header = papyr.button({
                style: { width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', color: 'white', display: 'flex', justifyContent: 'space-between', borderRadius: '8px' },
                onclick: () => open.value = !open.value
            },
                papyr.span(item.title, { style: { fontWeight: '600' } }),
                papyr.span(() => open.value ? '▲' : '▼')
            );
            acc.appendChild(papyr.div('.accordion-item', header, body));
        });
        return acc;
    };

    // 9. Checkbox component
    papyr.checkbox = (labelText, stateObj) => {
        let cb = papyr.input('checkbox', {
            checked: () => stateObj.value,
            onchange: (e) => stateObj.value = e.target.checked,
            style: { width: 'auto', marginRight: '8px' }
        });
        return papyr.label({ style: { display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: 'white' } }, cb, labelText);
    };

    // 10. Radio component
    papyr.radio = (name, labelText, val, stateObj) => {
        let rb = papyr.input('radio', {
            name: name,
            checked: () => stateObj.value === val,
            onchange: () => stateObj.value = val,
            style: { width: 'auto', marginRight: '8px' }
        });
        return papyr.label({ style: { display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: 'white' } }, rb, labelText);
    };

    // 11. Navigation Rail
    papyr.navigationRail = (items) => {
        let rail = papyr.div('.navigation-rail', {
            style: { width: '72px', height: '100%', background: '#0a0f1d', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: '20px' }
        });
        items.forEach(item => {
            let btn = papyr.button({
                style: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px' },
                onclick: item.onclick
            },
                papyr.icon(item.icon, { size: 20 }),
                papyr.span(item.label, { style: { fontSize: '10px', fontWeight: '500' } })
            );
            rail.appendChild(btn);
        });
        return rail;
    };

    // 12. Progress bar
    papyr.progress = (valueState, max = 100) => {
        let val = (valueState && typeof valueState.subscribe === 'function') ? valueState : papyr.state(valueState);
        let pct = papyr.computed(() => `${Math.min(100, Math.max(0, (val.value / max) * 100))}%`);
        return papyr.div('.progress-track', {
            style: { width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }
        },
            papyr.div('.progress-fill', {
                style: () => ({
                    width: pct.value, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)',
                    transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                })
            })
        );
    };

    // 13. Stepper indicator
    papyr.stepper = (steps, activeStepState) => {
        let container = papyr.div('.stepper', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px' } });
        steps.forEach((step, idx) => {
            let isComplete = papyr.computed(() => activeStepState.value > idx + 1);
            let isActive = papyr.computed(() => activeStepState.value === idx + 1);
            let circleBg = papyr.computed(() => isComplete.value ? '#10b981' : isActive.value ? '#6366f1' : 'rgba(255,255,255,0.05)');
            let circleBorder = papyr.computed(() => isComplete.value ? 'none' : isActive.value ? 'none' : '1px solid rgba(255,255,255,0.1)');
            
            let circle = papyr.div('.step-circle', {
                style: () => ({
                    width: '32px', height: '32px', borderRadius: '50%', background: circleBg.value, border: circleBorder.value,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px'
                })
            }, () => isComplete.value ? '✓' : String(idx + 1));
            
            let label = papyr.span(step, { style: () => ({ marginLeft: '8px', color: isActive.value ? 'white' : '#94a3b8', fontSize: '13px', fontWeight: '600' }) });
            container.appendChild(papyr.flex.row({ align: 'center', style: { flex: 1 } }, circle, label));
        });
        return container;
    };

    // 14. Dropdown contextual Menu
    papyr.menu = (trigger, items) => {
        if (!trigger) return;
        let menuBox = null;
        trigger.style.position = 'relative';
        const toggle = () => {
            if (menuBox) { menuBox.remove(); menuBox = null; return; }
            menuBox = papyr.div('.dropdown-menu', {
                style: {
                    position: 'absolute', top: '100%', left: '0', marginTop: '8px', minWidth: '160px',
                    background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 9999, overflow: 'hidden'
                }
            });
            items.forEach(item => {
                let btn = papyr.button(item.text, {
                    style: { width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '13px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' },
                    onclick: () => { item.onclick(); menuBox.remove(); menuBox = null; }
                });
                btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(255,255,255,0.04)');
                btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
                menuBox.appendChild(btn);
            });
            trigger.appendChild(menuBox);
        };
        trigger.addEventListener('click', toggle);
        document.addEventListener('click', (e) => {
            if (menuBox && !trigger.contains(e.target)) { menuBox.remove(); menuBox = null; }
        });
    };

    // 15. Custom Dropdown component
    papyr.dropdown = (options = {}) => {
        const { items = [], placeholder = 'Select item', onSelect = null } = options;
        let selected = papyr.state(placeholder);
        let open = papyr.state(false);
        let container = papyr.div('.dropdown-container', { style: { position: 'relative', width: '100%' } });
        let trigger = papyr.button({
            style: { width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: 'white', padding: '10px 14px' },
            onclick: () => open.value = !open.value
        },
            papyr.span(() => selected.value),
            papyr.span(() => open.value ? '▲' : '▼')
        );
        let menu = papyr.div({
            style: () => ({
                display: open.value ? 'block' : 'none',
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                zIndex: 1000, maxHeight: '200px', overflowY: 'auto'
            })
        });
        items.forEach(item => {
            let li = papyr.div(item, {
                style: { padding: '10px 14px', cursor: 'pointer', color: '#cbd5e1', fontSize: '14px' },
                onclick: () => { selected.value = item; open.value = false; if (onSelect) onSelect(item); }
            });
            li.addEventListener('mouseenter', () => li.style.background = 'rgba(255,255,255,0.04)');
            li.addEventListener('mouseleave', () => li.style.background = 'transparent');
            menu.appendChild(li);
        });
        container.appendChild(trigger);
        container.appendChild(menu);
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) open.value = false;
        });
        return container;
    };

    // 16. Empty State card
    papyr.emptyState = (options = {}) => {
        const { title = 'No results found', description = 'Try adjusting your search criteria or filters.', icon = 'search' } = options;
        return papyr.flex.col({
            align: 'center',
            style: { padding: '48px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', gap: '12px' }
        },
            papyr.icon(icon, { size: 36, color: '#94a3b8' }),
            papyr.h3(title, { style: { margin: 0, color: 'white', fontSize: '16px', fontWeight: '700' } }),
            papyr.p(description, { style: { margin: 0, color: '#94a3b8', fontSize: '13px', maxWidth: '320px', lineHeight: '1.5' } })
        );
    };

    // 17. Skeleton Loader
    papyr.skeletonLoader = (options = {}) => {
        const { type = 'card', count = 1 } = options;
        let loader = papyr.div('.skeleton-loader-container', { style: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' } });
        const styleText = 'background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: papyr-skeleton-shine 1.5s infinite;';
        
        if (typeof document !== 'undefined' && !document.getElementById('papyr-skeleton-styles')) {
            let style = document.createElement('style');
            style.id = 'papyr-skeleton-styles';
            style.textContent = `
                @keyframes papyr-skeleton-shine {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            document.head.appendChild(style);
        }

        for (let i = 0; i < count; i++) {
            if (type === 'card') {
                loader.appendChild(papyr.div('.skeleton-card', {
                    style: {
                        background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px'
                    }
                },
                    papyr.div({ style: `width: 60px; height: 12px; border-radius: 4px; ${styleText}` }),
                    papyr.div({ style: `width: 100%; height: 16px; border-radius: 4px; ${styleText}` }),
                    papyr.div({ style: `width: 80%; height: 16px; border-radius: 4px; ${styleText}` })
                ));
            } else {
                loader.appendChild(papyr.div({ style: `width: 100%; height: 20px; border-radius: 4px; ${styleText}` }));
            }
        }
        return loader;
    };

    // 18. Calendar panel
    papyr.calendar = (options = {}) => {
        const { onSelect = null } = options;
        let date = new Date();
        let year = papyr.state(date.getFullYear());
        let month = papyr.state(date.getMonth());
        let monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        
        let grid = papyr.div({ style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginTop: '12px' } });
        
        const renderDays = () => {
            grid.innerHTML = '';
            ["Su","Mo","Tu","We","Th","Fr","Sa"].forEach(d => grid.appendChild(papyr.span(d, { style: { color: '#64748b', fontSize: '11px', fontWeight: 'bold' } })));
            
            let firstDay = new Date(year.value, month.value, 1).getDay();
            let totalDays = new Date(year.value, month.value + 1, 0).getDate();
            
            for (let i = 0; i < firstDay; i++) grid.appendChild(papyr.span(''));
            for (let day = 1; day <= totalDays; day++) {
                let dayBtn = papyr.button(String(day), {
                    style: { padding: '6px', fontSize: '12px', background: 'transparent', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' },
                    onclick: () => {
                        let selDate = new Date(year.value, month.value, day);
                        if (onSelect) onSelect(selDate);
                    }
                });
                dayBtn.addEventListener('mouseenter', () => dayBtn.style.background = '#6366f1');
                dayBtn.addEventListener('mouseleave', () => dayBtn.style.background = 'transparent');
                grid.appendChild(dayBtn);
            }
        };

        let nextBtn = papyr.button('▶', {
            style: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' },
            onclick: () => { month.value = (month.value + 1) % 12; if (month.value === 0) year.value++; renderDays(); }
        });
        let prevBtn = papyr.button('◀', {
            style: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' },
            onclick: () => { month.value = (month.value - 1 + 12) % 12; if (month.value === 11) year.value--; renderDays(); }
        });
        let title = papyr.span(() => `${Reflect.get(monthNames, Math.max(0, Math.min(11, Number(month.value))))} ${year.value}`, { style: { fontWeight: 'bold', color: 'white' } });
        let header = papyr.flex.between({ style: { padding: '4px' } }, prevBtn, title, nextBtn);
        
        let container = papyr.div('.papyr-calendar', { style: { padding: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', maxWidth: '260px' } }, header, grid);
        renderDays();
        return container;
    };

    // 19. Date Picker
    papyr.datePicker = (options = {}) => {
        const { placeholder = 'Select Date', onSelect = null } = options;
        let open = papyr.state(false);
        let selectedText = papyr.state('');
        let container = papyr.div('.date-picker-container', { style: { position: 'relative', width: '100%' } });
        let input = papyr.input('text', placeholder, {
            value: () => selectedText.value,
            onclick: () => open.value = !open.value,
            style: { cursor: 'pointer' }
        });
        let calContainer = papyr.div({
            style: () => ({
                display: open.value ? 'block' : 'none',
                position: 'absolute', top: '100%', left: 0, marginTop: '8px', zIndex: 2000
            })
        },
            papyr.calendar({
                onSelect: (date) => {
                    let formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    selectedText.value = formatted;
                    open.value = false;
                    if (onSelect) onSelect(date);
                }
            })
        );
        container.appendChild(input);
        container.appendChild(calContainer);
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) open.value = false;
        });
        return container;
    };

    // 20. Virtual scroll list for performance scaling
    papyr.virtualList = (options = {}) => {
        const {
            items = [],
            itemHeight = 40,
            renderItem = (item, idx) => papyr.div(String(item)),
            viewportHeight = 300,
            style = {}
        } = options;

        const arrayState = (items && typeof items.subscribe === 'function') ? items : papyr.state(items);
        const scrollTop = papyr.state(0);

        const totalHeight = papyr.computed(() => arrayState.value.length * itemHeight);
        const startIndex = papyr.computed(() => Math.max(0, Math.floor(scrollTop.value / itemHeight) - 2));
        const endIndex = papyr.computed(() => Math.min(arrayState.value.length, Math.floor((scrollTop.value + viewportHeight) / itemHeight) + 2));

        const visibleItems = papyr.computed(() => {
            const arr = arrayState.value;
            const start = startIndex.value;
            const end = endIndex.value;
            const result = [];
            for (let i = start; i < end; i++) {
                result.push({ item: Reflect.get(arr, i), index: i });
            }
            return result;
        });

        const listContainer = papyr.div({
            style: {
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }
        },
            papyr.div({
                style: {
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    overflowY: 'auto'
                },
                onscroll: (e) => {
                    scrollTop.value = e.target.scrollTop;
                }
            },
                papyr.div({
                    style: () => ({
                        height: `${totalHeight.value}px`,
                        width: '100%',
                        position: 'relative'
                    })
                },
                    papyr.for(visibleItems, (entry) => {
                        const childEl = renderItem(entry.item, entry.index);
                        if (childEl && childEl.style) {
                            childEl.style.position = 'absolute';
                            childEl.style.top = `${entry.index * itemHeight}px`;
                            childEl.style.left = '0';
                            childEl.style.width = '100%';
                            childEl.style.height = `${itemHeight}px`;
                            childEl.style.boxSizing = 'border-box';
                        }
                        return childEl;
                    })
                )
            )
        );

        Object.assign(listContainer.style, {
            height: typeof viewportHeight === 'number' ? `${viewportHeight}px` : viewportHeight,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.02)'
        }, style);

        return listContainer;
    };
})();


// --- MODULE: plugins/animate.js ---
/**
 * PAPYR ANIMATE
 * Zero-dependency hardware-accelerated animation engine.
 * v3.0 - Agile Cinematic Motion, Spring systems, and Swipe gestures.
 */
(function () {
    const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

    const isLowEnd = () => {
        return prefersReducedMotion || (typeof document !== 'undefined' && document.documentElement.classList.contains('papyr-low-end'));
    };

    // Fluid Engine (Performance-aware frame monitor)
    if (typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
        let lastTime = performance.now();
        let frameCount = 0;
        let lowFpsCount = 0;
        const checkFPS = () => {
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                const fps = (frameCount * 1000) / (now - lastTime);
                frameCount = 0;
                lastTime = now;
                
                if (fps < 45) {
                    lowFpsCount++;
                    if (lowFpsCount >= 3) {
                        if (typeof document !== 'undefined' && document.documentElement) {
                            document.documentElement.classList.add('papyr-low-end');
                            console.warn("Papyr Fluid Engine: Low frame rate detected. Visual quality degraded to optimize performance.");
                            if (window.papyr && typeof window.papyr.emit === 'function') {
                                window.papyr.emit('performance-degraded', { fps });
                            }
                        }
                        return; // stop checking once downgraded
                    }
                } else {
                    lowFpsCount = 0;
                }
            }
            requestAnimationFrame(checkFPS);
        };
        setTimeout(() => requestAnimationFrame(checkFPS), 1000);
    }


    // Intersection Observer for scroll animations
    let observer = null;
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let anim = entry.target.dataset.animate;
                    if (anim) {
                        entry.target.classList.add(`animate-${anim}`);
                        entry.target.classList.add('animated');
                    }
                    if (entry.target.dataset.animateOnce !== 'false') {
                        observer.unobserve(entry.target);
                    }
                } else if (entry.target.dataset.animateOnce === 'false') {
                    // Reverse animation if scrolling out of view
                    let anim = entry.target.dataset.animate;
                    if (anim) {
                        entry.target.classList.remove(`animate-${anim}`);
                        entry.target.classList.remove('animated');
                    }
                }
            });
        }, { threshold: 0.1 });
    }

    const VALID_ANIMATIONS = ['fade', 'slide', 'zoom', 'blur', 'rotate', 'bounce', 'elastic', 'glass-pop', 'fade-in', 'slide-up', 'slide-down', 'zoom-in', 'blur-in'];
    const levenshtein = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
        return matrix[b.length][a.length];
    };

    let mo = null;
    if (typeof window !== 'undefined' && 'MutationObserver' in window) {
        mo = new MutationObserver(mutations => {
            if (prefersReducedMotion) return;
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node instanceof Element) {
                        let elements = [node, ...node.querySelectorAll('[animate]')];
                        elements.forEach(el => {
                            if (el.hasAttribute('animate') && observer) {
                                let animType = el.getAttribute('animate');

                                // Spell check animation
                                if (!VALID_ANIMATIONS.includes(animType)) {
                                    let closest = '';
                                    let minDistance = Infinity;
                                    for (let valid of VALID_ANIMATIONS) {
                                        let d = levenshtein(animType, valid);
                                        if (d < minDistance) {
                                            minDistance = d;
                                            closest = valid;
                                        }
                                    }
                                    if (minDistance <= 3) {
                                        console.error(`PapyrError: Unknown animation "${animType}". Did you mean "${closest}"?`);
                                        if (papyr.toast) papyr.toast(`PapyrError: Unknown animation "${animType}". Did you mean "${closest}"?`, 'error');
                                    }
                                }

                                el.dataset.animate = animType;
                                el.removeAttribute('animate'); // Clean DOM
                                el.classList.add('papyr-animate-base');
                                observer.observe(el);
                            }
                        });
                    }
                });
            });
        });
    }

    if (typeof document !== 'undefined' && mo) {
        mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    // --- MODULE: MOTION API ---

    /**
     * Unified animation entry point.
     * Supports papyr.animate(el, properties, duration)
     * and decorator configuration papyr.animate({ type: 'glass-pop' })
     */
    const originalAnimate = papyr.animate;
    papyr.animate = (elOrConfig, properties, duration = 400) => {
        if (!elOrConfig) return null;

        // Config-first mode: papyr.animate({ type: 'glass-pop' })
        if (typeof elOrConfig === 'object' && !(elOrConfig instanceof Element)) {
            const config = elOrConfig;
            return (el) => {
                if (!el) return el;
                if (config.type === 'glass-pop') {
                    el.classList.add('animate-glass-pop');
                    el.classList.add('papyr-animate-base');
                }
                return el;
            };
        }

        // Direct DOM mode
        const el = elOrConfig;
        if (properties && typeof properties === 'object') {
            el.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            requestAnimationFrame(() => {
                Object.assign(el.style, properties);
            });
            return el;
        }

        return el;
    };

    // Cinematic transition wrappers
    papyr.animate.fade = (el, duration = 600) => {
        if (!el) return el;
        if (isLowEnd()) {
            el.style.opacity = '1';
            return el;
        }
        el.style.opacity = '0';
        el.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
            });
        });
        return el;
    };

    papyr.animate.slide = (el, duration = 600) => {
        if (!el) return el;
        if (isLowEnd()) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0px)';
            return el;
        }
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1.15)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0px)';
            });
        });
        return el;
    };

    papyr.animate.zoom = (el, duration = 600) => {
        if (!el) return el;
        if (isLowEnd()) {
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            return el;
        }
        el.style.opacity = '0';
        el.style.transform = 'scale(0.9)';
        el.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1.15)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'scale(1)';
            });
        });
        return el;
    };

    papyr.animate.pop = (el, duration = 600) => {
        if (!el) return el;
        if (isLowEnd()) {
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            return el;
        }
        el.style.opacity = '0';
        el.style.transform = 'scale(0.3)';
        el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'scale(1)';
            });
        });
        return el;
    };


    // Spring physics animator solver
    papyr.animate.spring = (el, properties, config = {}) => {
        if (!el || typeof window === 'undefined') return el;

        // Auto-cancellation on mousedown/touchstart to ensure interactions are never blocked
        if (!el._hasSpringCancelListeners) {
            el._hasSpringCancelListeners = true;
            const cancelEvent = () => {
                if (el._springCancel) {
                    el._springCancel();
                }
            };
            el.addEventListener('mousedown', cancelEvent);
            el.addEventListener('touchstart', cancelEvent);
        }

        if (isLowEnd()) {
            // Apply target values immediately for low-end / reduced motion
            let transformParts = [];
            if ('x' in properties || 'y' in properties) {
                transformParts.push(`translate(${properties.x !== undefined ? properties.x : 0}px, ${properties.y !== undefined ? properties.y : 0}px)`);
            }
            if ('scale' in properties) {
                transformParts.push(`scale(${properties.scale})`);
            }
            if (transformParts.length > 0) {
                el.style.transform = transformParts.join(' ');
            }
            Object.entries(properties).forEach(([prop, targetVal]) => {
                if (prop !== 'x' && prop !== 'y' && prop !== 'scale') {
                    if (prop !== '__proto__' && prop !== 'constructor' && prop !== 'prototype') {
                        el.style[prop] = prop === 'opacity' ? targetVal : `${targetVal}px`;
                    }
                }
            });
            return el;
        }

        const { tension = 170, friction = 26, mass = 1 } = config;

        if (el._springCancel) {
            el._springCancel();
        }
        let cancelled = false;
        el._springCancel = () => { cancelled = true; };

        // Parse current transform values
        let currentX = 0;
        let currentY = 0;
        let currentScale = 1;

        const transformStr = el.style.transform || '';
        const translateMatch = transformStr.match(/translate\(([^,]+),\s*([^)]+)\)/) || 
                               transformStr.match(/translate3d\(([^,]+),\s*([^,]+)/);
        if (translateMatch) {
            currentX = parseFloat(translateMatch[1]) || 0;
            currentY = parseFloat(translateMatch[2]) || 0;
        } else {
            const translateXMatch = transformStr.match(/translateX\(([^)]+)\)/);
            if (translateXMatch) currentX = parseFloat(translateXMatch[1]) || 0;
            const translateYMatch = transformStr.match(/translateY\(([^)]+)\)/);
            if (translateYMatch) currentY = parseFloat(translateYMatch[1]) || 0;
        }

        const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
        if (scaleMatch) {
            currentScale = parseFloat(scaleMatch[1]) || 1;
        }

        const anims = {};
        Object.entries(properties).forEach(([prop, targetVal]) => {
            if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') return;
            let currentVal = 0;
            if (prop === 'x') currentVal = currentX;
            else if (prop === 'y') currentVal = currentY;
            else if (prop === 'scale') currentVal = currentScale;
            else currentVal = parseFloat(el.style[prop]) || 0;

            anims[prop] = {
                current: currentVal,
                velocity: 0,
                target: targetVal
            };
        });

        const step = () => {
            if (cancelled) return;
            let done = true;

            // Run 4 sub-steps per frame to ensure integration stability at high tension / low friction
            const substeps = 4;
            const dt = 0.016 / substeps;

            for (let i = 0; i < substeps; i++) {
                done = true;
                Object.entries(anims).forEach(([prop, anim]) => {
                    let force = -tension * (anim.current - anim.target) - friction * anim.velocity;
                    let acceleration = force / mass;
                    anim.velocity += acceleration * dt;
                    anim.current += anim.velocity * dt;

                    if (Math.abs(anim.velocity) > 0.005 || Math.abs(anim.current - anim.target) > 0.005) {
                        done = false;
                    } else {
                        anim.current = anim.target;
                        anim.velocity = 0;
                    }
                });
                if (done) break;
            }

            // Rebuild the transform string to apply x, y, and scale together
            let transformParts = [];
            let hasX = 'x' in anims;
            let hasY = 'y' in anims;
            if (hasX || hasY) {
                let xVal = hasX ? anims.x.current : currentX;
                let yVal = hasY ? anims.y.current : currentY;
                transformParts.push(`translate(${xVal}px, ${yVal}px)`);
            } else {
                if (currentX !== 0 || currentY !== 0) {
                    transformParts.push(`translate(${currentX}px, ${currentY}px)`);
                }
            }
            
            if ('scale' in anims) {
                transformParts.push(`scale(${anims.scale.current})`);
            } else {
                if (currentScale !== 1) {
                    transformParts.push(`scale(${currentScale})`);
                }
            }

            if (transformParts.length > 0) {
                el.style.transform = transformParts.join(' ');
            }

            // Apply other non-transform properties
            Object.entries(anims).forEach(([prop, anim]) => {
                if (prop !== 'x' && prop !== 'y' && prop !== 'scale') {
                    if (prop !== '__proto__' && prop !== 'constructor' && prop !== 'prototype') {
                        el.style[prop] = prop === 'opacity' ? anim.current : `${anim.current}px`;
                    }
                }
            });

            if (!done) {
                requestAnimationFrame(step);
            }
        };

        step();
        return el;
    };


    // Gesture swipe controls and dynamic touch trackers
    papyr.animate.gesture = (el, options = {}) => {
        if (!el || typeof window === 'undefined') return el;
        const { onSwipeLeft, onSwipeRight, onDrag, onRelease } = options;
        let startX = 0, startY = 0, currentX = 0, currentY = 0;
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0;

        const start = (clientX, clientY) => {
            let curX = 0;
            let curY = 0;
            const transformStr = el.style.transform || '';
            const translateMatch = transformStr.match(/translate\(([^,]+),\s*([^)]+)\)/) || 
                                   transformStr.match(/translate3d\(([^,]+),\s*([^,]+)/);
            if (translateMatch) {
                curX = parseFloat(translateMatch[1]) || 0;
                curY = parseFloat(translateMatch[2]) || 0;
            } else {
                const translateXMatch = transformStr.match(/translateX\(([^)]+)\)/);
                if (translateXMatch) curX = parseFloat(translateXMatch[1]) || 0;
                const translateYMatch = transformStr.match(/translateY\(([^)]+)\)/);
                if (translateYMatch) curY = parseFloat(translateYMatch[1]) || 0;
            }

            dragStartX = curX;
            dragStartY = curY;
            startX = clientX;
            startY = clientY;
            isDragging = true;
            el.style.transition = 'none';

            if (el._springCancel) {
                el._springCancel();
            }

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

        const move = (clientX, clientY) => {
            if (!isDragging) return;
            currentX = dragStartX + (clientX - startX);
            currentY = dragStartY + (clientY - startY);
            if (onDrag) onDrag(currentX, currentY, el);
            else {
                el.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        };

        const end = () => {
            if (!isDragging) return;
            isDragging = false;

            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            if (onRelease) {
                onRelease(currentX, currentY, el);
            } else {
                el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                if (currentX > 100 && onSwipeRight) {
                    onSwipeRight(el);
                } else if (currentX < -100 && onSwipeLeft) {
                    onSwipeLeft(el);
                } else {
                    el.style.transform = 'translate(0px, 0px)';
                }
            }
            currentX = 0;
            currentY = 0;
        };

        const onMouseMove = (e) => move(e.clientX, e.clientY);
        const onMouseUp = () => end();

        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            start(e.clientX, e.clientY);
        });

        const onTouchMove = (e) => {
            if (e.touches.length > 0) {
                move(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const onTouchEnd = () => {
            end();
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };

        el.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                start(e.touches[0].clientX, e.touches[0].clientY);
                window.addEventListener('touchmove', onTouchMove, { passive: true });
                window.addEventListener('touchend', onTouchEnd, { passive: true });
            }
        });

        return el;
    };

    // PAPYR PARALLAX ENGINE
    papyr.parallax = (selector, speed = 0.5) => {
        if (typeof window === 'undefined') return;
        window.addEventListener('scroll', () => {
            const elements = document.querySelectorAll(selector);
            let scrollY = window.scrollY;
            elements.forEach(el => {
                let yPos = -(scrollY * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    };

    // PAPYR PHYSICS ENGINE
    papyr.physics = (options = {}) => {
        const { gravity = 0.98, bounce = 0.8, friction = 0.95 } = options;
        return (el) => {
            if (!el || typeof window === 'undefined') return el;

            let y = 0, vy = 0;
            let isDragging = false;
            let animationFrame;

            // Cache measurements to prevent layout thrashing
            let elHeight = 50;
            let parentHeight = window.innerHeight;

            const recacheHeights = () => {
                elHeight = el.offsetHeight || 50;
                parentHeight = el.parentElement ? el.parentElement.clientHeight : window.innerHeight;
            };

            window.addEventListener('resize', recacheHeights);

            // Cleanup resize listener if element is detached
            if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
                const observer = new MutationObserver(() => {
                    if (!document.body.contains(el)) {
                        window.removeEventListener('resize', recacheHeights);
                        observer.disconnect();
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }

            const update = () => {
                if (!isDragging) {
                    vy += gravity;
                    y += vy;

                    let floor = parentHeight - elHeight;

                    if (y > floor) {
                        y = floor;
                        vy *= -bounce;
                        vy *= friction;
                    }

                    el.style.transform = `translateY(${y}px)`;
                }
                animationFrame = requestAnimationFrame(update);
            };

            el.style.cursor = 'grab';
            el.addEventListener('mousedown', () => {
                isDragging = true;
                el.style.cursor = 'grabbing';
                recacheHeights();
            });
            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    el.style.cursor = 'grab';
                    vy = 0;
                }
            });
            window.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    y += e.movementY;
                    el.style.transform = `translateY(${y}px)`;
                }
            });

            setTimeout(() => {
                let initialBounds = el.getBoundingClientRect();
                y = initialBounds.top || 0;
                recacheHeights();
                update();
            }, 50);

            return el;
        };
    };

})();


// --- MODULE: plugins/charts.js ---
/**
 * PAPYR CHARTS
 * Zero-dependency HTML5 Canvas charting plugin.
 * Unified version supporting both micro-charts and full config-based layouts.
 * Fully isomorphic with server-side / Node.js verification support.
 */
(function() {
    const papyr = (typeof window !== 'undefined' && window.papyr) || (typeof global !== 'undefined' && global.papyr);
    if (!papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading charts plugin.");
        return;
    }

    // Helper for drawing config-driven charts
    const drawConfigChart = (canvas, config) => {
        if (!canvas || typeof canvas.getContext !== 'function') return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const width = canvas.width;
        const height = canvas.height;
        if (width === 0 || height === 0) return;
        
        ctx.clearRect(0, 0, width, height);
        
        const type = config.type || 'bar';
        let rawData = config.data;
        if (rawData && typeof rawData.subscribe === 'function') {
            rawData = rawData.value;
        } else if (config.value && typeof config.value.subscribe === 'function') {
            rawData = config.value.value;
        }
        const data = rawData || [];
        const colors = config.colors || ['#6366f1', '#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6'];
        
        if (type === 'bar') {
            const padding = 40;
            const barWidth = (width - padding * 2) / (data.length || 1) - 10;
            const vals = data.map(d => typeof d === 'object' ? d.value : d);
            const maxVal = vals.length > 0 ? Math.max(...vals) : 1;
            
            data.forEach((item, i) => {
                const val = typeof item === 'object' ? item.value : item;
                const label = typeof item === 'object' ? item.label : '';
                const barHeight = (val / (maxVal || 1)) * (height - padding * 2);
                const x = padding + i * (barWidth + 10);
                const y = height - padding - barHeight;
                
                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
                } else {
                    ctx.rect(x, y, barWidth, barHeight);
                }
                ctx.fill();
                
                if (label) {
                    ctx.fillStyle = '#cbd5e1';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(label, x + barWidth / 2, height - padding + 20);
                }
            });
        } else if (type === 'circle' || type === 'pie') {
            const cx = width / 2;
            const cy = height / 2;
            const radius = Math.min(cx, cy) - 20;
            
            if (type === 'circle') {
                // Circular Progress
                const val = typeof config.value === 'function' ? config.value() : (config.value !== undefined ? config.value : 0);
                const max = config.max || 100;
                const percent = val / (max || 1);
                
                // Background track
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 15;
                ctx.stroke();
                
                // Progress arc
                ctx.beginPath();
                ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * percent));
                ctx.strokeStyle = colors[0];
                ctx.lineCap = 'round';
                ctx.lineWidth = 15;
                ctx.stroke();
                
                // Text
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${Math.round(percent * 100)}%`, cx, cy);
            } else if (type === 'pie') {
                const total = data.reduce((sum, d) => sum + (typeof d === 'object' ? d.value : d), 0);
                let startAngle = -Math.PI / 2;
                
                data.forEach((item, i) => {
                    const val = typeof item === 'object' ? item.value : item;
                    const sliceAngle = (val / (total || 1)) * Math.PI * 2;
                    
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
                    ctx.closePath();
                    
                    ctx.fillStyle = colors[i % colors.length];
                    ctx.fill();
                    
                    startAngle += sliceAngle;
                });
            }
        } else if (type === 'line') {
            const padding = 40;
            const vals = data.map(d => typeof d === 'object' ? d.value : d);
            const maxVal = vals.length > 0 ? Math.max(...vals) : 1;
            const stepX = (width - padding * 2) / (data.length - 1 || 1);
            
            ctx.beginPath();
            ctx.strokeStyle = colors[0];
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            
            data.forEach((item, i) => {
                const val = typeof item === 'object' ? item.value : item;
                const x = padding + i * stepX;
                const y = height - padding - ((val / (maxVal || 1)) * (height - padding * 2));
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }
    };

    // Store original micro-charts function if already registered (e.g. from official.js)
    const originalChart = papyr.chart;

    /**
     * Unified chart function supporting:
     * - Micro-charts signature: papyr.chart(type, data, options)
     * - Config-driven signature: papyr.chart(config)
     */
    papyr.chart = (typeOrConfig, data, options = {}) => {
        if (typeof typeOrConfig === 'string') {
            if (typeof originalChart === 'function') {
                return originalChart(typeOrConfig, data, options);
            }
            // Simple backup if official.js is not loaded and document is present
            if (typeof document === 'undefined') {
                return { tagName: 'canvas', isMock: true };
            }
            const canvas = document.createElement('canvas');
            canvas.width = options.width || 300;
            canvas.height = options.height || 180;
            return canvas;
        }

        // Return a safe mock object in Node.js
        if (typeof document === 'undefined') {
            return { tagName: 'div', className: 'papyr-chart-container', isMock: true };
        }

        // Config-driven chart rendering
        const config = typeOrConfig || {};
        const canvas = document.createElement('canvas');
        
        const container = papyr.div('.papyr-chart-container', canvas, Object.assign({
            style: { position: 'relative', width: '100%', height: '300px' }
        }, config.attrs || {}));

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    let rect = entry.contentRect;
                    canvas.width = rect.width || 300;
                    canvas.height = rect.height || 300;
                    drawConfigChart(canvas, config);
                }
            });
            
            setTimeout(() => {
                resizeObserver.observe(container);
                drawConfigChart(canvas, config);
            }, 0);
        } else {
            setTimeout(() => {
                canvas.width = 300;
                canvas.height = 300;
                drawConfigChart(canvas, config);
            }, 0);
        }
        
        const subscribeTarget = (config.data && typeof config.data.subscribe === 'function')
            ? config.data
            : ((config.value && typeof config.value.subscribe === 'function') ? config.value : null);

        if (subscribeTarget) {
            subscribeTarget.subscribe(() => {
                if (typeof requestAnimationFrame !== 'undefined') {
                    requestAnimationFrame(() => drawConfigChart(canvas, config));
                } else {
                    drawConfigChart(canvas, config);
                }
            });
        }

        return container;
    };

    /**
     * Mounts a config-driven chart onto an existing Canvas element.
     * Signature: papyr.charts(canvasId, config)
     */
    papyr.charts = (canvasId, conf) => {
        if (typeof document === 'undefined') {
            return null;
        }

        const canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) || document.querySelector(canvasId) : canvasId;
        if (!canvas) {
            console.error(`PapyrCharts Error: Canvas element not found: ${canvasId}`);
            return null;
        }

        const draw = () => {
            drawConfigChart(canvas, conf);
        };

        const sub = (conf.data && typeof conf.data.subscribe === 'function')
            ? conf.data
            : ((conf.value && typeof conf.value.subscribe === 'function') ? conf.value : null);

        if (sub) {
            sub.subscribe(() => {
                if (typeof requestAnimationFrame !== 'undefined') {
                    requestAnimationFrame(draw);
                } else {
                    draw();
                }
            });
        }

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    let rect = entry.contentRect;
                    canvas.width = rect.width || canvas.clientWidth || 300;
                    canvas.height = rect.height || canvas.clientHeight || 150;
                    draw();
                }
            });
            
            setTimeout(() => {
                resizeObserver.observe(canvas.parentElement || canvas);
                draw();
            }, 0);
        } else {
            setTimeout(draw, 0);
        }

        return canvas;
    };

})();



    // Auto-inject Themeable Stylesheets
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.id = 'papyr-complete-styles';
        style.textContent = `
:root {
    /* Foundation Accent Colors */
    --papyr-primary: #6366f1;
    --papyr-primary-hover: #4f46e5;
    --papyr-primary-light: rgba(99, 102, 241, 0.15);
    --papyr-bg: #0f172a;
    --papyr-surface: #1e293b;
    --papyr-border: #334155;
    --papyr-text: #f8fafc;
    --papyr-text-muted: #94a3b8;
    --papyr-success: #10b981;
    --papyr-error: #ef4444;
    --papyr-info: #0ea5e9;
    --papyr-radius: 12px;
    --papyr-font: system-ui, -apple-system, sans-serif;

    /* Layer 1 - Spacing Scale */
    --papyr-space-4: 4px;
    --papyr-space-8: 8px;
    --papyr-space-12: 12px;
    --papyr-space-16: 16px;
    --papyr-space-20: 20px;
    --papyr-space-24: 24px;
    --papyr-space-32: 32px;
    --papyr-space-40: 40px;
    --papyr-space-48: 48px;
    --papyr-space-64: 64px;

    /* Layer 1 - Radius Scale */
    --papyr-radius-xs: 2px;
    --papyr-radius-sm: 4px;
    --papyr-radius-md: 8px;
    --papyr-radius-lg: 12px;
    --papyr-radius-xl: 16px;
    --papyr-radius-2xl: 24px;
    --papyr-radius-full: 9999px;

    /* Layer 1 - Elevation Scale */
    --papyr-shadow-0: none;
    --papyr-shadow-1: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    --papyr-shadow-2: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    --papyr-shadow-3: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    --papyr-shadow-4: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
    --papyr-shadow-5: 0 25px 50px -12px rgba(0,0,0,0.25);

    /* Layer 1 - Typography Scale */
    --papyr-font-display: 3.5rem;
    --papyr-font-headline: 2.25rem;
    --papyr-font-title: 1.5rem;
    --papyr-font-body: 1rem;
    --papyr-font-caption: 0.875rem;
    --papyr-font-label: 0.75rem;

    /* Layer 1 - Motion Scale */
    --papyr-motion-fast: 150ms;
    --papyr-motion-normal: 300ms;
    --papyr-motion-slow: 600ms;

    /* Transition curves */
    --papyr-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --papyr-duration: 0.4s;
    --papyr-transition: all var(--papyr-duration) var(--papyr-ease);
}

/* Preset Layer 2 - Papyr Liquid Theme overrides */
.papyr-theme-liquid {
    --papyr-bg: #030712;
    --papyr-surface: rgba(255, 255, 255, 0.02);
    --papyr-border: rgba(255, 255, 255, 0.08);
    --papyr-text: #f9fafb;
    --papyr-text-muted: #9ca3af;
    --papyr-glow: rgba(99, 102, 241, 0.15);
    --papyr-radius: var(--papyr-radius-xl);
    --papyr-blur-level: 16px;
}

/* Preset Layer 2 - Papyr Material Theme overrides */
.papyr-theme-material {
    --papyr-bg: #121212;
    --papyr-surface: #1e1e1e;
    --papyr-border: rgba(255, 255, 255, 0.12);
    --papyr-text: rgba(255, 255, 255, 0.87);
    --papyr-text-muted: rgba(255, 255, 255, 0.6);
    --papyr-primary: #bb86fc;
    --papyr-primary-hover: #9a66da;
    --papyr-radius: var(--papyr-radius-sm);
    --papyr-blur-level: 0px;
}

/* Preset Layer 2 - Papyr Minimal Theme overrides */
.papyr-theme-minimal {
    --papyr-bg: #ffffff;
    --papyr-surface: #ffffff;
    --papyr-border: #e5e7eb;
    --papyr-text: #111827;
    --papyr-text-muted: #6b7280;
    --papyr-primary: #111827;
    --papyr-primary-hover: #374151;
    --papyr-radius: var(--papyr-radius-xs);
    --papyr-blur-level: 0px;
}

/* Preset Layer 2 - Papyr Enterprise Theme overrides */
.papyr-theme-enterprise {
    --papyr-bg: #f3f4f6;
    --papyr-surface: #ffffff;
    --papyr-border: #d1d5db;
    --papyr-text: #1f2937;
    --papyr-text-muted: #4b5563;
    --papyr-primary: #2563eb;
    --papyr-primary-hover: #1d4ed8;
    --papyr-radius: var(--papyr-radius-xs);
    --papyr-blur-level: 0px;
}

/* GPU acceleration hooks for Liquid Theme */
.papyr-theme-liquid .papyr-card, 
.papyr-theme-liquid .papyr-glass-panel,
.papyr-theme-liquid .papyr-hero-glass {
    backdrop-filter: blur(var(--papyr-blur-level, 16px));
    -webkit-backdrop-filter: blur(var(--papyr-blur-level, 16px));
    will-change: transform, opacity;
    transform: translate3d(0, 0, 0);
}


/* Flexbox System */
.flex-row { display: flex; flex-direction: row; gap: 1rem; }
.flex-col { display: flex; flex-direction: column; gap: 1rem; }
.flex-center { display: flex; justify-content: center; align-items: center; gap: 1rem; }
.flex-between { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.flex-around { display: flex; justify-content: space-around; align-items: center; gap: 1rem; }
.flex-wrap { display: flex; flex-wrap: wrap; gap: 1rem; }

/* Grid System */
.grid { display: grid; gap: 1.5rem; }

/* Cards */
.card { 
    background: var(--papyr-surface); 
    border: 1px solid var(--papyr-border);
    border-radius: var(--papyr-radius); 
    padding: 1.5rem; 
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
}
.card-title { margin-top: 0; margin-bottom: 0.75rem; color: var(--papyr-text); }
.card-content { color: var(--papyr-text-muted); font-size: 0.95rem; }
.card-footer { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--papyr-border); color: var(--papyr-text-muted); font-size: 0.85rem; }

/* Buttons */
.btn-primary { 
    background: var(--papyr-primary); 
    color: white; 
    border: none; 
    padding: 10px 20px; 
    border-radius: 8px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: background 0.2s; 
}
.btn-primary:hover { background: var(--papyr-primary-hover); }

/* Inputs */
input[type="text"], input[type="email"], input[type="password"], textarea, select {
    background: var(--papyr-bg);
    border: 1px solid var(--papyr-border);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--papyr-text);
    font-family: inherit;
    outline: none;
    width: 100%;
    transition: border-color 0.2s;
}
input[type="text"]:focus, input[type="email"]:focus, input[type="password"]:focus, textarea:focus, select:focus {
    border-color: var(--papyr-primary);
}

/* Forms */
.papyr-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-field { display: flex; flex-direction: column; gap: 0.5rem; }
.form-field label { font-size: 0.85rem; font-weight: 600; color: var(--papyr-text-muted); }

/* Table styling */
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th, .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--papyr-border); }
.data-table th { background: var(--papyr-surface); color: var(--papyr-text); font-weight: 600; }
.data-table td { color: var(--papyr-text-muted); }

/* Suggestions autocomplete */
.autocomplete { position: relative; width: 100%; }
.suggestions { 
    position: absolute; top: 100%; left: 0; right: 0; 
    background: var(--papyr-surface); border: 1px solid var(--papyr-border); 
    border-radius: 8px; list-style: none; padding: 0; margin: 4px 0 0 0; 
    z-index: 1000; max-height: 200px; overflow-y: auto;
}
.suggestions li { padding: 10px 14px; cursor: pointer; color: var(--papyr-text-muted); }
.suggestions li:hover { background: var(--papyr-bg); color: var(--papyr-text); }

/* Modal styles */
.modal { 
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center; z-index: 2000;
    opacity: 0; transition: opacity 0.3s ease;
}
.modal-show { opacity: 1; }
.modal-content { 
    background: var(--papyr-surface); border: 1px solid var(--papyr-border);
    border-radius: var(--papyr-radius); width: 90%; max-width: 500px; 
    transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-show .modal-content { transform: translateY(0); }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--papyr-border); display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; color: var(--papyr-text); }
.close-btn { background: none; border: none; font-size: 1.5rem; color: var(--papyr-text-muted); cursor: pointer; }
.close-btn:hover { color: var(--papyr-text); }
.modal-body { padding: 1.5rem; color: var(--papyr-text-muted); }

/* Toasts notifications */
.toast {
    position: fixed; bottom: 20px; right: 20px; 
    background: var(--papyr-surface); border: 1px solid var(--papyr-border);
    border-radius: 8px; padding: 12px 20px; color: var(--papyr-text); 
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); z-index: 3000;
    transform: translateY(100px); opacity: 0; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
}
.toast-show { transform: translateY(0); opacity: 1; }
.toast-hide { transform: translateY(-100px); opacity: 0; }
.toast-success { border-left: 4px solid var(--papyr-success); }
.toast-error { border-left: 4px solid var(--papyr-error); }
.toast-info { border-left: 4px solid var(--papyr-info); }

/* Tab components */
.tabs { display: flex; flex-direction: column; gap: 1rem; width: 100%; }
.tab-headers { display: flex; border-bottom: 1px solid var(--papyr-border); gap: 4px; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
.tab-headers::-webkit-scrollbar { display: none; }
.tab-header { 
    background: none; border: none; border-bottom: 2px solid transparent; 
    padding: 10px 16px; color: var(--papyr-text-muted); cursor: pointer; font-weight: 600;
    transition: all 0.2s;
}
.tab-header:hover { color: var(--papyr-text); }
.tab-active { color: var(--papyr-primary); border-bottom-color: var(--papyr-primary); }
.tab-contents { color: var(--papyr-text-muted); line-height: 1.5; }

/* Loader components */
.loading { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 2rem; color: var(--papyr-text-muted); }
.spinner { 
    width: 32px; height: 32px; border: 3px solid var(--papyr-primary-light); 
    border-top-color: var(--papyr-primary); border-radius: 50%; animation: spin 0.8s linear infinite; 
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Sidebars catalog navigation */
.sidebar { display: flex; flex-direction: column; gap: 4px; }
.sidebar-item { 
    padding: 10px 14px; border-radius: 6px; cursor: pointer; 
    color: var(--papyr-text-muted); transition: all 0.2s; 
}
.sidebar-item:hover { background: var(--papyr-primary-light); color: var(--papyr-text); }
.sidebar-item.active { background: var(--papyr-primary); color: white; }

/* Image carousel */
.carousel { position: relative; width: 100%; overflow: hidden; border-radius: var(--papyr-radius); border: 1px solid var(--papyr-border); aspect-ratio: 16/9; }
.carousel-img { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.2s ease-in-out; }
.carousel-btn { 
    position: absolute; top: 50%; transform: translateY(-50%); 
    background: rgba(15, 23, 42, 0.6); border: 1px solid var(--papyr-border); 
    color: white; width: 36px; height: 36px; border-radius: 50%; 
    cursor: pointer; display: flex; justify-content: center; align-items: center; z-index: 10;
    transition: background 0.2s;
}
.carousel-btn:hover { background: var(--papyr-primary); }
.prev-btn { left: 10px; }
.next-btn { right: 10px; }
.carousel-dots { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
.carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; }
.carousel-dot.active { background: white; width: 18px; border-radius: 4px; }

/* ==========================================
   BOOTSTRAP SPECIFICITY OVERRIDES
   ========================================== */
:root, [data-bs-theme="dark"] {
    --bs-body-bg: var(--papyr-bg, #0f172a) !important;
    --bs-body-color: var(--papyr-text, #f8fafc) !important;
    --bs-tertiary-bg: var(--papyr-surface, #1e293b) !important;
    --bs-card-bg: var(--papyr-surface, #1e293b) !important;
    --bs-card-color: var(--papyr-text, #f8fafc) !important;
    --bs-border-color: var(--papyr-border, #334155) !important;
}

.card {
    background: var(--papyr-surface, #1e293b) !important;
    border: 1px solid var(--papyr-border, #334155) !important;
    border-radius: var(--papyr-radius, 12px) !important;
}

/* PAPYR ANIMATE CSS */
.papyr-animate-base {
    opacity: 0;
    will-change: transform, opacity;
    animation-duration: 0.8s;
    animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
    animation-fill-mode: forwards;
}

.animated {
    opacity: 1; /* fallback if animation fails */
}

/* Entrance Animations */
.animate-fade-in { animation-name: papyr-fade-in; }
@keyframes papyr-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

.animate-slide-up { animation-name: papyr-slide-up; }
@keyframes papyr-slide-up {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-slide-down { animation-name: papyr-slide-down; }
@keyframes papyr-slide-down {
    from { opacity: 0; transform: translateY(-40px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-zoom-in { animation-name: papyr-zoom-in; }
@keyframes papyr-zoom-in {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
}

.animate-bounce { animation-name: papyr-bounce; animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1); }
@keyframes papyr-bounce {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
}

/* Interactive Hover Animations */
.hover-grow {
    transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.hover-grow:hover {
    transform: scale(1.05);
}

.hover-lift {
    transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.3s;
}
.hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

/* Reduce motion accessibility */
@media (prefers-reduced-motion: reduce) {
    .papyr-animate-base, .hover-grow, .hover-lift {
        animation: none !important;
        transition: none !important;
        transform: none !important;
        opacity: 1 !important;
    }
}

/* Low-end device performance overrides */
.papyr-low-end, .papyr-low-end * {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
    text-shadow: none !important;
    animation: none !important;
    transition: none !important;
}



/* Papyr.js Responsive Grid System */
.container { width: 100%; margin-right: auto; margin-left: auto; padding-right: 15px; padding-left: 15px; }
@media (min-width: 576px) { .container { max-width: 540px; } }
@media (min-width: 768px) { .container { max-width: 720px; } }
@media (min-width: 992px) { .container { max-width: 960px; } }
@media (min-width: 1200px) { .container { max-width: 1140px; } }

.row { display: flex; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; }
.col { flex-basis: 0; flex-grow: 1; max-width: 100%; padding-right: 15px; padding-left: 15px; }

/* Grid Columns */
.col-12 { flex: 0 0 100%; max-width: 100%; padding-right: 15px; padding-left: 15px; }
.col-6 { flex: 0 0 50%; max-width: 50%; padding-right: 15px; padding-left: 15px; }
.col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; padding-right: 15px; padding-left: 15px; }
.col-3 { flex: 0 0 25%; max-width: 25%; padding-right: 15px; padding-left: 15px; }

@media (min-width: 768px) {
    .col-md-12 { flex: 0 0 100%; max-width: 100%; }
    .col-md-6 { flex: 0 0 50%; max-width: 50%; }
    .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
    .col-md-3 { flex: 0 0 25%; max-width: 25%; }
}

@media (min-width: 992px) {
    .col-lg-12 { flex: 0 0 100%; max-width: 100%; }
    .col-lg-6 { flex: 0 0 50%; max-width: 50%; }
    .col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
    .col-lg-3 { flex: 0 0 25%; max-width: 25%; }
}

/* Flex Utilities */
.flex { display: flex; }
.flex-column { flex-direction: column; }
.align-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.wrap { flex-wrap: wrap; }
.gap-1 { gap: 0.5rem; }
.gap-2 { gap: 1rem; }
.gap-3 { gap: 1.5rem; }

/* Global Typography & Adjustments for Mobile */
@media (max-width: 768px) {
    body { font-size: 14px; }
    h1 { font-size: 2rem !important; }
    h2 { font-size: 1.5rem !important; }
    .hero { padding: 3rem 1rem !important; }
    .hero-buttons { flex-direction: column; gap: 1rem; width: 100%; }
    .hero-buttons > * { width: 100%; text-align: center; justify-content: center; }
    .stat-item { width: 100% !important; margin-bottom: 1rem; }
    .api-grid { grid-template-columns: 1fr !important; }
    #playground-split { flex-direction: column !important; }
    #editor-pane, #preview-pane { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--border-color); }
    .catalog-sidebar { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--border-color); }
    .playground-body { flex-direction: column !important; }
}
\\n
/* Docs Layout */
.docs-container {
    display: flex;
    min-height: 100vh;
}
.sidebar {
    width: 250px;
    background: #0a0f1c;
    border-right: 1px solid var(--border-color);
    padding: 2rem 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    flex-shrink: 0;
}
.sidebar-link {
    display: block;
    padding: 0.5rem 1.5rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: all 0.2s;
    font-size: 0.9rem;
}
.sidebar-link:hover {
    color: #fff;
    background: rgba(255,255,255,0.05);
}
.sidebar-link.active {
    color: var(--primary);
    background: rgba(99, 102, 241, 0.1);
    border-right: 3px solid var(--primary);
}
.docs-content {
    flex-grow: 1;
    padding: 3rem 4rem;
    max-width: 900px;
}

@media (max-width: 768px) {
    .docs-container {
        flex-direction: column;
    }
    .sidebar {
        width: 100%;
        height: auto;
        position: relative;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
        padding: 1rem 0;
    }
    .docs-content {
        padding: 2rem 1.5rem;
    }
}

.crud-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
}
@media (max-width: 768px) {
    .crud-grid {
        grid-template-columns: 1fr;
    }
}

.responsive-split-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}
@media (max-width: 768px) {
    .responsive-split-grid {
        grid-template-columns: 1fr;
    }
}

/* Custom animations for papyr complete */
@keyframes papyr-blur-in {
    0% { opacity: 0; filter: blur(12px); transform: translateY(20px); }
    100% { opacity: 1; filter: blur(0); transform: translateY(0); }
}
@keyframes papyr-glass-pop {
    0% { opacity: 0; transform: scale(0.93) translateY(15px); }
    70% { transform: scale(1.01) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-blur-in { animation-name: papyr-blur-in; }
.animate-glass-pop { animation-name: papyr-glass-pop; }

/* ==========================================
   WATT PRIVACY BANNER AND CONSENT COMPONENTS
   ========================================== */
.watt-banner-pill {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: rgba(13, 17, 34, 0.85);
    border: 1px solid rgba(20, 184, 166, 0.25);
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(20, 184, 166, 0.1);
    border-radius: 99px;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: calc(100% - 48px);
    max-width: 650px;
    z-index: 9999;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    animation: watt-slide-in-banner 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes watt-slide-in-banner {
    to { transform: translateX(-50%) translateY(0); }
}

@media (max-width: 576px) {
    .watt-banner-pill {
        flex-direction: column;
        border-radius: 16px;
        padding: 16px;
        text-align: center;
        gap: 12px;
    }
}

/* ==========================================================================
   PAPYR DESIGN ENGINE CORE (papyr-design.css integration)
   Mantra: "Simple inside, Beautiful outside."
   ========================================================================== */

:root {
    /* Architectural Design System Defaults (Adaptive Dark Theme Core) */
    --papyr-bg: #030712;
    --papyr-surface: rgba(255, 255, 255, 0.015);
    --papyr-border: rgba(255, 255, 255, 0.06);
    --papyr-text: #f9fafb;
    --papyr-text-muted: #9ca3af;
    
    /* Branding & Accent Gradients */
    --papyr-primary: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    --papyr-glow: rgba(99, 102, 241, 0.15);
    
    /* Ergonomic Spatial Tokens (Prevents Cluttered Alignments) */
    --papyr-radius-card: 20px;
    --papyr-radius-btn: 12px;
    --papyr-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    
    /* Apple-Like Cinematic Physics Keyframes */
    --papyr-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --papyr-duration: 0.4s;
    --papyr-transition: all var(--papyr-duration) var(--papyr-ease);
}

/* System Bootstrapper Reset */
[papyr-root] {
    background-color: var(--papyr-bg);
    color: var(--papyr-text);
    font-family: var(--papyr-font);
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
}

/* ──────────────────────────────────────────────────────────────────────────
   1. PAPYR CORE CONTAINERS & INTENT BLOCKS
   ────────────────────────────────────────────────────────────────────────── */

/* Semantic Layout Engine Flex Hooks */
.papyr-col, .papyr-row {
    display: flex;
    box-sizing: border-box;
    transition: var(--papyr-transition);
}
.papyr-col { flex-direction: column; gap: var(--papyr-gap, 16px); }
.papyr-row { flex-direction: row; align-items: center; gap: var(--papyr-gap, 16px); }

/* The Premium Signature Layer: Glassmorphism Card Engine */
.papyr-card {
    background: var(--papyr-surface);
    border: 1px solid var(--papyr-border);
    border-radius: var(--papyr-radius-card);
    padding: var(--papyr-pad, 24px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(var(--papyr-blur, 16px));
    -webkit-backdrop-filter: blur(var(--papyr-blur, 16px));
    transition: var(--papyr-transition);
}

/* Active Interaction Motion State */
.papyr-card[interactive]:hover, .papyr-card[interactive="true"]:hover {
    transform: translateY(-4px) scale(1.01);
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 30px var(--papyr-glow);
}

/* ──────────────────────────────────────────────────────────────────────────
   2. HIGH-END COGNITIVE UI FORMS & BUTTONS
   ────────────────────────────────────────────────────────────────────────── */

/* Micro-Interaction Button Design */
.papyr-btn {
    background: #f9fafb;
    color: #030712;
    border: none;
    border-radius: var(--papyr-radius-btn);
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: var(--papyr-transition);
}

.papyr-btn:hover {
    background: #ffffff;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
    transform: scale(1.02);
}

.papyr-btn:active {
    transform: scale(0.98); /* Native Haptic Compression Feedback */
}

/* Primary Accent Mode Override */
.papyr-btn[intent="primary"] {
    background: var(--papyr-primary);
    color: #ffffff;
}
.papyr-btn[intent="primary"]:hover {
    box-shadow: 0 0 25px var(--papyr-glow);
}

/* ──────────────────────────────────────────────────────────────────────────
   3. CLUTTER-FREE CLEAN TYPOGRAPHY UTILITIES
   ────────────────────────────────────────────────────────────────────────── */
.papyr-title {
    margin: 0;
    font-size: var(--papyr-fs, 28px);
    font-weight: 700;
    letter-spacing: -0.025em;
    background: linear-gradient(to right, #ffffff, #d1d5db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.papyr-muted {
    margin: 0;
    color: var(--papyr-text-muted);
    font-size: var(--papyr-fs, 14px);
    line-height: 1.5;
}

/* Biometric & Behavioral Adaptive UI Overrides */
.papyr-stress .papyr-btn,
.papyr-stress button {
    padding: 16px 32px !important;
    font-size: 16px !important;
    transform: scale(1.05) !important; /* Larger hit target */
}

.papyr-stress .papyr-card {
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border-color: var(--papyr-border) !important;
}

.papyr-stress .papyr-particle-canvas,
.papyr-stress canvas:not(.papyr-gpu-layout-container) {
    display: none !important;
}

.papyr-reading p,
.papyr-reading .papyr-muted {
    line-height: 1.8 !important;
    letter-spacing: 0.03em !important;
    transition: line-height 0.4s ease, letter-spacing 0.4s ease;
}
`;
        document.head.appendChild(style);
        console.log("📄 Papyr UI styling successfully injected.");
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
