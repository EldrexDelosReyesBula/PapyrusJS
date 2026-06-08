# Papyrus Rendering Architecture (PSSR)

> **Papyrus Server Side Rendering (PSSR)** is Papyrus's enhanced rendering architecture that combines traditional SSR, selective hydration, island rendering, streaming delivery, and SEO optimization to provide fast, crawler-friendly, and highly interactive web experiences.

---

## Rendering Modes

Papyrus supports four rendering modes. Choose the right one per route based on your content's nature.

| Mode | When HTML is Generated | Best For |
|------|----------------------|----------|
| **CSR** (Client Side Rendering) | In the browser after JS loads | Dashboards, IDEs, internal tools |
| **SSR** (Server Side Rendering) | On the server, per request | SaaS platforms, personalized pages |
| **SSG** (Static Site Generation) | At build time | Blogs, docs, marketing sites |
| **ISR** (Incremental Static Regeneration) | At build time, refreshed in background | E-commerce, large content sites |

### Flow Diagram

```
CSR:   Browser → Download JS → Render UI
SSR:   Server → Generate HTML → Send → Hydrate
SSG:   Build Time → Generate HTML → Deploy → Serve
ISR:   Cached HTML → Serve → Background Regenerate when stale
```

---

## Adaptive Rendering

Declare the rendering mode per route using the third argument to `papyr.page()`:

```js
// Blog → SSG (built at deploy time)
papyr.page('/blog', BlogPage, { mode: 'ssg' });

// Dashboard → SSR (server renders per request)
papyr.page('/dashboard', DashboardPage, { mode: 'ssr' });

// Chat → CSR (fully client-side)
papyr.page('/chat', ChatPage, { mode: 'csr' });

// Product pages → ISR (cached, regenerated on TTL)
papyr.page('/products/:id', ProductPage, { mode: 'isr' });
```

Inspect registered modes:

```js
// Get mode for one route
papyr.pssr.getRouteMode('/blog'); // 'ssg'

// List all registered modes
papyr.pssr.listRouteModes();
// [
//   { path: '/blog', mode: 'ssg' },
//   { path: '/dashboard', mode: 'ssr' },
//   ...
// ]
```

---

## Island Architecture

PSSR uses the **Islands Architecture** pattern: the server renders a static HTML shell and only interactive "islands" are hydrated on the client.

### How it works

```
Server renders:
  <div data-papyr-island="ChatWidget">
    <div>Chat Widget (static placeholder)</div>
  </div>

Client hydrates ONLY ChatWidget.
Static areas (Header, Footer, Article) → untouched.
```

### Usage

```js
// Wrap interactive components as islands
const ChatIsland = papyr.island(ChatWidget);

// Register the component for client-side hydration
papyr.registerIsland('ChatWidget', ChatWidget);

// Selective hydration on client — only hydrates islands
papyr.pssr.hydrate('#app', null, { islandsOnly: true });

// After hydration, restore WATT policies
papyr.security.onHydrated();
```

### Why Islands?

- Static content (headers, footers, articles) ships as **zero JS**
- Interactive widgets receive **minimal hydration bundles**
- Massive performance improvements on content-heavy pages

---

## Component Classification

PSSR automatically classifies components by analyzing their source code:

```js
const type = papyr.pssr.classify(MyComponent);
// Returns: 'static' | 'interactive' | 'realtime' | 'heavy'
```

| Classification | Detected Patterns | Strategy |
|----------------|------------------|---------|
| `static` | No events, no state | SSG / skip hydration |
| `interactive` | `addEventListener`, `papyr.state`, forms | SSR + island hydration |
| `realtime` | `WebSocket`, `setInterval`, `EventSource` | CSR only |
| `heavy` | `WebGL`, `WebGPU`, `papyr.game`, `Worker` | CSR, lazy-loaded |

---

## SSR Safety

### SSR Safety Guard

Wrap components to get automatic warnings about browser-only API access during SSR:

```js
const SafePage = papyr.pssr.ssrSafe(MyPage);
const html = papyr.ssr(SafePage());
// Warns if MyPage accesses window, document, localStorage, etc.
```

### Hydration Safety Check

Detect common hydration-mismatch sources before rendering:

```js
const { safe, issues } = papyr.pssr.checkHydrationSafety(MyComponent);
if (!safe) {
  console.warn('Hydration risks:', issues);
  // e.g. ['Date.now()', 'Math.random()']
}
```

### SSR Rules

**Allowed during SSR:**
```js
papyr.state()
papyr.computed()
papyr.component()
// Pure functions with no browser dependencies
```

**Blocked during SSR (WATT auto-denies):**
```js
window           // ❌ undefined on server
document         // ❌ undefined on server
localStorage     // ❌ client-only
camera           // ❌ hardware only
microphone       // ❌ hardware only
geolocation      // ❌ hardware only
notifications    // ❌ browser only
bluetooth        // ❌ hardware only
usb              // ❌ hardware only
sensors          // ❌ hardware only
```

**Guard pattern:**
```js
function MyComponent() {
  // ✅ Safe: runs on both server and client
  const title = "Hello World";

  // ✅ Safe: guarded with isBrowser check
  if (papyr.isBrowser()) {
    document.title = title;
  }

  // ❌ Hydration mismatch risk — avoid:
  // const id = Math.random(); // Different on server and client!

  return papyr.h('h1', title);
}
```

---

## SEO Toolkit

### Basic Usage

```js
papyr.seo({
  title: "My Blog Post",
  description: "A deep dive into Papyrus rendering.",
  canonical: "https://example.com/blog/post",
  keywords: ["papyrus", "ssr", "seo"],
  og: {
    title: "My Blog Post",
    image: "https://example.com/og.jpg",
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    site: "@papyrjs"
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "My Blog Post"
  }
});
```

### SSR Integration

During SSR, call `papyr.seo.renderHead()` to get the head HTML string:

```js
// Express.js SSR handler
app.get('/blog/:slug', async (req, res) => {
  const post = await fetchPost(req.params.slug);

  papyr.seo({
    title: post.title,
    description: post.excerpt,
    canonical: `https://example.com/blog/${post.slug}`
  });

  const body = papyr.ssr(BlogPost({ post }));
  const head = papyr.seo.renderHead();

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      ${head}
    </head>
    <body>
      <div id="app">${body}</div>
      <script src="/papyr-complete.js"></script>
      <script>papyr.pssr.hydrate('#app', null, { islandsOnly: true });</script>
    </body>
    </html>
  `);
});
```

### Sitemap

```js
// Generate sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const xml = papyr.seo.sitemap([
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/blog', priority: '0.9', changefreq: 'weekly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' }
  ], { baseUrl: 'https://example.com' });

  res.type('application/xml').send(xml);
});
```

### Robots.txt

```js
app.get('/robots.txt', (req, res) => {
  const txt = papyr.seo.robots({
    userAgent: '*',
    allow: ['/'],
    disallow: ['/admin', '/api', '/_private'],
    sitemap: 'https://example.com/sitemap.xml'
  });
  res.type('text/plain').send(txt);
});
```

### RSS Feed

```js
app.get('/rss.xml', async (req, res) => {
  const posts = await fetchPosts();
  const feed = papyr.seo.rss(
    { title: 'My Blog', link: 'https://example.com', description: 'Latest posts' },
    posts.map(p => ({
      title: p.title,
      link: `https://example.com/blog/${p.slug}`,
      description: p.excerpt,
      pubDate: new Date(p.date).toUTCString()
    }))
  );
  res.type('application/rss+xml').send(feed);
});
```

---

## Streaming Rendering

### Basic Streaming (PSSR)

```js
// Priority streaming: SEO head flushed first, then body chunks
const stream = papyr.pssr.stream(App);

// In edge handler:
return new Response(stream, {
  headers: { 'Content-Type': 'text/html; charset=utf-8' }
});
```

### Standard Streaming

```js
const stream = papyr.ssr.stream(App);
```

---

## Edge Runtime

Deploy Papyrus applications on edge networks without a traditional server.

### Cloudflare Workers

```js
// worker.js
import papyr from '@eldrex/papyr-seo';

export default {
  async fetch(request) {
    papyr.seo({ title: "My App", description: "Edge-deployed with Papyrus" });
    return papyr.edge.handler(App)(request);
  }
};
```

### Deno Deploy

```js
import papyr from "https://cdn.papyrjs.com/papyr-seo.esm.js";

Deno.serve(papyr.edge.handler(App));
```

### Bun

```js
Bun.serve({
  fetch: papyr.edge.handler(App)
});
```

### Node.js HTTP Server

```js
const http = require('http');
http.createServer(papyr.edge.nodeHandler(App)).listen(3000);
```

### Streaming on Edge

```js
export default {
  fetch: (req) => papyr.edge.stream(App, req)
};
```

---

## ISR (Incremental Static Regeneration)

### Basic Usage

```js
// Cache a route for 5 minutes; regenerate in background when stale
app.get('/blog/:slug', async (req, res) => {
  const { html, hit, stale, age } = await papyr.isr.cache(
    `/blog/${req.params.slug}`,
    async () => {
      const post = await fetchPost(req.params.slug);
      return BlogPost({ post });
    },
    300 // 5-minute TTL
  );

  res.setHeader('X-Cache', hit ? (stale ? 'STALE' : 'HIT') : 'MISS');
  res.setHeader('Age', age);
  res.send(html);
});
```

### Middleware

```js
// Automatically serve cached pages, attach save helper to res
app.use(papyr.isr.middleware({ defaultTtl: 300 }));

app.get('/products', (req, res) => {
  const html = papyr.ssr(ProductListing());
  res.papyrISR.save(html, 600); // Cache this response for 10 minutes
  res.send(html);
});
```

### Cache Management

```js
// Invalidate specific route (e.g. when content changes)
papyr.isr.invalidate('/blog/my-post');

// Clear all cache entries
papyr.isr.invalidateAll();

// Check cache status
const status = papyr.isr.status('/blog/my-post');
// { exists: true, hit: false, stale: true, age: 320, ttl: 300 }

// Inspect all cached routes
console.log(papyr.isr.inspect());
```

---

## WATT + SSR Integration

WATT (Web Access Transparency Toolkit) automatically integrates with PSSR:

### Automatic Server-Side Blocking

When running in a Node.js/server environment, WATT **automatically** sets all hardware API policies to `'deny'`:

```
[WATT + SSR] Server-side mode detected. All hardware APIs set to "deny".
```

This prevents accidental server-side access to:
- Camera, Microphone, Location, Notifications
- Bluetooth, USB, Sensors, Clipboard

### Post-Hydration Restoration

After client hydration, restore hardware API policies back to `'prompt'`:

```js
// After hydration completes:
papyr.pssr.hydrate('#app', null, { islandsOnly: true });
papyr.security.onHydrated(); // Restores camera: 'prompt', mic: 'prompt', etc.
```

### SSR Policy Report

Audit what WATT blocked during SSR:

```js
if (papyr.isServer()) {
  const report = papyr.security.getSSRReport();
  console.log(report);
  // {
  //   ssrMode: true,
  //   blockedApis: [
  //     { api: 'camera', previousPolicy: 'prompt', reason: 'SSR mode...', timestamp: '...' },
  //     ...
  //   ]
  // }
}
```

---

## SSG Static Manifest

Generate all SSG pages at build time:

```js
// In your build script (e.g. build-static.js):
const papyr = require('./public/papyr.js');

// Register routes with SSG mode
papyr.page('/blog', BlogPage, { mode: 'ssg' });
papyr.page('/about', AboutPage, { mode: 'ssg' });
papyr.page('/', HomePage, { mode: 'ssg' });

// Generate static HTML for all SSG routes
const manifest = await papyr.pssr.generateStaticManifest([
  { path: '/', componentFn: HomePage },
  { path: '/blog', componentFn: BlogPage },
  { path: '/about', componentFn: AboutPage }
]);

// Write files to disk
const fs = require('fs');
manifest.forEach(({ path, html }) => {
  const outPath = path === '/' ? '/dist/index.html' : `/dist${path}/index.html`;
  fs.mkdirSync(require('path').dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✨ Generated ${outPath}`);
});
```

---

## Full PSSR Stack Example

```js
// server.js — Express SSR + ISR + SEO + WATT
const express = require('express');
const papyr = require('./public/papyr-seo.js');
const app = express();

// ISR middleware — caches all routes
app.use(papyr.isr.middleware({ defaultTtl: 300 }));

// Blog article — SSR with SEO + ISR caching
app.get('/blog/:slug', async (req, res) => {
  const { html } = await papyr.isr.cache(
    `/blog/${req.params.slug}`,
    async () => {
      const post = await db.posts.findOne({ slug: req.params.slug });

      papyr.seo({
        title: post.title,
        description: post.excerpt,
        canonical: `https://example.com/blog/${post.slug}`,
        og: { image: post.coverImage, type: 'article' },
        twitter: { card: 'summary_large_image' },
        schema: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title
        }
      });

      return BlogPost({ post });
    },
    600 // 10-minute TTL
  );

  const head = papyr.seo.renderHead();
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  ${head}
</head>
<body>
  <div id="app">${html}</div>
  <script src="/papyr-complete.js"></script>
  <script>
    papyr.registerIsland('CommentSection', CommentSection);
    papyr.pssr.hydrate('#app', null, { islandsOnly: true });
    papyr.security.onHydrated();
  </script>
</body>
</html>`);
});

app.get('/sitemap.xml', (req, res) => {
  const xml = papyr.seo.sitemap(
    [{ path: '/' }, { path: '/blog' }, { path: '/about' }],
    { baseUrl: 'https://example.com' }
  );
  res.type('application/xml').send(xml);
});

app.listen(3000, () => console.log('PSSR server running on port 3000'));
```

---

## Bundle Reference

| Bundle | CDN URL | Contains |
|--------|---------|---------|
| `papyr-seo.js` | `https://cdn.papyrjs.com/papyr-seo.js` | Core + SEO Toolkit |
| `papyr-seo.esm.js` | `https://cdn.papyrjs.com/papyr-seo.esm.js` | Same as ESM |
| `papyr-ssr.js` | `https://cdn.papyrjs.com/papyr-ssr.js` | Core + SSR + Express |
| `papyr-complete.js` | `https://cdn.papyrjs.com/papyr-complete.js` | All plugins included |

---

## Related Packages

| Package | Description |
|---------|-------------|
| `@eldrex/papyr-seo` | SEO Toolkit standalone |
| `@eldrex/papyr-ssr` | SSR + Express integration |
| `@eldrex/papyr` | Core runtime |
