# UI & Components API

This module details the premium built-in UI components, notification overlays, and dashboard app layout templates.

---

## Notifications

### Toasts (`papyr.toast`)
Displays a self-dismissing notification banner.
```javascript
papyr.toast(message, type, duration);
```
* **Parameters:**
  * `message` (String): Toast body text.
  * `type` (String): Theme layout style (`'info'`, `'success'`, `'error'`, `'warning'`). Default is `'info'`.
  * `duration` (Number): Expiry timer in milliseconds (default: 3000).

```javascript
papyr.toast("Record updated successfully!", "success", 4000);
```

---

## Dialogs & Overlays

### Modals (`papyr.modal`)
Launches a centered modal dialog box with background overlay interceptors.
```javascript
let myModal = papyr.modal(contentNode, title);
```

* **Methods:**
  * `myModal.show()`: Animates modal onto viewport.
  * `myModal.hide()` / `myModal.close()`: Fades modal out.

```javascript
let modal = papyr.modal(
    papyr.div(
        papyr.p("This action cannot be undone. Confirm delete?"),
        papyr.button("Confirm", { onclick: () => { deleteItem(); modal.hide(); } })
    ),
    "Warning"
);

modal.show();
```

### Bottom Sheets (`papyr.sheet`)
Launches a mobile-friendly bottom panel that slides up from the base of the viewport.
```javascript
papyr.sheet({ content: contentNode });
```

```javascript
papyr.sheet({
    content: papyr.div(
        papyr.h4("Share Document"),
        papyr.button("Copy Link", { onclick: () => papyr.copy(window.location.href) })
    )
});
```

---

## Widgets & Layout Templates

### Cards (`papyr.card`)
Scaffolds standard container widgets.
```javascript
let card = papyr.card(title, content, footer);
```

### Tabbed Panels (`papyr.tabs`)
Renders lists of content containers toggled by label headers.
```javascript
let myTabs = papyr.tabs([
    { label: "Profile", content: papyr.div("User profile editor...") },
    { label: "Security", content: papyr.div("API token configurations...") }
]);
```

### Layout Templates (`papyr.layout`)
A library of zero-layout shift structural grids:
* **`papyr.layout.row(...children)`**: Horizontally aligned flex container.
* **`papyr.layout.grid(options, ...children)`**: Grid container with custom column mappings.
* **`papyr.layout.foldable(options, ...children)`**: Dual-screen viewport splits for foldable device orientations.
* **`papyr.layout.dashboard(options)`**: Collapsible sidebar, header toolbar, content viewport, and footer widgets.
  ```javascript
  let shell = papyr.layout.dashboard({
      sidebarWidth: '260px',
      header: papyr.h3("Admin Control Room"),
      sidebar: papyr.div("Sidebar Links..."),
      main: papyr.router() // Link SPA router directly to the viewport
  });
  ```
