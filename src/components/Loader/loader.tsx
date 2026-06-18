'use client';

import { useEffect, useState } from 'react';

export default function GlobalApiLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch;
    let activeRequests = 0;
    let showTimer: number | null = null;
    let mounted = true;

    const showLoader = () => {
      if (showTimer) window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => {
        if (mounted && activeRequests > 0) {
          setLoading(true);
        }
      }, 150);
    };

    const hideLoader = () => {
      if (showTimer) {
        window.clearTimeout(showTimer);
        showTimer = null;
      }

      if (mounted) {
        setLoading(false);
      }
    };

    window.fetch = async (...args) => {
      activeRequests += 1;
      showLoader();

      try {
        return await originalFetch(...args);
      } finally {
        activeRequests = Math.max(0, activeRequests - 1);

        if (activeRequests === 0) {
          hideLoader();
        }
      }
    };

    return () => {
      mounted = false;
      window.fetch = originalFetch;

      if (showTimer) {
        window.clearTimeout(showTimer);
      }
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="global-api-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="global-api-loader-panel">
        <span className="global-api-loader-spinner" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
