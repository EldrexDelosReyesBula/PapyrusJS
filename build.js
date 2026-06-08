const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
const coreFiles = [
    'core/papyr-core.js',
    'core/security.js',
    'core/reactivity.js',
    'core/router.js',
    'core/math.js',
    'core/db.js',
    'core/crud.js',
    'core/orm.js',
    'core/auth.js',
    'core/payments.js',
    'core/api.js',
    'core/debug.js',
    'core/ssr.js',
    'core/edge.js',
    'core/isr.js',
    'core/scheduler.js',
    'core/style.js',
    'core/layout.js',
    'core/accessibility.js',
    'core/renovate.js',
    'core/gateway.js',
    'core/sdk.js',
    'core/virtualization.js',
    'core/config.js',
    'core/trust.js',
    'core/access.js',
    'core/watt-sdk.js',
    'core/pssr-sdk.js',
    'core/freeform.js'
];
const pluginFiles = [
    'plugins/official.js',
    'plugins/kernel-plugins.js',
    'plugins/animate.js',
    'plugins/charts.js',
    'plugins/browser-api.js',
    'plugins/pwa.js',
    'plugins/design.js',
    'plugins/power.js',
    'plugins/particles.js',
    'plugins/ui-components.js',
    'plugins/watt.js',
    'plugins/seo.js',
    'plugins/game.js',
    'plugins/layout.js',
    'plugins/shapes.js',
    'plugins/immersive.js',
    'plugins/integrations.js',
    'plugins/system.js',
    'plugins/ml.js',
    'plugins/ocr.js',
    'plugins/physics.js',
    'plugins/ai.js',
    'plugins/pdf.js',
    'plugins/science.js'
];
const stylesFile = 'styles/complete.css';

console.log("🚀 Starting Papyr.js compiler...");

const hrstart = process.hrtime();

try {
    // 1. Load core files contents
    const coreContents = coreFiles.map(file => {
        const filePath = path.join(srcDir, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Core source file not found: ${filePath}`);
        }
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
    }).join('\n');

    // 2. Build papyr.js (Core Browser IIFE Bundle)
    const paperCode = `/**
 * PAPYR STATIC SITE LIBRARY - Core Bundle
 * v3.1.3 - Agile Modular Architecture (Reactivity, Hash SPA Router, Math Logic, Persistent CRUD Store)
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    // Export isomorphic context
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;

    fs.writeFileSync(path.join(publicDir, 'papyr.js'), paperCode, 'utf8');
    console.log("✨ Compiled papyr.js successfully!");

    // 3. Load official plugins & widgets
    const pluginsContent = pluginFiles.map(file => {
        const filePath = path.join(srcDir, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Plugins source file not found: ${filePath}`);
        }
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
    }).join('\n');

    // 4. Load styled CSS variable rules
    const stylesPath = path.join(srcDir, stylesFile);
    if (!fs.existsSync(stylesPath)) {
        throw new Error(`CSS source file not found: ${stylesPath}`);
    }
    const stylesContent = fs.readFileSync(stylesPath, 'utf8').trim();

    // 5. Build papyr-complete.js (Complete Showcase Browser IIFE Bundle)
    const paperCompleteCode = `/**
 * PAPYR STATIC SITE LIBRARY - Complete Showcase Bundle
 * v3.1.3 - Core Reactivity, SPA Routing, Reactive Math Logic, Persistent Local CRUD Database, Responsive Widgets
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    // Export isomorphic context BEFORE loading plugins
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    const papyr = papyrInstance;

${pluginsContent}

    // Auto-inject Themeable Stylesheets
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.id = 'papyr-complete-styles';
        style.textContent = \`
${stylesContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}
\`;
        document.head.appendChild(style);
        console.log("📄 Papyr Complete styling successfully injected.");
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;

    fs.writeFileSync(path.join(publicDir, 'papyr-complete.js'), paperCompleteCode, 'utf8');
    console.log("✨ Compiled papyr-complete.js successfully!");

    // 6. Build papyr.esm.js (Core ES Module Bundle)
    const paperEsmCode = `/**
 * PAPYR STATIC SITE LIBRARY - Core Bundle (ESM)
 * v3.1.3 - Agile Modular Architecture (Reactivity, Hash SPA Router, Math Logic, Persistent CRUD Store)
 * Released under MIT License.
 */

let activeEffect = null;
let isDebug = false;

${coreContents}

const papyr = createPapyr();
export { papyr, createPapyr };
export const signal = papyr.signal;
export const computed = papyr.computed;
export const watch = papyr.watch;
export const effect = papyr.effect;
export const mount = papyr.mount;
export const route = papyr.route;
export const page = papyr.page;
export const theme = papyr.theme;
export const plugin = papyr.plugin;
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr.esm.js'), paperEsmCode, 'utf8');
    console.log("✨ Compiled papyr.esm.js successfully!");

    // 7. Build papyr-complete.esm.js (Complete Showcase ES Module Bundle)
    const paperCompleteEsmCode = `/**
 * PAPYR STATIC SITE LIBRARY - Complete Showcase Bundle (ESM)
 * v3.1.3 - Core Reactivity, SPA Routing, Reactive Math Logic, Persistent Local CRUD Database, Responsive Widgets
 * Released under MIT License.
 */

let activeEffect = null;
let isDebug = false;

${coreContents}

const papyr = createPapyr();
if (typeof window !== 'undefined') {
    window.papyr = papyr;
}

${pluginsContent}

// Auto-inject Themeable Stylesheets
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.id = 'papyr-complete-styles';
    style.textContent = \`
${stylesContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}
\`;
    document.head.appendChild(style);
    console.log("📄 Papyr Complete styling successfully injected.");
}

export { papyr, createPapyr };
export const signal = papyr.signal;
export const computed = papyr.computed;
export const watch = papyr.watch;
export const effect = papyr.effect;
export const mount = papyr.mount;
export const route = papyr.route;
export const page = papyr.page;
export const theme = papyr.theme;
export const plugin = papyr.plugin;
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-complete.esm.js'), paperCompleteEsmCode, 'utf8');
    console.log("✨ Compiled papyr-complete.esm.js successfully!");

    // 7b. Build papyr-plugins.js (Decoupled Plugins IIFE Bundle)
    const paperPluginsCode = `/**
 * PAPYR STATIC SITE LIBRARY - Decoupled Plugins Bundle
 * v3.1.3 - Official Capability Modules
 * Released under MIT License.
 */

(function(globalContext) {
    const papyr = typeof window !== 'undefined' ? window.papyr : (typeof global !== 'undefined' ? global.papyr : null);
    if (!papyr) {
        console.warn("Papyr core not detected. Plugins must be loaded after papyr core.");
        return;
    }

${pluginsContent}

    console.log("📄 Papyr plugins loaded and registered successfully!");
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-plugins.js'), paperPluginsCode, 'utf8');
    console.log("✨ Compiled papyr-plugins.js successfully!");

    // 7c. Build Modular CDN Bundle: papyr-core.js
    fs.writeFileSync(path.join(publicDir, 'papyr-core.js'), paperCode, 'utf8');
    console.log("✨ Compiled papyr-core.js successfully!");

    // 7d. Build Modular CDN Bundle: papyr-ui.js
    const uiPluginFiles = [
        'plugins/official.js',
        'plugins/design.js',
        'plugins/layout.js',
        'plugins/shapes.js',
        'plugins/ui-components.js',
        'plugins/animate.js',
        'plugins/charts.js'
    ];
    const uiPluginsContent = uiPluginFiles.map(file => {
        const filePath = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
    }).join('\n');

    const paperUiCode = `/**
 * PAPYR STATIC SITE LIBRARY - UI & Layout Modular Bundle
 * v3.1.3 - Core Reactivity, SPA Routing, Layouts, Design Engine, and Premium UI Components
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    // Export isomorphic context BEFORE loading plugins
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    const papyr = papyrInstance;

${uiPluginsContent}

    // Auto-inject Themeable Stylesheets
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.id = 'papyr-complete-styles';
        style.textContent = \`
${stylesContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}
\`;
        document.head.appendChild(style);
        console.log("📄 Papyr UI styling successfully injected.");
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-ui.js'), paperUiCode, 'utf8');
    console.log("✨ Compiled papyr-ui.js successfully!");

    // 7e. Build Modular CDN Bundle: papyr-advanced.js
    const advancedPluginFiles = [
        'plugins/particles.js',
        'plugins/immersive.js',
        'plugins/ml.js',
        'plugins/ocr.js',
        'plugins/physics.js',
        'plugins/ai.js',
        'plugins/pdf.js',
        'plugins/science.js'
    ];
    const advancedPluginsContent = advancedPluginFiles.map(file => {
        const filePath = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
    }).join('\n');

    const paperAdvancedCode = `/**
 * PAPYR STATIC SITE LIBRARY - Advanced Engineering Modular Bundle
 * v3.1.3 - Core Reactivity, AI/ML Toolkits, 3D Immersive Graphics, 2D Verlet Physics, and PDF Exporter
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    // Export isomorphic context BEFORE loading plugins
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    const papyr = papyrInstance;

${advancedPluginsContent}

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-advanced.js'), paperAdvancedCode, 'utf8');
    console.log("✨ Compiled papyr-advanced.js successfully!");

    // 7f. Build Modular CDN Bundle: papyr-ssr.js
    const ssrPluginFiles = [
        'plugins/integrations.js'
    ];
    const ssrPluginsContent = ssrPluginFiles.map(file => {
        const filePath = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
    }).join('\n');

    const paperSsrCode = `/**
 * PAPYR STATIC SITE LIBRARY - Server-Side Rendering (SSR) Bundle
 * v3.1.3 - Zero-dependency Server-Side Renderer (SSR) & Express connector
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    // Export isomorphic context BEFORE loading plugins
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    const papyr = papyrInstance;

${ssrPluginsContent}

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-ssr.js'), paperSsrCode, 'utf8');
    console.log("✨ Compiled papyr-ssr.js successfully!");

    const paperSsrEsmCode = `/**
 * PAPYR STATIC SITE LIBRARY - Server-Side Rendering (SSR) Bundle (ESM)
 * v3.1.3 - Zero-dependency Server-Side Renderer (SSR) & Express connector
 * Released under MIT License.
 */

let activeEffect = null;
let isDebug = false;

${coreContents}

const papyr = createPapyr();
if (typeof window !== 'undefined') {
    window.papyr = papyr;
}

${ssrPluginsContent}

export { papyr, createPapyr };
export const signal = papyr.signal;
export const computed = papyr.computed;
export const watch = papyr.watch;
export const effect = papyr.effect;
export const mount = papyr.mount;
export const route = papyr.route;
export const page = papyr.page;
export const theme = papyr.theme;
export const plugin = papyr.plugin;
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-ssr.esm.js'), paperSsrEsmCode, 'utf8');
    console.log("✨ Compiled papyr-ssr.esm.js successfully!");

    // 7g. Build Modular CDN Bundle: papyr-game.js
    const gamePluginFiles = [
        'plugins/game.js'
    ];
    const gamePluginsContent = gamePluginFiles.map(file => {
        const filePath = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
    }).join('\n');

    const paperGameCode = `/**
 * PAPYR STATIC SITE LIBRARY - Game SDK Modular Bundle
 * v3.1.3 - Core Reactivity, Canvas/WebGL/WebGPU Adapters, Physics, and Inputs
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    // Export isomorphic context BEFORE loading plugins
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    const papyr = papyrInstance;

${gamePluginsContent}

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-game.js'), paperGameCode, 'utf8');
    console.log("✨ Compiled papyr-game.js successfully!");

    const paperGameEsmCode = `/**
 * PAPYR STATIC SITE LIBRARY - Game SDK Modular Bundle (ESM)
 * v3.1.3 - Core Reactivity, Canvas/WebGL/WebGPU Adapters, Physics, and Inputs
 * Released under MIT License.
 */

let activeEffect = null;
let isDebug = false;

${coreContents}

const papyr = createPapyr();
if (typeof window !== 'undefined') {
    window.papyr = papyr;
}

${gamePluginsContent}

export { papyr, createPapyr };
export const signal = papyr.signal;
export const computed = papyr.computed;
export const watch = papyr.watch;
export const effect = papyr.effect;
export const mount = papyr.mount;
export const route = papyr.route;
export const page = papyr.page;
export const theme = papyr.theme;
export const plugin = papyr.plugin;
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-game.esm.js'), paperGameEsmCode, 'utf8');
    console.log("✨ Compiled papyr-game.esm.js successfully!");

    // 7h. Build Modular CDN Bundle: papyr-seo.js
    const seoPluginFiles = [
        'plugins/seo.js'
    ];
    const seoPluginsContent = seoPluginFiles.map(file => {
        const filePath = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
    }).join('\n');

    const paperSeoCode = `/**
 * PAPYR STATIC SITE LIBRARY - SEO Toolkit Bundle
 * v3.1.3 - Isomorphic SEO: Open Graph, Twitter Cards, Schema.org, Sitemaps, RSS, Canonical URLs
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    // Export isomorphic context BEFORE loading plugins
    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') {
        window.papyr = papyrInstance;
    } else if (typeof global !== 'undefined') {
        global.papyr = papyrInstance;
    }
    const papyr = papyrInstance;

${seoPluginsContent}

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = papyrInstance;
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-seo.js'), paperSeoCode, 'utf8');
    console.log("✨ Compiled papyr-seo.js successfully!");

    const paperSeoEsmCode = `/**
 * PAPYR STATIC SITE LIBRARY - SEO Toolkit Bundle (ESM)
 * v3.1.3 - Isomorphic SEO: Open Graph, Twitter Cards, Schema.org, Sitemaps, RSS, Canonical URLs
 * Released under MIT License.
 */

let activeEffect = null;
let isDebug = false;

${coreContents}

const papyr = createPapyr();
if (typeof window !== 'undefined') {
    window.papyr = papyr;
}

${seoPluginsContent}

export { papyr, createPapyr };
export const signal = papyr.signal;
export const computed = papyr.computed;
export const watch = papyr.watch;
export const effect = papyr.effect;
export const mount = papyr.mount;
export const route = papyr.route;
export const page = papyr.page;
export const theme = papyr.theme;
export const plugin = papyr.plugin;
export const seo = papyr.seo;
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-seo.esm.js'), paperSeoEsmCode, 'utf8');
    console.log("✨ Compiled papyr-seo.esm.js successfully!");

    // 7i. Build papyr-watt.js — WATT SDK standalone bundle
    const wattSdkFiles = ['core/watt-sdk.js'];
    const wattSdkContent = wattSdkFiles.map(file => {
        const fp = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(fp, 'utf8') + '\n';
    }).join('\n');

    const paperWattCode = `/**
 * PAPYR WATT SDK — Web Access Transparency Toolkit
 * v3.1.3 - Permission flows, consent banners, transparency dialogs, privacy notices
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') { window.papyr = papyrInstance; }
    else if (typeof global !== 'undefined') { global.papyr = papyrInstance; }
    const papyr = papyrInstance;

${wattSdkContent}

    if (typeof module !== 'undefined' && module.exports) { module.exports = papyrInstance; }
    else if (typeof exports !== 'undefined') { exports.papyr = papyrInstance; }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-watt.js'), paperWattCode, 'utf8');
    console.log("✨ Compiled papyr-watt.js successfully!");

    const paperWattEsmCode = `/**
 * PAPYR WATT SDK (ESM)
 * v3.1.3 - Permission flows, consent banners, transparency dialogs, privacy notices
 * Released under MIT License.
 */

let activeEffect = null;
let isDebug = false;

${coreContents}

const papyr = createPapyr();
if (typeof window !== 'undefined') { window.papyr = papyr; }

${wattSdkContent}

export { papyr, createPapyr };
export const signal = papyr.signal;
export const watt = papyr.watt;
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-watt.esm.js'), paperWattEsmCode, 'utf8');
    console.log("✨ Compiled papyr-watt.esm.js successfully!");

    // 7j. Build papyr-pssr.js — PSSR SDK standalone bundle
    const pssrSdkFiles = ['core/pssr-sdk.js'];
    const pssrSdkContent = pssrSdkFiles.map(file => {
        const fp = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(fp, 'utf8') + '\n';
    }).join('\n');

    const paperPssrCode = `/**
 * PAPYR PSSR SDK — Advanced Rendering Strategy SDK
 * v3.1.3 - Strategy builder, lazy islands, meta pipeline, edge config, SSG prerender
 * Released under MIT License.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') { window.papyr = papyrInstance; }
    else if (typeof global !== 'undefined') { global.papyr = papyrInstance; }
    const papyr = papyrInstance;

${pssrSdkContent}

    if (typeof module !== 'undefined' && module.exports) { module.exports = papyrInstance; }
    else if (typeof exports !== 'undefined') { exports.papyr = papyrInstance; }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-pssr.js'), paperPssrCode, 'utf8');
    console.log("✨ Compiled papyr-pssr.js successfully!");

    const paperPssrEsmCode = `/**
 * PAPYR PSSR SDK (ESM)
 * v3.1.3 - Strategy builder, lazy islands, meta pipeline, edge config, SSG prerender
 * Released under MIT License.
 */

let activeEffect = null;
let isDebug = false;

${coreContents}

const papyr = createPapyr();
if (typeof window !== 'undefined') { window.papyr = papyr; }

${pssrSdkContent}

export { papyr, createPapyr };
export const pssr = papyr.pssr;
export const isr = papyr.isr;
export const edge = papyr.edge;
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-pssr.esm.js'), paperPssrEsmCode, 'utf8');
    console.log("✨ Compiled papyr-pssr.esm.js successfully!");

    // 7k. Build papyr-trust.js — Trust Boundaries audit utility (no rendering engine, lightweight)
    const trustFiles = ['core/trust.js', 'core/config.js', 'core/access.js'];
    const trustContent = trustFiles.map(file => {
        const fp = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(fp, 'utf8') + '\n';
    }).join('\n');

    const paperTrustCode = `/**
 * PAPYR TRUST — Trust Boundaries Audit Utility
 * v3.1.3 - Zone-based trust model, runtime audit, third-party disclosure, access tiers
 * Released under MIT License.
 * Lightweight: no rendering engine. For CI/CD trust audits and runtime transparency.
 */

(function(globalContext) {
    let activeEffect = null;
    let isDebug = false;

${coreContents}

    let papyrInstance = createPapyr();
    if (typeof window !== 'undefined') { window.papyr = papyrInstance; }
    else if (typeof global !== 'undefined') { global.papyr = papyrInstance; }
    const papyr = papyrInstance;

${trustContent}

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { papyr: papyrInstance, trust: papyrInstance.trust, access: papyrInstance.access };
    } else if (typeof exports !== 'undefined') {
        exports.papyr = papyrInstance;
        exports.trust = papyrInstance.trust;
        exports.access = papyrInstance.access;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-trust.js'), paperTrustCode, 'utf8');
    console.log("✨ Compiled papyr-trust.js successfully!");

    // 8. Try optional minification
    try {
        const UglifyJS = require('uglify-js');
        console.log("📦 Minifying bundles...");
        
        // Minify core
        const minCore = UglifyJS.minify(paperCode, { sourceMap: { filename: 'papyr.min.js', url: 'papyr.min.js.map' } });
        if (minCore.error) throw minCore.error;
        fs.writeFileSync(path.join(publicDir, 'papyr.min.js'), minCore.code, 'utf8');
        fs.writeFileSync(path.join(publicDir, 'papyr.min.js.map'), minCore.map, 'utf8');

        // Minify modular core
        const minCoreModular = UglifyJS.minify(paperCode, { sourceMap: { filename: 'papyr-core.min.js', url: 'papyr-core.min.js.map' } });
        if (minCoreModular.error) throw minCoreModular.error;
        fs.writeFileSync(path.join(publicDir, 'papyr-core.min.js'), minCoreModular.code, 'utf8');
        
        // Minify complete
        const minComplete = UglifyJS.minify(paperCompleteCode, { sourceMap: { filename: 'papyr-complete.min.js', url: 'papyr-complete.min.js.map' } });
        if (minComplete.error) throw minComplete.error;
        fs.writeFileSync(path.join(publicDir, 'papyr-complete.min.js'), minComplete.code, 'utf8');
        fs.writeFileSync(path.join(publicDir, 'papyr-complete.min.js.map'), minComplete.map, 'utf8');

        // Minify UI
        const minUi = UglifyJS.minify(paperUiCode, { sourceMap: { filename: 'papyr-ui.min.js', url: 'papyr-ui.min.js.map' } });
        if (minUi.error) throw minUi.error;
        fs.writeFileSync(path.join(publicDir, 'papyr-ui.min.js'), minUi.code, 'utf8');

        // Minify Advanced
        const minAdvanced = UglifyJS.minify(paperAdvancedCode, { sourceMap: { filename: 'papyr-advanced.min.js', url: 'papyr-advanced.min.js.map' } });
        if (minAdvanced.error) throw minAdvanced.error;
        fs.writeFileSync(path.join(publicDir, 'papyr-advanced.min.js'), minAdvanced.code, 'utf8');

        // Minify SSR
        const minSsr = UglifyJS.minify(paperSsrCode, { sourceMap: { filename: 'papyr-ssr.min.js', url: 'papyr-ssr.min.js.map' } });
        if (minSsr.error) throw minSsr.error;
        fs.writeFileSync(path.join(publicDir, 'papyr-ssr.min.js'), minSsr.code, 'utf8');

        // Minify Game
        const minGame = UglifyJS.minify(paperGameCode, { sourceMap: { filename: 'papyr-game.min.js', url: 'papyr-game.min.js.map' } });
        if (minGame.error) throw minGame.error;
        fs.writeFileSync(path.join(publicDir, 'papyr-game.min.js'), minGame.code, 'utf8');
        
        console.log("✨ Minified bundles and source maps generated successfully!");
    } catch (e) {
        console.log("💡 Tip: Run 'npm install' to enable minification and source maps compilation.");
    }

    // 8b. Precompile markdown docs
    try {
        require('./precompile-docs.js');
    } catch (e) {
        console.error("⚠️ Failed to precompile docs:", e);
    }

    const hrend = process.hrtime(hrstart);
    const ms = (hrend[0] * 1000 + hrend[1] / 1000000).toFixed(2);
    console.log(`\n🎉 Compilation finished successfully in ${ms}ms!`);

} catch (err) {
    console.error("❌ Build compilation failed!", err);
    process.exit(1);
}

// ============================================================
// 📦 MONOREPO WORKSPACE DISTRIBUTION
// Distribute compiled bundles into packages/* workspaces
// ============================================================

console.log("\n📦 Distributing bundles to monorepo workspaces...");

const packagesDir = path.join(__dirname, 'packages');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function copyFile(src, dest) {
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`   ✔ Copied ${path.basename(src)} → ${path.relative(__dirname, dest)}`);
    } else {
        console.warn(`   ⚠ Source not found (skip): ${src}`);
    }
}

const sharedDocs = ['README.md', 'LICENSE', 'DOCS.md', 'TRANSLATION_GUIDE.md'];

function syncSharedDocs(packageDir) {
    sharedDocs.forEach(docFile => {
        const src = path.join(__dirname, docFile);
        const dest = path.join(packageDir, docFile);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
        }
    });
}

// ── @eldrex/papyr (core) ──────────────────────────────────
const corePackDir = path.join(packagesDir, 'core', 'dist');
ensureDir(corePackDir);
copyFile(path.join(publicDir, 'papyr.js'),          path.join(corePackDir, 'papyr.js'));
copyFile(path.join(publicDir, 'papyr.esm.js'),      path.join(corePackDir, 'papyr.esm.js'));
copyFile(path.join(publicDir, 'papyr.d.ts'),         path.join(corePackDir, 'papyr.d.ts'));
syncSharedDocs(path.join(packagesDir, 'core'));
console.log("   ✅ @eldrex/papyr (core) distributed.");

// ── @eldrex/papyr-router ─────────────────────────────────
const routerPackDir = path.join(packagesDir, 'router', 'dist');
ensureDir(routerPackDir);
// The router is part of the core IIFE — we copy core builds as the router bundle.
// A dedicated extraction can be done in a future refactor once src/core/router.js is standalone.
copyFile(path.join(publicDir, 'papyr.js'),          path.join(routerPackDir, 'papyr-router.js'));
copyFile(path.join(publicDir, 'papyr.esm.js'),      path.join(routerPackDir, 'papyr-router.esm.js'));
syncSharedDocs(path.join(packagesDir, 'router'));
console.log("   ✅ @eldrex/papyr-router distributed.");

// ── @eldrex/papyr-animate ────────────────────────────────
const animPackDir = path.join(packagesDir, 'animate', 'dist');
ensureDir(animPackDir);
copyFile(path.join(publicDir, 'papyr-ui.js'),       path.join(animPackDir, 'papyr-animate.js'));
copyFile(path.join(publicDir, 'papyr-ui.min.js'),   path.join(animPackDir, 'papyr-animate.esm.js'));
syncSharedDocs(path.join(packagesDir, 'animate'));
console.log("   ✅ @eldrex/papyr-animate distributed.");

// ── @eldrex/papyr-charts ─────────────────────────────────
const chartsPackDir = path.join(packagesDir, 'charts', 'dist');
ensureDir(chartsPackDir);
copyFile(path.join(publicDir, 'papyr-ui.js'),       path.join(chartsPackDir, 'papyr-charts.js'));
copyFile(path.join(publicDir, 'papyr-ui.min.js'),   path.join(chartsPackDir, 'papyr-charts.esm.js'));
syncSharedDocs(path.join(packagesDir, 'charts'));
console.log("   ✅ @eldrex/papyr-charts distributed.");

// ── @eldrex/papyr-shapes ─────────────────────────────────
const shapesPackDir = path.join(packagesDir, 'shapes', 'dist');
ensureDir(shapesPackDir);
copyFile(path.join(publicDir, 'papyr-ui.js'),       path.join(shapesPackDir, 'papyr-shapes.js'));
copyFile(path.join(publicDir, 'papyr-ui.min.js'),   path.join(shapesPackDir, 'papyr-shapes.esm.js'));
syncSharedDocs(path.join(packagesDir, 'shapes'));
console.log("   ✅ @eldrex/papyr-shapes distributed.");

// ── @eldrex/papyr-3d ─────────────────────────────────────
const threeDPackDir = path.join(packagesDir, '3d', 'dist');
ensureDir(threeDPackDir);
copyFile(path.join(publicDir, 'papyr-advanced.js'),     path.join(threeDPackDir, 'papyr-3d.js'));
copyFile(path.join(publicDir, 'papyr-advanced.min.js'), path.join(threeDPackDir, 'papyr-3d.esm.js'));
syncSharedDocs(path.join(packagesDir, '3d'));
console.log("   ✅ @eldrex/papyr-3d distributed.");


// ── @eldrex/papyr-db ─────────────────────────────────────
const dbPackDir = path.join(packagesDir, 'db', 'dist');
ensureDir(dbPackDir);
copyFile(path.join(publicDir, 'papyr.js'),          path.join(dbPackDir, 'papyr-db.js'));
copyFile(path.join(publicDir, 'papyr.esm.js'),      path.join(dbPackDir, 'papyr-db.esm.js'));
syncSharedDocs(path.join(packagesDir, 'db'));
console.log("   ✅ @eldrex/papyr-db distributed.");

// ── @eldrex/papyr-ai ─────────────────────────────────────
const aiPackDir = path.join(packagesDir, 'ai', 'dist');
ensureDir(aiPackDir);
copyFile(path.join(publicDir, 'papyr-advanced.js'),     path.join(aiPackDir, 'papyr-ai.js'));
copyFile(path.join(publicDir, 'papyr-advanced.min.js'), path.join(aiPackDir, 'papyr-ai.esm.js'));
syncSharedDocs(path.join(packagesDir, 'ai'));
console.log("   ✅ @eldrex/papyr-ai distributed.");

// ── @eldrex/papyr-auth ───────────────────────────────────
const authPackDir = path.join(packagesDir, 'auth', 'dist');
ensureDir(authPackDir);
copyFile(path.join(publicDir, 'papyr.js'),          path.join(authPackDir, 'papyr-auth.js'));
copyFile(path.join(publicDir, 'papyr.esm.js'),      path.join(authPackDir, 'papyr-auth.esm.js'));
syncSharedDocs(path.join(packagesDir, 'auth'));
console.log("   ✅ @eldrex/papyr-auth distributed.");

// ── @eldrex/papyr-ssr ────────────────────────────────────
const ssrPackDir = path.join(packagesDir, 'ssr', 'dist');
ensureDir(ssrPackDir);
copyFile(path.join(publicDir, 'papyr-ssr.js'),      path.join(ssrPackDir, 'papyr-ssr.js'));
copyFile(path.join(publicDir, 'papyr-ssr.esm.js'),  path.join(ssrPackDir, 'papyr-ssr.esm.js'));
syncSharedDocs(path.join(packagesDir, 'ssr'));
console.log("   ✅ @eldrex/papyr-ssr distributed.");

// ── @eldrex/papyr-game ───────────────────────────────────
const gamePackDir = path.join(packagesDir, 'game', 'dist');
ensureDir(gamePackDir);
copyFile(path.join(publicDir, 'papyr-game.js'),      path.join(gamePackDir, 'papyr-game.js'));
copyFile(path.join(publicDir, 'papyr-game.esm.js'),  path.join(gamePackDir, 'papyr-game.esm.js'));
syncSharedDocs(path.join(packagesDir, 'game'));
console.log("   ✅ @eldrex/papyr-game distributed.");

// ── @eldrex/papyr-seo ────────────────────────────────────
const seoPackDir = path.join(packagesDir, 'seo', 'dist');
ensureDir(seoPackDir);
copyFile(path.join(publicDir, 'papyr-seo.js'),       path.join(seoPackDir, 'papyr-seo.js'));
copyFile(path.join(publicDir, 'papyr-seo.esm.js'),   path.join(seoPackDir, 'papyr-seo.esm.js'));
console.log("   ✅ @eldrex/papyr-seo distributed.");

// ── @eldrex/papyr-watt ───────────────────────────────────
const wattPackDir = path.join(packagesDir, 'watt', 'dist');
ensureDir(wattPackDir);
copyFile(path.join(publicDir, 'papyr-watt.js'),      path.join(wattPackDir, 'papyr-watt.js'));
copyFile(path.join(publicDir, 'papyr-watt.esm.js'),  path.join(wattPackDir, 'papyr-watt.esm.js'));
console.log("   ✅ @eldrex/papyr-watt distributed.");

// ── @eldrex/papyr-pssr ───────────────────────────────────
const pssrPackDir = path.join(packagesDir, 'pssr', 'dist');
ensureDir(pssrPackDir);
copyFile(path.join(publicDir, 'papyr-pssr.js'),      path.join(pssrPackDir, 'papyr-pssr.js'));
copyFile(path.join(publicDir, 'papyr-pssr.esm.js'),  path.join(pssrPackDir, 'papyr-pssr.esm.js'));
console.log("   ✅ @eldrex/papyr-pssr distributed.");

console.log("\n🚀 All workspace packages distributed successfully!\n");
