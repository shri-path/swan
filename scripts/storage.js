/**
 * Storage Module
 * Handles chrome.storage.sync operations for starred routes
 * Uses a composite key: method + path + specIdentifier
 */

const StorageManager = (() => {
  const STORAGE_KEY = 'swagger_starred_routes';

  /**
   * Generate unique identifier for current Swagger spec
   * Uses document title or URL as fallback
   */
  const getSpecIdentifier = () => {
    // Try to use document title (usually includes API name)
    const title = document.title;
    if (title && title !== 'Swagger UI') {
      return title;
    }
    
    // Fallback to URL path
    const url = window.location.pathname;
    return url || 'default-spec';
  };

  /**
   * Generate unique route key
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} path - API path (/users/{id})
   * @returns {string} Composite key
   */
  const generateRouteKey = (method, path) => {
    const specId = getSpecIdentifier();
    return `${specId}::${method}::${path}`;
  };

  /**
   * Get all starred routes
   * @returns {Promise<Set<string>>} Set of starred route keys
   */
  const getStarredRoutes = async () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        const routes = result[STORAGE_KEY] || [];
        resolve(new Set(routes));
      });
    });
  };

  /**
   * Toggle starred state for a route
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @returns {Promise<boolean>} New starred state
   */
  const toggleStarred = async (method, path) => {
    const routeKey = generateRouteKey(method, path);
    const starredRoutes = await getStarredRoutes();
    
    if (starredRoutes.has(routeKey)) {
      starredRoutes.delete(routeKey);
    } else {
      starredRoutes.add(routeKey);
    }

    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { [STORAGE_KEY]: Array.from(starredRoutes) },
        () => {
          resolve(starredRoutes.has(routeKey));
        }
      );
    });
  };

  /**
   * Check if a route is starred
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @returns {Promise<boolean>}
   */
  const isStarred = async (method, path) => {
    const routeKey = generateRouteKey(method, path);
    const starredRoutes = await getStarredRoutes();
    return starredRoutes.has(routeKey);
  };

  /**
   * Clear all starred routes for current spec
   * @returns {Promise<void>}
   */
  const clearStarredRoutes = async () => {
    const specId = getSpecIdentifier();
    const allStarred = await getStarredRoutes();
    
    // Filter out routes from current spec
    const filtered = Array.from(allStarred).filter(
      key => !key.startsWith(`${specId}::`)
    );

    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: filtered }, resolve);
    });
  };

  return {
    getStarredRoutes,
    toggleStarred,
    isStarred,
    generateRouteKey,
    getSpecIdentifier,
    clearStarredRoutes
  };
})();

// Export for use in other modules
window.StorageManager = StorageManager;