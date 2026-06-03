# Getting Started with Papyr.js

Welcome to the beginner onboarding guide. This tutorial will transform you from a complete beginner into a Papyr builder in **10 minutes**.

---

## Step 1: Setup

Papyr requires no complex setups. Just create a standard HTML file (e.g. `index.html`) and import the complete CDN build:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Papyr App</title>
    <!-- Include compiled complete package -->
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        // Your code goes here
    </script>
</body>
</html>
```

---

## Step 2: Create Your UI

In Vanilla JavaScript, adding elements is verbose. With Papyr, every standard HTML5 tag is a function exposed directly under the `papyr` global namespace:

```javascript
let myCard = papyr.div(
    papyr.h1("Welcome to Papyr 🚀"),
    papyr.p("This element was created using declarative functional builders.")
);

papyr.mount("#app", myCard);
```

---

## Step 3: Add Reactive State

Static pages are boring. Let's make it interactive. Papyr uses fine-grained states via `papyr.state()`. Let's bind a counter variable to a button:

```javascript
// Define state with an initial value of 0
let count = papyr.state(0);

let clickerButton = papyr.button(
    // 1. Text updater function which auto-tracks dependency on count
    () => `Clicked ${count.value} times`,
    
    // 2. Element options and events listener
    {
        onclick: () => count.value++,
        style: { padding: '12px 24px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer' }
    }
);

papyr.mount("#app", clickerButton);
```

> [!TIP]
> Notice how we passed a *function* `() => ...` as the first argument. This tells the runtime to track the `count.value` dependency and update the button text whenever `count.value` changes.

---

## Step 4: Render Lists

Rendering lists is easy. Pass a reactive array to `papyr.for()` along with a renderer function:

```javascript
let groceryItems = papyr.state(["Apples", "Bananas", "Cherries"]);

let listLayout = papyr.ul(
    papyr.for(groceryItems, (item) => papyr.li(item))
);

papyr.mount("#app", listLayout);
```

If you push items to the `groceryItems.value` array, the list updates automatically!

---

## Step 5: Build a Small App (Interactive Task Tracker)

Let's combine everything you learned to build a reactive checklist application:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Task Tracker</title>
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        // 1. Application State
        let taskInput = papyr.state("");
        let tasks = papyr.state([
            { id: "1", text: "Learn Papyr core layout structures", completed: false },
            { id: "2", text: "Create split documentation guides", completed: true }
        ]);

        // 2. Action Handlers
        const addNewTask = () => {
            if (!taskInput.value.trim()) return;
            tasks.value = [
                ...tasks.value,
                { id: Date.now().toString(36), text: taskInput.value.trim(), completed: false }
            ];
            taskInput.value = ""; // Clear input
        };

        const toggleTask = (id) => {
            tasks.value = tasks.value.map(t => 
                t.id === id ? { ...t, completed: !t.completed } : t
            );
        };

        const deleteTask = (id) => {
            tasks.value = tasks.value.filter(t => t.id !== id);
        };

        // 3. UI Template Structure
        let TaskApp = papyr.div({ style: { maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' } },
            papyr.h2("📝 My Task Tracker"),
            
            // Input Controls
            papyr.flex.row(
                papyr.input("text", {
                    placeholder: "Add a task...",
                    style: { flexGrow: '1', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
                    ...papyr.model(taskInput), // Two-way binding
                    onkeypress: (e) => { if (e.key === 'Enter') addNewTask(); }
                }),
                papyr.button("Add", {
                    onclick: addNewTask,
                    style: { marginLeft: '8px', padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }
                })
            ),

            // Tasks List
            papyr.ul({ style: { listStyle: 'none', padding: '0', marginTop: '20px' } },
                papyr.for(tasks, (task) => 
                    papyr.li({ style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee' } },
                        papyr.flex.row({ style: { alignItems: 'center' } },
                            papyr.input("checkbox", {
                                checked: () => task.completed,
                                onchange: () => toggleTask(task.id),
                                style: { marginRight: '10px' }
                            }),
                            papyr.span(task.text, {
                                style: {
                                    textDecoration: () => task.completed ? 'line-through' : 'none',
                                    color: () => task.completed ? '#888' : '#000'
                                }
                            })
                        ),
                        papyr.button("Delete", {
                            onclick: () => deleteTask(task.id),
                            style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }
                        })
                    )
                )
            )
        );

        papyr.mount("#app", TaskApp);
    </script>
</body>
</html>
```

---

## What You Learned

Congratulations! You have successfully mastered:
1. Creating HTML nodes declaratively via tag builders.
2. Binding states dynamically.
3. Hooking event handlers.
4. Setting up list bindings that synchronize with arrays.

Ready to deep-dive? Head over to **[The Papyr Way](file:///c:/Users/Eldrex/Downloads/Papyr.js-main/Papyr.js-main/docs/papyr-way.md)** to learn how to structure applications professionally.
