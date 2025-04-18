/**
 * Utility functions for managing site settings
 */

/**
 * Updates the site favicon
 * @param {string} faviconUrl - URL of the favicon
 */
export const updateFavicon = (faviconUrl) => {
  if (!faviconUrl) return;
  
  // Find existing favicon link
  let faviconLink = document.querySelector("link[rel='icon']") || 
                   document.querySelector("link[rel='shortcut icon']");
  
  if (faviconLink) {
    // Update existing favicon
    faviconLink.href = faviconUrl;
  } else {
    // Create new favicon link
    faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    faviconLink.href = faviconUrl;
    document.head.appendChild(faviconLink);
  }
};

/**
 * Updates the site title
 * @param {string} title - New site title
 */
export const updateSiteTitle = (title) => {
  if (!title) return;
  document.title = title;
};

/**
 * Updates the company name in the site
 * @param {string} companyName - Company name
 */
export const updateCompanyName = (companyName) => {
  if (!companyName) return;
  
  // Find elements with company-name class or data attribute
  const companyNameElements = document.querySelectorAll('.company-name, [data-company-name]');
  
  companyNameElements.forEach(element => {
    element.textContent = companyName;
  });
};

/**
 * Applies all site settings at once
 * @param {Object} settings - Settings object containing favicon, title, and companyName
 */
export const applySiteSettings = (settings) => {
  if (!settings) return;
  
  if (settings.favicon) {
    updateFavicon(settings.favicon);
  }
  
  if (settings.title) {
    updateSiteTitle(settings.title);
  }
  
  if (settings.companyName) {
    updateCompanyName(settings.companyName);
  }
}; 