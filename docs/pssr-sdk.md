# PSSR SDK Developer Guide

> The PSSR SDK extends Papyrus rendering capabilities for complex, multi-mode applications.

`papyr.pssr.sdk` provides advanced tools for building adaptive rendering strategies, lazy island orchestration, SEO metadata pipelines, edge deployment, and SSG prerendering — while remaining compatible with Papyrus SSR standards.

---

## Rendering Strategy Builder

Define per-route rendering modes declaratively. The strategy builder resolves which mode to use for any given path.

```js
const strategy = papyr.pssr.sdk.strategy({
  default: 'ssr',              // Fallback for unmatched routes
  routes: {
    '/blog/*': 'ssg',          // All blog posts → Static
    '/dashboard': 'ssr',       // Dashboard → Server-rendered
    '/chat': 'csr',            // Chat → Client-only
    '/products/:id': 'isr',    // Products → ISR (cached, refreshed)
    '/about': 'ssg',
    '/': 'ssg'
  }
});

// Apply all modes to the PSSR registry
strategy.apply();

// Resolve mode for a specific path
strategy.resolve('/blog/my-post');   // 'ssg'
strategy.resolve('/profile');        // 'ssr' (default)

// List all strategy entries
strategy.list();
// [{ pattern: '/blog/*', mode: 'ssg' }, ...]
```

---

## Lazy Island Orchestration

Hydrate islands only when they become visible — uses `IntersectionObserver`.

```js
// Lazy hydration for all islands on the page
papyr.pssr.sdk.islands({
  selector: '[data-papyr-island]',   // Custom selector
  lazy: true,                         // IntersectionObserver mode
  threshold: 0.1,                     // 10% visible → hydrate
  rootMargin: 50                      // 50px buffer
});

// Eager fallback (no IntersectionObserver support)
papyr.pssr.sdk.islands({ lazy: false });
```

**Island HTML markup (server-rendered):**
```html
<div data-papyr-island="CommentSection"
     data-papyr-island-props='{"postId":"123"}'>
  <!-- Server-rendered static placeholder -->
  <p>Comments loading...</p>
</div>
```

---

## Metadata Pipeline

Build a composable pipeline that generates SEO metadata from page context.

```js
// Define transforms in order
papyr.pssr.sdk.meta.pipe([
  // Transform 1: base meta from route context
  (ctx) => ({
    title: ctx.page?.title || 'My App',
    description: ctx.page?.excerpt || 'Welcome',
  }),

  // Transform 2: add Open Graph from previous meta
  (ctx, prev) => ({
    ...prev,
    og: {
      title: prev.title,
      image: ctx.page?.coverImage || '/og-default.jpg',
      type: 'article'
    }
  }),

  // Transform 3: add canonical URL
  (ctx, prev) => ({
    ...prev,
    canonical: `https://example.com${ctx.route?.path || '/'}`
  })
]);

// Run the pipeline with route context
const meta = papyr.pssr.sdk.meta.run({
  route: { path: '/blog/my-post' },
  page: { title: 'My Post', excerpt: 'A great article', coverImage: '/post.jpg' }
});

// papyr.seo() is automatically called with the result

// Clear all transforms
papyr.pssr.sdk.meta.clear();
```

---

## Streaming Renderer

```js
// In an edge handler or Node.js server:
const stream = papyr.pssr.sdk.stream(App);

// Cloudflare Workers
export default {
  fetch: () => new Response(stream, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
};
```

---

## Edge Deployment

```js
// Configure for Cloudflare Workers with KV-backed ISR cache
papyr.pssr.sdk.edge({
  runtime: 'cloudflare',
  kv: env.PAPYR_ISR_KV,     // Cloudflare KV namespace
  regions: ['auto'],
  isrTtl: 600               // 10-minute TTL for ISR pages
});

// Auto-detect runtime
papyr.pssr.sdk.edge({ runtime: 'auto', isrTtl: 300 });
```

---

## Build-Time SSG Prerender

```js
// In your build script (e.g. build-static.js):
const papyr = require('./public/papyr-pssr.js');

// Define routes to prerender
const routes = [
  { path: '/', componentFn: () => HomePage({}) },
  { path: '/about', componentFn: () => AboutPage({}) },
  { path: '/blog', componentFn: () => BlogListPage({}) }
];

// Generate static manifest
const pages = await papyr.pssr.sdk.build.manifest(routes);

// Prerender concurrently
const results = await papyr.pssr.sdk.build.prerender({
  routes,
  concurrency: 4
});

// Write to disk
const fs = require('fs');
results.forEach(({ path, html }) => {
  const outPath = path === '/' ? 'dist/index.html' : `dist${path}/index.html`;
  fs.mkdirSync(require('path').dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✨ Generated ${outPath}`);
});
```

---

## Full PSSR SDK Example — Blog

```js
// 1. Strategy: blog uses SSG, dashboard uses SSR
const strategy = papyr.pssr.sdk.strategy({
  default: 'ssr',
  routes: {
    '/blog/*': 'ssg',
    '/dashboard': 'ssr',
    '/': 'ssg'
  }
});
strategy.apply();

// 2. SEO pipeline
papyr.pssr.sdk.meta.pipe([
  (ctx) => ({ title: `${ctx.page.title} | My Blog`, description: ctx.page.excerpt }),
  (ctx, prev) => ({ ...prev, og: { image: ctx.page.image, type: 'article' } }),
  (ctx, prev) => ({ ...prev, canonical: `https://blog.example.com${ctx.route.path}` })
]);

// 3. Lazy islands for comments and related posts
document.addEventListener('DOMContentLoaded', () => {
  papyr.pssr.sdk.islands({ lazy: true, threshold: 0.2 });
});

// 4. Edge config
papyr.pssr.sdk.edge({ runtime: 'auto', isrTtl: 300 });

// 5. Run meta pipeline per page
const meta = papyr.pssr.sdk.meta.run({ route: currentRoute, page: currentPage });
```

---

## Bundle

```html
<!-- Standalone PSSR SDK bundle -->
<script src="https://cdn.papyrjs.com/papyr-pssr.js"></script>

<!-- ESM -->
<script type="module">
  import papyr, { pssr, isr, edge } from 'https://cdn.papyrjs.com/papyr-pssr.esm.js';
</script>
```

```bash
npm install @eldrex/papyr-pssr
```
