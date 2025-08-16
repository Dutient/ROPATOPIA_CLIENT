import { makePublicApiCall, makeApiCall } from '../Helper/RepositoryHelper';
import type { IAuthResponse, ILoginRequest, ISignupRequest, } from '../Models/IAuth';

export class AuthenticationRepository {
  private static tokenKey: string = 'ropatopia_token';

   // Get access token
  static getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null;
  }

  // Store tokens in localStorage
  private static storeTokens(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Clear tokens from localStorage
  private static clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Login user
  static async login(credentials: ILoginRequest): Promise<IAuthResponse> {
    try {
      // Create form data for login endpoint
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await makePublicApiCall(`/auth/jwt/login`, {
        method: 'POST',
        body: formData,
      });

      // Check if response has content before trying to parse JSON
      const responseText = await response.text();
      let data: IAuthResponse;
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (response.ok && data.access_token) {
        this.storeTokens(data.access_token);
        return data;
      } else {
        // Provide more specific error messages based on status codes
        if (response.status === 401 || response.status === 400) {
          throw new Error('Wrong username or password');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 0) {
          throw new Error('Network error. Please check your connection and try again.');
        } else {
          throw new Error(response.statusText || 'Login failed');
        }
      }
    } catch (error) {
      // If it's already a specific error message, re-throw it
      if (error instanceof Error && !error.message.includes('Login failed')) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await makeApiCall(`/auth/jwt/logout`, {
        method: 'POST',
      }, true); // requireAuth: true

      this.clearTokens();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Logout failed');
    }
  }

  // Sign up user
  static async signup(userData: ISignupRequest): Promise<boolean> {
    try {
      const response = await makePublicApiCall(`/auth/register`, {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        return true;
      } else {
        // Provide more specific error messages based on status codes
        if (response.status === 400) {
          throw new Error('Invalid signup data. Please check your information.');
        } else if (response.status === 409) {
          throw new Error('User already exists with this email.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 0) {
          throw new Error('Network error. Please check your connection and try again.');
        } else {
          throw new Error(response.statusText || 'Signup failed');
        }
      }
    } catch (error) {
      // If it's already a specific error message, re-throw it
      if (error instanceof Error && !error.message.includes('Signup failed')) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // Get current user
  // static getCurrentUser(): IUser | null {
  //   const userStr = localStorage.getItem(this.userKey);
  //   if (userStr) {
  //     try {
  //       return JSON.parse(userStr);
  //     } catch {
  //       return null;
  //     }
  //   }
  //   return null;
  // }

  // Store user data in localStorage
  // private static storeUser(user: IUser): void {
  //   localStorage.setItem(this.userKey, JSON.stringify(user));
  // }

  // Clear user data from localStorage
  // private static clearUser(): void {
  //   localStorage.removeItem(this.userKey);
  // }
}