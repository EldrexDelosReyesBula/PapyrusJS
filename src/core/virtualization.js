/**
 * PAPYR VIRTUALIZATION ENGINE
 * High-performance virtual rendering engines for massive dataset handling in lists, grids, and tables.
 */

coreInitializers.push((papyr) => {
    // 1. Virtual List
    papyr.virtualList = (options) => {
        const { items, itemHeight, renderItem, height = 400 } = options;
        
        const container = papyr.div({
            style: {
                height: typeof height === 'number' ? `${height}px` : height,
                overflowY: 'auto',
                position: 'relative'
            }
        });

        const listHeight = items.length * itemHeight;
        const innerContainer = papyr.div({
            style: {
                height: `${listHeight}px`,
                position: 'relative',
                width: '100%'
            }
        });
        container.appendChild(innerContainer);

        const visibleItems = new Map();

        const updateItems = () => {
            const scrollTop = container.scrollTop;
            const viewportHeight = container.clientHeight;
            
            const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
            const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + viewportHeight) / itemHeight) + 2);

            // Cleanup non-visible
            visibleItems.forEach((el, index) => {
                if (index < startIndex || index > endIndex) {
                    if (el.parentNode === innerContainer) {
                        innerContainer.removeChild(el);
                    }
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(el);
                    }
                    visibleItems.delete(index);
                }
            });

            // Render visible
            for (let i = startIndex; i <= endIndex; i++) {
                if (!visibleItems.has(i)) {
                    const itemEl = renderItem(items[i], i);
                    itemEl.style.position = 'absolute';
                    itemEl.style.top = `${i * itemHeight}px`;
                    itemEl.style.left = '0';
                    itemEl.style.width = '100%';
                    itemEl.style.height = `${itemHeight}px`;
                    innerContainer.appendChild(itemEl);
                    visibleItems.set(i, itemEl);
                }
            }
        };

        container.addEventListener('scroll', updateItems);
        
        // Trigger updates once mounted
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(updateItems);
        } else {
            setTimeout(updateItems, 0);
        }

        return container;
    };

    // 2. Virtual Grid
    papyr.virtualGrid = (options) => {
        const { items, itemHeight, columnsCount, renderItem, height = 400 } = options;
        
        const container = papyr.div({
            style: {
                height: typeof height === 'number' ? `${height}px` : height,
                overflowY: 'auto',
                position: 'relative'
            }
        });

        const rowsCount = Math.ceil(items.length / columnsCount);
        const listHeight = rowsCount * itemHeight;
        
        const innerContainer = papyr.div({
            style: {
                height: `${listHeight}px`,
                position: 'relative',
                width: '100%'
            }
        });
        container.appendChild(innerContainer);

        const visibleItems = new Map();

        const updateItems = () => {
            const scrollTop = container.scrollTop;
            const viewportHeight = container.clientHeight;
            
            const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
            const endRow = Math.min(rowsCount - 1, Math.floor((scrollTop + viewportHeight) / itemHeight) + 1);

            const startIndex = startRow * columnsCount;
            const endIndex = Math.min(items.length - 1, (endRow + 1) * columnsCount - 1);

            // Cleanup non-visible
            visibleItems.forEach((el, index) => {
                if (index < startIndex || index > endIndex) {
                    if (el.parentNode === innerContainer) {
                        innerContainer.removeChild(el);
                    }
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(el);
                    }
                    visibleItems.delete(index);
                }
            });

            // Render visible
            for (let i = startIndex; i <= endIndex; i++) {
                if (!visibleItems.has(i)) {
                    const row = Math.floor(i / columnsCount);
                    const col = i % columnsCount;
                    
                    const itemEl = renderItem(items[i], i);
                    itemEl.style.position = 'absolute';
                    itemEl.style.top = `${row * itemHeight}px`;
                    itemEl.style.left = `${(col * 100) / columnsCount}%`;
                    itemEl.style.width = `${100 / columnsCount}%`;
                    itemEl.style.height = `${itemHeight}px`;
                    innerContainer.appendChild(itemEl);
                    visibleItems.set(i, itemEl);
                }
            }
        };

        container.addEventListener('scroll', updateItems);
        
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(updateItems);
        } else {
            setTimeout(updateItems, 0);
        }

        return container;
    };

    // 3. Virtual Table
    papyr.virtualTable = (options) => {
        const { items, rowHeight, columns, renderCell, height = 400 } = options;
        
        const scrollContainer = papyr.div({
            style: {
                height: typeof height === 'number' ? `${height}px` : height,
                overflowY: 'auto',
                position: 'relative'
            }
        });

        const listHeight = items.length * rowHeight;
        const innerContainer = papyr.div({
            style: {
                height: `${listHeight}px`,
                position: 'relative',
                width: '100%'
            }
        });
        scrollContainer.appendChild(innerContainer);

        const visibleRows = new Map();

        const updateItems = () => {
            const scrollTop = scrollContainer.scrollTop;
            const viewportHeight = scrollContainer.clientHeight;
            
            const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
            const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + viewportHeight) / rowHeight) + 2);

            // Cleanup non-visible rows
            visibleRows.forEach((el, index) => {
                if (index < startIndex || index > endIndex) {
                    if (el.parentNode === innerContainer) {
                        innerContainer.removeChild(el);
                    }
                    if (typeof papyr._cleanupElement === 'function') {
                        papyr._cleanupElement(el);
                    }
                    visibleRows.delete(index);
                }
            });

            // Render visible rows
            for (let i = startIndex; i <= endIndex; i++) {
                if (!visibleRows.has(i)) {
                    // Create row element (represented as absolute positioned div containing grid cells)
                    const cells = columns.map((col, cIdx) => {
                        const cellVal = items[i][col.key];
                        const cellContent = renderCell ? renderCell(cellVal, col, items[i], i) : String(cellVal || '');
                        
                        return papyr.div({
                            style: {
                                flex: col.width ? `0 0 ${col.width}` : '1',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                padding: '8px'
                            }
                        }, cellContent);
                    });

                    const rowEl = papyr.flex.row({
                        style: {
                            position: 'absolute',
                            top: `${i * rowHeight}px`,
                            left: '0',
                            width: '100%',
                            height: `${rowHeight}px`,
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                        }
                    }, ...cells);

                    innerContainer.appendChild(rowEl);
                    visibleRows.set(i, rowEl);
                }
            }
        };

        scrollContainer.addEventListener('scroll', updateItems);
        
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(updateItems);
        } else {
            setTimeout(updateItems, 0);
        }

        return scrollContainer;
    };
});
