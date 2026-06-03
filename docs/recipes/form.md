# Recipe: Interactive Form Validation

This recipe details how to construct forms with two-way data bindings, validate inputs against schemas, and display error messages in real-time.

---

## Code Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: Form Validation</title>
    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
    <style>
        .form-card { max-width: 400px; margin: 40px auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px; font-family: sans-serif; }
        .field { margin-bottom: 16px; }
        .field label { display: block; margin-bottom: 6px; font-weight: bold; }
        .field input { width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
        .field input.error { border-color: #ef4444; background: #fef2f2; }
        .error-msg { color: #ef4444; font-size: 12px; margin-top: 4px; }
        .btn-submit { width: 100%; padding: 10px; border: none; border-radius: 4px; background: #10b981; color: white; cursor: pointer; }
    </style>
</head>
<body>
    <div id="form-mount"></div>
    <script>
        // 1. Define states for fields and errors
        let formData = {
            username: papyr.state(""),
            email: papyr.state(""),
            age: papyr.state("")
        };
        let errors = papyr.state({});

        // 2. Define validation schema
        const validator = papyr.validate({
            username: { type: 'string', required: true },
            email: { type: 'string', required: true },
            age: { type: 'number', required: true }
        });

        // 3. Validation action
        const handleSubmit = (e) => {
            e.preventDefault();
            
            // Gather values
            const payload = {
                username: formData.username.value,
                email: formData.email.value,
                age: Number(formData.age.value)
            };

            // Validate
            const validationErrors = validator(payload);
            if (validationErrors) {
                errors.value = validationErrors; // Set error states
                papyr.toast("Please correct form errors.", "error");
            } else {
                errors.value = {}; // Clear errors
                papyr.toast(`Registration success: ${payload.username}!`, "success");
                
                // Clear fields
                formData.username.value = "";
                formData.email.value = "";
                formData.age.value = "";
            }
        };

        // 4. Render template
        let FormApp = papyr.div(".form-card",
            papyr.h3("Register Profile"),
            papyr.form({ onsubmit: handleSubmit },
                
                // Username Field
                papyr.div(".field",
                    papyr.label("Username"),
                    papyr.input("text", {
                        class: () => errors.value.username ? 'error' : '',
                        placeholder: "Enter name",
                        ...papyr.model(formData.username)
                    }),
                    papyr.if(() => errors.value.username, () => 
                        papyr.div(".error-msg", () => errors.value.username)
                    )
                ),

                // Email Field
                papyr.div(".field",
                    papyr.label("Email Address"),
                    papyr.input("email", {
                        class: () => errors.value.email ? 'error' : '',
                        placeholder: "Enter email",
                        ...papyr.model(formData.email)
                    }),
                    papyr.if(() => errors.value.email, () => 
                        papyr.div(".error-msg", () => errors.value.email)
                    )
                ),

                // Age Field
                papyr.div(".field",
                    papyr.label("Age"),
                    papyr.input("number", {
                        class: () => errors.value.age ? 'error' : '',
                        placeholder: "Enter age",
                        ...papyr.model(formData.age)
                    }),
                    papyr.if(() => errors.value.age, () => 
                        papyr.div(".error-msg", () => errors.value.age)
                    )
                ),

                papyr.button("Submit Registration", { type: "submit", class: "btn-submit" })
            )
        );

        papyr.mount("#form-mount", FormApp);
    </script>
</body>
</html>
```

---

## Key Design Principles
* **`papyr.validate` Utility:** Automates type validation. Returns validation errors mapping fields to error messages if fields are missing or have incorrect types.
* **`papyr.if` Error Elements:** Conditionally mounts and unmounts error wrappers based on the `errors` state object.
* **Form Handlers:** Leverage native `onsubmit` events combined with `preventDefault()` to prevent standard page refreshes.
