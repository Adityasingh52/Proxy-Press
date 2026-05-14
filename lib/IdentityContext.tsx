'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface IdentityContextType {
  currentUserId: string | null;
  currentUser: any | null;
  isLoading: boolean;
  refreshIdentity: () => Promise<void>;
}

const IdentityContext = createContext<IdentityContextType>({
  currentUserId: null,
  currentUser: null,
  isLoading: true,
  refreshIdentity: async () => {},
});

export const useIdentity = () => useContext(IdentityContext);

export const IdentityProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadIdentity = () => {
    if (typeof window === 'undefined') return;

    // 1. Instant Sync Load from Storage
    const savedId = localStorage.getItem('last_user_id') || 
                    localStorage.getItem('proxypress_viewer_id');
    
    if (savedId) {
      setCurrentUserId(savedId);
      const cachedUser = localStorage.getItem(`profile_cache_${savedId}`);
      if (cachedUser) {
        try {
          setCurrentUser(JSON.parse(cachedUser).user);
        } catch (e) {}
      }
    }
    setIsLoading(false);
  };

  const refreshIdentity = async () => {
    try {
      const { getCurrentUser } = await import('@/lib/actions');
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
        setCurrentUser(user);
        localStorage.setItem('last_user_id', user.id);
      }
    } catch (e) {
      console.error("Failed to refresh identity", e);
    }
  };

  useEffect(() => {
    loadIdentity();
    refreshIdentity();
  }, []);

  return (
    <IdentityContext.Provider value={{ currentUserId, currentUser, isLoading, refreshIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
};
