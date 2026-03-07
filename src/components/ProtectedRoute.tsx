import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    const loginPath = requiredRole === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (requiredRole && user.role !== requiredRole) {
    // If admin tries to access client page, maybe let them? 
    // But for now, strict check.
    // If client tries to access admin page, redirect to home.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
