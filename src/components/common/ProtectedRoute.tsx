import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, redirectTo }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  // If redirectTo is provided, it means this is a public route (login/register)
  // that should redirect to dashboard if user is already authenticated
  if (redirectTo) {
    return isAuthenticated ? <Navigate to={redirectTo} replace /> : <>{children}</>;
  }

  // For protected routes (dashboard, student detail, etc.)
  // redirect to login if not authenticated
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}; 