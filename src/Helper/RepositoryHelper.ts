// Generic API call function that can be used across all repositories
export async function makeApiCall(
  endpoint: string, 
  options: RequestInit = {}, 
  requireAuth: boolean
): Promise<Response> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}${endpoint}`;
  
  // Get JWT token from localStorage if authentication is required
  let authHeaders: Record<string, string> = {};
  if (requireAuth) {
    const token = localStorage.getItem('ropatopia_token');
    if (token) {
      authHeaders = {
        'Authorization': `Bearer ${token}`,
      };
    }
  }
  
  // Build headers object
  const headers: Record<string, string> = {};
  
  // Add custom headers from options if they exist
  if (options.headers) {
    if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
      Object.assign(headers, options.headers);
    }
  }
  
  // Add auth headers last to ensure they take precedence
  Object.assign(headers, authHeaders);
  
  // Only add Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const defaultOptions: RequestInit = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Don't throw error here - let the calling function handle specific status codes
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Helper function for public endpoints (no auth required)
export async function makePublicApiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  return makeApiCall(endpoint, options, false);
} 