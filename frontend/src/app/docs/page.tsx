'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import { 
  BookOpen, 
  HelpCircle, 
  Settings2, 
  Terminal, 
  CheckCircle,
  MessageSquare,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function DocsPage() {
  const steps = [
    {
      title: '1. Provision Startup Profile',
      desc: 'Navigate to the onboarding page and enter details for your startup: industry, size, product stage, target customer profile, and primary value prop.',
    },
    {
      title: '2. Upload Core Context Files',
      desc: 'Use the RAG Document Indexer in the Chat Room to upload pitch decks, competitor sheets, or market surveys. Text is chunked and stored in ChromaDB.',
    },
    {
      title: '3. Consult Advisor Agents',
      desc: 'Send prompts in the Chat Room. The LangGraph router will dynamically execute web research, vector doc parsing, or analysis scoring to answer you.',
    },
  ];

  const examples = [
    {
      prompt: 'Draft an MVP roadmap and release feature sets for our startup.',
      category: 'MVP Planning',
    },
    {
      prompt: 'Audit key competitors and highlight our technical differentiation points.',
      category: 'Market Research',
    },
    {
      prompt: 'Verify our compliance readiness and check for potential operational risks.',
      category: 'Risk Assessment',
    },
  ];

  const models = [
    {
      name: 'Gemini 2.5 Flash',
      type: 'Reasoning & Routing',
      purpose: 'Acts as the Main Intent Routing Agent and generates comprehensive advisor analysis blocks.',
    },
    {
      name: 'Google text-embedding-004',
      type: 'Document Embeddings',
      purpose: 'Generates 768-dimensional semantic vectors for all parsed text chunks for hybrid similarity queries.',
    },
    {
      name: 'Groq Llama 3 70B',
      type: 'Fast Execution Tasks',
      purpose: 'Performs rapid text extraction and sub-agent classification pipelines to minimize latency.',
    },
  ];

  return (
    <div className="min-h-screen pt-[57px] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-10 my-4">
        {/* Title */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <BookOpen className="h-4 w-4" />
            <span>Product Manual & Technical Directory</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">CoFoundr Documentation</h1>
          <p className="text-base text-slate-500 dark:text-slate-400">Learn how to configure startup profiles, coordinate multi-agent advisor networks, and review analytics</p>
        </div>

        {/* User Guide */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <HelpCircle className="h-5.5 w-5.5 text-indigo-500" />
            <span>User Setup Instructions</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-5 rounded-2xl shadow-sm space-y-2.5">
                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{step.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Example Prompts */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <MessageSquare className="h-5.5 w-5.5 text-indigo-500" />
            <span>Example Chat Instructions</span>
          </h2>
          <div className="space-y-3">
            {examples.map((ex, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-4.5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-2.5">
                <div className="flex items-start gap-2.5">
                  <Terminal className="h-4.5 w-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">"{ex.prompt}"</p>
                </div>
                <span className="self-start md:self-auto px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                  {ex.category}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Model Directory */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Settings2 className="h-5.5 w-5.5 text-indigo-500" />
            <span>Active AI Models Directory</span>
          </h2>
          <div className="border border-slate-200 dark:border-slate-800/40 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/30 shadow-sm divide-y divide-slate-200 dark:divide-slate-800/50">
            {models.map((m, idx) => (
              <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 md:max-w-md">
                  <p className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500" />
                    <span>{m.name}</span>
                  </p>
                  <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-medium">{m.purpose}</p>
                </div>
                <span className="self-start md:self-auto px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {m.type}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Notice */}
        <footer className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex gap-4">
          <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Enterprise Security & Compliance</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              All advisor communications are executed securely using JWT authentication. Documents are processed using high-performance in-memory parsing, with isolated vector partitions managed independently per user startup.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
