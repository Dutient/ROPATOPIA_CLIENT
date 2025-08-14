import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import HomePage from '../Pages/HomePage/HomePage';
import LoginPage from '../Pages/LoginPage/LoginPage';
import ClaudeGeneratePage from '../Pages/ClaudeGeneratePage/ClaudeGeneratePage';
import UploadPage from '../Pages/UploadPage/UploadPage';
import AcitivityPage from '../Pages/ActivityPage/ActivityPage';
import QuestionairePage from '../Pages/QuestionairePage/QuestionairePage';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show minimal loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};


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
      <Route path="/claude-generate" element={
        <ProtectedRoute>
          <ClaudeGeneratePage />
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
