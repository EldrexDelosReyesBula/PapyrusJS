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

    // ==========================================
    // 7. VUE, SVELTE & NEXT.JS BRIDGES
    // ==========================================
    
    // Vue Bridge
    papyr.vue = {
        /**
         * Vue Bridge Component
         * Usage in Vue templates: <papyr-vue-bridge :el="MyComponent" />
         */
        Bridge: {
            props: {
                el: { required: true }
            },
            mounted() {
                this.renderPapyr();
            },
            updated() {
                this.renderPapyr();
            },
            methods: {
                renderPapyr() {
                    const container = this.$refs.container;
                    if (container) {
                        container.innerHTML = '';
                        const node = typeof this.el === 'function' ? this.el() : this.el;
                        if (node) container.appendChild(node);
                    }
                }
            },
            render() {
                const Vue = window.Vue;
                if (Vue && typeof Vue.h === 'function') {
                    return Vue.h('div', { ref: 'container' });
                }
                return typeof this.$createElement === 'function' 
                    ? this.$createElement('div', { ref: 'container' })
                    : { tag: 'div', data: { ref: 'container' }, context: this };
            }
        }
    };

    // Svelte Bridge
    papyr.svelte = {
        /**
         * Svelte Action Mount Bridge
         * Usage in Svelte: <div use:papyr.svelte.mount={MyComponent} />
         */
        mount(node, component) {
            node.innerHTML = '';
            let rendered = typeof component === 'function' ? component() : component;
            if (rendered) {
                node.appendChild(rendered);
            }
            return {
                update(newComponent) {
                    node.innerHTML = '';
                    let newRendered = typeof newComponent === 'function' ? newComponent() : newComponent;
                    if (newRendered) {
                        node.appendChild(newRendered);
                    }
                },
                destroy() {
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(node);
                    }
                    node.innerHTML = '';
                }
            };
        }
    };

    // Next.js Bridge
    papyr.next = {
        /**
         * Next.js SSR and Hydration Element Wrapper
         */
        Bridge({ el, island = false, ...props }) {
            const React = window.React || (typeof require === 'function' ? require('react') : null);
            if (!React) return null;

            const ref = React.useRef(null);
            const [isClient, setIsClient] = React.useState(false);

            React.useEffect(() => {
                setIsClient(true);
            }, []);

            if (isClient) {
                React.useEffect(() => {
                    if (ref.current) {
                        if (island && papyr.ssr && typeof papyr.ssr.hydrate === 'function') {
                            papyr.ssr.hydrate(ref.current, el);
                        } else {
                            ref.current.innerHTML = '';
                            let element = typeof el === 'function' ? el() : el;
                            if (element) {
                                ref.current.appendChild(element);
                            }
                        }
                    }
                }, [el, island]);

                return React.createElement('div', Object.assign({ ref }, props));
            } else {
                let htmlString = '';
                if (papyr.ssr && typeof papyr.ssr === 'function') {
                    try {
                        let element = typeof el === 'function' ? el() : el;
                        htmlString = papyr.ssr(element);
                    } catch (e) {
                        console.error("Next.js SSR Bridge Error:", e);
                    }
                }
                return React.createElement('div', Object.assign({
                    dangerouslySetInnerHTML: { __html: htmlString }
                }, props));
            }
        }
    };

    // ==========================================
    // 8. MODULAR DATABASE ADAPTERS
    // ==========================================

    // Supabase Adapter
    papyr.db.registerSupabase = (config) => {
        if (!config || !config.url || !config.key) {
            console.error("PapyrDB [supabase]: Missing url or apikey in config.");
            return;
        }
        papyr.db.registerDriver('supabase', (collectionName) => {
            const baseUrl = `${config.url}/rest/v1/${collectionName}`;
            const headers = {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`,
                'Content-Type': 'application/json'
            };
            return {
                async getAsync() {
                    const res = await fetch(`${baseUrl}?select=*`, { headers });
                    return res.ok ? await res.json() : [];
                },
                async insertAsync(item) {
                    await fetch(baseUrl, {
                        method: 'POST',
                        headers: Object.assign({}, headers, { 'Prefer': 'return=representation' }),
                        body: JSON.stringify(item)
                    });
                },
                async updateAsync(id, updates) {
                    await fetch(`${baseUrl}?id=eq.${id}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(updates)
                    });
                },
                async deleteAsync(id) {
                    await fetch(`${baseUrl}?id=eq.${id}`, {
                        method: 'DELETE',
                        headers
                    });
                },
                async clearAsync() {
                    await fetch(baseUrl, {
                        method: 'DELETE',
                        headers
                    });
                }
            };
        });
    };

    // Firebase Adapter
    papyr.db.registerFirebase = (config) => {
        if (!config || !config.databaseURL) {
            console.error("PapyrDB [firebase]: Missing databaseURL in config.");
            return;
        }
        papyr.db.registerDriver('firebase', (collectionName) => {
            const url = `${config.databaseURL}/${collectionName}`;
            return {
                async getAsync() {
                    const res = await fetch(`${url}.json`);
                    if (!res.ok) return [];
                    const data = await res.json();
                    if (!data) return [];
                    return Object.entries(data).map(([id, val]) => (Object.assign({ id }, val)));
                },
                async insertAsync(item) {
                    await fetch(`${url}/${item.id}.json`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    });
                },
                async updateAsync(id, updates) {
                    await fetch(`${url}/${id}.json`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                },
                async deleteAsync(id) {
                    await fetch(`${url}/${id}.json`, {
                        method: 'DELETE'
                    });
                },
                async clearAsync() {
                    await fetch(`${url}.json`, {
                        method: 'DELETE'
                    });
                }
            };
        });
    };

    // Postgres Adapter
    papyr.db.registerPostgres = (config = {}) => {
        papyr.db.registerDriver('postgres', (collectionName) => {
            const gatewayUrl = config.gatewayUrl || `/api/db/${collectionName}`;
            return {
                async getAsync() {
                    const res = await fetch(gatewayUrl);
                    return res.ok ? await res.json() : [];
                },
                async insertAsync(item) {
                    await fetch(gatewayUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    });
                },
                async updateAsync(id, updates) {
                    await fetch(`${gatewayUrl}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                },
                async deleteAsync(id) {
                    await fetch(`${gatewayUrl}/${id}`, { method: 'DELETE' });
                },
                async clearAsync() {
                    await fetch(gatewayUrl, { method: 'DELETE' });
                }
            };
        });
    };

    // MySQL Adapter
    papyr.db.registerMysql = (config = {}) => {
        papyr.db.registerDriver('mysql', (collectionName) => {
            const gatewayUrl = config.gatewayUrl || `/api/db/${collectionName}`;
            return {
                async getAsync() {
                    const res = await fetch(gatewayUrl);
                    return res.ok ? await res.json() : [];
                },
                async insertAsync(item) {
                    await fetch(gatewayUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    });
                },
                async updateAsync(id, updates) {
                    await fetch(`${gatewayUrl}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                },
                async deleteAsync(id) {
                    await fetch(`${gatewayUrl}/${id}`, { method: 'DELETE' });
                },
                async clearAsync() {
                    await fetch(gatewayUrl, { method: 'DELETE' });
                }
            };
        });
    };

    // MongoDB Adapter
    papyr.db.registerMongodb = (config = {}) => {
        papyr.db.registerDriver('mongodb', (collectionName) => {
            const gatewayUrl = config.gatewayUrl || `/api/db/${collectionName}`;
            return {
                async getAsync() {
                    const res = await fetch(gatewayUrl);
                    return res.ok ? await res.json() : [];
                },
                async insertAsync(item) {
                    await fetch(gatewayUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    });
                },
                async updateAsync(id, updates) {
                    await fetch(`${gatewayUrl}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                },
                async deleteAsync(id) {
                    await fetch(`${gatewayUrl}/${id}`, { method: 'DELETE' });
                },
                async clearAsync() {
                    await fetch(gatewayUrl, { method: 'DELETE' });
                }
            };
        });
    };

})(typeof window !== 'undefined' ? window : this);
