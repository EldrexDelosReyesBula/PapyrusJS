/**
 * PAPYR ANIMATE
 * Zero-dependency hardware-accelerated animation engine.
 * v3.0 - Agile Cinematic Motion, Spring systems, and Swipe gestures.
 */
(function () {
    const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

    const isLowEnd = () => {
        return prefersReducedMotion || (typeof document !== 'undefined' && document.documentElement.classList.contains('papyr-low-end'));
    };

    // Fluid Engine (Performance-aware frame monitor)
    if (typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
        let lastTime = performance.now();
        let frameCount = 0;
        let lowFpsCount = 0;
        const checkFPS = () => {
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                const fps = (frameCount * 1000) / (now - lastTime);
                frameCount = 0;
                lastTime = now;
                
                if (fps < 45) {
                    lowFpsCount++;
                    if (lowFpsCount >= 3) {
                        if (typeof document !== 'undefined' && document.documentElement) {
                            document.documentElement.classList.add('papyr-low-end');
                            console.warn("Papyr Fluid Engine: Low frame rate detected. Visual quality degraded to optimize performance.");
                            if (window.papyr && typeof window.papyr.emit === 'function') {
                                window.papyr.emit('performance-degraded', { fps });
                            }
                        }
                        return; // stop checking once downgraded
                    }
                } else {
                    lowFpsCount = 0;
                }
            }
            requestAnimationFrame(checkFPS);
        };
        setTimeout(() => requestAnimationFrame(checkFPS), 1000);
    }


    // Intersection Observer for scroll animations
    let observer = null;
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let anim = entry.target.dataset.animate;
                    if (anim) {
                        entry.target.classList.add(`animate-${anim}`);
                        entry.target.classList.add('animated');
                    }
                    if (entry.target.dataset.animateOnce !== 'false') {
                        observer.unobserve(entry.target);
                    }
                } else if (entry.target.dataset.animateOnce === 'false') {
                    // Reverse animation if scrolling out of view
                    let anim = entry.target.dataset.animate;
                    if (anim) {
                        entry.target.classList.remove(`animate-${anim}`);
                        entry.target.classList.remove('animated');
                    }
                }
            });
        }, { threshold: 0.1 });
    }

    const VALID_ANIMATIONS = ['fade', 'slide', 'zoom', 'blur', 'rotate', 'bounce', 'elastic', 'glass-pop', 'fade-in', 'slide-up', 'slide-down', 'zoom-in', 'blur-in'];
    const levenshtein = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
        return matrix[b.length][a.length];
    };

    let mo = null;
    if (typeof window !== 'undefined' && 'MutationObserver' in window) {
        mo = new MutationObserver(mutations => {
            if (prefersReducedMotion) return;
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node instanceof Element) {
                        let elements = [node, ...node.querySelectorAll('[animate]')];
                        elements.forEach(el => {
                            if (el.hasAttribute('animate') && observer) {
                                let animType = el.getAttribute('animate');

                                // Spell check animation
                                if (!VALID_ANIMATIONS.includes(animType)) {
                                    let closest = '';
                                    let minDistance = Infinity;
                                    for (let valid of VALID_ANIMATIONS) {
                                        let d = levenshtein(animType, valid);
                                        if (d < minDistance) {
                                            minDistance = d;
                                            closest = valid;
                                        }
                                    }
                                    if (minDistance <= 3) {
                                        console.error(`PapyrError: Unknown animation "${animType}". Did you mean "${closest}"?`);
                                        if (papyr.toast) papyr.toast(`PapyrError: Unknown animation "${animType}". Did you mean "${closest}"?`, 'error');
                                    }
                                }

                                el.dataset.animate = animType;
                                el.removeAttribute('animate'); // Clean DOM
                                el.classList.add('papyr-animate-base');
                                observer.observe(el);
                            }
                        });
                    }
                });
            });
        });
    }

    if (typeof document !== 'undefined' && mo) {
        mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    // --- MODULE: MOTION API ---

    /**
     * Unified animation entry point.
     * Supports papyr.animate(el, properties, duration)
     * and decorator configuration papyr.animate({ type: 'glass-pop' })
     */
    const originalAnimate = papyr.animate;
    papyr.animate = (elOrConfig, properties, duration = 400) => {
        if (!elOrConfig) return null;

        // Config-first mode: papyr.animate({ type: 'glass-pop' })
        if (typeof elOrConfig === 'object' && !(elOrConfig instanceof Element)) {
            const config = elOrConfig;
            return (el) => {
                if (!el) return el;
                if (config.type === 'glass-pop') {
                    el.classList.add('animate-glass-pop');
                    el.classList.add('papyr-animate-base');
                }
                return el;
            };
        }

        // Direct DOM mode
        const el = elOrConfig;
        if (properties && typeof properties === 'object') {
            el.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            requestAnimationFrame(() => {
                Object.assign(el.style, properties);
            });
            return el;
        }

        return el;
    };

    // Cinematic transition wrappers
    papyr.animate.fade = (el, duration = 600) => {
        if (!el) return el;
        if (isLowEnd()) {
            el.style.opacity = '1';
            return el;
        }
        el.style.opacity = '0';
        el.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
            });
        });
        return el;
    };

    papyr.animate.slide = (el, duration = 600) => {
        if (!el) return el;
        if (isLowEnd()) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0px)';
            return el;
        }
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1.15)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0px)';
            });
        });
        return el;
    };

    papyr.animate.zoom = (el, duration = 600) => {
        if (!el) return el;
        if (isLowEnd()) {
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            return el;
        }
        el.style.opacity = '0';
        el.style.transform = 'scale(0.9)';
        el.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1.15)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'scale(1)';
            });
        });
        return el;
    };

    papyr.animate.pop = (el, duration = 600) => {
        if (!el) return el;
        if (isLowEnd()) {
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            return el;
        }
        el.style.opacity = '0';
        el.style.transform = 'scale(0.3)';
        el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'scale(1)';
            });
        });
        return el;
    };


    // Spring physics animator solver
    papyr.animate.spring = (el, properties, config = {}) => {
        if (!el || typeof window === 'undefined') return el;

        // Auto-cancellation on mousedown/touchstart to ensure interactions are never blocked
        if (!el._hasSpringCancelListeners) {
            el._hasSpringCancelListeners = true;
            const cancelEvent = () => {
                if (el._springCancel) {
                    el._springCancel();
                }
            };
            el.addEventListener('mousedown', cancelEvent);
            el.addEventListener('touchstart', cancelEvent);
        }

        if (isLowEnd()) {
            // Apply target values immediately for low-end / reduced motion
            let transformParts = [];
            if ('x' in properties || 'y' in properties) {
                transformParts.push(`translate(${properties.x !== undefined ? properties.x : 0}px, ${properties.y !== undefined ? properties.y : 0}px)`);
            }
            if ('scale' in properties) {
                transformParts.push(`scale(${properties.scale})`);
            }
            if (transformParts.length > 0) {
                el.style.transform = transformParts.join(' ');
            }
            Object.entries(properties).forEach(([prop, targetVal]) => {
                if (prop !== 'x' && prop !== 'y' && prop !== 'scale') {
                    if (prop !== '__proto__' && prop !== 'constructor' && prop !== 'prototype') {
                        el.style[prop] = prop === 'opacity' ? targetVal : `${targetVal}px`;
                    }
                }
            });
            return el;
        }

        const { tension = 170, friction = 26, mass = 1 } = config;

        if (el._springCancel) {
            el._springCancel();
        }
        let cancelled = false;
        el._springCancel = () => { cancelled = true; };

        // Parse current transform values
        let currentX = 0;
        let currentY = 0;
        let currentScale = 1;

        const transformStr = el.style.transform || '';
        const translateMatch = transformStr.match(/translate\(([^,]+),\s*([^)]+)\)/) || 
                               transformStr.match(/translate3d\(([^,]+),\s*([^,]+)/);
        if (translateMatch) {
            currentX = parseFloat(translateMatch[1]) || 0;
            currentY = parseFloat(translateMatch[2]) || 0;
        } else {
            const translateXMatch = transformStr.match(/translateX\(([^)]+)\)/);
            if (translateXMatch) currentX = parseFloat(translateXMatch[1]) || 0;
            const translateYMatch = transformStr.match(/translateY\(([^)]+)\)/);
            if (translateYMatch) currentY = parseFloat(translateYMatch[1]) || 0;
        }

        const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
        if (scaleMatch) {
            currentScale = parseFloat(scaleMatch[1]) || 1;
        }

        const anims = {};
        Object.entries(properties).forEach(([prop, targetVal]) => {
            if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') return;
            let currentVal = 0;
            if (prop === 'x') currentVal = currentX;
            else if (prop === 'y') currentVal = currentY;
            else if (prop === 'scale') currentVal = currentScale;
            else currentVal = parseFloat(el.style[prop]) || 0;

            anims[prop] = {
                current: currentVal,
                velocity: 0,
                target: targetVal
            };
        });

        const step = () => {
            if (cancelled) return;
            let done = true;

            // Run 4 sub-steps per frame to ensure integration stability at high tension / low friction
            const substeps = 4;
            const dt = 0.016 / substeps;

            for (let i = 0; i < substeps; i++) {
                done = true;
                Object.entries(anims).forEach(([prop, anim]) => {
                    let force = -tension * (anim.current - anim.target) - friction * anim.velocity;
                    let acceleration = force / mass;
                    anim.velocity += acceleration * dt;
                    anim.current += anim.velocity * dt;

                    if (Math.abs(anim.velocity) > 0.005 || Math.abs(anim.current - anim.target) > 0.005) {
                        done = false;
                    } else {
                        anim.current = anim.target;
                        anim.velocity = 0;
                    }
                });
                if (done) break;
            }

            // Rebuild the transform string to apply x, y, and scale together
            let transformParts = [];
            let hasX = 'x' in anims;
            let hasY = 'y' in anims;
            if (hasX || hasY) {
                let xVal = hasX ? anims.x.current : currentX;
                let yVal = hasY ? anims.y.current : currentY;
                transformParts.push(`translate(${xVal}px, ${yVal}px)`);
            } else {
                if (currentX !== 0 || currentY !== 0) {
                    transformParts.push(`translate(${currentX}px, ${currentY}px)`);
                }
            }
            
            if ('scale' in anims) {
                transformParts.push(`scale(${anims.scale.current})`);
            } else {
                if (currentScale !== 1) {
                    transformParts.push(`scale(${currentScale})`);
                }
            }

            if (transformParts.length > 0) {
                el.style.transform = transformParts.join(' ');
            }

            // Apply other non-transform properties
            Object.entries(anims).forEach(([prop, anim]) => {
                if (prop !== 'x' && prop !== 'y' && prop !== 'scale') {
                    if (prop !== '__proto__' && prop !== 'constructor' && prop !== 'prototype') {
                        el.style[prop] = prop === 'opacity' ? anim.current : `${anim.current}px`;
                    }
                }
            });

            if (!done) {
                requestAnimationFrame(step);
            }
        };

        step();
        return el;
    };


    // Gesture swipe controls and dynamic touch trackers
    papyr.animate.gesture = (el, options = {}) => {
        if (!el || typeof window === 'undefined') return el;
        const { onSwipeLeft, onSwipeRight, onDrag, onRelease } = options;
        let startX = 0, startY = 0, currentX = 0, currentY = 0;
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0;

        const start = (clientX, clientY) => {
            let curX = 0;
            let curY = 0;
            const transformStr = el.style.transform || '';
            const translateMatch = transformStr.match(/translate\(([^,]+),\s*([^)]+)\)/) || 
                                   transformStr.match(/translate3d\(([^,]+),\s*([^,]+)/);
            if (translateMatch) {
                curX = parseFloat(translateMatch[1]) || 0;
                curY = parseFloat(translateMatch[2]) || 0;
            } else {
                const translateXMatch = transformStr.match(/translateX\(([^)]+)\)/);
                if (translateXMatch) curX = parseFloat(translateXMatch[1]) || 0;
                const translateYMatch = transformStr.match(/translateY\(([^)]+)\)/);
                if (translateYMatch) curY = parseFloat(translateYMatch[1]) || 0;
            }

            dragStartX = curX;
            dragStartY = curY;
            startX = clientX;
            startY = clientY;
            isDragging = true;
            el.style.transition = 'none';

            if (el._springCancel) {
                el._springCancel();
            }

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

        const move = (clientX, clientY) => {
            if (!isDragging) return;
            currentX = dragStartX + (clientX - startX);
            currentY = dragStartY + (clientY - startY);
            if (onDrag) onDrag(currentX, currentY, el);
            else {
                el.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        };

        const end = () => {
            if (!isDragging) return;
            isDragging = false;

            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            if (onRelease) {
                onRelease(currentX, currentY, el);
            } else {
                el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                if (currentX > 100 && onSwipeRight) {
                    onSwipeRight(el);
                } else if (currentX < -100 && onSwipeLeft) {
                    onSwipeLeft(el);
                } else {
                    el.style.transform = 'translate(0px, 0px)';
                }
            }
            currentX = 0;
            currentY = 0;
        };

        const onMouseMove = (e) => move(e.clientX, e.clientY);
        const onMouseUp = () => end();

        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            start(e.clientX, e.clientY);
        });

        const onTouchMove = (e) => {
            if (e.touches.length > 0) {
                move(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const onTouchEnd = () => {
            end();
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };

        el.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                start(e.touches[0].clientX, e.touches[0].clientY);
                window.addEventListener('touchmove', onTouchMove, { passive: true });
                window.addEventListener('touchend', onTouchEnd, { passive: true });
            }
        });

        return el;
    };

    // PAPYR PARALLAX ENGINE
    papyr.parallax = (selector, speed = 0.5) => {
        if (typeof window === 'undefined') return;
        window.addEventListener('scroll', () => {
            const elements = document.querySelectorAll(selector);
            let scrollY = window.scrollY;
            elements.forEach(el => {
                let yPos = -(scrollY * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    };

    // PAPYR PHYSICS ENGINE
    papyr.physics = (options = {}) => {
        const { gravity = 0.98, bounce = 0.8, friction = 0.95 } = options;
        return (el) => {
            if (!el || typeof window === 'undefined') return el;

            let y = 0, vy = 0;
            let isDragging = false;
            let animationFrame;

            // Cache measurements to prevent layout thrashing
            let elHeight = 50;
            let parentHeight = window.innerHeight;

            const recacheHeights = () => {
                elHeight = el.offsetHeight || 50;
                parentHeight = el.parentElement ? el.parentElement.clientHeight : window.innerHeight;
            };

            window.addEventListener('resize', recacheHeights);

            // Cleanup resize listener if element is detached
            if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
                const observer = new MutationObserver(() => {
                    if (!document.body.contains(el)) {
                        window.removeEventListener('resize', recacheHeights);
                        observer.disconnect();
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }

            const update = () => {
                if (!isDragging) {
                    vy += gravity;
                    y += vy;

                    let floor = parentHeight - elHeight;

                    if (y > floor) {
                        y = floor;
                        vy *= -bounce;
                        vy *= friction;
                    }

                    el.style.transform = `translateY(${y}px)`;
                }
                animationFrame = requestAnimationFrame(update);
            };

            el.style.cursor = 'grab';
            el.addEventListener('mousedown', () => {
                isDragging = true;
                el.style.cursor = 'grabbing';
                recacheHeights();
            });
            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    el.style.cursor = 'grab';
                    vy = 0;
                }
            });
            window.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    y += e.movementY;
                    el.style.transform = `translateY(${y}px)`;
                }
            });

            setTimeout(() => {
                let initialBounds = el.getBoundingClientRect();
                y = initialBounds.top || 0;
                recacheHeights();
                update();
            }, 50);

            return el;
        };
    };

})();
