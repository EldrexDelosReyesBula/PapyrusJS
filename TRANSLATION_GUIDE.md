# 🔄 Papyr to Vanilla Web Translation Guide

This guide helps developers understand how Papyr code translates to vanilla HTML, CSS, and JavaScript. Perfect for learning, debugging, and understanding the underlying web standards.

---

## 📚 Table of Contents
- [DOM Element Translation](#dom-element-translation)
- [State & Reactivity Translation](#state--reactivity-translation)
- [Event Handling Translation](#event-handling-translation)
- [Styling & Layout Translation](#styling--layout-translation)
- [Component Translation](#component-translation)
- [Advanced Patterns](#advanced-patterns)
- [Translation Dictionary](#translation-dictionary)

---

## DOM Element Translation

### Basic Elements

#### Papyr Code
```javascript
let heading = papyr.h1("Hello World");
let paragraph = papyr.p("This is a paragraph");
let button = papyr.button("Click me", { id: "btn-main" });
```

#### Vanilla HTML
```html
<h1>Hello World</h1>
<p>This is a paragraph</p>
<button id="btn-main">Click me</button>
```

#### Vanilla JavaScript
```javascript
const heading = document.createElement('h1');
heading.textContent = 'Hello World';

const paragraph = document.createElement('p');
paragraph.textContent = 'This is a paragraph';

const button = document.createElement('button');
button.id = 'btn-main';
button.textContent = 'Click me';
```

---

### Container Elements

#### Papyr Code
```javascript
let container = papyr.div(
    papyr.h1("Title"),
    papyr.p("Content here"),
    papyr.button("Action")
);
```

#### Vanilla HTML
```html
<div>
    <h1>Title</h1>
    <p>Content here</p>
    <button>Action</button>
</div>
```

#### Vanilla JavaScript
```javascript
const container = document.createElement('div');
const heading = document.createElement('h1');
heading.textContent = 'Title';
const para = document.createElement('p');
para.textContent = 'Content here';
const btn = document.createElement('button');
btn.textContent = 'Action';

container.appendChild(heading);
container.appendChild(para);
container.appendChild(btn);
```

---

## State & Reactivity Translation

### Basic State

#### Papyr Code
```javascript
let count = papyr.state(0);
console.log(count.value); // 0
count.value = 5;
count.subscribe(newValue => {
    console.log("Count changed to:", newValue);
});
```

#### Vanilla JavaScript (Observer Pattern)
```javascript
class ReactiveState {
    constructor(initialValue) {
        this.value = initialValue;
        this.subscribers = [];
    }
    
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }
    
    notify() {
        this.subscribers.forEach(sub => sub(this.value));
    }
    
    setValue(newValue) {
        this.value = newValue;
        this.notify();
    }
}

const count = new ReactiveState(0);
console.log(count.value); // 0
count.subscribe(newValue => {
    console.log("Count changed to:", newValue);
});
count.setValue(5); // Triggers callback
```

---

### Computed Properties

#### Papyr Code
```javascript
let price = papyr.state(100);
let taxRate = papyr.state(0.08);

let totalPrice = papyr.computed(() => {
    return price.value * (1 + taxRate.value);
});

console.log(totalPrice.value); // 108
price.value = 200;
console.log(totalPrice.value); // 216
```

#### Vanilla JavaScript
```javascript
class ComputedValue {
    constructor(computeFn) {
        this.computeFn = computeFn;
        this.cachedValue = this.computeFn();
        this.subscribers = [];
    }
    
    get value() {
        this.cachedValue = this.computeFn();
        return this.cachedValue;
    }
    
    subscribe(callback) {
        this.subscribers.push(callback);
    }
    
    notify() {
        const newValue = this.computeFn();
        if (newValue !== this.cachedValue) {
            this.cachedValue = newValue;
            this.subscribers.forEach(sub => sub(newValue));
        }
    }
}

const price = new ReactiveState(100);
const taxRate = new ReactiveState(0.08);

const totalPrice = new ComputedValue(() => {
    return price.value * (1 + taxRate.value);
});

console.log(totalPrice.value); // 108
price.setValue(200);
console.log(totalPrice.value); // 216
```

---

## Event Handling Translation

### Click Events

#### Papyr Code
```javascript
let clickCount = papyr.state(0);

let button = papyr.button(
    "Click me",
    {
        onclick: () => {
            clickCount.value++;
        }
    }
);
```

#### Vanilla HTML + JavaScript
```html
<button id="myBtn">Click me</button>

<script>
    let clickCount = 0;
    
    const button = document.getElementById('myBtn');
    button.addEventListener('click', () => {
        clickCount++;
        console.log(clickCount);
    });
</script>
```

---

### Form Input Events

#### Papyr Code
```javascript
let formValue = papyr.state("");

let input = papyr.input("text", "Enter text", {
    onchange: (e) => {
        formValue.value = e.target.value;
    },
    onkeyup: (e) => {
        console.log("Typing:", e.target.value);
    }
});
```

#### Vanilla HTML + JavaScript
```html
<input type="text" placeholder="Enter text" id="textInput">

<script>
    let formValue = "";
    
    const input = document.getElementById('textInput');
    
    input.addEventListener('change', (e) => {
        formValue = e.target.value;
    });
    
    input.addEventListener('keyup', (e) => {
        console.log("Typing:", e.target.value);
    });
</script>
```

---

## Styling & Layout Translation

### Direct Styles

#### Papyr Code
```javascript
let box = papyr.div("Content", {
    style: {
        backgroundColor: "#FF5733",
        padding: "20px",
        borderRadius: "8px",
        color: "white"
    }
});
```

#### Vanilla HTML
```html
<div style="background-color: #FF5733; padding: 20px; border-radius: 8px; color: white;">
    Content
</div>
```

#### Vanilla JavaScript
```javascript
const box = document.createElement('div');
box.textContent = 'Content';
box.style.backgroundColor = '#FF5733';
box.style.padding = '20px';
box.style.borderRadius = '8px';
box.style.color = 'white';
```

---

### CSS Classes

#### Papyr Code
```javascript
let card = papyr.div("Card content", {
    class: "card card-primary shadow-lg"
});
```

#### Vanilla HTML
```html
<div class="card card-primary shadow-lg">Card content</div>
```

#### Vanilla JavaScript
```javascript
const card = document.createElement('div');
card.textContent = 'Card content';
card.className = 'card card-primary shadow-lg';
// Or using classList:
card.classList.add('card', 'card-primary', 'shadow-lg');
```

---

### Flex Layout

#### Papyr Code
```javascript
let layout = papyr.flex.row(
    papyr.div("Item 1"),
    papyr.div("Item 2"),
    papyr.div("Item 3")
);
```

#### Vanilla HTML
```html
<div style="display: flex; flex-direction: row;">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
```

#### Vanilla CSS
```css
.flex-row {
    display: flex;
    flex-direction: row;
}

.flex-col {
    display: flex;
    flex-direction: column;
}

.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

---

## Component Translation

### Card Component

#### Papyr Code
```javascript
let myCard = papyr.card(
    "Card Title",
    "This is the card content",
    "Footer text"
);
```

#### Vanilla HTML
```html
<div class="card">
    <div class="card-header">
        <h3>Card Title</h3>
    </div>
    <div class="card-body">
        This is the card content
    </div>
    <div class="card-footer">
        Footer text
    </div>
</div>
```

#### Vanilla CSS
```css
.card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
    background: #f5f5f5;
}

.card-body {
    padding: 16px;
}

.card-footer {
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    background: #f9f9f9;
}
```

---

### Modal Component

#### Papyr Code
```javascript
let modal = papyr.modal(
    papyr.p("Are you sure?"),
    "Confirm"
);
modal.show();
modal.hide();
```

#### Vanilla HTML
```html
<div id="modal" class="modal" style="display: none;">
    <div class="modal-overlay"></div>
    <div class="modal-content">
        <h2 class="modal-title">Confirm</h2>
        <div class="modal-body">
            <p>Are you sure?</p>
        </div>
    </div>
</div>
```

#### Vanilla JavaScript
```javascript
class Modal {
    constructor(content, title) {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <h2 class="modal-title">${title}</h2>
                <div class="modal-body">${content}</div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }
    
    show() {
        this.modal.style.display = 'block';
    }
    
    hide() {
        this.modal.style.display = 'none';
    }
}

const modal = new Modal('<p>Are you sure?</p>', 'Confirm');
modal.show();
modal.hide();
```

#### Vanilla CSS
```css
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.modal-content {
    position: relative;
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-title {
    padding: 16px;
    margin: 0;
    border-bottom: 1px solid #e0e0e0;
}

.modal-body {
    padding: 16px;
}
```

---

## Advanced Patterns

### Conditional Rendering

#### Papyr Code
```javascript
let isLoggedIn = papyr.state(false);

let ui = papyr.if(
    isLoggedIn,
    papyr.p("Welcome!"),
    papyr.p("Please log in.")
);
```

#### Vanilla JavaScript
```javascript
function renderUI(isLoggedIn) {
    const container = document.getElementById('app');
    container.innerHTML = '';
    
    if (isLoggedIn) {
        const p = document.createElement('p');
        p.textContent = 'Welcome!';
        container.appendChild(p);
    } else {
        const p = document.createElement('p');
        p.textContent = 'Please log in.';
        container.appendChild(p);
    }
}

// Or with Conditional Operator
const ui = isLoggedIn 
    ? '<p>Welcome!</p>' 
    : '<p>Please log in.</p>';
```

---

### List Rendering

#### Papyr Code
```javascript
let items = papyr.state([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" }
]);

let list = papyr.for(items, (item) =>
    papyr.li(item.name)
);
```

#### Vanilla JavaScript
```javascript
const items = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" }
];

const list = document.createElement('ul');

items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    list.appendChild(li);
});
```

#### Vanilla HTML
```html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
```

---

### Reactive Counter Example

#### Papyr Code (Complete)
```javascript
let count = papyr.state(0);

let app = papyr.div(
    papyr.h1("Counter App"),
    papyr.p(() => `Count: ${count.value}`),
    papyr.button("Increment", {
        onclick: () => count.value++
    }),
    papyr.button("Decrement", {
        onclick: () => count.value--
    })
);

papyr.mount('#app', app);
```

#### Vanilla JavaScript (Complete)
```javascript
// HTML State
let count = 0;
const countDisplay = document.getElementById('count-display');

// Create Elements
const app = document.createElement('div');
const heading = document.createElement('h1');
heading.textContent = 'Counter App';

const para = document.createElement('p');
para.id = 'count-display';
para.textContent = `Count: ${count}`;

const incrementBtn = document.createElement('button');
incrementBtn.textContent = 'Increment';
incrementBtn.addEventListener('click', () => {
    count++;
    para.textContent = `Count: ${count}`;
});

const decrementBtn = document.createElement('button');
decrementBtn.textContent = 'Decrement';
decrementBtn.addEventListener('click', () => {
    count--;
    para.textContent = `Count: ${count}`;
});

// Assemble
app.appendChild(heading);
app.appendChild(para);
app.appendChild(incrementBtn);
app.appendChild(decrementBtn);

// Mount
document.getElementById('app').appendChild(app);
```

#### Vanilla HTML (Complete)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Counter App</title>
</head>
<body>
    <div id="app">
        <h1>Counter App</h1>
        <p id="count-display">Count: 0</p>
        <button id="increment-btn">Increment</button>
        <button id="decrement-btn">Decrement</button>
    </div>
    
    <script>
        let count = 0;
        const countDisplay = document.getElementById('count-display');
        const incrementBtn = document.getElementById('increment-btn');
        const decrementBtn = document.getElementById('decrement-btn');
        
        function updateDisplay() {
            countDisplay.textContent = `Count: ${count}`;
        }
        
        incrementBtn.addEventListener('click', () => {
            count++;
            updateDisplay();
        });
        
        decrementBtn.addEventListener('click', () => {
            count--;
            updateDisplay();
        });
    </script>
</body>
</html>
```

---

## Translation Dictionary

### Quick Reference Table

| Papyr | Vanilla JavaScript | Purpose |
|-------|-------------------|---------|
| `papyr.div()` | `document.createElement('div')` | Create div element |
| `papyr.p()` | `document.createElement('p')` | Create paragraph |
| `papyr.h1()` to `papyr.h6()` | `document.createElement('h1-h6')` | Create headings |
| `papyr.button()` | `document.createElement('button')` | Create button |
| `papyr.input()` | `document.createElement('input')` | Create input |
| `papyr.state(value)` | Custom ReactiveState class | Create reactive variable |
| `papyr.computed()` | Custom ComputedValue class | Create computed value |
| `.value` | Direct variable access | Read/write state |
| `.subscribe()` | Observer/Listener pattern | Listen to changes |
| `papyr.mount()` | `element.appendChild()` | Insert to DOM |
| `papyr.if()` | Ternary or if/else | Conditional rendering |
| `papyr.for()` | `array.forEach()` or `map()` | List rendering |
| `{ style: {} }` | `element.style.property` | Inline styles |
| `{ class: "..." }` | `element.className` | CSS classes |
| `{ onclick: fn }` | `addEventListener('click', fn)` | Event handling |
| `papyr.flex.row()` | CSS flexbox display: flex | Flex layout |
| `papyr.card()` | Custom component/CSS | Card widget |
| `papyr.modal()` | Custom component/CSS | Modal dialog |

---

## Common Conversion Patterns

### Pattern 1: Attribute Assignment

```javascript
// Papyr
papyr.div("Text", { id: "myDiv", class: "container primary" })

// Vanilla
const div = document.createElement('div');
div.textContent = "Text";
div.id = "myDiv";
div.className = "container primary";
// Or: div.classList.add('container', 'primary');
```

### Pattern 2: Event Delegation

```javascript
// Papyr (with reactive state)
let clicks = papyr.state(0);
papyr.button("Click", { onclick: () => clicks.value++ })

// Vanilla
let clicks = 0;
const btn = document.createElement('button');
btn.textContent = "Click";
btn.addEventListener('click', () => clicks++);
```

### Pattern 3: Dynamic Content

```javascript
// Papyr
let message = papyr.state("Hello");
papyr.p(() => `Message: ${message.value}`)

// Vanilla
let message = "Hello";
const p = document.createElement('p');
p.textContent = `Message: ${message}`;
// To update: p.textContent = `Message: ${message}`;
```

---

## Tips for Manual Translation

1. **Always use `document.createElement()`** for creating elements
2. **Use `addEventListener()`** instead of setting event handlers directly
3. **Manual DOM updates** require explicit re-rendering logic
4. **Implement observer pattern** for reactive state behavior
5. **Use CSS classes** for styling instead of inline styles where possible
6. **Test browser compatibility** for newer JavaScript features
7. **Consider performance** - vanilla JS has no virtual DOM optimization

---

## Resources

- [MDN Web Docs - DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [MDN - Event Handling](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [Vanilla JS vs Frameworks Comparison](https://vanilla-js.com/)

---

*This guide helps bridge the gap between Papyr's abstraction and web standards. Use it to deepen your understanding of how modern web frameworks work under the hood.*
