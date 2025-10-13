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
              <span className="hero-title2">DUTIENT</span>
            </h1>

            <p className="hero-subtitle">
              Your AI-powered platform for intelligent content generation and analysis
            </p>
          </div>
        </div>
      </div>
      
      
    </>
  );
};

export default HomePage; 