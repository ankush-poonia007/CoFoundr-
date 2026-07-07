'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../lib/api';
import { User, Mail, Save, BadgeCheck, Lock, ShieldCheck, Check, X, Phone } from 'lucide-react';

const countries = [
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳' },
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: 'JP', dial: '+81', flag: '🇯🇵' },
  { name: 'Singapore', code: 'SG', dial: '+65', flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971', flag: '🇦🇪' },
  { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷' },
  { name: 'South Africa', code: 'ZA', dial: '+27', flag: '🇿🇦' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966', flag: '🇸🇦' },
  { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳' },
  { name: 'Russian Federation', code: 'RU', dial: '+7', flag: '🇷🇺' }
];

export default function SettingsPage() {
  const { user, token, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [selectedDial, setSelectedDial] = useState('+1');
  const [rawPhoneNumber, setRawPhoneNumber] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync state when store user updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      
      const fullNum = user.mobile_number || '';
      let matched = false;
      for (const c of countries) {
        if (fullNum.startsWith(c.dial)) {
          setSelectedDial(c.dial);
          setRawPhoneNumber(fullNum.slice(c.dial.length).trim());
          matched = true;
          break;
        }
      }
      if (!matched) {
        setSelectedDial('+1');
        setRawPhoneNumber(fullNum.trim());
      }
    }
  }, [user]);

  // Load URL queries for link feedback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('success');
      const e = params.get('error');
      if (s) {
        setSuccess(s);
        // Refetch fresh user profile credentials (active addon flags)
        authAPI.getMe().then((profile) => {
          if (profile && token) {
            setAuth(profile, token);
          }
        }).catch(err => console.error('Failed to refetch user credentials:', err));
      }
      if (e) setError(e);
    }
  }, [token, setAuth]);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const handleConnectGitHub = async () => {
    try {
      const data = await authAPI.getGitHubRedirect(`link:${token}`);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to link GitHub:', err);
      setError('Failed to initiate GitHub link process.');
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const data = await authAPI.getGoogleRedirect(`link:${token}`);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to link Google:', err);
      setError('Failed to initiate Google link process.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSuccess('');
    setError('');

    const isNameChanged = name.trim() !== user?.name;

    // Check weekly constraint from localStorage only if name is changed
    if (isNameChanged) {
      const lastChange = localStorage.getItem('last_name_changed_at');
      if (lastChange) {
        const lastChangeDate = new Date(lastChange);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastChangeDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 7) {
          const daysLeft = Math.ceil(7 - diffDays);
          setError(`You can only change your name once in a week. Please wait ${daysLeft} more days.`);
          setSaving(false);
          return;
        }
      }
    }

    const finalMobile = rawPhoneNumber.trim() ? `${selectedDial} ${rawPhoneNumber.trim()}` : null;

    try {
      await authAPI.updateProfile(name.trim(), finalMobile);

      if (user && token) {
        setAuth(
          {
            ...user,
            name: name.trim(),
            mobile_number: finalMobile
          },
          token
        );
        if (isNameChanged) {
          localStorage.setItem('last_name_changed_at', new Date().toISOString());
        }
        setSuccess('Profile updated permanently in database!');
      }
    } catch (err: any) {
      console.error('Failed to update profile permanently:', err);
      setError(err.response?.data?.detail || 'Failed to update profile permanently.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.has_password && !currentPassword) {
      setPwError('Please enter your current password.');
      return;
    }
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwSaving(true);
    setPwSuccess('');
    setPwError('');

    try {
      await authAPI.updatePassword({
        current_password: user?.has_password ? currentPassword : null,
        new_password: newPassword
      });
      setPwSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setPwError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  // Password validation helper
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, color: 'bg-slate-200 dark:bg-slate-800', label: 'None', width: 'w-0' };
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    let color = 'bg-rose-500';
    let label = 'Weak';
    let width = 'w-1/4';

    if (score === 2) {
      color = 'bg-amber-500';
      label = 'Medium';
      width = 'w-2/4';
    } else if (score === 3) {
      color = 'bg-indigo-500';
      label = 'Strong';
      width = 'w-3/4';
    } else if (score === 4) {
      color = 'bg-emerald-500';
      label = 'Very Strong';
      width = 'w-full';
    }

    return { score, color, label, width };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen pt-[57px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 p-6 md:p-8 max-w-2xl mx-auto w-full space-y-8 mt-4">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-base text-slate-500 dark:text-slate-400">Manage your profile details and connected services</p>
        </div>

        {success && (
          <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-semibold text-emerald-500 text-center animate-fade-in">
            {success}
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm font-semibold text-rose-500 text-center animate-shake">
            {error}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            <span>Profile Information</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 px-4 py-3.5 rounded-xl text-sm font-semibold text-indigo-950 dark:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-4 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Mobile Number</label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative w-1/3 min-w-[120px]">
                  <select
                    value={selectedDial}
                    onChange={(e) => setSelectedDial(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-250 focus:outline-none focus:border-indigo-500 transition shadow-sm appearance-none cursor-pointer"
                  >
                    {countries.map((c) => (
                      <option key={`${c.code}-${c.dial}`} value={c.dial}>
                        {c.flag} {c.dial} ({c.code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                {/* Raw Phone Number input field */}
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-4 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="tel"
                    value={rawPhoneNumber}
                    onChange={(e) => setRawPhoneNumber(e.target.value.replace(/[^0-9\- ()]/g, ''))}
                    placeholder="555-0192"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-250 focus:outline-none focus:border-indigo-500 transition shadow-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim() || (name.trim() === user?.name && (rawPhoneNumber.trim() ? `${selectedDial} ${rawPhoneNumber.trim()}` : null) === (user?.mobile_number || null))}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 transition duration-200"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-500" />
            <span>Update Password Credentials</span>
          </h2>

          {pwSuccess && (
            <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-semibold text-emerald-500 text-center animate-fade-in">
              {pwSuccess}
            </div>
          )}

          {pwError && (
            <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm font-semibold text-rose-500 text-center animate-shake">
              {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {!user?.has_password ? (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                You logged in using Google/GitHub. Set up a password below to allow direct email sign-in.
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-355 focus:outline-none focus:border-indigo-500 transition shadow-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-355 focus:outline-none focus:border-indigo-500 transition shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-355 focus:outline-none focus:border-indigo-500 transition shadow-sm"
                />
              </div>
            </div>

            {/* Dynamic Strength Graphic indicator */}
            {newPassword && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-500">Password Strength:</span>
                  <span className={`font-bold ${strength.score <= 2 ? 'text-rose-500' : strength.score === 3 ? 'text-indigo-500' : 'text-emerald-500'}`}>{strength.label}</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                </div>

                {/* Password Criteria checklist parameters */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-sm font-semibold text-slate-650 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    {hasMinLength ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-rose-500" />}
                    <span>At least 8 chars</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasUppercase ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-rose-500" />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasNumber ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-rose-500" />}
                    <span>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasSpecial ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-rose-500" />}
                    <span>One special char</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={pwSaving || (user?.has_password && !currentPassword) || !newPassword || !confirmPassword || strength.score < 2}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 transition duration-200"
            >
              {pwSaving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Integrations Card */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-indigo-500" />
            <span>Connected Services</span>
          </h2>

          <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {/* Google Account */}
            <div className="flex justify-between items-center py-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google Account</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Connected authentication provider</p>
              </div>
              {(user?.google_connected || user?.auth_provider === 'google') ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition duration-200"
                >
                  Connect Google
                </button>
              )}
            </div>

            {/* GitHub Account */}
            <div className="flex justify-between items-center py-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">GitHub Account</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Connected authentication provider</p>
              </div>
              {(user?.github_connected || user?.auth_provider === 'github') ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              ) : (
                <button
                  onClick={handleConnectGitHub}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition duration-200"
                >
                  Connect GitHub
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
