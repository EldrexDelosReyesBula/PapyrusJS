# @eldrex/papyr-pssr

> **PSSR SDK — Papyrus Server-Side Rendering & Rendering Strategy SDK**
>
> Part of the [Papyrus.js](https://github.com/EldrexDelosReyesBula/PapyrusJS) framework ecosystem.

[![npm version](https://img.shields.io/badge/npm-3.1.3-blue)](https://www.npmjs.com/package/@eldrex/papyr-pssr)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/LICENSE)

---

## What is PSSR?

PSSR (Papyrus Server-Side Rendering) is Papyrus's advanced rendering orchestration layer. It enables Papyrus applications to support multiple rendering modes per route, lazy island hydration, SEO metadata pipelines, and edge/serverless deployment — all with a unified, composable SDK.

This package (`@eldrex/papyr-pssr`) gives developers the tools to **configure and control** the rendering lifecycle without modifying the core Papyrus kernel.

```
Browser / Edge Runtime
    ↓
papyr.pssr.sdk         ← This package
    ↓
papyr.pssr (core)      ← Hydration, island registry, SSR compiler
    ↓
papyr.ssr / papyr.isr  ← Runtime rendering and cache
    ↓
Browser / Node.js APIs
```

---

## Rendering Modes

| Mode | Best For | How |
|------|----------|-----|
| `csr` | Dashboards, internal tools, IDEs | Client-side only |
| `ssr` | SaaS, e-commerce, SEO-critical pages | Server renders HTML, client hydrates |
| `ssg` | Blogs, docs, marketing | HTML generated at build time |
| `isr` | Large catalogues, storefronts | Cached HTML + background regeneration |

---

## Installation

### As part of the full Papyrus bundle (recommended)

```html
<script src="https://papyrus-js.vercel.app/papyr-complete.js"></script>
```

The PSSR SDK is already available as `papyr.pssr.sdk`.

### Standalone

```bash
npm install @eldrex/papyr-pssr
```

```js
const { pssr } = require('@eldrex/papyr-pssr');
// or ESM
import { pssr } from '@eldrex/papyr-pssr';
```

---

## API Reference

### `papyr.pssr.sdk.strategy(options)` — Per-Route Rendering Strategy

Configure different rendering modes per URL pattern:

```js
papyr.pssr.sdk.strategy({
    default: 'ssr',
    routes: {
        '/blog/*':      'ssg',    // Blog posts — build-time HTML
        '/dashboard':   'csr',    // Dashboard — client-only
        '/shop/*':      'isr',    // Shop pages — cached + regenerate
        '/':            'ssr'     // Home — server-rendered
    },
    isrTtl: 300                   // ISR cache TTL in seconds (default 300)
}).apply();
```

Pattern matching supports `*` wildcards and `:param` segments.

### `papyr.pssr.sdk.islands(options)` — Lazy Island Hydration

Hydrate UI islands lazily when they enter the viewport (zero layout shift):

```js
papyr.pssr.sdk.islands({
    lazy: true,                   // Use IntersectionObserver
    threshold: 0.1,               // Hydrate when 10% visible
    islandsOnly: true,            // Only hydrate declared islands
    onHydrate: (id) => {
        console.log('Hydrated island:', id);
    }
});
```

Register an island:

```js
papyr.registerIsland('hero', HeroComponent);
papyr.registerIsland('chart', ChartComponent);
```

Mark HTML for island hydration:

```html
<div data-papyr-island="hero"></div>
<div data-papyr-island="chart"></div>
```

### `papyr.pssr.sdk.meta` — SEO Metadata Pipeline

Composable middleware pipeline for generating head metadata:

```js
papyr.pssr.sdk.meta.pipe([
    (ctx) => ({ title: ctx.page.title }),
    (ctx) => ({ description: ctx.page.excerpt }),
    (ctx) => ({
        og: {
            title: ctx.page.title,
            image: ctx.page.thumbnail,
            type: 'article'
        }
    }),
    (ctx) => ({
        twitter: { card: 'summary_large_image' }
    }),
    (ctx) => ({
        canonical: `https://example.com${ctx.route}`
    })
]);

// Run the pipeline
const head = await papyr.pssr.sdk.meta.run(routeContext);
```

### `papyr.pssr.sdk.edge(options)` — Edge Runtime Configuration

Configure for serverless and edge deployment:

```js
papyr.pssr.sdk.edge({
    runtime: 'cloudflare',        // 'cloudflare' | 'deno' | 'bun' | 'node'
    isrTtl: 600,                  // Cache-Control TTL
    streamingSSR: true,           // Enable streaming HTML
    onRequest: async (req, ctx) => {
        // Pre-request middleware
    }
});
```

Detect the current runtime:

```js
papyr.edge.isEdge();             // true on Cloudflare/Deno/Bun
papyr.edge.isNode();             // true on Node.js
papyr.edge.detectCloudflare();   // true on Cloudflare Workers
papyr.edge.detectDeno();         // true on Deno Deploy
papyr.edge.detectBun();          // true on Bun
```

### `papyr.pssr.sdk.build.prerender(options)` — SSG Prerendering

Generate static HTML at build time with optional concurrency:

```js
await papyr.pssr.sdk.build.prerender({
    routes: ['/about', '/blog/1', '/blog/2', '/shop'],
    concurrency: 4,               // Parallel render workers
    outputDir: './dist',
    onRoute: (route, html) => {
        console.log(`Rendered: ${route} (${html.length} bytes)`);
    }
});
```

---

## ISR Cache Management

```js
// Invalidate a specific route
papyr.isr.invalidate('/shop/product-123');

// Clear all ISR cache
papyr.isr.clear();

// Check cache status
const status = papyr.isr.status('/blog/hello-world');
// { cached: true, age: 145, ttl: 300, stale: false }

// Express.js middleware
app.use(papyr.isr.middleware({ ttl: 300 }));
```

---

## PSSR + WATT Integration

PSSR is WATT-aware. When WATT is in `'strict'` mode, PSSR disables client-side analytics hydration during the island hydration phase. Configure both together:

```js
papyr.config('watt', { mode: 'strict' });
papyr.config('ssr', { mode: 'ssr', streaming: true });

papyr.pssr.sdk.strategy({ default: 'ssr' }).apply();
papyr.pssr.sdk.islands({ lazy: true });
```

---

## SEO Capabilities

```js
// Full OG/Twitter/Schema pipeline
papyr.pssr.sdk.meta.pipe([
    blogMetaMiddleware,
    openGraphMiddleware,
    schemaOrgMiddleware
]);

// Direct SEO API
papyr.seo.og({ title: 'My Page', image: '/og.png' });
papyr.seo.twitter({ card: 'summary_large_image' });
papyr.seo.schema({ '@type': 'Article', name: 'My Page' });
papyr.seo.canonical('https://example.com/my-page');
papyr.seo.sitemap(['/about', '/blog', '/shop']);
papyr.seo.robots({ disallow: ['/admin'] });
```

---

## Related Packages

| Package | Description |
|---------|-------------|
| `@eldrex/papyr` | Core Papyrus framework |
| `@eldrex/papyr-watt` | WATT privacy & consent SDK |

---

## Documentation

- [PSSR SDK Guide](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/pssr-sdk.md)
- [Configuration API](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/docs/configuration.md)
- [Full Documentation](https://papyrus-js.vercel.app/)

---

## License

[MIT](https://github.com/EldrexDelosReyesBula/PapyrusJS/blob/main/LICENSE) © Eldrex Delos Reyes Bula
