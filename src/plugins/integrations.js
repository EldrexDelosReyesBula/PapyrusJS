/**
 * PAPYR INTEGRATIONS ENGINE
 * Official native connectors for Express, React, Next.js, Angular, Tailwind, Bootstrap, and AI Agents.
 * v2.0 - Zero-dependency Server-Side Renderer (SSR), fine-grained hook bindings, and AI semantic translation.
 */
(function(window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading integrations.");
        return;
    }

    const papyr = window.papyr;

    // ==========================================
    // 1. NODE.JS & EXPRESS SERVER-SIDE RENDERING
    // ==========================================
    
    /**
     * Renders standard Papyr DOM elements and nested structures to a pure static HTML string.
     * Supports browser nodes, DocumentFragments, array loops, text nodes, and virtual testing objects.
     */
    papyr.ssr = function ssr(element) {
        if (element === null || element === undefined) return '';
        
        // 1. Primitive values (strings, numbers)
        if (typeof element === 'string' || typeof element === 'number') {
            return String(element);
        }
        
        // 2. Arrays of elements
        if (Array.isArray(element)) {
            return element.map(ssr).join('');
        }
        
        // 3. Text Nodes (native nodeType 3 or virtual structure objects)
        if (element.nodeType === 3 || (element.textContent !== undefined && !element.tagName)) {
            return String(element.textContent || '');
        }

        // 4. DocumentFragments / template contents
        if (element instanceof DocumentFragment || element.tagName === 'TEMPLATE-CONTENT' || (element.children && !element.tagName)) {
            if (element.children && Array.isArray(element.children)) {
                return element.children.map(ssr).join('');
            }
            return '';
        }

        // 5. Native and virtual HTML elements
        let tag = (element.tagName || 'DIV').toLowerCase();
        
        let attrsStr = '';
        if (element.id) {
            attrsStr += ` id="${element.id}"`;
        }
        
        if (element.className) {
            attrsStr += ` class="${element.className}"`;
        }
        
        if (element.style) {
            let styleKeys = Object.keys(element.style);
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

        // Render other direct primitive properties as HTML attributes (excluding internal variables)
        const ignoredKeys = ['tagName', 'style', 'dataset', 'classList', 'children', 'parentNode', 'listeners', 'className', 'id', 'textContent', 'nodeType', 'innerHTML'];
        Object.entries(element).forEach(([k, v]) => {
            if (!ignoredKeys.includes(k) && typeof v !== 'function' && typeof v !== 'object') {
                attrsStr += ` ${k}="${v}"`;
            }
        });

        // HTML5 self-closing elements
        const selfClosing = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
        if (selfClosing.includes(tag)) {
            return `<${tag}${attrsStr} />`;
        }

        // Child components serialization
        let childrenStr = '';
        if (element.children && element.children.length > 0) {
            childrenStr = element.children.map(ssr).join('');
        } else if (element.textContent) {
            childrenStr = String(element.textContent);
        } else if (element.innerHTML) {
            childrenStr = String(element.innerHTML);
        }

        return `<${tag}${attrsStr}>${childrenStr}</${tag}>`;
    };

    /**
     * Express.js custom template rendering engine callback.
     * Integrates with Express configurations: app.engine('papyr', papyr.express())
     */
    papyr.express = function() {
        return function(filePath, options, callback) {
            try {
                // Delete module cache to allow real-time changes in dev
                if (typeof require !== 'undefined' && require.resolve) {
                    delete require.cache[require.resolve(filePath)];
                    const module = require(filePath);
                    
                    let element;
                    if (typeof module === 'function') {
                        element = module(options);
                    } else if (module && typeof module.render === 'function') {
                        element = module.render(options);
                    } else if (module && module.default) {
                        if (typeof module.default === 'function') {
                            element = module.default(options);
                        } else {
                            element = module.default;
                        }
                    } else {
                        element = module;
                    }
                    const html = papyr.ssr(element);
                    return callback(null, html);
                } else {
                    return callback(new Error("SSR Express environment requires Node.js standard require resolver."));
                }
            } catch (e) {
                return callback(e);
            }
        };
    };

    // ==========================================
    // 2. REACT & NEXT.JS BINDINGS
    // ==========================================
    papyr.react = {
        /**
         * Custom React hook: useStore(papyrState)
         * Subscribes to fine-grained papyr state reactivity and triggers React re-renders upon state changes.
         */
        useStore(papyrState) {
            const React = window.React || (typeof require === 'function' ? require('react') : null);
            if (!React) {
                console.warn("React is not loaded globally or locally. useStore returning static state value.");
                return papyrState ? papyrState.value : undefined;
            }
            
            const [val, setVal] = React.useState(papyrState ? papyrState.value : undefined);
            
            React.useEffect(() => {
                if (papyrState && typeof papyrState.subscribe === 'function') {
                    const unsubscribe = papyrState.subscribe(newVal => {
                        setVal(newVal);
                    });
                    return () => {
                        if (typeof unsubscribe === 'function') unsubscribe();
                    };
                }
            }, [papyrState]);
            
            return val;
        },

        /**
         * React Component wrapper: <PapyrElement el={element} />
         * Smoothly mounts a living reactive Papyr element hierarchy inside React/Next.js trees.
         */
        Component({ el, ...props }) {
            const React = window.React || (typeof require === 'function' ? require('react') : null);
            if (!React) {
                console.warn("React is not loaded. React component wrapper cannot render.");
                return null;
            }
            
            const ref = React.useRef(null);
            
            React.useEffect(() => {
                if (ref.current) {
                    ref.current.innerHTML = '';
                    let element = typeof el === 'function' ? el() : el;
                    if (element) {
                        ref.current.appendChild(element);
                    }
                }
            }, [el]);
            
            return React.createElement('div', Object.assign({ ref }, props));
        }
    };

    // ==========================================
    // 3. ANGULAR LIFECYCLE COMPATIBILITY
    // ==========================================
    papyr.angular = {
        /**
         * Directive-level manual mounter.
         * Mounts the reactive component into the given Angular native element lifecycle.
         */
        mount(el, papyrComponent) {
            if (!el) return null;
            el.innerHTML = '';
            const rendered = typeof papyrComponent === 'function' ? papyrComponent() : papyrComponent;
            if (rendered) {
                el.appendChild(rendered);
            }
            return rendered;
        }
    };

    // ==========================================
    // 4. TAILWIND & BOOTSTRAP SHORTCUTS
    // ==========================================
    
    // Tailwind direct wrapper mappers
    papyr.tailwind = (classes, ...children) => {
        papyr.loadFramework('tailwind');
        return papyr.div({ class: classes }, ...children);
    };
    
    ['div','span','button','h1','h2','h3','p','a','input','img'].forEach(tag => {
        papyr.tailwind[tag] = (classes, ...children) => {
            papyr.loadFramework('tailwind');
            return papyr(tag, { class: classes }, ...children);
        };
    });

    // Bootstrap direct wrapper mappers
    papyr.bootstrap = (classes, ...children) => {
        papyr.loadFramework('bootstrap');
        return papyr.div({ class: classes }, ...children);
    };
    
    ['div','span','button','h1','h2','h3','p','a','input','img'].forEach(tag => {
        papyr.bootstrap[tag] = (classes, ...children) => {
            papyr.loadFramework('bootstrap');
            return papyr(tag, { class: classes }, ...children);
        };
    });

    // ==========================================
    // 5. AI-FRIENDLY SEMANTIC STRUCTURES
    // ==========================================
    papyr.ai = {
        /**
         * Compiles any Papyr HTMLElement/node tree into a lightweight, noise-free semantic JSON representation.
         * Designed specifically for LLMs to easily read, manipulate, and generate complex layouts.
         */
        toSemanticJSON(el) {
            if (el === null || el === undefined) return null;
            
            // Simple strings, numbers, or text nodes
            if (typeof el === 'string' || typeof el === 'number') {
                return { tag: 'text', text: String(el) };
            }
            if (el.nodeType === 3 || (el.textContent !== undefined && !el.tagName)) {
                return { tag: 'text', text: String(el.textContent || '') };
            }

            let node = {
                tag: (el.tagName || 'DIV').toLowerCase()
            };

            if (el.id) {
                node.id = el.id;
            }
            
            if (el.className) {
                node.classes = el.className.split(/\s+/).filter(Boolean);
            }

            // Styles
            if (el.style) {
                let styleObj = {};
                let styleKeys = Object.keys(el.style);
                styleKeys.forEach(k => {
                    if (el.style[k]) styleObj[k] = el.style[k];
                });
                if (Object.keys(styleObj).length > 0) {
                    node.style = styleObj;
                }
            }

            // Attributes & dataset mapping
            let attributes = {};
            const ignoredKeys = ['tagName', 'style', 'dataset', 'classList', 'children', 'parentNode', 'listeners', 'className', 'id', 'textContent', 'nodeType', 'innerHTML'];
            Object.entries(el).forEach(([k, v]) => {
                if (!ignoredKeys.includes(k) && typeof v !== 'function' && typeof v !== 'object') {
                    attributes[k] = v;
                }
            });
            if (el.dataset && Object.keys(el.dataset).length > 0) {
                Object.assign(attributes, el.dataset);
            }
            if (Object.keys(attributes).length > 0) {
                node.attributes = attributes;
            }

            // Recursively build children or map text
            if (el.children && el.children.length > 0) {
                node.children = el.children.map(child => papyr.ai.toSemanticJSON(child)).filter(Boolean);
            } else if (el.textContent && el.textContent.trim()) {
                node.text = el.textContent.trim();
            }

            return node;
        },

        /**
         * Re-compiles a clean semantic JSON structure directly back into fully-functional interactive DOM nodes.
         */
        fromSemanticJSON(json) {
            if (!json) return null;
            if (typeof json === 'string') {
                return document.createTextNode(json);
            }
            if (json.tag === 'text') {
                return document.createTextNode(json.text || '');
            }

            const args = [];
            
            // Build class and ID selectors
            let selector = '';
            if (json.id) {
                selector += `#${json.id}`;
            }
            if (json.classes) {
                let classesList = Array.isArray(json.classes) ? json.classes : json.classes.split(/\s+/).filter(Boolean);
                classesList.forEach(cls => {
                    selector += `.${cls}`;
                });
            }
            if (selector) {
                args.push(selector);
            }

            // Build style and custom attributes options
            const options = {};
            if (json.style) {
                options.style = json.style;
            }
            if (json.attributes) {
                Object.assign(options, json.attributes);
            }
            if (Object.keys(options).length > 0) {
                args.push(options);
            }

            // Text
            if (json.text) {
                args.push(json.text);
            }
            
            // Render and append children elements
            if (json.children && Array.isArray(json.children)) {
                json.children.forEach(childJson => {
                    const childEl = papyr.ai.fromSemanticJSON(childJson);
                    if (childEl) {
                        args.push(childEl);
                    }
                });
            }

            return papyr(json.tag || 'div', ...args);
        }
    };

    // ==========================================
    // 6. PAPYR GAMING & ADAPTER PROTOCOL GATEWAY
    // ==========================================
    papyr.game = {
        canvas(options = {}) {
            const { width = 600, height = 400, onInit = null } = options;
            const container = papyr.div('.papyr-game-container', {
                style: {
                    position: 'relative',
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height,
                    background: '#020205',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)'
                }
            });
            const cv = document.createElement('canvas');
            cv.width = parseInt(width);
            cv.height = parseInt(height);
            cv.style.display = 'block';
            cv.style.width = '100%';
            cv.style.height = '100%';
            container.appendChild(cv);
            
            if (onInit) {
                setTimeout(() => onInit(cv), 50);
            }
            return container;
        },
        loop(cb) {
            let active = true;
            const step = () => {
                if (!active) return;
                cb();
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            return () => { active = false; };
        },
        input(el) {
            const keys = {};
            const onKeyDown = (e) => { keys[e.key] = true; };
            const onKeyUp = (e) => { keys[e.key] = false; };
            const target = el || window;
            target.addEventListener('keydown', onKeyDown);
            target.addEventListener('keyup', onKeyUp);
            return {
                isDown(key) { return !!keys[key]; },
                destroy() {
                    target.removeEventListener('keydown', onKeyDown);
                    target.removeEventListener('keyup', onKeyUp);
                }
            };
        }
    };

    const registeredGateways = new Map();
    papyr.gateway = {
        register(name, adapter) {
            if (!name || !adapter) return;
            registeredGateways.set(name, adapter);
            console.log(`🔌 Papyr Gateway: Registered adapter "${name}" successfully.`);
            if (typeof adapter.initialize === 'function') {
                adapter.initialize(papyr);
            }
        },
        resolve(name) {
            return registeredGateways.get(name);
        },
        list() {
            return Array.from(registeredGateways.keys());
        }
    };

    // Override use to support dynamic runtime loads
    const originalUse = papyr.use;
    papyr.use = (plugin) => {
        if (typeof plugin === 'string') {
            const cdnUrls = {
                phaser: 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js',
                three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
                pixi: 'https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.js',
                babylon: 'https://cdn.jsdelivr.net/npm/babylonjs@6.30.0/babylon.js'
            };
            const url = cdnUrls[plugin.toLowerCase()];
            if (url) {
                return new Promise((resolve, reject) => {
                    const scriptId = `papyr-lib-${plugin.toLowerCase()}`;
                    if (document.getElementById(scriptId)) {
                        resolve(window[plugin]);
                        return;
                    }
                    const script = document.createElement('script');
                    script.id = scriptId;
                    script.src = url;
                    script.onload = () => {
                        console.log(`📦 Papyr Gateway: Dynamic library "${plugin}" loaded successfully.`);
                        resolve(window[plugin]);
                    };
                    script.onerror = (err) => reject(err);
                    document.head.appendChild(script);
                });
            }
        }
        return originalUse(plugin);
    };

})(typeof window !== 'undefined' ? window : this);
