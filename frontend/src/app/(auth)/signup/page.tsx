'use client';

import React, { useState } from 'react';
import { authAPI } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';
import { Sparkles, Github, Globe, Mail, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    if (loadingGoogle || loadingGitHub || loadingEmail) return;
    setLoadingGoogle(true);
    setError('');
    try {
      const data = await authAPI.getGoogleRedirect();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoadingGoogle(false);
      }
    } catch (err) {
      console.error('Failed to initiate Google OAuth:', err);
      setError('Could not connect to Google registration.');
      setLoadingGoogle(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (loadingGoogle || loadingGitHub || loadingEmail) return;
    setLoadingGitHub(true);
    setError('');
    try {
      const data = await authAPI.getGitHubRedirect();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoadingGitHub(false);
      }
    } catch (err) {
      console.error('Failed to initiate GitHub OAuth:', err);
      setError('Could not connect to GitHub registration.');
      setLoadingGitHub(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (loadingGoogle || loadingGitHub || loadingEmail) return;
    setLoadingEmail(true);
    setError('');

    try {
      const data = await authAPI.emailRegister({ email, name, password });
      if (data.access_token && data.user) {
        localStorage.setItem('token', data.access_token);
        setAuth(data.user, data.access_token);
        router.push('/dashboard');
      } else {
        setError('Received an invalid session payload from registration.');
        setLoadingEmail(false);
      }
    } catch (err: any) {
      console.error('Failed email/password registration:', err);
      setError(err.response?.data?.detail || 'Failed to create account.');
      setLoadingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center font-sans px-4 overflow-hidden relative transition-colors duration-300">
      {/* Glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-650/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 dark:bg-violet-650/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 p-8 rounded-3xl shadow-xl backdrop-blur-md z-10 flex flex-col space-y-6">
        {/* Header branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 items-center justify-center shadow-md shadow-indigo-500/20 mb-2">
            <span className="font-extrabold text-white text-base">CF</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Create your account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Join CoFoundr to begin building and analyzing your products</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-505 text-center animate-shake">
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle || loadingGitHub || loadingEmail}
            className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold text-slate-700 transition duration-200 shadow-sm"
          >
            {loadingGoogle ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent"></div>
            ) : (
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.7 0 3.23.59 4.43 1.73l3.32-3.32C17.75 1.58 15.08 1 12 1 7.24 1 3.21 3.73 1.25 7.72l3.96 3.07C6.18 7.55 8.85 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.89c2.28-2.1 3.54-5.19 3.54-8.71z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.21 14.28c-.24-.72-.38-1.5-.38-2.28s.14-1.56.38-2.28L1.25 6.65C.45 8.26 0 10.07 0 12s.45 3.74 1.25 5.35l3.96-3.07z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.89-2.98c-1.1.74-2.51 1.18-4.07 1.18-3.15 0-5.82-2.51-6.79-5.75L1.25 15.6C3.21 19.59 7.24 23 12 23z"
                />
              </svg>
            )}
            <span>Google</span>
          </button>

          <button
            onClick={handleGitHubLogin}
            disabled={loadingGoogle || loadingGitHub || loadingEmail}
            className="px-4 py-3 bg-[#24292e] hover:bg-[#2c3238] border border-transparent rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold text-white transition duration-200 shadow-sm"
          >
            {loadingGitHub ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
            ) : (
              <svg className="h-4 w-4 fill-current text-white flex-shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            )}
            <span>GitHub</span>
          </button>
        </div>

        {/* Separator line */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px bg-slate-200 dark:bg-slate-850 flex-1"></div>
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Or Register Account</span>
          <div className="h-px bg-slate-200 dark:bg-slate-850 flex-1"></div>
        </div>

        {/* Traditional Registration Form */}
        <form onSubmit={handleEmailSignup} className="flex flex-col space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ankush Poonia"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@cofoundr.ai"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name || !email || !password || loadingGoogle || loadingGitHub || loadingEmail}
            className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-650/40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 transition duration-200"
          >
            {loadingEmail ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <span>Register & Onboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Route redirect link */}
        <p className="text-xs text-center text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
