'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startupAPI } from '../../../lib/api';
import { Sparkles, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    problem_statement: '',
    solution_description: '',
    target_market: '',
    unique_value_proposition: '',
    founder_name: '',
    team_size: 1,
    domain_expertise: '',
    business_model: '',
    revenue_model: '',
    has_revenue: false,
    competitors_known: false,
    competitive_advantage: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'team_size') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Startup Name is required.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await startupAPI.create(formData);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to create startup profile:', err);
      setError(err.response?.data?.error || 'Failed to register startup profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 relative">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition text-sm">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Branding header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold tracking-tight">Register Startup Profile</h1>
          </div>
          <p className="text-sm text-slate-400">
            Tell us about your venture. We will use these data points to score your metrics and generate MVP roadmaps.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/20 border border-slate-800/40 p-6 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Startup name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Startup Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme AI"
                required
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm"
              />
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. The AI scheduling agent you always needed"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm"
              />
            </div>

            {/* Founder name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Founder Name</label>
              <input
                type="text"
                name="founder_name"
                value={formData.founder_name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm"
              />
            </div>

            {/* Team size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Team Size</label>
              <input
                type="number"
                name="team_size"
                min="1"
                value={formData.team_size}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm"
              />
            </div>
          </div>

          <hr className="border-slate-800/60" />

          {/* Textareas */}
          <div className="space-y-6">
            {/* Problem statement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Problem Statement</label>
              <textarea
                name="problem_statement"
                rows={3}
                value={formData.problem_statement}
                onChange={handleChange}
                placeholder="Describe the problem you are solving..."
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm resize-none"
              />
            </div>

            {/* UVP */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Unique Value Proposition (UVP)</label>
              <textarea
                name="unique_value_proposition"
                rows={3}
                value={formData.unique_value_proposition}
                onChange={handleChange}
                placeholder="What makes your product distinct?"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm resize-none"
              />
            </div>

            {/* Moat / competitive advantage */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Competitive Defensibility (Moat)</label>
              <textarea
                name="competitive_advantage"
                rows={3}
                value={formData.competitive_advantage}
                onChange={handleChange}
                placeholder="Why is it hard for others to copy you?"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm resize-none"
              />
            </div>
          </div>

          <hr className="border-slate-800/60" />

          {/* Business particulars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Business Model</label>
              <input
                type="text"
                name="business_model"
                value={formData.business_model}
                onChange={handleChange}
                placeholder="e.g. B2B SaaS, Marketplace"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Revenue Model</label>
              <input
                type="text"
                name="revenue_model"
                value={formData.revenue_model}
                onChange={handleChange}
                placeholder="e.g. Per-seat pricing, Transaction fee"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-indigo-500/50 focus:ring-0 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Checkbox fields */}
          <div className="flex flex-col sm:flex-row gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-slate-300">
              <input
                type="checkbox"
                name="has_revenue"
                checked={formData.has_revenue}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 outline-none"
              />
              <span>Generate active revenue?</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-slate-300">
              <input
                type="checkbox"
                name="competitors_known"
                checked={formData.competitors_known}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 outline-none"
              />
              <span>Competitors identified?</span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              <span>{submitting ? 'Registering Startup...' : 'Create Startup Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
