import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initMetaPixel, pageView } from '../utils/metaPixel';

const MetaPixelTracker = () => {
    const location = useLocation();
    const lastTrackedPath = useRef('');

    // Initialize the Meta Pixel once on mount
    useEffect(() => {
        initMetaPixel();
    }, []);

    // Track a PageView whenever the route changes
    useEffect(() => {
        const currentPath = location.pathname + location.search;
        // Prevent duplicate tracking in React StrictMode or accidental remounts
        if (lastTrackedPath.current !== currentPath) {
            pageView();
            lastTrackedPath.current = currentPath;
        }
    }, [location.pathname, location.search]);

    // This component does not render any visible UI
    return null;
};

export default MetaPixelTracker;
