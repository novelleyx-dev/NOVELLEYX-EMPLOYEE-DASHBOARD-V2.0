'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Leaf, Waves, Sparkles, Zap, Camera, User, Save, Check } from 'lucide-react';
import { useStore, ThemeMode } from '@/store/useStore';

const THEMES: { key: ThemeMode; label: string; icon: any; desc: string; preview: string }[] = [
  { key: 'cyber-dark', label: 'Cyber Dark', icon: Zap, desc: 'Original neon glassmorphism', preview: 'linear-gradient(135deg, #030712, #0f1729)' },
  { key: 'night', label: 'Midnight', icon: Moon, desc: 'Deep navy night mode', preview: 'linear-gradient(135deg, #0a0e1a, #111827)' },
  { key: 'day', label: 'Daylight', icon: Sun, desc: 'Clean light interface', preview: 'linear-gradient(135deg, #f0f4ff, #e8f0fe)' },
  { key: 'forest', label: 'Forest Zen', icon: Leaf, desc: 'Nature-inspired greenery', preview: 'linear-gradient(135deg, #0d1f0f, #1a2e1c)' },
  { key: 'ocean', label: 'Deep Ocean', icon: Waves, desc: 'Calm ocean depths', preview: 'linear-gradient(135deg, #050e1a, #0a1628)' },
  { key: 'zen', label: 'Zen Garden', icon: Sparkles, desc: 'Soft earthy tones', preview: 'linear-gradient(135deg, #1a1510, #2a1e14)' },
];

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

  const [bio, setBio] = useState(settings.bio || '');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyTheme = (theme: ThemeMode) => {
    const vars = THEME_VARS[theme];
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    document.body.style.background = vars['--bg'];
    document.body.style.color = vars['--text'];
    updateSettings(employeeId, { theme });
  };

  useEffect(() => { applyTheme(settings.theme); }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      updateProfilePhoto(employeeId, url);
      updateSettings(employeeId, { profilePhoto: url });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateSettings(employeeId, { bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-white/40 text-sm">Personalize your workspace · themes · profile · nature vibes</p>
      </div>

      {/* Profile Photo */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><User size={14} className="text-cyan-400" /> Profile</h3>
        <div className="flex items-center gap-5">
          <div className="relative group">
            {emp?.profilePhoto ? (
              <img src={emp.profilePhoto} className="w-20 h-20 rounded-2xl object-cover border border-white/10" alt="profile" />
            ) : (
              <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp?.avatarSeed}&backgroundColor=0a0a1a`} className="w-20 h-20 rounded-2xl border border-white/10" alt="avatar" />
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">{emp?.name}</p>
            <p className="text-sm text-white/40">{emp?.department} · {emp?.role}</p>
            <button onClick={() => fileRef.current?.click()} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
              <Camera size={11} /> Update Photo
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div className="mt-4">
          <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Bio</label>
          <textarea className="cyber-input resize-none" rows={3} placeholder="Tell your team about yourself…" value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <button onClick={handleSave} className="btn-cyber flex items-center gap-2 py-2 px-5 text-sm mt-3">
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Profile</>}
        </button>
      </div>

      {/* Theme Selection */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2"><Sparkles size={14} className="text-cyan-400" /> Theme & Vibe</h3>
        <p className="text-white/40 text-xs mb-5">Choose your workspace atmosphere — includes nature-inspired themes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map(({ key, label, icon: Icon, desc, preview }) => {
            const active = settings.theme === key;
            return (
              <motion.button key={key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => applyTheme(key)}
                className={`relative p-4 rounded-xl border text-left transition-all
                  ${active ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-white/8 hover:border-white/20'}`}
                style={{ background: active ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.03)' }}>
                {active && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center"><Check size={10} className="text-black" /></span>}
                <div className="w-full h-10 rounded-lg mb-3" style={{ background: preview, border: '1px solid rgba(255,255,255,0.1)' }} />
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={13} className={active ? 'text-cyan-400' : 'text-white/50'} />
                  <span className={`text-sm font-bold ${active ? 'text-white' : 'text-white/70'}`}>{label}</span>
                </div>
                <p className="text-xs text-white/40">{desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white text-sm mb-4">Preferences</h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5">
          <div>
            <p className="text-sm font-semibold text-white">Notifications</p>
            <p className="text-xs text-white/40">Show alerts for new tasks &amp; messages</p>
          </div>
          <button onClick={() => updateSettings(employeeId, { notificationsEnabled: !settings.notificationsEnabled })}
            className={`w-12 h-6 rounded-full transition-all relative ${settings.notificationsEnabled ? 'bg-cyan-400' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${settings.notificationsEnabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
