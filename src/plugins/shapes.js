/**
 * PAPYR SHAPES SYSTEM (Papyrus Shapes Engine — PSE)
 * Package: @papyr/shapes
 * Premium, customizable mathematical shape generators with elastic morph, 3D CSS rendering, and built-in physics.
 */
(function(window) {
    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
    if (!targetPapyr) {
        console.warn("Papyr core not found. Load papyr.js before loading shapes.");
        return;
    }

    const papyr = targetPapyr;

    // Helper: Generate Blob Path
    function createBlobPath(rad, points, offset) {
        const angleStep = (Math.PI * 2) / points;
        const pathPoints = [];
        for (let i = 0; i < points; i++) {
            const theta = i * angleStep;
            const r = rad + offset[i];
            const x = rad + r * Math.cos(theta);
            const y = rad + r * Math.sin(theta);
            pathPoints.push({ x, y });
        }
        let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
        for (let i = 0; i < points; i++) {
            const p1 = pathPoints[i];
            const p2 = pathPoints[(i + 1) % points];
            const xc = (p1.x + p2.x) / 2;
            const yc = (p1.y + p2.y) / 2;
            d += ` Q ${p1.x} ${p1.y}, ${xc} ${yc}`;
        }
        d += " Z";
        return d;
    }

    // Helper: Dynamic Keyframes Injection
    function injectKeyframe(name, rules) {
        if (typeof document === 'undefined') return;
        const styleId = `papyr-keyframe-${name}`;
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `@keyframes ${name} { ${rules} }`;
        document.head.appendChild(style);
    }

    // Helper: Apply CSS Animation
    function applyAnimation(el, type) {
        if (!el || !type) return;
        let animStyle = '';
        if (type === 'pulse') {
            animStyle = 'papyr-pulse 2s ease-in-out infinite';
            injectKeyframe('papyr-pulse', '0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); }');
        } else if (type === 'float') {
            animStyle = 'papyr-float 3s ease-in-out infinite';
            injectKeyframe('papyr-float', '0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); }');
        } else if (type === 'spin' || type === 'rotate') {
            animStyle = 'papyr-spin 6s linear infinite';
            injectKeyframe('papyr-spin', 'from { transform: rotate(0deg); } to { transform: rotate(360deg); }');
        } else if (type === 'bounce') {
            animStyle = 'papyr-bounce 2s ease infinite';
            injectKeyframe('papyr-bounce', '0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-20px); } 60% { transform: translateY(-10px); }');
        }
        if (animStyle) {
            el.style.animation = animStyle;
        }
    }

    // Helper: Annotate elements for Studio SDK editing
    function annotateSDK(el, type, options) {
        if (!el) return;
        el.setAttribute('data-papyr-type', type);
        el.setAttribute('data-papyr-editor', 'shapes');
        if (options && typeof options === 'object') {
            el.setAttribute('data-papyr-options', JSON.stringify(Object.keys(options).reduce((acc, k) => {
                if (typeof options[k] !== 'function' && typeof options[k] !== 'object') {
                    acc[k] = options[k];
                }
                return acc;
            }, {})));
        }
    }

    const shapesPlugin = {
        name: 'papyr-shapes',
        version: '3.1.2',
        install(papyr) {
            
            // ==========================================
            // 1. BASIC GEOMETRY
            // ==========================================

            papyr.rect = (options = {}) => {
                const { width = 200, height = 100, color = 'var(--papyr-primary)', rx = 0, ry = 0, style = {}, class: className = '', animate = null } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${className}" style="overflow: visible;">
                        <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${ry}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('rect') || svgEl, animate);
                annotateSDK(svgEl, 'rect', options);
                return svgEl;
            };

            papyr.circle = (options = {}) => {
                const { radius = 50, color = 'var(--papyr-primary)', style = {}, class: className = '', animate = null } = options;
                const size = radius * 2;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}" style="overflow: visible;">
                        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('circle') || svgEl, animate);
                annotateSDK(svgEl, 'circle', options);
                return svgEl;
            };

            papyr.triangle = (options = {}) => {
                const { size = 100, color = 'var(--papyr-primary)', style = {}, class: className = '', animate = null } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}" style="overflow: visible;">
                        <polygon points="${size / 2},0 0,${size} ${size},${size}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('polygon') || svgEl, animate);
                annotateSDK(svgEl, 'triangle', options);
                return svgEl;
            };

            papyr.ellipse = (options = {}) => {
                const { rx = 120, ry = 60, color = 'var(--papyr-primary)', style = {}, class: className = '', animate = null } = options;
                const w = rx * 2;
                const h = ry * 2;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="${className}" style="overflow: visible;">
                        <ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('ellipse') || svgEl, animate);
                annotateSDK(svgEl, 'ellipse', options);
                return svgEl;
            };

            papyr.polygon = (sidesOrOptions = 5, options = {}) => {
                let sides = 5;
                let opt = options;
                if (typeof sidesOrOptions === 'object') {
                    opt = sidesOrOptions;
                    sides = opt.sides || 5;
                } else if (typeof sidesOrOptions === 'number') {
                    sides = sidesOrOptions;
                }
                const { size = 150, color = 'var(--papyr-primary)', style = {}, class: className = '', animate = false, speed = 0.02 } = opt;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}">
                        <polygon fill="${color}" />
                    </svg>
                `).firstElementChild;
                const poly = svgEl.querySelector('polygon');
                const radius = size / 2;
                const cx = size / 2;
                const cy = size / 2;
                let rotation = 0;
                const updatePoints = () => {
                    let points = [];
                    for (let i = 0; i < sides; i++) {
                        let angle = (i * 2 * Math.PI) / sides + rotation;
                        let x = cx + radius * Math.cos(angle);
                        let y = cy + radius * Math.sin(angle);
                        points.push(`${x},${y}`);
                    }
                    poly.setAttribute('points', points.join(' '));
                };
                updatePoints();
                if (animate === 'spin' || animate === true) {
                    let animId = null;
                    const loop = () => {
                        if (typeof document !== 'undefined' && !document.body.contains(svgEl)) {
                            if (animId) cancelAnimationFrame(animId);
                            return;
                        }
                        rotation += speed;
                        updatePoints();
                        animId = requestAnimationFrame(loop);
                    };
                    animId = requestAnimationFrame(loop);
                    if (!svgEl._cleanups) svgEl._cleanups = [];
                    svgEl._cleanups.push(() => {
                        if (animId) cancelAnimationFrame(animId);
                    });
                } else if (animate) {
                    applyAnimation(svgEl.querySelector('polygon') || svgEl, animate);
                }
                if (style) Object.assign(svgEl.style, style);
                annotateSDK(svgEl, 'polygon', opt);
                return svgEl;
            };

            // ==========================================
            // 2. LINE SYSTEM & CURVES
            // ==========================================

            papyr.line = (options = {}) => {
                const { x1 = 0, y1 = 0, x2 = 300, y2 = 300, color = 'var(--papyr-primary)', width = 2, dash = false, style = {}, class: className = '', animate = null } = options;
                const isDotted = options.style === 'dotted' || options.dotted === true;
                const isDashed = dash || options.dashed === true;
                const strokeDashArray = isDotted ? '2,5' : (isDashed ? '8,5' : 'none');
                const strokeLineCap = isDotted ? 'round' : 'square';
                
                const minX = Math.min(x1, x2);
                const maxX = Math.max(x1, x2);
                const minY = Math.min(y1, y2);
                const maxY = Math.max(y1, y2);
                const containerW = Math.max(maxX - minX, width);
                const containerH = Math.max(maxY - minY, width);
                
                const svgEl = papyr.html(`
                    <svg viewBox="${minX} ${minY} ${containerW} ${containerH}" width="${containerW}" height="${containerH}" class="${className}" style="overflow: visible;">
                        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-dasharray="${strokeDashArray}" stroke-linecap="${strokeLineCap}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('line') || svgEl, animate);
                annotateSDK(svgEl, 'line', options);
                return svgEl;
            };

            papyr.curve = (options = {}) => {
                const { type = 'bezier', start = {x: 0, y: 100}, end = {x: 200, y: 100}, cp1 = {x: 100, y: 0}, cp2 = {x: 150, y: 0}, color = 'var(--papyr-primary)', width = 2, fill = 'none', style = {}, class: className = '', animate = null } = options;
                let d = '';
                if (type === 'bezier') {
                    d = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
                } else {
                    d = `M ${start.x} ${start.y} Q ${cp1.x} ${cp1.y}, ${end.x} ${end.y}`;
                }
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 200 200" width="200" height="200" class="${className}" style="overflow: visible;">
                        <path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('path') || svgEl, animate);
                annotateSDK(svgEl, 'curve', options);
                return svgEl;
            };

            papyr.arc = (options = {}) => {
                const { rx = 50, ry = 50, xAxisRotation = 0, largeArcFlag = 0, sweepFlag = 1, start = {x: 0, y: 50}, end = {x: 100, y: 50}, color = 'var(--papyr-primary)', width = 2, fill = 'none', style = {}, class: className = '', animate = null } = options;
                const d = `M ${start.x} ${start.y} A ${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 100 100" width="100" height="100" class="${className}" style="overflow: visible;">
                        <path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('path') || svgEl, animate);
                annotateSDK(svgEl, 'arc', options);
                return svgEl;
            };

            papyr.spline = (options = {}) => {
                const { points = [{x: 10, y: 90}, {x: 50, y: 10}, {x: 90, y: 90}, {x: 130, y: 10}], color = 'var(--papyr-primary)', width = 2, fill = 'none', style = {}, class: className = '', animate = null } = options;
                let d = '';
                if (points.length > 0) {
                    d = `M ${points[0].x} ${points[0].y}`;
                    for (let i = 0; i < points.length - 1; i++) {
                        const p0 = points[i];
                        const p1 = points[i + 1];
                        const cpX1 = p0.x + (p1.x - p0.x) / 2;
                        const cpY1 = p0.y;
                        const cpX2 = p0.x + (p1.x - p0.x) / 2;
                        const cpY2 = p1.y;
                        d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                    }
                }
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 200 200" width="200" height="200" class="${className}" style="overflow: visible;">
                        <path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('path') || svgEl, animate);
                annotateSDK(svgEl, 'spline', options);
                return svgEl;
            };

            // ==========================================
            // 3. BLOBS & LIQUIDS
            // ==========================================

            papyr.blob = (options = {}) => {
                const { size = 200, color = 'var(--papyr-primary)', points = 6, amplitude = 20, speed = 2000, animate = false } = options;
                const offsets = Array.from({ length: points }, () => (Math.random() - 0.5) * amplitude * 2);
                const pathD = createBlobPath(size / 2, points, offsets);
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow: visible;">
                        <path d="${pathD}" fill="${color}" style="transition: d ${speed}ms cubic-bezier(0.4, 0, 0.2, 1);" />
                    </svg>
                `).firstElementChild;
                
                if (animate === 'morph' || animate === true) {
                    const interval = setInterval(() => {
                        if (typeof document !== 'undefined' && !document.body.contains(svgEl)) {
                            clearInterval(interval);
                            return;
                        }
                        const path = svgEl.querySelector('path');
                        if (path) {
                            const newOffsets = Array.from({ length: points }, () => (Math.random() - 0.5) * amplitude * 2);
                            path.setAttribute('d', createBlobPath(size / 2, points, newOffsets));
                        }
                    }, speed);
                    if (!svgEl._cleanups) svgEl._cleanups = [];
                    svgEl._cleanups.push(() => clearInterval(interval));
                }
                annotateSDK(svgEl, 'blob', options);
                return svgEl;
            };

            papyr.wave = (options = {}) => {
                const { width = 800, height = 100, color = 'var(--papyr-primary)', amplitude = 20, frequency = 0.02, speed = 0.05, animate = false } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none" style="display: block;">
                        <path fill="${color}" />
                    </svg>
                `).firstElementChild;
                const path = svgEl.querySelector('path');
                let phase = 0;
                const updatePath = () => {
                    let points = [];
                    for (let x = 0; x <= width; x += 10) {
                        let y = height / 2 + Math.sin(x * frequency + phase) * amplitude;
                        points.push(`${x},${y}`);
                    }
                    let d = `M 0,${height} L 0,${height/2} ` + points.map(p => `L ${p}`).join(' ') + ` L ${width},${height} Z`;
                    path.setAttribute('d', d);
                };
                updatePath();
                if (animate) {
                    let animId = null;
                    const loop = () => {
                        if (typeof document !== 'undefined' && !document.body.contains(svgEl)) {
                            if (animId) cancelAnimationFrame(animId);
                            return;
                        }
                        phase += speed;
                        updatePath();
                        animId = requestAnimationFrame(loop);
                    };
                    animId = requestAnimationFrame(loop);
                    if (!svgEl._cleanups) svgEl._cleanups = [];
                    svgEl._cleanups.push(() => {
                        if (animId) cancelAnimationFrame(animId);
                    });
                }
                annotateSDK(svgEl, 'wave', options);
                return svgEl;
            };

            papyr.organic = (options = {}) => {
                const { width = 200, height = 200, color = 'var(--papyr-surface)', border = '1px solid var(--papyr-border)', animate = false, speed = 3000 } = options;
                const generateBorderRadius = () => {
                    const r = () => Math.floor(Math.random() * 40) + 30;
                    return `${r()}% ${100-r()}% ${r()}% ${100-r()}% / ${r()}% ${r()}% ${100-r()}% ${100-r()}%`;
                };
                const el = papyr.div({
                    style: {
                        width: typeof width === 'number' ? `${width}px` : width,
                        height: typeof height === 'number' ? `${height}px` : height,
                        backgroundColor: color,
                        border: border,
                        borderRadius: generateBorderRadius(),
                        transition: `border-radius ${speed}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    }
                });
                if (animate === 'morph' || animate === true) {
                    const interval = setInterval(() => {
                        if (typeof document !== 'undefined' && !document.body.contains(el)) {
                            clearInterval(interval);
                            return;
                        }
                        el.style.borderRadius = generateBorderRadius();
                    }, speed);
                    if (!el._cleanups) el._cleanups = [];
                    el._cleanups.push(() => clearInterval(interval));
                }
                annotateSDK(el, 'organic', options);
                return el;
            };

            papyr.liquid = (options = {}) => {
                const { width = 300, height = 150, color = 'rgba(59, 130, 246, 0.4)', speed = 0.05, amplitude = 15, style = {}, class: className = '', animate = true } = options;
                const container = papyr.div({
                    class: className,
                    style: Object.assign({
                        position: 'relative',
                        width: typeof width === 'number' ? `${width}px` : width,
                        height: typeof height === 'number' ? `${height}px` : height,
                        overflow: 'hidden',
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }, style)
                });
                const waveEl = papyr.wave({
                    width: 400,
                    height: 150,
                    color: color,
                    amplitude: amplitude,
                    frequency: 0.03,
                    speed: speed,
                    animate: animate
                });
                waveEl.style.position = 'absolute';
                waveEl.style.bottom = '0';
                waveEl.style.left = '-50px';
                waveEl.style.width = '120%';
                waveEl.style.height = '80%';
                
                container.appendChild(waveEl);
                annotateSDK(container, 'liquid', options);
                return container;
            };

            // ==========================================
            // 4. PATTERN GENERATOR
            // ==========================================

            papyr.pattern = (type = 'dots', options = {}) => {
                const { size = 20, color = 'rgba(255,255,255,0.1)', background = 'transparent', style = {}, class: className = '' } = options;
                let svgPattern = '';
                
                if (type === 'dots') {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><circle cx="${size/2}" cy="${size/2}" r="${size/10}" fill="${color}"/></svg>`;
                } else if (type === 'grids') {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><path d="M 0 0 L 0 ${size} M 0 0 L ${size} 0" stroke="${color}" stroke-width="1" fill="none"/></svg>`;
                } else if (type === 'waves') {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><path d="M 0 ${size/2} Q ${size/4} 0, ${size/2} ${size/2} T ${size} ${size/2}" stroke="${color}" stroke-width="1" fill="none"/></svg>`;
                } else if (type === 'hexagons') {
                    const h = size * Math.sqrt(3) / 2;
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}"><rect width="100%" height="100%" fill="${background}"/><path d="M ${size/2} 0 L ${size} ${h/3} L ${size} ${2*h/3} L ${size/2} ${h} L 0 ${2*h/3} L 0 ${h/3} Z" stroke="${color}" stroke-width="1" fill="none"/></svg>`;
                } else if (type === 'checkerboards') {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><rect width="${size/2}" height="${size/2}" fill="${color}"/><rect x="${size/2}" y="${size/2}" width="${size/2}" height="${size/2}" fill="${color}"/></svg>`;
                } else {
                    svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${background}"/><rect width="2" height="2" fill="${color}"/><rect x="${size/2}" y="${size/2}" width="2" height="2" fill="${color}"/></svg>`;
                }
                
                const encoded = typeof window !== 'undefined' ? window.btoa(svgPattern) : Buffer.from(svgPattern).toString('base64');
                const bgImage = `url('data:image/svg+xml;base64,${encoded}')`;
                
                const el = papyr.div({
                    class: className,
                    style: Object.assign({
                        width: '100%',
                        height: '100%',
                        backgroundImage: bgImage,
                        backgroundRepeat: 'repeat'
                    }, style)
                });
                annotateSDK(el, 'pattern', options);
                return el;
            };

            // ==========================================
            // 5. SVG & CANVAS WRAPPERS
            // ==========================================

            papyr.svg = (options = {}) => {
                const { width = 200, height = 200, content = '', style = {}, class: className = '' } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${className}">
                        ${content}
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                return svgEl;
            };

            papyr.canvas = (options = {}) => {
                const { width = 400, height = 300, onInit = null, style = {}, class: className = '' } = options;
                const cv = document.createElement('canvas');
                cv.width = width;
                cv.height = height;
                cv.className = className;
                Object.assign(cv.style, style);
                if (onInit) {
                    setTimeout(() => onInit(cv), 50);
                }
                return cv;
            };

            // ==========================================
            // 6. 3D CSS ENGINE & CARDS
            // ==========================================

            papyr.cube = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('cube', options);
                }
                const { size = 100, color = 'rgba(59, 130, 246, 0.8)', style = {}, class: className = '', animate = null } = options;
                const half = size / 2;
                const cube = papyr.div({
                    class: className,
                    style: Object.assign({
                        position: 'relative',
                        width: `${size}px`,
                        height: `${size}px`,
                        transformStyle: 'preserve-3d',
                        perspective: '800px'
                    }, style)
                });
                const faces = {
                    front:  `rotateY(0deg) translateZ(${half}px)`,
                    back:   `rotateY(180deg) translateZ(${half}px)`,
                    left:   `rotateY(-90deg) translateZ(${half}px)`,
                    right:  `rotateY(90deg) translateZ(${half}px)`,
                    top:    `rotateX(90deg) translateZ(${half}px)`,
                    bottom: `rotateX(-90deg) translateZ(${half}px)`
                };
                Object.entries(faces).forEach(([faceName, transform]) => {
                    const face = papyr.div({
                        style: {
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: color,
                            border: '1px solid rgba(255,255,255,0.2)',
                            transform: transform,
                            boxSizing: 'border-box'
                        }
                    });
                    cube.appendChild(face);
                });
                if (animate === 'spin' || animate === true) {
                    cube.style.animation = 'papyr-spin-3d 8s linear infinite';
                    injectKeyframe('papyr-spin-3d', 'from { transform: rotateX(0deg) rotateY(0deg); } to { transform: rotateX(360deg) rotateY(360deg); }');
                } else if (animate) {
                    applyAnimation(cube, animate);
                }
                annotateSDK(cube, 'cube', options);
                return cube;
            };

            papyr.card = (options = {}) => {
                const { width = 300, height = 200, color = 'var(--papyr-surface)', tilt = true, style = {}, class: className = '' } = options;
                const card = papyr.div({
                    class: className,
                    style: Object.assign({
                        width: typeof width === 'number' ? `${width}px` : width,
                        height: typeof height === 'number' ? `${height}px` : height,
                        backgroundColor: color,
                        borderRadius: '16px',
                        border: '1px solid var(--papyr-border)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        transformStyle: 'preserve-3d',
                        perspective: '1000px',
                        boxShadow: 'var(--papyr-shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '16px',
                        boxSizing: 'border-box'
                    }, style)
                });
                
                if (tilt) {
                    const onMouseMove = (e) => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const xc = rect.width / 2;
                        const yc = rect.height / 2;
                        const maxTilt = typeof tilt === 'object' && tilt.max ? tilt.max : 15;
                        const rotateY = ((x - xc) / xc) * maxTilt;
                        const rotateX = -((y - yc) / yc) * maxTilt;
                        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                        card.style.boxShadow = 'var(--papyr-shadow-xl)';
                    };
                    const onMouseLeave = () => {
                        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
                        card.style.boxShadow = 'var(--papyr-shadow-md)';
                    };
                    card.addEventListener('mousemove', onMouseMove);
                    card.addEventListener('mouseleave', onMouseLeave);
                    
                    if (!card._cleanups) card._cleanups = [];
                    card._cleanups.push(() => {
                        card.removeEventListener('mousemove', onMouseMove);
                        card.removeEventListener('mouseleave', onMouseLeave);
                    });
                }
                
                if (options.content) {
                    const rendered = typeof options.content === 'function' ? options.content() : options.content;
                    if (rendered) card.appendChild(rendered);
                }
                annotateSDK(card, 'card', options);
                return card;
            };

            papyr.sphere = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('sphere', options);
                }
                const { size = 100, color = '#3b82f6', style = {}, class: className = '', animate = null } = options;
                const radius = size / 2;
                const gradientId = `papyr-sphere-grad-${Math.random().toString(36).substring(2, 6)}`;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}" style="overflow: visible;">
                        <defs>
                            <radialGradient id="${gradientId}" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
                                <stop offset="50%" stop-color="${color}"/>
                                <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
                            </radialGradient>
                        </defs>
                        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="url(#${gradientId})" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl.querySelector('circle') || svgEl, animate);
                annotateSDK(svgEl, 'sphere', options);
                return svgEl;
            };

            papyr.cylinder = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('cylinder', options);
                }
                const { width = 80, height = 120, color = '#3b82f6', style = {}, class: className = '', animate = null } = options;
                const rx = width / 2;
                const ry = 15;
                const gradientId = `papyr-cyl-grad-${Math.random().toString(36).substring(2, 6)}`;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${className}">
                        <defs>
                            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
                                <stop offset="40%" stop-color="${color}"/>
                                <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
                            </linearGradient>
                        </defs>
                        <ellipse cx="${rx}" cy="${height - ry}" rx="${rx}" ry="${ry}" fill="${color}" />
                        <rect x="0" y="${ry}" width="${width}" height="${height - 2*ry}" fill="url(#${gradientId})" />
                        <ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="${color}" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl, animate);
                annotateSDK(svgEl, 'cylinder', options);
                return svgEl;
            };

            papyr.cone = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('cone', options);
                }
                const { width = 100, height = 120, color = '#3b82f6', style = {}, class: className = '', animate = null } = options;
                const rx = width / 2;
                const ry = 15;
                const gradientId = `papyr-cone-grad-${Math.random().toString(36).substring(2, 6)}`;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="${className}">
                        <defs>
                            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
                                <stop offset="40%" stop-color="${color}"/>
                                <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
                            </linearGradient>
                        </defs>
                        <path d="M 0,${height - ry} L ${rx},0 L ${width},${height - ry} Z" fill="url(#${gradientId})" />
                        <ellipse cx="${rx}" cy="${height - ry}" rx="${rx}" ry="${ry}" fill="${color}" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl, animate);
                annotateSDK(svgEl, 'cone', options);
                return svgEl;
            };

            papyr.plane = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('plane', options);
                }
                const { width = 200, height = 200, color = 'rgba(59, 130, 246, 0.2)', style = {}, class: className = '' } = options;
                const el = papyr.div({
                    class: className,
                    style: Object.assign({
                        width: `${width}px`,
                        height: `${height}px`,
                        backgroundColor: color,
                        border: '1px solid rgba(255,255,255,0.2)',
                        transform: 'rotateX(60deg)'
                    }, style)
                });
                annotateSDK(el, 'plane', options);
                return el;
            };

            papyr.torus = (options = {}) => {
                if (typeof window !== 'undefined' && window.THREE && papyr._activeThreeScene) {
                    return createThreeMesh('torus', options);
                }
                const { size = 120, thickness = 20, color = '#3b82f6', style = {}, class: className = '', animate = null } = options;
                const radius = size / 2;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="${className}">
                        <circle cx="${radius}" cy="${radius}" r="${radius - thickness/2}" fill="none" stroke="${color}" stroke-width="${thickness}" />
                        <circle cx="${radius}" cy="${radius}" r="${radius - thickness/2}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="${thickness/3}" />
                        <circle cx="${radius}" cy="${radius}" r="${radius - thickness/2}" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="${thickness/3}" stroke-dasharray="100,50" />
                    </svg>
                `).firstElementChild;
                if (style) Object.assign(svgEl.style, style);
                applyAnimation(svgEl, animate);
                annotateSDK(svgEl, 'torus', options);
                return svgEl;
            };

            // ==========================================
            // 7. THREE.JS ADAPTER LAYER
            // ==========================================

            papyr.useThree = (containerEl, options = {}) => {
                const THREE = window.THREE;
                if (!THREE) {
                    console.error("Three.js not loaded globally. Run papyr.use('three') first.");
                    return null;
                }
                const width = containerEl.clientWidth || 400;
                const height = containerEl.clientHeight || 300;
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setSize(width, height);
                containerEl.appendChild(renderer.domElement);

                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(5, 5, 5).normalize();
                scene.add(light);
                scene.add(new THREE.AmbientLight(0x404040));

                camera.position.z = 5;

                let active = true;
                const animateLoop = () => {
                    if (!active) return;
                    requestAnimationFrame(animateLoop);
                    scene.traverse(node => {
                        if (node.isMesh) {
                            node.rotation.x += 0.01;
                            node.rotation.y += 0.01;
                        }
                    });
                    renderer.render(scene, camera);
                };
                animateLoop();

                papyr._activeThreeScene = { scene, camera, renderer };

                const cleanup = () => {
                    active = false;
                    renderer.dispose();
                    if (renderer.domElement && renderer.domElement.parentNode) {
                        renderer.domElement.parentNode.removeChild(renderer.domElement);
                    }
                    papyr._activeThreeScene = null;
                };

                if (!containerEl._cleanups) containerEl._cleanups = [];
                containerEl._cleanups.push(cleanup);

                return { scene, camera, renderer, cleanup };
            };

            const createThreeMesh = (type, options) => {
                const THREE = window.THREE;
                const scene = papyr._activeThreeScene.scene;
                const color = options.color || 0x3b82f6;
                const size = (options.size || 100) / 100;
                
                let geometry;
                if (type === 'cube') geometry = new THREE.BoxGeometry(size, size, size);
                else if (type === 'sphere') geometry = new THREE.SphereGeometry(size / 2, 32, 32);
                else if (type === 'cylinder') geometry = new THREE.CylinderGeometry(size / 2, size / 2, size, 32);
                else if (type === 'cone') geometry = new THREE.ConeGeometry(size / 2, size, 32);
                else if (type === 'plane') geometry = new THREE.PlaneGeometry(size, size);
                else if (type === 'torus') geometry = new THREE.TorusGeometry(size / 2, size / 6, 16, 100);

                const material = new THREE.MeshLambertMaterial({ color });
                const mesh = new THREE.Mesh(geometry, material);
                
                if (options.x !== undefined) mesh.position.x = options.x / 100;
                if (options.y !== undefined) mesh.position.y = options.y / 100;
                
                scene.add(mesh);
                return mesh;
            };

            // ==========================================
            // 8. PHYSICS ENGINE ADAPTER
            // ==========================================

            let physicsEngine = {
                _active: false,
                _loopId: null,
                _bodies: [],
                gravity: 0.5,
                enable(options = {}) {
                    if (this._active) return;
                    this._active = true;
                    this.gravity = options.gravity !== undefined ? (options.gravity ? 0.5 : 0) : 0.5;
                    const loop = () => {
                        if (!this._active) return;
                        this.update();
                        this._loopId = requestAnimationFrame(loop);
                    };
                    this._loopId = requestAnimationFrame(loop);
                    console.log("⚡ Papyr Physics Engine: Enabled.");
                },
                disable() {
                    this._active = false;
                    if (this._loopId) cancelAnimationFrame(this._loopId);
                    this._bodies = [];
                    console.log("⚡ Papyr Physics Engine: Disabled.");
                },
                add(el, options = {}) {
                    const body = {
                        el,
                        x: options.x || 0,
                        y: options.y || 0,
                        vx: options.vx || (Math.random() - 0.5) * 5,
                        vy: options.vy || 0,
                        bounce: options.bounce !== undefined ? options.bounce : 0.8,
                        friction: options.friction !== undefined ? options.friction : 0.1,
                        mass: options.mass || 1,
                        radius: options.radius || 25,
                        collision: options.collision !== false
                    };
                    this._bodies.push(body);
                    el.style.position = 'absolute';
                    el.style.left = `${body.x}px`;
                    el.style.top = `${body.y}px`;
                    
                    if (!el._cleanups) el._cleanups = [];
                    el._cleanups.push(() => {
                        this._bodies = this._bodies.filter(b => b.el !== el);
                    });
                },
                update() {
                    const parentWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
                    const parentHeight = typeof window !== 'undefined' ? window.innerHeight : 600;
                    this._bodies.forEach(b => {
                        b.vy += this.gravity;
                        b.x += b.vx;
                        b.y += b.vy;
                        
                        if (b.y + b.radius * 2 > parentHeight) {
                            b.y = parentHeight - b.radius * 2;
                            b.vy = -b.vy * b.bounce;
                            b.vx = b.vx * (1 - b.friction);
                        }
                        if (b.y < 0) {
                            b.y = 0;
                            b.vy = -b.vy * b.bounce;
                        }
                        if (b.x + b.radius * 2 > parentWidth) {
                            b.x = parentWidth - b.radius * 2;
                            b.vx = -b.vx * b.bounce;
                        }
                        if (b.x < 0) {
                            b.x = 0;
                            b.vx = -b.vx * b.bounce;
                        }
                        b.el.style.left = `${b.x}px`;
                        b.el.style.top = `${b.y}px`;
                    });
                }
            };
            papyr.physics = physicsEngine;
        }
    };

    if (targetPapyr) {
        targetPapyr.use(shapesPlugin);
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = shapesPlugin;
    } else if (typeof exports !== 'undefined') {
        exports.default = shapesPlugin;
    } else {
        window.papyrShapes = shapesPlugin;
    }
})(typeof window !== 'undefined' ? window : this);
