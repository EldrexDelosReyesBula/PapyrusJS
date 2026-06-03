# Papyr Design System Manual (PAPY-DESIGN.md)

Welcome to the **Papyr Design System Manual**. Following our core philosophy of **"Simple inside, Beautiful outside,"** Papyr includes a hardware-accelerated, responsive design and animation engine built directly into its core bundles and official plugins.

This document serves as the master specification for typography, layout orchestration, design templates, cinematic animations, spring physics, and inline styling systems.

---

## 📖 Table of Contents
1. [Core Design Tokens](#1-core-design-tokens)
2. [Inline Styling System](#2-inline-styling-system)
3. [Layout Orchestration Engine (`papyr.layout`)](#3-layout-orchestration-engine-papyrlayout)
4. [Aesthetic Design Helpers (`papyr.design`)](#4-aesthetic-design-helpers-papyrdesign)
5. [Cinematic Animations & Spring Physics (`papyr.animate`)](#5-cinematic-animations--spring-physics-papyranimate)
6. [Creating Custom Design Layers](#6-creating-custom-design-layers)
7. [Live Interactive Showcase Page](#7-live-interactive-showcase-page)

---

## 1. Core Design Tokens

Papyr uses a carefully curated, modern dark/glassmorphic default palette based on slate and indigo colors. It avoids flat browser defaults in favor of premium, high-contrast HSL shades.

### Default Style Tokens
These custom properties are defined globally on `:root` inside [complete.css](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/src/styles/complete.css#L1-L15):

| Variable | Default Value | Description |
|---|---|---|
| `--papyr-primary` | `#6366f1` | Sleek indigo for call-to-actions and accents |
| `--papyr-primary-hover` | `#4f46e5` | Indigo hover state shadow |
| `--papyr-primary-light` | `rgba(99, 102, 241, 0.15)` | Translucent backing highlight |
| `--papyr-bg` | `#0f172a` | Deep Slate foundation body background |
| `--papyr-surface` | `#1e293b` | Slate surface cards and modals container |
| `--papyr-border` | `#334155` | Fine separator boundary |
| `--papyr-text` | `#f8fafc` | High-contrast off-white text |
| `--papyr-text-muted` | `#94a3b8` | Low-contrast grey description text |
| `--papyr-radius` | `12px` | Standard border radius curvature |
| `--papyr-font` | `system-ui, -apple-system, sans-serif` | Default modern system typography |

> [!TIP]
> **Customizing Stylesheets**: To override the default aesthetics, developers can redefine these variables in their app's local stylesheet:
> ```css
> :root {
>     --papyr-primary: #10b981; /* Emerald */
>     --papyr-radius: 16px;     /* Organic Rounded Corners */
>     --papyr-bg: #090d16;      /* Pitch Cyberpunk Dark */
> }
> ```

---

## 2. Inline Styling System

Papyr provides three expressive, clean APIs to style HTML elements directly inside JavaScript parameter lists:

### A. Selector Shorthands
You can declare class names, IDs, and nested child text nodes directly in the selector string:
```javascript
// Creates: <div id="card-main" class="card shadow-lg">Hello</div>
papyr.div(".card.shadow-lg#card-main:Hello");
```

> [!WARNING]
> Class names containing spaces (e.g. `".flex .gap-4"`) are automatically split and trimmed at compile-time to prevent DOMException errors.

### B. Inline Option Styles
You can pass styles as a dictionary inside the options object. The values can be static strings or **reactive states**:
```javascript
const isActive = papyr.state(false);

const card = papyr.div({
    style: () => ({
        padding: '20px',
        background: isActive.value ? 'var(--papyr-primary)' : 'rgba(255, 255, 255, 0.03)',
        transition: 'background 0.3s ease'
    }),
    onclick: () => isActive.value = !isActive.value
}, "Click to Toggle Color");
```

### C. Layout Utility Array (`paper` / `papyr`)
For rapid component styling, pass layout class lists inside the `paper` (or `papyr`) options parameter:
```javascript
papyr.div({
    paper: ["flex", "center", "rounded-xl", "sm:flex-col", "md:flex-row"]
}, "Shorthand Layout Node");
```
* **Supported Utilities**: `flex`, `block`, `inline`, `grid`, `hidden`, `center`, `items-center`, `justify-between`, `flex-col`, `flex-row`, `rounded-sm` to `rounded-full`, `shadow-sm` to `shadow-xl`, `w-full`, `h-full`.
* **Breakpoints**: Add responsive layouts prefixes (e.g. `sm:flex-col`, `md:flex-row`) to dynamically inject rules inside `@media` scopes.

---

## 3. Layout Orchestration Engine (`papyr.layout`)

The layout module provides semantic layouts to assemble application viewports dynamically without writing raw styles:

### Flex Container (`papyr.layout.flex` / `row` / `col`)
* `papyr.layout.row(...children)`: Centers nodes in a horizontal row.
* `papyr.layout.col(...children)`: Stacks nodes vertically.
* `papyr.layout.flex(options, ...children)`: Mapped to responsive flex layouts. Supports parameters: `direction`, `wrap`, `justify`, `align`, and `gap`.

### Grid Container (`papyr.layout.grid`)
Arranges child elements in a CSS Grid:
```javascript
// Scaffolds a responsive dashboard layout grid
papyr.layout.grid({ cols: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
    papyr.card("Card A", "Details..."),
    papyr.card("Card B", "Details..."),
    papyr.card("Card C", "Details...")
);
```

### Adaptive Viewport Templates
1. **`papyr.layout.mobile(options, ...children)`**: Builds a mobile view containing a header panel, scrollable main viewport, and bottom navigation bar.
2. **`papyr.layout.tablet(options, ...children)`**: Arranges elements alongside a compact vertical navigation aside rail.
3. **`papyr.layout.desktop(options, ...children)`**: Renders a sidebar control deck, main content stage, and sidebar inspector panel.
4. **`papyr.layout.foldable(options, ...children)`**: Scaffolds a spanning display layout. It splits content into a two-screen split grid if a viewport fold is detected, falling back to single columns on small displays.

### Dashboard Shell (`papyr.layout.dashboard`)
A structured app shell with a header, footer, routing viewport, and a collapsible responsive sidebar:
```javascript
papyr.layout.dashboard({
    header: papyr.h2("App Title"),
    sidebar: papyr.div(".sidebar-nav", papyr.button("Dashboard"), papyr.button("Settings")),
    main: papyr.div("Active content template rendering inside the stage."),
    footer: papyr.span("© 2026 Papyr Team"),
    sidebarWidth: '240px'
});
```

### Hero Section (`papyr.layout.hero`)
Generates high-contrast centered sections for landing pages:
```javascript
papyr.layout.hero({
    title: "Agile Web Creation Engine",
    subtitle: "Build responsive sites with native spring animations and localized CRUD databases.",
    glass: true,
    actions: [
        { text: "Get Started", primary: true, attrs: { onclick: () => navigate("/start") } },
        { text: "Documentation", primary: false }
    ]
});
```

---

## 4. Aesthetic Design Helpers (`papyr.design`)

The design plugin provides aesthetics and compiler shortcuts:

### Design Alignment Methods
* `papyr.center(...args)`: Flexbox center-aligned viewport wrapper.
* `papyr.left(...args)`: Flexbox left-aligned row wrapper.
* `papyr.right(...args)`: Flexbox right-aligned row wrapper.
* `papyr.justify(...args)`: Flexbox horizontal distribution wrapper.
* `papyr.glass(...args)`: Frosted-glass container with default `16px` backdrop blurs and borders.

### Templates (`papyr.template`)
Restores pre-scaffolded visual structures:
```javascript
// Appends a standard double-column responsive metrics dashboard layout
document.body.appendChild(papyr.template('glass-dashboard'));
```

### Figma Compiler (`papyr.import.figma`)
Translates Figma JSON nodes into compiled, styled HTML layout trees:
```javascript
// Accepts a figma frame/text node and translates it to DOM element structures
const frameNode = papyr.import.figma(figmaJsonFrame);
document.body.appendChild(frameNode);
```

---

## 5. Cinematic Animations & Spring Physics (`papyr.animate`)

Papyr focuses on visual delight, including spring physics engines and scroll entrance animators:

### Scroll Entrances
Add the `animate` attribute to any element. The entrance fires once the node scrolls into view:
```javascript
papyr.h1({ animate: 'glass-pop' }, "I pop elastically with drop-shadows!");
```
* **Supported Animations**: `fade`, `slide-up`, `slide-down`, `zoom-in`, `blur-in`, `elastic`, `glass-pop`.
* **Configuration**: Set `data-animate-once="false"` on the element to trigger the entrance every time it scrolls into the viewport.

### Kinetic Spring Physics (`papyr.animate.spring`)
Calculates coordinates using a mass-tension-friction solver. It batches transformations to allow simultaneous translations and scaling:
```javascript
papyr.animate.spring(element, 
    { x: 120, y: -40, scale: 1.15, opacity: 0.9 }, // Animated values
    { tension: 170, friction: 26, mass: 1 }        // Spring parameters
);
```

> [!IMPORTANT]
> **Spring Cancellation**: The spring engine automatically calls `_springCancel()` if another spring animation is triggered on the same element, preventing visual fighting.

### Swipe Gesture Trackers (`papyr.animate.gesture`)
Tracks desktop clicks and mobile drag actions:
```javascript
papyr.animate.gesture(element, {
    onDrag: (x, y, el) => {
        el.style.transform = `translate(${x}px, ${y}px) rotate(${x / 8}deg)`;
    },
    onRelease: (x, y, el) => {
        // Return element back to center using kinetic spring solver
        papyr.animate.spring(el, { x: 0, y: 0, scale: 1.0 });
    }
});
```

### Parallax Scroll Speeds (`papyr.parallax`)
Moves elements at custom rates relative to scrolls:
```javascript
// Move star elements at 15% scroll speeds to create depth
papyr.parallax('.bg-stars', 0.15);
```

---

## 6. Creating Custom Design Layers

Developers can register custom utility mappings, breakpoints, and themes by installing a custom design layer:

```javascript
// 1. Declare custom layout styles and utility bindings
const NeoBrutalistDesignPlugin = {
    name: 'neo-brutalist-design',
    version: '1.0.0',
    install(kernel) {
        // Add custom theme token variables
        if (typeof document !== 'undefined') {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --papyr-primary: #ffde43; /* Bright Yellow */
                    --papyr-surface: #ffffff;  /* Solid White */
                    --papyr-border: #000000;   /* Thick Black border */
                    --papyr-radius: 0px;       /* Sharp Corners */
                }
                .neo-shadow {
                    box-shadow: 4px 4px 0px 0px #000000 !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Register custom layout structures
        kernel.layout.neocard = (...children) => {
            return kernel.div('.neo-shadow', {
                style: {
                    background: 'var(--papyr-surface)',
                    border: '3px solid var(--papyr-border)',
                    padding: '24px',
                    color: '#000000'
                }
            }, ...children);
        };
    }
};

// 2. Install the design plugin
papyr.use(NeoBrutalistDesignPlugin);

// 3. Build components using the new design layer
const customCard = papyr.layout.neocard(
    papyr.h3("Neo-Brutalist Element"),
    papyr.p("This element incorporates sharp borders and solid yellow tokens.")
);
```

---

## 7. Live Interactive Showcase Page

This self-contained showcase code loads the `complete` bundle and highlights how responsive layouts, inline utilities, and spring animations operate:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Papyr Design & Motion Showcase</title>
    <!-- Outfit Font -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <!-- Local Papyr Complete Showcase Build -->
    <script src="../public/papyr-complete.js"></script>
    <style>
        body {
            background-color: #0b0f19;
            color: #f8fafc;
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            min-height: 100vh;
        }
        .app-container {
            width: 100%;
            max-width: 900px;
            padding: 40px 24px;
            display: flex;
            flex-direction: column;
            gap: 32px;
        }
        .box-spring {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: grab;
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
            user-select: none;
            touch-action: none;
        }
    </style>
</head>
<body>

    <div class="app-container" id="app-root"></div>

    <script>
        // Start layout and component builder
        const app = papyr;

        // Reactive state
        const itemsCount = app.state(4);

        // Header Panel
        const Header = app.layout.hero({
            title: "Papyr Motion Studio",
            subtitle: "Try dragging the kinetic box or clicking below to verify spring physics resolution.",
            glass: true
        });

        // Interactive spring box component
        const SpringCard = app.glass({ style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' } },
            app.h3("Interactive Springs & Gestures"),
            app.p({ style: { color: '#94a3b8', fontSize: '14px', textAlign: 'center' } }, 
                "Grab and drag the card below. Releasing it triggers onRelease to spring it back to center."
            ),
            app.div(".box-spring", "🚀", {
                onMounted: (el) => {
                    app.animate.gesture(el, {
                        onDrag: (x, y) => {
                            el.style.transform = `translate(${x}px, ${y}px) scale(1.15)`;
                        },
                        onRelease: (x, y) => {
                            app.animate.spring(el, { x: 0, y: 0, scale: 1.0 }, { tension: 180, friction: 12 });
                        }
                    });
                }
            })
        );

        // Grid Layout section
        const GridLayoutSection = app.div({},
            app.h3({ style: { marginBottom: '16px' } }, "Responsive Grid Columns"),
            app.layout.grid({ cols: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
                app.glass(app.h4("Column 1"), app.p("Grid auto-fits dynamically.")),
                app.glass(app.h4("Column 2"), app.p("Toggles rows on mobile.")),
                app.glass(app.h4("Column 3"), app.p("Respects margin gaps."))
            )
        );

        // Scaffold UI tree
        const UI = app.div(".flex.flex-col", { style: { gap: '32px' } },
            Header,
            SpringCard,
            GridLayoutSection
        );

        // Mount to view
        app.mount("#app-root", UI);
    </script>
</body>
</html>
