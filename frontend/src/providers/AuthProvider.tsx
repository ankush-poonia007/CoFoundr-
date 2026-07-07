'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      let storedToken = localStorage.getItem('token');

      // Parse query token from OAuth redirect callback if present
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const queryToken = params.get('token');
        if (queryToken) {
          localStorage.setItem('token', queryToken);
          storedToken = queryToken;

          // Clear query params to clean browser address bar
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      }

      if (storedToken) {
        try {
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.data.success && res.data.data) {
            setAuth(res.data.data, storedToken);
          } else {
            clearAuth();
          }
        } catch (e) {
          clearAuth();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [setAuth, clearAuth]);

  useEffect(() => {
    // Enforce private route shields for dashboard, chat, and onboarding panels
    const publicPaths = ['/', '/login', '/signup', '/docs', '/contact', '/auth/google/callback', '/auth/github/callback'];
    if (!loading) {
      const isPublic = publicPaths.includes(pathname) || pathname?.startsWith('/auth/');
      if (!token && !isPublic) {
        router.push('/login');
      } else if (token && (pathname === '/' || pathname === '/login' || pathname === '/signup')) {
        router.push('/dashboard');
      }
    }
  }, [loading, token, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 font-sans text-indigo-400 font-semibold tracking-wide">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <span>Loading CoFoundr Session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
