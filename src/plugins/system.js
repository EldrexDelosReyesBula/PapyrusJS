/**
 * PAPYR SYSTEM & SANDBOX ACCESS ENGINE
 * Unified, zero-dependency sandboxed interface for File System, Clipboard, notifications, Bluetooth, and WebUSB.
 * v3.0 - Modern showOpenFilePicker wrappers, local download fallbacks, and OS system integrations.
 */
(function (window) {
    if (!window.papyr) {
        console.warn("Papyr core not found. Load papyr.js before loading system plugins.");
        return;
    }

    const papyr = window.papyr;

    // ==========================================
    // 1. FILE SYSTEM SANDBOX ACCESS (papyr.fs)
    // ==========================================
    papyr.fs = {
        /**
         * Open a sandboxed file from the user's system.
         * Leverages high-performance showOpenFilePicker if supported, falling back gracefully to transient inputs.
         */
        open(options = {}) {
            const config = Object.assign({
                multiple: false,
                acceptText: false,
                types: []
            }, options);

            return new Promise((resolve, reject) => {
                // If modern File System Access API is supported
                if (typeof window !== 'undefined' && window.showOpenFilePicker) {
                    window.showOpenFilePicker({
                        multiple: config.multiple,
                        types: config.types
                    }).then(handles => {
                        const filesPromises = handles.map(h => h.getFile());
                        Promise.all(filesPromises).then(files => {
                            if (config.acceptText) {
                                const textPromises = files.map(f => f.text());
                                Promise.all(textPromises).then(texts => {
                                    resolve(config.multiple ? texts : texts[0]);
                                }).catch(reject);
                            } else {
                                resolve(config.multiple ? files : files[0]);
                            }
                        }).catch(reject);
                    }).catch(reject);
                } else {
                    // Fallback to transient input element
                    if (typeof document === 'undefined') {
                        return reject(new Error("DOM document required for file dialog fallback."));
                    }
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = config.multiple;

                    input.onchange = () => {
                        if (!input.files || input.files.length === 0) {
                            return reject(new Error("No files selected."));
                        }
                        const files = Array.from(input.files);
                        if (config.acceptText) {
                            const readerPromises = files.map(file => {
                                return new Promise((res, rej) => {
                                    const reader = new FileReader();
                                    reader.onload = () => res(reader.result);
                                    reader.onerror = () => rej(reader.error);
                                    reader.readAsText(file);
                                });
                            });
                            Promise.all(readerPromises).then(texts => {
                                resolve(config.multiple ? texts : texts[0]);
                            }).catch(reject);
                        } else {
                            resolve(config.multiple ? files : files[0]);
                        }
                    };
                    input.click();
                }
            });
        },

        /**
         * Saves string or blob contents by triggering a secure local browser download.
         */
        save(content, filename = 'document.txt', type = 'text/plain') {
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                console.log(`[papyr.fs.save] Non-browser context saving: ${filename} (${type})`);
                return Promise.resolve(content);
            }

            try {
                const blob = content instanceof Blob ? content : new Blob([content], { type: type });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);

                return Promise.resolve(filename);
            } catch (e) {
                return Promise.reject(e);
            }
        }
    };

    // ==========================================
    // 2. SYSTEM OS INTERACTIONS (papyr.system)
    // ==========================================
    papyr.system = {
        /**
         * Dynamic openFile picker mapping directly to papyr.fs.open.
         */
        openFile(options = {}) {
            return papyr.fs.open(options);
        },

        /**
         * Issues native OS system notifications with permissions checks.
         */
        notify(titleOrMsg, options = {}) {
            let title = titleOrMsg;
            let config = options;
            
            // Single-argument shorthand support: papyr.system.notify("My text notification")
            if (typeof titleOrMsg === 'string' && Object.keys(options).length === 0) {
                title = "Notification";
                config = { body: titleOrMsg };
            }

            if (typeof window === 'undefined' || !('Notification' in window)) {
                console.log(`[papyr.system.notify] ${title}: ${config.body || ''}`);
                return Promise.resolve(false);
            }

            const finalConfig = Object.assign({
                body: '',
                icon: ''
            }, config);

            return new Promise((resolve) => {
                if (Notification.permission === 'granted') {
                    new Notification(title, finalConfig);
                    resolve(true);
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification(title, finalConfig);
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                } else {
                    resolve(false);
                }
            });
        },

        // Unified System Clipboard Wrapper
        clipboard: {
            copy(text) {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    return navigator.clipboard.writeText(text);
                }
                return Promise.reject(new Error("Navigator Clipboard API not supported."));
            },
            paste() {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    return navigator.clipboard.readText();
                }
                return Promise.reject(new Error("Navigator Clipboard API not supported."));
            }
        },

        // Unified Sandbox Hardware Connectors
        devices: {
            bluetooth() {
                if (typeof navigator !== 'undefined' && navigator.bluetooth) {
                    return navigator.bluetooth.getAvailability();
                }
                return Promise.resolve(false);
            },
            usb() {
                if (typeof navigator !== 'undefined' && navigator.usb) {
                    return navigator.usb.getDevices();
                }
                return Promise.resolve([]);
            }
        }
    };

})(typeof window !== 'undefined' ? window : this);
