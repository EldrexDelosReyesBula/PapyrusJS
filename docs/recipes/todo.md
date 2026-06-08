# 📝 Todo App with LocalStorage CRUD Sync

A reactive task checklist application built with **Papyr.js**.

Features include real-time filtering, keyboard input support, and automatic persistence to `localStorage`.

[![Papyr.js](https://img.shields.io/badge/Papyr.js-Reactive-blue)](https://papyrus-js.vercel.app/)

---

## 🚀 Live Demo Concept

### Features

- Add new tasks (press `Enter` or click **Add**)
- Mark tasks as completed using the checkbox
- Delete individual tasks with the **✕** button
- Filter tasks:
  - All
  - Active
  - Completed
- Automatically save changes to `localStorage`
- Restore tasks after page reloads

---

## 🧠 Key Concepts

| Concept | Implementation |
|----------|----------------|
| **Reactive CRUD Store** | `papyr.crud()` manages an array of objects and syncs mutations to `localStorage` |
| **Local Reactive State** | `papyr.state()` stores the current filter and input field value |
| **Computed Filtering** | `papyr.computed()` derives a filtered list from the store and active filter |
| **Two-Way Binding** | `papyr.model()` binds the input field to `inputVal` |
| **Conditional Classes** | Dynamic classes using functions such as `class: () => ...` |
| **List Rendering** | `papyr.for()` efficiently updates DOM nodes when data changes |
| **Event Handlers** | Inline `onclick`, `onchange`, and `onkeypress` callbacks |

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
        .todo-app {
            max-width: 450px;
            margin: 40px auto;
            font-family: sans-serif;
        }

        .todo-input {
            width: 70%;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }

        .todo-btn {
            width: 25%;
            padding: 10px;
            border: none;
            border-radius: 4px;
            background: #2563eb;
            color: white;
            cursor: pointer;
        }

        .filters {
            display: flex;
            gap: 8px;
            margin: 15px 0;
        }

        .filter-btn {
            padding: 4px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: none;
            cursor: pointer;
        }

        .filter-btn.active {
            background: #2563eb;
            color: white;
            border-color: #2563eb;
        }

        .todo-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            border-bottom: 1px solid #eee;
        }

        .todo-item.completed span {
            text-decoration: line-through;
            color: #888;
        }
    </style>
</head>

<body>
    <div id="todo-mount"></div>

    <script>
        const db = papyr.crud("my_tasks_store", [
            { text: "Learn reactivity models", done: false },
            { text: "Scaffold layout grids", done: true }
        ]);

        let currentFilter = papyr.state("all");
        let inputVal = papyr.state("");

        let filteredTasks = papyr.computed(() => {
            let list = db.list();

            if (currentFilter.value === "active")
                return list.filter(t => !t.done);

            if (currentFilter.value === "completed")
                return list.filter(t => t.done);

            return list;
        });

        const addTask = () => {
            if (!inputVal.value.trim()) return;

            db.create({
                text: inputVal.value.trim(),
                done: false
            });

            inputVal.value = "";
        };

        const toggleTask = (id, done) => {
            db.update(id, { done: !done });
        };

        const deleteTask = (id) => {
            db.delete(id);
        };

        let App = papyr.div(".todo-app",

            papyr.h2("📝 Checklist Hub"),

            papyr.flex.row(
                { style: { gap: "8px" } },

                papyr.input("text", {
                    placeholder: "Create new task...",
                    class: "todo-input",
                    ...papyr.model(inputVal),
                    onkeypress: (e) => {
                        if (e.key === "Enter") addTask();
                    }
                }),

                papyr.button("Add", {
                    class: "todo-btn",
                    onclick: addTask
                })
            ),

            papyr.div(
                ".filters",

                ["all", "active", "completed"].map(f =>
                    papyr.button(f.toUpperCase(), {
                        class: () =>
                            `filter-btn ${
                                currentFilter.value === f ? "active" : ""
                            }`,
                        onclick: () => currentFilter.value = f
                    })
                )
            ),

            papyr.ul(
                {
                    style: {
                        padding: "0",
                        listStyle: "none"
                    }
                },

                papyr.for(filteredTasks, task =>
                    papyr.li(
                        {
                            class: () =>
                                `todo-item ${
                                    task.done ? "completed" : ""
                                }`
                        },

                        papyr.flex.row(
                            {
                                style: {
                                    alignItems: "center",
                                    gap: "10px"
                                }
                            },

                            papyr.input("checkbox", {
                                checked: () => task.done,
                                onchange: () =>
                                    toggleTask(task.id, task.done)
                            }),

                            papyr.span(task.text)
                        ),

                        papyr.button("✕", {
                            style: {
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                fontSize: "16px",
                                cursor: "pointer"
                            },
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

## 🔍 How It Works

### 1. Persistent CRUD Store

```js
const db = papyr.crud("my_tasks_store", initialTasks);
```

- Creates a reactive collection named `"my_tasks_store"`.
- Automatically syncs mutations to `localStorage`.
- `db.list()` returns the current task array.

---

### 2. Reactive State

```js
let currentFilter = papyr.state("all");
let inputVal = papyr.state("");
```

- Stores values that automatically trigger UI updates.
- Used for filtering and input management.

---

### 3. Computed Filtering

```js
let filteredTasks = papyr.computed(() => {
    ...
});
```

- Recomputes whenever dependencies change.
- Returns the correct subset of tasks.

---

### 4. Two-Way Binding

```js
papyr.input("text", {
    ...papyr.model(inputVal)
});
```

- Keeps UI and state synchronized.
- Input updates state.
- State updates input.

---

### 5. Dynamic Classes & Checkbox Binding

```js
class: () => `todo-item ${task.done ? "completed" : ""}`

checked: () => task.done
```

- UI automatically reflects task state.
- No manual DOM updates required.

---

### 6. Efficient List Rendering

```js
papyr.for(filteredTasks, task => ...)
```

- Efficiently renders lists.
- Adds, removes, and updates DOM nodes automatically.

---

## 💾 LocalStorage Persistence

| Operation | Result |
|------------|---------|
| Page Load | Reads `localStorage["my_tasks_store"]` or uses initial data |
| Create Task | Updates UI and writes new data to storage |
| Update Task | Saves changes immediately |
| Delete Task | Removes item and syncs storage |
| Page Reload | Restores saved tasks |

You can inspect stored data via:

**Browser DevTools → Application → Local Storage**

---

## 🎨 Customization Ideas

### Due Dates

Add a `dueDate` property and sort tasks chronologically.

### Task Editing

Double-click a task and replace the text with an editable input.

### Clear Completed

Add a button that removes all completed tasks.

### Dark Mode

Toggle a dark theme class on the root element.

### Task Categories

Add labels such as:

- Work
- School
- Personal
- Urgent

### Drag-and-Drop Sorting

Allow manual task reordering.

---

## 📚 Papyr.js APIs Used

```js
papyr.crud(name, initialData)
papyr.state(initialValue)
papyr.computed(fn)
papyr.model(stateObject)
papyr.for(reactiveArray, renderFn)
papyr.mount(selector, component)
```

Learn more at:

👉 https://papyrus-js.vercel.app

---

## ✅ Summary

This example demonstrates a complete Todo application built entirely with **Papyr.js**.

### Included Features

- ✅ Reactive CRUD operations
- ✅ Automatic `localStorage` synchronization
- ✅ Computed filtering (All / Active / Completed)
- ✅ Keyboard shortcuts (Enter to add)
- ✅ Two-way input binding
- ✅ Dynamic class updates
- ✅ Efficient list rendering
- ✅ Single-file setup
- ✅ No build tools required
- ✅ Works offline

Simply copy the code into `index.html` and open it in any modern browser.