import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../security/AuthContext.jsx';
import { ClientDashboard } from '../dashboard/ClientDashboard.jsx';
import { ComplianceDashboard } from '../dashboard/ComplianceDashboard.jsx';
import { AdminDashboard } from '../dashboard/AdminDashboard.jsx';
import { RiaDashboard } from '../dashboard/RiaDashboard.jsx';
import { GuestDashboard } from '../dashboard/GuestDashboard.jsx';

export const DashboardPage = () => {
  const { user, isGuest, isClient, isComplianceOfficer, isRia, isAdmin } = useAuth();

  const {
    data: mandates = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['mandates'],
    queryFn: async () => {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch('/api/mandates?status=all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch mandates');
      }
      return data.data;
    },
    staleTime: 1000 * 60,
    // Do not run query if guest has no token
    enabled: !isGuest,
  });

  if (isGuest) {
    return <GuestDashboard />;
  }

  if (isClient) {
    return (
      <ClientDashboard
        user={user}
        mandates={mandates}
        loading={loading}
        error={queryError?.message}
      />
    );
  }

  if (isComplianceOfficer) {
    return (
      <ComplianceDashboard
        user={user}
        mandates={mandates}
        loading={loading}
        error={queryError?.message}
      />
    );
  }

  if (isAdmin) {
    return (
      <AdminDashboard
        user={user}
        mandates={mandates}
        loading={loading}
        error={queryError?.message}
      />
    );
  }

  // Default to RIA dashboard for advisers & default authenticated users
  return (
    <RiaDashboard
      user={user}
      mandates={mandates}
      loading={loading}
      error={queryError?.message}
    />
  );
};

export default DashboardPage;
