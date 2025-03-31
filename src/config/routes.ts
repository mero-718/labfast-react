import { RouteObject } from 'react-router-dom';
import React from 'react';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotFound from '../pages/NotFound';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: React.createElement(ProtectedRoute, { redirectTo: '/dashboard' },
      React.createElement(LoginPage)
    ),
  },
  {
    path: '/register',
    element: React.createElement(ProtectedRoute, { redirectTo: '/dashboard' },
      React.createElement(RegisterPage)
    ),
  },
  {
    path: '/dashboard',
    element: React.createElement(ProtectedRoute, null,
      React.createElement(DashboardPage)
    ),
  },
  {
    path: '/student/:id',
    element: React.createElement(ProtectedRoute, null,
      React.createElement(ProfilePage)
    ),
  },
  {
    path: '/',
    element: React.createElement(ProtectedRoute, null,
      React.createElement(() => {
        const { isAuthenticated } = useAuth();
        return React.createElement(Navigate, { to: isAuthenticated ? '/dashboard' : '/login', replace: true });
      })
    ),
  },
  {
    path: '*',
    element: React.createElement(NotFound),
  },
]; 