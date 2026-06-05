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
