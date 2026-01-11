/**
 * Mutation Handler Module
 * Observes Swagger UI DOM changes and re-initializes features
 * Handles: spec reloads, tag collapse/expand, route rendering
 */

const MutationHandler = (() => {
  let observer = null;
  let isInitialized = false;
  let debounceTimer = null;

  const DEBOUNCE_DELAY = 300; // milliseconds

  /**
   * Initialize mutation observer
   */
  const init = () => {
    if (isInitialized) return;

    setupMutationObserver();
    setupStarInjection();
    isInitialized = true;
  };

  /**
   * Setup MutationObserver to watch for Swagger UI changes
   */
  const setupMutationObserver = () => {
    const targetNode = document.body;

    const config = {
      childList: true,
      subtree: true,
      attributes: false
    };

    observer = new MutationObserver((mutations) => {
      handleMutations(mutations);
    });

    observer.observe(targetNode, config);
  };

  /**
   * Handle DOM mutations
   * @param {MutationRecord[]} mutations
   */
  const handleMutations = (mutations) => {
    let shouldReinit = false;

    for (const mutation of mutations) {
      // Check if new operations were added
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if it's an operation block or contains operation blocks
          if (node.matches && node.matches('.opblock, .opblock-tag-section')) {
            shouldReinit = true;
            break;
          }
          
          if (node.querySelector && node.querySelector('.opblock')) {
            shouldReinit = true;
            break;
          }
        }
      }

      if (shouldReinit) break;
    }

    if (shouldReinit) {
      debouncedReinit();
    }
  };

  /**
   * Debounced re-initialization to avoid excessive updates
   */
  const debouncedReinit = () => {
    clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(() => {
      injectStarsIntoOperations();
      
      // Refresh sidebar if it exists
      if (window.SidebarUI) {
        window.SidebarUI.refreshOperations();
      }
    }, DEBOUNCE_DELAY);
  };

  /**
   * Setup star icon injection into Swagger operations
   */
  const setupStarInjection = () => {
    // Initial injection
    injectStarsIntoOperations();
  };

  /**
   * Inject star icons into all operation blocks
   */
  const injectStarsIntoOperations = async () => {
    const operations = document.querySelectorAll('.opblock');
    const starredRoutes = await window.StorageManager.getStarredRoutes();

    operations.forEach((opBlock) => {
      // Skip if already has star icon
      if (opBlock.querySelector('.swagger-nav-star')) return;

      const operation = window.DOMParser.parseOperation(opBlock);
      if (!operation) return;

      const routeKey = window.StorageManager.generateRouteKey(
        operation.method,
        operation.path
      );
      const isStarred = starredRoutes.has(routeKey);

      // Create star button
      const starButton = createStarButton(
        operation.method,
        operation.path,
        isStarred
      );

      // Find summary section to inject star
      const summary = opBlock.querySelector('.opblock-summary');
      if (summary) {
        // Find the expand/collapse button (SVG arrow)
        const expandButton = summary.querySelector('.opblock-summary-control, svg[class*="arrow"]');
        
        if (expandButton) {
          // Insert star button BEFORE the expand button
          expandButton.parentNode.insertBefore(starButton, expandButton);
        } else {
          // Fallback: append to summary if expand button not found
          summary.appendChild(starButton);
        }
      }
    });
  };

  /**
   * Create star button element
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {boolean} isStarred - Initial starred state
   * @returns {HTMLElement}
   */
  const createStarButton = (method, path, isStarred) => {
    const button = document.createElement('button');
    button.className = `swagger-nav-star ${isStarred ? 'starred' : ''}`;
    button.title = isStarred ? 'Unstar this route' : 'Star this route';
    button.dataset.method = method;
    button.dataset.path = path;

    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" 
           fill="${isStarred ? 'currentColor' : 'none'}" 
           stroke="currentColor" 
           stroke-width="2"
           stroke-linecap="round"
           stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `;

    // Add click handler
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      const newState = await window.StorageManager.toggleStarred(method, path);

      // Update button state
      button.classList.toggle('starred', newState);
      button.title = newState ? 'Unstar this route' : 'Star this route';
      
      const svg = button.querySelector('svg');
      svg.setAttribute('fill', newState ? 'currentColor' : 'none');

      // Refresh sidebar
      if (window.SidebarUI) {
        window.SidebarUI.refreshOperations();
      }
    });

    return button;
  };

  /**
   * Disconnect observer
   */
  const destroy = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    isInitialized = false;
  };

  /**
   * Manually trigger re-initialization
   */
  const reinitialize = () => {
    injectStarsIntoOperations();
    if (window.SidebarUI) {
      window.SidebarUI.refreshOperations();
    }
  };

  return {
    init,
    destroy,
    reinitialize,
    injectStarsIntoOperations
  };
})();

// Export for use in other modules
window.MutationHandler = MutationHandler;