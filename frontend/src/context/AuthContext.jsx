import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Optional: Verify token by hitting profile endpoint
          const { data } = await api.get('/auth/profile');
          // Update profile with fresh database values but retain the token
          const freshUser = { ...parsedUser, ...data };
          setUser(freshUser);
          localStorage.setItem('userInfo', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Session verification failed, logging out:', error);
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const requestPasswordReset = async (email) => {
    try {
      const { data } = await api.post('/auth/forgotpassword', { email });
      return data.message;
    } catch (error) {
      throw error.response?.data?.message || 'Password reset request failed';
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
      return data.message;
    } catch (error) {
      throw error.response?.data?.message || 'Password reset failed';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
