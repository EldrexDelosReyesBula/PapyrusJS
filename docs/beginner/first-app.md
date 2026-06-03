# Building Your First Papyr App

In this guide, we will build a responsive and interactive counter app in less than two minutes.

---

## 1. The HTML Boilerplate

Create an empty directory on your machine, then create a file called `index.html`. Add the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Papyr App</title>
  <!-- Load complete Papyr CDN bundle -->
  <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
</head>
<body style="margin: 0; background: #0b0f19; color: #f3f4f6; font-family: sans-serif;">
  <div id="app"></div>
  <script>
    // App logic goes here!
  </script>
</body>
</html>
```

---

## 2. Setting Up Reactive State

Add the following inside your `<script>` tag:

```javascript
// Initialize reactive state
const count = papyr.state(0);
```

Whenever `count.value` changes, any element that reads this state automatically updates.

---

## 3. Creating and Mounting Elements

Papyr lets you build DOM elements cleanly without using a Virtual DOM. We'll use `papyr.div`, `papyr.h1`, `papyr.button`, and `papyr.p`:

```javascript
const counterApp = papyr.div(
  {
    style: {
      maxWidth: '480px',
      margin: '60px auto',
      padding: '40px',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      textAlign: 'center'
    }
  },
  papyr.h1("Greetings from Papyr! 🚀", {
    style: { color: '#6366f1', marginBottom: '20px' }
  }),
  
  papyr.p("This is a reactive counter built in plain JavaScript:"),
  
  // A dynamic text node updated when state changes:
  papyr.div(
    { style: { fontSize: '48px', fontWeight: 'bold', margin: '20px 0', color: '#10b981' } },
    () => count.value
  ),

  // Click handler to increment the state
  papyr.button("Increment Count", {
    onclick: () => count.value++,
    style: {
      background: '#6366f1',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    }
  })
);

// Mount the element to the #app selector
papyr.mount("#app", counterApp);
```

---

## 4. Testing Your Application

Open `index.html` directly in your browser. Click the button, and watch the counter value update instantly!

### How does this work?
- `() => count.value`: Passing a function to a node creator triggers dependency tracking.
- `count.value++`: When clicked, the state value is mutated. The updater is run instantly and updates the specific text node.

---

## Next Steps

Now that you have built your first app:
- Check out [State Management](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/intermediate/state.md) to understand Signals, Computeds, and Watchers.
- Learn about client-side [SPA Routing](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/intermediate/routing.md) using clean URLs.
