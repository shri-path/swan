/**
 * Content Script - Main Entry Point
 * Initializes the Swagger Navigator extension
 * Detects Swagger UI and coordinates all modules
 */

(async () => {
  /**
   * Check if page is Swagger UI
   */
  const detectSwaggerUI = () => {
    // Look for Swagger UI indicators
    const indicators = [
      '#swagger-ui',
      '.swagger-ui',
      '.information-container',
      '.opblock-tag-section'
    ];

    for (const selector of indicators) {
      if (document.querySelector(selector)) {
        return true;
      }
    }

    // Check page title
    if (document.title.toLowerCase().includes('swagger')) {
      return true;
    }

    return false;
  };

  /**
   * Wait for Swagger UI to be fully loaded
   */
  const waitForSwaggerUI = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (document.querySelector('.opblock')) {
        resolve();
        return;
      }

      // Setup observer to wait for operations to load
      const observer = new MutationObserver((mutations, obs) => {
        if (document.querySelector('.opblock')) {
          obs.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 10000);
    });
  };

  /**
   * Initialize extension
   */
  const initialize = async () => {
    console.log('[Swagger Navigator] Initializing...');

    try {
      // Wait for Swagger UI to be ready
      await waitForSwaggerUI();

      // Check if operations exist
      if (!document.querySelector('.opblock')) {
        console.log('[Swagger Navigator] No operations found, extension will not load');
        return;
      }

      // Initialize modules in order
      console.log('[Swagger Navigator] Initializing sidebar...');
      await window.SidebarUI.init();

      console.log('[Swagger Navigator] Initializing mutation handler...');
      window.MutationHandler.init();

      console.log('[Swagger Navigator] Extension loaded successfully');

      // Add indicator to page (for debugging)
      addLoadIndicator();

    } catch (error) {
      console.error('[Swagger Navigator] Initialization failed:', error);
    }
  };

  /**
   * Add visual indicator that extension is loaded
   */
  const addLoadIndicator = () => {
    // Add a small badge to indicate extension is active
    const badge = document.createElement('div');
    badge.className = 'swagger-nav-badge';
    badge.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <span>Navigator Active</span>
    `;
    document.body.appendChild(badge);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      badge.style.opacity = '0';
      setTimeout(() => badge.remove(), 300);
    }, 3000);
  };

  /**
   * Cleanup on page unload
   */
  const cleanup = () => {
    if (window.SidebarUI) {
      window.SidebarUI.destroy();
    }
    if (window.MutationHandler) {
      window.MutationHandler.destroy();
    }
  };

  // Main execution
  const isSwagger = detectSwaggerUI();

  if (isSwagger) {
    console.log('[Swagger Navigator] Swagger UI detected');
    
    // Wait a bit for page to stabilize
    setTimeout(() => {
      initialize();
    }, 500);

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // Listen for Swagger UI reloads (spec changes)
    // Some Swagger UIs dispatch custom events
    document.addEventListener('swaggerUIUpdate', () => {
      console.log('[Swagger Navigator] Swagger UI update detected, reinitializing...');
      if (window.MutationHandler) {
        window.MutationHandler.reinitialize();
      }
    });

  } else {
    console.log('[Swagger Navigator] Not a Swagger UI page, extension will not load');
  }

  // Expose global API for debugging
  window.SwaggerNavigator = {
    reinitialize: () => {
      cleanup();
      initialize();
    },
    cleanup,
    version: '1.0.0'
  };

})();