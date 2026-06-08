# 🪟 Overlays: Modals & Bottom Sheets

A complete guide to creating dynamic overlay components including confirmation dialogs, slide-up bottom sheets, and toast notifications.

Perfect for responsive web applications, dashboards, admin panels, and mobile-first experiences.

[![Papyr.js](https://img.shields.io/badge/Papyr.js-Overlays-blue)](https://papyrus-js.vercel.app)

---

## 🚀 Live Demo Concept

### Features

- Modal dialogs with custom content
- Mobile-friendly bottom sheets
- Auto-dismissing toast notifications
- Programmatic overlay control
- Clipboard integration
- Automatic DOM cleanup
- Responsive desktop and mobile behavior

---

## 🧠 Key Concepts

| Concept | Implementation |
|----------|----------------|
| **Modal Creation** | `papyr.modal(content, title)` returns a controller with `.show()` and `.hide()` |
| **Bottom Sheets** | `papyr.sheet({ content })` creates a slide-up overlay |
| **Toast Notifications** | `papyr.toast(message, type)` displays temporary feedback |
| **Clipboard API** | `papyr.copy(text)` copies content to the clipboard |
| **DOM Isolation** | Overlays mount to `document.body` and clean themselves up automatically |

---

## 📦 Full Example

Create an `index.html` file and paste the following:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: Overlays Hub</title>

    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>

    <style>
        .container {
            max-width: 400px;
            margin: 40px auto;
            text-align: center;
            font-family: sans-serif;
        }

        .trigger-btn {
            padding: 12px 20px;
            font-size: 15px;
            margin: 10px;
            border-radius: 8px;
            border: none;
            background: #6366f1;
            color: white;
            cursor: pointer;
        }

        .confirm-btn {
            padding: 8px 16px;
            border: none;
            background: #ef4444;
            color: white;
            border-radius: 4px;
            cursor: pointer;
        }

        .cancel-btn {
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
    </style>
</head>

<body>
    <div id="app-mount"></div>

    <script>
        const openConfirmationModal = () => {

            const confirmModal = papyr.modal(
                papyr.div(
                    papyr.p(
                        "This action will purge your session tokens permanently. Continue?"
                    ),

                    papyr.flex.row(
                        {
                            style: {
                                justifyContent: "flex-end",
                                marginTop: "20px"
                            }
                        },

                        papyr.button("Cancel", {
                            class: "cancel-btn",
                            onclick: () => confirmModal.hide()
                        }),

                        papyr.button("Purge Session", {
                            class: "confirm-btn",
                            onclick: () => {
                                papyr.toast(
                                    "Tokens purged.",
                                    "warning"
                                );

                                confirmModal.hide();
                            }
                        })
                    )
                ),

                "Critical Confirmation Required"
            );

            confirmModal.show();
        };

        const openQuickOptionsSheet = () => {

            papyr.sheet({
                content: papyr.div(

                    papyr.h3("Manage Document"),

                    papyr.p(
                        "Select an action below:"
                    ),

                    papyr.flex.col({
                        style: {
                            gap: "10px",
                            marginTop: "15px"
                        }
                    },

                    papyr.button(
                        "📄 Export to PDF format",
                        {
                            style: {
                                padding: "10px",
                                textAlign: "left",
                                borderRadius: "6px",
                                border: "1px solid #eee",
                                background: "none"
                            },

                            onclick: () => {
                                papyr.toast(
                                    "Export queued."
                                );
                            }
                        }
                    ),

                    papyr.button(
                        "🔗 Copy Direct Link",
                        {
                            style: {
                                padding: "10px",
                                textAlign: "left",
                                borderRadius: "6px",
                                border: "1px solid #eee",
                                background: "none"
                            },

                            onclick: () => {
                                papyr.copy(
                                    window.location.href
                                );

                                papyr.toast(
                                    "Copied to clipboard!"
                                );
                            }
                        }
                    ))
                )
            });
        };

        let Hub = papyr.div(
            ".container",

            papyr.h2("Portal Overlays"),

            papyr.p(
                "Launch screen modals or mobile sheet sliders:"
            ),

            papyr.button(
                "Open Confirm Modal",
                {
                    class: "trigger-btn",
                    onclick:
                        openConfirmationModal
                }
            ),

            papyr.button(
                "Open Options Sheet",
                {
                    class: "trigger-btn",
                    onclick:
                        openQuickOptionsSheet
                }
            )
        );

        papyr.mount("#app-mount", Hub);
    </script>
</body>
</html>
```

---

## 🔍 How It Works

### 1. Creating and Controlling a Modal

```js
const confirmModal =
    papyr.modal(content, title);

confirmModal.show();
confirmModal.hide();
```

What happens:

- Creates a modal overlay instance
- Attaches the modal to `document.body`
- Generates a backdrop automatically
- Keeps your main component tree clean
- Returns a controller object

Controller methods:

```js
confirmModal.show();
confirmModal.hide();
```

---

### Modal Parameters

| Parameter | Type | Description |
|------------|---------|-------------|
| `content` | Component | Content rendered inside the modal |
| `title` | String / Component | Modal title or header |
| `options` | Object | Optional configuration |

---

### 2. Creating a Bottom Sheet

```js
papyr.sheet({
    content
});
```

Behavior:

#### Desktop

- Appears as a centered dialog
- Similar to a modal

#### Mobile

- Slides up from the bottom
- Optimized for touch interaction
- Easy to dismiss

Benefits:

- Great for action menus
- Ideal for settings panels
- Excellent mobile UX

---

### 3. Toast Notifications

```js
papyr.toast(
    "Tokens purged.",
    "warning"
);

papyr.toast(
    "Copied to clipboard!"
);
```

Toast notifications:

- Appear briefly
- Auto-dismiss automatically
- Do not block user interaction

---

### Supported Toast Types

| Type | Purpose |
|--------|----------|
| `"success"` | Successful actions |
| `"warning"` | Warnings and cautions |
| `"error"` | Failures and validation issues |
| `"info"` | General information |

---

### 4. Clipboard Integration

```js
papyr.copy(
    window.location.href
);
```

Capabilities:

- Copies text directly to the clipboard
- Uses the browser Clipboard API
- Returns a success status

Example:

```js
const success =
    papyr.copy("Hello World");
```

---

## 🎨 Modal Customization Examples

### Form Modal

```js
const openFormModal = () => {

    let emailInput =
        papyr.state("");

    const formModal =
        papyr.modal(

            papyr.div(

                papyr.label(
                    "Email Address"
                ),

                papyr.input(
                    "email",
                    {
                        placeholder:
                            "user@example.com",

                        ...papyr.model(
                            emailInput
                        )
                    }
                ),

                papyr.flex.row({
                    style: {
                        marginTop: "20px",
                        gap: "10px"
                    }
                },

                papyr.button(
                    "Cancel",
                    {
                        onclick: () =>
                            formModal.hide()
                    }
                ),

                papyr.button(
                    "Submit",
                    {
                        onclick: () => {

                            if (
                                emailInput.value.includes("@")
                            ) {

                                papyr.toast(
                                    "Submitted!"
                                );

                                formModal.hide();

                            } else {

                                papyr.toast(
                                    "Invalid email",
                                    "error"
                                );
                            }
                        }
                    }
                ))
            ),

            "Email Subscription"
        );

    formModal.show();
};
```

---

### Dynamic Loading Modal

```js
const loadingModal =
    papyr.modal(
        papyr.div("Loading..."),
        "Please Wait"
    );

loadingModal.show();

setTimeout(() => {

    loadingModal.hide();

    papyr.toast(
        "Operation complete!"
    );

}, 2000);
```

---

### Prevent Backdrop Closing

```js
const importantModal =
    papyr.modal(

        papyr.div(
            papyr.p(
                "You must acknowledge this message."
            ),

            papyr.button(
                "OK",
                {
                    onclick: () =>
                        importantModal.hide()
                }
            )
        ),

        "Important Notice",

        {
            closeOnBackdrop: false
        }
    );

importantModal.show();
```

---

## 📱 Bottom Sheet Features

### Custom Height

```js
papyr.sheet({
    content: content,
    height: "50vh"
});
```

---

### Action-Based Sheet

```js
const sheet =
    papyr.sheet({

        content: papyr.div(

            papyr.button(
                "Delete",
                {
                    onclick: () => {

                        papyr.toast(
                            "Deleted",
                            "warning"
                        );

                        sheet.hide();
                    }
                }
            )
        )
    });
```

---

### Drag Handle

```js
papyr.sheet({
    content,
    showDragHandle: true
});
```

Adds a draggable indicator at the top of the sheet.

---

## 🎯 Real-World Use Cases

| Use Case | Recommended Overlay |
|-----------|---------------------|
| Delete confirmation | Modal |
| Share menu | Bottom Sheet |
| Settings panel | Bottom Sheet |
| User onboarding | Modal |
| Image preview | Modal |
| Loading state | Modal |
| Success feedback | Toast |
| Clipboard copied | Toast |

---

## 🔧 API Reference

### `papyr.modal(content, title, options)`

| Parameter | Type | Default | Description |
|------------|---------|---------|-------------|
| `content` | Component | Required | Modal content |
| `title` | String / Component | `""` | Modal title |
| `closeOnBackdrop` | Boolean | `true` | Close when clicking outside |
| `closeOnEscape` | Boolean | `true` | Close when pressing ESC |
| `width` | String | `"500px"` | Modal width |

Returns:

```js
{
    show(),
    hide()
}
```

---

### `papyr.sheet(options)`

| Option | Type | Default | Description |
|----------|---------|---------|-------------|
| `content` | Component | Required | Sheet content |
| `height` | String | `"auto"` | Sheet height |
| `showDragHandle` | Boolean | `false` | Show drag indicator |
| `onClose` | Function | `null` | Close callback |

Returns:

```js
{
    hide()
}
```

---

### `papyr.toast(message, type)`

| Parameter | Type | Description |
|------------|---------|-------------|
| `message` | String | Message to display |
| `type` | String | success, warning, error, info |

---

### `papyr.copy(text)`

| Parameter | Type |
|------------|---------|
| `text` | String |

Returns:

```js
true
```

or

```js
false
```

---

## 💡 Best Practices

### Do ✅

- Use modals for critical decisions
- Use bottom sheets for action menus
- Keep overlays focused and concise
- Provide obvious close actions
- Use toasts for lightweight feedback

---

### Don't ❌

- Nest modals inside modals
- Overuse toast notifications
- Block users without escape paths
- Create excessively large dialogs
- Hide important actions behind toasts

---

## 🎨 Custom Overlay Styling

Override default Papyr styles:

```css
.papyr-modal-backdrop {
    background:
        rgba(0, 0, 0, 0.8) !important;

    backdrop-filter:
        blur(4px);
}

.papyr-modal {
    border-radius:
        16px !important;

    box-shadow:
        0 20px 25px -5px
        rgba(0, 0, 0, 0.1)
        !important;
}

.papyr-sheet {
    border-radius:
        20px 20px 0 0 !important;

    background:
        linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 100%
        ) !important;
}
```

---

## ✅ Summary

This recipe demonstrates a complete overlay management system built with **Papyr.js**.

### Included Features

- ✅ Modal dialogs
- ✅ Bottom sheets
- ✅ Toast notifications
- ✅ Clipboard integration
- ✅ Programmatic control
- ✅ Responsive behavior
- ✅ Automatic DOM cleanup
- ✅ Single-file setup
- ✅ No build tools required

Simply copy the example into `index.html`, open it in a browser, and start creating modals, sheets, and notifications with just a few lines of code.