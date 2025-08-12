import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import HomePage from '../Pages/HomePage/HomePage';
import LoginPage from '../Pages/LoginPage/LoginPage';
import ClaudeGeneratePage from '../Pages/ClaudeGeneratePage/ClaudeGeneratePage';
import UploadPage from '../Pages/UploadPage/UploadPage';
import AcitivityPage from '../Pages/ActivityPage/ActivityPage';
import QuestionairePage from '../Pages/QuestionairePage/QuestionairePage';
import LoadingSpinner from '../Components/LoadingSpinner/LoadingSpinner';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route component (redirects to home if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public route - login/signup page */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
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
    </Router>
  );
};

export default AppRouter;
