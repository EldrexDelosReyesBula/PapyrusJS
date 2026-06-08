/**
 * PAPYR WATT SYSTEM (Web Access Transparency Toolkit)
 * 
 * Hard runtime gatekeeper that intercepts browser tracking and hardware APIs at the kernel level.
 * Pops up a custom, accessible glassmorphic consent dashboard before native browser triggers execute.
 */

(function () {
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
            link: "https://example.com/privacy"
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
                navigator.geolocation.getCurrentPosition = function (successCb, errorCb, options) {
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
                navigator.mediaDevices.getUserMedia = function (constraints) {
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

            // 3. Plugin Registration Interception
            if (typeof papyr !== 'undefined' && papyr.plugins && typeof papyr.plugins.register === 'function') {
                const self = this;
                const originalRegister = papyr.plugins.register;
                papyr.plugins.register = function (plugin) {
                    if (plugin.permissions && plugin.permissions.length > 0) {
                        self.triggerWattPrompt(`Plugin Requests for [${plugin.name}]`, () => {
                            originalRegister.call(papyr.plugins, plugin);
                        }, () => {
                            console.warn(`[WATT] Plugin registration blocked: ${plugin.name} due to denied permissions.`);
                        }, plugin.permissions);
                    } else {
                        originalRegister.call(papyr.plugins, plugin);
                    }
                };
            }
        },

        triggerWattPrompt(capabilityName, onAllow, onDeny, permissions = null) {
            console.log(`[WATT Alert]: Intercepted unauthorized request for: ${capabilityName}`);
            if (typeof document === 'undefined') {
                onDeny();
                return;
            }

            let bodyContent = [];
            if (permissions && Array.isArray(permissions)) {
                let listItems = permissions.map(p => papyr.li(`✓ ${p.charAt(0).toUpperCase() + p.slice(1)}`, { style: "color: #10b981; margin: 4px 0; text-align: left; list-style: none;" }));
                bodyContent = [
                    papyr.muted(`Requests the following permissions:`, { style: "color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; font-weight: bold; text-align: left;" }),
                    papyr.ul({ style: "margin: 8px 0; padding-left: 0;" }, ...listItems)
                ];
            } else {
                bodyContent = [
                    papyr.muted(`wants to access your **${capabilityName}**. ${this.config.reason}`, { style: "color: #cbd5e1; font-size: 0.95rem; line-height: 1.5;" })
                ];
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
                papyr.h3(`🔒 ${this.config.branding.title}`, { style: "font-size: 20px; margin-bottom: 12px; font-weight: 700; color: #fff;" }),
                ...bodyContent,

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
            const { purpose = "We use data to personalize your experience and keep this app free.", onAllow = () => { }, onDeny = () => { } } = options;

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
        },

        triggerTrackingPrompt(trackingInfo, onAllow, onDeny) {
            if (typeof document === 'undefined') {
                onDeny(false);
                return;
            }

            const isScenario1 = trackingInfo.optOut === true;
            
            const title = `🛡️ Third-Party Tracker Detected`;
            const message = `The application is trying to connect to: **${trackingInfo.name}** (${trackingInfo.url.substring(0, 50)}${trackingInfo.url.length > 50 ? '...' : ''}).`;
            const purposeText = `Purpose: ${trackingInfo.purpose}.`;
            const warningText = isScenario1 
                ? "This provider may track your activity."
                : "This provider may track activity.";

            const optOutBtnText = "Ask App Not to Track";
            const cancelBtnText = "Cancel";
            const continueBtnText = "Continue";

            const wattModal = papyr.div('.papyr-card.papyr-watt-box', {
                role: 'dialog',
                'aria-modal': 'true',
                style: `
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    z-index: 99999; max-width: 420px; width: 90%;
                    background: rgba(15, 23, 42, 0.9);
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
                papyr.h3(title, { style: "font-size: 20px; margin-bottom: 12px; font-weight: 700; color: #fff;" }),
                papyr.p(message, { style: "color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin-bottom: 8px;" }),
                papyr.p(purposeText, { style: "color: #94a3b8; font-size: 0.85rem; margin-bottom: 16px; font-style: italic;" }),
                papyr.p(warningText, { style: "color: #f43f5e; font-weight: bold; font-size: 0.95rem; margin-bottom: 24px;" }),

                papyr.flex.row({ style: "justify-content: flex-end; gap: 12px;" },
                    papyr.button(isScenario1 ? optOutBtnText : cancelBtnText, {
                        style: "background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); padding: 10px 18px; border-radius: 12px; cursor: pointer; font-family: inherit;",
                        onclick: () => { 
                            wattModal.remove(); 
                            onDeny(isScenario1); 
                        }
                    }),
                    papyr.button(continueBtnText, {
                        style: `background: ${this.config.branding.primaryColor}; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; cursor: pointer; font-weight: bold; font-family: inherit;`,
                        onclick: () => { 
                            wattModal.remove(); 
                            onAllow(); 
                        }
                    })
                )
            );

            document.body.appendChild(wattModal);
        },

        compliance: {
            getGDPRNotice() {
                return "Under the General Data Privacy Regulation (GDPR), users residing in the European Union have the right to access, rectify, port, and erase their personal data. This application acts as a Data Controller. By granting permission, you consent to the processing of specified parameters.";
            },
            getCCPANotice() {
                return "Pursuant to the California Consumer Privacy Act (CCPA), California residents have the right to request disclosure of personal data collected, opt-out of the sale of personal information, and request deletion of personal information.";
            },
            getPDANotice() {
                return "In compliance with the Philippine Data Privacy Act of 2012 (R.A. 10173), this app ensures standard security controls for protecting personal and sensitive information processed through its system.";
            },
            renderCookieConsent(options = {}) {
                if (typeof document === 'undefined') return;
                const {
                    message = "We use cookies to enhance your experience and support compliance with privacy acts.",
                    link = "#",
                    linkText = "Privacy Policy",
                    onAccept = () => {}
                } = options;
                
                if (localStorage.getItem("papyr_cookie_consent") === "true") return;

                const consentBanner = papyr.div('.watt-cookie-consent', {
                    style: `
                        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                        z-index: 99998; max-width: 600px; width: 90%;
                        background: rgba(30, 41, 59, 0.95);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 16px;
                        padding: 16px 24px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        display: flex; justify-content: space-between; align-items: center; gap: 16px;
                        color: #fff; font-family: inherit; font-size: 0.9rem;
                    `
                },
                    papyr.div({ style: "flex-grow: 1;" },
                        papyr.span(message),
                        papyr.a(` ${linkText}`, { href: link, target: "_blank", style: "color: #6366f1; text-decoration: underline; margin-left: 8px;" })
                    ),
                    papyr.button("Accept", {
                        style: "background: #6366f1; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold;",
                        onclick: () => {
                            localStorage.setItem("papyr_cookie_consent", "true");
                            consentBanner.remove();
                            onAccept();
                        }
                    })
                );
                document.body.appendChild(consentBanner);
            }
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
