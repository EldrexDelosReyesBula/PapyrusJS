/**
 * PAPYR STATIC SITE LIBRARY - Core Bundle (ESM)
 * v3.0.1 - Agile Modular Architecture (Reactivity, Hash SPA Router, Math Logic, Persistent CRUD Store)
 * Released under MIT License.
 */

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
                    setProperty(k, v) { this[k] = v; }
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
                setAttribute(k, v) { this.attributes[k] = v; },
                getAttribute(k) { return this.attributes[k]; },
                removeAttribute(k) { delete this.attributes[k]; },
                hasAttribute(k) { return k in this.attributes; },
                addEventListener() {},
                removeEventListener() {},
                get innerHTML() {
                    const attrs = Object.entries(this.attributes).map(([k, v]) => `${k}="${v}"`).join(' ');
                    const styles = Object.entries(this.style).filter(([k]) => typeof this.style[k] !== 'function').map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v}`).join('; ');
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
        return Object.keys(val).filter(k => val[k]).join(' ');
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
                    
                    let styleText = Object.entries(utilitySet[ut])
                        .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v};`)
                        .join(' ');
                    
                    let query = `@media (min-width: ${bpWidth})`;
                    injectRule(query, `.${uniqueClass} { ${styleText} }`);
                }
            }
        } else {
            // Standard utility class
            let utilitySet = papyrUtilities[trimmedItem] ? papyrUtilities : (typeof paperUtilities !== 'undefined' ? paperUtilities : {});
            if (utilitySet[trimmedItem]) {
                Object.entries(utilitySet[trimmedItem]).forEach(([k, v]) => {
                    el.style[k] = v;
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
    const result = tmp[a.length][b.length];
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
            result[`state_${idx++}`] = s.value;
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
            if (plugin.hooks && typeof plugin.hooks[hookName] === 'function') {
                try {
                    plugin.hooks[hookName](...args);
                } catch(e) {
                    this.kernel.diagnostics.reportError(e);
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
                if (arg.style) {
                    Object.entries(arg.style).forEach(([key, val]) => {
                        const updateStyle = (v) => {
                            if (key.startsWith('--')) {
                                el.style.setProperty(key, String(v));
                            } else if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
                                // eslint-disable-next-line security/detect-object-injection
                                el.style[key] = v;
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
                                    // eslint-disable-next-line security/detect-object-injection
                                    el[k] = newVal;
                                    if (newVal) el.setAttribute(k, '');
                                    else el.removeAttribute(k);
                                } else {
                                    // eslint-disable-next-line security/detect-object-injection
                                    el[k] = newVal;
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
            components: papyrInstance.components.list(),
            state: papyrInstance.state.dump(),
            routes: papyrInstance.runtime.routes || [],
            errors: papyrInstance.diagnostics.errors,
            plugins: papyrInstance.plugins.list()
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
        Object.entries(config).forEach(([key, val]) => {
            if (doc.documentElement && doc.documentElement.style) {
                doc.documentElement.style.setProperty(`--papyr-${key}`, val);
                doc.documentElement.style.setProperty(`--${key}`, val);
            }
        });
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
        let target = doc.querySelector(selector);
        if (target) {
            target.innerHTML = '';
            target.appendChild(component);
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
        el.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        requestAnimationFrame(() => {
            Object.assign(el.style, properties);
        });
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

    papyrInstance.ssr = (component) => {
        if (!component) return '';
        if (typeof component === 'function') {
            component = component();
        }
        return component.innerHTML || String(component);
    };
    papyrInstance.ssr.render = (component) => papyrInstance.ssr(component);

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
        papyr.security = {
            _isActive: true, // Enabled by default for safety
            currentTier: 'default',
            hasConsent: false,
            _scriptsBlocked: false,

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
                    // Clear tracking keys from real localStorage in a single transactional pass to avoid index shift bugs
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
                if (this.currentTier === 'high') return true;
                if (!this.hasConsent) {
                    return trackingKeys.some(tk => key.toLowerCase().includes(tk));
                }
                return false;
            },

            /**
             * Strip dangerous tags and attributes from raw HTML strings.
             */
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
                    } catch (e) {
                        // fallback to regex below
                    }
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

            /**
             * Allow enterprise users to register custom security hooks
             */
            use(provider) {
                if (provider === 'disable') {
                    this._isActive = false;
                    if (papyr.warn) papyr.warn("Papyr Security Kernel DISABLED. You are vulnerable to XSS.");
                }
            },

            /**
             * Client-Side Storage Encryption (Obfuscated Dynamic Feedback Cipher)
             * Prevents generic localStorage scraping by malicious extensions.
             */
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

            /**
             * Advanced Client-Side Storage Encryption (Browser-native AES-GCM 256-bit with PBKDF2)
             */
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
            }
        };

        papyr.safeGet = (obj, key) => {
            if (!obj || typeof obj !== 'object') return undefined;
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                throw new Error("Security Violation: Unsafe property access");
            }
            // eslint-disable-next-line security/detect-object-injection
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
            // eslint-disable-next-line security/detect-non-literal-regexp
            regex: new RegExp('^' + cleanPath.replace(/:\w+/g, '([^/]+)') + '$'),
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
            // eslint-disable-next-line security/detect-non-literal-regexp
            regex: new RegExp('^' + cleanPath.replace(/:\w+/g, '([^/]+)') + '$'),
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

    papyr.db = (collectionName, engine = 'local') => {

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

        const isAsync = engine !== 'local' && engine !== 'session' && drivers[engine];
        // eslint-disable-next-line security/detect-object-injection
        const driver = (engine && engine !== '__proto__' && engine !== 'constructor' && engine !== 'prototype' && Object.prototype.hasOwnProperty.call(drivers, engine)) ? drivers[engine] : drivers['local'];

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

    // Upgraded storage helper function with dual call signature compatibility
    const storageFunc = (key, val) => {
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
    storageFunc.remove = (k) => localStorage.removeItem(k);
    storageFunc.clear = () => localStorage.clear();
    storageFunc.secureSet = (k, v, password) => {
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        localStorage.setItem(k, papyr.security.encrypt(JSON.stringify(v), password));
    };
    storageFunc.secureGet = (k, password) => {
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        let enc = localStorage.getItem(k);
        if (!enc) return null;
        try { return JSON.parse(papyr.security.decrypt(enc, password)); } catch (e) { return null; }
    };
    storageFunc.secureSetAsync = async (k, v, password) => {
        if (!papyr.security || typeof papyr.security.encryptAsync !== 'function') {
            return storageFunc.secureSet(k, v, password);
        }
        const enc = await papyr.security.encryptAsync(JSON.stringify(v), password);
        localStorage.setItem(k, enc);
    };
    storageFunc.secureGetAsync = async (k, password) => {
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
    sessionFunc.remove = (k) => sessionStorage.removeItem(k);
    sessionFunc.clear = () => sessionStorage.clear();
    sessionFunc.secureSet = (k, v, password) => {
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        sessionStorage.setItem(k, papyr.security.encrypt(JSON.stringify(v), password));
    };
    sessionFunc.secureGet = (k, password) => {
        if (!papyr.security) return console.error("PapyrError: Security module not loaded.");
        let enc = sessionStorage.getItem(k);
        if (!enc) return null;
        try { return JSON.parse(papyr.security.decrypt(enc, password)); } catch (e) { return null; }
    };
    sessionFunc.secureSetAsync = async (k, v, password) => {
        if (!papyr.security || typeof papyr.security.encryptAsync !== 'function') {
            return sessionFunc.secureSet(k, v, password);
        }
        const enc = await papyr.security.encryptAsync(JSON.stringify(v), password);
        sessionStorage.setItem(k, enc);
    };
    sessionFunc.secureGetAsync = async (k, password) => {
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
    papyr.api = {
        /**
         * Perform an async GET request
         */
        async get(url, headers = {}) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        ...headers
                    }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return await response.json();
            } catch (error) {
                if (papyr.warn) papyr.warn(`papyr.api.get failed for ${url}`, error);
                throw error;
            }
        },

        /**
         * Perform an async POST request
         */
        async post(url, data, headers = {}) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...headers
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return await response.json();
            } catch (error) {
                if (papyr.warn) papyr.warn(`papyr.api.post failed for ${url}`, error);
                throw error;
            }
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



const papyr = createPapyr();
export { papyr, createPapyr };
export const signal = papyr.signal;
export const computed = papyr.computed;
export const watch = papyr.watch;
export const effect = papyr.effect;
export const mount = papyr.mount;
export const route = papyr.route;
export const page = papyr.page;
export const theme = papyr.theme;
export const plugin = papyr.plugin;
export default papyr;
