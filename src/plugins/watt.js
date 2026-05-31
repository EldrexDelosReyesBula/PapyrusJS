/**
 * PAPYR WATT SYSTEM (Web App Tracking Transparency)
 * 
 * Hard runtime gatekeeper that intercepts browser tracking and hardware APIs at the kernel level.
 * Pops up a custom, accessible glassmorphic consent dashboard before native browser triggers execute.
 */

(function() {
    // Check if papyr exists
    if (typeof papyr === 'undefined') {
        console.warn("Papyr core not detected. WATT requires papyr core to run.");
        return;
    }

    const PapyrWatt = {
        _originalApis: {
            geolocation: typeof navigator !== 'undefined' && navigator.geolocation ? navigator.geolocation.getCurrentPosition : null,
            getUserMedia: typeof navigator !== 'undefined' && navigator.mediaDevices ? navigator.mediaDevices.getUserMedia : null
        },
        
        // Global developer custom configuration state
        config: {
            branding: { title: "Privacy Guard", primaryColor: "#6366f1" },
            reason: "This app requires secure access to fulfill its baseline function.",
            labels: { accept: "Allow Access", deny: "Ask App Not to Track", linkText: "Learn more about our privacy commitment" },
            link: "https://landecs.online/privacy"
        },

        configure(customSettings) {
            if (customSettings && typeof customSettings === 'object') {
                if (customSettings.branding) {
                    this.config.branding = { ...this.config.branding, ...customSettings.branding };
                }
                if (customSettings.labels) {
                    this.config.labels = { ...this.config.labels, ...customSettings.labels };
                }
                if (customSettings.reason) this.config.reason = customSettings.reason;
                if (customSettings.link) this.config.link = customSettings.link;
            }
        },

        setTier(tier) {
            if (papyr.security && typeof papyr.security.setTier === 'function') {
                papyr.security.setTier(tier);
            }
        },

        getTier() {
            return papyr.security ? papyr.security.currentTier : 'default';
        },

        hasConsent() {
            return papyr.security ? papyr.security.hasConsent : false;
        },

        // Injects the global interception wrappers from day one
        enforce() {
            if (typeof navigator === 'undefined') return;

            // 1. Geolocation Interception
            if (navigator.geolocation && this._originalApis.geolocation) {
                const self = this;
                navigator.geolocation.getCurrentPosition = function(successCb, errorCb, options) {
                    self.triggerWattPrompt("Location Data", () => {
                        self._originalApis.geolocation.call(navigator.geolocation, successCb, errorCb, options);
                    }, () => {
                        if (errorCb) errorCb({ code: 1, message: "User denied Geolocation through WATT." });
                    });
                };
            }

            // 2. Camera & Microphone getUserMedia Interception
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && this._originalApis.getUserMedia) {
                const self = this;
                navigator.mediaDevices.getUserMedia = function(constraints) {
                    return new Promise((resolve, reject) => {
                        self.triggerWattPrompt("Camera & Microphone Access", () => {
                            self._originalApis.getUserMedia.call(navigator.mediaDevices, constraints)
                                .then(resolve)
                                .catch(reject);
                        }, () => {
                            reject(new DOMException("Permission denied by user through WATT.", "NotAllowedError"));
                        });
                    });
                };
            }
        },

        triggerWattPrompt(capabilityName, onAllow, onDeny) {
            console.log(`[WATT Alert]: Intercepted unauthorized request for: ${capabilityName}`);
            if (typeof document === 'undefined') {
                onDeny();
                return;
            }
            
            // Construct the modal dynamically utilizing standard Papyr UI tags
            const wattModal = papyr.div('.papyr-card.papyr-watt-box', {
                role: 'dialog',
                'aria-modal': 'true',
                style: `
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    z-index: 99999; max-width: 400px; width: 90%;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid ${this.config.branding.primaryColor}33;
                    border-radius: 24px;
                    padding: 28px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                    box-sizing: border-box;
                    color: #fff;
                    font-family: inherit;
                `
            },
                papyr.title(`🔒 ${this.config.branding.title}`, { style: "font-size: 20px; margin-bottom: 12px; font-weight: 700; color: #fff;" }),
                papyr.muted(`wants to access your **${capabilityName}**. ${this.config.reason}`, { style: "color: #cbd5e1; font-size: 0.95rem; line-height: 1.5;" }),
                
                papyr.flex.row({ style: "margin-top: 24px; justify-content: flex-end; gap: 12px;" },
                    papyr.button(this.config.labels.deny, {
                        style: "background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); padding: 10px 18px; border-radius: 12px; cursor: pointer; font-family: inherit;",
                        onclick: () => { wattModal.remove(); onDeny(); }
                    }),
                    papyr.button(this.config.labels.accept, {
                        style: `background: ${this.config.branding.primaryColor}; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; cursor: pointer; font-weight: bold; font-family: inherit;`,
                        onclick: () => { wattModal.remove(); onAllow(); }
                    })
                ),
                
                papyr.div({ style: "margin-top: 16px; text-align: center;" },
                    papyr.a(this.config.labels.linkText, { 
                        href: this.config.link, 
                        target: "_blank",
                        style: "font-size: 11px; color: #94a3b8; text-decoration: underline;" 
                    })
                )
            );

            document.body.appendChild(wattModal);
        },

        requestTracking(options = {}) {
            const { purpose = "We use data to personalize your experience and keep this app free.", onAllow = () => {}, onDeny = () => {} } = options;
            
            const currentTier = this.getTier();
            if (currentTier === 'none') {
                if (papyr.security) papyr.security.setConsent(true);
                onAllow();
                return Promise.resolve(true);
            }
            
            if (currentTier === 'high') {
                if (papyr.security) {
                    papyr.security.setConsent(false);
                    papyr.security.blockThirdPartyScripts();
                }
                onDeny();
                return Promise.resolve(false);
            }
            
            return new Promise((resolve) => {
                this.triggerWattPrompt("Personalization Data Usage", () => {
                    if (papyr.security) papyr.security.setConsent(true);
                    onAllow();
                    resolve(true);
                }, () => {
                    if (papyr.security) {
                        papyr.security.setConsent(false);
                        papyr.security.blockThirdPartyScripts();
                    }
                    onDeny();
                    resolve(false);
                });
            });
        }
    };

    // Initialize enforcement immediately on library boot
    PapyrWatt.enforce();

    // Export WATT as a global on papyr
    papyr.watt = PapyrWatt;

    // Process any initial privacy settings set prior to WATT initialization
    if (papyr._initialPrivacy) {
        papyr.watt.setTier(papyr._initialPrivacy);
        delete papyr._initialPrivacy;
    }
})();
