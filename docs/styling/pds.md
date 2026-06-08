# Papyrus Design System (PDS) Guidelines

Welcome to the strict guidelines for the Papyrus Design System. These principles ensure that all applications built with Papyr.js are consistent, performant, accessible, and beautiful.

---

## Core Principles

### 1. Consistency

* **Spacing Scale**: Spacing must follow a consistent, power-of-two proportional scale:
  * `4px` (extra small)
  * `8px` (small)
  * `16px` (medium / standard)
  * `24px` (large)
  * `32px` (extra large)
  * `48px` / `64px` (layout sections)
* **Typography**: Maintain strict font hierarchies. Prefer Outfit or Inter fonts over standard sans-serif. Use established sizes (e.g., H1: `2.5rem`, H2: `1.8rem`, H3: `1.4rem`, Body: `1rem`, Small: `0.8rem`).

### 2. Predictability

* **Behavior**: UI elements should respond to actions in a uniform manner. Double-click, drag, and click actions must perform consistent operations across all pages.
* **States**: Ensure hover, active, focus, and disabled states are declared clearly for all interactive controls (buttons, links, inputs).

### 3. Accessibility (A11y)

* **Keyboard Navigation**: All custom components must support keyboard accessibility. Interactive widgets must have visible focus rings (`outline: 2px solid var(--papyr-primary)`) and support standard keys (`Enter`, `Space`, `Escape`).
* **ARIA Attributes**: Set roles and accessibility attributes (e.g., `role="dialog"`, `aria-modal="true"`) on modals, dialogs, lists, and form elements.

### 4. Responsiveness

* **Mobile-First**: Design layouts starting with small screens and scale up using media breakpoints.
* **Layout Utilities**: Use Papyr's built-in flex and grid wrappers to structure viewports rather than defining hardcoded widths/heights in pixels.

### 5. Motion & Animation Philosophy

* **Purposeful Motion**: Avoid flashing, shaking, or purely decorative loops that distract the user. Motion should guide the user's attention.
* **GPU-Accelerated**: Animations must prefer transform coordinates (`translate`, `scale`, `rotate`) and `opacity` properties. These run on the GPU, avoiding expensive reflows.
* **Layout Thrashing**: Never measure layout dimensions (`offsetHeight`, `offsetWidth`, `clientHeight`, etc.) inside active frame rendering loops (like requestAnimationFrame). Always cache these dimensions when initialized or on window resize.
* **Heavy Repaints**: Avoid animating properties that trigger layout re-paints (like `box-shadow`, `border-radius`, `top`, `left`, `width`, `height`).

### 6. Clarity

* **Visual Hierarchy**: Align items to a strict grid. Muted color shades must be reserved for descriptions and side rails, while high-contrast colors are reserved for active titles and call-to-actions.

### 7. Performance

* **Visual Effects**: Keep CSS drop-shadows and backdrop blurs to a moderate level. Heavy glassmorphic blurs (`backdrop-filter`) should be applied only on modal overlays, not on every page item, to prevent page scrolling lag on low-end mobile devices.
