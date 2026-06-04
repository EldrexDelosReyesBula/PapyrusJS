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
