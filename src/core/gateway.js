/**
 * PAPYR OPEN GATEWAY ARCHITECTURE
 * Core Gateway registration interface supporting unified adapters.
 */

coreInitializers.push((papyr) => {
    const registeredGateways = new Map();
    
    papyr.gateway = {
        register(name, adapter) {
            if (!name || !adapter) return;
            registeredGateways.set(name.toLowerCase(), adapter);
            console.log(`🔌 Papyr Gateway: Registered adapter "${name}" successfully.`);
            if (typeof adapter.initialize === 'function') {
                adapter.initialize(papyr);
            }
        },
        resolve(name) {
            return registeredGateways.get(name.toLowerCase());
        },
        list() {
            return Array.from(registeredGateways.keys());
        }
    };
});
