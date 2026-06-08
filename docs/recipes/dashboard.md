# 📊 Collapsible Admin Dashboard Layout

A comprehensive guide to building an enterprise-grade admin control panel with responsive sidebar navigation, dark/light theme switching, statistics dashboards, and dynamic chart visualizations.

[![Papyr.js](https://img.shields.io/badge/Papyr.js-Admin_Dashboard-blue)](https://papyrus-js.vercel.app)

---

## 🚀 Live Demo Concept

- Responsive dashboard layout with sidebar navigation
- Dark/Light theme switching
- Collapsible navigation menu
- Statistics cards and KPI metrics
- Interactive charts
- Dynamic content switching

---

## 🧠 Key Concepts

| Concept | Implementation |
|----------|----------------|
| Dashboard Layout | `papyr.layout.dashboard()` |
| Theme Management | `papyr.theme()` |
| Reactive Theme Toggle | `papyr.watch()` |
| Canvas Charts | `papyr.canvas()` + `papyr.charts()` |
| Lifecycle Hooks | `onMounted` |
| Conditional Content | `papyr.if()` |

---

## 📦 Full Example

Create an `index.html` file and paste the following:

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

# 🔍 How It Works

## 1. Dashboard Layout Shell

```js
let AppShell = papyr.layout.dashboard({
    sidebarWidth: '240px',
    headerHeight: '60px',
    header: Component,
    sidebar: Component,
    main: Component,
    footer: Component
});
```

### What Happens

- Creates a responsive admin layout
- Handles sidebar and content positioning
- Automatically adapts to smaller screens
- Accepts Papyr components for every section

---

## 2. Theme Management

```js
papyr.watch(isDark, (dark) => {
    papyr.theme({
        primary: "#6366f1"
    });
});
```

### What Happens

- Watches theme state changes
- Updates global CSS variables
- Applies theme colors throughout the app
- Supports runtime switching

---

## 3. Canvas Charts

```js
onMounted: () => {
    papyr.charts("revenue-chart", {
        type: 'line',
        data: [12, 19, 15]
    });
}
```

### Why Use `onMounted`

Charts require an existing canvas element.

Initializing before mounting causes failures because the canvas doesn't exist in the DOM yet.

---

## 4. Reactive Navigation

```js
let activeTab = papyr.state("analytics");
```

Navigation buttons update this state:

```js
onclick: () => activeTab.value = "settings"
```

Benefits:

- Automatic UI updates
- Active link highlighting
- Declarative navigation logic

---

## 5. Conditional Rendering

```js
papyr.if(
    () => activeTab.value === "analytics",
    () => AnalyticsView(),
    () => SettingsView()
)
```

### Benefits

- Components mount only when needed
- Cleaner state management
- Better performance

---

## 6. Statistics Cards

```js
papyr.div(".stat-card",
    papyr.small("Monthly Revenue"),
    papyr.h2("$48,250")
)
```

### Features

- Auto-responsive grid
- Lightweight rendering
- Easy customization

---

# 🎨 Advanced Dashboard Patterns

## Real-Time Metrics

```js
let revenue = papyr.state(48250);

setInterval(() => {
    revenue.value += Math.random() * 100;
}, 5000);
```

### Use Cases

- Live dashboards
- Monitoring systems
- Analytics panels

---

## Multiple Charts

```js
papyr.charts("line-chart", {
    type: "line"
});

papyr.charts("bar-chart", {
    type: "bar"
});

papyr.charts("pie-chart", {
    type: "pie"
});
```

### Supported Types

| Type | Best For |
|--------|-----------|
| `line` | Trends |
| `bar` | Comparisons |
| `pie` | Percentages |
| `doughnut` | Distribution |
| `radar` | Multi-metric analysis |

---

## Collapsible Sidebar

```js
let sidebarCollapsed = papyr.state(false);
```

Toggle:

```js
onclick: () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
}
```

Benefits:

- More workspace
- Better mobile experience
- Cleaner navigation

---

## User Menu Dropdown

```js
let showUserMenu = papyr.state(false);
```

Common Actions:

- Profile
- Settings
- Logout
- Account Management

---

# 📊 Chart Configuration

Example:

```js
papyr.charts("chart-id", {
    type: "line",
    data: [12, 19, 15, 25],
    labels: ["Jan", "Feb", "Mar", "Apr"]
});
```

## Configuration Options

| Option | Description |
|----------|-------------|
| `type` | Chart type |
| `data` | Dataset |
| `labels` | X-axis labels |
| `colors` | Custom colors |
| `options` | Advanced chart configuration |

---

# 🎨 Theme Customization

## Custom Theme

```js
papyr.theme({
    primary: "#8b5cf6",
    secondary: "#ec4899",
    surface: "#1e1b4b",
    text: "#f3e8ff"
});
```

## Theme Persistence

```js
localStorage.setItem(
    "theme_preference",
    dark ? "dark" : "light"
);
```

Restore on startup:

```js
const savedTheme =
    localStorage.getItem("theme_preference");
```

---

## CSS Variables

Papyr automatically updates:

```css
:root {
    --papyr-primary: #6366f1;
    --papyr-surface: #ffffff;
    --papyr-text: #1f2937;
    --papyr-border: #e5e7eb;
}
```

---

# 💡 Best Practices

## ✅ Do

- Use `onMounted` for charts
- Persist user preferences
- Test on mobile devices
- Use theme variables
- Debounce frequent updates
- Lazy-load expensive components

## ❌ Don't

- Initialize charts before mounting
- Hardcode theme colors
- Create unnecessary reactive dependencies
- Forget cleanup logic

---

# ⚡ Performance Optimization

### Debounce Updates

```js
let updateTimeout;

const updateChart = (data) => {
    clearTimeout(updateTimeout);

    updateTimeout = setTimeout(() => {
        papyr.charts("chart-id", {
            data
        });
    }, 100);
};
```

### Cleanup Resources

```js
{
    onMounted() {
        // setup
    },

    onUnmounted() {
        clearInterval(intervalId);
        clearTimeout(updateTimeout);
    }
}
```

---

# 📱 Responsive Design

| Breakpoint | Sidebar | Grid |
|------------|----------|------|
| Desktop (>1024px) | Visible | 3–4 Cards |
| Tablet (768–1024px) | Collapsible | 2–3 Cards |
| Mobile (<768px) | Hidden Drawer | 1–2 Cards |

Custom responsive styles:

```css
@media (max-width: 640px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .stat-card {
        padding: 12px;
    }
}
```

---

# 📚 API Reference

## Layout

```js
papyr.layout.dashboard(options)
```

Creates a complete dashboard shell.

---

## Theme

```js
papyr.theme(themeObject)
```

Updates global design tokens.

---

## Charts

```js
papyr.charts(id, config)
```

Renders charts inside a canvas element.

---

## Watchers

```js
papyr.watch(state, callback)
```

Reacts to state changes.

---

# ✅ Summary

This recipe demonstrates:

- ✅ Responsive dashboard layout
- ✅ Sidebar navigation
- ✅ Dark/light theme switching
- ✅ Theme persistence
- ✅ Interactive charts
- ✅ Real-time metric updates
- ✅ Reactive state management
- ✅ Mobile responsiveness
- ✅ Fully self-contained HTML example

Simply copy the example into `index.html`, open it in a browser, and you'll have a fully functional admin dashboard powered by **Papyr.js**.