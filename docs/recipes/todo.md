📝 Todo App with LocalStorage CRUD Sync

A reactive task checklist application built with Papyr.js.

Features include real-time filtering, keyboard input support, and automatic persistence to "localStorage".

""Papyr.js" (https://img.shields.io/badge/Papyr.js-Reactive-blue)" (https://papyrus-js.vercel.app/)

---

🚀 Live Demo Concept

- Add new tasks (press Enter or click Add)
- Mark tasks as completed using the checkbox
- Delete individual tasks with the ✕ button
- Filter tasks:
  - All
  - Active (incomplete)
  - Completed
- All changes are automatically saved to "localStorage" and survive page reloads

---

🧠 Key Concepts

Concept| Implementation
Reactive CRUD store| "papyr.crud()" – manages an array of objects and syncs every mutation to "localStorage"
Local reactive state| "papyr.state()" – stores the current filter and input value
Computed filtering| "papyr.computed()" – derives a filtered list from the store and current filter
Two-way binding| "papyr.model()" – binds the input field to "inputVal"
Conditional classes| Dynamic classes via arrow functions ("class: () => ...")
List rendering| "papyr.for()" – efficiently reuses DOM nodes when the filtered list changes
Event handlers| Inline "onclick", "onchange", and "onkeypress" callbacks

---

📦 Full Code

Create an "index.html" file and paste the following:

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

            papyr.flex.row({ style: { gap: "8px" } },
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

            papyr.div(".filters",
                ["all", "active", "completed"].map(f =>
                    papyr.button(f.toUpperCase(), {
                        class: () =>
                            `filter-btn ${currentFilter.value === f ? "active" : ""}`,
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

                papyr.for(filteredTasks, (task) =>
                    papyr.li({
                        class: () =>
                            `todo-item ${task.done ? "completed" : ""}`
                    },

                    papyr.flex.row({
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

---

🔍 How It Works

1. Persistent CRUD Store

const db = papyr.crud("my_tasks_store", initialTasks);

Creates a reactive collection named ""my_tasks_store"".

- Automatically persists data to "localStorage"
- Every create, update, or delete operation is saved
- "db.list()" returns the current task collection

---

2. Reactive State

let currentFilter = papyr.state("all");
let inputVal = papyr.state("");

"papyr.state()" stores reactive values that automatically update the UI when changed.

Used for:

- Active filter selection
- Task input field value

---

3. Computed Filtering

let filteredTasks = papyr.computed(() => {
    ...
});

Automatically recalculates whenever:

- "db.list()" changes
- "currentFilter.value" changes

Returns only the tasks relevant to the selected filter.

---

4. Two-Way Input Binding

papyr.input("text", {
    ...papyr.model(inputVal)
});

Provides automatic synchronization between:

- Input field → state
- State → input field

Typing updates "inputVal.value", and changing "inputVal.value" updates the input.

---

5. Dynamic Classes & Checkbox Binding

class: () => `todo-item ${task.done ? 'completed' : ''}`
checked: () => task.done

Reactive functions ensure the UI always reflects current data.

When the checkbox changes:

db.update(id, { done: !done });

The UI updates automatically.

---

6. Efficient List Rendering

papyr.for(filteredTasks, task => ...)

Efficiently renders a list of tasks while reusing DOM nodes when possible.

Automatically handles:

- Adding items
- Removing items
- Reordering items
- Filter updates

No manual DOM manipulation required.

---

💾 localStorage Persistence

Operation| Result
Page load| Papyr reads from "localStorage["my_tasks_store"]"
Add task| Store updates and persists automatically
Toggle task| Changes saved instantly
Delete task| Removed from storage immediately
Page reload| Data is restored automatically

You can inspect saved data via:

Browser DevTools
→ Application
→ Local Storage
→ my_tasks_store

---

🎨 Customization Ideas

Due Dates

{
    text: "Finish project",
    dueDate: "2026-06-08",
    done: false
}

Sort tasks by date before rendering.

Task Editing

Double-click a task and replace the label with an input field.

Clear Completed

db.list()
  .filter(task => task.done)
  .forEach(task => db.delete(task.id));

Dark Mode

Toggle a dark theme class on the root container and provide alternate CSS styles.

---

📚 Papyr.js APIs Used

Method| Purpose
"papyr.crud(name, initialData)"| Persistent reactive CRUD store
"papyr.state(initialValue)"| Reactive state
"papyr.computed(fn)"| Derived reactive values
"papyr.model(state)"| Two-way binding
"papyr.for(source, renderFn)"| Reactive list rendering
"papyr.mount(selector, component)"| Mount application

---

✅ Features Summary

- ✅ Reactive CRUD operations
- ✅ Automatic "localStorage" synchronization
- ✅ Computed filtering (All / Active / Completed)
- ✅ Keyboard support (Enter to add)
- ✅ Dynamic class binding
- ✅ Reactive checkbox state
- ✅ Efficient list rendering
- ✅ Zero build tools required
- ✅ Single-file application
- ✅ Works offline

---

🎯 Conclusion

This recipe demonstrates a complete Todo application powered by Papyr.js featuring:

- Reactive CRUD + persistence
- Computed filtering
- Two-way data binding
- Dynamic UI updates
- Efficient list rendering
- Zero dependencies beyond Papyr.js

Simply save the code as "index.html", open it in a browser, and the application is ready to use.