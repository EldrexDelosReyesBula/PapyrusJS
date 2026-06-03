# DOM API

This module details the core elements builder, selector engine, mounting, layout structures, and error boundaries of Papyr.js.

---

## Element Creation

Every standard HTML5 tag is exposed directly as a method on the global `papyr` instance.

### Signature
```javascript
papyr.tag(...args)
```

### Arguments
* `...args` can be:
  * **String Selector:** (Optional as first arg) Sets class names, ID and simple child mapping (e.g. `".btn#submit"`, `"h1:Title Text"`).
  * **Options Object:** Configuration dictionary for styles, attributes, datasets, events, and lifecycles.
  * **Children Nodes:** Element trees, string text nodes, reactive states, array lists, or updater functions.

### Options Object Parameters

```javascript
{
  style: { color: 'red' },      // Inline styling attributes (reactive values supported)
  attrs: { role: 'banner' },    // Custom DOM property settings
  data: { userId: '123' },      // Mapped to element.dataset (data-user-id="123")
  
  // Lifecycles
  onMounted: (el) => {},        // Fires when element is attached to DOM
  onUnmounted: (el) => {},      // Fires when element is removed
  onUpdated: (el) => {},        // Fires on attribute/child tree mutations
  
  // Custom Stylesheet Utilities (Paper CSS)
  paper: ["flex", "rounded-md", "md:flex-row"],
  
  // Event listeners
  on: { click: (e) => {} },     // Event listener group
  onclick: (e) => {}            // Shortcut listener attribute
}
```

---

## Selector Parser Syntax

You can declare classes, IDs, and nested child elements directly inside the first string parameter:

* **Classes:** `.classname` -> Adds class to element classList.
* **IDs:** `#id` -> Sets ID attribute.
* **Tag Content:** `tag:text` -> Creates a nested child element.

### Examples
```javascript
// Creates: <div id="card-1" class="shadow-lg p-4"></div>
let element1 = papyr.div(".shadow-lg.p-4#card-1");

// Creates: <div><h2>Title Text</h2></div>
let element2 = papyr.div("h2:Title Text");
```

---

## Layout Shorthand Classes (`paper`)

Papyr contains a built-in stylesheet injector. You can pass classes inside a `paper` array parameter. It maps custom utilities and breakpoints dynamically:

```javascript
let card = papyr.div({
    paper: ["flex", "center", "sm:flex-col", "md:flex-row"]
});
```

### Supported Breakpoints
* `sm:` (min-width: 640px)
* `md:` (min-width: 768px)
* `lg:` (min-width: 1024px)
* `xl:` (min-width: 1280px)

---

## Mounting Elements

Mounts a compiled element tree to a target container.

### Signature
```javascript
papyr.mount(selector, component)
```

### Arguments
* `selector` (String): CSS selector target container.
* `component` (HTMLElement): Compiled element tree.

---

## Schema Validator

Generates validation callback filters checking structures against definitions.

### Signature
```javascript
papyr.validate(schema)
```

### Example
```javascript
const userSchema = papyr.validate({
    username: { type: 'string', required: true },
    age: { type: 'number', required: false }
});

const errors = userSchema({ username: '', age: 'twenty' });
// Returns: { username: "Required field", age: "Must be of type number" }
```

---

## Error Boundaries

Wraps rendering functions in safe boundaries to prevent app-wide crashes if an element fails to render.

### Signature
```javascript
papyr.errorBoundary(renderFn, fallbackFn)
```

### Example
```javascript
let ui = papyr.errorBoundary(
    () => papyr.div("Data: " + rawData.value.nested.prop),
    (err) => papyr.div(".error-card", "Failed to render widget: " + err.message)
);
```
