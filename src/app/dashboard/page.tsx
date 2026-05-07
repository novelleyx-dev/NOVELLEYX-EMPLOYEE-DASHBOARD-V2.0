'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Clock, DollarSign, Trophy, MessageSquare, ClipboardList,
  Calendar, Settings, LogOut, Menu, X, Shield, ChevronRight, Bell
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProfileModule from '@/components/modules/ProfileModule';
import AttendanceModule from '@/components/modules/AttendanceModule';
import FinanceModule from '@/components/modules/FinanceModule';
import PerformanceModule from '@/components/modules/PerformanceModule';
import CommLinkModule from '@/components/modules/CommLinkModule';
import TasksModule from '@/components/modules/TasksModule';
import MeetingsModule from '@/components/modules/MeetingsModule';
import SettingsModule from '@/components/modules/SettingsModule';

type Module = 'profile' | 'attendance' | 'tasks' | 'comms' | 'meetings' | 'finance' | 'performance' | 'settings' | 'archive';

const NAV_ITEMS: { key: Module; label: string; icon: any; description: string }[] = [
  { key: 'profile', label: 'My Profile', icon: User, description: 'Profile & Emergency Contacts' },
  { key: 'attendance', label: 'Attendance', icon: Clock, description: '4-hr Shift · Punch In/Out' },
  { key: 'tasks', label: 'My Work', icon: ClipboardList, description: 'Assigned Tasks · Submit' },
  { key: 'comms', label: 'Comm-Link', icon: MessageSquare, description: 'Board · DMs · Media' },
  { key: 'meetings', label: 'Meetings', icon: Calendar, description: 'Upcoming Sessions' },
  { key: 'archive', label: 'Archive', icon: Clock, description: 'Attendance History until 3000' },
  { key: 'finance', label: 'Finance Vault', icon: DollarSign, description: 'Paystubs & History' },
  { key: 'performance', label: 'Performance', icon: Trophy, description: 'XP, Badges & Milestones' },
  { key: 'settings', label: 'Settings', icon: Settings, description: 'Theme · Profile · Preferences' },
];

import CalendarModule from '@/components/modules/CalendarModule';

export default function DashboardLayout() {
  const router = useRouter();
  const { _hasHydrated, session, setSession, employees, tasks, meetings, getSettings, syncWithCloud } = useStore();
  const [activeModule, setActiveModule] = useState<Module>('profile');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenWelcome = sessionStorage.getItem('empWelcome');
    if (!hasSeenWelcome) {
      setWelcomeOpen(true);
      sessionStorage.setItem('empWelcome', 'true');
    }

    // Initial Cloud Sync
    if (_hasHydrated) syncWithCloud();

    // Periodic Auto-Sync
    const syncInterval = setInterval(() => {
      if (_hasHydrated) syncWithCloud();
    }, 60000); // 1 minute for employees

    return () => clearInterval(syncInterval);
  }, [_hasHydrated]);

  const emp = session?.type === 'employee' ? employees.find(e => e.id === session.employeeId) : null;
  const settings = emp ? getSettings(emp.id) : null;

  useEffect(() => {
    if (settings?.landingPage) {
      setActiveModule(settings.landingPage as Module);
    }
  }, []);

  useEffect(() => {
    if (settings?.theme) {
      const vars: any = {
        'cyber-dark': { '--bg': '#030712', '--accent': '#22d3ee', '--accent2': '#a855f7', '--card-bg': 'rgba(255,255,255,0.04)', '--card-border': 'rgba(255,255,255,0.08)', '--text': '#f1f5f9' },
        'night': { '--bg': '#0a0e1a', '--accent': '#818cf8', '--accent2': '#a78bfa', '--card-bg': 'rgba(129,140,248,0.05)', '--card-border': 'rgba(129,140,248,0.12)', '--text': '#e2e8f0' },
        'day': { '--bg': '#1B2631', '--accent': '#5DADE2', '--accent2': '#AED6F1', '--card-bg': 'rgba(255,255,255,0.03)', '--card-border': 'rgba(255,255,255,0.08)', '--text': '#08141eff' },
        'forest': { '--bg': '#0d1f0f', '--accent': '#4ade80', '--accent2': '#86efac', '--card-bg': 'rgba(74,222,128,0.04)', '--card-border': 'rgba(74,222,128,0.12)', '--text': '#ecfdf5' },
        'ocean': { '--bg': '#183f72ff', '--accent': '#38bdf8', '--accent2': '#818cf8', '--card-bg': 'rgba(56,189,248,0.04)', '--card-border': 'rgba(56,189,248,0.1)', '--text': '#e0f2fe' },
        'zen': { '--bg': '#1a1510', '--accent': '#d97706', '--accent2': '#92400e', '--card-bg': 'rgba(217,119,6,0.06)', '--card-border': 'rgba(217,119,6,0.15)', '--text': '#fef3c7' },
      };
      const currentVars = vars[settings.theme];
      if (currentVars) {
        Object.entries(currentVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v as string));

        if (settings.customBackground) {
          document.body.style.backgroundImage = `url(${settings.customBackground})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
        } else {
          document.body.style.backgroundImage = 'none';
          document.body.style.background = currentVars['--bg'];
        }
        document.body.style.color = currentVars['--text'];
      }
    }
  }, [settings?.theme, settings?.customBackground]);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    if (!session) { router.replace('/'); return; }
    if (session.type === 'admin') { router.replace('/admin'); }
  }, [session, router, mounted, _hasHydrated]);

  if (!mounted || !_hasHydrated || !session || session.type !== 'employee' || !emp) return null;

  const openTasks = tasks.filter(t => t.assignedTo === emp.id && t.status === 'OPEN').length;
  const upcomingMeetings = meetings.filter(m => new Date(m.scheduledAt) > new Date() && (m.attendees.includes('all') || m.attendees.includes(emp.id))).length;

  const handleLogout = () => { setSession(null); router.push('/'); };

  const ActiveModuleComponent = () => {
    switch (activeModule) {
      case 'profile': return <ProfileModule employeeId={emp.id} />;
      case 'attendance': return <AttendanceModule employeeId={emp.id} />;
      case 'tasks': return <TasksModule employeeId={emp.id} />;
      case 'comms': return <CommLinkModule employeeId={emp.id} />;
      case 'meetings': return <MeetingsModule employeeId={emp.id} />;
      case 'finance': return <FinanceModule employeeId={emp.id} />;
      case 'performance': return <PerformanceModule employeeId={emp.id} />;
      case 'settings': return <SettingsModule employeeId={emp.id} />;
      case 'archive': return <CalendarModule employeeId={emp.id} />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 relative overflow-x-hidden">
      {/* Premium Workspace Background Image */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/admin-bg.jpg"
          className="w-full h-full object-cover opacity-20 mix-blend-multiply scale-105"
          alt="background"
          style={{ filter: 'contrast(1.1) brightness(0.5)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/95" />
        <div className="absolute inset-0 bg-[#0a111a]/80" />
      </div>
      <div className="admin-grid-overlay opacity-10 pointer-events-none" />
      {/* Header Bar */}
      <header className="header-bar relative z-[1001]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.15))', border: '1px solid rgba(34,211,238,0.3)' }}>
            <Shield size={18} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-none tracking-tight">NOVELLEYX</p>
            <p className="text-[10px] text-cyan-400/50 font-mono">EMPLOYEE v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 mr-4 border-r border-white/10 pr-4">
            <div className="text-right">
              <p className="text-xs font-bold text-white">{emp.name}</p>
              <p className="text-[10px] text-white/40">{emp.department}</p>
            </div>
            {emp.profilePhoto
              ? <img src={emp.profilePhoto} className="w-8 h-8 rounded-lg border border-white/10 object-cover" alt={emp.name} />
              : <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-8 h-8 rounded-lg border border-white/10" alt={emp.name} />
            }
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <Menu size={20} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 glass-card p-2 z-50 border border-white/10"
                  >
                    <button onClick={() => { setActiveModule('profile'); setUserMenuOpen(false); }} className="nav-item w-full mb-1">
                      <User size={16} /> My Profile
                    </button>
                    <button onClick={() => { setActiveModule('settings'); setUserMenuOpen(false); }} className="nav-item w-full mb-1">
                      <Settings size={16} /> Settings
                    </button>
                    <div className="h-px bg-white/10 my-2 mx-2" />
                    <button onClick={handleLogout} className="nav-item w-full text-red-400 hover:bg-red-400/10">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Floating Navigation */}
      <div className="floating-nav-container">
        <nav className="floating-nav">
          {NAV_ITEMS.filter(item => !['settings', 'profile'].includes(item.key)).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveModule(key)}
              className={`floating-nav-item ${activeModule === key ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span className="hidden md:block">{label}</span>
              {key === 'tasks' && openTasks > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] flex items-center justify-center font-bold">{openTasks}</span>
              )}
              {key === 'meetings' && upcomingMeetings > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-cyan-400 text-black text-[10px] flex items-center justify-center font-bold">{upcomingMeetings}</span>
              )}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1 self-stretch" />
          <button
            onClick={() => setActiveModule('profile')}
            className={`floating-nav-item ${activeModule === 'profile' ? 'active' : ''}`}
            title="Profile"
          >
            <User size={16} />
          </button>
          <button
            onClick={() => setActiveModule('settings')}
            className={`floating-nav-item ${activeModule === 'settings' ? 'active' : ''}`}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </nav>
      </div>

      <main className="page-content-wrapper relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <ActiveModuleComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Welcome Message Overlay */}
      <AnimatePresence>
        {welcomeOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setWelcomeOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-card p-10 text-center border-cyan-500/30"
            >
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <Shield size={40} className="text-cyan-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome, {emp.name}</h2>
              <p className="text-cyan-400 font-mono text-sm mb-6 uppercase tracking-widest">{emp.role} · {emp.department}</p>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Your personal NovelleyX workspace is active.
                Track your shifts, manage tasks, and connect with your team in real-time.
              </p>
              <button
                onClick={() => setWelcomeOpen(false)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
              >
                Access Workspace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
