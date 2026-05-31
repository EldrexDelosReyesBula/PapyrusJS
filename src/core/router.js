/**
 * PAPYR ROUTER
 * Zero-configuration Hash SPA Router.
 * Updated to run modularly inside the Papyr Kernel context.
 */

coreInitializers.push((papyr) => {
    let routes = [];
    let currentView = papyr.state(null);
    let pathParams = papyr.state({});

    /**
     * Define a hash route.
     * @param {string} path Route path (e.g., "#/about", "#/user/:id")
     * @param {function|class} componentFn Component or Class to render
     */
    papyr.route = (path, componentFn) => {
        // Strip leading hash for internal regex matching
        let cleanPath = path.startsWith('#') ? path.substring(1) : path;
        routes.push({
            path: cleanPath,
            // eslint-disable-next-line security/detect-non-literal-regexp
            regex: new RegExp('^' + cleanPath.replace(/:\w+/g, '([^/]+)') + '$'),
            keys: (cleanPath.match(/:\w+/g) || []).map(k => k.slice(1)),
            componentFn
        });
        
        // Attach to runtime context for context export APIs
        papyr.runtime.routes = routes;
    };

    /**
     * Navigates to a specific path using hash.
     * @param {string} path Target URL hash path
     */
    papyr.navigate = (path) => {
        if (typeof window !== 'undefined') {
            window.location.hash = path.startsWith('#') ? path : '#' + path;
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('hashchange', () => {
            let currentPath = window.location.hash.slice(1) || '/';
            let matchFound = false;

            for (let route of routes) {
                let match = currentPath.match(route.regex);
                if (match) {
                    let params = {};
                    route.keys.forEach((key, index) => {
                        params[key] = match[index + 1];
                    });
                    pathParams.value = params;
                    currentView.value = route.componentFn;
                    matchFound = true;
                    break;
                }
            }
            if (!matchFound) {
                currentView.value = () => papyr.div("404 - Route Not Found");
            }
        });
    }

    /**
     * Global accessor for route parameters
     */
    papyr.useParams = () => pathParams;

    /**
     * Initializes the router and returns the reactive router container.
     */
    papyr.router = () => {
        if (typeof window !== 'undefined' && routes.length > 0 && !currentView.value) {
            window.dispatchEvent(new Event('hashchange')); // Initial load
        }
        
        let routeNode = papyr.if(
            currentView,
            () => {
                let Component = currentView.value;
                if (Component.prototype && Component.prototype instanceof papyr.component) {
                    return new Component().render();
                }
                return Component();
            },
            () => papyr.div()
        );

        // Persistent Workspace Check
        if (typeof document !== 'undefined') {
            // Wait for DOM to paint, then check if layout engine created a shell
            setTimeout(() => {
                let mainShell = document.querySelector('.papyr-main-content');
                if (mainShell && !mainShell.contains(routeNode)) {
                    mainShell.innerHTML = '';
                    mainShell.appendChild(routeNode);
                }
            }, 0);
        }

        return routeNode;
    };
});
