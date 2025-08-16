import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../Components';
import './Styles.css';

const HomePage: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  return (
    <Layout
      selectedSessionId={selectedSessionId}
      onSessionSelect={handleSessionSelect}
    >
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
              <Link to="/upload" className="cta-button secondary">
                UPLOAD FILES<span className="triangle-arrow"></span>
              </Link>
            </div>
          </div>
        </div>

        {selectedSessionId && (
          <div className="session-info-section">
            <div className="session-info-card">
              <h2>Active Session</h2>
              <p>You are currently working with: <strong>{selectedSessionId}</strong></p>
              <div className="session-actions">
                <Link to="/questionaire" className="session-action-btn">
                  Continue Session
                </Link>
                <Link to="/activity" className="session-action-btn">
                  View Activity
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage; 