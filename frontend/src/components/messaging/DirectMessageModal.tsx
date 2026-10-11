import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Message, CreatorProfile } from '../../types';
import { api } from '../../services/api';
import { Send, Paperclip, CheckCheck, Sparkles, Loader2, User } from 'lucide-react';

interface DirectMessageModalProps {
  isOpen?: boolean;
  onClose: () => void;
  creator: CreatorProfile | null;
  currentUserId?: string;
  currentUserName?: string;
  engagementId?: string;
  onMessageSent?: () => void;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen = true,
  onClose,
  creator,
  currentUserId = '',
  currentUserName = '',
  engagementId,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadConversation = async () => {
    if (!creator) return;
    setLoading(true);
    try {
      if (engagementId) {
        const msgs = await api.getEngagementMessages(engagementId);
        setMessages(msgs);
      } else {
        const msgs = await api.getConversation(creator.id);
        setMessages(msgs);
      }
      await api.markThreadRead(creator.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && creator) {
      loadConversation();
    }
  }, [isOpen, creator]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || !creator || sending) return;

    setSending(true);
    try {
      let attachmentUrl: string | undefined = undefined;
      let attachmentName: string | undefined = undefined;

      if (attachment) {
        setUploadingFile(true);
        const uploaded = await api.uploadFile(attachment, 'brand', 'document');
        attachmentUrl = uploaded.url;
        attachmentName = uploaded.original_filename;
        setUploadingFile(false);
      }

      const newMsg = await api.sendMessage({
        engagement_id: engagementId,
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_role: 'brand',
        recipient_id: creator.id,
        recipient_name: creator.display_name,
        content: inputText.trim() || 'Sent an attachment file.',
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
      });

      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setAttachment(null);
      onMessageSent?.();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };

  if (!creator) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Direct Message — ${creator.display_name}`} maxWidth="xl">
      <div className="flex flex-col h-[520px]">
        {/* Creator Mini Header */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={creator.display_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#5B46F6]/15"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-slate-900 text-sm">{creator.display_name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {creator.availability_status}
                </span>
              </div>
              <p className="text-xs text-slate-500">{creator.title}</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 block text-[10px] uppercase">Rate</span>
            <span className="font-semibold text-slate-900 font-mono">
              {creator.rate_min ? `$${creator.rate_min} – $${creator.rate_max || 4500}` : 'Custom'}
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-900">Start the conversation with {creator.display_name}</p>
              <p className="text-xs max-w-sm text-slate-500">
                Discuss campaign vision, technical tool compatibility, deliverables, or turnaround time.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === currentUserId;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500">
                    <span>{isMe ? 'You' : m.sender_name}</span>
                    <span>•</span>
                    <span>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#5B46F6] text-white rounded-br-none shadow-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.attachment_url && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <a
                          href={m.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-[11px] underline font-semibold hover:opacity-80"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{m.attachment_name || 'View Attachment'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Attachment Pill */}
        {attachment && (
          <div className="flex items-center justify-between p-2 mb-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700">
            <span className="truncate flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-[#5B46F6]" />
              <span>{attachment.name}</span>
            </span>
            <button
              onClick={() => setAttachment(null)}
              className="text-slate-400 hover:text-rose-600 text-xs px-1.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <label className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer transition-all border border-slate-200">
            <Paperclip className="w-4 h-4" />
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setAttachment(e.target.files[0]);
              }}
            />
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${creator.display_name}...`}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#5B46F6] rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={(!inputText.trim() && !attachment) || sending}
            className="px-4 py-2.5 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-sm"
          >
            {sending || uploadingFile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
};
