/**
 * PAPYR STATIC SITE LIBRARY - UI & Layout Modular Bundle
 * v3.0.2 - Core Reactivity, SPA Routing, Layouts, Design Engine, and Premium UI Components
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
            return papyr('div', '.papyr-card', options, ...children);
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
            const isFolded = typeof window !== 'undefined' && (
                window.matchMedia('(spanning: single-fold-vertical)').matches || 
                window.matchMedia('(spanning: single-fold-horizontal)').matches ||
                window.innerWidth < 900 // Fallback breakpoint for fold simulation
            );

            let config = Object.assign({
                gap: '24px'
            }, options);

            return papyr.div({
                class: 'papyr-foldable-layout',
                style: {
                    display: 'grid',
                    gridTemplateColumns: isFolded ? '1fr' : '1fr 1fr',
                    gap: config.gap,
                    width: '100%'
                }
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
        }
    };
})();


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
        let title = papyr.span(() => `${monthNames[month.value]} ${year.value}`, { style: { fontWeight: 'bold', color: 'white' } });
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
})();


// --- MODULE: plugins/animate.js ---
/**
 * PAPYR ANIMATE
 * Zero-dependency hardware-accelerated animation engine.
 * v3.0 - Agile Cinematic Motion, Spring systems, and Swipe gestures.
 */
(function () {
    const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

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
            Object.entries(anims).forEach(([prop, anim]) => {
                let force = -tension * (anim.current - anim.target) - friction * anim.velocity;
                let acceleration = force / mass;
                anim.velocity += acceleration * 0.016; // dt = 16ms
                anim.current += anim.velocity * 0.016;

                if (Math.abs(anim.velocity) > 0.01 || Math.abs(anim.current - anim.target) > 0.01) {
                    done = false;
                } else {
                    anim.current = anim.target;
                }
            });

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

        const start = (clientX, clientY) => {
            startX = clientX;
            startY = clientY;
            isDragging = true;
            el.style.transition = 'none';
        };

        const move = (clientX, clientY) => {
            if (!isDragging) return;
            currentX = clientX - startX;
            currentY = clientY - startY;
            if (onDrag) onDrag(currentX, currentY, el);
            else {
                el.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        };

        const end = () => {
            if (!isDragging) return;
            isDragging = false;

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

        el.addEventListener('mousedown', (e) => start(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
        window.addEventListener('mouseup', end);

        el.addEventListener('touchstart', (e) => start(e.touches[0].clientX, e.touches[0].clientY));
        el.addEventListener('touchmove', (e) => move(e.touches[0].clientX, e.touches[0].clientY));
        el.addEventListener('touchend', end);

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

            const update = () => {
                if (!isDragging) {
                    vy += gravity;
                    y += vy;

                    let parentHeight = el.parentElement ? el.parentElement.clientHeight : window.innerHeight;
                    let floor = parentHeight - el.offsetHeight;

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
