import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  CreatorProfile,
  Organization,
  UserRegisterPayload,
  UserLoginPayload,
  OnboardingUpdatePayload,
  AuthResponse
} from '../types';
import { api, getAuthToken, setAuthSession, clearAuthSession } from '../services/api';

interface AuthContextType {
  user: User | null;
  creatorProfile: CreatorProfile | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: UserLoginPayload) => Promise<AuthResponse>;
  register: (payload: UserRegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  updateOnboarding: (payload: OnboardingUpdatePayload) => Promise<void>;
  refreshMe: () => Promise<void>;
  authModalState: { isOpen: boolean; mode: 'login' | 'register'; defaultRole: 'creator' | 'brand' };
  openAuthModal: (mode?: 'login' | 'register', defaultRole?: 'creator' | 'brand') => void;
  closeAuthModal: () => void;
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('unframe_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(() => {
    const saved = localStorage.getItem('unframe_creator_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [organization, setOrganization] = useState<Organization | null>(() => {
    const saved = localStorage.getItem('unframe_organization');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal states
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    defaultRole: 'creator' | 'brand';
  }>({
    isOpen: false,
    mode: 'login',
    defaultRole: 'creator',
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const applyAuthResponse = (auth: AuthResponse) => {
    setAuthSession(auth);
    setToken(auth.access_token);
    setUser(auth.user);
    setCreatorProfile(auth.creator_profile || null);
    setOrganization(auth.organization || null);

    // If new user and not yet finished onboarding, trigger progressive onboarding prompt
    if (auth.user && !auth.user.onboarding_completed) {
      setIsOnboardingOpen(true);
    }
  };

  const refreshMe = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setIsLoading(false);
      return;
    }
    try {
      const auth = await api.getMe();
      applyAuthResponse(auth);
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (payload: UserLoginPayload): Promise<AuthResponse> => {
    const auth = await api.login(payload);
    applyAuthResponse(auth);
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
    return auth;
  };

  const register = async (payload: UserRegisterPayload): Promise<AuthResponse> => {
    const auth = await api.register(payload);
    applyAuthResponse(auth);
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
    return auth;
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    setCreatorProfile(null);
    setOrganization(null);
    setIsOnboardingOpen(false);
    localStorage.removeItem('unframe_shortlist');
    localStorage.removeItem('unframe_brief_draft');
    localStorage.removeItem('selected_creator_id');
  };

  const updateOnboarding = async (payload: OnboardingUpdatePayload) => {
    const auth = await api.updateOnboarding(payload);
    applyAuthResponse(auth);
    setIsOnboardingOpen(false);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login', defaultRole: 'creator' | 'brand' = 'creator') => {
    setAuthModalState({ isOpen: true, mode, defaultRole });
  };

  const closeAuthModal = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        creatorProfile,
        organization,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateOnboarding,
        refreshMe,
        authModalState,
        openAuthModal,
        closeAuthModal,
        isOnboardingOpen,
        openOnboarding,
        closeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
