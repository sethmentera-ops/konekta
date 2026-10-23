import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, UserProfile } from '../types/index.ts';
import { api, getStoredToken, clearStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  register: (payload: {
    email?: string;
    phone?: string;
    password?: string;
    displayName: string;
    username: string;
  }) => Promise<void>;
  sendPhoneOtp: (phone: string, purpose?: 'login' | 'register' | 'link') => Promise<{
    message: string;
    phone: string;
    expiresInSeconds: number;
    resendCooldownSeconds: number;
    previewCode?: string;
  }>;
  verifyPhoneOtp: (payload: {
    phone: string;
    code: string;
    purpose?: string;
    displayName?: string;
    username?: string;
  }) => Promise<void>;
  switchAccount: (userId: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    const token = getStoredToken();
    if (token) {
      try {
        const res = await api.getMe();
        
        // Awtomatikong burahin ang lumang demo accounts para lumabas agad ang Login at Install pop-up
        const demoIds = ['usr_elena', 'usr_marcus', 'usr_sofia', 'usr_kenji', 'usr_amara'];
        if (demoIds.includes(res.user.id) || res.user.email?.includes('elena@')) {
          clearStoredToken();
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(res.user);
        setProfile(res.user.profile || null);
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn('Existing token invalid, clearing stored token:', err);
        clearStoredToken();
      }
    }

    // Walang default demo account: mananatiling unauthenticated hangga't hindi naglo-login
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (identifier: string, password?: string) => {
    const res = await api.login(identifier, password);
    setUser(res.user);
    setProfile(res.user.profile || null);
  };

  const register = async (payload: {
    email?: string;
    phone?: string;
    password?: string;
    displayName: string;
    username: string;
  }) => {
    const res = await api.register(payload);
    setUser(res.user);
    setProfile(res.user.profile || null);
  };

  const sendPhoneOtp = async (phone: string, purpose: 'login' | 'register' | 'link' = 'login') => {
    return api.sendPhoneOtp(phone, purpose);
  };

  const verifyPhoneOtp = async (payload: {
    phone: string;
    code: string;
    purpose?: string;
    displayName?: string;
    username?: string;
  }) => {
    const res = await api.verifyPhoneOtp(payload);
    setUser(res.user);
    setProfile(res.user.profile || null);
  };

  const switchAccount = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await api.switchDemoAccount(userId);
      setUser(res.user);
      setProfile(res.user.profile || null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
      setProfile(res.user.profile || null);
    } catch {
      // Ignore
    }
  };

  const updateCurrentProfile = async (updates: Partial<UserProfile>) => {
    const res = await api.updateProfile(updates);
    setProfile(res.profile);
    if (user) {
      setUser({
        ...user,
        profile: res.profile,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        sendPhoneOtp,
        verifyPhoneOtp,
        switchAccount,
        logout,
        refreshUser,
        updateCurrentProfile,
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