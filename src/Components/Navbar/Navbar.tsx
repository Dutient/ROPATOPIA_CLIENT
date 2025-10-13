import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { FaSignOutAlt, FaFileAlt } from 'react-icons/fa'; // Import logout and document icons
import './Styles.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <Link to="/">
            <h1>ROPATOPIA</h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          <a href="/ropatemplate" target="_blank" rel="noopener noreferrer" className="nav-link">
            <FaFileAlt className="nav-icon" />
            ROPA Template
          </a>
        </div>

        {/* Auth Section */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <button 
              className="logout-btn icon-logout-btn" // Updated class
              onClick={handleLogout}
            >
              <FaSignOutAlt className="logout-icon" /> Logout
            </button>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
