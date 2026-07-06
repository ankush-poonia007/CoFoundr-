'use client';

import React from 'react';
import { authAPI } from '../../lib/api';
import { Sparkles, Github, Globe } from 'lucide-react';

export default function MarketingLandingPage() {
  const handleGoogleLogin = async () => {
    try {
      const data = await authAPI.getGoogleRedirect();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to initiate Google OAuth redirect:', err);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const data = await authAPI.getGitHubRedirect();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to initiate GitHub OAuth redirect:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans px-4 overflow-hidden relative">
      {/* Visual background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl text-center space-y-8 z-10">
        {/* Tag branding */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-sm font-medium tracking-wide">
          <Sparkles className="h-4 w-4" />
          <span>Meet your AI Co-Founder</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300">
          CoFoundr
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          The AI co-founder you always needed. Production-grade research, YC-partner reviews, MVP roads, and metrics scoring.
        </p>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3"
          >
            <Globe className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>

          {/* GitHub Login */}
          <button
            onClick={handleGitHubLogin}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3"
          >
            <Github className="h-5 w-5" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Footer info */}
        <p className="text-slate-500 text-sm pt-12 font-light">
          Secure logins verified via OAuth2 protocol.
        </p>
      </div>
    </div>
  );
}
