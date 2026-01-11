/**
 * Sidebar UI Module
 * Renders and manages the sticky navigation sidebar
 */

const SidebarUI = (() => {
  let sidebarElement = null;
  let isCollapsed = false;
  let activeTagId = null;
  let searchTerm = '';
  let allOperations = [];
  let starredRouteKeys = new Set();

  const SIDEBAR_ID = 'swagger-nav-sidebar';
  const SIDEBAR_WIDTH = '320px';
  const SIDEBAR_COLLAPSED_WIDTH = '48px';

  /**
   * Initialize sidebar
   */
  const init = async () => {
    if (sidebarElement) return; // Already initialized

    // Load starred routes from storage
    starredRouteKeys = await window.StorageManager.getStarredRoutes();

    // Create sidebar DOM
    createSidebar();
    
    // Load operations
    await refreshOperations();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Setup intersection observer for active tag tracking
    setupIntersectionObserver();
  };

  /**
   * Create sidebar DOM structure
   */
  const createSidebar = () => {
    // Check if already exists
    if (document.getElementById(SIDEBAR_ID)) {
      sidebarElement = document.getElementById(SIDEBAR_ID);
      return;
    }

    const sidebar = document.createElement('div');
    sidebar.id = SIDEBAR_ID;
    sidebar.className = 'swagger-nav-sidebar';

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-title">
          <svg class="sidebar-logo" width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="swanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ff6b8a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#e94560;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="10" fill="url(#swanGradient)"/>
            <text x="24" y="30" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="white" text-anchor="middle">swan</text>
          </svg>
          <span>Swagger Navigator</span>
        </div>
        <button class="sidebar-toggle" title="Close Navigator">
          <svg class="icon-collapse" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="sidebar-content">
        <div class="search-container">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search routes... (⌘+Shift+K)"
            autocomplete="off"
          />
          <button class="search-clear" title="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="operations-list" id="swagger-nav-list">
          <div class="loading-state">Loading routes...</div>
        </div>
      </div>

      <button class="sidebar-expand-fab" title="Open Swagger Navigator">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    `;

    document.body.appendChild(sidebar);
    sidebarElement = sidebar;

    // Attach event listeners
    attachEventListeners();
  };

  /**
   * Attach event listeners to sidebar controls
   */
  const attachEventListeners = () => {
    // Toggle button in header
    const toggleBtn = sidebarElement.querySelector('.sidebar-toggle');
    toggleBtn.addEventListener('click', toggleCollapse);

    // FAB expand button (visible when collapsed)
    const fabBtn = sidebarElement.querySelector('.sidebar-expand-fab');
    fabBtn.addEventListener('click', toggleCollapse);

    // Search input
    const searchInput = sidebarElement.querySelector('.search-input');
    searchInput.addEventListener('input', handleSearch);

    // Clear search button
    const clearBtn = sidebarElement.querySelector('.search-clear');
    clearBtn.addEventListener('click', clearSearch);
  };

  /**
   * Toggle sidebar collapse state
   */
  const toggleCollapse = () => {
    isCollapsed = !isCollapsed;
    sidebarElement.classList.toggle('collapsed', isCollapsed);
    
    // Update icon rotation
    const icon = sidebarElement.querySelector('.icon-collapse');
    if (icon) {
      icon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  };

  /**
   * Handle search input
   */
  const handleSearch = (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderOperations();
  };

  /**
   * Clear search input
   */
  const clearSearch = () => {
    const searchInput = sidebarElement.querySelector('.search-input');
    searchInput.value = '';
    searchTerm = '';
    renderOperations();
  };

  /**
   * Setup keyboard shortcuts
   */
  const setupKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Shift + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        const searchInput = sidebarElement.querySelector('.search-input');
        searchInput.focus();
        searchInput.select();
      }
    });
  };

  /**
   * Setup intersection observer to track visible operations
   */
  const setupIntersectionObserver = () => {
    const options = {
      root: null,
      rootMargin: '-50px 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Find tag for this operation
          const tagSection = entry.target.closest('.opblock-tag-section');
          if (tagSection) {
            updateActiveTag(tagSection.id);
          }
        }
      });
    }, options);

    // Observe all operations
    document.querySelectorAll('.opblock').forEach((op) => {
      observer.observe(op);
    });

    // Store observer for cleanup
    window.swaggerNavObserver = observer;
  };

  /**
   * Update active tag highlight
   */
  const updateActiveTag = (tagId) => {
    if (activeTagId === tagId) return;
    
    activeTagId = tagId;

    // Update UI
    const allTagHeaders = sidebarElement.querySelectorAll('.tag-header');
    allTagHeaders.forEach((header) => {
      header.classList.toggle('active', header.dataset.tagId === tagId);
    });
  };

  /**
   * Refresh operations from DOM
   */
  const refreshOperations = async () => {
    allOperations = window.DOMParser.extractAllOperations();
    starredRouteKeys = await window.StorageManager.getStarredRoutes();
    renderOperations();
  };

  /**
   * Render operations in sidebar
   */
  const renderOperations = () => {
    const listContainer = sidebarElement.querySelector('#swagger-nav-list');
    
    // Filter operations by search term
    const filteredOps = filterOperations(allOperations, searchTerm);

    // Group by tag
    const groupedByTag = groupOperationsByTag(filteredOps);

    // Separate starred routes
    const starredOps = filteredOps.filter((op) => {
      const routeKey = window.StorageManager.generateRouteKey(op.method, op.path);
      return starredRouteKeys.has(routeKey);
    });

    let html = '';

    // Render starred routes section
    if (starredOps.length > 0) {
      html += renderStarredSection(starredOps);
    }

    // Render tags with operations
    Object.keys(groupedByTag).forEach((tagName) => {
      const tagData = groupedByTag[tagName];
      html += renderTag(tagName, tagData.operations, tagData.description);
    });

    if (html === '') {
      html = '<div class="empty-state">No routes found</div>';
    }

    listContainer.innerHTML = html;

    // Attach click listeners to rendered elements
    attachOperationListeners();
  };

  /**
   * Filter operations based on search term
   */
  const filterOperations = (operations, term) => {
    if (!term) return operations;

    return operations.filter((op) => {
      const searchableText = `
        ${op.method} 
        ${op.path} 
        ${op.summary} 
        ${op.operationId}
      `.toLowerCase();

      return searchableText.includes(term);
    });
  };

  /**
   * Group operations by tag name
   */
  const groupOperationsByTag = (operations) => {
    const grouped = {};

    operations.forEach((op) => {
      const tag = op.tagName || 'Untagged';
      if (!grouped[tag]) {
        grouped[tag] = {
          operations: [],
          description: op.tagDescription || ''
        };
      }
      grouped[tag].operations.push(op);
    });

    return grouped;
  };

  /**
   * Render starred routes section
   */
  const renderStarredSection = (starredOps) => {
    const operations = starredOps.map((op) => renderOperation(op, true)).join('');

    return `
      <div class="tag-section starred-section">
        <div class="tag-header" data-tag-id="starred">
          <svg class="tag-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span class="tag-name">Starred Routes</span>
          <span class="tag-count">${starredOps.length}</span>
          <svg class="tag-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="tag-operations">
          ${operations}
        </div>
      </div>
    `;
  };

  /**
   * Render a tag section with operations
   */
  const renderTag = (tagName, operations, tagDescription = '') => {
    const tagId = `tag-${tagName.toLowerCase().replace(/\s+/g, '-')}`;
    const operationsHtml = operations.map((op) => renderOperation(op, false)).join('');
    
    // Include description if available
    const descriptionHtml = tagDescription ? `
      <div class="tag-description">
        <p>${tagDescription}</p>
      </div>
    ` : '';

    return `
      <div class="tag-section collapsed">
        <div class="tag-header" data-tag-id="${tagId}">
          <svg class="tag-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          <span class="tag-name">${tagName}</span>
          <span class="tag-count">${operations.length}</span>
          <svg class="tag-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="tag-operations">
          ${descriptionHtml}
          ${operationsHtml}
        </div>
      </div>
    `;
  };

  /**
   * Render individual operation
   */
  const renderOperation = (op, isInStarredSection) => {
    const routeKey = window.StorageManager.generateRouteKey(op.method, op.path);
    const isStarred = starredRouteKeys.has(routeKey);
    const methodClass = window.DOMParser.getMethodColor(op.method);
    const deprecatedClass = op.isDeprecated ? 'deprecated' : '';

    return `
      <div class="operation-item ${deprecatedClass}" 
           data-method="${op.method}" 
           data-path="${op.path}">
        <div class="operation-main">
          <span class="operation-method ${methodClass}">${op.method}</span>
          <span class="operation-path" title="${op.path}">${op.path}</span>
        </div>
        ${op.summary ? `<div class="operation-summary">${op.summary}</div>` : ''}
        <button class="star-button ${isStarred ? 'starred' : ''}" 
                data-method="${op.method}" 
                data-path="${op.path}"
                title="${isStarred ? 'Unstar route' : 'Star route'}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${isStarred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      </div>
    `;
  };

  /**
   * Attach click listeners to rendered operations
   */
  const attachOperationListeners = () => {
    // Tag header click - toggle expand/collapse
    sidebarElement.querySelectorAll('.tag-header').forEach((header) => {
      header.addEventListener('click', (e) => {
        const tagSection = e.currentTarget.closest('.tag-section');
        tagSection.classList.toggle('collapsed');
      });
    });

    // Operation click - scroll to route
    sidebarElement.querySelectorAll('.operation-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        // Don't trigger if clicking star button
        if (e.target.closest('.star-button')) return;

        const method = item.dataset.method;
        const path = item.dataset.path;

        const element = window.DOMParser.findOperationElement(method, path);
        if (element) {
          window.DOMParser.scrollToOperation(element);
        }
      });
    });

    // Star button click - toggle starred state
    sidebarElement.querySelectorAll('.star-button').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();

        const method = btn.dataset.method;
        const path = btn.dataset.path;

        // Toggle in storage
        const isNowStarred = await window.StorageManager.toggleStarred(method, path);

        // Update UI
        btn.classList.toggle('starred', isNowStarred);
        const svg = btn.querySelector('svg');
        svg.setAttribute('fill', isNowStarred ? 'currentColor' : 'none');

        // Update star icons in Swagger UI
        updateStarInSwaggerUI(method, path, isNowStarred);

        // Refresh sidebar to update starred section
        await refreshOperations();
      });
    });
  };

  /**
   * Update star icon in main Swagger UI
   */
  const updateStarInSwaggerUI = (method, path, isStarred) => {
    const opElement = window.DOMParser.findOperationElement(method, path);
    if (!opElement) return;

    const starIcon = opElement.querySelector('.swagger-nav-star');
    if (starIcon) {
      starIcon.classList.toggle('starred', isStarred);
      const svg = starIcon.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', isStarred ? 'currentColor' : 'none');
      }
    }
  };

  /**
   * Remove sidebar
   */
  const destroy = () => {
    if (sidebarElement) {
      sidebarElement.remove();
      sidebarElement = null;
    }

    if (window.swaggerNavObserver) {
      window.swaggerNavObserver.disconnect();
    }
  };

  return {
    init,
    destroy,
    refreshOperations,
    updateActiveTag
  };
})();

// Export for use in other modules
window.SidebarUI = SidebarUI;