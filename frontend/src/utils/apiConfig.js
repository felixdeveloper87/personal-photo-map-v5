/**
 * API Configuration Utility
 * Centralizes the logic for API URL handling
 */

/**
 * Gets the base API URL
 * In development (Docker): uses proxy via relative URLs
 * In production: uses environment variable or defaults
 */
export const getApiBaseUrl = () => {
  // If VITE_BACKEND_URL is defined (production), use it
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // In development (Docker with Vite proxy), use empty string for relative URLs test
  return '';
};

/**
 * Builds a complete API URL
 * @param {string} endpoint - The API endpoint (e.g., '/api/auth/login')
 * @returns {string} Complete URL
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  
  // If we have a base URL (production), combine it with endpoint
  if (baseUrl) {
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  // In development without base URL, use relative path for proxy
  return endpoint;
};

/**
 * Builds image URL for display
 * @param {string} filePath - The file path from the API
 * @returns {string} Complete image URL
 */
export const buildImageUrl = (filePath) => {
  // If filePath is empty or null, return empty strings
  if (!filePath) {
    return '';
  }
  
  // If it's already a full URL (S3 or local storage), return as is
  if (filePath.includes('http')) {
    return filePath;
  }
  
  // If filePath already starts with /api, it's already a complete path
  if (filePath.startsWith('/api/')) {
    const baseUrl = getApiBaseUrl();
    return baseUrl ? `${baseUrl}${filePath}` : filePath;
  }
  
  // If filePath is just a filename, prepend the uploads path
  if (!filePath.startsWith('/')) {
    const baseUrl = getApiBaseUrl();
    const uploadsPath = '/api/images/uploads/';
    return baseUrl ? `${baseUrl}${uploadsPath}${filePath}` : `${uploadsPath}${filePath}`;
  }
  
  // Otherwise, build with API base URL
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${filePath}` : filePath;
};
