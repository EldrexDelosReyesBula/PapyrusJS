# 📝 Todo App with LocalStorage CRUD Sync

A reactive task checklist application built with **Papyr.js**.  
Features include real‑time filtering, keyboard input support, and automatic persistence to `localStorage`.

[![Papyr.js](https://img.shields.io/badge/Papyr.js-Reactive-blue)](https://papyrus-js.vercel.app/)

---

## 🚀 Live Demo Concept

- Add new tasks (press `Enter` or click **Add**)
- Mark tasks as completed using the checkbox
- Delete individual tasks with the **✕** button
- Filter tasks: *All*, *Active* (incomplete), *Completed*
- All changes are automatically saved to `localStorage` and survive page reloads

---

## 🧠 Key Concepts

| Concept | Implementation |
|--------|----------------|
| **Reactive CRUD store** | `papyr.crud()` – manages an array of objects, syncs every mutation to `localStorage` |
| **Local reactive state** | `papyr.state()` – for the current filter and input field value |
| **Computed filtering** | `papyr.computed()` – derives a filtered list from the store and current filter |
| **Two‑way binding** | `papyr.model()` – binds the input field to `inputVal` |
| **Conditional classes** | Dynamic classes via arrow functions (e.g., `class: () => ...`) |
| **List rendering** | `papyr.for()` – efficiently reuses DOM nodes when the filtered list changes |
| **Event handlers** | Inline `onclick`, `onchange`, `onkeypress` with direct access to state |

---

## 📦 Full Code

Create an `index.html` file and paste the following:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: Task Tracker</title>
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
    <style>
        .todo-app { max-width: 450px; margin: 40px auto; font-family: sans-serif; }
        .todo-input { width: 70%; padding: 10px; border-radius: 4px; border: 1px solid #ccc; }
        .todo-btn { width: 25%; padding: 10px; border: none; border-radius: 4px; background: #2563eb; color: white; cursor: pointer; }
        .filters { display: flex; gap: 8px; margin: 15px 0; }
        .filter-btn { padding: 4px 10px; border: 1px solid #ccc; border-radius: 4px; background: none; cursor: pointer; }
        .filter-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
        .todo-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee; }
        .todo-item.completed span { text-decoration: line-through; color: #888; }
    </style>
</head>
<body>
    <div id="todo-mount"></div>
    <script>
        // 1. Initialize persistent CRUD store (syncs to localStorage)
        const db = papyr.crud("my_tasks_store", [
            { text: "Learn reactivity models", done: false },
            { text: "Scaffold layout grids", done: true }
        ]);

        // 2. Local reactive filter state
        let currentFilter = papyr.state("all"); // 'all', 'active', 'completed'
        let inputVal = papyr.state("");

        // 3. Computed list filtered dynamically
        let filteredTasks = papyr.computed(() => {
            let list = db.list();
            if (currentFilter.value === "active") return list.filter(t => !t.done);
            if (currentFilter.value === "completed") return list.filter(t => t.done);
            return list;
        });

        // 4. Action helpers
        const addTask = () => {
            if (!inputVal.value.trim()) return;
            db.create({ text: inputVal.value.trim(), done: false });
            inputVal.value = "";
        };

        const toggleTask = (id, done) => {
            db.update(id, { done: !done });
        };

        const deleteTask = (id) => {
            db.delete(id);
        };

        // 5. Declarative UI template
        let App = papyr.div(".todo-app",
            papyr.h2("📝 Checklist Hub"),

            // Add Input Row
            papyr.flex.row({ style: { gap: '8px' } },
                papyr.input("text", {
                    placeholder: "Create new task...",
                    class: "todo-input",
                    ...papyr.model(inputVal),
                    onkeypress: (e) => { if (e.key === "Enter") addTask(); }
                }),
                papyr.button("Add", { class: "todo-btn", onclick: addTask })
            ),

            // Filtering Tab buttons
            papyr.div(".filters",
                ['all', 'active', 'completed'].map(f => 
                    papyr.button(f.toUpperCase(), {
                        class: () => `filter-btn ${currentFilter.value === f ? 'active' : ''}`,
                        onclick: () => currentFilter.value = f
                    })
                )
            ),

            // Tasks list renderer
            papyr.ul({ style: { padding: '0', listStyle: 'none' } },
                papyr.for(filteredTasks, (task) => 
                    papyr.li({ class: () => `todo-item ${task.done ? 'completed' : ''}` },
                        papyr.flex.row({ style: { alignItems: 'center', gap: '10px' } },
                            papyr.input("checkbox", {
                                checked: () => task.done,
                                onchange: () => toggleTask(task.id, task.done)
                            }),
                            papyr.span(task.text)
                        ),
                        papyr.button("✕", {
                            style: { background: 'none', border: 'none', color: '#ef4444', fontSize: '16px', cursor: 'pointer' },
                            onclick: () => deleteTask(task.id)
                        })
                    )
                )
            )
        );

        papyr.mount("#todo-mount", App);
    </script>
</body>
</html>
```

---

🔍 How It Works – Step by Step

1. Persistent CRUD Store

```js
const db = papyr.crud("my_tasks_store", initialTasks);
```

· Creates a reactive collection named "my_tasks_store".
· Every create, update, or delete automatically serializes the whole array to localStorage.
· db.list() returns the current array of task objects (each task has id, text, done).

2. Reactive State

```js
let currentFilter = papyr.state("all");
let inputVal = papyr.state("");
```

· papyr.state holds a value that triggers UI updates when changed.
· Used for the active filter and the new task input.

3. Computed Filtering

```js
let filteredTasks = papyr.computed(() => { ... });
```

· Automatically recomputes whenever db.list() or currentFilter.value changes.
· Returns the subset of tasks based on the chosen filter.

4. Two‑Way Binding on Input

```js
papyr.input("text", {
  ...papyr.model(inputVal),
  onkeypress: (e) => { if (e.key === "Enter") addTask(); }
})
```

· papyr.model(inputVal) links the input’s value to inputVal.state.
· Typing updates inputVal.value; changing inputVal.value updates the input.

5. Dynamic Classes & Checkbox Binding

```js
class: () => `todo-item ${task.done ? 'completed' : ''}`
checked: () => task.done
```

· Arrow functions let classes and checkbox states react to live data.
· onchange toggles the task’s done status via db.update().

6. Efficient List Rendering

```js
papyr.for(filteredTasks, (task) => ...)
```

· Renders a <li> for each task in the filtered list.
· Automatically adds, removes, or reorders DOM nodes when the filtered list changes – no manual DOM manipulation.

---

💾 localStorage Persistence

Operation What happens
Page load Papyr reads localStorage["my_tasks_store"] (or uses initial data)
Add / toggle / delete The store updates → UI refreshes → array is written back to localStorage
Page reload Data is restored from localStorage, preserving all tasks

You can inspect the saved data in your browser’s DevTools → Application → Local Storage.

---

🎨 Customisation Ideas

· Due dates – add a dueDate property and sort tasks.
· Task editing – double‑click a task to replace it with an input field.
· Clear completed – add a button that calls db.delete(id) for all done tasks.
· Dark mode – extend the CSS and toggle a dark class on the root element.

---

📚 Papyr.js Documentation

Papyr is a tiny reactive UI library with a syntax similar to React but without a build step.
Learn more at: papyrus-js.vercel.app

Key methods used in this recipe:

· papyr.crud(name, initialData)
· papyr.state(initialValue)
· papyr.computed(fn)
· papyr.model(stateObject)
· papyr.for(reactiveArray, renderFn)
· papyr.mount(selector, component)

---

✅ Summary

This recipe demonstrates a complete, production‑ready Todo app with:

· ✅ Reactive CRUD + localStorage sync
· ✅ Computed filtering (All / Active / Completed)
· ✅ Keyboard support (Enter to add)
· ✅ No external dependencies except Papyr.js
· ✅ Fully self‑contained in a single HTML file

Just copy the code into index.html and open it in any modern browser – it works offline too!

