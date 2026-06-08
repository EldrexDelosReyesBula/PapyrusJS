/**
 * PAPYR GAME SDK (papyr-game-sdk)
 * Unified, high-performance, and lightweight gaming infrastructure.
 * Provides out-of-the-box adapters for Canvas, WebGL, WebGPU, Physics systems, Asset loaders, and Inputs.
 * v3.1.3 - Foundation Strengthening Release
 */
(function (window) {
    if (!window.papyr) {
        console.warn("Papyr core not detected. Game SDK requires papyr core to run.");
        return;
    }

    const papyr = window.papyr;

    const GameSDK = {
        // 1. Responsive Canvas Generator
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

        // 2. High-Precision Game Loop
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

        // 3. Unified Input System
        input(el) {
            const keys = {};
            const mouse = { x: 0, y: 0, isDown: false };
            const touches = [];
            
            const onKeyDown = (e) => { keys[e.key] = true; };
            const onKeyUp = (e) => { keys[e.key] = false; };
            
            const onMouseMove = (e) => {
                const rect = (el || document.body).getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            };
            const onMouseDown = () => { mouse.isDown = true; };
            const onMouseUp = () => { mouse.isDown = false; };

            const onTouchStart = (e) => {
                mouse.isDown = true;
                updateTouches(e);
            };
            const onTouchMove = (e) => { updateTouches(e); };
            const onTouchEnd = (e) => {
                mouse.isDown = e.touches.length > 0;
                updateTouches(e);
            };

            const updateTouches = (e) => {
                touches.length = 0;
                const rect = (el || document.body).getBoundingClientRect();
                for (let i = 0; i < e.touches.length; i++) {
                    touches.push({
                        id: e.touches[i].identifier,
                        x: e.touches[i].clientX - rect.left,
                        y: e.touches[i].clientY - rect.top
                    });
                }
            };

            const target = el || window;
            const mouseTarget = el || window;
            
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            mouseTarget.addEventListener('mousemove', onMouseMove);
            mouseTarget.addEventListener('mousedown', onMouseDown);
            mouseTarget.addEventListener('mouseup', onMouseUp);
            mouseTarget.addEventListener('touchstart', onTouchStart, { passive: true });
            mouseTarget.addEventListener('touchmove', onTouchMove, { passive: true });
            mouseTarget.addEventListener('touchend', onTouchEnd, { passive: true });

            return {
                isDown(key) { return !!keys[key]; },
                getMouse() { return { ...mouse }; },
                getTouches() { return [...touches]; },
                destroy() {
                    window.removeEventListener('keydown', onKeyDown);
                    window.removeEventListener('keyup', onKeyUp);
                    mouseTarget.removeEventListener('mousemove', onMouseMove);
                    mouseTarget.removeEventListener('mousedown', onMouseDown);
                    mouseTarget.removeEventListener('mouseup', onMouseUp);
                    mouseTarget.removeEventListener('touchstart', onTouchStart);
                    mouseTarget.removeEventListener('touchmove', onTouchMove);
                    mouseTarget.removeEventListener('touchend', onTouchEnd);
                }
            };
        },

        // 4. Asynchronous Asset Preloader
        assets: {
            async load(manifest) {
                const loaded = {};
                const promises = Object.entries(manifest).map(([key, src]) => {
                    const ext = src.split('.').pop().toLowerCase();
                    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
                        return new Promise((resolve, reject) => {
                            const img = new Image();
                            img.onload = () => {
                                loaded[key] = img;
                                resolve();
                            };
                            img.onerror = (e) => reject(new Error(`Failed to load image: ${src}`));
                            img.src = src;
                        });
                    } else if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
                        return new Promise((resolve, reject) => {
                            const audio = new Audio();
                            audio.oncanplaythrough = () => {
                                loaded[key] = audio;
                                resolve();
                            };
                            audio.onerror = (e) => reject(new Error(`Failed to load audio: ${src}`));
                            audio.src = src;
                            audio.load();
                        });
                    } else {
                        return fetch(src)
                            .then(res => {
                                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                                return ext === 'json' ? res.json() : res.text();
                            })
                            .then(data => {
                                loaded[key] = data;
                            });
                    }
                });
                await Promise.all(promises);
                return loaded;
            }
        },

        // 5. Adaptable Graphics & Physics Connectors
        adapters: {
            // WebGL Renderer bootstrap
            webgl(canvas, options = {}) {
                const gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
                if (!gl) {
                    console.error("WebGL context not supported.");
                    return null;
                }
                return {
                    gl,
                    createShader(type, source) {
                        const shader = gl.createShader(type);
                        gl.shaderSource(shader, source);
                        gl.compileShader(shader);
                        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                            const info = gl.getShaderInfoLog(shader);
                            gl.deleteShader(shader);
                            throw new Error("WebGL shader compile error: " + info);
                        }
                        return shader;
                    },
                    createProgram(vsSource, fsSource) {
                        const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
                        const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
                        const program = gl.createProgram();
                        gl.attachShader(program, vs);
                        gl.attachShader(program, fs);
                        gl.linkProgram(program);
                        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                            throw new Error("WebGL program link error: " + gl.getProgramInfoLog(program));
                        }
                        return program;
                    }
                };
            },

            // WebGPU context initiator
            async webgpu(canvas) {
                if (!navigator.gpu) {
                    console.warn("WebGPU not supported on this browser.");
                    return null;
                }
                const adapter = await navigator.gpu.requestAdapter();
                if (!adapter) {
                    console.warn("WebGPU adapter request failed.");
                    return null;
                }
                const device = await adapter.requestDevice();
                const context = canvas.getContext('webgpu');
                const format = navigator.gpu.getPreferredCanvasFormat();
                context.configure({ device, format, alphaMode: 'opaque' });
                return { adapter, device, context, format };
            },

            // Unified Physics adapter mapper
            physics(type = 'verlet', options = {}) {
                if (type === 'verlet' && papyr.physics && typeof papyr.physics.world === 'function') {
                    return papyr.physics.world(options);
                }
                console.log(`[GameSDK] Physics adapter initialized for type: ${type}`);
                return null;
            }
        }
    };

    papyr.game = GameSDK;

    const gamePlugin = {
        name: 'papyr-game',
        version: '3.1.3',
        install(p) {
            p.game = GameSDK;
        }
    };

    // Auto-register on core if available
    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
    if (targetPapyr) {
        targetPapyr.use(gamePlugin);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = gamePlugin;
    } else if (typeof exports !== 'undefined') {
        exports.default = gamePlugin;
    } else {
        window.papyrGame = gamePlugin;
    }
})(typeof window !== 'undefined' ? window : this);
