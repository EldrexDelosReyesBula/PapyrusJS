/**
 * PAPYR SHAPES SYSTEM
 * Package: @papyr/shapes
 * Premium, customizable mathematical shape generators with elastic morph support.
 */
(function(window) {
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

    const shapesPlugin = {
        name: 'papyr-shapes',
        version: '1.0.0',
        install(papyr) {
            // Blob shape generator
            papyr.blob = (options = {}) => {
                const {
                    size = 200,
                    color = 'var(--papyr-primary)',
                    points = 6,
                    amplitude = 20,
                    speed = 2000,
                    animate = false
                } = options;
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
                return svgEl;
            };

            // Wave shape generator
            papyr.wave = (options = {}) => {
                const {
                    width = 800,
                    height = 100,
                    color = 'var(--papyr-primary)',
                    amplitude = 20,
                    frequency = 0.02,
                    speed = 0.05,
                    animate = false
                } = options;
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
                return svgEl;
            };

            // Organic rounded panel
            papyr.organic = (options = {}) => {
                const {
                    width = 200,
                    height = 200,
                    color = 'var(--papyr-surface)',
                    border = '1px solid var(--papyr-border)',
                    animate = false,
                    speed = 3000
                } = options;
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
                return el;
            };

            // Custom Polygon generator
            papyr.polygon = (sides = 5, options = {}) => {
                const {
                    size = 150,
                    color = 'var(--papyr-primary)',
                    animate = false,
                    speed = 0.02
                } = options;
                const svgEl = papyr.html(`
                    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
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
                if (animate) {
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
                }
                return svgEl;
            };
        }
    };

    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
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
