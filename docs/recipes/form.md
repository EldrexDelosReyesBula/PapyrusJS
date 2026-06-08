# ✅ Interactive Form Validation

A complete guide to building forms with real-time validation, two-way data binding, and dynamic error messaging.

Perfect for registration forms, login screens, onboarding flows, checkout forms, settings panels, and general data collection interfaces.

[![Papyr.js](https://img.shields.io/badge/Papyr.js-Form_Validation-blue)](https://papyrus-js.vercel.app)

---

## 🚀 Live Demo Concept

### Features

- Two-way reactive data binding
- Schema-based validation
- Dynamic error messaging
- Visual validation feedback
- Toast notifications
- Automatic form reset
- Reactive UI updates
- Minimal boilerplate

---

## 🧠 Key Concepts

| Concept | Implementation |
|----------|----------------|
| **Reactive Form Data** | `papyr.state()` stores field values |
| **Validation Schema** | `papyr.validate(schema)` creates a validator |
| **Error State** | `papyr.state({})` stores field errors |
| **Conditional Rendering** | `papyr.if()` displays errors when needed |
| **Dynamic Classes** | Error styling based on validation state |
| **Form Submission** | Native `onsubmit` with `preventDefault()` |

---

## 📦 Full Example

Create an `index.html` file and paste the following:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Recipe: Form Validation</title>

    <script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>

    <style>
        .form-card {
            max-width: 400px;
            margin: 40px auto;
            padding: 24px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-family: sans-serif;
        }

        .field {
            margin-bottom: 16px;
        }

        .field label {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
        }

        .field input {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .field input.error {
            border-color: #ef4444;
            background: #fef2f2;
        }

        .error-msg {
            color: #ef4444;
            font-size: 12px;
            margin-top: 4px;
        }

        .btn-submit {
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 4px;
            background: #10b981;
            color: white;
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div id="form-mount"></div>

    <script>
        let formData = {
            username: papyr.state(""),
            email: papyr.state(""),
            age: papyr.state("")
        };

        let errors = papyr.state({});

        const validator = papyr.validate({
            username: {
                type: "string",
                required: true
            },

            email: {
                type: "string",
                required: true
            },

            age: {
                type: "number",
                required: true
            }
        });

        const handleSubmit = (e) => {

            e.preventDefault();

            const payload = {
                username:
                    formData.username.value,

                email:
                    formData.email.value,

                age:
                    Number(
                        formData.age.value
                    )
            };

            const validationErrors =
                validator(payload);

            if (validationErrors) {

                errors.value =
                    validationErrors;

                papyr.toast(
                    "Please correct form errors.",
                    "error"
                );

            } else {

                errors.value = {};

                papyr.toast(
                    `Registration success: ${payload.username}!`,
                    "success"
                );

                formData.username.value = "";
                formData.email.value = "";
                formData.age.value = "";
            }
        };

        let FormApp = papyr.div(
            ".form-card",

            papyr.h3(
                "Register Profile"
            ),

            papyr.form({
                onsubmit: handleSubmit
            },

            papyr.div(
                ".field",

                papyr.label(
                    "Username"
                ),

                papyr.input(
                    "text",
                    {
                        class: () =>
                            errors.value.username
                                ? "error"
                                : "",

                        placeholder:
                            "Enter name",

                        ...papyr.model(
                            formData.username
                        )
                    }
                ),

                papyr.if(
                    () =>
                        errors.value.username,

                    () =>
                        papyr.div(
                            ".error-msg",

                            () =>
                                errors.value.username
                        )
                )
            ),

            papyr.div(
                ".field",

                papyr.label(
                    "Email Address"
                ),

                papyr.input(
                    "email",
                    {
                        class: () =>
                            errors.value.email
                                ? "error"
                                : "",

                        placeholder:
                            "Enter email",

                        ...papyr.model(
                            formData.email
                        )
                    }
                ),

                papyr.if(
                    () =>
                        errors.value.email,

                    () =>
                        papyr.div(
                            ".error-msg",

                            () =>
                                errors.value.email
                        )
                )
            ),

            papyr.div(
                ".field",

                papyr.label("Age"),

                papyr.input(
                    "number",
                    {
                        class: () =>
                            errors.value.age
                                ? "error"
                                : "",

                        placeholder:
                            "Enter age",

                        ...papyr.model(
                            formData.age
                        )
                    }
                ),

                papyr.if(
                    () =>
                        errors.value.age,

                    () =>
                        papyr.div(
                            ".error-msg",

                            () =>
                                errors.value.age
                        )
                )
            ),

            papyr.button(
                "Submit Registration",
                {
                    type: "submit",
                    class: "btn-submit"
                }
            ))
        );

        papyr.mount(
            "#form-mount",
            FormApp
        );
    </script>
</body>
</html>
```

---

## 🔍 How It Works

### 1. Reactive Form State

```js
let formData = {
    username: papyr.state(""),
    email: papyr.state(""),
    age: papyr.state("")
};

let errors = papyr.state({});
```

Each form field has its own reactive state object.

Benefits:

- Automatic UI updates
- Centralized form management
- Easy validation integration
- Predictable data flow

---

### 2. Validation Schema

```js
const validator =
    papyr.validate({

        username: {
            type: "string",
            required: true
        },

        email: {
            type: "string",
            required: true
        },

        age: {
            type: "number",
            required: true
        }
    });
```

The validator:

- Defines validation rules
- Enforces data types
- Checks required fields
- Generates error messages

---

### Supported Types

| Type | Description |
|--------|-------------|
| `"string"` | Text validation |
| `"number"` | Numeric validation |
| `"boolean"` | Boolean validation |
| `"email"` | Email format validation |
| `"url"` | URL format validation |

---

### 3. Form Submission

```js
const handleSubmit = (e) => {

    e.preventDefault();

    const payload = {
        username:
            formData.username.value,

        email:
            formData.email.value,

        age:
            Number(
                formData.age.value
            )
    };

    const validationErrors =
        validator(payload);
};
```

Workflow:

1. Prevent page reload
2. Collect field values
3. Run validation
4. Display errors if present
5. Submit if valid
6. Reset form state

---

### 4. Conditional Error Rendering

```js
papyr.if(
    () => errors.value.username,

    () =>
        papyr.div(
            ".error-msg",
            () =>
                errors.value.username
        )
)
```

Benefits:

- Errors only appear when needed
- Reactive updates
- Cleaner UI
- Reduced DOM complexity

---

### 5. Dynamic Error Styling

```js
class: () =>
    errors.value.username
        ? "error"
        : ""
```

When validation fails:

- Red border appears
- Background changes
- User receives visual feedback

When validation passes:

- Styling returns to normal automatically

---

### 6. Two-Way Data Binding

```js
...papyr.model(
    formData.username
)
```

Two-way binding means:

```text
User Input
      ↓
Reactive State
      ↓
UI Updates
```

Changes in either direction remain synchronized.

---

## 🎨 Extended Validation Examples

### Custom Validation Rules

```js
const validator =
    papyr.validate({

        username: {
            type: "string",
            required: true,
            minLength: 3,
            maxLength: 20,
            pattern:
                /^[a-zA-Z0-9_]+$/,
            message:
                "Username must be 3–20 characters."
        },

        email: {
            type: "email",
            required: true,
            message:
                "Please enter a valid email."
        },

        age: {
            type: "number",
            min: 18,
            max: 120
        }
    });
```

---

### Real-Time Validation

```js
papyr.input(
    "text",
    {
        ...papyr.model(
            formData.username
        ),

        oninput: (e) =>
            validateField(
                "username",
                e.target.value
            )
    }
);
```

Benefits:

- Immediate feedback
- Reduced submission errors
- Better user experience

---

### Password Confirmation

```js
if (
    passwords.password.value !==
    passwords.confirm.value
) {

    errors.value = {
        ...errors.value,

        confirm:
            "Passwords do not match"
    };

    return false;
}
```

Useful for:

- Registration forms
- Password reset flows
- Security settings

---

### Async Validation

```js
const checkUsername =
    async (username) => {

        const taken =
            ["admin", "user"];

        if (
            taken.includes(
                username.toLowerCase()
            )
        ) {

            errors.value = {
                ...errors.value,

                username:
                    "Username already taken"
            };

            return false;
        }

        return true;
    };
```

Common uses:

- Username availability
- Email uniqueness
- Referral codes
- Product lookups

---

## 📋 Validation Options

| Option | Type | Description |
|----------|---------|-------------|
| `type` | String | Validation type |
| `required` | Boolean | Field must have a value |
| `minLength` | Number | Minimum string length |
| `maxLength` | Number | Maximum string length |
| `min` | Number | Minimum numeric value |
| `max` | Number | Maximum numeric value |
| `pattern` | RegExp | Regex validation |
| `message` | String | Custom error text |
| `custom` | Function | Custom validation logic |

---

## 🎯 Real-World Use Cases

| Form Type | Common Validation Requirements |
|------------|-------------------------------|
| Login | Email format, required fields |
| Registration | Password strength, age validation |
| Checkout | Address, payment information |
| Profile Settings | URL validation, text limits |
| Search Filters | Numeric ranges, dates |
| Contact Forms | Required fields, email validation |

---

## ♿ Accessibility Tips

Use ARIA attributes to improve screen-reader support.

```html
<input
    aria-invalid={() =>
        !!errors.value.username
    }

    aria-describedby={() =>
        errors.value.username
            ? "username-error"
            : null
    }
/>

<div
    id="username-error"
    role="alert"
>
    {() => errors.value.username}
</div>
```

Benefits:

- Better screen-reader support
- Improved accessibility compliance
- Enhanced user experience

---

## 🔧 Advanced Form Patterns

### Multi-Step Forms

```js
let step =
    papyr.state(1);

const nextStep = () => {

    if (
        validateCurrentStep()
    ) {

        step.value++;
    }
};
```

Perfect for:

- Onboarding flows
- Checkout processes
- Surveys
- Large forms

---

### Dirty State Tracking

```js
let isDirty =
    papyr.state(false);

const markDirty = () => {
    isDirty.value = true;
};
```

Useful for:

- Unsaved changes warnings
- Draft protection
- Navigation guards

---

### Auto-Save Drafts

```js
const autoSave = () => {

    localStorage.setItem(
        "form_draft",

        JSON.stringify({
            username:
                formData.username.value,

            email:
                formData.email.value
        })
    );

    papyr.toast(
        "Draft saved",
        "info"
    );
};
```

Benefits:

- Prevents data loss
- Better long-form experiences
- Useful for large forms

---

## 💡 Best Practices

### Do ✅

- Validate required fields
- Show clear error messages
- Trim and sanitize inputs
- Focus the first invalid field
- Validate on the server as well
- Use async validation sparingly

---

### Don't ❌

- Show errors before interaction
- Use vague messages
- Ignore accessibility
- Trust client validation alone
- Overwhelm users with warnings

---

## ✅ Summary

This recipe demonstrates a complete form validation system built with **Papyr.js**.

### Included Features

- ✅ Reactive form state
- ✅ Two-way data binding
- ✅ Schema-based validation
- ✅ Conditional error rendering
- ✅ Dynamic error styling
- ✅ Toast notifications
- ✅ Automatic form reset
- ✅ Accessibility support
- ✅ Advanced validation patterns
- ✅ Single-file setup

Simply copy the example into `index.html`, open it in a browser, and experiment with valid and invalid input values to see reactive validation in action.