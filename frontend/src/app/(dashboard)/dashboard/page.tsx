'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '../../../store/dashboardStore';
import { useAuthStore } from '../../../store/authStore';
import { dashboardAPI, authAPI } from '../../../lib/api';
import { LayoutDashboard, LogOut, PlusCircle, MessageSquare, FileText, Activity } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { metrics, setMetrics } = useDashboardStore();
  const { user, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await dashboardAPI.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [setMetrics]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      clearAuth();
      router.push('/');
    } catch (err) {
      console.error('Failed to logout:', err);
      clearAuth();
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400">
        <span>Loading metrics analytics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 space-y-8">
      {/* Top Header Navigation */}
      <header className="flex justify-between items-center bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight">CoFoundr Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm font-medium">Hello, {user?.name || 'Builder'}</span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Action shortcuts */}
      <section className="flex gap-4">
        <Link
          href="/onboarding"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-xl transition transform hover:-translate-y-0.5"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Startup Profile</span>
        </Link>
        <Link
          href="/chat"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 font-medium rounded-xl transition transform hover:-translate-y-0.5"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Open Advisor Chat</span>
        </Link>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Startup totals card */}
        <div className="bg-slate-900/20 border border-slate-800/40 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Startups registered</span>
            <Activity className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics?.total_startups || 0}</p>
        </div>

        {/* Avg health score card */}
        <div className="bg-slate-900/20 border border-slate-800/40 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Avg Health Index</span>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics?.average_health_score || 0}%</p>
        </div>

        {/* Chat totals card */}
        <div className="bg-slate-900/20 border border-slate-800/40 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Advisor Threads</span>
            <MessageSquare className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics?.total_chats || 0}</p>
        </div>

        {/* Reports totals card */}
        <div className="bg-slate-900/20 border border-slate-800/40 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Reports Generated</span>
            <FileText className="h-5 w-5 text-violet-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics?.total_reports || 0}</p>
        </div>
      </section>

      {/* Recents Splits */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent reports list */}
        <div className="bg-slate-900/30 border border-slate-800/40 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-200">Recent Audit Reports</h2>
          <div className="space-y-3">
            {metrics?.recent_reports && metrics.recent_reports.length > 0 ? (
              metrics.recent_reports.map((report) => (
                <div key={report.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/20">
                  <div>
                    <p className="font-semibold text-slate-300">{report.startup_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{report.report_type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-400">{report.score}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No reports generated yet.</p>
            )}
          </div>
        </div>

        {/* Recent chat logs */}
        <div className="bg-slate-900/30 border border-slate-800/40 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-200">Recent Chats</h2>
          <div className="space-y-3">
            {metrics?.recent_chats && metrics.recent_chats.length > 0 ? (
              metrics.recent_chats.map((chat) => (
                <div key={chat.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/20 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">{chat.title}</span>
                  <Link href={`/chat?id=${chat.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                    Resume
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No chats initiated yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
