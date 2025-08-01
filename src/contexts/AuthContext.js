// Replace your src/contexts/AuthContext.js with this fixed version
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Define logout function first so it can be used in checkAuth
  const logout = useCallback(() => {
    Cookies.remove('token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Use useCallback to memoize the checkAuth function
  const checkAuth = useCallback(async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const userData = await authAPI.verifyToken();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, token } = response;
      Cookies.set('token', token, { expires: 7 });
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token } = response;
      Cookies.set('token', token, { expires: 7 });
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};