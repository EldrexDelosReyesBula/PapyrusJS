# Recipe: Todo App with LocalStorage CRUD Sync

This recipe details how to construct a task checklists application featuring state updates, computed filtering, keypress inputs, and persistent storage synchronization.

---

## Code Example

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
        // 1. Initialize persistent CRUD store
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

## Key Design Principles
* **`papyr.crud` Wrapper:** Manages local memory collection states and writes serialized JSON payloads automatically back to `localStorage` on writes.
* **Derived Collections:** Avoid modifying array elements directly in layouts. The `filteredTasks` computed state tracks `db.list` updates and updates lists whenever tasks are created, toggled, or deleted.
* **Automatic Node Recycling:** List bindings inside `papyr.for` preserve elements, preventing document reflow layout shifts when toggling checkboxes.
