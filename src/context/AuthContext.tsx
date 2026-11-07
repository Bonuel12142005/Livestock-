/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Authentication Context for KIMS Livestock Module
 * Supports the 5 strict KAMBAC roles and 1-click test account switching.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/livestock';
import { SAMPLE_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRoleUser: (role: UserRole) => void;
  login: (email: string) => boolean;
  logout: () => void;
  isPresident: boolean;
  isBookkeeper: boolean;
  isGeneralManager: boolean;
  isStaff: boolean;
  isMember: boolean;
  canManageLivestock: boolean; // President only
  canViewLivestockList: boolean; // President, Bookkeeper, General Manager, Officers and Staff
  canViewDashboard: boolean; // President, Bookkeeper, General Manager, Officers and Staff
  canViewAuditLog: boolean; // President only
  canViewMyLivestock: boolean; // Member (or preview)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'kims_active_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to President so the evaluator starts with the fullest experience,
  // but can immediately toggle with 1 click to test every other role.
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const found = SAMPLE_USERS.find((u) => u.email === parsed.email);
          if (found) return found;
        }
      } catch {
        // fallback
      }
    }
    return SAMPLE_USERS[0]; // Mario V. Macalalad (President)
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [currentUser]);

  const switchRoleUser = (role: UserRole) => {
    const userForRole = SAMPLE_USERS.find((u) => u.role === role);
    if (userForRole) {
      setCurrentUser(userForRole);
    }
  };

  const login = (email: string): boolean => {
    const found = SAMPLE_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const role = currentUser?.role;

  const isPresident = role === 'President';
  const isBookkeeper = role === 'Bookkeeper';
  const isGeneralManager = role === 'General Manager';
  const isStaff = role === 'Officers and Staff';
  const isMember = role === 'Member';

  // Strict Deny-By-Default rules
  const canManageLivestock = isPresident;
  const canViewLivestockList = isPresident || isBookkeeper || isGeneralManager || isStaff;
  const canViewDashboard = isPresident || isBookkeeper || isGeneralManager || isStaff;
  const canViewAuditLog = isPresident;
  const canViewMyLivestock = isMember;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRoleUser,
        login,
        logout,
        isPresident,
        isBookkeeper,
        isGeneralManager,
        isStaff,
        isMember,
        canManageLivestock,
        canViewLivestockList,
        canViewDashboard,
        canViewAuditLog,
        canViewMyLivestock,
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
