import React from 'react';
import { Link } from 'react-router-dom';
import './Styles.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Ropatopia</h1>
          <p className="hero-subtitle">
            Your AI-powered platform for intelligent content generation and analysis
          </p>
          <div className="hero-buttons">
            <Link to="/claude-generate" className="cta-button primary">
              Start Generating
            </Link>
            <Link to="/upload" className="cta-button secondary">
              Upload Files
            </Link>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Content Generation</h3>
              <p>Generate high-quality content using Claude AI technology</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Efficient</h3>
              <p>Quick responses and streamlined workflows</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your data is protected with enterprise-grade security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 