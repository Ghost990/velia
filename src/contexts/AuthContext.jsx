import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devAdminMode, setDevAdminMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!devAdminMode) {
        setUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [devAdminMode]);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (devAdminMode) {
        setDevAdminMode(false);
        setUser(null);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      throw error;
    }
  };

  // Development admin bypass - no authentication required
  const loginAsDevAdmin = () => {
    setDevAdminMode(true);
    setUser({
      email: 'dev-admin@wedding.com',
      uid: 'dev-admin-uid',
      displayName: 'Development Admin'
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    loginAsDevAdmin,
    isAdmin: user?.email === 'admin@wedding.com' || user?.email === 'dev-admin@wedding.com' // Simple admin check
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};