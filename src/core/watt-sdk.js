/**
 * PAPYR WATT SDK
 * Developer-facing privacy and consent toolkit. Extends WATT capabilities
 * without modifying the protected WATT enforcement core.
 *
 * papyr.watt.sdk.flow()      — guided permission workflow
 * papyr.watt.sdk.dialog()    — transparency dialogs
 * papyr.watt.sdk.consent()   — tracking consent management
 * papyr.watt.sdk.notice()    — privacy notices (GDPR/CCPA)
 * papyr.watt.sdk.monitor     — API access event monitor (observe-only)
 * papyr.watt.sdk.disclose()  — third-party service disclosure
 *
 * IMPORTANT: WATT SDK extends WATT without touching:
 *   - papyr.security.policies (protected)
 *   - WATT hardware intercepts (protected)
 *   - Permission enforcement mechanisms (protected)
 */

coreInitializers.push((papyr) => {

    // ─── Consent Storage ─────────────────────────────────────────────────────

    function _readConsent(storageKey) {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(storageKey);
                return raw ? JSON.parse(raw) : null;
            }
        } catch (e) {}
        return null;
    }

    function _writeConsent(storageKey, data) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(storageKey, JSON.stringify(data));
            }
        } catch (e) {}
    }

    // ─── Monitor (Observe-Only) ───────────────────────────────────────────────

    const _monitorListeners = [];

    const _monitor = {
        /**
         * Subscribe to WATT intercept events. Read-only — cannot modify enforcement.
         * @param {'intercept'|'policy-change'|'consent'} event
         * @param {Function} handler - ({ api, policy, blocked, url, timestamp }) => void
         */
        on(event, handler) {
            if (typeof handler !== 'function') return;
            _monitorListeners.push({ event, handler });
        },

        off(handler) {
            const idx = _monitorListeners.findIndex(l => l.handler === handler);
            if (idx !== -1) _monitorListeners.splice(idx, 1);
        },

        /** @internal Emit an event to all monitor subscribers */
        _emit(event, data) {
            _monitorListeners
                .filter(l => l.event === event)
                .forEach(l => {
                    try { l.handler({ ...data, timestamp: new Date().toISOString() }); }
                    catch (e) {}
                });

            // Also register detected origins with trust module
            if (event === 'intercept' && data.url && papyr.trust) {
                papyr.trust._detectOrigin(data.url);
            }
        }
    };

    // ─── DOM Helpers ──────────────────────────────────────────────────────────

    function _createOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999998;
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        overlay.setAttribute('data-papyr-watt-overlay', 'true');
        return overlay;
    }

    function _createCard(title, body, actions) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: #fff; color: #111;
            border-radius: 12px; padding: 24px; max-width: 420px;
            width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: papyr-watt-in 0.2s ease;
        `;

        card.innerHTML = `
            <h2 style="margin:0 0 8px;font-size:1.1rem;font-weight:600;">${title}</h2>
            <p style="margin:0 0 20px;font-size:0.875rem;color:#555;line-height:1.5;">${body}</p>
            <div class="papyr-watt-actions" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
        `;

        const actionsContainer = card.querySelector('.papyr-watt-actions');
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = action.label;
            btn.style.cssText = `
                padding: 8px 16px; border-radius: 6px; cursor: pointer;
                font-size: 0.875rem; font-weight: 500; border: none;
                background: ${action.primary ? '#6C63FF' : '#f3f4f6'};
                color: ${action.primary ? '#fff' : '#111'};
                transition: opacity 0.15s;
            `;
            btn.addEventListener('click', () => action.onClick && action.onClick());
            actionsContainer.appendChild(btn);
        });

        return card;
    }

    function _injectStyles() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('papyr-watt-styles')) return;
        const style = document.createElement('style');
        style.id = 'papyr-watt-styles';
        style.textContent = `
            @keyframes papyr-watt-in {
                from { opacity: 0; transform: scale(0.95) translateY(8px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            [data-papyr-watt-banner] {
                position: fixed; bottom: 16px; left: 50%;
                transform: translateX(-50%);
                background: #1e1e2e; color: #fff;
                border-radius: 10px; padding: 14px 20px;
                display: flex; align-items: center; gap: 12px;
                font-family: system-ui, sans-serif; font-size: 0.85rem;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                z-index: 999997; max-width: 560px; width: 90%;
                animation: papyr-watt-in 0.25s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // ─── WATT SDK Object ──────────────────────────────────────────────────────

    const wattSDK = {

        monitor: _monitor,

        /**
         * Guided permission workflow — multi-step UX for requesting hardware APIs.
         *
         * @param {Object} options
         * @param {string} options.name - Workflow name (for logging)
         * @param {string[]} options.apis - Hardware APIs needed (e.g. ['camera', 'microphone'])
         * @param {string[]} [options.steps] - UX steps: 'explain' | 'request' | 'confirm' | 'fallback'
         * @param {Function} [options.onGranted] - Called when all permissions granted
         * @param {Function} [options.onDenied] - Called when any permission denied
         *
         * @example
         * papyr.watt.sdk.flow({
         *   name: 'camera-access',
         *   apis: ['camera'],
         *   onGranted: () => startCamera(),
         *   onDenied: () => showFallback()
         * });
         */
        flow(options = {}) {
            const { name = 'permission-flow', apis = [], onGranted, onDenied } = options;

            if (!papyr.isBrowser || !papyr.isBrowser()) {
                console.warn('[WATT SDK] flow() requires a browser environment.');
                return;
            }

            _injectStyles();

            const apiLabels = {
                camera: 'Camera', microphone: 'Microphone', location: 'Location',
                notifications: 'Notifications', bluetooth: 'Bluetooth', usb: 'USB'
            };
            const apiNames = apis.map(a => apiLabels[a] || a).join(', ');

            // Step: explain
            const overlay = _createOverlay();
            const card = _createCard(
                `Allow ${apiNames}?`,
                `This feature requires access to: ${apiNames}. ` +
                `Your privacy is protected by WATT — access is logged and transparent.`,
                [
                    {
                        label: 'Allow', primary: true,
                        onClick: () => {
                            overlay.remove();
                            _monitor._emit('intercept', { api: apis.join(','), policy: 'allow', blocked: false, flow: name });
                            if (onGranted) onGranted(apis);
                        }
                    },
                    {
                        label: 'Deny', primary: false,
                        onClick: () => {
                            overlay.remove();
                            _monitor._emit('intercept', { api: apis.join(','), policy: 'deny', blocked: true, flow: name });
                            if (onDenied) onDenied(apis);
                        }
                    }
                ]
            );

            overlay.appendChild(card);
            document.body.appendChild(overlay);
            console.log(`[WATT SDK] Permission flow "${name}" started for: ${apiNames}`);
        },

        /**
         * Show a custom transparency dialog.
         *
         * @param {Object} options
         * @param {string} [options.type] - Dialog type identifier
         * @param {string} [options.title] - Dialog heading
         * @param {string} [options.body] - Dialog body text
         * @param {Object[]} [options.actions] - Action buttons [{ label, value, primary }]
         * @param {Function} [options.onAction] - Called with the action value on click
         *
         * @example
         * papyr.watt.sdk.dialog({
         *   title: 'How we use your data',
         *   body: 'Your data is used only to improve your experience.',
         *   actions: [{ label: 'Got it', value: 'ok', primary: true }],
         *   onAction: (v) => console.log(v)
         * });
         */
        dialog(options = {}) {
            const {
                title = 'Privacy Notice',
                body = '',
                actions = [{ label: 'Close', value: 'close', primary: true }],
                onAction = null
            } = options;

            if (!papyr.isBrowser || !papyr.isBrowser()) return;
            _injectStyles();

            const overlay = _createOverlay();
            const card = _createCard(
                title, body,
                actions.map(a => ({
                    label: a.label,
                    primary: !!a.primary,
                    onClick: () => {
                        overlay.remove();
                        if (onAction) onAction(a.value);
                    }
                }))
            );

            overlay.setAttribute('data-papyr-watt-banner', 'dialog');
            overlay.appendChild(card);
            document.body.appendChild(overlay);
        },

        /**
         * Show a consent management banner.
         *
         * @param {Object} options
         * @param {string[]} options.categories - e.g. ['analytics', 'marketing', 'personalization']
         * @param {'none'|'all'} [options.defaultState='none'] - Default consent state
         * @param {string} [options.storageKey='papyr-consent'] - localStorage key for persistence
         * @param {Function} [options.onConsentChange] - Called with granted categories array
         *
         * @example
         * papyr.watt.sdk.consent({
         *   categories: ['analytics', 'marketing'],
         *   onConsentChange: (categories) => initAnalytics(categories)
         * });
         */
        consent(options = {}) {
            const {
                categories = [],
                defaultState = 'none',
                storageKey = 'papyr-consent',
                onConsentChange = null
            } = options;

            // Check existing stored consent
            const stored = _readConsent(storageKey);
            if (stored) {
                if (onConsentChange) onConsentChange(stored.granted || []);
                _monitor._emit('consent', { action: 'restored', categories: stored.granted });
                return;
            }

            if (!papyr.isBrowser || !papyr.isBrowser()) return;
            _injectStyles();

            const banner = document.createElement('div');
            banner.setAttribute('data-papyr-watt-banner', 'consent');
            banner.setAttribute('data-papyr-consent', 'true');
            banner.innerHTML = `
                <span style="flex:1;">
                    We use cookies for ${categories.join(', ')}.
                    <a href="#" style="color:#a5b4fc;margin-left:4px;">Learn more</a>
                </span>
                <button id="papyr-consent-accept" style="
                    background:#6C63FF;color:#fff;border:none;
                    padding:7px 14px;border-radius:6px;cursor:pointer;
                    font-size:0.8rem;font-weight:500;white-space:nowrap;
                ">Accept All</button>
                <button id="papyr-consent-reject" style="
                    background:transparent;color:#aaa;border:1px solid #444;
                    padding:7px 14px;border-radius:6px;cursor:pointer;
                    font-size:0.8rem;font-weight:500;white-space:nowrap;
                ">Reject All</button>
            `;

            document.body.appendChild(banner);

            document.getElementById('papyr-consent-accept').addEventListener('click', () => {
                _writeConsent(storageKey, { granted: categories, timestamp: Date.now() });
                banner.remove();
                _monitor._emit('consent', { action: 'accepted', categories });
                if (onConsentChange) onConsentChange(categories);
            });

            document.getElementById('papyr-consent-reject').addEventListener('click', () => {
                _writeConsent(storageKey, { granted: [], timestamp: Date.now() });
                banner.remove();
                _monitor._emit('consent', { action: 'rejected', categories: [] });
                if (onConsentChange) onConsentChange([]);
            });
        },

        /**
         * Show a privacy notice (GDPR/CCPA banner).
         *
         * @param {Object} options
         * @param {'gdpr'|'ccpa'|'custom'} [options.type='gdpr'] - Notice type
         * @param {string} [options.message] - Notice message
         * @param {string} [options.actionLabel='Accept'] - CTA label
         * @param {string} [options.privacyUrl] - Privacy policy URL
         * @param {Function} [options.onAccept] - Called when user accepts
         */
        notice(options = {}) {
            const {
                type = 'gdpr',
                message = type === 'ccpa'
                    ? 'We do not sell your personal information.'
                    : 'We use cookies to improve your experience.',
                actionLabel = 'Accept',
                privacyUrl = null,
                onAccept = null
            } = options;

            if (!papyr.isBrowser || !papyr.isBrowser()) return;
            _injectStyles();

            const banner = document.createElement('div');
            banner.setAttribute('data-papyr-watt-banner', type);
            banner.innerHTML = `
                <span style="flex:1;">${message}${
                    privacyUrl
                        ? ` <a href="${privacyUrl}" target="_blank" rel="noopener" style="color:#a5b4fc;">Privacy Policy</a>`
                        : ''
                }</span>
                <button id="papyr-notice-accept" style="
                    background:#6C63FF;color:#fff;border:none;
                    padding:7px 14px;border-radius:6px;cursor:pointer;
                    font-size:0.8rem;font-weight:500;
                ">${actionLabel}</button>
            `;

            document.body.appendChild(banner);
            document.getElementById('papyr-notice-accept').addEventListener('click', () => {
                banner.remove();
                if (onAccept) onAccept();
            });
        },

        /**
         * Disclose a third-party service to WATT transparency logs.
         * Also registers with papyr.trust.
         *
         * @param {Object} service
         * @param {string} service.name - Service display name
         * @param {string} [service.domain] - Domain pattern (e.g. 'google-analytics.com')
         * @param {'analytics'|'marketing'|'payment'|'auth'|'cdn'|'other'} [service.type]
         * @param {string[]} [service.dataCollected]
         * @param {string} [service.privacyUrl]
         */
        disclose(service) {
            if (papyr.trust && typeof papyr.trust.disclose === 'function') {
                papyr.trust.disclose(service);
            }
            _monitor._emit('disclosure', { service });
        }
    };

    // ─── Attach to papyr.watt ─────────────────────────────────────────────────

    papyr.watt = papyr.watt || {};
    papyr.watt.sdk = wattSDK;
});
