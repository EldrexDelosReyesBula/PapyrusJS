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
            let config = Object.assign({
                gap: '24px'
            }, options);

            const isFold = papyr.state(false);

            if (typeof window !== 'undefined') {
                const checkFold = () => {
                    const hasSpanning = window.matchMedia('(spanning: single-fold-vertical)').matches || 
                                        window.matchMedia('(spanning: single-fold-horizontal)').matches;
                    // Dual screen detection fallback (simulating fold split on medium-sized landscape devices)
                    const isFoldDevice = hasSpanning || (window.innerWidth >= 768 && window.innerWidth < 1200 && window.innerWidth / window.innerHeight > 1.3);
                    isFold.value = isFoldDevice;
                };
                window.addEventListener('resize', checkFold);
                checkFold();
            }

            return papyr.div({
                class: 'papyr-foldable-layout',
                style: () => ({
                    display: 'grid',
                    gridTemplateColumns: isFold.value ? '1fr 1fr' : '1fr',
                    gap: config.gap,
                    width: '100%'
                })
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
        },

        gpu(options = {}, nodes = []) {
            const width = options.width || 800;
            const height = options.height || 600;
            
            const container = document.createElement('div');
            container.className = 'papyr-gpu-layout-container';
            container.style.position = 'relative';
            container.style.width = typeof width === 'number' ? `${width}px` : width;
            container.style.height = typeof height === 'number' ? `${height}px` : height;
            container.style.overflow = 'hidden';
            container.style.borderRadius = options.borderRadius || '12px';

            const glCanvas = document.createElement('canvas');
            glCanvas.width = typeof width === 'number' ? width : 800;
            glCanvas.height = typeof height === 'number' ? height : 600;
            glCanvas.style.position = 'absolute';
            glCanvas.style.left = '0';
            glCanvas.style.top = '0';
            glCanvas.style.width = '100%';
            glCanvas.style.height = '100%';
            container.appendChild(glCanvas);

            const textCanvas = document.createElement('canvas');
            textCanvas.width = glCanvas.width;
            textCanvas.height = glCanvas.height;
            textCanvas.style.position = 'absolute';
            textCanvas.style.left = '0';
            textCanvas.style.top = '0';
            textCanvas.style.width = '100%';
            textCanvas.style.height = '100%';
            textCanvas.style.pointerEvents = 'none';
            container.appendChild(textCanvas);

            const gl = glCanvas.getContext('webgl2', { alpha: true, antialias: true });
            const ctx2d = textCanvas.getContext('2d');

            const vsSource = `#version 300 es
            in vec2 position;
            in vec4 a_rect;
            in vec4 a_color;
            in vec4 a_borderColor;
            in vec4 a_border_radius_width;
            out vec2 v_localCoords;
            out vec2 v_size;
            out vec4 v_color;
            out vec4 v_borderColor;
            out float v_borderWidth;
            out float v_radius;
            uniform vec2 u_resolution;

            void main() {
                vec2 rectPos = a_rect.xy;
                vec2 rectSize = a_rect.zw;
                vec2 p = position * rectSize + rectPos;
                vec2 clipSpace = (p / u_resolution) * 2.0 - 1.0;
                gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);

                v_localCoords = (position - 0.5) * rectSize;
                v_size = rectSize;
                v_color = a_color;
                v_borderColor = a_borderColor;
                v_radius = a_border_radius_width.x;
                v_borderWidth = a_border_radius_width.y;
            }`;

            const fsSource = `#version 300 es
            precision highp float;
            in vec2 v_localCoords;
            in vec2 v_size;
            in vec4 v_color;
            in vec4 v_borderColor;
            in float v_borderWidth;
            in float v_radius;
            out vec4 outColor;

            float sdRoundedBox(vec2 p, vec2 b, float r) {
                vec2 q = abs(p) - b + vec2(r);
                return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
            }

            void main() {
                vec2 halfSize = v_size * 0.5;
                float d = sdRoundedBox(v_localCoords, halfSize, v_radius);
                float fillAlpha = 1.0 - smoothstep(-1.0, 1.0, d);
                
                vec4 col = v_color;
                if (v_borderWidth > 0.0) {
                    float borderDist = d + v_borderWidth;
                    float borderAlpha = smoothstep(-1.0, 1.0, d) - smoothstep(-1.0, 1.0, borderDist);
                    col = mix(v_color, v_borderColor, borderAlpha);
                }
                outColor = col;
                outColor.a *= fillAlpha;
                if (outColor.a == 0.0) discard;
            }`;

            let program, vao, instanceBuffer;
            let positionLoc, rectLoc, colorLoc, borderColorLoc, borderRadiusWidthLoc;

            if (gl) {
                const vs = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(vs, vsSource);
                gl.compileShader(vs);
                if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
                    console.error("VS compile error:", gl.getShaderInfoLog(vs));
                }

                const fs = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(fs, fsSource);
                gl.compileShader(fs);
                if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                    console.error("FS compile error:", gl.getShaderInfoLog(fs));
                }

                program = gl.createProgram();
                gl.attachShader(program, vs);
                gl.attachShader(program, fs);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error("Program link error:", gl.getProgramInfoLog(program));
                }

                gl.useProgram(program);
                const resLoc = gl.getUniformLocation(program, "u_resolution");
                gl.uniform2f(resLoc, glCanvas.width, glCanvas.height);

                vao = gl.createVertexArray();
                gl.bindVertexArray(vao);

                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                const vertices = new Float32Array([
                    0, 0,
                    1, 0,
                    0, 1,
                    0, 1,
                    1, 0,
                    1, 1
                ]);
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                
                positionLoc = gl.getAttribLocation(program, "position");
                gl.enableVertexAttribArray(positionLoc);
                gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

                instanceBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);

                const stride = 16 * 4;

                rectLoc = gl.getAttribLocation(program, "a_rect");
                gl.enableVertexAttribArray(rectLoc);
                gl.vertexAttribPointer(rectLoc, 4, gl.FLOAT, false, stride, 0);
                gl.vertexAttribDivisor(rectLoc, 1);

                colorLoc = gl.getAttribLocation(program, "a_color");
                gl.enableVertexAttribArray(colorLoc);
                gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, stride, 4 * 4);
                gl.vertexAttribDivisor(colorLoc, 1);

                borderColorLoc = gl.getAttribLocation(program, "a_borderColor");
                gl.enableVertexAttribArray(borderColorLoc);
                gl.vertexAttribPointer(borderColorLoc, 4, gl.FLOAT, false, stride, 8 * 4);
                gl.vertexAttribDivisor(borderColorLoc, 1);

                borderRadiusWidthLoc = gl.getAttribLocation(program, "a_border_radius_width");
                gl.enableVertexAttribArray(borderRadiusWidthLoc);
                gl.vertexAttribPointer(borderRadiusWidthLoc, 4, gl.FLOAT, false, stride, 12 * 4);
                gl.vertexAttribDivisor(borderRadiusWidthLoc, 1);
            }

            function solveLayout(node, parentX, parentY, parentW, parentH) {
                let solved = {
                    x: parentX + (node.x || 0),
                    y: parentY + (node.y || 0),
                    width: node.width || parentW,
                    height: node.height || parentH,
                    color: node.color || [0.1, 0.1, 0.1, 1],
                    borderColor: node.borderColor || [0, 0, 0, 0],
                    borderWidth: node.borderWidth || 0,
                    borderRadius: node.borderRadius || 0,
                    text: node.text || null,
                    textColor: node.textColor || [1, 1, 1, 1],
                    fontSize: node.fontSize || 14,
                    fontFamily: node.fontFamily || 'sans-serif'
                };

                let children = node.children || [];
                let solvedChildren = [];
                if (children.length > 0) {
                    const direction = node.direction || 'column';
                    const padding = node.padding || 0;
                    const gap = node.gap || 0;
                    
                    let curX = solved.x + padding;
                    let curY = solved.y + padding;
                    let innerW = solved.width - padding * 2;
                    let innerH = solved.height - padding * 2;

                    children.forEach(child => {
                        let childW = child.width || (direction === 'row' ? (innerW - gap * (children.length - 1)) / children.length : innerW);
                        let childH = child.height || (direction === 'column' ? (innerH - gap * (children.length - 1)) / children.length : innerH);
                        
                        let childSolved = solveLayout(child, curX, curY, childW, childH);
                        solvedChildren.push(childSolved);

                        if (direction === 'row') {
                            curX += childW + gap;
                        } else {
                            curY += childH + gap;
                        }
                    });
                }

                solved.solvedChildren = solvedChildren;
                return solved;
            }

            function flattenTree(solvedNode, list = []) {
                list.push(solvedNode);
                (solvedNode.solvedChildren || []).forEach(child => flattenTree(child, list));
                return list;
            }

            function render(nodesList = []) {
                const rootSolved = solveLayout({ children: nodesList }, 0, 0, glCanvas.width, glCanvas.height);
                const flatNodes = flattenTree(rootSolved).filter(n => n !== rootSolved);

                if (gl) {
                    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

                    const data = new Float32Array(flatNodes.length * 16);
                    for (let i = 0; i < flatNodes.length; i++) {
                        const n = flatNodes[i];
                        const offset = i * 16;
                        data[offset + 0] = n.x;
                        data[offset + 1] = n.y;
                        data[offset + 2] = n.width;
                        data[offset + 3] = n.height;
                        data[offset + 4] = n.color[0];
                        data[offset + 5] = n.color[1];
                        data[offset + 6] = n.color[2];
                        data[offset + 7] = n.color[3];
                        data[offset + 8] = n.borderColor[0];
                        data[offset + 9] = n.borderColor[1];
                        data[offset + 10] = n.borderColor[2];
                        data[offset + 11] = n.borderColor[3];
                        data[offset + 12] = n.borderRadius;
                        data[offset + 13] = n.borderWidth;
                        data[offset + 14] = 0;
                        data[offset + 15] = 0;
                    }

                    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

                    gl.useProgram(program);
                    gl.bindVertexArray(vao);
                    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, flatNodes.length);
                } else {
                    ctx2d.clearRect(0, 0, textCanvas.width, textCanvas.height);
                    flatNodes.forEach(n => {
                        ctx2d.fillStyle = `rgba(${n.color[0]*255}, ${n.color[1]*255}, ${n.color[2]*255}, ${n.color[3]})`;
                        ctx2d.fillRect(n.x, n.y, n.width, n.height);
                    });
                }

                ctx2d.clearRect(0, 0, textCanvas.width, textCanvas.height);
                flatNodes.forEach(n => {
                    if (n.text) {
                        ctx2d.fillStyle = `rgba(${n.textColor[0]*255}, ${n.textColor[1]*255}, ${n.textColor[2]*255}, ${n.textColor[3]})`;
                        ctx2d.font = `${n.fontSize}px ${n.fontFamily}`;
                        ctx2d.textBaseline = 'middle';
                        ctx2d.textAlign = 'center';
                        ctx2d.fillText(n.text, n.x + n.width / 2, n.y + n.height / 2);
                    }
                });
            }

            if (nodes && typeof nodes.subscribe === 'function') {
                const unsub = nodes.subscribe((latestNodes) => {
                    render(latestNodes);
                });
                if (!container._cleanups) container._cleanups = [];
                container._cleanups.push(unsub);
            } else {
                render(nodes);
            }

            if (options.responsive) {
                const ro = new ResizeObserver((entries) => {
                    for (let entry of entries) {
                        const w = entry.contentRect.width;
                        const h = entry.contentRect.height;
                        glCanvas.width = w;
                        glCanvas.height = h;
                        textCanvas.width = w;
                        textCanvas.height = h;
                        if (gl) {
                            gl.viewport(0, 0, w, h);
                            gl.useProgram(program);
                            const resLoc = gl.getUniformLocation(program, "u_resolution");
                            gl.uniform2f(resLoc, w, h);
                        }
                        render(nodes.value || nodes);
                    }
                });
                ro.observe(container);
                if (!container._cleanups) container._cleanups = [];
                container._cleanups.push(() => ro.disconnect());
            }

            return container;
        }
    };

    // Reactive Device Class State
    let currentDeviceClass = 'desktop';
    if (typeof window !== 'undefined') {
        const getDeviceClass = (width) => {
            if (width < 768) return 'mobile';
            if (width < 1024) return 'tablet';
            if (width < 1440) return 'laptop';
            return 'desktop';
        };
        currentDeviceClass = papyr.state(getDeviceClass(window.innerWidth));
        window.addEventListener('resize', () => {
            currentDeviceClass.value = getDeviceClass(window.innerWidth);
        });
    } else {
        currentDeviceClass = { value: 'desktop', subscribe: () => {} };
    }
    papyr.layout.deviceClass = currentDeviceClass;
})();
