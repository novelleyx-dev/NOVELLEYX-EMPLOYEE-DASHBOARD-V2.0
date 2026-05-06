'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Users, MessageSquare, User } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function CommLinkModule({ employeeId }: { employeeId: string }) {
  const { employees, messages, sendMessage, dmMessages, sendDM, getDMThread, session } = useStore();
  const approved = employees.filter(e => e.status === 'APPROVED' && e.id !== employeeId);
  const me = employees.find(e => e.id === employeeId);

  const [mode, setMode] = useState<'board' | 'dm'>('board');
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [boardText, setBoardText] = useState('');
  const [dmText, setDmText] = useState('');
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = selectedPeer ? getDMThread(employeeId, selectedPeer) : [];
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread.length, messages.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
    const reader = new FileReader();
    reader.onload = () => setMediaPreview({ url: reader.result as string, type: file.type.startsWith('video/') ? 'video' : 'image' });
    reader.readAsDataURL(file);
  };

  const handleBoardSend = () => {
    if (!boardText.trim() && !mediaPreview) return;
    sendMessage(employeeId, me?.name || 'Employee', boardText.trim() || '📎 Media', false, mediaPreview?.url, mediaPreview?.type);
    setBoardText(''); setMediaPreview(null);
  };

  const handleDMSend = () => {
    if (!selectedPeer || (!dmText.trim() && !mediaPreview)) return;
    sendDM(employeeId, selectedPeer, me?.name || 'Employee', dmText.trim() || '📎 Media', mediaPreview?.url, mediaPreview?.type);
    setDmText(''); setMediaPreview(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Comm-Link</h2>
        <p className="text-white/40 text-sm">Read admin broadcasts · Reply · Chat with coworkers · Share photos &amp; videos</p>
      </div>

      <div className="flex gap-2">
        {[{ key: 'board', label: 'Team Board', icon: Users }, { key: 'dm', label: 'Direct Chat', icon: MessageSquare }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setMode(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border
              ${mode === key ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* BOARD */}
      {mode === 'board' && (
        <div className="glass-card p-5 flex flex-col" style={{ height: '500px' }}>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.map(msg => {
              const isMe = msg.senderId === employeeId;
              const isAdmin = msg.isAdmin;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`chat-bubble ${isMe ? 'chat-bubble-self' : 'chat-bubble-other'} ${isAdmin ? 'border-fuchsia-500/30' : ''}`}>
                    <p className={`text-xs font-semibold mb-0.5 ${isAdmin ? 'text-fuchsia-400' : isMe ? 'text-cyan-400' : 'text-white/60'}`}>
                      {isAdmin ? '🛡 ' : ''}{msg.senderName}
                    </p>
                    <p className="text-sm text-white/85">{msg.content}</p>
                    {msg.mediaUrl && (
                      <div className="mt-2">
                        {msg.mediaType === 'image' ? <img src={msg.mediaUrl} className="max-w-[200px] rounded-lg border border-white/10" alt="media" />
                          : <video src={msg.mediaUrl} controls className="max-w-[200px] rounded-lg" />}
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
            <div className="relative mb-2 rounded-lg overflow-hidden border border-white/10 max-h-16">
              {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="h-16 object-cover" alt="preview" />
                : <video src={mediaPreview.url} className="h-16" />}
              <button onClick={() => setMediaPreview(null)} className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 rounded">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 transition-all" title="Attach photo/video">
              <Paperclip size={16} />
            </button>
            <input className="cyber-input flex-1 py-2 text-sm" placeholder="Message to team…" value={boardText}
              onChange={e => setBoardText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBoardSend()} />
            <button onClick={handleBoardSend} disabled={!boardText.trim() && !mediaPreview} className="btn-cyber py-2 px-4 text-sm flex items-center gap-1.5 disabled:opacity-40">
              <Send size={14} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {/* DM */}
      {mode === 'dm' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Coworkers</p>
            <div className="space-y-1">
              {/* Admin DM */}
              <button onClick={() => setSelectedPeer('admin')}
                className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all hover:bg-white/5 ${selectedPeer === 'admin' ? 'bg-fuchsia-400/10 border border-fuchsia-400/20' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 text-xs font-bold">A</div>
                <div><p className="text-sm font-semibold text-white">Admin</p><p className="text-xs text-fuchsia-400/60">Abhinav Patta</p></div>
              </button>
              {approved.map(emp => (
                <button key={emp.id} onClick={() => setSelectedPeer(emp.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all hover:bg-white/5 ${selectedPeer === emp.id ? 'bg-cyan-400/10 border border-cyan-400/20' : ''}`}>
                  <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-8 h-8 rounded-lg border border-white/10" alt={emp.name} />
                  <div><p className="text-sm font-semibold text-white truncate">{emp.name}</p><p className="text-xs text-white/40 truncate">{emp.department}</p></div>
                </button>
              ))}
              {approved.length === 0 && <p className="text-white/30 text-xs p-2">No other employees yet.</p>}
            </div>
          </div>

          <div className="lg:col-span-3 glass-card p-4 flex flex-col" style={{ height: '420px' }}>
            {!selectedPeer ? (
              <div className="flex-1 flex items-center justify-center text-white/30">
                <div className="text-center"><User size={36} className="mx-auto mb-2 opacity-30" /><p>Select someone to chat</p></div>
              </div>
            ) : (
              <>
                <div className="pb-3 border-b border-white/5 mb-3">
                  <p className="font-bold text-white text-sm">
                    {selectedPeer === 'admin' ? '🛡 Admin — Abhinav' : employees.find(e => e.id === selectedPeer)?.name}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
                  {getDMThread(employeeId, selectedPeer).map(msg => {
                    const isMe = msg.senderId === employeeId;
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
                  <div className="relative mb-2 rounded-lg overflow-hidden border border-white/10 max-h-16">
                    {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="h-16 object-cover" alt="preview" />
                      : <video src={mediaPreview.url} className="h-16" />}
                    <button onClick={() => setMediaPreview(null)} className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 rounded">✕</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 transition-all" title="Photo/video only">
                    <Paperclip size={16} />
                  </button>
                  <input className="cyber-input flex-1 py-2 text-sm" placeholder="Type a message…" value={dmText}
                    onChange={e => setDmText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDMSend()} />
                  <button onClick={handleDMSend} className="btn-cyber py-2 px-4 text-sm"><Send size={14} /></button>
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
