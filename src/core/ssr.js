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
