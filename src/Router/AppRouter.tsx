import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import LoginPage from '../Pages/LoginPage/LoginPage';
import { Layout } from '../Components';
import RopaTemplatePage from '../Pages/RopaTemplate/RopaTemplatePage';

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
          <Layout />
        </ProtectedRoute>
      } />
      
      <Route path="/ropatemplate" element={
        <ProtectedRoute>
          <RopaTemplatePage />
        </ProtectedRoute>
      } />
      
      {/* Redirect root to login if not authenticated, or to home if authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
