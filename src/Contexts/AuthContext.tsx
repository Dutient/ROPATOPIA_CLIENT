import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthenticationRepository } from '../Repositories/AuthenticationRepository';
import type { IAuthState } from '../Models/IAuth';

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'SIGNUP_SUCCESS' }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: IAuthState = {
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
};

// Reducer function
const authReducer = (state: IAuthState, action: AuthAction): IAuthState => {
  switch (action.type) {
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
      }
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context interface
interface AuthContextType extends IAuthState {
  login: (username: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = AuthenticationRepository.getAccessToken();

      if (token) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token },
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await AuthenticationRepository.login({ username, password });
      
      if (response.access_token) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token: response.access_token
          },
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await AuthenticationRepository.signup({
        email,
        name,
        password,
      });
      
      if (response) {
        dispatch({ type: 'SIGNUP_SUCCESS'})
        return response;
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Signup failed',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async() => {
    await AuthenticationRepository.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
