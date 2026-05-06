'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Globe, Bell, Zap, Database, Check, Save, Camera, 
  Lock, Key, Monitor, Clock, Languages, Palette, Layout, Smartphone,
  Mail, MessageSquare, AlertTriangle, Moon, Github, Slack, Figma, 
  ExternalLink, Trash2, Download, ShieldAlert, Cpu, Laptop, PhoneCall
} from 'lucide-react';
import { useStore, ThemeMode, Designation } from '@/store/useStore';

type SettingsTab = 'profile' | 'localization' | 'roles' | 'notifications' | 'integrations' | 'privacy';

const THEMES: { key: ThemeMode; label: string; icon: any; desc: string; preview: string }[] = [
  { key: 'cyber-dark', label: 'Cyber Dark', icon: Zap, desc: 'Original neon glassmorphism', preview: 'linear-gradient(135deg, #030712, #0f1729)' },
  { key: 'night', label: 'Midnight', icon: Moon, desc: 'Deep navy night mode', preview: 'linear-gradient(135deg, #0a0e1a, #111827)' },
  { key: 'day', label: 'Daylight', icon: SunIcon, desc: 'Clean light interface', preview: 'linear-gradient(135deg, #f0f4ff, #e8f0fe)' },
  { key: 'forest', label: 'Forest Zen', icon: LeafIcon, desc: 'Nature-inspired greenery', preview: 'linear-gradient(135deg, #0d1f0f, #1a2e1c)' },
  { key: 'ocean', label: 'Deep Ocean', icon: WaveIcon, desc: 'Calm ocean depths', preview: 'linear-gradient(135deg, #050e1a, #0a1628)' },
  { key: 'zen', label: 'Zen Garden', icon: SparklesIcon, desc: 'Soft earthy tones', preview: 'linear-gradient(135deg, #1a1510, #2a1e14)' },
];

// Fallback icons if not imported
function SunIcon({ size }: { size: number }) { return <Monitor size={size} /> }
function LeafIcon({ size }: { size: number }) { return <Database size={size} /> }
function WaveIcon({ size }: { size: number }) { return <Palette size={size} /> }
function SparklesIcon({ size }: { size: number }) { return <Zap size={size} /> }

const THEME_VARS: Record<ThemeMode, Record<string, string>> = {
  'cyber-dark': { '--bg': '#030712', '--accent': '#22d3ee', '--accent2': '#a855f7', '--card-bg': 'rgba(255,255,255,0.04)', '--card-border': 'rgba(255,255,255,0.08)', '--text': '#f1f5f9' },
  'night': { '--bg': '#0a0e1a', '--accent': '#818cf8', '--accent2': '#a78bfa', '--card-bg': 'rgba(129,140,248,0.05)', '--card-border': 'rgba(129,140,248,0.12)', '--text': '#e2e8f0' },
  'day': { '--bg': '#f8fafc', '--accent': '#2563eb', '--accent2': '#7c3aed', '--card-bg': 'rgba(255,255,255,0.9)', '--card-border': 'rgba(0,0,0,0.08)', '--text': '#0f172a' },
  'forest': { '--bg': '#0d1f0f', '--accent': '#4ade80', '--accent2': '#86efac', '--card-bg': 'rgba(74,222,128,0.04)', '--card-border': 'rgba(74,222,128,0.12)', '--text': '#ecfdf5' },
  'ocean': { '--bg': '#050e1a', '--accent': '#38bdf8', '--accent2': '#818cf8', '--card-bg': 'rgba(56,189,248,0.04)', '--card-border': 'rgba(56,189,248,0.1)', '--text': '#e0f2fe' },
  'zen': { '--bg': '#1a1510', '--accent': '#d97706', '--accent2': '#92400e', '--card-bg': 'rgba(217,119,6,0.06)', '--card-border': 'rgba(217,119,6,0.15)', '--text': '#fef3c7' },
};

export default function SettingsModule({ employeeId }: { employeeId: string }) {
  const { getSettings, updateSettings, employees, updateProfilePhoto, getEmployeeById } = useStore();
  const settings = getSettings(employeeId);
  const emp = getEmployeeById(employeeId);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(emp?.name || '');
  const [bio, setBio] = useState(settings.bio || '');
  const fileRef = useRef<HTMLInputElement>(null);

  const applyTheme = (theme: ThemeMode) => {
    const vars = THEME_VARS[theme];
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
      document.body.style.background = vars['--bg'];
      document.body.style.color = vars['--text'];
    }
    updateSettings(employeeId, { theme });
  };

  useEffect(() => { 
    if (settings.theme) applyTheme(settings.theme); 
  }, []);

  const handleSave = () => {
    updateSettings(employeeId, { bio });
    updateEmployeeProfile(employeeId, name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc?: string }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
      </div>
      <button onClick={onClick}
        className={`w-11 h-6 rounded-full transition-all relative ${active ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-white/10'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${active ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  const TABS: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'localization', label: 'Workspace', icon: Globe },
    { id: 'roles', label: 'Roles & Access', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'privacy', label: 'Data & Privacy', icon: Database },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">System Settings</h2>
          <p className="text-white/40 text-sm mt-1">Configure your digital ecosystem and personal workspace preferences.</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-400/10 border border-lime-400/30 text-lime-400 text-sm font-bold">
            <Check size={16} /> Changes Synchronized
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                ${activeTab === tab.id 
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── PROFILE & ACCOUNT ──────────────────────────────── */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="glass-card p-8">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-cyan-400/20 group-hover:border-cyan-400 transition-all p-1">
                          {emp?.profilePhoto ? (
                            <img src={emp.profilePhoto} className="w-full h-full object-cover rounded-2xl" alt="profile" />
                          ) : (
                            <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp?.avatarSeed}&backgroundColor=0a0a1a`} className="w-full h-full rounded-2xl" alt="avatar" />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera size={24} className="text-white" />
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              updateProfilePhoto(employeeId, reader.result as string);
                              updateSettings(employeeId, { profilePhoto: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{emp?.name}</h3>
                        <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase">ID: {emp?.id}</p>
                        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                          ${emp?.role === 'founding piller' ? 'role-piller' : emp?.role === 'Team leader' ? 'role-leader' : 'role-employee'}`}>
                          <Shield size={10} /> {emp?.role}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Display Name</label>
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="cyber-input" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Display Bio</label>
                        <textarea 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Write a short professional bio..."
                          className="cyber-input min-h-[100px] resize-none"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Recovery Email</label>
                          <input type="email" placeholder="personal@email.com" className="cyber-input" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Work Phone</label>
                          <input type="tel" placeholder="+1 (555) 000-0000" className="cyber-input" />
                        </div>
                      </div>
                    </div>
                    <button onClick={handleSave} className="btn-cyber mt-6 flex items-center gap-2">
                      <Save size={16} /> Sync Profile Data
                    </button>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Lock size={14} className="text-amber-400" /> Security & Auth</h3>
                    <div className="space-y-3">
                      <Toggle 
                        active={true} 
                        onClick={() => {}} 
                        label="Two-Factor Authentication (2FA)" 
                        desc="Secure your account with an authenticator app."
                      />
                      <Toggle 
                        active={false} 
                        onClick={() => {}} 
                        label="Biometric Verification" 
                        desc="Use fingerprint or face ID to unlock the dashboard."
                      />
                      <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all text-left">
                        <div>
                          <p className="text-sm font-bold text-white">Change Master Password</p>
                          <p className="text-xs text-white/40 mt-0.5">Last updated 14 days ago</p>
                        </div>
                        <Key size={18} className="text-white/20" />
                      </button>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Smartphone size={14} className="text-cyan-400" /> Active Sessions</h3>
                    <div className="space-y-4">
                      {[
                        { device: 'Windows 11 · Chrome', location: 'Mumbai, India', ip: '192.168.1.1', status: 'Current Session', icon: Laptop },
                        { device: 'iPhone 15 Pro · Safari', location: 'Delhi, India', ip: '10.0.0.15', status: '3 hours ago', icon: PhoneCall },
                      ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                              <session.icon size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{session.device}</p>
                              <p className="text-[10px] text-white/30">{session.location} · {session.ip}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-bold ${session.status === 'Current Session' ? 'text-lime-400' : 'text-white/30'}`}>{session.status}</span>
                            {session.status !== 'Current Session' && (
                              <button className="block text-[10px] text-red-400 hover:underline mt-1">Revoke Access</button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all">
                        Terminate All Other Sessions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── LOCALIZATION & WORKSPACE ───────────────────────── */}
              {activeTab === 'localization' && (
                <div className="space-y-6">
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Monitor size={20} className="text-cyan-400" /> Interface Preferences</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">System Timezone</label>
                        <select 
                          value={settings.localization.timezone}
                          onChange={(e) => updateSettings(employeeId, { localization: { ...settings.localization, timezone: e.target.value } })}
                          className="cyber-input"
                        >
                          <option>UTC+5:30 (India Standard Time)</option>
                          <option>UTC-8:00 (Pacific Time)</option>
                          <option>UTC+0:00 (Greenwich Mean Time)</option>
                          <option>UTC+9:00 (Japan Standard Time)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">System Language</label>
                        <select 
                          value={settings.localization.language}
                          onChange={(e) => updateSettings(employeeId, { localization: { ...settings.localization, language: e.target.value } })}
                          className="cyber-input"
                        >
                          <option>English (US)</option>
                          <option>Hindi (भारत)</option>
                          <option>Spanish (Español)</option>
                          <option>Japanese (日本語)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 block">UI Theme Engine</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.key}
                            onClick={() => applyTheme(theme.key)}
                            className={`p-4 rounded-2xl border text-left transition-all group
                              ${settings.theme === theme.key ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-white/15 bg-white/2'}`}
                          >
                            <div className="w-full h-12 rounded-xl mb-3 border border-white/10" style={{ background: theme.preview }} />
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{theme.label}</span>
                              {settings.theme === theme.key && <Check size={12} className="text-cyan-400" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Default Landing Module</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['profile', 'attendance', 'tasks', 'comms'].map((m) => (
                          <button
                            key={m}
                            onClick={() => updateSettings(employeeId, { landingPage: m })}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all
                              ${settings.landingPage === m ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-white/5 text-white/30 hover:text-white/50'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ROLES & PERMISSIONS ────────────────────────────── */}
              {activeTab === 'roles' && (
                <div className="space-y-6">
                  <div className="glass-card p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2
                        ${emp?.role === 'founding piller' ? 'border-amber-400 bg-amber-400/10 text-amber-400' : 'border-cyan-400 bg-cyan-400/10 text-cyan-400'}`}>
                        <Shield size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Access Level: {emp?.role}</h3>
                        <p className="text-white/40 text-sm">Your permissions are managed by the Master Admin.</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Assigned Capabilities</h4>
                      {[
                        { perm: 'Core Dashboard Access', has: true },
                        { perm: 'Comm-Link Board Posting', has: true },
                        { perm: 'Personal Finance Management', has: true },
                        { perm: 'Task Submission', has: true },
                        { perm: 'Global System Configuration', has: emp?.role === 'founding piller' || emp?.role === 'HR' },
                        { perm: 'Employee Data Access', has: emp?.role === 'founding piller' || emp?.role === 'HR' },
                        { perm: 'Master Admin Key Override', has: emp?.role === 'founding piller' },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/2 border border-white/5">
                          <span className="text-sm font-medium text-white/70">{p.perm}</span>
                          {p.has ? <Check size={14} className="text-lime-400" /> : <Lock size={14} className="text-white/10" />}
                        </div>
                      ))}
                    </div>

                    <div className="p-6 rounded-2xl bg-fuchsia-500/5 border border-fuchsia-500/20">
                      <h4 className="text-sm font-bold text-fuchsia-400 mb-2 flex items-center gap-2"><ShieldAlert size={16} /> Request Elevation</h4>
                      <p className="text-white/40 text-xs mb-4">Need access to a restricted module? Submit an elevation request to the HR department.</p>
                      <div className="flex gap-2">
                        <select className="cyber-input py-2 text-xs flex-1">
                          <option>Request Manager Access</option>
                          <option>Request Finance Write Access</option>
                          <option>Request HR Portal Access</option>
                        </select>
                        <button className="btn-cyber py-2 px-4 text-xs bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-400 hover:bg-fuchsia-500/20">Submit Ticket</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATION CENTER ────────────────────────────── */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Bell size={20} className="text-amber-400" /> Notification Engine</h3>
                    
                    <div className="space-y-3 mb-8">
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Channel Routing</h4>
                      <Toggle 
                        active={settings.notificationChannels.email} 
                        onClick={() => updateSettings(employeeId, { notificationChannels: { ...settings.notificationChannels, email: !settings.notificationChannels.email } })}
                        label="Email Communications" 
                        desc="System summaries and meeting invitations."
                      />
                      <Toggle 
                        active={settings.notificationChannels.push} 
                        onClick={() => updateSettings(employeeId, { notificationChannels: { ...settings.notificationChannels, push: !settings.notificationChannels.push } })}
                        label="Desktop Push Notifications" 
                        desc="Real-time alerts while you are active on the site."
                      />
                      <Toggle 
                        active={settings.notificationChannels.sms} 
                        onClick={() => updateSettings(employeeId, { notificationChannels: { ...settings.notificationChannels, sms: !settings.notificationChannels.sms } })}
                        label="SMS Critical Alerts" 
                        desc="Emergency system status and critical deadlines."
                      />
                      <Toggle 
                        active={settings.notificationChannels.inApp} 
                        onClick={() => updateSettings(employeeId, { notificationChannels: { ...settings.notificationChannels, inApp: !settings.notificationChannels.inApp } })}
                        label="In-App Messaging" 
                        desc="New messages in Comm-Link or DMs."
                      />
                    </div>

                    <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Moon size={16} className="text-indigo-400" /> Do Not Disturb (DND)</h4>
                          <p className="text-white/40 text-xs">Automatically pause non-critical alerts during scheduled hours.</p>
                        </div>
                        <button onClick={() => updateSettings(employeeId, { dndMode: { ...settings.dndMode, enabled: !settings.dndMode.enabled } })}
                          className={`w-11 h-6 rounded-full transition-all relative ${settings.dndMode.enabled ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-white/10'}`}>
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${settings.dndMode.enabled ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className={`grid grid-cols-2 gap-4 transition-all ${settings.dndMode.enabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <div>
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">DND Starts At</label>
                          <input type="time" value={settings.dndMode.start} onChange={(e) => updateSettings(employeeId, { dndMode: { ...settings.dndMode, start: e.target.value } })} className="cyber-input" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">DND Ends At</label>
                          <input type="time" value={settings.dndMode.end} onChange={(e) => updateSettings(employeeId, { dndMode: { ...settings.dndMode, end: e.target.value } })} className="cyber-input" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── THIRD-PARTY INTEGRATIONS ───────────────────────── */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Zap size={20} className="text-amber-400" /> Connected Apps</h3>
                    <p className="text-white/40 text-sm mb-8">Link your professional accounts for a unified workflow. No API keys required for simulation.</p>
                    
                    <div className="space-y-4">
                      {[
                        { id: 'github', label: 'GitHub Enterprise', icon: Github, color: 'white', desc: 'Sync repository activity and PR mentions.' },
                        { id: 'slack', label: 'Slack Workspace', icon: Slack, color: '#4A154B', desc: 'Forward Comm-Link updates to Slack channels.' },
                        { id: 'figma', label: 'Figma Dev Ops', icon: Figma, color: '#F24E1E', desc: 'Preview design files directly in tasks.' },
                        { id: 'teams', label: 'Microsoft Teams', icon: Laptop, color: '#5059C9', desc: 'Sync meeting calendar with Outlook.' },
                        { id: 'notion', label: 'Notion Workspace', icon: Layout, color: 'white', desc: 'Export task notes to team wiki pages.' },
                      ].map((item) => {
                        const isConnected = (settings.integrations as any)[item.id];
                        return (
                          <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-white/12 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform" style={{ color: item.color }}>
                                <item.icon size={24} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{item.label}</p>
                                <p className="text-xs text-white/30">{item.desc}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => updateSettings(employeeId, { integrations: { ...settings.integrations, [item.id]: !isConnected } })}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border
                                ${isConnected ? 'bg-lime-400/10 border-lime-400/40 text-lime-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                            >
                              {isConnected ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── DATA & PRIVACY ─────────────────────────────────── */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Database size={20} className="text-cyan-400" /> Compliance & Privacy</h3>
                    
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">Personal Data Portability</h4>
                            <p className="text-white/40 text-xs">Download a JSON archive of your activity logs and personal data.</p>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold hover:bg-cyan-400/20">
                            <Download size={14} /> Export Data
                          </button>
                        </div>
                        <div className="h-px bg-white/5 my-4" />
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">Activity Log Visibility</h4>
                            <p className="text-white/40 text-xs">Allow admins to see your real-time status and module activity.</p>
                          </div>
                          <Toggle active={true} onClick={() => {}} label="" />
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                        <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Danger Zone</h4>
                        <p className="text-white/40 text-xs mb-6">Deactivating your account will pause your shift tracking and task visibility. Complete data deletion requires an HR request.</p>
                        <div className="flex gap-4">
                          <button className="flex-1 py-3 rounded-xl border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                            <ShieldAlert size={14} /> Deactivate Account
                          </button>
                          <button className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                            <Trash2 size={14} /> Delete Identity
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Icons
function Sun(props: any) { return <SunIcon {...props} /> }
