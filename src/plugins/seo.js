/**
 * PAPYR SEO TOOLKIT (papyr-seo)
 * Isomorphic SEO metadata engine for titles, Open Graph, Twitter Cards,
 * Schema.org JSON-LD, canonical URLs, sitemaps, robots.txt, and RSS feeds.
 * Works during SSR (generates HTML strings) and on client (updates document.head).
 * Part of the PSSR (Papyrus Server Side Rendering) architecture.
 */
(function (window) {
    if (!window.papyr) {
        console.warn("Papyr core not detected. SEO Toolkit requires papyr core to run.");
        return;
    }

    const papyr = window.papyr;

    // ─── Helpers ────────────────────────────────────────────────────────────────

    const escapeHtml = (str) => String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // ─── Internal State ──────────────────────────────────────────────────────────

    const _state = {
        /** @type {Array<Object>} */
        meta: []
    };

    function _pushMeta(item) {
        _state.meta.push(item);
    }

    function _applyToDom() {
        if (typeof document === 'undefined') return;

        _state.meta.forEach(item => {
            if (item.type === 'title') {
                document.title = item.content;
                return;
            }

            if (item.type === 'meta-name') {
                let el = document.querySelector(`meta[name="${item.name}"]`);
                if (!el) {
                    el = document.createElement('meta');
                    el.setAttribute('name', item.name);
                    document.head.appendChild(el);
                }
                el.setAttribute('content', item.content);
                return;
            }

            if (item.type === 'meta-property') {
                let el = document.querySelector(`meta[property="${item.property}"]`);
                if (!el) {
                    el = document.createElement('meta');
                    el.setAttribute('property', item.property);
                    document.head.appendChild(el);
                }
                el.setAttribute('content', item.content);
                return;
            }

            if (item.type === 'link') {
                let el = document.querySelector(`link[rel="${item.rel}"]`);
                if (!el) {
                    el = document.createElement('link');
                    el.setAttribute('rel', item.rel);
                    document.head.appendChild(el);
                }
                el.setAttribute('href', item.href);
                return;
            }

            if (item.type === 'jsonld') {
                let el = document.querySelector('script[data-papyr-schema]');
                if (!el) {
                    el = document.createElement('script');
                    el.setAttribute('type', 'application/ld+json');
                    el.setAttribute('data-papyr-schema', 'true');
                    document.head.appendChild(el);
                }
                el.textContent = item.content;
                return;
            }
        });
    }

    // ─── SEO Object ─────────────────────────────────────────────────────────────

    const PapyrSEO = {

        /**
         * Set page SEO metadata. Accepts a flat config object with all common fields.
         *
         * @param {Object} options
         * @param {string} [options.title] - Page title
         * @param {string} [options.description] - Meta description
         * @param {string} [options.keywords] - Meta keywords (string or array)
         * @param {string} [options.canonical] - Canonical URL
         * @param {string} [options.robots] - Robots directive (e.g. "index, follow")
         * @param {string} [options.author] - Author meta tag
         * @param {Object} [options.og] - Open Graph options (passed to papyr.seo.og)
         * @param {Object} [options.twitter] - Twitter Card options (passed to papyr.seo.twitter)
         * @param {Object|Array} [options.schema] - Schema.org JSON-LD data
         * @returns {PapyrSEO} Chainable
         *
         * @example
         * papyr.seo({
         *   title: "My Blog",
         *   description: "The latest tech news",
         *   canonical: "https://example.com/blog",
         *   og: { image: "https://example.com/og.jpg" },
         *   twitter: { card: "summary_large_image" }
         * });
         */
        set(options = {}) {
            // Reset state for new page
            _state.meta = [];

            if (options.title) {
                _pushMeta({ type: 'title', content: options.title });
            }

            if (options.description) {
                _pushMeta({ type: 'meta-name', name: 'description', content: options.description });
            }

            if (options.keywords) {
                const kw = Array.isArray(options.keywords)
                    ? options.keywords.join(', ')
                    : options.keywords;
                _pushMeta({ type: 'meta-name', name: 'keywords', content: kw });
            }

            if (options.author) {
                _pushMeta({ type: 'meta-name', name: 'author', content: options.author });
            }

            if (options.robots) {
                _pushMeta({ type: 'meta-name', name: 'robots', content: options.robots });
            }

            if (options.canonical) {
                _pushMeta({ type: 'link', rel: 'canonical', href: options.canonical });
            }

            if (options.og) {
                this.og(options.og);
            }

            if (options.twitter) {
                this.twitter(options.twitter);
            }

            if (options.schema) {
                this.schema(options.schema);
            }

            if (papyr.isBrowser && papyr.isBrowser()) {
                _applyToDom();
            }

            return this;
        },

        /**
         * Set canonical URL.
         * @param {string} url
         * @returns {PapyrSEO} Chainable
         */
        canonical(url) {
            _pushMeta({ type: 'link', rel: 'canonical', href: url });
            if (papyr.isBrowser && papyr.isBrowser()) {
                _applyToDom();
            }
            return this;
        },

        /**
         * Set Open Graph metadata.
         * @param {Object} options
         * @param {string} [options.title] - og:title
         * @param {string} [options.description] - og:description
         * @param {string} [options.image] - og:image URL
         * @param {string} [options.image_alt] - og:image:alt
         * @param {string} [options.image_width] - og:image:width
         * @param {string} [options.image_height] - og:image:height
         * @param {string} [options.url] - og:url
         * @param {string} [options.type] - og:type (default: 'website')
         * @param {string} [options.site_name] - og:site_name
         * @param {string} [options.locale] - og:locale
         * @returns {PapyrSEO} Chainable
         */
        og(options = {}) {
            const ogMap = {
                title: 'og:title',
                description: 'og:description',
                image: 'og:image',
                image_alt: 'og:image:alt',
                image_width: 'og:image:width',
                image_height: 'og:image:height',
                url: 'og:url',
                type: 'og:type',
                site_name: 'og:site_name',
                locale: 'og:locale',
                video: 'og:video',
                audio: 'og:audio'
            };

            // Default type
            if (!options.type) options.type = 'website';

            Object.entries(options).forEach(([key, value]) => {
                if (value != null && ogMap[key]) {
                    _pushMeta({ type: 'meta-property', property: ogMap[key], content: String(value) });
                }
            });

            if (papyr.isBrowser && papyr.isBrowser()) {
                _applyToDom();
            }
            return this;
        },

        /**
         * Set Twitter Card metadata.
         * @param {Object} options
         * @param {string} [options.card] - Card type: 'summary' | 'summary_large_image' | 'app' | 'player'
         * @param {string} [options.title] - twitter:title
         * @param {string} [options.description] - twitter:description
         * @param {string} [options.image] - twitter:image URL
         * @param {string} [options.image_alt] - twitter:image:alt
         * @param {string} [options.site] - @username of website (e.g. "@papyrjs")
         * @param {string} [options.creator] - @username of content creator
         * @returns {PapyrSEO} Chainable
         */
        twitter(options = {}) {
            const twitterMap = {
                card: 'twitter:card',
                title: 'twitter:title',
                description: 'twitter:description',
                image: 'twitter:image',
                image_alt: 'twitter:image:alt',
                site: 'twitter:site',
                creator: 'twitter:creator',
                app_id_iphone: 'twitter:app:id:iphone',
                app_id_googleplay: 'twitter:app:id:googleplay'
            };

            if (!options.card) options.card = 'summary';

            Object.entries(options).forEach(([key, value]) => {
                if (value != null && twitterMap[key]) {
                    _pushMeta({ type: 'meta-name', name: twitterMap[key], content: String(value) });
                }
            });

            if (papyr.isBrowser && papyr.isBrowser()) {
                _applyToDom();
            }
            return this;
        },

        /**
         * Inject Schema.org JSON-LD structured data.
         * @param {Object|Array|string} data - Schema.org JSON-LD object, array, or pre-stringified JSON
         * @returns {PapyrSEO} Chainable
         *
         * @example
         * papyr.seo.schema({
         *   "@context": "https://schema.org",
         *   "@type": "BlogPosting",
         *   "headline": "My Article",
         *   "author": { "@type": "Person", "name": "Eldrex Bula" }
         * });
         */
        schema(data) {
            const json = typeof data === 'string'
                ? data
                : JSON.stringify(data, null, 2);
            _pushMeta({ type: 'jsonld', content: json });

            if (papyr.isBrowser && papyr.isBrowser() && typeof document !== 'undefined') {
                let el = document.querySelector('script[data-papyr-schema]');
                if (!el) {
                    el = document.createElement('script');
                    el.setAttribute('type', 'application/ld+json');
                    el.setAttribute('data-papyr-schema', 'true');
                    document.head.appendChild(el);
                }
                el.textContent = json;
            }
            return this;
        },

        /**
         * Render all accumulated metadata as an HTML string (for SSR head injection).
         * @returns {string} HTML string of all head tags
         */
        renderHead() {
            return _state.meta.map(item => {
                if (item.type === 'title') {
                    return `<title>${escapeHtml(item.content)}</title>`;
                }
                if (item.type === 'meta-name') {
                    return `<meta name="${escapeHtml(item.name)}" content="${escapeHtml(item.content)}">`;
                }
                if (item.type === 'meta-property') {
                    return `<meta property="${escapeHtml(item.property)}" content="${escapeHtml(item.content)}">`;
                }
                if (item.type === 'link') {
                    return `<link rel="${escapeHtml(item.rel)}" href="${escapeHtml(item.href)}">`;
                }
                if (item.type === 'jsonld') {
                    return `<script type="application/ld+json">${item.content}</script>`;
                }
                return '';
            }).join('\n  ');
        },

        /** Internal: used by papyr.edge streaming to flush head immediately */
        _flushHead() {
            return this.renderHead();
        },

        // ─── Static Site Tools ─────────────────────────────────────────────────

        /**
         * Generate a Sitemap XML string.
         * @param {Array<string|Object>} routes - Route paths or route objects
         * @param {Object} [options]
         * @param {string} [options.baseUrl='https://example.com'] - Base URL prefix
         * @param {string} [options.defaultChangefreq='weekly'] - Default changefreq
         * @param {string} [options.defaultPriority='0.8'] - Default priority
         * @returns {string} Sitemap XML string
         *
         * @example
         * const xml = papyr.seo.sitemap([
         *   { path: '/', priority: '1.0', changefreq: 'daily' },
         *   { path: '/about', priority: '0.7' },
         *   '/contact'
         * ], { baseUrl: 'https://example.com' });
         */
        sitemap(routes = [], options = {}) {
            const {
                baseUrl = 'https://example.com',
                defaultChangefreq = 'weekly',
                defaultPriority = '0.8'
            } = options;

            const urlEntries = routes.map(route => {
                const r = typeof route === 'string' ? { path: route } : route;
                const loc = escapeHtml((baseUrl + r.path).replace(/\/+$/, '') || baseUrl);
                const changefreq = r.changefreq || defaultChangefreq;
                const priority = r.priority || defaultPriority;
                const lastmod = r.lastmod ? `\n    <lastmod>${r.lastmod}</lastmod>` : '';

                return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${lastmod}
  </url>`;
            }).join('\n');

            return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
        },

        /**
         * Generate a robots.txt string.
         * @param {Object} rules
         * @param {string|string[]} [rules.userAgent='*'] - User-agent(s)
         * @param {string|string[]} [rules.allow=['/']] - Allow directives
         * @param {string|string[]} [rules.disallow=[]] - Disallow directives
         * @param {string} [rules.sitemap] - Sitemap URL
         * @param {number} [rules.crawlDelay] - Crawl-delay in seconds
         * @returns {string} robots.txt content
         *
         * @example
         * const txt = papyr.seo.robots({
         *   allow: ['/'],
         *   disallow: ['/admin', '/private'],
         *   sitemap: 'https://example.com/sitemap.xml'
         * });
         */
        robots(rules = {}) {
            const {
                userAgent = '*',
                allow = ['/'],
                disallow = [],
                sitemap = null,
                crawlDelay = null
            } = rules;

            const agents = Array.isArray(userAgent) ? userAgent : [userAgent];
            const allows = Array.isArray(allow) ? allow : (allow ? [allow] : []);
            const disallows = Array.isArray(disallow) ? disallow : (disallow ? [disallow] : []);

            let txt = '';
            agents.forEach(agent => {
                txt += `User-agent: ${agent}\n`;
                allows.forEach(path => { if (path) txt += `Allow: ${path}\n`; });
                disallows.forEach(path => { if (path) txt += `Disallow: ${path}\n`; });
                if (crawlDelay != null) txt += `Crawl-delay: ${crawlDelay}\n`;
                txt += '\n';
            });

            if (sitemap) txt += `Sitemap: ${sitemap}\n`;
            return txt;
        },

        /**
         * Generate an RSS 2.0 feed XML string.
         * @param {Object} channelOptions - Feed channel metadata
         * @param {string} channelOptions.title - Feed title
         * @param {string} channelOptions.link - Feed URL
         * @param {string} [channelOptions.description] - Feed description
         * @param {string} [channelOptions.language='en-us'] - Language
         * @param {string} [channelOptions.copyright] - Copyright notice
         * @param {Array<Object>} [items=[]] - Feed items
         * @param {string} items[].title - Item title
         * @param {string} items[].link - Item URL
         * @param {string} [items[].description] - Item description/excerpt
         * @param {string} [items[].pubDate] - Publication date (RFC 822)
         * @param {string} [items[].guid] - Unique identifier
         * @param {string} [items[].author] - Author email or name
         * @returns {string} RSS XML string
         *
         * @example
         * const feed = papyr.seo.rss({
         *   title: 'My Blog',
         *   link: 'https://example.com',
         *   description: 'Latest posts'
         * }, posts.map(p => ({
         *   title: p.title,
         *   link: `https://example.com/blog/${p.slug}`,
         *   description: p.excerpt,
         *   pubDate: new Date(p.date).toUTCString()
         * })));
         */
        rss(channelOptions = {}, items = []) {
            const {
                title = 'Feed',
                description = '',
                link = 'https://example.com',
                language = 'en-us',
                copyright = `Copyright ${new Date().getFullYear()}`
            } = channelOptions;

            const itemsXml = items.map(item => {
                return `    <item>
      <title>${escapeHtml(item.title || '')}</title>
      <link>${escapeHtml(item.link || '')}</link>
      <description>${escapeHtml(item.description || '')}</description>
      <pubDate>${item.pubDate || new Date().toUTCString()}</pubDate>${
    item.guid ? `\n      <guid isPermaLink="false">${escapeHtml(item.guid)}</guid>` : ''
}${
    item.author ? `\n      <author>${escapeHtml(item.author)}</author>` : ''
}
    </item>`;
            }).join('\n');

            return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(title)}</title>
    <link>${escapeHtml(link)}</link>
    <description>${escapeHtml(description)}</description>
    <language>${language}</language>
    <copyright>${escapeHtml(copyright)}</copyright>
    <atom:link href="${escapeHtml(link)}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
        }
    };

    // ─── Bind and Export ─────────────────────────────────────────────────────────

    /**
     * Main SEO entry point: papyr.seo(options)
     * Also exposes sub-methods for granular control.
     */
    const seoFn = (options) => PapyrSEO.set(options);
    seoFn.set = PapyrSEO.set.bind(PapyrSEO);
    seoFn.canonical = PapyrSEO.canonical.bind(PapyrSEO);
    seoFn.og = PapyrSEO.og.bind(PapyrSEO);
    seoFn.twitter = PapyrSEO.twitter.bind(PapyrSEO);
    seoFn.schema = PapyrSEO.schema.bind(PapyrSEO);
    seoFn.sitemap = PapyrSEO.sitemap.bind(PapyrSEO);
    seoFn.robots = PapyrSEO.robots.bind(PapyrSEO);
    seoFn.rss = PapyrSEO.rss.bind(PapyrSEO);
    seoFn.renderHead = PapyrSEO.renderHead.bind(PapyrSEO);
    seoFn._flushHead = PapyrSEO._flushHead.bind(PapyrSEO);

    papyr.seo = seoFn;

})(typeof window !== 'undefined' ? window : this);
