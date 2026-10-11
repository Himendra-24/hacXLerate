import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'creator' | 'brand' | 'admin'>;
  fallbackLoginPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackLoginPath,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Verifying UNFRAME session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Determine the most appropriate login page based on role requirements
    let targetLogin = fallbackLoginPath;
    if (!targetLogin) {
      if (allowedRoles && allowedRoles.includes('creator') && !allowedRoles.includes('brand')) {
        targetLogin = '/creator/login';
      } else if (allowedRoles && allowedRoles.includes('brand') && !allowedRoles.includes('creator')) {
        targetLogin = '/organization/login';
      } else if (location.pathname.startsWith('/creator') || location.pathname === '/studio' || location.pathname === '/opportunities') {
        targetLogin = '/creator/login';
      } else if (location.pathname.startsWith('/organization') || location.pathname.startsWith('/brand') || location.pathname === '/shortlist' || location.pathname === '/brief-builder') {
        targetLogin = '/organization/login';
      } else {
        targetLogin = '/creator/login';
      }
    }

    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // If role is specified and current user's role is not authorized:
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    // Segregate Creator and Organization access
    if (user.role === 'creator') {
      return <Navigate to="/creator/dashboard" replace />;
    } else if (user.role === 'brand') {
      return <Navigate to="/organization/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
