'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (
      savedToken &&
      savedToken !== 'undefined' &&
      savedToken !== 'null' &&
      savedUser &&
      savedUser !== 'undefined' &&
      savedUser !== 'null'
    ) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const raw = await api.post<{
      accessToken: string;
      refreshToken: string;
      userId: string;
      email: string;
      role: Role;
    }>('/auth/login', { email, password: pass });

    const authData = (raw as any)?.data || raw;

    if (authData?.mustChangePassword) {
      const err: any = new Error(
        authData.message || 'First-time login detected: Password update required.',
      );
      err.mustChangePassword = true;
      err.email = authData.email || email;
      throw err;
    }

    const token = authData?.accessToken;

    if (!token) {
      throw new Error('Authentication failed: No access token received from server');
    }

    localStorage.setItem('token', token);
    setToken(token);

    // Fetch user profile with explicit header to avoid any timing or caching issue
    let profile: User;
    try {
      const profileRaw = await api.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      profile = (profileRaw as any)?.data || profileRaw;
    } catch {
      profile = {
        id: authData.userId,
        email: authData.email,
        phone: '',
        fullName: 'Super Admin',
        role: authData.role || 'ADMIN',
        createdAt: new Date().toISOString(),
      };
    }

    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);

    return profile;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profileRaw = await api.get<User>('/users/me');
      const profile = (profileRaw as any)?.data || profileRaw;
      if (profile && profile.id) {
        localStorage.setItem('user', JSON.stringify(profile));
        setUser(profile);
      }
    } catch {
      // Ignore if session expired
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
