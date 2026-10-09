import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/index.js';
import { ProtectedRoute } from '../security/index.js';
import { LoginPage, RegisterPage } from '../features/auth/index.js';
import { LandingPage } from '../features/landing/index.js';
import { DashboardPage, MandateNewPage, MandateDetailPage } from '../features/mandate-builder/index.js';
import { ClientsPage } from '../features/clients/index.js';
import { RequestComposerPage } from '../features/requests/index.js';
import { ProfilePage } from '../features/ria-profile/index.js';
import { BillingPage } from '../features/billing-pro/index.js';
import { ClientReviewPage, ClientReceiptPage } from '../features/client-review/index.js';
import { PrivacyPolicyPage, TermsOfServicePage, RefundPolicyPage } from '../features/legal-compliance/index.js';
import { useAuth } from '../security/index.js';

export const AppRoutes = () => {
  return (
    <AppLayout>
      <Routes>
        {/* Public & Landing Page */}
        <Route path="/" element={<LandingPage />} />
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

        {/* Authenticated Workspace with RBAC Role Enforcement */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestComposerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <RequestComposerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mandates/new"
          element={
            <ProtectedRoute allowedRoles={['ria', 'admin']}>
              <MandateNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mandates/:id"
          element={
            <ProtectedRoute allowedRoles={['ria', 'compliance_officer', 'admin', 'client']}>
              <MandateDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={['ria', 'admin', 'compliance_officer']}>
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
            <ProtectedRoute allowedRoles={['ria', 'admin']}>
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
