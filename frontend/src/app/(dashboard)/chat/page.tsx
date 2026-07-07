'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { chatAPI, startupAPI } from '../../../lib/api';
import { useChatStore, ChatMessage, ChatSession } from '../../../store/chatStore';
import { MessageSquare, ArrowLeft, Send, Plus, Upload, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';

export default function ChatPage() {
  const { sessions, activeSessionId, messages, setSessions, setActiveSessionId, setMessages, addMessage } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [startups, setStartups] = useState<any[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // 1. Load chat threads and startup profiles on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const chatSessions = await chatAPI.list();
        setSessions(chatSessions || []);
        if (chatSessions && chatSessions.length > 0) {
          setActiveSessionId(chatSessions[0].id);
        }

        const startupList = await startupAPI.list();
        setStartups(startupList || []);
        if (startupList && startupList.length > 0) {
          setSelectedStartupId(startupList[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial chat/startup data:', err);
      }
    };
    loadInitialData();
  }, [setSessions, setActiveSessionId]);

  // 2. Load messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      const loadMessages = async () => {
        try {
          const detail = await chatAPI.get(activeSessionId);
          setMessages(detail.messages || []);
        } catch (err) {
          console.error('Failed to load messages for session:', activeSessionId, err);
        }
      };
      loadMessages();
    }
  }, [activeSessionId, setMessages]);

  // 3. Scroll to appropriate message position
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        // Scroll to the start of the assistant response
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Scroll to the bottom if it's the user's message
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // 4. Create new chat thread
  const handleNewChat = async () => {
    try {
      const title = `CoFounder Session #${sessions.length + 1}`;
      const newSession = await chatAPI.create(title, selectedStartupId || undefined);
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
    } catch (err) {
      console.error('Failed to create new chat:', err);
    }
  };

  // 5. Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSessionId || sending) return;

    const userMessageContent = inputText;
    setInputText('');
    setSending(true);

    // Append user message immediately
    const tempUserMessage: ChatMessage = {
      id: Math.random().toString(),
      chat_session_id: activeSessionId,
      role: 'user',
      content: userMessageContent,
      created_at: new Date().toISOString()
    };
    addMessage(tempUserMessage);

    try {
      // Trigger RAG or general message query
      const metadata = selectedStartupId ? { startup_id: selectedStartupId } : undefined;
      const res = await chatAPI.sendMessage(activeSessionId, userMessageContent, metadata);

      // Append assistant response
      const assistantMessage: ChatMessage = {
        id: res.id || Math.random().toString(),
        chat_session_id: activeSessionId,
        role: 'assistant',
        content: res.content || res.response || '',
        created_at: new Date().toISOString()
      };
      addMessage(assistantMessage);
    } catch (err) {
      console.error('Failed to dispatch message:', err);
    } finally {
      setSending(false);
    }
  };

  // 6. Handle document uploads and RAG vector indexing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStartupId) return;

    setUploading(true);
    setUploadSuccess('');
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

      // Submit multipart form upload directly
      await axios.post(`${API_URL}/startups/${selectedStartupId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setUploadSuccess(`"${file.name}" indexed successfully!`);
    } catch (err: any) {
      console.error('Failed to upload file for indexing:', err);
      const errMsg = err.response?.data?.detail || err.message || 'Upload failed';
      setUploadError(`Failed to index file: ${errMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-screen pt-[57px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden transition-colors duration-300">
      <Navbar />

      {/* Main Body Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar panels */}
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-900/10 flex flex-col p-4 space-y-6">
          {/* Startup Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Context Startup</label>
            <select
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none shadow-sm transition"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Threads</span>
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
              title="New Thread"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition border ${
                  activeSessionId === session.id
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-450 hover:bg-slate-200/50 dark:hover:bg-slate-900/30 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {session.title}
              </button>
            ))}
          </div>

          <hr className="border-slate-200 dark:border-slate-800/60" />

          {/* RAG file uploader widget */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
              <Upload className="h-4 w-4 text-indigo-500" />
              <span>RAG Document Indexer</span>
            </div>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-normal">
              Upload PDF or TXT pitch assets. The text chunks will be vector indexed into ChromaDB.
            </p>
            <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer hover:bg-indigo-500/5 transition">
              {uploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-2"></div>
              ) : (
                <FileText className="h-6 w-6 text-slate-400 dark:text-slate-500 mb-2" />
              )}
              <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-semibold">
                {uploading ? 'Processing File...' : 'Choose File'}
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileUpload}
                disabled={uploading || !selectedStartupId}
                className="hidden"
              />
            </label>
            {uploadSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 text-[11px] mt-1 font-semibold">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}
            {uploadError && (
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-455 text-[11px] mt-1 font-semibold">
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Chat Panel */}
        <main className="flex-1 flex flex-col bg-white dark:bg-slate-950">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length > 0 ? (
              messages.map((m, index) => {
                const isLast = index === messages.length - 1;
                return (
                  <div
                    key={m.id}
                    ref={isLast ? lastMessageRef : null}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-2xl shadow-sm border text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-indigo-600 border-indigo-500/40 text-white'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {parseMarkdown(m.content)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-4">
                <span className="font-semibold text-slate-400 dark:text-slate-500">No active chat thread. Create a new thread to get started!</span>
                <button
                  onClick={handleNewChat}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition"
                >
                  Start New Session
                </button>
              </div>
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/40 px-4 py-3 rounded-2xl text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 font-semibold shadow-sm">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                  <span>Advisor thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950 flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g. 'Audit Acme AI', 'Draft MVP roadmap')"
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:border-indigo-500/50 outline-none transition text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 shadow-sm"
              disabled={!activeSessionId || sending}
            />
            <button
              type="submit"
              disabled={!activeSessionId || sending || !inputText.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white font-bold rounded-xl transition flex items-center justify-center shadow-md shadow-indigo-600/10"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

// ─── Markdown Rendering Helpers ──────────────────────────────────────────────

function parseMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-sm font-bold mt-2 mb-1 text-indigo-600 dark:text-indigo-400">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-base font-bold mt-3 mb-1.5 text-indigo-700 dark:text-indigo-305">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-lg font-bold mt-4 mb-2 text-indigo-800 dark:text-indigo-200">{line.slice(2)}</h1>;
        }
        // Bullet lists
        if (line.startsWith('* ') || line.startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc my-0.5 text-slate-700 dark:text-slate-300 font-normal leading-relaxed">{parseInlineMarkdown(line.slice(2))}</li>;
        }
        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          const content = line.replace(/^\d+\.\s/, '');
          return <li key={i} className="ml-4 list-decimal my-0.5 text-slate-700 dark:text-slate-300 font-normal leading-relaxed">{parseInlineMarkdown(content)}</li>;
        }
        // Empty line
        if (!line.trim()) {
          return <div key={i} className="h-1"></div>;
        }
        // Paragraph
        return <p key={i} className="text-slate-750 dark:text-slate-300 font-normal leading-relaxed my-0.5">{parseInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-slate-950 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
