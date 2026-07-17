// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Contacts = lazy(() => import('../pages/Contacts'));
const TransactionHistory = lazy(() => import('../pages/TransactionHistory'));
const Wallet = lazy(() => import('../pages/Wallet'));
const Profile = lazy(() => import('../pages/Profile'));
const Notifications = lazy(() => import('../pages/Notifications'));
const MoneyTransfer = lazy(() => import('../pages/transfer/MoneyTransfer'));

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const VerifyOtp = lazy(() => import('../pages/auth/VerifyOtp'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Universal Page Loader fallback
const PageLoader = () => (
  <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center bg-base-100 text-primary">
    <div className="flex flex-col items-center gap-4">
      <span className="loading loading-ring loading-lg text-secondary"></span>
      <span className="text-sm font-semibold tracking-wider animate-pulse text-base-content/75">Loading Page...</span>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Guest Routes (Auth Pages) */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* Protected Routes (Authenticated Panel) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transfer" element={<MoneyTransfer />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
