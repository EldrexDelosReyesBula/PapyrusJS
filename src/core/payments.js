/**
 * PAPYR PAYMENT GATEWAY CORE
 * 
 * Provides an abstract payment gateway registry to decouple cash flows, checkout sessions,
 * and currency transaction handling.
 * 
 * LIABILITY & DISCLAIMER:
 * Papyr.js is a zero-dependency front-end library. It does not store, transmit, or process
 * payment credentials or monetary transactions directly. Developers integrating third-party
 * gateways (e.g. Stripe, PayPal) bear full compliance and liability for data handling,
 * secure transit (PCI-DSS), and financial cash flows.
 */

coreInitializers.push((papyr) => {
    papyr.payments = {
        _gateways: {},

        /**
         * Register a custom third-party payment gateway provider.
         * @param {string} name Gateway provider name (e.g. 'stripe', 'paypal')
         * @param {object} gatewayInstance Gateway implementation object
         */
        register(name, gatewayInstance) {
            if (name === '__proto__' || name === 'constructor' || name === 'prototype') return;
            this._gateways[name] = gatewayInstance;
        },

        /**
         * Resolve a registered gateway provider.
         * @param {string} name Gateway name
         * @returns {object|undefined}
         */
        resolve(name) {
            return this._gateways[name];
        },

        /**
         * Initiates a checkout or subscription process through the registered gateway.
         * @param {string} gatewayName Registered gateway name
         * @param {object} options Checkout options (amount, currency, lineItems, etc.)
         * @returns {Promise<any>}
         */
        async checkout(gatewayName, options) {
            const gw = this.resolve(gatewayName);
            if (!gw) {
                return Promise.reject(new Error(`Payment gateway "${gatewayName}" is not registered.`));
            }
            if (typeof gw.checkout !== 'function') {
                return Promise.reject(new Error(`Payment gateway "${gatewayName}" does not implement checkout().`));
            }
            return gw.checkout(options);
        }
    };
});
