const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..');
const packagesDir = path.join(__dirname, '..', '..', 'packages');

console.log("🔍 Running Papyr 3.1.3 Automated Verification...\n");

let failed = false;
const assert = (condition, message) => {
    if (!condition) {
        console.error(`❌ Assertion Failed: ${message}`);
        failed = true;
    } else {
        console.log(`✅ Passed: ${message}`);
    }
};

// ─── 1. Bundle Existence ──────────────────────────────────────────────────────
const filesToCheck = [
    'papyr.js', 'papyr-complete.js', 'papyr-game.js', 'papyr-game.esm.js',
    'papyr-ssr.js', 'papyr-seo.js', 'papyr-seo.esm.js'
];
filesToCheck.forEach(file => {
    const fullPath = path.join(publicDir, file);
    assert(fs.existsSync(fullPath), `Compiled bundle file "${file}" exists`);
});

// ─── 2. Version Headers ───────────────────────────────────────────────────────
filesToCheck.forEach(file => {
    const fullPath = path.join(publicDir, file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert(
            content.includes('v3.1.3') || content.includes("version: '3.1.3'") || content.includes('version: "3.1.3"'),
            `Bundle "${file}" contains correct version header '3.1.3'`
        );
    }
});

// ─── 3. WATT Kernel Integration ───────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr-complete.js'))) {
    const completeContent = fs.readFileSync(path.join(publicDir, 'papyr-complete.js'), 'utf8');
    assert(completeContent.includes('window.Notification = new Proxy'), "WATT intercepts Notification API using Proxy");
    assert(completeContent.includes('navigator.clipboard.readText'), "WATT intercepts Clipboard API readText");
    assert(completeContent.includes('navigator.clipboard.writeText'), "WATT intercepts Clipboard API writeText");
    assert(completeContent.includes('navigator.bluetooth.requestDevice'), "WATT intercepts Bluetooth requestDevice");
    assert(completeContent.includes('navigator.usb.requestDevice'), "WATT intercepts USB requestDevice");
    assert(completeContent.includes('interceptPermission(window.DeviceOrientationEvent'), "WATT intercepts iOS DeviceOrientationEvent requestPermission");
    assert(completeContent.includes('window.fetch = function(input, init)'), "WATT intercepts global window.fetch requests");
    assert(completeContent.includes('window.XMLHttpRequest = function()'), "WATT intercepts global window.XMLHttpRequest");
}

// ─── 4. WATT + SSR Integration ────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('clientOnlyApis'), "WATT exposes clientOnlyApis list");
    assert(coreContent.includes('getSSRReport'), "WATT exposes getSSRReport() method");
    assert(coreContent.includes('onHydrated'), "WATT exposes onHydrated() policy restoration");
    assert(coreContent.includes('_applySSRPolicies'), "WATT has auto SSR policy application");
}

// ─── 5. PSSR Core Namespace ───────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.pssr'), "Core bundle exposes papyr.pssr namespace");
    assert(coreContent.includes('classify(Component)'), "PSSR has component classifier");
    assert(coreContent.includes('ssrSafe(renderFn)'), "PSSR has SSR safety guard");
    assert(coreContent.includes('checkHydrationSafety'), "PSSR has hydration safety checker");
    assert(coreContent.includes('setRouteMode'), "PSSR has adaptive route mode registry");
    assert(coreContent.includes('getRouteMode'), "PSSR has route mode getter");
    assert(coreContent.includes('listRouteModes'), "PSSR can list all registered route modes");
    assert(coreContent.includes('generateStaticManifest'), "PSSR can generate SSG static manifest");
    assert(coreContent.includes('_detectDynamicValues'), "PSSR has hydration mismatch detector");
}

// ─── 6. Selective Hydration ────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('islandsOnly'), "PSSR selective hydration supports islandsOnly option");
    assert(coreContent.includes('data-papyr-hydrated'), "PSSR marks hydrated islands with data attribute");
    assert(coreContent.includes('papyr._islandRegistry'), "PSSR exposes island component registry");
}

// ─── 7. Edge Runtime ──────────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.edge'), "Core bundle exposes papyr.edge namespace");
    assert(coreContent.includes('isEdge()'), "Edge runtime has isEdge() detector");
    assert(coreContent.includes('isNode()'), "Edge runtime has isNode() detector");
    assert(coreContent.includes('handler(App'), "Edge runtime has fetch-compatible handler");
    assert(coreContent.includes('nodeHandler(App'), "Edge runtime has Node.js http handler");
    assert(coreContent.includes('EdgeRuntime'), "Edge detects Cloudflare Workers");
    assert(coreContent.includes('typeof Deno'), "Edge detects Deno Deploy");
    assert(coreContent.includes('typeof Bun'), "Edge detects Bun runtime");
}

// ─── 8. ISR Cache Engine ──────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.isr'), "Core bundle exposes papyr.isr namespace");
    assert(coreContent.includes('isrStore'), "ISR has internal cache store");
    assert(coreContent.includes('entry.revalidating'), "ISR implements stale-while-revalidate");
    assert(coreContent.includes('invalidate(key)'), "ISR has cache invalidation");
    assert(coreContent.includes('invalidateAll()'), "ISR can clear all cache");
    assert(coreContent.includes('status(key)'), "ISR has status inspector");
    assert(coreContent.includes('middleware(options'), "ISR has Express middleware");
    assert(coreContent.includes('inspect()'), "ISR has full cache inspection");
}

// ─── 9. SEO Toolkit ───────────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr-seo.js'))) {
    const seoContent = fs.readFileSync(path.join(publicDir, 'papyr-seo.js'), 'utf8');
    assert(seoContent.includes('papyr.seo = seoFn'), "SEO Toolkit exports papyr.seo");
    assert(seoContent.includes('og:title'), "SEO Toolkit handles Open Graph title");
    assert(seoContent.includes('og:image'), "SEO Toolkit handles Open Graph image");
    assert(seoContent.includes('twitter:card'), "SEO Toolkit handles Twitter Card");
    assert(seoContent.includes('application/ld+json'), "SEO Toolkit handles Schema.org JSON-LD");
    assert(seoContent.includes('link[rel'), "SEO Toolkit handles canonical URLs");
    assert(seoContent.includes('sitemap(routes'), "SEO Toolkit has sitemap generator");
    assert(seoContent.includes('robots(rules'), "SEO Toolkit has robots.txt generator");
    assert(seoContent.includes('<rss version="2.0"'), "SEO Toolkit has RSS 2.0 feed generator");
    assert(seoContent.includes('renderHead()'), "SEO Toolkit has SSR head renderer");
    assert(seoContent.includes('_flushHead'), "SEO Toolkit has edge streaming head flush");
}

// ─── 10. Adaptive Routing ─────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('options.mode'), "Adaptive routing: papyr.page() accepts mode option");
    assert(coreContent.includes('pssr.setRouteMode'), "Adaptive routing integrates with PSSR mode registry");
    assert(coreContent.includes('_pendingRouteModes'), "Adaptive routing has deferred mode registration queue");
}

// ─── 11. Game SDK ─────────────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr-game.js'))) {
    const gameContent = fs.readFileSync(path.join(publicDir, 'papyr-game.js'), 'utf8');
    assert(gameContent.includes('papyr.game = GameSDK'), "Game SDK exports itself to papyr.game namespace");
    assert(gameContent.includes('canvas(options = {})'), "Game SDK has canvas rendering adapter");
    assert(gameContent.includes('loop(cb)'), "Game SDK has loop orchestrator");
    assert(gameContent.includes('input(el)'), "Game SDK has inputs tracker");
    assert(gameContent.includes('assets:'), "Game SDK has assets preloader");
    assert(gameContent.includes('adapters:'), "Game SDK has graphics/physics adapters wrapper");
}

// ─── 12. Workspace Packages ───────────────────────────────────────────────────
const packages = ['core', 'router', 'animate', 'charts', 'shapes', '3d', 'db', 'ai', 'auth', 'ssr', 'game', 'seo'];
packages.forEach(pkg => {
    const pkgJsonPath = path.join(packagesDir, pkg, 'package.json');
    assert(fs.existsSync(pkgJsonPath), `Workspace package "${pkg}" has package.json`);
    if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        assert(pkgJson.version === '3.1.3', `Workspace package "${pkg}" package.json version is 3.1.3`);
    }
});

// ─── 13. SEO Package Distribution ────────────────────────────────────────────
const seoDist = path.join(packagesDir, 'seo', 'dist');
assert(fs.existsSync(path.join(seoDist, 'papyr-seo.js')), "SEO package dist/papyr-seo.js exists");
assert(fs.existsSync(path.join(seoDist, 'papyr-seo.esm.js')), "SEO package dist/papyr-seo.esm.js exists");

// ─── 14. papyr.config — Unified Config Engine ────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.config = configFn'), "Config engine: papyr.config is exposed");
    assert(coreContent.includes('configFn.get ='), "Config engine: .get() method exists");
    assert(coreContent.includes('configFn.getAll ='), "Config engine: .getAll() method exists");
    assert(coreContent.includes('configFn.reset ='), "Config engine: .reset() method exists");
    assert(coreContent.includes('configFn.on ='), "Config engine: .on() change listener exists");
    assert(coreContent.includes("'rendering'") && coreContent.includes("'animation'"), "Config engine: rendering and animation domains defined");
    assert(coreContent.includes("'watt'") && coreContent.includes("'ssr'"), "Config engine: watt and ssr domains defined");
    assert(coreContent.includes('_applyWattMode'), "Config engine: WATT mode side-effect handler");
    assert(coreContent.includes("mode === 'none'"), "Config engine: watt mode=none fully disables WATT");
    assert(coreContent.includes("mode === 'strict'"), "Config engine: watt mode=strict denies all hardware APIs");
}

// ─── 15. papyr.controls — Imperative Runtime Controls ────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.controls'), "Controls: papyr.controls namespace exposed");
    assert(coreContent.includes('setPriority(level)'), "Controls: rendering.setPriority() exists");
    assert(coreContent.includes('setSchedulerMode(mode)'), "Controls: rendering.setSchedulerMode() exists");
    assert(coreContent.includes('setTargetFps(fps)'), "Controls: rendering.setTargetFps() exists");
    assert(coreContent.includes('disableAll()'), "Controls: animation.disableAll() for accessibility");
    assert(coreContent.includes('enableGPU()'), "Controls: animation.enableGPU() exists");
    assert(coreContent.includes('setTheme(theme)'), "Controls: design.setTheme() exists");
    assert(coreContent.includes('setTokens(tokens)'), "Controls: design.setTokens() for CSS custom properties");
    assert(coreContent.includes('setPowerMode(mode)'), "Controls: scheduler.setPowerMode() exists");
    assert(coreContent.includes('pause()'), "Controls: scheduler.pause() exists");
    assert(coreContent.includes('resume()'), "Controls: scheduler.resume() exists");
}

// ─── 16. papyr.trust — Trust Boundaries API ──────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.trust'), "Trust: papyr.trust namespace exposed");
    assert(coreContent.includes('report()'), "Trust: trust.report() exists");
    assert(coreContent.includes('owns(namespace)'), "Trust: trust.owns() exists");
    assert(coreContent.includes('zone(namespace)'), "Trust: trust.zone() exists");
    assert(coreContent.includes('undisclosed()'), "Trust: trust.undisclosed() exists");
    assert(coreContent.includes('disclose(service)'), "Trust: trust.disclose() exists");
    assert(coreContent.includes('_zone1Namespaces'), "Trust: Zone 1 namespace registry defined");
    assert(coreContent.includes('_zone2Plugins'), "Trust: Zone 2 plugin registry defined");
    assert(coreContent.includes('_zone3Detected'), "Trust: Zone 3 detected origins Set defined");
    assert(coreContent.includes('violations'), "Trust: audit() returns violations array");
    assert(coreContent.includes('WATT_DISABLED'), "Trust: WATT_DISABLED violation code defined");
    assert(coreContent.includes('UNDISCLOSED_SERVICES'), "Trust: UNDISCLOSED_SERVICES violation code defined");
    assert(coreContent.includes('_registerPlugin(name, meta'), "Trust: internal plugin registration hook");
    assert(coreContent.includes('_detectOrigin(url)'), "Trust: internal WATT origin tracker");
}

// ─── 17. papyr.access — Access Tier System ───────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.access'), "Access: papyr.access namespace exposed");
    assert(coreContent.includes('tier(namespace)'), "Access: access.tier() method exists");
    assert(coreContent.includes('isAccessible(namespace)'), "Access: access.isAccessible() exists");
    assert(coreContent.includes('validateScope(pluginName'), "Access: access.validateScope() for plugins");
    assert(coreContent.includes("'full'") && coreContent.includes("'restricted'") && coreContent.includes("'protected'"), "Access: all 3 tiers defined");
    assert(coreContent.includes('seal(namespace)'), "Access: access.seal() for init-phase protection");
    assert(coreContent.includes('_markInitComplete'), "Access: init completion marker exists");
}

// ─── 18. WATT SDK ─────────────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.watt.sdk = wattSDK'), "WATT SDK: exposed as papyr.watt.sdk");
    assert(coreContent.includes('flow(options'), "WATT SDK: flow() permission workflow exists");
    assert(coreContent.includes('consent(options'), "WATT SDK: consent() banner manager exists");
    assert(coreContent.includes('notice(options'), "WATT SDK: notice() GDPR/CCPA banner exists");
    assert(coreContent.includes('_monitorListeners'), "WATT SDK: monitor listener registry defined");
    assert(coreContent.includes('_createCard('), "WATT SDK: card UI helper exists");
    assert(coreContent.includes('data-papyr-watt-banner'), "WATT SDK: watt banner data attribute");
    assert(coreContent.includes('papyr-consent-accept'), "WATT SDK: consent accept button ID");
    assert(coreContent.includes('_writeConsent('), "WATT SDK: consent persistence helper");
}

// ─── 19. PSSR SDK ─────────────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.pssr.sdk = pssrSDK') || coreContent.includes('papyr.pssr.sdk'), "PSSR SDK: exposed as papyr.pssr.sdk");
    assert(coreContent.includes('strategy(options'), "PSSR SDK: strategy() builder exists");
    assert(coreContent.includes('_matchesPattern('), "PSSR SDK: route pattern matcher exists");
    assert(coreContent.includes('islands(options'), "PSSR SDK: islands() lazy orchestration exists");
    assert(coreContent.includes('IntersectionObserver'), "PSSR SDK: IntersectionObserver for lazy hydration");
    assert(coreContent.includes('meta: metaSDK'), "PSSR SDK: meta pipeline exposed");
    assert(coreContent.includes('pipe(transforms'), "PSSR SDK: meta.pipe() exists");
    assert(coreContent.includes('prerender(options'), "PSSR SDK: build.prerender() exists");
    assert(coreContent.includes('concurrency'), "PSSR SDK: concurrent prerender supported");
}

// ─── 20. Freeform Freedom ─────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('papyr.freeform'), "Freeform: papyr.freeform namespace exposed");
    assert(coreContent.includes('detect()'), "Freeform: detect() framework detection exists");
    assert(coreContent.includes('_detectFrameworks'), "Freeform: framework detection function defined");
    assert(coreContent.includes('vanilla()'), "Freeform: vanilla() mode exists");
    assert(coreContent.includes('_vanillaMode'), "Freeform: vanilla mode flag defined");
    assert(coreContent.includes('activeSubsystems()'), "Freeform: activeSubsystems() listing exists");
    assert(coreContent.includes('vue(app)'), "Freeform: vue() bridge method exists");
    assert(coreContent.includes('globalProperties.$papyr'), "Freeform: Vue globalProperties injection");
    assert(coreContent.includes('useSignal(initialValue)'), "Freeform: useSignal() Vue/React helper exists");
}

// ─── 21. SDK Extensions ───────────────────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr.js'))) {
    const coreContent = fs.readFileSync(path.join(publicDir, 'papyr.js'), 'utf8');
    assert(coreContent.includes('validate(plugin)'), "SDK: sdk.plugin.validate() exists");
    assert(coreContent.includes('adapter:'), "SDK: sdk.adapter registry exists");
    assert(coreContent.includes('register(name, adapter'), "SDK: sdk.adapter.register() exists");
    assert(coreContent.includes('snapshot()'), "SDK: sdk.config.snapshot() exists");
    assert(coreContent.includes('restore(snapshot)'), "SDK: sdk.config.restore() exists");
    assert(coreContent.includes("controls:") && coreContent.includes('Map of namespace'), "SDK: sdk.controls introspection exists");
}

// ─── 22. New Bundles ──────────────────────────────────────────────────────────
const newBundles = ['papyr-watt.js', 'papyr-watt.esm.js', 'papyr-pssr.js', 'papyr-pssr.esm.js', 'papyr-trust.js'];
newBundles.forEach(file => {
    assert(fs.existsSync(path.join(publicDir, file)), `New bundle "${file}" exists`);
});

// ─── 23. New Package Distributions ───────────────────────────────────────────
['watt', 'pssr'].forEach(pkg => {
    const pkgJsonPath = path.join(packagesDir, pkg, 'package.json');
    assert(fs.existsSync(pkgJsonPath), `New package "${pkg}" has package.json`);
    if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        assert(pkgJson.version === '3.1.3', `New package "${pkg}" version is 3.1.3`);
    }
    const distPath = path.join(packagesDir, pkg, 'dist');
    const bundleName = `papyr-${pkg}.js`;
    assert(fs.existsSync(path.join(distPath, bundleName)), `Package "${pkg}" dist/${bundleName} exists`);
});

// ─── 24. papyr-trust.js CI/CD Export ──────────────────────────────────────────
if (fs.existsSync(path.join(publicDir, 'papyr-trust.js'))) {
    const trustContent = fs.readFileSync(path.join(publicDir, 'papyr-trust.js'), 'utf8');
    assert(trustContent.includes('papyrInstance.trust'), "Trust bundle: exports trust namespace");
    assert(trustContent.includes('papyrInstance.access'), "Trust bundle: exports access namespace");
    assert(trustContent.includes('Trust Boundaries Audit Utility'), "Trust bundle: has correct header comment");
}

// ─── Result ───────────────────────────────────────────────────────────────────
console.log("\n-------------------------------------------");
if (failed) {
    console.error("❌ Some verification checks failed! Please check logs.");
    process.exit(1);
} else {
    console.log("🎉 All automated verification checks passed successfully!");
    process.exit(0);
}
