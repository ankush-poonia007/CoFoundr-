'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, BookOpen, Mail } from 'lucide-react';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen pt-[57px] bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Visual background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header navbar for marketing */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 border-b border-slate-900/60 px-6 h-[57px] backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center h-full">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="font-bold text-white text-sm">CF</span>
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-violet-200">
              CoFoundr
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="text-xs font-semibold text-slate-450 hover:text-slate-200 flex items-center gap-1.5 transition">
              <BookOpen className="h-4 w-4 animate-pulse" />
              <span>Documentation</span>
            </Link>
            <Link href="/contact" className="text-xs font-semibold text-slate-450 hover:text-slate-200 flex items-center gap-1.5 transition">
              <Mail className="h-4 w-4" />
              <span>Contact</span>
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-200 transition">
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto space-y-8 z-10 py-16">
        {/* Tag branding */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-sm font-medium tracking-wide">
          <Sparkles className="h-4 w-4" />
          <span>Meet your AI Co-Founder</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300">
          CoFoundr
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
          The AI co-founder you always needed. Build startup profiles, index pitch decks with ChromaDB vector search, and run stateful LangGraph advisor workflows to launch your MVP.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 w-full sm:w-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-355 font-bold rounded-xl transition duration-300 transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2"
          >
            <span>Access Workspace</span>
          </Link>
        </div>

        {/* Informational Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left pt-16">
          {/* Card 1: Project Mission */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-100">Why CoFoundr?</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Building a startup is complex, unstructured, and resource-heavy. CoFoundr solves this by acting as an automated intelligence partner that provisions research dashboards, executes competitor scoring indexes, and structures release milestones.
            </p>
          </div>

          {/* Card 2: Ownership */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-100">Project Ownership</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              This capstone system is owned and developed by <strong className="text-indigo-400 font-semibold">Ankush Poonia</strong>. It showcases state-of-the-art implementations of hybrid RAG parsing (ChromaDB) and multi-agent LangGraph orchestration pipelines.
            </p>
          </div>

          {/* Card 3: What You Can Do */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-3 md:col-span-2">
            <h2 className="text-lg font-bold text-slate-100">What You Can Do Here</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">1. Vector Document Ingestion</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">Upload competitors pitch sheets or PDFs to run semantic hybrid lookups.</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">2. Live LangGraph Auditing</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">Prompt the agent network to audit risk parameters, construct tech stacks, and verify market moats.</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">3. PDF Report Compiles</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">Download comprehensive analytical YC-styled reports complete with startup scoring grades.</p>
              </div>
            </div>
          </div>

          {/* Card 4: Future Scope */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-3 md:col-span-2">
            <h2 className="text-lg font-bold text-slate-100">Future Scope</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              The project is designed to scale dynamically. Upcoming modules will support automated pitch deck slide generation, live sandbox investor pitch panels, and custom interactive financial cash-flow modeling modules based on your startup's MVP scope.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-slate-500 text-[11px] pt-12 font-medium tracking-wider uppercase">
          Capstone Application owned by Ankush Poonia.
        </p>
      </div>
    </div>
  );
}
