import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../Pages/HomePage/HomePage';
import LoginPage from '../Pages/LoginPage/LoginPage';
import UploadPage from '../Pages/UploadPage/UploadPage';
import AcitivityPage from '../Pages/ActivityPage/ActivityPage';
import QuestionairePage from '../Pages/QuestionairePage/QuestionairePage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      
      {/* Public route - login/signup page */}
      <Route path="/login" element={
        <LoginPage />
      } />
      
      {/* Protected routes - require authentication */}
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/upload" element={
        <ProtectedRoute>
          <UploadPage />
        </ProtectedRoute>
      } />
      <Route path="/activity" element={
        <ProtectedRoute>
          <AcitivityPage />
        </ProtectedRoute>
      } />
      <Route path="/questionaire" element={
        <ProtectedRoute>
          <QuestionairePage />
        </ProtectedRoute>
      } />
      
      {/* Redirect root to login if not authenticated, or to home if authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
