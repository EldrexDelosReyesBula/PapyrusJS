# Recipe: Data Listing with Search, Sort, & Pagination

This recipe details how to query database collections to implement full-featured data grids with search text filters, ascending/descending sort options, and pagination offsets.

---

## Code Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: CRUD Data Grid</title>
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
    <style>
        .grid-app { max-width: 600px; margin: 40px auto; font-family: sans-serif; }
        .controls { display: flex; gap: 12px; margin-bottom: 16px; }
        .search-bar { flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        .sort-select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .data-table th, .data-table td { border: 1px solid #eee; padding: 10px; text-align: left; }
        .data-table th { background: #f8fafc; }
        .pagination { display: flex; justify-content: space-between; align-items: center; }
        .page-btn { padding: 6px 12px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 4px; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    </style>
</head>
<body>
    <div id="grid-mount"></div>
    <script>
        // 1. Initialize IndexedDB database connection
        const db = papyr.db("customers_logs", "indexeddb");

        // Seed initial data if store is empty
        db.listAsync().then(list => {
            if (list.length === 0) {
                db.insert({ name: "Alice Adams", role: "Manager", salary: 75000 });
                db.insert({ name: "Bob Miller", role: "Developer", salary: 62000 });
                db.insert({ name: "Charlie Stone", role: "Designer", salary: 58000 });
                db.insert({ name: "Diana Prince", role: "Director", salary: 98000 });
                db.insert({ name: "Ethan Hunt", role: "Agent", salary: 85000 });
            }
        });

        // 2. Define Query states
        let searchInput = papyr.state("");
        let sortBy = papyr.state("name");
        let sortDir = papyr.state("asc");
        let currentPage = papyr.state(0);
        const limit = 3; // Items per page

        // 3. Computed calculations pipeline
        let resultsCount = papyr.state(0);

        let queriedData = papyr.computed(() => {
            // Read list dependency
            let allItems = db.list();
            
            // Apply text filter
            let filtered = allItems.filter(item => 
                item.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
                item.role.toLowerCase().includes(searchInput.value.toLowerCase())
            );

            resultsCount.value = filtered.length;

            // Apply sort ordering
            filtered.sort((a, b) => {
                let valA = a[sortBy.value];
                let valB = b[sortBy.value];
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                
                if (valA < valB) return sortDir.value === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir.value === 'asc' ? 1 : -1;
                return 0;
            });

            // Apply pagination offset slicing
            let offset = currentPage.value * limit;
            return filtered.slice(offset, offset + limit);
        });

        let totalPages = papyr.computed(() => Math.ceil(resultsCount.value / limit));

        // Adjust page boundaries when search results change
        papyr.watch(searchInput, () => {
            currentPage.value = 0;
        });

        // 4. Render UI Layout
        let GridApp = papyr.div(".grid-app",
            papyr.h3("👤 Customer Directories"),

            // Search and Sort controls
            papyr.div(".controls",
                papyr.input("text", {
                    placeholder: "Search directories...",
                    class: "search-bar",
                    ...papyr.model(searchInput)
                }),
                papyr.select({
                    class: "sort-select",
                    onchange: (e) => {
                        let [field, dir] = e.target.value.split(":");
                        sortBy.value = field;
                        sortDir.value = dir;
                    }
                },
                    papyr.option("Sort Name A-Z", { value: "name:asc" }),
                    papyr.option("Sort Name Z-A", { value: "name:desc" }),
                    papyr.option("Sort Salary Min-Max", { value: "salary:asc" }),
                    papyr.option("Sort Salary Max-Min", { value: "salary:desc" })
                )
            ),

            // Data Grid table
            papyr.table(".data-table",
                papyr.thead(
                    papyr.tr(
                        papyr.th("Name"),
                        papyr.th("Role"),
                        papyr.th("Salary")
                    )
                ),
                papyr.tbody(
                    papyr.for(queriedData, (item) => 
                        papyr.tr(
                            papyr.td(item.name),
                            papyr.td(item.role),
                            papyr.td(() => `$${item.salary.toLocaleString()}`)
                        )
                    )
                )
            ),

            // Pagination Controls
            papyr.div(".pagination",
                papyr.button("◀ Previous", {
                    class: "page-btn",
                    disabled: () => currentPage.value === 0,
                    onclick: () => currentPage.value = Math.max(0, currentPage.value - 1)
                }),
                papyr.span(() => `Page ${currentPage.value + 1} of ${totalPages.value || 1}`),
                papyr.button("Next ▶", {
                    class: "page-btn",
                    disabled: () => currentPage.value >= totalPages.value - 1,
                    onclick: () => currentPage.value = Math.min(totalPages.value - 1, currentPage.value + 1)
                })
            )
        );

        papyr.mount("#grid-mount", GridApp);
    </script>
</body>
</html>
```

---

## Key Design Principles
* **IndexedDB Store:** Data operations persist asynchronously across browser reloads, while states are synchronized in-memory.
* **Cached Calculations:** The query pipeline runs inside a single `papyr.computed` function. This evaluates only when either database states, filters, sorts, or pagination variables mutate.
* **Watchers:** The search text watcher resets the page offset index to zero when search inputs alter, ensuring correct boundary listings.
* **Declarative Table Builder:** Combines standard HTML elements (`tr`, `td`, `th`) to create dynamic tables.
