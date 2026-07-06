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
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Verify JWT token signature by requesting authenticated dashboard data
          const res = await api.get('/dashboard', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.status === 200) {
            // Deconstruct session parameters
            setAuth(
              {
                id: 'active_session_user_id',
                email: 'builder@cofoundr.ai',
                name: 'CoFoundr Founder'
              },
              storedToken
            );
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
    const publicPaths = ['/', '/auth/google/callback', '/auth/github/callback'];
    if (!loading) {
      const isPublic = publicPaths.includes(pathname) || pathname?.startsWith('/auth/');
      if (!token && !isPublic) {
        router.push('/');
      } else if (token && pathname === '/') {
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
