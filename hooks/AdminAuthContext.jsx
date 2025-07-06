"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthApi } from '@/services/api';

// Create Admin Auth Context
const AdminAuthContext = createContext();

// Admin Auth Provider Component
export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const adminData = await adminAuthApi.verifyToken(token);
        setAdmin(adminData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await adminAuthApi.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('adminToken', response.token);
      
      // Set admin data
      setAdmin({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role
      });
      
      return response;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    setError(null);
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return admin?.role === 'superadmin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!admin;
  };

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('adminToken');
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    isSuperAdmin,
    isAuthenticated,
    getToken,
    setError
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook to use admin auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
