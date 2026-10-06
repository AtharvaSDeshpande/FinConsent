import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('finconsent_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('finconsent_token') || null);
  const [loading, setLoading] = useState(false);

  const login = (authToken, userData) => {
    localStorage.setItem('finconsent_token', authToken);
    localStorage.setItem('finconsent_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const loginWithGoogle = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Google authentication failed');
      }
      login(data.token, data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('finconsent_token');
    localStorage.removeItem('finconsent_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('finconsent_user', JSON.stringify(updated));
      return updated;
    });
  };

  const role = user?.role || 'ria';
  const isRia = role === 'ria';
  const isComplianceOfficer = role === 'compliance_officer';
  const isAdmin = role === 'admin';
  const isClient = role === 'client';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isRia,
        isComplianceOfficer,
        isAdmin,
        isClient,
        login,
        loginWithGoogle,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
