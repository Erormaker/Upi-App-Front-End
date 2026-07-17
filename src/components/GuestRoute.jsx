// src/components/GuestRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = () => {
  const auth = useAuth();
  console.log('[DEBUG] GuestRoute auth value:', auth);

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 text-error p-6 text-center">
        <div>
          <h2 className="text-xl font-bold">Authentication Provider Missing</h2>
          <p className="text-sm opacity-75 mt-2">The AuthContext is undefined. Please verify the AuthProvider wrapping in main.jsx.</p>
        </div>
      </div>
    );
  }

  const { isAuthenticated, isLoading } = auth;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 text-primary">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-ring loading-lg text-secondary"></span>
          <span className="text-sm font-semibold tracking-wider animate-pulse">Loading PayFlow...</span>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default GuestRoute;
