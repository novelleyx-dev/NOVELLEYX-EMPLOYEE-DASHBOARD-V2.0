'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Users, User, MessageSquare, Image as ImageIcon, Video } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminChatModule() {
  const { employees, messages, sendMessage, dmMessages, sendDM, getDMThread } = useStore();
  const approved = employees.filter(e => e.status === 'APPROVED');

  const [mode, setMode] = useState<'broadcast' | 'dm'>('broadcast');
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [dmText, setDmText] = useState('');
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = selectedEmp ? getDMThread('admin', selectedEmp) : [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread.length, messages.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) return;
    const reader = new FileReader();
    reader.onload = () => setMediaPreview({ url: reader.result as string, type: isVideo ? 'video' : 'image' });
    reader.readAsDataURL(file);
  };

  const handleBroadcast = () => {
    if (!broadcastText.trim() && !mediaPreview) return;
    sendMessage('admin', 'Admin — Abhinav', broadcastText.trim() || '📎 Media attachment', true, mediaPreview?.url, mediaPreview?.type);
    setBroadcastText(''); setMediaPreview(null);
  };

  const handleSendDM = () => {
    if (!selectedEmp || (!dmText.trim() && !mediaPreview)) return;
    const emp = employees.find(e => e.id === selectedEmp);
    sendDM('admin', selectedEmp, 'Admin — Abhinav', dmText.trim() || '📎 Media', mediaPreview?.url, mediaPreview?.type);
    setDmText(''); setMediaPreview(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Communications Hub</h2>
        <p className="text-white/40 text-sm">Broadcast to all · Direct messages · Media sharing</p>
      </div>

      <div className="flex gap-2">
        {[{ key: 'broadcast', label: 'Broadcast All', icon: Users }, { key: 'dm', label: 'Direct Message', icon: MessageSquare }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setMode(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border
              ${mode === key ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {mode === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 glass-card p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2"><Users size={14} className="text-cyan-400" /> Send to All Employees</h3>
            <textarea className="cyber-input resize-none" rows={4} placeholder="Type your announcement…"
              value={broadcastText} onChange={e => setBroadcastText(e.target.value)} />
            {mediaPreview && (
              <div className="relative rounded-lg overflow-hidden border border-white/10">
                {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="w-full max-h-32 object-cover" alt="preview" />
                  : <video src={mediaPreview.url} className="w-full max-h-32 object-cover" />}
                <button onClick={() => setMediaPreview(null)} className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">✕</button>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-cyan-400 hover:border-cyan-400/30 transition-all text-xs">
                <Paperclip size={12} /> Attach
              </button>
              <button onClick={handleBroadcast} disabled={!broadcastText.trim() && !mediaPreview}
                className="btn-cyber flex-1 flex items-center justify-center gap-2 py-2 text-sm disabled:opacity-40">
                <Send size={14} /> Broadcast
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="lg:col-span-3 glass-card p-5">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><MessageSquare size={14} className="text-cyan-400" /> Comm-Link Feed</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {[...messages].reverse().map(msg => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-fuchsia-400">
                    {msg.senderName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-fuchsia-400">{msg.senderName}</span>
                      <span className="text-xs text-white/30">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-white/70">{msg.content}</p>
                    {msg.mediaUrl && (
                      <div className="mt-1">
                        {msg.mediaType === 'image' ? <img src={msg.mediaUrl} className="max-w-[200px] rounded-lg border border-white/10" alt="media" />
                          : <video src={msg.mediaUrl} controls className="max-w-[200px] rounded-lg border border-white/10" />}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'dm' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 glass-card p-4">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Employees</h3>
            <div className="space-y-1">
              {approved.length === 0 && <p className="text-white/30 text-xs">No approved employees.</p>}
              {approved.map(emp => {
                const unread = getDMThread(emp.id, 'admin').filter(m => m.receiverId === 'admin').length;
                return (
                  <button key={emp.id} onClick={() => setSelectedEmp(emp.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all hover:bg-white/5
                      ${selectedEmp === emp.id ? 'bg-cyan-400/10 border border-cyan-400/20' : ''}`}>
                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`}
                      className="w-8 h-8 rounded-lg border border-white/10" alt={emp.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{emp.name}</p>
                      <p className="text-xs text-white/40 truncate">{emp.department}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 glass-card p-4 flex flex-col" style={{ height: '400px' }}>
            {!selectedEmp ? (
              <div className="flex-1 flex items-center justify-center text-white/30">
                <div className="text-center"><User size={36} className="mx-auto mb-2 opacity-30" /><p>Select an employee to chat</p></div>
              </div>
            ) : (
              <>
                <div className="pb-3 border-b border-white/5 mb-3">
                  <p className="font-bold text-white text-sm">{employees.find(e => e.id === selectedEmp)?.name}</p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
                  {thread.map(msg => {
                    const isMe = msg.senderId === 'admin';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`chat-bubble ${isMe ? 'chat-bubble-self' : 'chat-bubble-other'}`}>
                          <p className="text-sm">{msg.content}</p>
                          {msg.mediaUrl && (
                            <div className="mt-1">
                              {msg.mediaType === 'image' ? <img src={msg.mediaUrl} className="max-w-[160px] rounded-lg" alt="media" />
                                : <video src={msg.mediaUrl} controls className="max-w-[160px] rounded-lg" />}
                            </div>
                          )}
                          <p className="text-xs text-white/30 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                {mediaPreview && (
                  <div className="relative mb-2 rounded-lg overflow-hidden border border-white/10 max-h-20">
                    {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="h-20 object-cover" alt="preview" />
                      : <video src={mediaPreview.url} className="h-20" />}
                    <button onClick={() => setMediaPreview(null)} className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">✕</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 transition-all">
                    <Paperclip size={16} />
                  </button>
                  <input className="cyber-input flex-1 py-2 text-sm" placeholder="Type a message…"
                    value={dmText} onChange={e => setDmText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendDM()} />
                  <button onClick={handleSendDM} className="btn-cyber py-2 px-4 text-sm flex items-center gap-1.5"><Send size={14} /></button>
                </div>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
