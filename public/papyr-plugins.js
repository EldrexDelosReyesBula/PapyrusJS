/**
 * PAPER STATIC SITE LIBRARY - Decoupled Plugins Bundle
 * v3.0 - Official Capability Modules
 * Released under MIT License.
 */

(function(globalContext) {
    const papyr = typeof window !== 'undefined' ? window.papyr : (typeof global !== 'undefined' ? global.papyr : null);
    if (!papyr) {
        console.warn("Papyr core not detected. Plugins must be loaded after papyr core.");
        return;
    }

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


// --- MODULE: plugins/kernel-plugins.js ---
/**
 * PAPYR NATIVE KERNEL PLUGINS
 * 
 * Formal core plugins utilizing the kernel plugin lifecycle hooks:
 * 1. papyr-intent-engine: Supports intent-based cinematic styling configs and spring-physics button builders.
 * 2. papyr-self-heal: Spellchecks unknown HTML tags using Levenshtein distance, prints developer console warnings, and hooks global errors.
 * 3. papyr-accessibility-adapter: Automatically injects appropriate ARIA roles and keyboard accessibility support (tabIndex).
 * 4. papyr-energy-adapter: Links with the Papyr Power system to throttle animations and loop states during idle modes.
 */

(function(window) {
    // Helper to calculate Levenshtein distance (for local self-heal fallback)
    function levenshteinDistance(a, b) {
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
        return tmp[a.length][b.length];
    }

    // 1. Intent Engine Plugin
    const intentEnginePlugin = {
        name: 'papyr-intent-engine',
        version: '1.0.0',
        install(kernel) {
            // Register cinematic configs and theme scaffolding styles
            kernel.applyCinematic = (el, styleType) => {
                if (!el || !el.style) return;
                const configurations = {
                    hero: {
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)',
                        color: '#f8fafc',
                        padding: '120px 20px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    },
                    cinematic: {
                        background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                        color: '#38bdf8',
                        padding: '80px 40px',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        boxShadow: '0 0 40px rgba(56, 189, 248, 0.1)',
                        borderRadius: '24px'
                    },
                    focus: {
                        background: '#020617',
                        color: '#f1f5f9',
                        borderLeft: '4px solid #6366f1',
                        padding: '24px',
                        fontStyle: 'italic',
                        borderRadius: '0 8px 8px 0'
                    }
                };
                // eslint-disable-next-line security/detect-object-injection
                const styles = (styleType && styleType !== '__proto__' && styleType !== 'constructor' && styleType !== 'prototype' && Object.prototype.hasOwnProperty.call(configurations, styleType)) ? configurations[styleType] : undefined;
                if (styles) {
                    Object.assign(el.style, styles);
                }
            };

            // Dynamic spring physics-based button builder
            kernel.button = (...args) => {
                let processedArgs = [...args];
                let isSecondary = false;
                
                // If the first argument is a string and it is not a selector,
                // e.g. kernel.button("Click Me", options)
                // then swap them so text/child comes after options object
                if (args.length > 0 && typeof args[0] === 'string' && !args[0].startsWith('.') && !args[0].startsWith('#')) {
                    if (args.length === 1) {
                        processedArgs = [args[0]];
                    } else if (args.length === 2 && typeof args[1] === 'object' && args[1] !== null) {
                        processedArgs = [args[1], args[0]];
                        if (args[1].variant === 'secondary') isSecondary = true;
                    }
                } else if (args.length > 1 && typeof args[1] === 'object' && args[1] !== null) {
                    if (args[1].variant === 'secondary') isSecondary = true;
                }

                const btn = kernel('button', ...processedArgs);
                
                // Apply default styles if not already set on btn.style
                if (!btn.style.padding) btn.style.padding = '12px 24px';
                if (!btn.style.fontSize) btn.style.fontSize = '15px';
                if (!btn.style.fontWeight) btn.style.fontWeight = '600';
                if (!btn.style.borderRadius) btn.style.borderRadius = '8px';
                if (!btn.style.cursor) btn.style.cursor = 'pointer';
                if (!btn.style.outline) btn.style.outline = 'none';
                if (btn.style.border === undefined || btn.style.border === '') {
                    btn.style.border = isSecondary ? '1px solid rgba(255,255,255,0.2)' : 'none';
                }
                if (btn.style.background === undefined || btn.style.background === '') {
                    btn.style.background = isSecondary ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
                }
                if (!btn.style.color) btn.style.color = '#ffffff';
                if (!btn.style.transition) btn.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease, opacity 0.2s ease';
                if (btn.style.boxShadow === undefined || btn.style.boxShadow === '') {
                    btn.style.boxShadow = isSecondary ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)';
                }
                
                // Add scale & spring animations on mouse events
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'scale(1.05)';
                    if (!isSecondary) {
                        btn.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                    }
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'scale(1)';
                    if (!isSecondary) {
                        btn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                    }
                });
                btn.addEventListener('mousedown', () => {
                    btn.style.transform = 'scale(0.95)';
                });
                btn.addEventListener('mouseup', () => {
                    btn.style.transform = 'scale(1.05)';
                });
                
                return btn;
            };
        }
    };

    // 2. Self Heal Plugin
    const selfHealPlugin = {
        name: 'papyr-self-heal',
        version: '1.0.0',
        install(kernel) {
            // Listen to warning events from the kernel
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                window.addEventListener('papyr-warning', (e) => {
                    const { tag, suggestion } = e.detail;
                    const logMsg = `💡 [Self Heal Plugin] Corrective suggestion for tag <${tag}>: Use <${suggestion}> instead.`;
                    console.log(`%c ${logMsg} `, 'background: #10b981; color: white; border-radius: 4px; font-weight: bold; padding: 2px 4px;');
                    
                    // Push diagnostic info
                    kernel.diagnostics.errors.push({
                        type: 'self-heal-suggestion',
                        message: `Spellchecked unknown tag <${tag}>. Corrective suggestion: <${suggestion}>`,
                        timestamp: new Date().toISOString()
                    });
                });

                // Global window error safety reporting
                window.addEventListener('error', (e) => {
                    kernel.diagnostics.reportError(e.error || e.message);
                });
            }
        }
    };

    // 3. Accessibility Adapter Plugin
    const accessibilityAdapterPlugin = {
        name: 'papyr-accessibility-adapter',
        version: '1.0.0',
        hooks: {
            onRender(el) {
                if (!el || !el.tagName) return;
                const tag = el.tagName.toLowerCase();

                // 1. Add roles for button and links
                if (tag === 'button') {
                    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
                }
                
                // 2. Navigation containers
                if (el.classList && (el.classList.contains('navbar') || el.classList.contains('nav'))) {
                    if (!el.hasAttribute('role')) el.setAttribute('role', 'navigation');
                }

                // 3. Complementary sidebars
                if (el.classList && (el.classList.contains('sidebar') || el.classList.contains('aside'))) {
                    if (!el.hasAttribute('role')) el.setAttribute('role', 'complementary');
                }

                // 4. Ensure images have alt descriptions
                if (tag === 'img') {
                    if (!el.hasAttribute('alt')) {
                        el.setAttribute('alt', ''); // Empty alt to hide aesthetic images from screen readers
                    }
                }

                // 5. Interactive elements without standard focus
                if (el.hasAttribute('onclick') || (el.dataset && el.dataset.clickEvent)) {
                    if (tag !== 'button' && tag !== 'a' && tag !== 'input') {
                        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
                        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
                    }
                }
            }
        }
    };

    // 4. Energy Adapter Plugin
    const energyAdapterPlugin = {
        name: 'papyr-energy-adapter',
        version: '1.0.0',
        install(kernel) {
            // Integrate with kernel.power system to optimize execution pacing
            kernel.events.on('power-state-change', (newState) => {
                if (newState === 'idle') {
                    console.log("⚡ [Energy Adapter] Reducing UI update loops to idle pace.");
                } else if (newState === 'active') {
                    console.log("⚡ [Energy Adapter] Elevating UI performance to full capacity.");
                }
            });

            // Set up a loop listener to dynamically hook with papyr.power if it exists
            setTimeout(() => {
                if (kernel.power && kernel.power.state) {
                    kernel.power.state.subscribe((stateVal) => {
                        kernel.events.emit('power-state-change', stateVal);
                    });
                }
            }, 100);
        }
    };

    // Register all native plugins automatically if papyr library is loaded
    if (typeof window !== 'undefined') {
        window.papyrIntentEngine = intentEnginePlugin;
        window.papyrSelfHeal = selfHealPlugin;
        window.papyrAccessibilityAdapter = accessibilityAdapterPlugin;
        window.papyrEnergyAdapter = energyAdapterPlugin;

        // Auto-install to default global instance if present
        if (window.papyr && window.papyr.use) {
            window.papyr.use(intentEnginePlugin);
            window.papyr.use(selfHealPlugin);
            window.papyr.use(accessibilityAdapterPlugin);
            window.papyr.use(energyAdapterPlugin);
        }
    }

})(typeof window !== 'undefined' ? window : this);


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

        const anims = {};
        Object.entries(properties).forEach(([prop, targetVal]) => {
            if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') return;
            // eslint-disable-next-line security/detect-object-injection
            let currentVal = parseFloat(el.style[prop]) || 0;
            // eslint-disable-next-line security/detect-object-injection
            anims[prop] = {
                current: currentVal,
                velocity: 0,
                target: targetVal
            };
        });

        const step = () => {
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

                if (prop === 'scale') {
                    el.style.transform = `scale(${anim.current})`;
                } else if (['x', 'y'].includes(prop)) {
                    el.style.transform = `translate${prop.toUpperCase()}(${anim.current}px)`;
                } else if (prop !== '__proto__' && prop !== 'constructor' && prop !== 'prototype') {
                    // eslint-disable-next-line security/detect-object-injection
                    el.style[prop] = prop === 'opacity' ? anim.current : `${anim.current}px`;
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
        const { onSwipeLeft, onSwipeRight, onDrag } = options;
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
            el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            if (currentX > 100 && onSwipeRight) {
                onSwipeRight(el);
            } else if (currentX < -100 && onSwipeLeft) {
                onSwipeLeft(el);
            } else {
                el.style.transform = 'translate(0px, 0px)';
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

    // PAPER PARALLAX ENGINE
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

    // PAPER PHYSICS ENGINE
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


// --- MODULE: plugins/browser-api.js ---
/**
 * PAPYR NATIVE BROWSER APIs
 * Simplifies access to native device hardware and browser APIs.
 */
(function() {
    papyr.clipboard = {
        async copy(text) {
            try {
                await navigator.clipboard.writeText(text);
                papyr.log("Copied to clipboard:", text);
            } catch (err) {
                papyr.warn("Failed to copy to clipboard", err);
            }
        },
        async read() {
            try {
                return await navigator.clipboard.readText();
            } catch (err) {
                papyr.warn("Failed to read from clipboard", err);
                return "";
            }
        }
    };

    papyr.location = {
        get() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("Geolocation is not supported by your browser"));
                } else {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                }
            });
        }
    };

    papyr.camera = {
        _stream: null,
        async open(videoElementId = null) {
            try {
                this._stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoElementId) {
                    const videoEl = document.getElementById(videoElementId);
                    if (videoEl) {
                        videoEl.srcObject = this._stream;
                        videoEl.play();
                    }
                }
                return this._stream;
            } catch (err) {
                papyr.warn("Camera access denied or unavailable", err);
                throw err;
            }
        },
        stop() {
            if (this._stream) {
                this._stream.getTracks().forEach(track => track.stop());
                this._stream = null;
            }
        }
    };

    papyr.vibrate = (pattern) => {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    papyr.browser = {
        geolocation() {
            return papyr.location.get();
        },
        clipboard() {
            return papyr.clipboard.read();
        }
    };
})();


// --- MODULE: plugins/pwa.js ---
/**
 * PAPYR PWA ENGINE
 * One-line registration and automatic offline caching for Progressive Web Apps.
 * Caches core bundles like papyr-complete.js to browser Cache Storage and IndexedDB
 * to allow smooth offline execution without full library downloads.
 */
(function() {
    papyr.pwa = {
        /**
         * Initialize PWA registers and offline cachers.
         * 
         * @param {Object} options Configuration parameters
         * @param {string} options.swPath Path to the service worker script (default: '/sw.js')
         * @param {string} options.cacheName Cache name for core assets (default: 'papyr-pwa-cache')
         * @param {Array<string>} options.assets Specific resource URLs to cache offline
         */
        async init(options = {}) {
            const cacheName = options.cacheName || 'papyr-pwa-cache';
            const defaultSwPath = options.swPath || '/sw.js';
            
            // Auto-detect and compile files to cache offline
            const assetsToCache = Array.isArray(options.assets) ? [...options.assets] : [];
            
            // Add current origin path
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname || '/';
                if (!assetsToCache.includes(currentPath)) {
                    assetsToCache.push(currentPath);
                }
                if (!assetsToCache.includes(window.location.href)) {
                    assetsToCache.push(window.location.href);
                }
                
                // Automatically discover and cache any loaded Papyr libraries
                if (typeof document !== 'undefined') {
                    const scripts = Array.from(document.querySelectorAll('script'));
                    scripts.forEach(script => {
                        const src = script.src;
                        if (src && (src.includes('papyr') || src.includes('papyr-complete') || src.includes('papyr-plugins'))) {
                            if (!assetsToCache.includes(src)) {
                                assetsToCache.push(src);
                            }
                        }
                    });
                }
            }

            // 1. Cache Storage offline synchronization
            if (typeof window !== 'undefined' && 'caches' in window) {
                try {
                    const cache = await window.caches.open(cacheName);
                    // Filter and deduplicate to valid HTTP/HTTPS endpoints to prevent local file protocol failures and duplicate requests error
                    const resolvedUrls = [];
                    assetsToCache.forEach(url => {
                        try {
                            const resolved = new URL(url, window.location.href);
                            if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
                                resolvedUrls.push(resolved.href);
                            }
                        } catch (e) {
                            // ignore invalid URLs
                        }
                    });
                    const uniqueUrls = Array.from(new Set(resolvedUrls));
                    await Promise.allSettled(uniqueUrls.map(url => cache.add(url).catch(err => {
                        console.warn(`[PWA Cache] Failed to cache URL: ${url}`, err);
                    })));
                    papyr.log('PWA: Successfully pre-cached core assets offline including library bundles.');
                } catch(err) {
                    papyr.warn('PWA Cache storage warning (skipping local file protocols):', err);
                }
            }

            // 2. IndexedDB secondary offline replication
            if (typeof window !== 'undefined' && 'indexedDB' in window) {
                try {
                    const dbRequest = window.indexedDB.open("papyr_pwa_db", 1);
                    dbRequest.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains("assets")) {
                            db.createObjectStore("assets", { keyPath: "url" });
                        }
                    };
                    dbRequest.onsuccess = (e) => {
                        const db = e.target.result;
                        
                        const resolvedUrls = [];
                        assetsToCache.forEach(url => {
                            try {
                                const resolved = new URL(url, window.location.href);
                                if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
                                    resolvedUrls.push(resolved.href);
                                }
                            } catch (err) {}
                        });
                        const uniqueUrls = Array.from(new Set(resolvedUrls));

                        uniqueUrls.forEach(async (url) => {
                            try {
                                const response = await fetch(url);
                                if (!response.ok) return;
                                const blob = await response.blob();
                                const tx = db.transaction("assets", "readwrite");
                                const store = tx.objectStore("assets");
                                store.put({ url, content: blob, timestamp: Date.now() });
                            } catch(fetchErr) {}
                        });
                    };
                } catch(idbErr) {
                    papyr.warn('PWA IndexedDB storage warning:', idbErr);
                }
            }

            // 3. Service Worker registration
            if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register(defaultSwPath);
                    papyr.log('PWA ServiceWorker Registration successful with scope:', registration.scope);
                } catch (err) {
                    papyr.warn('PWA ServiceWorker registration failed/skipped (requires active web origin):', err);
                }
            } else {
                papyr.warn('PWA ServiceWorkers are not supported in this environment.');
            }
        }
    };
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
})();


// --- MODULE: plugins/power.js ---
/**
 * PAPYR POWER SYSTEM
 * Energy-Aware, Performance-First state management and rendering throttler.
 * Coordinates user interaction states, page visibility, and loop pacing natively.
 */
(function(window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading power plugins.");
        return;
    }

    const papyr = window.papyr;

    // 1. Setup reactive power states
    const powerState = papyr.state('active'); // 'active', 'idle', 'suspended'
    const powerFps = papyr.state(60);         // Reactive FPS diagnostic

    let idleTimeout = null;
    const IDLE_DELAY_MS = 10000;              // 10 seconds to trigger idle throttling

    // 2. Activity monitor triggers
    const resetIdleTimer = () => {
        if (powerState.value === 'suspended') return; // Do not wake up if tab is backgrounded
        
        if (powerState.value !== 'active') {
            powerState.value = 'active';
            powerFps.value = 60;
        }

        if (idleTimeout) clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            if (powerState.value === 'active') {
                powerState.value = 'idle';
                powerFps.value = 10;
            }
        }, IDLE_DELAY_MS);
    };

    // 3. Mount global event listeners safely (with passive: true to prevent frame drops)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
        events.forEach(evt => {
            window.addEventListener(evt, resetIdleTimer, { passive: true });
        });

        // Background / Visibility change listeners
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                powerState.value = 'suspended';
                powerFps.value = 0;
                if (idleTimeout) clearTimeout(idleTimeout);
            } else {
                resetIdleTimer();
            }
        });

        // Initialize first idle timer
        resetIdleTimer();
    }

    // 4. Power Engine API Exports
    papyr.power = {
        state: powerState,
        fps: powerFps,
        
        /**
         * Reset the idle timer manually (e.g. during custom script interactions)
         */
        activity() {
            resetIdleTimer();
        },

        /**
         * Wraps an animation loop or heavy computation function.
         * Automatically throttles pacing to conserve CPU, RAM, and battery.
         * 
         * @param {function} callback Rendering loop callback to execute
         * @returns {function} Cleanup hook to completely unsubscribe the loop
         */
        throttle(callback) {
            let active = true;
            
            const tick = () => {
                if (!active) return;

                const currentState = powerState.value;
                if (currentState === 'suspended') {
                    // Suspended completely. Return and wait for visibility change to re-trigger.
                    return;
                }

                if (currentState === 'idle') {
                    // Idle state: Throttle to ~10 FPS (100ms pacing)
                    setTimeout(() => {
                        if (active && powerState.value === 'idle') {
                            callback();
                            requestAnimationFrame(tick);
                        } else if (active) {
                            requestAnimationFrame(tick);
                        }
                    }, 100);
                    return;
                }

                // Active state: Full 60 FPS standard pacing
                callback();
                requestAnimationFrame(tick);
            };

            // Re-trigger loop if transitioning from suspended/idle to active
            const unsubscribe = powerState.subscribe((state) => {
                if (state === 'active' && active) {
                    requestAnimationFrame(tick);
                }
            });

            // Start loop execution
            requestAnimationFrame(tick);

            // Return unsubscribe cleanup hook
            return () => {
                active = false;
                unsubscribe();
            };
        }
    };
})(typeof window !== 'undefined' ? window : this);


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

        // Mount hook
        setTimeout(() => {
            resize();
            initParticles();
            window.addEventListener('resize', () => { resize(); initParticles(); });
            
            if (papyr.power && typeof papyr.power.throttle === 'function') {
                stopThrottle = papyr.power.throttle(render);
            } else {
                const legacyLoop = () => {
                    render();
                    requestAnimationFrame(legacyLoop);
                };
                requestAnimationFrame(legacyLoop);
            }
        }, 50);

        return canvas;
    };
})();


// --- MODULE: plugins/ui-components.js ---
/**
 * PAPYR UI COMPONENTS
 * Cinematic, interactive UI elements (Toasts, Modals, Sheets).
 */
(function() {
    // 1. Toast System (Canonical Passthrough)
    papyr.toast = papyr.toast;

    // 2. Modal System (Canonical Passthrough)
    papyr.modal = papyr.modal;

    // 3. Mobile Bottom Sheet
    papyr.sheet = (options = {}) => {
        const { content = '' } = options;
        // Re-use modal overlay logic but with bottom-anchored sliding physics
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
            // Drag Handle
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
})();


// --- MODULE: plugins/watt.js ---
/**
 * PAPYR WATT SYSTEM (Web App Tracking Transparency)
 * 
 * Hard runtime gatekeeper that intercepts browser tracking and hardware APIs at the kernel level.
 * Pops up a custom, accessible glassmorphic consent dashboard before native browser triggers execute.
 */

(function () {
    // Check if papyr exists
    if (typeof papyr === 'undefined') {
        console.warn("Papyr core not detected. WATT requires papyr core to run.");
        return;
    }

    const PapyrWatt = {
        _originalApis: {
            geolocation: typeof navigator !== 'undefined' && navigator.geolocation ? navigator.geolocation.getCurrentPosition : null,
            getUserMedia: typeof navigator !== 'undefined' && navigator.mediaDevices ? navigator.mediaDevices.getUserMedia : null
        },

        // Global developer custom configuration state
        config: {
            branding: { title: "Privacy Guard", primaryColor: "#6366f1" },
            reason: "This app requires secure access to fulfill its baseline function.",
            labels: { accept: "Allow Access", deny: "Ask App Not to Track", linkText: "Learn more about our privacy commitment" },
            link: "https://eldrex.landecs.org/privacy"
        },

        configure(customSettings) {
            if (customSettings && typeof customSettings === 'object') {
                if (customSettings.branding) {
                    this.config.branding = { ...this.config.branding, ...customSettings.branding };
                }
                if (customSettings.labels) {
                    this.config.labels = { ...this.config.labels, ...customSettings.labels };
                }
                if (customSettings.reason) this.config.reason = customSettings.reason;
                if (customSettings.link) this.config.link = customSettings.link;
            }
        },

        setTier(tier) {
            if (papyr.security && typeof papyr.security.setTier === 'function') {
                papyr.security.setTier(tier);
            }
        },

        getTier() {
            return papyr.security ? papyr.security.currentTier : 'default';
        },

        hasConsent() {
            return papyr.security ? papyr.security.hasConsent : false;
        },

        // Injects the global interception wrappers from day one
        enforce() {
            if (typeof navigator === 'undefined') return;

            // 1. Geolocation Interception
            if (navigator.geolocation && this._originalApis.geolocation) {
                const self = this;
                navigator.geolocation.getCurrentPosition = function (successCb, errorCb, options) {
                    self.triggerWattPrompt("Location Data", () => {
                        self._originalApis.geolocation.call(navigator.geolocation, successCb, errorCb, options);
                    }, () => {
                        if (errorCb) errorCb({ code: 1, message: "User denied Geolocation through WATT." });
                    });
                };
            }

            // 2. Camera & Microphone getUserMedia Interception
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && this._originalApis.getUserMedia) {
                const self = this;
                navigator.mediaDevices.getUserMedia = function (constraints) {
                    return new Promise((resolve, reject) => {
                        self.triggerWattPrompt("Camera & Microphone Access", () => {
                            self._originalApis.getUserMedia.call(navigator.mediaDevices, constraints)
                                .then(resolve)
                                .catch(reject);
                        }, () => {
                            reject(new DOMException("Permission denied by user through WATT.", "NotAllowedError"));
                        });
                    });
                };
            }
        },

        triggerWattPrompt(capabilityName, onAllow, onDeny) {
            console.log(`[WATT Alert]: Intercepted unauthorized request for: ${capabilityName}`);
            if (typeof document === 'undefined') {
                onDeny();
                return;
            }

            // Construct the modal dynamically utilizing standard Papyr UI tags
            const wattModal = papyr.div('.papyr-card.papyr-watt-box', {
                role: 'dialog',
                'aria-modal': 'true',
                style: `
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    z-index: 99999; max-width: 400px; width: 90%;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid ${this.config.branding.primaryColor}33;
                    border-radius: 24px;
                    padding: 28px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                    box-sizing: border-box;
                    color: #fff;
                    font-family: inherit;
                `
            },
                papyr.h3(`🔒 ${this.config.branding.title}`, { style: "font-size: 20px; margin-bottom: 12px; font-weight: 700; color: #fff;" }),
                papyr.muted(`wants to access your **${capabilityName}**. ${this.config.reason}`, { style: "color: #cbd5e1; font-size: 0.95rem; line-height: 1.5;" }),

                papyr.flex.row({ style: "margin-top: 24px; justify-content: flex-end; gap: 12px;" },
                    papyr.button(this.config.labels.deny, {
                        style: "background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); padding: 10px 18px; border-radius: 12px; cursor: pointer; font-family: inherit;",
                        onclick: () => { wattModal.remove(); onDeny(); }
                    }),
                    papyr.button(this.config.labels.accept, {
                        style: `background: ${this.config.branding.primaryColor}; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; cursor: pointer; font-weight: bold; font-family: inherit;`,
                        onclick: () => { wattModal.remove(); onAllow(); }
                    })
                ),

                papyr.div({ style: "margin-top: 16px; text-align: center;" },
                    papyr.a(this.config.labels.linkText, {
                        href: this.config.link,
                        target: "_blank",
                        style: "font-size: 11px; color: #94a3b8; text-decoration: underline;"
                    })
                )
            );

            document.body.appendChild(wattModal);
        },

        requestTracking(options = {}) {
            const { purpose = "We use data to personalize your experience and keep this app free.", onAllow = () => { }, onDeny = () => { } } = options;

            const currentTier = this.getTier();
            if (currentTier === 'none') {
                if (papyr.security) papyr.security.setConsent(true);
                onAllow();
                return Promise.resolve(true);
            }

            if (currentTier === 'high') {
                if (papyr.security) {
                    papyr.security.setConsent(false);
                    papyr.security.blockThirdPartyScripts();
                }
                onDeny();
                return Promise.resolve(false);
            }

            return new Promise((resolve) => {
                this.triggerWattPrompt("Personalization Data Usage", () => {
                    if (papyr.security) papyr.security.setConsent(true);
                    onAllow();
                    resolve(true);
                }, () => {
                    if (papyr.security) {
                        papyr.security.setConsent(false);
                        papyr.security.blockThirdPartyScripts();
                    }
                    onDeny();
                    resolve(false);
                });
            });
        }
    };

    // Initialize enforcement immediately on library boot
    PapyrWatt.enforce();

    // Export WATT as a global on papyr
    papyr.watt = PapyrWatt;

    // Process any initial privacy settings set prior to WATT initialization
    if (papyr._initialPrivacy) {
        papyr.watt.setTier(papyr._initialPrivacy);
        delete papyr._initialPrivacy;
    }
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
            if (config.depth) {
                window.addEventListener('mousemove', (e) => {
                    mouseX = (e.clientX / window.innerWidth) - 0.5;
                    mouseY = (e.clientY / window.innerHeight) - 0.5;
                });
            }

            const clock = new THREE.Clock();
            const tick = () => {
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
                requestAnimationFrame(tick);
            };
            tick();

            // Resize support
            window.addEventListener('resize', () => {
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

        // Trace pointer coordinates for micro-smooth inertia panning depth
        if (config.depth) {
            window.addEventListener('mousemove', (e) => {
                mouseX = (e.clientX / window.innerWidth) - 0.5;
                mouseY = (e.clientY / window.innerHeight) - 0.5;
            });
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

            requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);

        // Resize support
        window.addEventListener('resize', () => {
            const parent = canvas.parentElement;
            if (parent) {
                w = parent.clientWidth;
                h = parent.clientHeight;
                canvas.width = w;
                canvas.height = h;
                initParticles();
            }
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


// --- MODULE: plugins/integrations.js ---
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

})(typeof window !== 'undefined' ? window : this);


// --- MODULE: plugins/system.js ---
/**
 * PAPYR SYSTEM & SANDBOX ACCESS ENGINE
 * Unified, zero-dependency sandboxed interface for File System, Clipboard, notifications, Bluetooth, and WebUSB.
 * v3.0 - Modern showOpenFilePicker wrappers, local download fallbacks, and OS system integrations.
 */
(function (window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading system plugins.");
        return;
    }

    const papyr = window.papyr;

    // ==========================================
    // 1. FILE SYSTEM SANDBOX ACCESS (papyr.fs)
    // ==========================================
    papyr.fs = {
        /**
         * Open a sandboxed file from the user's system.
         * Leverages high-performance showOpenFilePicker if supported, falling back gracefully to transient inputs.
         */
        open(options = {}) {
            const config = Object.assign({
                multiple: false,
                acceptText: false,
                types: []
            }, options);

            return new Promise((resolve, reject) => {
                // If modern File System Access API is supported
                if (typeof window !== 'undefined' && window.showOpenFilePicker) {
                    window.showOpenFilePicker({
                        multiple: config.multiple,
                        types: config.types
                    }).then(handles => {
                        const filesPromises = handles.map(h => h.getFile());
                        Promise.all(filesPromises).then(files => {
                            if (config.acceptText) {
                                const textPromises = files.map(f => f.text());
                                Promise.all(textPromises).then(texts => {
                                    resolve(config.multiple ? texts : texts[0]);
                                }).catch(reject);
                            } else {
                                resolve(config.multiple ? files : files[0]);
                            }
                        }).catch(reject);
                    }).catch(reject);
                } else {
                    // Fallback to transient input element
                    if (typeof document === 'undefined') {
                        return reject(new Error("DOM document required for file dialog fallback."));
                    }
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = config.multiple;

                    input.onchange = () => {
                        if (!input.files || input.files.length === 0) {
                            return reject(new Error("No files selected."));
                        }
                        const files = Array.from(input.files);
                        if (config.acceptText) {
                            const readerPromises = files.map(file => {
                                return new Promise((res, rej) => {
                                    const reader = new FileReader();
                                    reader.onload = () => res(reader.result);
                                    reader.onerror = () => rej(reader.error);
                                    reader.readAsText(file);
                                });
                            });
                            Promise.all(readerPromises).then(texts => {
                                resolve(config.multiple ? texts : texts[0]);
                            }).catch(reject);
                        } else {
                            resolve(config.multiple ? files : files[0]);
                        }
                    };
                    input.click();
                }
            });
        },

        /**
         * Saves string or blob contents by triggering a secure local browser download.
         */
        save(content, filename = 'document.txt', type = 'text/plain') {
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                console.log(`[papyr.fs.save] Non-browser context saving: ${filename} (${type})`);
                return Promise.resolve(content);
            }

            try {
                const blob = content instanceof Blob ? content : new Blob([content], { type: type });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);

                return Promise.resolve(filename);
            } catch (e) {
                return Promise.reject(e);
            }
        }
    };

    // ==========================================
    // 2. SYSTEM OS INTERACTIONS (papyr.system)
    // ==========================================
    papyr.system = {
        /**
         * Dynamic openFile picker mapping directly to papyr.fs.open.
         */
        openFile(options = {}) {
            return papyr.fs.open(options);
        },

        /**
         * Issues native OS system notifications with permissions checks.
         */
        notify(titleOrMsg, options = {}) {
            let title = titleOrMsg;
            let config = options;
            
            // Single-argument shorthand support: papyr.system.notify("My text notification")
            if (typeof titleOrMsg === 'string' && Object.keys(options).length === 0) {
                title = "Notification";
                config = { body: titleOrMsg };
            }

            if (typeof window === 'undefined' || !('Notification' in window)) {
                console.log(`[papyr.system.notify] ${title}: ${config.body || ''}`);
                return Promise.resolve(false);
            }

            const finalConfig = Object.assign({
                body: '',
                icon: ''
            }, config);

            return new Promise((resolve) => {
                if (Notification.permission === 'granted') {
                    new Notification(title, finalConfig);
                    resolve(true);
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification(title, finalConfig);
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                } else {
                    resolve(false);
                }
            });
        },

        // Unified System Clipboard Wrapper
        clipboard: {
            copy(text) {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    return navigator.clipboard.writeText(text);
                }
                return Promise.reject(new Error("Navigator Clipboard API not supported."));
            },
            paste() {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    return navigator.clipboard.readText();
                }
                return Promise.reject(new Error("Navigator Clipboard API not supported."));
            }
        },

        // Unified Sandbox Hardware Connectors
        devices: {
            bluetooth() {
                if (typeof navigator !== 'undefined' && navigator.bluetooth) {
                    return navigator.bluetooth.getAvailability();
                }
                return Promise.resolve(false);
            },
            usb() {
                if (typeof navigator !== 'undefined' && navigator.usb) {
                    return navigator.usb.getDevices();
                }
                return Promise.resolve([]);
            }
        }
    };

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
                            // eslint-disable-next-line security/detect-object-injection
                            const type = schema[key];
                            let val = null;
                            if (type === 'number') {
                                // Sanitize key to completely eliminate any possibility of ReDoS
                                const safeKey = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                // eslint-disable-next-line security/detect-non-literal-regexp
                                const numRegex = new RegExp(`(?:${safeKey}\\b.*?|\\b)(\\d+)(?:\\s*(?:years|yr|s)?\\b|$)`, 'i');
                                const m = input.match(numRegex);
                                if (m) {
                                    val = Number(m[1]);
                                } else {
                                    const anyNum = input.match(/\d+/);
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
                            // eslint-disable-next-line security/detect-object-injection
                            result[key] = val;
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

                /**
                 * Unified AI Provider interface mapping OpenAI, Anthropic, Gemini, and Ollama endpoints.
                 * Enforces strict real-world connections, API key validations, and secure data privacy protocols.
                 */
                chat(options = {}) {
                    const provider = (options.provider || 'openai').toLowerCase();
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

                    // Real integration logic
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
                        let parsedText = '';
                        if (provider === 'openai' || provider === 'ollama') {
                            parsedText = data.choices ? data.choices[0].message.content : (data.message ? data.message.content : '');
                        } else if (provider === 'anthropic') {
                            parsedText = data.content ? data.content[0].text : '';
                        } else if (provider === 'gemini') {
                            parsedText = (data.candidates && data.candidates[0].content) ? data.candidates[0].content.parts[0].text : '';
                        }
                        return {
                            text: parsedText,
                            provider: provider,
                            simulated: false,
                            raw: data
                        };
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
        const range = options.range || [-10, 10, -5, 5];
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
                    const cleanEq = equation.replace(/sin/g, 'Math.sin')
                                            .replace(/cos/g, 'Math.cos')
                                            .replace(/tan/g, 'Math.tan')
                                            .replace(/pi/g, 'Math.PI')
                                            .replace(/exp/g, 'Math.exp')
                                            .replace(/pow/g, 'Math.pow');
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
                graph(optionsOrCanvas = {}, equationStr) {
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
                        drawOptions = typeof equationStr === 'object' ? equationStr : { equation: equationStr };
                        
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



    console.log("📄 Papyr plugins loaded and registered successfully!");
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
