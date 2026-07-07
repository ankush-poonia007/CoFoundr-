'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '../../../store/dashboardStore';
import { useAuthStore } from '../../../store/authStore';
import { dashboardAPI, reportAPI } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import { PlusCircle, MessageSquare, FileText, Activity, Download } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { metrics, setMetrics } = useDashboardStore();
  const { user, clearAuth, token } = useAuthStore();
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-650 dark:text-indigo-400 font-sans font-semibold">
        <span>Loading metrics analytics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[57px] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      <Navbar />
      
      <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Action shortcuts */}
        <section className="flex gap-4">
          <Link
            href="/onboarding"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-xl text-white transition transform hover:-translate-y-0.5 shadow-md shadow-indigo-600/10"
          >
            <PlusCircle className="h-5 w-5" />
            <span>New Startup Profile</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 font-medium rounded-xl text-slate-700 dark:text-slate-200 transition transform hover:-translate-y-0.5 shadow-sm"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Open Advisor Chat</span>
          </Link>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Startup totals card */}
          <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Startups registered</span>
              <Activity className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics?.total_startups || 0}</p>
          </div>

          {/* Avg health score card */}
          <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg Health Index</span>
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics?.average_health_score || 0}%</p>
          </div>

          {/* Chat totals card */}
          <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Advisor Threads</span>
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics?.total_chats || 0}</p>
          </div>

          {/* Reports totals card */}
          <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Reports Generated</span>
              <FileText className="h-5 w-5 text-violet-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics?.total_reports || 0}</p>
          </div>
        </section>

        {/* Recents Splits */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent reports list */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200">Recent Audit Reports</h2>
            <div className="space-y-3">
              {metrics?.recent_reports && metrics.recent_reports.length > 0 ? (
                metrics.recent_reports.map((report) => (
                  <div key={report.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/20 shadow-sm transition">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{report.startup_name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="capitalize">{report.report_type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span className="text-[10px]">
                          {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{report.score}%</span>
                      </div>
                      <a
                        href={`${reportAPI.getDownloadUrl(report.id)}?token=${token}`}
                        download
                        className="p-1.5 rounded-lg bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition"
                        title="Download PDF Report"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 font-medium">No reports generated yet.</p>
              )}
            </div>
          </div>

          {/* Recent chat logs */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200">Recent Chats</h2>
            <div className="space-y-3">
              {metrics?.recent_chats && metrics.recent_chats.length > 0 ? (
                metrics.recent_chats.map((chat) => (
                  <div key={chat.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/20 flex items-center justify-between shadow-sm">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{chat.title}</span>
                    <Link href={`/chat?id=${chat.id}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold">
                      Resume
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 font-medium">No chats initiated yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
