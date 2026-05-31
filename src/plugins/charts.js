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
