'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../lib/api';
import { useTheme } from '../providers/ThemeProvider';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  FileText, 
  Mail, 
  LogOut, 
  Sun, 
  Moon, 
  Monitor
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout request error:', err);
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Advisor Chat', href: '/chat', icon: MessageSquare },
    { name: 'Documentation', href: '/docs', icon: FileText },
    { name: 'Contact', href: '/contact', icon: Mail },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white/95 dark:bg-slate-900/90 border-b border-slate-300 dark:border-slate-800/80 px-6 backdrop-blur-md fixed top-0 left-0 right-0 h-[57px] z-50 flex items-center justify-between transition-colors duration-300">
      {/* Brand logo & Welcome User */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <span className="font-bold text-white text-sm">CF</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Welcome back,</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {user?.name || 'CoFoundr Builder'}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-950/40 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/30">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-slate-650 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-205 hover:bg-slate-200/50 dark:hover:bg-slate-900/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Right widgets: Theme Switcher & Logout */}
      <div className="flex items-center gap-3">
        {/* Theme Toggler Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
            title="Toggle theme"
          >
            {theme === 'light' && <Sun className="h-4 w-4" />}
            {theme === 'dark' && <Moon className="h-4 w-4" />}
            {theme === 'system' && <Monitor className="h-4 w-4" />}
          </button>

          {showThemeMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowThemeMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl p-1 z-20 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-155">
                <button
                  onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium transition ${
                    theme === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium transition ${
                    theme === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium transition ${
                    theme === 'system'
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>System</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Profile indicator & Logout */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-500 hover:text-white transition-all duration-200"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
