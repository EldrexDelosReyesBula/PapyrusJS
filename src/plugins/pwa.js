/**
 * PAPYR PWA ENGINE
 * One-line registration and automatic offline caching for Progressive Web Apps.
 * Caches core bundles like papyr-complete.js to browser Cache Storage and IndexedDB
 * to allow smooth offline execution without full library downloads.
 */
(function() {
    papyr.pwa = {
        /**
         * Initialize PWA registers and offline cachers.
         * 
         * @param {Object} options Configuration parameters
         * @param {string} options.swPath Path to the service worker script (default: '/sw.js')
         * @param {string} options.cacheName Cache name for core assets (default: 'papyr-pwa-cache')
         * @param {Array<string>} options.assets Specific resource URLs to cache offline
         */
        async init(options = {}) {
            const cacheName = options.cacheName || 'papyr-pwa-cache';
            const defaultSwPath = options.swPath || '/sw.js';
            
            // Auto-detect and compile files to cache offline
            const assetsToCache = Array.isArray(options.assets) ? [...options.assets] : [];
            
            // Add current origin path
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname || '/';
                if (!assetsToCache.includes(currentPath)) {
                    assetsToCache.push(currentPath);
                }
                if (!assetsToCache.includes(window.location.href)) {
                    assetsToCache.push(window.location.href);
                }
                
                // Automatically discover and cache any loaded Papyr libraries
                if (typeof document !== 'undefined') {
                    const scripts = Array.from(document.querySelectorAll('script'));
                    scripts.forEach(script => {
                        const src = script.src;
                        if (src && (src.includes('papyr') || src.includes('papyr-complete') || src.includes('papyr-plugins'))) {
                            if (!assetsToCache.includes(src)) {
                                assetsToCache.push(src);
                            }
                        }
                    });
                }
            }

            // 1. Cache Storage offline synchronization
            if (typeof window !== 'undefined' && 'caches' in window) {
                try {
                    const cache = await window.caches.open(cacheName);
                    // Filter down to valid HTTP/HTTPS endpoints to prevent local file protocol failures
                    const validUrls = assetsToCache.filter(url => url.startsWith('http') || url.startsWith('/'));
                    await cache.addAll(validUrls);
                    papyr.log('PWA: Successfully pre-cached core assets offline including library bundles.');
                } catch(err) {
                    papyr.warn('PWA Cache storage warning (skipping local file protocols):', err);
                }
            }

            // 2. IndexedDB secondary offline replication
            if (typeof window !== 'undefined' && 'indexedDB' in window) {
                try {
                    const dbRequest = window.indexedDB.open("papyr_pwa_db", 1);
                    dbRequest.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains("assets")) {
                            db.createObjectStore("assets", { keyPath: "url" });
                        }
                    };
                    dbRequest.onsuccess = (e) => {
                        const db = e.target.result;
                        assetsToCache.forEach(async (url) => {
                            if (!url.startsWith('http') && !url.startsWith('/')) return;
                            try {
                                const response = await fetch(url);
                                if (!response.ok) return;
                                const blob = await response.blob();
                                const tx = db.transaction("assets", "readwrite");
                                const store = tx.objectStore("assets");
                                store.put({ url, content: blob, timestamp: Date.now() });
                            } catch(fetchErr) {}
                        });
                    };
                } catch(idbErr) {
                    papyr.warn('PWA IndexedDB storage warning:', idbErr);
                }
            }

            // 3. Service Worker registration
            if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register(defaultSwPath);
                    papyr.log('PWA ServiceWorker Registration successful with scope:', registration.scope);
                } catch (err) {
                    papyr.warn('PWA ServiceWorker registration failed/skipped (requires active web origin):', err);
                }
            } else {
                papyr.warn('PWA ServiceWorkers are not supported in this environment.');
            }
        }
    };
})();

