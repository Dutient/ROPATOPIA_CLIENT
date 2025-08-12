// Generic API call function that can be used across all repositories
export async function makeApiCall(
  endpoint: string, 
  options: RequestInit = {}, 
  requireAuth: boolean
): Promise<Response> {
  // const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const baseUrl = 'http://localhost:8000';
  const url = `${baseUrl}${endpoint}`;
  
  // Get JWT token from localStorage if authentication is required
  let authHeaders = {};
  if (requireAuth) {
    const token = localStorage.getItem('ropatopia_token');
    if (token) {
      authHeaders = {
        'Authorization': `Bearer ${token}`,
      };
    }
  }
  
  const defaultOptions: RequestInit = {
    headers: {
      // Only set Content-Type for JSON, let FormData use its default
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401 && requireAuth) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('ropatopia_token');
      localStorage.removeItem('ropatopia_refresh_token');
      localStorage.removeItem('ropatopia_user');
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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