'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { chatAPI, startupAPI } from '../../../lib/api';
import { useChatStore, ChatMessage, ChatSession } from '../../../store/chatStore';
import { MessageSquare, ArrowLeft, Send, Plus, Upload, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function ChatPage() {
  const { sessions, activeSessionId, messages, setSessions, setActiveSessionId, setMessages, addMessage } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [startups, setStartups] = useState<any[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // 3. Scroll to bottom of message list
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    } catch (err) {
      console.error('Failed to upload file for indexing:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="flex justify-between items-center bg-slate-900/40 border-b border-slate-800/60 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            <span className="font-bold text-sm tracking-wide">Advisor Chat Room</span>
          </div>
        </div>

        {/* Selected Startup profile mapping */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Context startup:</span>
          <select
            value={selectedStartupId}
            onChange={(e) => setSelectedStartupId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
          >
            {startups.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Body Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar panels */}
        <aside className="w-80 border-r border-slate-800/40 bg-slate-900/10 flex flex-col p-4 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Threads</span>
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
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
                className={`w-full p-3 rounded-xl text-left text-sm transition border ${
                  activeSessionId === session.id
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:bg-slate-900/30 hover:text-slate-200'
                }`}
              >
                {session.title}
              </button>
            ))}
          </div>

          <hr className="border-slate-800/60" />

          {/* RAG file uploader widget */}
          <div className="space-y-3 bg-slate-900/20 border border-slate-800/60 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
              <Upload className="h-4 w-4 text-indigo-400" />
              <span>RAG Document Indexer</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Upload PDF or TXT pitch assets. The text chunks will be vector indexed into ChromaDB.
            </p>
            <label className="flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer hover:bg-indigo-500/5 transition">
              <FileText className="h-6 w-6 text-slate-500 mb-2" />
              <span className="text-[11px] text-slate-400 text-center font-semibold">
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
              <div className="flex items-center gap-2 text-emerald-400 text-xs mt-1">
                <CheckCircle className="h-4 w-4" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Chat Panel */}
        <main className="flex-1 flex flex-col bg-slate-950">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length > 0 ? (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${
                      m.role === 'user'
                        ? 'bg-indigo-600 border-indigo-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800/60 text-slate-300'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Initiate the conversation by sending your first prompt below.
              </div>
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-900/40 border border-slate-800/40 px-4 py-3 rounded-2xl text-sm text-slate-400 flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                  <span>Advisor thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/40 bg-slate-950 flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g. 'Audit Acme AI', 'Draft MVP roadmap')"
              className="flex-1 px-4 py-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl focus:border-indigo-500/50 outline-none transition text-sm"
              disabled={!activeSessionId || sending}
            />
            <button
              type="submit"
              disabled={!activeSessionId || sending || !inputText.trim()}
              className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white font-semibold rounded-xl transition flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
