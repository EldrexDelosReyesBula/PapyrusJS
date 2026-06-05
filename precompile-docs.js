const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked highlighting
marked.setOptions({
    highlight: (code, lang) => {
        return code; // Highlight will happen client-side using hljs
    }
});

const docsMap = {
    'README': 'README.md',
    'Master Specification': 'DOCS.md',
    'Design Guidelines': 'PAPY-DESIGN.md',
    'Translation Guide': 'TRANSLATION_GUIDE.md',
    'Changelog': 'CHANGELOG.md',
    'Contributing': 'CONTRIBUTING.md',
    'License': 'LICENSE',
    'Getting Started Guide': 'docs/getting-started.md',
    'The Papyr Way': 'docs/papyr-way.md',
    'Core Concepts': 'docs/core-concepts.md',
    'Limitations': 'docs/limitations.md',
    'FAQ': 'docs/faq.md',
    'What is Papyr': 'docs/beginner/what-is-papyr.md',
    'Installation Guide': 'docs/beginner/installation.md',
    'Building Your First Papyr App': 'docs/beginner/first-app.md',
    'State & Reactivity': 'docs/intermediate/state.md',
    'SPA Routing & Pages': 'docs/intermediate/routing.md',
    'Components & Lifecycle': 'docs/intermediate/components.md',
    'Architecture, Monorepo & Isomorphic Builds': 'docs/advanced/architecture.md',
    'Official Plugin Modules & Lifecycle Cleanups': 'docs/advanced/plugins.md',
    'Plugin Registry & Adapters': 'docs/advanced/registry.md',
    'Performance Optimization & Memory Management': 'docs/guides/performance.md',
    'Security & Web Access Transparency Toolkit (WATT)': 'docs/guides/security.md',
    'Debugging & Diagnostics': 'docs/guides/debugging.md',
    'Architecture & Kernel Lifecycles': 'docs/guides/architecture.md',
    'State API': 'docs/api/state.md',
    'Computed States API': 'docs/api/computed.md',
    'DOM API': 'docs/api/dom.md',
    'Routing API': 'docs/api/routing.md',
    'Math API': 'docs/api/math.md',
    'Unified DB API': 'docs/api/db.md',
    'Storage API': 'docs/api/storage.md',
    'UI & Components API': 'docs/api/ui.md',
    'Advanced & Plugins API': 'docs/api/advanced.md',
    'Animation API': 'docs/api/animation.md',
    'Utilities API': 'docs/api/utils.md',
    // New 3.1.2 APIs:
    'Shapes & Physics API': 'docs/api/shapes.md',
    'Legacy Renovation API': 'docs/api/renovate.md',
    'Priority Scheduler & Recovery API': 'docs/api/scheduler.md',
    'Framework Bridges API': 'docs/api/bridges.md',
    // Recipes:
    'Todo App': 'docs/recipes/todo.md',
    'Forms & Validation': 'docs/recipes/form.md',
    'Modals & Overlays': 'docs/recipes/modal.md',
    'Database CRUD': 'docs/recipes/crud.md',
    'Single Page Application': 'docs/recipes/spa.md',
    'Dashboard Layouts': 'docs/recipes/dashboard.md',
    // Contributor standards:
    'Coding & Security Standards': 'docs/contributors/standards.md',
    'Testing Guidelines': 'docs/contributors/testing.md',
    'Pull Request Guidelines': 'docs/contributors/pull-requests.md'
};

console.log("📄 Precompiling markdown files to HTML...");

const precompiled = {};

for (const [key, relativePath] of Object.entries(docsMap)) {
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
        const markdown = fs.readFileSync(fullPath, 'utf8');
        precompiled[key] = marked.parse(markdown);
    } else {
        console.warn(`⚠️ Warning: file not found at ${fullPath}`);
    }
}

const docsDataCode = `window.PRE_RENDERED_DOCS = ${JSON.stringify(precompiled, null, 2)};`;
fs.writeFileSync(path.join(__dirname, 'public', 'docs-data.js'), docsDataCode, 'utf8');
console.log("✅ Docs precompiled successfully to public/docs-data.js");
