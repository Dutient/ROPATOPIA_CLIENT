import React, { useState, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import type { ILoginRequest, ISignupRequest } from '../../Models/IAuth';
import './Styles.css';
import Spinner from '../../Components/Spinner/Spinner';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
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

  useLayoutEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    }
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
      return false;
    }
  };

  const validateForm = (): boolean => {

    // Email validation for signup
    if (!isLogin && !formData.email) {
      setValidationErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    } else if (!isLogin && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return false;
    } else if (!isLogin && formData.email && !formData.email.endsWith('@dutient.ai')) {
      setValidationErrors(prev => ({ ...prev, email: 'User must be a part of the Organization' }));
      return false;
    }

    // Username validation for login
    if (isLogin && !formData.username) {
      setValidationErrors(prev => ({ ...prev, username: 'Username is required' }));
      return false;
    } else if (formData.username && !formData.username.endsWith('@dutient.ai')) {
      setValidationErrors(prev => ({ ...prev, username: 'User must be a part of the Organization' }));
      return false;
    }

    // Password validation
    if (!formData.password) {
      setValidationErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    } else if (formData.password.length < 8) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters long' }));
      return false;
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must contain at least one lowercase letter' }));
      return false;
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must contain at least one uppercase letter' }));
      return false;
    }

    // Additional validation for signup
    if (!isLogin) {
      if (!formData.name) {
        setValidationErrors(prev => ({ ...prev, name: 'Full name is required' }));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages only if form validation passes
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    // Don't clear error/success immediately - let them persist during loading

    try {
      // Clear previous messages before attempting login/signup
      setSuccess('');
      
      if (isLogin) {
        await login(formData.username, formData.password);
        setSuccess('Login successful! Redirecting...');
        
        // Navigate to home page after a brief delay to show success message
        setTimeout(() => {
          navigate('/');
        }, 3000);

      } else {
        if (formData.email && formData.name) {
          await signup(formData.email, formData.password, formData.name);
          setSuccess('Account created successfully! You can now login.');
          
          // Switch to login mode after successful signup
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ username: '', name: '', email: formData.email, password: '' });
            setSuccess('');
          }, 3000);
        }
      }
    } catch (err) {
      // Use the specific error messages from the repository
      console.log('Error during authentication:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', name: '', email: '', password: '' });
    setValidationErrors({});
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

          <button
            type="submit"
            className="sign-in-btn"
            disabled={loading}
          >
             {loading ? (
               <Spinner size={24} />
             ) : (
               isLogin ? 'Sign In' : 'Create Account'
             )}
           </button>

           {success && <div className="success-alert">{success}</div>}
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
