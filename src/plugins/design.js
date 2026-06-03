/**
 * PAPYR DESIGN ENGINE
 * Advanced, responsive layout and aesthetic helpers.
 */
(function() {
    // Structural layout helpers mapping to flexbox
    papyr.center = (...args) => papyr.div({ style: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' } }, ...args);
    papyr.left = (...args) => papyr.div({ style: { display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' } }, ...args);
    papyr.right = (...args) => papyr.div({ style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' } }, ...args);
    papyr.justify = (...args) => papyr.div({ style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' } }, ...args);

    // Aesthetic design helpers
    papyr.glass = (...args) => papyr.div({ 
        style: { 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            borderRadius: '16px'
        } 
    }, ...args);

    // Template Engine stub
    papyr.template = (name) => {
        if (name === 'glass-dashboard') {
            return papyr.div({ style: { display: 'flex', minHeight: '100vh', background: '#0f172a', padding: '20px', gap: '20px' } },
                papyr.glass({ style: { width: '250px', padding: '20px' } }, papyr.h3("Sidebar")),
                papyr.div({ style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' } },
                    papyr.glass({ style: { padding: '20px' } }, papyr.h2("Dashboard Overview")),
                    papyr.div({ style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' } },
                        papyr.glass({ style: { padding: '40px', textAlign: 'center' } }, "Metric 1"),
                        papyr.glass({ style: { padding: '40px', textAlign: 'center' } }, "Metric 2")
                    )
                )
            );
        }
        return papyr.div(`Template ${name} not found.`);
    };

    // Figma Design-to-Papyr Compiler
    const translateFigmaNode = (node) => {
        if (!node) return null;
        
        let styles = {};
        if (node.absoluteBoundingBox) {
            styles.position = 'absolute';
            styles.left = `${node.absoluteBoundingBox.x}px`;
            styles.top = `${node.absoluteBoundingBox.y}px`;
            styles.width = `${node.absoluteBoundingBox.width}px`;
            styles.height = `${node.absoluteBoundingBox.height}px`;
        }

        // Fills
        if (node.fills && node.fills.length > 0) {
            let fill = node.fills[0];
            if (fill.type === 'SOLID' && fill.color) {
                let r = Math.round(fill.color.r * 255);
                let g = Math.round(fill.color.g * 255);
                let b = Math.round(fill.color.b * 255);
                let a = fill.opacity !== undefined ? fill.opacity : (fill.color.a !== undefined ? fill.color.a : 1);
                styles.background = `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }

        // Strokes
        if (node.strokes && node.strokes.length > 0) {
            let stroke = node.strokes[0];
            let weight = node.strokeWeight || 1;
            if (stroke.type === 'SOLID' && stroke.color) {
                let r = Math.round(stroke.color.r * 255);
                let g = Math.round(stroke.color.g * 255);
                let b = Math.round(stroke.color.b * 255);
                let a = stroke.opacity !== undefined ? stroke.opacity : (stroke.color.a !== undefined ? stroke.color.a : 1);
                styles.border = `${weight}px solid rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }

        // Corner Radius
        if (node.cornerRadius) {
            styles.borderRadius = `${node.cornerRadius}px`;
        }

        // Layout Mode (Auto Layout translation)
        if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
            styles.display = 'flex';
            styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
            if (node.itemSpacing) styles.gap = `${node.itemSpacing}px`;
            
            if (node.paddingTop) styles.paddingTop = `${node.paddingTop}px`;
            if (node.paddingBottom) styles.paddingBottom = `${node.paddingBottom}px`;
            if (node.paddingLeft) styles.paddingLeft = `${node.paddingLeft}px`;
            if (node.paddingRight) styles.paddingRight = `${node.paddingRight}px`;
        }

        // Children Compilation
        let children = [];
        if (node.children && Array.isArray(node.children)) {
            children = node.children.map(translateFigmaNode).filter(Boolean);
        }

        if (node.type === 'TEXT') {
            if (node.style) {
                if (node.style.fontSize) styles.fontSize = `${node.style.fontSize}px`;
                if (node.style.fontWeight) styles.fontWeight = String(node.style.fontWeight);
                if (node.style.fontFamily) styles.fontFamily = node.style.fontFamily;
                if (node.style.textAlignHorizontal) styles.textAlign = node.style.textAlignHorizontal.toLowerCase();
            }
            return papyr.span(node.characters || '', { style: styles });
        }

        return papyr.div({ style: styles }, ...children);
    };

    papyr.import = {
        figma: (figmaJson) => {
            if (!figmaJson) return null;
            let root = figmaJson.document || figmaJson;
            if (root.children && root.children.length > 0 && root.type === 'DOCUMENT') {
                root = root.children[0];
            }
            if (root.children && root.children.length > 0 && root.type === 'CANVAS') {
                root = root.children[0];
            }
            return translateFigmaNode(root);
        }
    };
})();
