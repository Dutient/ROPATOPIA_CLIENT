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
  const [company_name, setCompany_name] = useState("");
  const [trigger, setTrigger] = useState(false); // State to trigger refresh in SessionsList

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleUploadClick = (batchId: string, company_name: string) => {
    setBatchId(batchId);
    setShowUploadPopup(false);
    setShowActivityPopup(true);
    setCompany_name(company_name);
  };

  const handleActivitySelect = (session_id: string) => {
    setShowActivityPopup(false);
    setSelectedSessionId(session_id);
    setTrigger(!trigger);
  };

  return (
    <div className="layout">
      <SessionsList
        selectedSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
        onUploadClick={() => setShowUploadPopup(true)}
        refreshTrigger={trigger}
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
          companyName={company_name}
          onNext={handleActivitySelect}
        />
      </CommonPopup>
      
    </div>
  );
};

export default Layout;
