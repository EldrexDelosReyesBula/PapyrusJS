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
