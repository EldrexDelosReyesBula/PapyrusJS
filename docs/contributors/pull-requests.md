# Pull Request Submission Guidelines

We welcome community contributions. To ensure a smooth review process, please follow this pull request workflow.

---

## 🧭 1. Branching Strategy

Before making changes, create a descriptive feature branch:

-   `feat/my-feature-name` (for new features or components)
-   `fix/bug-description` (for bug fixes or security patches)
-   `docs/section-update` (for documentation additions or improvements)
-   `refactor/cleanup` (for code organization without changes in functionality)

---

## 🚀 2. Pre-Flight Checklist

Before opening a pull request, complete the following checklist:

### A. Run a Local Build
Verify that the workspace compiles successfully. This ensures that generated bundles and distribution files are up to date:
```bash
node build.js
```

### B. Validate Type Declarations
If you modified any public APIs, ensure that you update the TypeScript definitions in [papyr.d.ts](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/public/papyr.d.ts).

### C. Verify Interactive Tests
Ensure there are no regressions. Open the relevant files in the `tests/` directory to verify reactivity, routing, and animation pipelines still function correctly.

---

## 🤝 3. Submitting the PR

-   **Title:** Write a concise, imperative PR title (e.g., `feat: Add accordion component to UI suite`).
-   **Description:** Clearly describe:
    1.  The problem this solves.
    2.  The implementation approach and any breaking changes.
    3.  A summary of how you verified the changes.
-   **Review Process:** Maintainers will review the code, verify execution metrics, and suggest improvements. Once approved, the branch will be merged into the main release branch.
