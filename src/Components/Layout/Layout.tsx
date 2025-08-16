import React, { useState } from 'react';
import { SessionsList, UploadPopup, CommonPopup, ActivityPopup } from '../index';
import './Styles.css';
import HomePage from '../../Pages/HomePage/HomePage';
import QuestionairePage from '../../Pages/QuestionairePage/QuestionairePage';



const Layout: React.FC = () => {
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showActivityPopup, setShowActivityPopup] = useState(false);
  const [batchId, setBatchId] = useState("");

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleUploadClick = (batchId: string) => {
    setBatchId(batchId);
    setShowUploadPopup(false);
    setShowActivityPopup(true);
  };

  const handleActivitySelect = (session_id: string) => {
    setSelectedSessionId(session_id);
    setShowActivityPopup(false);
  };

  return (
    <div className="layout">
      <SessionsList
        selectedSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
        onUploadClick={() => setShowUploadPopup(true)}
      />
      
      <div className="main-content with-sidebar">
        {selectedSessionId ? <QuestionairePage sessionId={selectedSessionId}/> : <HomePage />}
      </div>

      <CommonPopup
        isOpen={showUploadPopup}
        onClose={() => setShowUploadPopup(false)}
        popupType="upload"
        title="Upload ROPA"
      >
        <UploadPopup
          onUploadClick={handleUploadClick}
        />
      </CommonPopup>

      <CommonPopup
        isOpen={showActivityPopup}
        onClose={() => setShowActivityPopup(false)}
        popupType="activity"
        title="Processing Activities"
      >
        <ActivityPopup
          batchId={batchId}
          onNext={handleActivitySelect}
        />
      </CommonPopup>
      
    </div>
  );
};

export default Layout;
