"use client";

import { Query } from 'appwrite';
import { appwriteConfig } from './appwrite_config';
import { databases } from './appwrite_config';
import { account } from './appwrite_config';
import React, { createContext, useContext, useState } from 'react';

// Create Context
const AuthContext = createContext();

// AuthProvider Component
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

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const session = await account.createEmailPasswordSession(email, password);
      fetchUser(); // Fetch user data after successful login
      return session;
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch current user data
  const fetchUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);

      const responseF = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.freelancerCollectionId,
        [Query.equal('email', currentUser.email)],
      );

      const responseC = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.clientCollectionId,
        [Query.equal('email', currentUser.email)],
      );

      const roleData = {
        freelancer: false,
        client: false,
        active: 'client',
        freelancerData: null,
        clientData: null,
      };

      if (responseF.documents.length > 0) {
        roleData.freelancer = true;
        roleData.freelancerData = responseF.documents[0];
      }
      if (responseC.documents.length > 0) {
        roleData.client = true;
        roleData.clientData = responseC.documents[0];
      }

      // Auto Set Role if only one role is present
      if (roleData.freelancer && !roleData.client) {
        roleData.active = 'freelancer';
        setUserData(roleData.freelancerData);
      } else if (!roleData.freelancer && roleData.client) {
        roleData.active = 'client';
        setUserData(roleData.clientData);
      }



      setRole(roleData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, name) => {
    try {
      setError(null);
      const newUser = await account.create('unique()', email, password, name);
      return newUser;
    } catch (err) {
      setError(err.message);
    }
  };

  // Automatically fetch user on load
  React.useEffect(() => {
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
        login,
        logout,
        register,
        fetchUser,
        setError
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
