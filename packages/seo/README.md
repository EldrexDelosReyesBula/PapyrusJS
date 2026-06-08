# @eldrex/papyr-seo

> Isomorphic SEO Toolkit for Papyrus — works during SSR (generates HTML strings) and on the client (updates `document.head`).

Part of the **PSSR (Papyrus Server Side Rendering)** rendering architecture.

---

## Installation

```html
<!-- CDN -->
<script src="https://cdn.papyrjs.com/papyr-seo.js"></script>
```

```bash
# npm (if using bundler)
npm install @eldrex/papyr-seo
```

---

## Quick Start

```js
// Set page metadata — works both server-side and client-side
papyr.seo({
  title: "My Blog Post",
  description: "A deep dive into Papyrus rendering architecture.",
  canonical: "https://example.com/blog/my-post",
  keywords: ["papyrus", "seo", "ssr", "pssr"],
  og: {
    title: "My Blog Post",
    description: "A deep dive into Papyrus rendering architecture.",
    image: "https://example.com/images/og-cover.jpg",
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    site: "@papyrjs",
    creator: "@eldrex"
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "My Blog Post",
    "author": { "@type": "Person", "name": "Eldrex Bula" }
  }
});
```

---

## API Reference

### `papyr.seo(options)` — Main entry point

| Option | Type | Description |
|--------|------|-------------|
| `title` | `string` | Page `<title>` |
| `description` | `string` | Meta description |
| `keywords` | `string \| string[]` | Meta keywords |
| `canonical` | `string` | Canonical URL |
| `robots` | `string` | Robots directive (e.g. `"index, follow"`) |
| `author` | `string` | Author meta tag |
| `og` | `Object` | Open Graph options |
| `twitter` | `Object` | Twitter Card options |
| `schema` | `Object \| Array` | Schema.org JSON-LD |

---

### `papyr.seo.og(options)` — Open Graph

```js
papyr.seo.og({
  title: "My Page",
  description: "Page description",
  image: "https://example.com/og.jpg",
  image_alt: "Cover image",
  image_width: "1200",
  image_height: "630",
  url: "https://example.com/page",
  type: "website",         // 'website' | 'article' | 'product'
  site_name: "My Site",
  locale: "en_US"
});
```

---

### `papyr.seo.twitter(options)` — Twitter Cards

```js
papyr.seo.twitter({
  card: "summary_large_image",   // 'summary' | 'summary_large_image' | 'app' | 'player'
  title: "My Page",
  description: "Page description",
  image: "https://example.com/twitter.jpg",
  site: "@mysite",
  creator: "@author"
});
```

---

### `papyr.seo.schema(data)` — Schema.org JSON-LD

```js
papyr.seo.schema({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "My Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
});
```

---

### `papyr.seo.canonical(url)` — Canonical URL

```js
papyr.seo.canonical("https://example.com/canonical-page");
```

---

### `papyr.seo.renderHead()` — SSR Head String

Returns all accumulated metadata as an HTML string for injection into `<head>` during SSR.

```js
// In Express SSR handler:
const headHtml = papyr.seo.renderHead();
res.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      ${headHtml}
    </head>
    <body>${bodyHtml}</body>
  </html>
`);
```

---

### `papyr.seo.sitemap(routes, options)` — Sitemap XML

```js
const xml = papyr.seo.sitemap([
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog', priority: '0.9', changefreq: 'weekly' },
  '/contact'
], {
  baseUrl: 'https://example.com',
  defaultChangefreq: 'weekly',
  defaultPriority: '0.8'
});

// In Express: res.type('application/xml').send(xml);
```

---

### `papyr.seo.robots(rules)` — robots.txt

```js
const txt = papyr.seo.robots({
  userAgent: '*',
  allow: ['/'],
  disallow: ['/admin', '/api', '/_private'],
  sitemap: 'https://example.com/sitemap.xml',
  crawlDelay: 2
});

// In Express: res.type('text/plain').send(txt);
```

---

### `papyr.seo.rss(channel, items)` — RSS 2.0 Feed

```js
const feed = papyr.seo.rss(
  {
    title: 'My Blog',
    description: 'Latest articles from My Blog',
    link: 'https://example.com',
    language: 'en-us'
  },
  posts.map(p => ({
    title: p.title,
    link: `https://example.com/blog/${p.slug}`,
    description: p.excerpt,
    pubDate: new Date(p.publishedAt).toUTCString(),
    guid: `https://example.com/blog/${p.slug}`,
    author: `${p.authorEmail} (${p.authorName})`
  }))
);

// In Express: res.type('application/rss+xml').send(feed);
```

---

## SSR Integration

`papyr.seo` integrates automatically with `papyr.edge.stream()` and `papyr.edge.handler()`:

```js
// Cloudflare Workers / Deno Deploy
export default {
  fetch: papyr.edge.handler((ctx) => {
    // Set SEO before rendering
    papyr.seo({
      title: "My App",
      description: "Powered by PSSR"
    });
    return App(ctx);
  })
};
```

The SEO tags are flushed into `<head>` before the body streams — giving crawlers and browsers the fastest possible access to metadata.

---

## License

MIT © Eldrex Bula & Papyr Contributors
