"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from "@/services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState({
    freelancer: false,
    client: false,
    active: 'client',
    freelancerData: null,
    clientData: null,
  });
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/me`, {
        credentials: 'include'
      });
      if (!res.ok) {
        setUser(null);
        setRole({
          freelancer: false,
          client: false,
          active: 'client',
          freelancerData: null,
          clientData: null,
        });
        setUserData(null);
        return;
      }

      const data = await res.json();
      if (data.success) {
        const currentUser = data.data;
        setUser(currentUser);

        const roleData = {
          freelancer: !!currentUser.freelancer,
          client: !!currentUser.client,
          active: 'client',
          freelancerData: currentUser.freelancer,
          clientData: currentUser.client,
        };

        if (roleData.freelancer && !roleData.client) {
          roleData.active = 'freelancer';
          setUserData(roleData.freelancerData);
        } else if (!roleData.freelancer && roleData.client) {
          roleData.active = 'client';
          setUserData(roleData.clientData);
        } else {
          // User has both or neither; default to client profile data if available
          setUserData(roleData.clientData || roleData.freelancerData);
        }
        setRole(roleData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Switch the active role for dual-role users
  const switchRole = (newRole) => {
    if (newRole === 'freelancer' && role.freelancerData) {
      setRole(prev => ({ ...prev, active: 'freelancer' }));
      setUserData(role.freelancerData);
    } else if (newRole === 'client' && role.clientData) {
      setRole(prev => ({ ...prev, active: 'client' }));
      setUserData(role.clientData);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      await fetchUser();
      return data;
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setRole({
        freelancer: false,
        client: false,
        active: 'client',
        freelancerData: null,
        clientData: null,
      });
      setUserData(null);
      router.push('/sign-in');
    } catch (err) {
      setError(err.message);
    }
  };

  const register = async (email, password, name, type = 'client') => {
    try {
      const endpoint = type === 'freelancer' ? '/api/auth/register/freelancer' : '/api/auth/register/client';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName: name }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        role,
        userData,
        setRole,
        switchRole,
        login,
        logout,
        register,
        fetchUser,
        setError,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
