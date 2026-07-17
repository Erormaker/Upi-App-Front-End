// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { setCookie, getCookie, eraseCookie } from '../utils/cookies';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check user session on mount
  const checkSession = async () => {
    const token = getCookie('payflow_token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      eraseCookie('payflow_token');
      eraseCookie('payflow_refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Listen to response interceptor logout triggers to clear session cleanly
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setIsAuthenticated(false);
      eraseCookie('payflow_token');
      eraseCookie('payflow_refresh_token');
      toast.error('Session expired. Please log in again.');
    };
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, refreshToken } = response.data;
      
      // Store in cookies
      setCookie('payflow_token', accessToken, 1); // 1 day
      setCookie('payflow_refresh_token', refreshToken, 7); // 7 days
      
      // Fetch full profile immediately
      const profileResponse = await api.get('/users/profile');
      const userProfile = profileResponse.data;
      
      setUser(userProfile);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${userProfile.fullName || username}!`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (username, password, email, phoneNumber, fullName) => {
    try {
      const response = await api.post('/auth/register', { 
        username, 
        password, 
        email, 
        phoneNumber, 
        fullName 
      });
      toast.success('Registration successful! Please verify your email.');
      return response.data;
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Registration failed.';
      if (data) {
        if (typeof data === 'string') {
          msg = data;
        } else if (data.message) {
          msg = data.message;
        } else if (data.errors && Array.isArray(data.errors)) {
          msg = data.errors.map(e => e.defaultMessage || e.message || e).join(', ');
        } else if (typeof data === 'object') {
          // Spring Boot validation errors may return {field: "message"} format
          const fieldErrors = Object.values(data).filter(v => typeof v === 'string');
          if (fieldErrors.length > 0) msg = fieldErrors.join(', ');
        }
      }
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getCookie('payflow_refresh_token');
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.warn('Backend logout call skipped or failed:', err.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      eraseCookie('payflow_token');
      eraseCookie('payflow_refresh_token');
      toast.success('Logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isLoading, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
