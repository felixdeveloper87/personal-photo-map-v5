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
  // Debug: Log do filePath recebido
  console.log('🔍 buildImageUrl - Input filePath:', filePath);
  
  // If filePath is empty or null, return empty strings
  if (!filePath) {
    console.log('❌ buildImageUrl - FilePath is empty or null');
    return '';
  }
  
  // If it's already a full URL (S3 or local storage), return as is
  if (filePath.includes('http')) {
    console.log('✅ buildImageUrl - Already full URL:', filePath);
    return filePath;
  }
  
  // If filePath already starts with /api, it's already a complete path
  if (filePath.startsWith('/api/')) {
    const baseUrl = getApiBaseUrl();
    const finalUrl = baseUrl ? `${baseUrl}${filePath}` : filePath;
    console.log('✅ buildImageUrl - API path detected:', filePath, '-> Final URL:', finalUrl);
    return finalUrl;
  }
  
  // If filePath is just a filename, prepend the uploads path
  if (!filePath.startsWith('/')) {
    const baseUrl = getApiBaseUrl();
    const uploadsPath = '/api/images/uploads/';
    const finalUrl = baseUrl ? `${baseUrl}${uploadsPath}${filePath}` : `${uploadsPath}${filePath}`;
    console.log('✅ buildImageUrl - Filename only:', filePath, '-> Final URL:', finalUrl);
    return finalUrl;
  }
  
  // Otherwise, build with API base URL
  const baseUrl = getApiBaseUrl();
  const finalUrl = baseUrl ? `${baseUrl}${filePath}` : filePath;
  console.log('✅ buildImageUrl - Default case:', filePath, '-> Final URL:', finalUrl);
  return finalUrl;
};
