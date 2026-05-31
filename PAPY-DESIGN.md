# Papyr Design System Manual (PAPY-DESIGN.md)

Welcome to the **Papyr Design System**. Following our core philosophy of **"Simple inside, Beautiful outside,"** Papyr.js includes a highly optimized, hardware-accelerated design layer built directly into its core bundles and official plugins. 

This document serves as the master guide to Papyr's typography, layout engines, glassmorphism filters, cinematic animations, presets, gestures, and spring-physics engines.

---

## 📖 Table of Contents
1. [Core Design Tokens](#1-core-design-tokens)
2. [Layout Systems](#2-layout-systems)
3. [Glassmorphism Presets](#3-glassmorphism-presets)
4. [Cinematic Animations](#4-cinematic-animations)
5. [Spring Physics & Motion](#5-spring-physics--motion)
6. [Interactive Gestures & Swipes](#6-interactive-gestures--swipes)
7. [Parallax Scroll Presets](#7-parallax-scroll-presets)
8. [Live Try-it-Out Code Snippets](#8-live-try-it-out-code-snippets)

---

## 1. Core Design Tokens

Papyr uses a carefully curated, modern dark/glassmorphic palette designed to wow users. It avoids flat browser defaults in favor of premium, deep HSL shades.

| Token | CSS Variable / Value | Description |
|---|---|---|
| **Primary** | `#6366f1` / `rgb(99, 102, 241)` | Sleek indigo for primary buttons & accents |
| **Secondary** | `rgba(255, 255, 255, 0.05)` | Semi-transparent background for outline containers |
| **Accent Glow** | `rgba(99, 102, 241, 0.3)` | Soft shadow glow for premium micro-animations |
| **Background Dark** | `#0f172a` (Slate 900) | Foundation body background for high-contrast contrast |
| **Glass Base** | `rgba(255, 255, 255, 0.03)` | Ultra-thin backdrop blur layer |
| **Glass Border** | `rgba(255, 255, 255, 0.08)` | Subtly distinct light boundary for glass containers |

---

## 2. Layout Systems

Papyr features shorthand tokens to automatically build responsive layouts using pre-defined Flexbox and CSS Grid frameworks.

### Utility Presets Shorthand
Inside any Papyr tag builder, you can pass classes or styles using standard CSS names or inline utility definitions:

```javascript
// A center-aligned flex-row card with a large shadow
papyr.div('.flex .items-center .justify-between .rounded-2xl .shadow-lg .w-full', 
    papyr.h3("Dashboard Overview"),
    papyr.button("Refresh")
);
```

### Supported Layout Utilities
* `.flex` / `.inline-flex` / `.grid`
* `.center` (Flexbox center-align: `justify-content: center; align-items: center;`)
* `.items-center` / `.justify-between`
* `.flex-col` / `.flex-row` / `.flex-wrap`
* `.w-full` / `.h-full`

---

## 3. Glassmorphism Presets

The signature visual element of Papyr is its rich, premium **Glassmorphic Card UI**. These cards use backdrop-filters to blur background elements and produce a physical frosted-glass feel.

### Frosted Glass Card (`papyr.card`)
Creates an accessible glass frame with default subtle shadows and interactive hover scales:

```javascript
// Regular card
papyr.card("Card Title", "This is frosted-glass styled content.");

// Interactive card that glows on mouse-enter
papyr.card({ interactive: true },
    papyr.h3("Interactive Node"),
    papyr.p("Watch me glow and scale up subtly when hovered!")
);
```

### Manual Glass Presets
You can apply explicit CSS classes for styling custom elements:
* `.papyr-card`: High-blur, translucent background with rounded corners.
* `.glass-pop`: Micro-animation that scales the element from `0.3` to `1` with elastic backing.

---

## 4. Cinematic Animations

Papyr includes a hardware-accelerated **Scroll-to-Animate Observer** that triggers slick visual entrances as elements scroll into view.

### Native Entrance Effects
Add the `animate` attribute to any element, and Papyr will automatically handle observer attachment, spell checking, and transition executions.

```javascript
// Simple Fade Entrance
papyr.p({ animate: 'fade' }, "I fade smoothly when scrolled into view.");

// Elastic Entrance (once = false triggers it every time you scroll in/out)
papyr.div({ animate: 'elastic', 'data-animate-once': 'false' }, 
    "I bounce elastically every time you scroll back to me!"
);
```

### Available Presets
* `fade` / `fade-in`: Opacity transition.
* `slide` / `slide-up` / `slide-down`: Entrances combining offset and fade.
* `zoom` / `zoom-in`: Smooth element scale up.
* `blur` / `blur-in`: Soft pixel-unblur entrance.
* `elastic`: Bouncy scale-up.
* `glass-pop`: Elastic scaling with deep glass shadows.

---

## 5. Spring Physics & Motion

Standard linear easing curves can feel lifeless. Papyr incorporates a custom **Spring Physics Animator Solver** to model realistic kinetic energy based on mass, tension, and friction.

```javascript
// Animate an element elastically to x: 300px and opacity: 1
papyr.animate.spring(el, { x: 300, opacity: 1 }, {
    tension: 170,  // Spring tightness
    friction: 26,  // Resistance against movement
    mass: 1        // Element weight
});
```

---

## 6. Interactive Gestures & Swipes

Perfect for responsive mobile apps, the gesture controller binds real-time desktop click-drags and mobile touch events to trigger interactive card deck swipes.

```javascript
papyr.animate.gesture(cardElement, {
    onDrag: (dx, dy, el) => {
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 10}deg)`;
    },
    onSwipeRight: (el) => {
        papyr.toast("Approved! Saved to offline database.");
        el.style.opacity = '0';
    },
    onSwipeLeft: (el) => {
        papyr.toast("Discarded.");
        el.style.opacity = '0';
    }
});
```

---

## 7. Parallax Scroll Presets

Create modern spatial depth on your pages by moving foreground and background elements at contrasting speeds during scrolls:

```javascript
// Selects all nodes with class '.bg-stars' and moves them at 20% scroll speed
papyr.parallax('.bg-stars', 0.2);

// Moves '.hero-foreground' faster at 60% scroll speed
papyr.parallax('.hero-foreground', 0.6);
```

---

## 8. Live Try-it-Out Code Snippets

Here is a full copy-paste showcase page loading Papyr completed bundles and initializing the animations and layouts directly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Papyr Premium Motion Playground</title>
    <!-- Dynamic CDN Link to Papyr Complete Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/papyr-js@3.0.0/papyr-complete.js"></script>
    <style>
        body {
            background: #0b0f19;
            color: #f8fafc;
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    </style>
</head>
<body>

    <script>
        // Ensure Papyr is fully compiled and active
        papyr.ready(() => {
            
            // 1. Build a stunning premium responsive layout
            const container = papyr.div('.flex .flex-col .items-center .w-full', {
                style: { maxWidth: '800px' }
            });

            // 2. Add an animated frosted-glass header
            const header = papyr.card({ interactive: true, animate: 'glass-pop' },
                papyr.title("Design Playground"),
                papyr.muted("Tap, drag, or scroll to try physical micro-animations in real-time.")
            );

            // 3. Add a kinetic Spring button
            const btn = papyr.button("Click to Spring Bounce!", {
                variant: 'primary',
                on: {
                    click: () => {
                        papyr.animate.spring(btn, { scale: 1.2 }, { tension: 300, friction: 10 });
                        setTimeout(() => {
                            papyr.animate.spring(btn, { scale: 1.0 }, { tension: 200, friction: 15 });
                        }, 200);
                    }
                }
            });

            // 4. Assemble and mount
            container.appendChild(header);
            container.appendChild(papyr.div('.w-full', { style: { height: '30px' } }));
            container.appendChild(btn);
            
            document.body.appendChild(container);
        });
    </script>
</body>
</html>
```
