# Advanced & Plugins API

This module details the immersive 3D/2D graphics engine, 2D Verlet physics simulator, machine learning perceptrons, math function graphing, custom classes components, and performance power throttlers.

---

## Immersive Graphics Engine (`papyr['3d']`)

Orchestrates 3D canvas viewports. It automatically detects global `Three.js` (WebGL); if Three.js is absent, it falls back to a high-performance 2D Canvas rendering mathematically projected neon wireframes.

### Preset Shapes
* `papyr['3d'].cube(options)`
* `papyr['3d'].sphere(options)`
* `papyr['3d'].torus(options)`
  * *Parameters:* `color`, `position` `[x, y, z]`, `spin` `[rx, ry, rz]`, `size`, `wireframe` (Boolean). These parameters can be bound to reactive states.

### Example
```javascript
let sphereRadius = papyr.state(1.0);

const immersiveScene = papyr['3d'].scene({
    environment: 'cyberpunk', // 'space', 'cyberpunk', 'underwater'
    particles: true,
    depth: true,
    objects: [
        papyr['3d'].sphere({ radius: sphereRadius, color: '#f43f5e', position: [0, 0, 0] })
    ]
});
```

---

## 2D Verlet Physics Simulator (`papyr.physics`)

Integrates Verlet velocity calculations onto standard HTML elements, enabling gravity, collisions, drag forces, and elastic bounding boxes.

### Signature
```javascript
papyr.physics.verlet(element, config)
```

### Config Options
* `gravity` (Number): Fall speed coefficient (default: 0.5).
* `bounce` (Number): Elastic recovery coefficient (default: 0.7).
* `friction` (Number): Air resistance damping (default: 0.99).

### Example
```javascript
let bubble = papyr.div(".circle", "🎈");

papyr.physics.verlet(bubble, {
    gravity: 0.2,
    bounce: 0.8,
    friction: 0.98
});
```

---

## Scientific Graphing Plotter (`papyr.science`)

Plots math calculations directly onto HTML5 Canvas grids in real-time.

### Signature
```javascript
papyr.science.graph(canvasElement, equation, options)
```

### Example
```javascript
let canvas = papyr.canvas({ width: 400, height: 200 });

// Plots sine wave reactively
papyr.science.graph(canvas, 'Math.sin(x)', { color: '#10b981', scale: 20 });
```

---

## Machine Learning Engine (`papyr.ml`)

Provides basic client perceptron classification models with zero external dependencies.

### Example
```javascript
let brain = papyr.ml.perceptron({ inputs: 2, learningRate: 0.1 });

// Train AND logic gate
brain.train([0, 0], 0);
brain.train([0, 1], 0);
brain.train([1, 0], 0);
brain.train([1, 1], 1);

let prediction = brain.predict([1, 1]); // returns 1
```

---

## OOP Component Classes (`papyr.component`)

If you prefer Class-based structures over functional components, extend `papyr.component`. Your class must implement a `render()` method returning an element.

### Example
```javascript
class UserProfile extends papyr.component {
    constructor() {
        super();
        this.username = papyr.state("Alice");
    }
    
    render() {
        return papyr.div(".profile-card",
            papyr.h3(() => `User: ${this.username.value}`),
            papyr.button("Change", { onclick: () => this.username.value = "Bob" })
        );
    }
}

// Router and DOM builders recognize and render component instances automatically
papyr.route("/profile", UserProfile);
```

---

## Energy performance loop throttler (`papyr.power`)

Monitors device states and page visibility. It automatically slows animation loop paces and reduces rendering updates when the browser tab goes idle, conserving mobile CPU and battery cycles.

```javascript
papyr.power.state.subscribe((energyState) => {
    // energyState is 'active' or 'idle'
    console.log("Performance loops pace changed to:", energyState);
});
```
* Note: Scaled animations dynamically throttle down to 10fps when the tab is backgrounded.
