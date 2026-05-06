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

type Module = 'profile' | 'attendance' | 'tasks' | 'comms' | 'meetings' | 'finance' | 'performance' | 'settings';

const NAV_ITEMS: { key: Module; label: string; icon: any; description: string }[] = [
  { key: 'profile', label: 'My Profile', icon: User, description: 'Profile & Emergency Contacts' },
  { key: 'attendance', label: 'Attendance', icon: Clock, description: '4-hr Shift · Punch In/Out' },
  { key: 'tasks', label: 'My Work', icon: ClipboardList, description: 'Assigned Tasks · Submit' },
  { key: 'comms', label: 'Comm-Link', icon: MessageSquare, description: 'Board · DMs · Media' },
  { key: 'meetings', label: 'Meetings', icon: Calendar, description: 'Upcoming Sessions' },
  { key: 'finance', label: 'Finance Vault', icon: DollarSign, description: 'Paystubs & History' },
  { key: 'performance', label: 'Performance', icon: Trophy, description: 'XP, Badges & Milestones' },
  { key: 'settings', label: 'Settings', icon: Settings, description: 'Theme · Profile · Preferences' },
];

export default function DashboardLayout() {
  const router = useRouter();
  const { session, setSession, employees, tasks, meetings, getSettings } = useStore();
  const [activeModule, setActiveModule] = useState<Module>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!session) { router.replace('/'); return; }
    if (session.type === 'admin') { router.replace('/admin'); }
  }, [session, router]);

  if (!session || session.type !== 'employee') return null;
  const emp = employees.find(e => e.id === session.employeeId);
  if (!emp) { router.replace('/'); return null; }

  const settings = getSettings(emp.id);
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
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className="flex flex-col h-full p-4">
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.15))', border: '1px solid rgba(34,211,238,0.3)' }}>
          <Shield size={18} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-black text-white leading-none">NOVELLEYX</p>
          <p className="text-xs text-white/30 font-mono">PORTAL v2.0</p>
        </div>
      </div>

      <div className="glass-card p-3 mb-5 flex items-center gap-3">
        {emp.profilePhoto
          ? <img src={emp.profilePhoto} className="w-10 h-10 rounded-xl border border-white/10 object-cover" alt={emp.name} />
          : <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-10 h-10 rounded-xl border border-white/10" alt={emp.name} />
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{emp.name}</p>
          <p className="text-xs text-cyan-400/70 truncate">{emp.role || emp.department}</p>
        </div>
        <span className={emp.status === 'APPROVED' ? 'badge-approved text-xs' : 'badge-pending text-xs'}>
          {emp.status === 'APPROVED' ? 'ACTIVE' : emp.status}
        </span>
      </div>

      <div className="space-y-0.5 flex-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setActiveModule(key); setSidebarOpen(false); }}
            className={`nav-item w-full text-left group relative ${activeModule === key ? 'active' : ''}`}
            title={label}>
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            {key === 'tasks' && openTasks > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs flex items-center justify-center font-bold">{openTasks}</span>
            )}
            {key === 'meetings' && upcomingMeetings > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 text-xs flex items-center justify-center font-bold">{upcomingMeetings}</span>
            )}
            {activeModule === key && <ChevronRight size={13} />}
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden lg:block">
              {NAV_ITEMS.find(n => n.key === key)?.description}
            </div>
          </button>
        ))}
      </div>

      <button onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-white/30 hover:text-red-400 hover:bg-red-400/8 transition-all mt-2 w-full group"
        title="Sign out">
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-white/5 h-screen sticky top-0"
        style={{ background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(20px)' }}>
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 border-r border-white/10"
              style={{ background: 'rgba(3,7,18,0.97)', backdropFilter: 'blur(20px)' }}>
              <div className="flex justify-end p-3">
                <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 border-b border-white/5 h-14 flex items-center px-4 gap-3"
          style={{ background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-cyan-400 transition-colors"><Menu size={22} /></button>
          <p className="font-bold text-white text-sm flex-1">{NAV_ITEMS.find(n => n.key === activeModule)?.label}</p>
          <div className="flex items-center gap-2">
            {openTasks > 0 && <span className="badge-pending text-xs">{openTasks} tasks</span>}
            <Bell size={18} className="text-white/30" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
              <ActiveModuleComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
