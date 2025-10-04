import { useState } from "react";
import { CommonPopup, SessionsList } from "../../Components";
import RopaQuestionairePage from "./Questionaire/RopaQuestionairePage";
import PreliminaryQuestionPopup from "./Popup/PreliminaryQuestionPopup";
import HomePage from "../HomePage/HomePage";


const RopaTemplatePage: React.FC = () => {
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const [showPreliminaryQuestionPopup, setShowPreliminaryQuestionPopup] = useState(false);
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };
  const [trigger, setTrigger] = useState(false); // State to trigger refresh in SessionsList

  const handlePreliminaryQuestionSelect = (session_id: string) => {
    setShowPreliminaryQuestionPopup(false);
    setSelectedSessionId(session_id);
    setTrigger(!trigger);
  };


  return (
    <div className="layout">
      <SessionsList
        selectedSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
        onUploadClick={() => setShowPreliminaryQuestionPopup(true)}
        refreshTrigger={trigger}
      />
      
      <div className="main-content with-sidebar">
        {selectedSessionId ? <RopaQuestionairePage sessionId={selectedSessionId} /> : <HomePage />}
      </div>

      <CommonPopup
        isOpen={showPreliminaryQuestionPopup}
        onClose={() => setShowPreliminaryQuestionPopup(false)}
        popupType="Create ROPA"
        title="Create ROPA"
      >
        <PreliminaryQuestionPopup 
          onNext={handlePreliminaryQuestionSelect}
        />
      </CommonPopup>
      
    </div>
  );
};

export default RopaTemplatePage;
