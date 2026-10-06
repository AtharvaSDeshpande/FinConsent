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

  const loginWithGoogle = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          throw new Error(`Failed to parse authentication response: ${jsonErr.message}`);
        }
      } else {
        const text = await res.text();
        const cleanMsg = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
        throw new Error(cleanMsg || `Backend returned status ${res.status}. Please ensure backend is running.`);
      }

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
    setUser(GUEST_USER);
  };

  const resetToGuest = () => {
    logout();
  };

  const switchPersona = async (target) => {
    if (target === 'guest' || target === 'guest@finconsent.in') {
      resetToGuest();
      return GUEST_USER;
    }

    const persona = ESTABLISHED_PERSONAS.find(
      (p) => p.email === target || p.role === target
    );

    if (!persona || !persona.password) {
      resetToGuest();
      return GUEST_USER;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: persona.email, password: persona.password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.token, data.user);
        return data.user;
      }
      throw new Error(data.error || 'Failed to authenticate persona');
    } finally {
      setLoading(false);
    }
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
        loginWithGoogle,
        logout,
        resetToGuest,
        switchPersona,
        updateUser,
        loading,
        roles: ROLES,
        personas: ESTABLISHED_PERSONAS,
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
