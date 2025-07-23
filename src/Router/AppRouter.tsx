import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../Pages/HomePage/HomePage';
import ClaudeGeneratePage from '../Pages/ClaudeGeneratePage/ClaudeGeneratePage';
import UploadPage from '../Pages/UploadPage/UploadPage';
import AcitivityPage from '../Pages/ActivityPage/ActivityPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/claude-generate" element={<ClaudeGeneratePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/activity" element={<AcitivityPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
