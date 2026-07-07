'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { Mail, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSending(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.post('/support/contact', { name, email, message });
      const responseData = res.data.data;
      if (res.data.success && (responseData?.status === 'success' || responseData?.status === 'simulated')) {
        setSuccess(responseData.message || 'Thank you! Your message has been sent.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError('Support service returned an invalid response.');
      }
    } catch (err: any) {
      console.error('Contact support request error:', err);
      const errMsg = err.response?.data?.detail || err.message || 'Failed to submit inquiry';
      setError(`Failed to send message: ${errMsg}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-[57px] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 p-6 md:p-8 max-w-xl mx-auto w-full space-y-8 mt-4">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Contact Support</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Have questions? Send us an inquiry and our team will get back to you shortly.</p>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-start gap-3 animate-fade-in">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Message Dispatched!</p>
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400/90 leading-relaxed">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 text-center animate-shake">
            {error}
          </div>
        )}

        {/* Contact Form Card */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-500" />
            <span>Send Inquiry to neurachat.support@gmail.com</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 block">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ankush Poonia"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-4 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-indigo-500 transition shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-indigo-500 transition shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-455 block">Message Details</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detail your question or feature requests here..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-4 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-355 focus:outline-none focus:border-indigo-500 transition resize-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !name || !email || !message}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 transition duration-200"
            >
              {sending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
