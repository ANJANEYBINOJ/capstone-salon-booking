/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // start true while hydrating

  // 🔄 Hydrate from cookie on initial load/refresh
  useEffect(() => {
    (async () => {
      try {
        const data = await Auth.me();
        setUser({ id: data.id, role: data.role, name: data.name, email: data.email });
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await Auth.login({ email, password });
      setUser({ id: data.id, role: data.role, name: data.name, email });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await Auth.register({ name, email, password });
      return await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await Auth.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const value = { user, setUser, login, register, logout, loading, isAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
