# Shapes & Physics API

This module details the functional vector shapes, CSS 3D primitives, Three.js bindings, and physics simulation engine of the **Papyrus Shapes Engine (PSE)**.

---

## 1. Vector Geometry Shapes

All shapes generate native, dynamically updateable SVG elements:

* **`papyr.rect(options)`**: Rectangle shape.
* **`papyr.circle(options)`**: Circle shape.
* **`papyr.triangle(options)`**: Triangle shape.
* **`papyr.ellipse(options)`**: Ellipse shape.
* **`papyr.polygon(options)`**: Regular polygon shape.

### Options
* `width` / `height` / `radius` / `size` (Number): Dimensions.
* `sides` (Number): Number of sides (for `polygon`).
* `style` (Object): Inline SVG style definitions (e.g. `fill`, `stroke`).

---

## 2. Line & Curve System

Construct math-based path lines and curves:

* **`papyr.line(options)`**: Creates lines (dash, dotted support).
* **`papyr.curve(options)`**: Creates quadratic and bezier curve paths.
* **`papyr.arc(options)`**: Circle arc segments.
* **`papyr.spline(options)`**: Multi-point interpolated splines.

---

## 3. Blobs, Liquids & Patterns

Organically morphing panels and dynamic backgrounds:

* **`papyr.blob(options)`**: Generates morphing SVG paths.
* **`papyr.organic(options)`**: Panel with transitioning `border-radius`.
* **`papyr.liquid(options)`**: Fluid wave panel.
* **`papyr.pattern(type, options)`**: Renders CSS grid background patterns (e.g. `'dots'`, `'grids'`, `'noise'`, `'waves'`, `'hexagons'`, `'checkerboards'`).

---

## 4. CSS 3D Primitives & Three.js Bridge

Build structural 3D grids or delegate directly to WebGL:

* **`papyr.cube(options)`**: Native six-sided CSS 3D cube face container.
* **`papyr.card(options)`**: Mouse/pointer perspective tilt card wrapper.
  * Options: `{ tilt: true, maxTilt: 15, perspective: 1000 }`.
* **`papyr.sphere` / `cylinder` / `cone` / `plane` / `torus`**: radial-gradient shaded CSS 3D shapes.
* **Three.js Binding**: If `THREE` is globally available, PSE automatically translates primitives to WebGL meshes.

---

## 5. Built-in Physics Engine (`papyr.physics`)

Register DOM elements in an isomorphic physics environment:

```javascript
// Enable physics simulation globally
papyr.physics.enable({ gravity: 0.5, friction: 0.02 });

// Add element to simulation
papyr.physics.add(element, {
    bounce: 0.7,         // Restitution coefficient
    velocity: { x: 5, y: -10 },
    bounds: 'viewport'   // Bounce off viewport boundaries
});
```
