# Animation API

This module details the visual fade animations, hardware-accelerated transitions, kinetic spring physics, gesture touch tracking, and parallax observers.

---

## Fade Transitions

Simple visual transitions. `fadeOut` automatically removes the element from the DOM when the animation finishes.

### Signatures
```javascript
papyr.fadeIn(element, duration)
papyr.fadeOut(element, duration)
```

### Example
```javascript
let card = papyr.div("Hello World!");
papyr.fadeIn(card, 500); // Fades in over 500ms
```

---

## Hardware-Accelerated Transitions (`papyr.animate`)

Applies properties using smooth CSS transition interpolation.

### Signature
```javascript
papyr.animate(element, properties, duration)
```

### Example
```javascript
let box = papyr.div({ style: { width: '50px', height: '50px', background: 'teal' } });

// Animates width and rounded borders over 600ms
papyr.animate(box, { width: '200px', borderRadius: '12px' }, 600);
```

---

## Spring Physics Transitions (`papyr.animate.spring`)

Performs animations based on physical spring models, avoiding linear ease states for a more natural look.

### Signature
```javascript
papyr.animate.spring(element, properties, config)
```

### Config Options
* `tension` (Number): Resistance force (default: 170).
* `friction` (Number): Damping coefficient (default: 26).
* `mass` (Number): Object weight multiplier (default: 1).

### Example
```javascript
let box = papyr.div("🎁", { style: { width: '50px', height: '50px', background: 'indigo' } });

// Springs scale and rotation using physics equations
papyr.animate.spring(box, 
    { scale: 1.5, rotate: 45 }, 
    { tension: 120, friction: 14 }
);
```

---

## Touch Gesture Tracking (`papyr.animate.gesture`)

Attaches touch/drag gesture track observers to elements to build swipeable layouts or drag-to-delete cards.

### Signature
```javascript
papyr.animate.gesture(element, options)
```

### Example
```javascript
let dragCard = papyr.div(".card", "Drag Me!");

papyr.animate.gesture(dragCard, {
    onDrag: (x, y) => {
        dragCard.style.transform = `translate(${x}px, ${y}px)`;
    },
    onRelease: () => {
        // Return back using smooth spring physics
        papyr.animate.spring(dragCard, { translateX: 0, translateY: 0 });
    }
});
```

---

## Parallax Observers (`papyr.parallax`)

Applies mouse or page scroll parallax depth offsets to backgrounds and viewport panels.

### Signature
```javascript
papyr.parallax(selector, speed)
```

### Example
```javascript
// Shifts elements matching selector by a ratio of scroll distance
papyr.parallax(".starfield-bg", 0.5);
```
