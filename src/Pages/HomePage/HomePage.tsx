import React from 'react';
import './Styles.css';

const HomePage: React.FC = () => {
  
  const handleRedirectToRopaTemplate = () => {
    window.open('/ropatemplate', '_blank');
  };

  return (
    <>
      <div className="homepage">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to
              <br className="hero-break" />
              <span className="hero-title2">ROPAtoPIA</span>
            </h1>

            <p className="hero-subtitle">
              Your AI-powered platform for intelligent content generation and analysis
            </p>

            <div className="hero-buttons">
              <button 
                className="cta-button secondary" 
                onClick={handleRedirectToRopaTemplate}
              >
                Go to ROPA Template
                <span className="triangle-arrow"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      
    </>
  );
};

export default HomePage; 