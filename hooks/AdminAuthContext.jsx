"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthApi } from '@/services/api';
import { useToast } from "@/components/ui/use-toast";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const verifyToken = async () => {
    const savedToken = localStorage.getItem("token");
    const savedAdmin = localStorage.getItem("adminUser");

    if (savedToken && savedAdmin) {
      try {
        setToken(savedToken);
        setAdminUser(JSON.parse(savedAdmin));
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Error parsing saved admin data:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("adminUser");
        return false;
      }
    } else {
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/verify`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const adminData = {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role
          };
          setAdminUser(adminData);
          setIsAuthenticated(true);
          localStorage.setItem("adminUser", JSON.stringify(adminData));

          if (data.data.token) {
            setToken(data.data.token);
            localStorage.setItem("token", data.data.token);
          }
          return true;
        }
      }

      // Token rejected by server — clear everything
      console.warn("Admin verify rejected, clearing session");
      setToken(null);
      setAdminUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("adminUser");
      return false;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error("Logout API call failed:", e);
    }
    setAdminUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");
    router.push("/money_plant/sign-in");
  }, [API_BASE_URL, router]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await adminAuthApi.login(email, password);
      if (data.success) {
        setAdminUser(data.data);
        setToken(data.data.token);
        setIsAuthenticated(true);
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.data));
        toast({
          title: "Login Successful",
          description: "Welcome back, Admin!",
          variant: "success",
        });
        router.push("/money_plant/notification_management");
        return true;
      } else {
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await verifyToken();
      setLoading(false);
    };
    initAuth();
  }, []);

  const getToken = useCallback(() => token || localStorage.getItem("token"), [token]);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        verifyToken,
        getToken,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export default AdminAuthContext;
