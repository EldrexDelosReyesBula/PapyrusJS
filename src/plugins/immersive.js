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
