/**
 * PAPYR EDGE RUNTIME
 * Universal Edge Rendering Handler for Cloudflare Workers, Deno Deploy, Bun, and Node.js.
 * Provides fetch-compatible Request/Response handlers and streaming SSR utilities.
 * Part of the PSSR (Papyrus Server Side Rendering) architecture.
 */

coreInitializers.push((papyr) => {

    papyr.edge = {

        /**
         * Detects if the current runtime is an Edge environment.
         * Supports: Cloudflare Workers, Deno Deploy, Bun.
         * @returns {boolean}
         */
        isEdge() {
            return (
                (typeof EdgeRuntime !== 'undefined') ||
                (typeof Deno !== 'undefined') ||
                (typeof Bun !== 'undefined' && typeof Bun.serve === 'function') ||
                (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers')
            );
        },

        /**
         * Detects if the current runtime is Node.js.
         * @returns {boolean}
         */
        isNode() {
            return (
                typeof process !== 'undefined' &&
                process.versions != null &&
                process.versions.node != null
            );
        },

        /**
         * Creates a fetch-compatible edge handler for a Papyrus App component.
         * Compatible with: Cloudflare Workers, Deno Deploy, Bun.serve, Node.js (via adapter).
         *
         * @param {Function} App - A Papyrus component function receiving ({ url, request })
         * @param {Object} options
         * @param {Function} [options.shell] - Wraps the body HTML in a full document shell
         * @param {Object} [options.headers] - Additional HTTP response headers
         * @param {Function} [options.onError] - Custom error handler (err) => Response
         * @returns {Function} Async fetch handler (request) => Response
         *
         * @example
         * // Cloudflare Workers
         * export default {
         *   fetch: papyr.edge.handler(App)
         * };
         *
         * // Deno Deploy
         * Deno.serve(papyr.edge.handler(App));
         */
        handler(App, options = {}) {
            const { headers: customHeaders = {}, onError = null } = options;

            return async (request) => {
                try {
                    const url = new URL(request.url);
                    const ctx = { url, request, method: request.method };

                    const element = typeof App === 'function' ? App(ctx) : App;
                    const bodyHtml = papyr.ssr(element);

                    // Build SEO head string if papyr.seo is available
                    let headHtml = '';
                    if (papyr.seo && typeof papyr.seo._flushHead === 'function') {
                        headHtml = papyr.seo._flushHead();
                    }

                    const fullHtml = options.shell
                        ? options.shell(bodyHtml, headHtml)
                        : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
</head>
<body>
${bodyHtml}
</body>
</html>`;

                    return new Response(fullHtml, {
                        status: 200,
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'X-Powered-By': 'Papyrus PSSR',
                            'Cache-Control': 'public, max-age=0, must-revalidate',
                            ...customHeaders
                        }
                    });
                } catch (err) {
                    console.error('[Papyr Edge Handler Error]', err);
                    if (onError) return onError(err);
                    return new Response(
                        `<!DOCTYPE html><html><head><title>Error</title></head><body>` +
                        `<h1>Internal Server Error</h1><pre>${err.message}</pre></body></html>`,
                        {
                            status: 500,
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        }
                    );
                }
            };
        },

        /**
         * Creates a streaming SSR edge handler using ReadableStream + TextEncoder.
         * Flushes SEO-critical head content immediately, then streams body chunks.
         *
         * @param {Function} App - Papyrus component function
         * @param {Request} request - Incoming Request object
         * @param {Object} options
         * @param {Object} [options.headers] - Additional response headers
         * @param {number} [options.chunkSize=1024] - Streaming chunk size in bytes
         * @returns {Response} Streaming Response
         *
         * @example
         * export default {
         *   fetch: (req) => papyr.edge.stream(App, req)
         * };
         */
        stream(App, request, options = {}) {
            const { headers: customHeaders = {}, chunkSize = 1024 } = options;
            const encoder = new TextEncoder();

            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        // 1. Flush shell open immediately (best TTFB)
                        let headHtml = '';
                        if (papyr.seo && typeof papyr.seo._flushHead === 'function') {
                            headHtml = papyr.seo._flushHead();
                        }

                        const shellOpen = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
</head>
<body>`;
                        controller.enqueue(encoder.encode(shellOpen));

                        // 2. Render component
                        const url = request ? new URL(request.url) : null;
                        const ctx = { url, request };
                        const element = typeof App === 'function' ? App(ctx) : App;
                        const html = papyr.ssr(element);

                        // 3. Stream body in chunks
                        for (let i = 0; i < html.length; i += chunkSize) {
                            controller.enqueue(encoder.encode(html.substring(i, i + chunkSize)));
                        }

                        // 4. Close shell
                        controller.enqueue(encoder.encode('\n</body>\n</html>'));
                        controller.close();
                    } catch (err) {
                        console.error('[Papyr Edge Stream Error]', err);
                        controller.enqueue(encoder.encode(`<p>Render Error: ${err.message}</p>`));
                        controller.close();
                    }
                }
            });

            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Transfer-Encoding': 'chunked',
                    'X-Powered-By': 'Papyrus PSSR Stream',
                    ...customHeaders
                }
            });
        },

        /**
         * Creates a Node.js-compatible HTTP handler (compatible with http.createServer).
         * @param {Function} App - Papyrus component function
         * @param {Object} options
         * @returns {Function} Node.js (req, res) => void handler
         *
         * @example
         * const http = require('http');
         * http.createServer(papyr.edge.nodeHandler(App)).listen(3000);
         */
        nodeHandler(App, options = {}) {
            const { headers: customHeaders = {} } = options;

            return async (req, res) => {
                try {
                    const baseUrl = `http://${req.headers.host || 'localhost'}`;
                    const url = new URL(req.url || '/', baseUrl);
                    const ctx = { url, request: req };

                    const element = typeof App === 'function' ? App(ctx) : App;
                    const bodyHtml = papyr.ssr(element);

                    let headHtml = '';
                    if (papyr.seo && typeof papyr.seo._flushHead === 'function') {
                        headHtml = papyr.seo._flushHead();
                    }

                    const fullHtml = options.shell
                        ? options.shell(bodyHtml, headHtml)
                        : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
</head>
<body>
${bodyHtml}
</body>
</html>`;

                    res.writeHead(200, {
                        'Content-Type': 'text/html; charset=utf-8',
                        'X-Powered-By': 'Papyrus PSSR',
                        ...customHeaders
                    });
                    res.end(fullHtml);
                } catch (err) {
                    console.error('[Papyr Edge Node Handler Error]', err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end(`<h1>Internal Server Error</h1><pre>${err.message}</pre>`);
                }
            };
        }
    };
});
