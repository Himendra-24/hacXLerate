import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Search, ChevronRight, Clock, CheckCheck, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Message, MessageThreadSummary } from '../types';

export const MessagesPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThreadSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthModal('login');
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadThreads();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreads = async () => {
    try {
      setLoadingThreads(true);
      setError(null);
      const data = await api.getMessageThreads();
      setThreads(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load conversations');
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadConversation = async (thread: MessageThreadSummary) => {
    setSelectedThread(thread);
    setLoadingMessages(true);
    try {
      const msgs = await api.getConversation(thread.partner_id);
      setMessages(msgs);
      // Mark thread as read
      await api.markThreadRead(thread.partner_id);
      // Update unread count in threads list
      setThreads(prev => prev.map(t =>
        t.partner_id === thread.partner_id ? { ...t, unread_count: 0 } : t
      ));
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || !user) return;

    setSendingMessage(true);
    try {
      const sent = await api.sendMessage({
        engagement_id: selectedThread.engagement_id || undefined,
        sender_id: user.id,
        sender_name: user.display_name,
        sender_role: user.role,
        recipient_id: selectedThread.partner_id,
        recipient_name: selectedThread.partner_name,
        content: newMessage.trim(),
      });
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      // Update last message in thread
      setThreads(prev => prev.map(t =>
        t.partner_id === selectedThread.partner_id
          ? { ...t, last_message: sent.content, last_message_at: sent.created_at }
          : t
      ));
    } catch (err: any) {
      alert(err?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredThreads = threads.filter(t =>
    t.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5B46F6] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <MessageCircle className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to view messages</h2>
        <p className="text-slate-500 text-sm text-center">Your conversations with creators and brands will appear here.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-[#5B46F6] text-white font-semibold text-sm hover:bg-[#4F46E5] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 text-sm mt-1">Campaign communications and direct messages</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style={{ height: '72vh' }}>
          <div className="flex h-full">
            {/* Sidebar — Thread List */}
            <div className="w-80 flex-shrink-0 border-r border-slate-100 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search conversations…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                  />
                </div>
              </div>

              {/* Thread List */}
              <div className="flex-1 overflow-y-auto">
                {loadingThreads ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 text-[#5B46F6] animate-spin" />
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <p className="text-sm text-rose-600 mb-3">{error}</p>
                    {error.toLowerCase().includes('authentication') && (
                      <button
                        onClick={() => openAuthModal('login')}
                        className="px-4 py-1.5 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-colors shadow-sm"
                      >
                        Sign In Again
                      </button>
                    )}
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                    <Inbox className="w-10 h-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No conversations yet</p>
                    <p className="text-xs text-slate-400">
                      {user?.role === 'brand'
                        ? 'Contact a creator from their profile to start a conversation.'
                        : 'Messages from brands will appear here.'}
                    </p>
                  </div>
                ) : (
                  filteredThreads.map(thread => (
                    <button
                      key={thread.partner_id}
                      onClick={() => loadConversation(thread)}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                        selectedThread?.partner_id === thread.partner_id ? 'bg-[#5B46F6]/5 border-l-2 border-l-[#5B46F6]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          thread.partner_role === 'creator'
                            ? 'bg-violet-100 text-[#5B46F6]'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {thread.partner_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900 truncate">{thread.partner_name}</span>
                            <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTime(thread.last_message_at.toString())}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{thread.last_message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              thread.partner_role === 'creator'
                                ? 'bg-violet-100 text-[#5B46F6]'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {thread.partner_role}
                            </span>
                            {thread.unread_count > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#5B46F6] text-white font-bold">
                                {thread.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Main — Conversation View */}
            <div className="flex-1 flex flex-col">
              {!selectedThread ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Select a conversation</h3>
                    <p className="text-sm text-slate-500">Choose a conversation from the left to start messaging.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedThread.partner_role === 'creator'
                        ? 'bg-violet-100 text-[#5B46F6]'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {selectedThread.partner_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">{selectedThread.partner_name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        selectedThread.partner_role === 'creator'
                          ? 'bg-violet-100 text-[#5B46F6]'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedThread.partner_role}
                      </span>
                    </div>
                    {selectedThread.engagement_id && (
                      <button
                        onClick={() => navigate(`/engagements/${selectedThread.engagement_id}`)}
                        className="ml-auto flex items-center gap-1 text-xs text-[#5B46F6] hover:underline"
                      >
                        View Campaign <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-5 h-5 text-[#5B46F6] animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <p className="text-sm text-slate-400">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {!isMine && (
                              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-[#5B46F6] mr-2 flex-shrink-0 mt-1">
                                {msg.sender_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className={`max-w-xs lg:max-w-md ${isMine ? '' : ''}`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                isMine
                                  ? 'bg-[#5B46F6] text-white rounded-br-sm'
                                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm'
                              }`}>
                                {msg.content}
                              </div>
                              <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-slate-400">{formatTime(msg.created_at.toString())}</span>
                                {isMine && <CheckCheck className={`w-3 h-3 ${msg.is_read ? 'text-[#5B46F6]' : 'text-slate-300'}`} />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder={`Message ${selectedThread.partner_name}…`}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="p-2.5 rounded-xl bg-[#5B46F6] text-white hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sendingMessage
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Send className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
