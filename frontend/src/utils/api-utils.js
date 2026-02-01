/**
 * Runtime API URL detection
 * Works both in development and production
 */
export const getApiUrl = () => {
  // If VITE_API_URL is set (during build with env vars)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Runtime detection: use window.location for production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // On production, use current domain with /api path
    return `https://${window.location.hostname}/api`
  }
  
  // Development fallback
  return 'http://127.0.0.1:8000/api'
}
