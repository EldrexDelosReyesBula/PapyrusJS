/**
 * PAPYR LAYOUT ENGINE
 * Handles viewport breakpoints and responsive layout bindings.
 */

coreInitializers.push((papyr) => {
    // 1. Breakpoint definitions
    const breakpoints = {
        mobile: 0,
        tablet: 768,
        laptop: 1024,
        desktop: 1440,
        ultrawide: 2560
    };

    let currentDeviceClass = 'desktop';
    
    const getDeviceClass = (width) => {
        if (width < breakpoints.tablet) return 'mobile';
        if (width < breakpoints.laptop) return 'tablet';
        if (width < breakpoints.desktop) return 'laptop';
        if (width < breakpoints.ultrawide) return 'desktop';
        return 'ultrawide';
    };

    // 2. Setup Device Class state
    if (typeof window !== 'undefined') {
        currentDeviceClass = papyr.state(getDeviceClass(window.innerWidth));
        
        const updateDeviceClass = () => {
            const width = window.innerWidth;
            const newClass = getDeviceClass(width);
            if (currentDeviceClass.value !== newClass) {
                currentDeviceClass.value = newClass;
            }
            
            // Sync with document element classes
            if (document.documentElement && document.documentElement.classList) {
                Object.keys(breakpoints).forEach(cls => {
                    document.documentElement.classList.toggle(`papyr-layout-${cls}`, cls === newClass);
                });
            }
        };

        window.addEventListener('resize', updateDeviceClass);
        updateDeviceClass();
    } else {
        currentDeviceClass = papyr.state('desktop');
    }

    papyr.layout = papyr.layout || {};
    papyr.layout.deviceClass = currentDeviceClass;

    // 3. Responsive element layout observer hook
    papyr.layout.observeResponsive = (el, enable) => {
        if (!el || typeof window === 'undefined') return;
        
        if (!enable) {
            if (el._responsiveResizeObserver) {
                el._responsiveResizeObserver.disconnect();
                delete el._responsiveResizeObserver;
            }
            return;
        }

        if (el._responsiveResizeObserver) return;

        const updateResponsiveLayout = (width) => {
            const newClass = getDeviceClass(width);
            Object.keys(breakpoints).forEach(cls => {
                el.classList.toggle(`papyr-responsive-${cls}`, cls === newClass);
            });
            // Auto flex direction adjustment for grids/flex container columns on mobile
            if (newClass === 'mobile') {
                el.style.flexDirection = 'column';
            } else {
                el.style.flexDirection = '';
            }
        };

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    updateResponsiveLayout(entry.contentRect.width || entry.target.clientWidth);
                }
            });
            observer.observe(el);
            el._responsiveResizeObserver = observer;
            
            if (!el._cleanups) el._cleanups = [];
            el._cleanups.push(() => observer.disconnect());
        } else {
            const handler = () => updateResponsiveLayout(window.innerWidth);
            window.addEventListener('resize', handler);
            handler();
            
            if (!el._cleanups) el._cleanups = [];
            el._cleanups.push(() => window.removeEventListener('resize', handler));
        }
    };
});
