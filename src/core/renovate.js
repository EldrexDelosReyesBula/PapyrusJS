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
