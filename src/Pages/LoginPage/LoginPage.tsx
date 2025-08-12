import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import type { ILoginRequest, ISignupRequest } from '../../Models/IAuth';
import './Styles.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form states
  const [formData, setFormData] = useState<ILoginRequest & Partial<ISignupRequest>>({
    username: '',
    email: '',
    password: '',
    name: '',
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation for signup
    if (!isLogin && !formData.email) {
      errors.email = 'Email is required';
    } else if (!isLogin && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Username validation for login
    if (isLogin && !formData.username) {
      errors.username = 'Username is required';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    }

    // Additional validation for signup
    if (!isLogin) {
      if (!formData.name) {
        errors.name = 'Full name is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        setSuccess('Login successful! Redirecting...');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        if (formData.email && formData.name) {
          await signup(formData.email, formData.password, formData.name);
          setSuccess('Account created successfully! You can now login.');
          
          // Switch to login mode after successful signup
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ username: '', name: '', email: formData.email, password: '' });
            setSuccess('');
          }, 2000);
        }
      }
    } catch (err) {
      // Use the specific error messages from the repository
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', name: '', email: '', password: '' });
    setValidationErrors({});
    setError('');
    setSuccess('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome to Ropatopia</h1>
          <p>{isLogin ? 'Sign in to your account' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={validationErrors.name ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {validationErrors.name && (
                <span className="error-message">{validationErrors.name}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor={isLogin ? "username" : "email"}>
              {isLogin ? "Username" : "Email"}
            </label>
            <input
              type={isLogin ? "text" : "email"}
              id={isLogin ? "username" : "email"}
              name={isLogin ? "username" : "email"}
              value={isLogin ? formData.username : formData.email}
              onChange={handleInputChange}
              className={validationErrors[isLogin ? "username" : "email"] ? 'error' : ''}
              placeholder={isLogin ? "Enter your username" : "Enter your email address"}
            />
            {validationErrors[isLogin ? "username" : "email"] && (
              <span className="error-message">{validationErrors[isLogin ? "username" : "email"]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={validationErrors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>



          {error && <div className="error-alert">{error}</div>}
          {success && <div className="success-alert">{success}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
