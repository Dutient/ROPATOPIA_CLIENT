import React from 'react';
import { SessionsList } from '../index';
import './Styles.css';

interface LayoutProps {
  children: React.ReactNode;
  selectedSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  selectedSessionId,
  onSessionSelect
}) => {

  const handleSessionSelect = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    }
  };


  return (
    <div className="layout">
      <SessionsList
        selectedSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
      />
      
      <div className="main-content with-sidebar">
        {children}
      </div>
    </div>
  );
};

export default Layout;
