import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, GUEST_USER, ESTABLISHED_PERSONAS, getRoleDefinition } from './roles.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('finconsent_user');
      return stored ? JSON.parse(stored) : GUEST_USER;
    } catch {
      return GUEST_USER;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('finconsent_token') || null);
  const [loading, setLoading] = useState(false);

  // Sync state if localStorage changes across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('finconsent_user');
        const storedToken = localStorage.getItem('finconsent_token');
        setUser(stored ? JSON.parse(stored) : GUEST_USER);
        setToken(storedToken || null);
      } catch {
        setUser(GUEST_USER);
        setToken(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (authToken, userData) => {
    localStorage.setItem('finconsent_token', authToken);
    localStorage.setItem('finconsent_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    const currentToken = localStorage.getItem('finconsent_token');
    if (currentToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem('finconsent_token');
    localStorage.removeItem('finconsent_user');
    setToken(null);
    setUser(GUEST_USER);
  };

  const resetToGuest = () => {
    logout();
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      if (!updated.isGuest) {
        localStorage.setItem('finconsent_user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const role = user?.role || 'guest';
  const isGuest = role === 'guest' || Boolean(user?.isGuest);
  const isAuthenticated = !isGuest && Boolean(token);
  const isRia = role === 'ria';
  const isComplianceOfficer = role === 'compliance_officer';
  const isAdmin = role === 'admin';
  const isClient = role === 'client';
  const roleDef = getRoleDefinition(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        roleDef,
        isGuest,
        isAuthenticated,
        isRia,
        isComplianceOfficer,
        isAdmin,
        isClient,
        login,
        logout,
        resetToGuest,
        updateUser,
        loading,
        roles: ROLES,
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

export default AuthContext;
