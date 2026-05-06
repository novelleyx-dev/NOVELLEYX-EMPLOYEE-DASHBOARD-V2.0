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
  const { session, setSession, employees, tasks, meetings, getSettings } = useStore();
  const [activeModule, setActiveModule] = useState<Module>('profile');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
        'day': { '--bg': '#f8fafc', '--accent': '#2563eb', '--accent2': '#7c3aed', '--card-bg': 'rgba(255,255,255,0.9)', '--card-border': 'rgba(0,0,0,0.08)', '--text': '#0f172a' },
        'forest': { '--bg': '#0d1f0f', '--accent': '#4ade80', '--accent2': '#86efac', '--card-bg': 'rgba(74,222,128,0.04)', '--card-border': 'rgba(74,222,128,0.12)', '--text': '#ecfdf5' },
        'ocean': { '--bg': '#050e1a', '--accent': '#38bdf8', '--accent2': '#818cf8', '--card-bg': 'rgba(56,189,248,0.04)', '--card-border': 'rgba(56,189,248,0.1)', '--text': '#e0f2fe' },
        'zen': { '--bg': '#1a1510', '--accent': '#d97706', '--accent2': '#92400e', '--card-bg': 'rgba(217,119,6,0.06)', '--card-border': 'rgba(217,119,6,0.15)', '--text': '#fef3c7' },
      };
      const currentVars = vars[settings.theme];
      if (currentVars) {
        Object.entries(currentVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v as string));
        document.body.style.background = currentVars['--bg'];
        document.body.style.color = currentVars['--text'];
      }
    }
  }, [settings?.theme]);

  useEffect(() => {
    if (!session) { router.replace('/'); return; }
    if (session.type === 'admin') { router.replace('/admin'); }
  }, [session, router]);

  if (!session || session.type !== 'employee' || !emp) return null;

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
    <div className="min-h-screen transition-colors duration-500">
      {/* Header Bar */}
      <header className="header-bar">
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

      <main className="page-content-wrapper max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
    </div>
  );
}
