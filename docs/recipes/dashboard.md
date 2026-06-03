# Recipe: Collapsible Admin Dashboard Layout

This recipe details how to build an admin control panel complete with responsive sidebars, theme togglers, stats grids, and canvas line graphs.

---

## Code Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: Admin Dashboard</title>
    <!-- Include Complete package containing visual styling features -->
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
    <style>
        body { margin: 0; font-family: 'Outfit', sans-serif; background: #0b0f19; color: #f3f4f6; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
        .nav-link { padding: 10px 14px; border: none; border-radius: 6px; background: none; color: #9ca3af; text-align: left; cursor: pointer; }
        .nav-link.active { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; padding: 20px; }
        .stat-card { padding: 20px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); }
        .chart-box { margin: 20px; padding: 20px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); }
        .theme-btn { margin: 16px; padding: 8px 12px; border: 1px solid #4b5563; border-radius: 6px; background: none; color: white; cursor: pointer; }
    </style>
</head>
<body>
    <div id="shell-mount"></div>
    <script>
        // 1. Navigation state
        let activeTab = papyr.state("analytics");
        let isDark = papyr.state(true);

        // 2. Theme switcher updater
        papyr.watch(isDark, (dark) => {
            if (dark) {
                papyr.theme({
                    primary: "#6366f1",
                    surface: "#101827",
                    text: "#f3f4f6"
                });
                document.body.style.background = "#0b0f19";
                document.body.style.color = "#f3f4f6";
            } else {
                papyr.theme({
                    primary: "#4f46e5",
                    surface: "#ffffff",
                    text: "#1f2937"
                });
                document.body.style.background = "#f3f4f6";
                document.body.style.color = "#1f2937";
            }
        });

        // 3. Analytics View Component (Graph renders on mount)
        const AnalyticsView = () => {
            let canvas = papyr.canvas({ id: "revenue-chart", width: 500, height: 200, style: { width: '100%', height: '200px' } });
            
            return papyr.div(
                papyr.div(".stats-grid",
                    papyr.div(".stat-card", papyr.small("Monthly Revenue"), papyr.h2("$48,250")),
                    papyr.div(".stat-card", papyr.small("Active Subscriptions"), papyr.h2("1,840")),
                    papyr.div(".stat-card", papyr.small("Bounce Rate"), papyr.h2("14.2%"))
                ),
                papyr.div(".chart-box",
                    papyr.h4("Gross Profit Over Time"),
                    canvas,
                    {
                        onMounted: () => {
                            // Call charting canvas API inside mounted lifecycle hook
                            papyr.charts("revenue-chart", {
                                type: 'line',
                                data: [12, 19, 15, 25, 22, 30, 45],
                                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
                            });
                        }
                    }
                )
            );
        };

        // 4. Sidebar template
        let SidebarContent = papyr.div(".sidebar-nav",
            papyr.button("📊 Analytics", {
                class: () => `nav-link ${activeTab.value === 'analytics' ? 'active' : ''}`,
                onclick: () => activeTab.value = 'analytics'
            }),
            papyr.button("⚙️ Settings", {
                class: () => `nav-link ${activeTab.value === 'settings' ? 'active' : ''}`,
                onclick: () => activeTab.value = 'settings'
            }),
            papyr.button(() => isDark.value ? "☀️ Light Mode" : "🌙 Dark Mode", {
                class: "theme-btn",
                onclick: () => isDark.value = !isDark.value
            })
        );

        // 5. Build full shell
        let AppShell = papyr.layout.dashboard({
            sidebarWidth: '240px',
            headerHeight: '60px',
            header: papyr.h2({ style: { margin: '0', paddingLeft: '20px', fontSize: '1.25rem' } }, "Control Dashboard"),
            sidebar: SidebarContent,
            main: papyr.div(
                // Toggle sub-components reactively
                papyr.if(() => activeTab.value === 'analytics',
                    () => AnalyticsView(),
                    () => papyr.div({ style: { padding: '24px' } }, papyr.h3("Settings configurations..."))
                )
            ),
            footer: papyr.p({ style: { textAlign: 'center', fontSize: '12px', color: '#6b7280' } }, "Isomorphic System Inc.")
        });

        papyr.mount("#shell-mount", AppShell);
    </script>
</body>
</html>
```

---

## Key Design Principles
* **`papyr.layout.dashboard` Shell:** Creates a responsive flex layout with collapsible sidebars and correct margins, preventing viewport shifting.
* **Canvas Mount Lifecycle Hook:** Canvas graphs must be rendered inside the element's `onMounted` lifecycle hook. Renders will fail if initialized before elements have entered the DOM hierarchy.
* **`papyr.theme` API:** Modifies CSS variables `--papyr-primary` and `--primary` globally in JavaScript, enabling application-wide light/dark theme switches.
