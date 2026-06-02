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
    'core/debug.js'
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
    'plugins/layout.js',
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
 * PAPER STATIC SITE LIBRARY - Core Bundle
 * v3.0 - Agile Modular Architecture (Reactivity, Hash SPA Router, Math Logic, Persistent CRUD Store)
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
 * PAPER STATIC SITE LIBRARY - Complete Showcase Bundle
 * v3.0 - Core Reactivity, SPA Routing, Reactive Math Logic, Persistent Local CRUD Database, Responsive Widgets
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
 * PAPER STATIC SITE LIBRARY - Core Bundle (ESM)
 * v3.0 - Agile Modular Architecture (Reactivity, Hash SPA Router, Math Logic, Persistent CRUD Store)
 * Released under MIT License.
 */

let activeEffect = null;
let isDebug = false;

${coreContents}

const papyr = createPapyr();
export { papyr, createPapyr };
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr.esm.js'), paperEsmCode, 'utf8');
    console.log("✨ Compiled papyr.esm.js successfully!");

    // 7. Build papyr-complete.esm.js (Complete Showcase ES Module Bundle)
    const paperCompleteEsmCode = `/**
 * PAPER STATIC SITE LIBRARY - Complete Showcase Bundle (ESM)
 * v3.0 - Core Reactivity, SPA Routing, Reactive Math Logic, Persistent Local CRUD Database, Responsive Widgets
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
export default papyr;
`;
    fs.writeFileSync(path.join(publicDir, 'papyr-complete.esm.js'), paperCompleteEsmCode, 'utf8');
    console.log("✨ Compiled papyr-complete.esm.js successfully!");

    // 7b. Build papyr-plugins.js (Decoupled Plugins IIFE Bundle)
    const paperPluginsCode = `/**
 * PAPER STATIC SITE LIBRARY - Decoupled Plugins Bundle
 * v3.0 - Official Capability Modules
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
        'plugins/ui-components.js',
        'plugins/animate.js',
        'plugins/charts.js'
    ];
    const uiPluginsContent = uiPluginFiles.map(file => {
        const filePath = path.join(srcDir, file);
        return `// --- MODULE: ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
    }).join('\n');

    const paperUiCode = `/**
 * PAPER STATIC SITE LIBRARY - UI & Layout Modular Bundle
 * v3.0 - Core Reactivity, SPA Routing, Layouts, Design Engine, and Premium UI Components
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
 * PAPER STATIC SITE LIBRARY - Advanced Engineering Modular Bundle
 * v3.0 - Core Reactivity, AI/ML Toolkits, 3D Immersive Graphics, 2D Verlet Physics, and PDF Exporter
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
        
        console.log("✨ Minified bundles and source maps generated successfully!");
    } catch (e) {
        console.log("💡 Tip: Run 'npm install' to enable minification and source maps compilation.");
    }

    const hrend = process.hrtime(hrstart);
    const ms = (hrend[0] * 1000 + hrend[1] / 1000000).toFixed(2);
    console.log(`\n🎉 Compilation finished successfully in ${ms}ms!`);

} catch (err) {
    console.error("❌ Build compilation failed!", err);
    process.exit(1);
}
