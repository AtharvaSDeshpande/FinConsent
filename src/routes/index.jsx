import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/index.js';
import { ProtectedRoute } from '../security/index.js';
import { LoginPage, RegisterPage } from '../features/auth/index.js';
import { DashboardPage, MandateNewPage, MandateDetailPage } from '../features/mandate-builder/index.js';
import { ClientsPage } from '../features/clients/index.js';
import { ProfilePage } from '../features/ria-profile/index.js';
import { BillingPage } from '../features/billing-pro/index.js';
import { ClientReviewPage, ClientReceiptPage } from '../features/client-review/index.js';
import { PrivacyPolicyPage, TermsOfServicePage, RefundPolicyPage } from '../features/legal-compliance/index.js';
import { useAuth } from '../security/index.js';

const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export const AppRoutes = () => {
  return (
    <AppLayout>
      <Routes>
        {/* Public & Authentication */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client Review Portal (Zero Login, Token Guarded) */}
        <Route path="/m/:token" element={<ClientReviewPage />} />
        <Route path="/m/:token/verify" element={<ClientReviewPage />} />
        <Route path="/m/:token/receipt" element={<ClientReceiptPage />} />

        {/* Statutory Legal Disclosures */}
        <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/legal/terms" element={<TermsOfServicePage />} />
        <Route path="/legal/refund" element={<RefundPolicyPage />} />

        {/* Authenticated RIA Workspace */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mandates/new"
          element={
            <ProtectedRoute>
              <MandateNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mandates/:id"
          element={
            <ProtectedRoute>
              <MandateDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};
