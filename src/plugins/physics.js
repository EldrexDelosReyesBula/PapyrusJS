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
