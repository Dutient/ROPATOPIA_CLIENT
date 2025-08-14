export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ISignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface IAuthResponse {
  access_token: string;
  token_type: string;
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthState {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}
