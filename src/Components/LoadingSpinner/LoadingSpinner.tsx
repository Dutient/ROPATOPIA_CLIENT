import React from 'react';
import './Styles.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
        <div className="loading-spinner spinner"></div>
        <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
