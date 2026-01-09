/**
 * DOM Parser Module
 * Extracts tags, routes, and operations from Swagger UI DOM
 * Assumes standard Swagger UI DOM structure
 */

const DOMParser = (() => {
  // Swagger UI CSS selectors (standard structure)
  const SELECTORS = {
    operations: '.opblock',
    operationTag: '.opblock-tag-section',
    tagHeader: '.opblock-tag',
    method: '.opblock-summary-method',
    path: '.opblock-summary-path',
    summary: '.opblock-summary-description',
    operationId: '.opblock-summary-operation-id',
    deprecated: '.opblock-deprecated'
  };

  /**
   * Check if Swagger UI is present on the page
   * @returns {boolean}
   */
  const isSwaggerUI = () => {
    return document.querySelector('#swagger-ui') !== null ||
           document.querySelector('.swagger-ui') !== null ||
           document.querySelector('[class*="swagger"]') !== null;
  };

  /**
   * Extract all tags from Swagger UI
   * @returns {Array<Object>} Array of tag objects with name and element
   */
  const extractTags = () => {
    const tags = [];
    const tagElements = document.querySelectorAll(SELECTORS.operationTag);

    tagElements.forEach((tagElement) => {
      const tagHeader = tagElement.querySelector(SELECTORS.tagHeader);
      if (!tagHeader) return;

      const tagName = tagHeader.textContent.trim();
      const tagId = tagElement.id || `tag-${tagName.toLowerCase().replace(/\s+/g, '-')}`;

      tags.push({
        name: tagName,
        id: tagId,
        element: tagElement,
        operations: []
      });
    });

    return tags;
  };

  /**
   * Extract operations (routes) for a specific tag element
   * @param {HTMLElement} tagElement - Tag section element
   * @returns {Array<Object>} Array of operation objects
   */
  const extractOperationsForTag = (tagElement) => {
    const operations = [];
    const opblocks = tagElement.querySelectorAll(SELECTORS.operations);

    opblocks.forEach((opblock) => {
      const operation = parseOperation(opblock);
      if (operation) {
        operations.push(operation);
      }
    });

    return operations;
  };

  /**
   * Parse individual operation block
   * @param {HTMLElement} opblock - Operation block element
   * @returns {Object|null} Operation object or null if invalid
   */
  const parseOperation = (opblock) => {
    const methodElement = opblock.querySelector(SELECTORS.method);
    const pathElement = opblock.querySelector(SELECTORS.path);

    if (!methodElement || !pathElement) return null;

    const method = methodElement.textContent.trim().toUpperCase();
    const path = pathElement.textContent.trim();
    
    // Extract summary and operationId if available
    const summaryElement = opblock.querySelector(SELECTORS.summary);
    const operationIdElement = opblock.querySelector(SELECTORS.operationId);
    
    const summary = summaryElement ? summaryElement.textContent.trim() : '';
    const operationId = operationIdElement ? operationIdElement.textContent.trim() : '';
    
    // Check if deprecated
    const isDeprecated = opblock.classList.contains('deprecated') ||
                        opblock.querySelector(SELECTORS.deprecated) !== null;

    return {
      method,
      path,
      summary,
      operationId,
      isDeprecated,
      element: opblock,
      id: opblock.id || `${method}-${path}`.replace(/[^a-zA-Z0-9-]/g, '-')
    };
  };

  /**
   * Extract all operations from entire Swagger UI
   * @returns {Array<Object>} Array of all operations with tag info
   */
  const extractAllOperations = () => {
    const allOperations = [];
    const tags = extractTags();

    tags.forEach((tag) => {
      const operations = extractOperationsForTag(tag.element);
      operations.forEach((op) => {
        allOperations.push({
          ...op,
          tagName: tag.name,
          tagId: tag.id
        });
      });
    });

    return allOperations;
  };

  /**
   * Find operation element by method and path
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @returns {HTMLElement|null}
   */
  const findOperationElement = (method, path) => {
    const operations = document.querySelectorAll(SELECTORS.operations);
    
    for (const op of operations) {
      const opMethod = op.querySelector(SELECTORS.method)?.textContent.trim().toUpperCase();
      const opPath = op.querySelector(SELECTORS.path)?.textContent.trim();
      
      if (opMethod === method.toUpperCase() && opPath === path) {
        return op;
      }
    }
    
    return null;
  };

  /**
   * Scroll to operation and highlight it
   * @param {HTMLElement} element - Operation element to scroll to
   */
  const scrollToOperation = (element) => {
    if (!element) return;

    // Smooth scroll to element with offset for better visibility
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - 100; // 100px offset from top

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Highlight animation (3 seconds for better visibility)
    element.classList.add('swagger-nav-highlight');
    setTimeout(() => {
      element.classList.remove('swagger-nav-highlight');
    }, 3000);
  };

  /**
   * Get HTTP method color class
   * @param {string} method - HTTP method
   * @returns {string} CSS class name
   */
  const getMethodColor = (method) => {
    const methodLower = method.toLowerCase();
    const colorMap = {
      get: 'method-get',
      post: 'method-post',
      put: 'method-put',
      delete: 'method-delete',
      patch: 'method-patch',
      options: 'method-options',
      head: 'method-head'
    };
    
    return colorMap[methodLower] || 'method-default';
  };

  return {
    isSwaggerUI,
    extractTags,
    extractOperationsForTag,
    extractAllOperations,
    findOperationElement,
    scrollToOperation,
    parseOperation,
    getMethodColor,
    SELECTORS
  };
})();

// Export for use in other modules
window.DOMParser = DOMParser;