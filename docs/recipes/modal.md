# Recipe: Overlays (Modals & Bottom Sheets)

This recipe details how to mount modal cards and slide bottom sheets, hook callbacks, and dismiss layers dynamically.

---

## Code Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: Overlays Hub</title>
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
    <style>
        .container { max-width: 400px; margin: 40px auto; text-align: center; font-family: sans-serif; }
        .trigger-btn { padding: 12px 20px; font-size: 15px; margin: 10px; border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer; }
        .confirm-btn { padding: 8px 16px; border: none; background: #ef4444; color: white; border-radius: 4px; cursor: pointer; }
        .cancel-btn { padding: 8px 16px; border: 1px solid #ccc; background: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>
</head>
<body>
    <div id="app-mount"></div>
    <script>
        // Actions
        const openConfirmationModal = () => {
            // Instantiate modal template wrapper
            const confirmModal = papyr.modal(
                papyr.div(
                    papyr.p("This action will purge your session tokens permanently. Continue?"),
                    papyr.flex.row({ style: { justifyContent: 'flex-end', marginTop: '20px' } },
                        papyr.button("Cancel", {
                            class: "cancel-btn",
                            onclick: () => confirmModal.hide() // Dismiss
                        }),
                        papyr.button("Purge Session", {
                            class: "confirm-btn",
                            onclick: () => {
                                papyr.toast("Tokens purged.", "warning");
                                confirmModal.hide();
                            }
                        })
                    )
                ),
                "Critical Confirmation Required"
            );

            // Display
            confirmModal.show();
        };

        const openQuickOptionsSheet = () => {
            // Opens slide-up mobile sheet
            papyr.sheet({
                content: papyr.div(
                    papyr.h3("Manage Document"),
                    papyr.p("Select an action below:"),
                    papyr.flex.col({ style: { gap: '10px', marginTop: '15px' } },
                        papyr.button("📄 Export to PDF format", {
                            style: { padding: '10px', textAlign: 'left', borderRadius: '6px', border: '1px solid #eee', background: 'none' },
                            onclick: () => {
                                papyr.toast("Export queued.");
                            }
                        }),
                        papyr.button("🔗 Copy Direct Link", {
                            style: { padding: '10px', textAlign: 'left', borderRadius: '6px', border: '1px solid #eee', background: 'none' },
                            onclick: () => {
                                papyr.copy(window.location.href);
                                papyr.toast("Copied to clipboard!");
                            }
                        })
                    )
                )
            });
        };

        // Base Layout
        let Hub = papyr.div(".container",
            papyr.h2("Portal Overlays"),
            papyr.p("Launch screen modals or mobile sheet sliders:"),
            papyr.button("Open Confirm Modal", { class: "trigger-btn", onclick: openConfirmationModal }),
            papyr.button("Open Options Sheet", { class: "trigger-btn", onclick: openQuickOptionsSheet })
        );

        papyr.mount("#app-mount", Hub);
    </script>
</body>
</html>
```

---

## Key Design Principles
* **Modal Instances:** `papyr.modal` returns a controller instance containing reference handles (`.show()`, `.hide()`). This enables flexible event attachments.
* **Responsive Bottom Sheets:** `papyr.sheet` centers on desktop screens but automatically shifts to full-width bottom overlays on mobile viewports.
* **Dynamic Mountings:** Overlay elements append directly to `document.body` when triggered and completely remove themselves from the DOM tree when dismissed, keeping the primary mounting layout clean.
