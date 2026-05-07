'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, AlertCircle, LogOut, Search, CheckCircle2, XCircle,
  RefreshCw, Loader2, UserCheck, UserX, MessageSquare, ClipboardList,
  Calendar, FolderOpen, Activity, LayoutDashboard, Menu, Settings, Bell,
  ExternalLink, Github, Globe, Instagram, Facebook, Youtube, Phone, FileBadge, 
  Clock
} from 'lucide-react';
import { useStore, Employee, Designation } from '@/store/useStore';
import AdminTasksModule from '@/components/modules/admin/TasksModule';
import AdminChatModule from '@/components/modules/admin/ChatModule';
import AdminMeetingsModule from '@/components/modules/admin/MeetingsModule';
import AdminFilesModule from '@/components/modules/admin/FilesModule';
import SettingsModule from '@/components/modules/SettingsModule';

type AdminTab = 'overview' | 'employees' | 'attendance' | 'tasks' | 'comms' | 'meetings' | 'files' | 'badges' | 'settings' | 'tickets';

const TABS: { key: AdminTab; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'employees', label: 'Workforce', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: Clock },
  { key: 'tasks', label: 'Work', icon: ClipboardList },
  { key: 'comms', label: 'Comms', icon: MessageSquare },
  { key: 'meetings', label: 'Meetings', icon: Calendar },
  { key: 'files', label: 'Files', icon: FolderOpen },
  { key: 'badges', label: 'Badges', icon: SparklesIcon },
  { key: 'tickets', label: 'Tickets', icon: AlertCircle },
];

function SparklesIcon({ size }: { size: number }) { return <ShieldCheck size={size} /> }

export default function AdminDashboard() {
  const router = useRouter();
  const { 
    _hasHydrated, session, setSession, employees, updateEmployeeStatus, deleteEmployee, 
    tasks, meetings, getSettings, updateEmployeeRole, attendance, 
    adminNotifications, markAdminNotificationRead, monthlyProductivity, 
    updateMonthlyProductivity, companyProgress, updateCompanyProgress, 
    updateEmployeeEvaluation, scheduleMeeting, assignTask, updateTaskStatus, 
    extendTaskDeadline, sendFile, updateSettings, addEmployee, syncWithCloud, 
    isSyncing, lastSync, adminProfile
  } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', role: 'employee' as Designation });
  const [manualPin, setManualPin] = useState<string | null>(null);


  const handleManualAdd = () => {
    if (!newEmp.name || !newEmp.email) return;
    const pin = addEmployee({ ...newEmp, department: '' });
    setManualPin(pin);
    setNewEmp({ name: '', email: '', role: 'employee' });
  };

  useEffect(() => {
    setMounted(true);
    const hasSeenWelcome = sessionStorage.getItem('adminWelcome');
    if (!hasSeenWelcome) {
      setWelcomeOpen(true);
      sessionStorage.setItem('adminWelcome', 'true');
    }

    // Cross-tab Synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'novelleyx-store-v6') {
        useStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    // Initial Cloud Sync
    if (_hasHydrated) syncWithCloud();
    
    // Periodic Auto-Sync (every 30s)
    const syncInterval = setInterval(() => {
      if (_hasHydrated) syncWithCloud();
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(syncInterval);
    };
  }, []);

  const settings = getSettings('admin');

  useEffect(() => {
    if (settings?.theme) {
      const vars: any = {
        'cyber-dark': { '--bg': '#030712', '--accent': '#22d3ee', '--accent2': '#a855f7', '--card-bg': 'rgba(255,255,255,0.04)', '--card-border': 'rgba(255,255,255,0.08)', '--text': '#f1f5f9' },
        'night': { '--bg': '#0a0e1a', '--accent': '#818cf8', '--accent2': '#a78bfa', '--card-bg': 'rgba(129,140,248,0.05)', '--card-border': 'rgba(129,140,248,0.12)', '--text': '#e2e8f0' },
        'day': { '--bg': '#1B2631', '--accent': '#5DADE2', '--accent2': '#AED6F1', '--card-bg': 'rgba(255,255,255,0.03)', '--card-border': 'rgba(255,255,255,0.08)', '--text': '#E1E8ED' },
        'forest': { '--bg': '#0d1f0f', '--accent': '#4ade80', '--accent2': '#86efac', '--card-bg': 'rgba(74,222,128,0.04)', '--card-border': 'rgba(74,222,128,0.12)', '--text': '#ecfdf5' },
        'ocean': { '--bg': '#050e1a', '--accent': '#38bdf8', '--accent2': '#818cf8', '--card-bg': 'rgba(56,189,248,0.04)', '--card-border': 'rgba(56,189,248,0.1)', '--text': '#e0f2fe' },
        'zen': { '--bg': '#1a1510', '--accent': '#d97706', '--accent2': '#92400e', '--card-bg': 'rgba(217,119,6,0.06)', '--card-border': 'rgba(217,119,6,0.15)', '--text': '#fef3c7' },
      };
      const currentVars = vars[settings.theme];
      if (currentVars) {
        Object.entries(currentVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v as string));
        document.body.style.color = currentVars['--text'];
        
        if (settings.customBackground) {
          document.body.style.backgroundImage = `url(${settings.customBackground})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
        } else {
          document.body.style.backgroundImage = 'none';
          document.body.style.background = currentVars['--bg'];
        }
      }
    }
  }, [settings?.theme, settings?.customBackground]);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    const currentEmpCheck = session?.type === 'employee' ? employees.find(e => e.id === session.employeeId) : null;
    const isHR = currentEmpCheck?.role === 'HR';
    
    if (!session || (session.type !== 'admin' && !isHR)) {
      router.replace('/');
    }
  }, [session, router, mounted, _hasHydrated, employees]);

  const currentEmpCheck = session?.type === 'employee' ? employees.find(e => e.id === session.employeeId) : null;
  const isHR = currentEmpCheck?.role === 'HR';

  if (!mounted || !_hasHydrated || !session || (session.type !== 'admin' && !isHR)) return null;

  const pending = employees.filter(e => e.status === 'PENDING').length;
  const approved = employees.filter(e => e.status === 'APPROVED').length;
  const rejected = employees.filter(e => e.status === 'REJECTED').length;
  const openTasks = tasks.filter(t => t.status === 'OPEN').length;
  const submittedTasks = tasks.filter(t => t.status === 'SUBMITTED').length;
  const upcomingMeetings = meetings.filter(m => new Date(m.scheduledAt) > new Date()).length;

  const filtered = employees.filter(e => {
    const matchStatus = filter === 'ALL' || e.status === filter;
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setProcessing(id + action);
    await new Promise(r => setTimeout(r, 700));
    updateEmployeeStatus(id, action);
    
    // Auto-read related notification
    const relatedNotif = adminNotifications.find(n => n.relatedId === id && n.type === 'SYSTEM');
    if (relatedNotif) markAdminNotificationRead(relatedNotif.id);
    
    setProcessing(null);
  };

  const liveEmployees = employees.filter(e => attendance.some((a: any) => a.employeeId === e.id && !a.clockOut));
  const liveCount = liveEmployees.length;

  const roleSegregation = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deptSegregation = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const downloadEmployeeData = () => {
    const dataString = employees.map(e => 
      `Name: ${e.name}\nEmail: ${e.email}\nRole: ${e.role}\nDepartment: ${e.department}\nStatus: ${e.status}\nPIN: ${e.pin}\nJoined: ${new Date(e.createdAt).toLocaleDateString()}\n--------------------------`
    ).join('\n');
    
    const blob = new Blob([dataString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NovelleyX_Employee_Data.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: number | string; color: string; sub?: string }) => (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} className="glass-card p-5 flex items-center gap-4 cursor-default group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `rgba(${color}, 0.1)`, border: `1px solid rgba(${color}, 0.3)` }}>
        <Icon size={22} style={{ color: `rgb(${color})` }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black text-white mt-0.5">{value}</p>
        </div>
        {sub && <p className="text-xs text-white/30 truncate">{sub}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen text-slate-200 relative overflow-x-hidden">
      {/* Premium Admin Background Image */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="/admin-bg.jpg" 
          className="w-full h-full object-cover mix-blend-overlay scale-105"
          style={{ opacity: 0.15 }}
          alt="background"
        />
      </div>
      <div className="admin-grid-overlay opacity-10 pointer-events-none" />

      <header className="header-bar relative z-[1001]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(217,70,239,0.3), rgba(168,85,247,0.2))', border: '1px solid rgba(217,70,239,0.4)' }}>
            <ShieldCheck size={18} className="text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">COMMAND CENTER</h1>
            <p className="text-[10px] text-fuchsia-400/70 font-mono">ADMIN PORTAL v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 mr-4 border-r border-white/10 pr-4">
            <div className="text-right">
              <p className="text-xs font-bold text-white">{isHR ? currentEmpCheck?.name : adminProfile.name}</p>
              <p className="text-[10px] text-cyan-400">{isHR ? 'HR CONTROL' : 'ADMIN CONTROL'}</p>
            </div>
            {isHR ? (
              currentEmpCheck?.profilePhoto
                ? <img src={currentEmpCheck.profilePhoto} className="w-8 h-8 rounded-lg border border-white/10 object-cover" alt={currentEmpCheck.name} />
                : <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${currentEmpCheck?.avatarSeed}&backgroundColor=0a0a1a`} className="w-8 h-8 rounded-lg border border-white/10" alt="avatar" />
            ) : (
              adminProfile.photo
                ? <img src={adminProfile.photo} className="w-8 h-8 rounded-lg border border-white/10 object-cover" alt="admin profile" />
                : <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400"><ShieldCheck size={16} /></div>
            )}
            <div className="flex items-center gap-3 ml-2">
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`p-2 rounded-xl border transition-all relative ${notifOpen ? 'bg-amber-400/10 border-amber-400 text-amber-400' : 'border-white/5 text-white/40 hover:bg-white/5 hover:text-white'}`}
                >
                  <Bell size={18} />
                  {adminNotifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 glass-card p-3 z-50 border border-white/10"
                        style={{ backgroundColor: 'var(--bg)' }}
                      >
                        <div className="flex justify-between items-center mb-3 px-2 border-b border-white/5 pb-2">
                          <h4 className="text-xs font-black text-white/40 uppercase tracking-widest">Command Center Alerts</h4>
                          {adminNotifications.length > 0 && (
                            <button 
                              onClick={() => adminNotifications.forEach(n => markAdminNotificationRead(n.id))}
                              className="text-[9px] text-cyan-400 hover:text-cyan-300 transition-colors uppercase font-bold tracking-tighter"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                          {adminNotifications.length === 0 ? (
                            <div className="py-12 text-center">
                              <Bell size={24} className="mx-auto mb-2 opacity-10 text-white" />
                              <p className="text-[10px] text-white/20 uppercase tracking-widest">No active alerts</p>
                            </div>
                          ) : (
                            adminNotifications
                              .filter(n => {
                                // AUTO-FILTER: Only show 'New Registration' alerts for employees who are still PENDING
                                // This solves the 'old ones coming and not approvible' problem
                                if (n.type === 'SYSTEM' && n.title === 'New Registration' && n.relatedId) {
                                  const emp = employees.find(e => e.id === n.relatedId);
                                  return emp && emp.status === 'PENDING';
                                }
                                return true;
                              })
                              .map(n => (
                                <div 
                                  key={n.id} 
                                  onClick={() => markAdminNotificationRead(n.id)}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${n.read ? 'bg-white/2 border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:border-cyan-400/30'}`}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${n.type === 'TICKET' ? 'text-fuchsia-400' : 'text-cyan-400'}`}>{n.title}</p>
                                    {!n.read && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                                  </div>
                                  <p className="text-[11px] text-white/70 leading-relaxed font-medium">{n.message}</p>
                                  
                                  {n.type === 'SYSTEM' && n.relatedId && employees.find(e => e.id === n.relatedId)?.status === 'PENDING' && !isHR && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleAction(n.relatedId!, 'APPROVED'); }}
                                        className="flex-1 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleAction(n.relatedId!, 'REJECTED'); }}
                                        className="flex-1 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}

                                  {n.type === 'TICKET' && n.relatedId && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveTab('tickets'); setNotifOpen(false); }}
                                      className="w-full mt-2 py-1.5 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 text-[9px] font-black uppercase tracking-widest border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-all"
                                    >
                                      Review Support Ticket
                                    </button>
                                  )}

                                  <p className="text-[9px] text-white/20 mt-2 font-mono">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              ))
                          )}
                          {adminNotifications.length > 0 && adminNotifications.filter(n => {
                             if (n.type === 'SYSTEM' && n.title === 'New Registration' && n.relatedId) {
                               const emp = employees.find(e => e.id === n.relatedId);
                               return emp && emp.status === 'PENDING';
                             }
                             return true;
                          }).length === 0 && (
                            <div className="py-8 text-center text-white/20 text-[10px] uppercase tracking-widest">
                              All registrations processed
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => syncWithCloud()}
                disabled={isSyncing}
                className={`p-2 rounded-xl border transition-all ${isSyncing ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400' : 'border-white/5 text-white/40 hover:bg-white/5 hover:text-white'}`}
                title={lastSync ? `Last Synced: ${new Date(lastSync).toLocaleTimeString()}` : 'Sync with Cloud'}
              >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="p-2 rounded-xl border border-white/5 text-white/40 hover:bg-white/5 hover:text-white transition-all"
                title="Refresh System"
              >
                <Loader2 size={18} />
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-xl border transition-all ${activeTab === 'settings' ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/5 text-white/40 hover:bg-white/5 hover:text-white'}`}
                title="Admin Settings"
              >
                <Settings size={18} />
              </button>
              {isHR && (
                <button onClick={() => router.push('/dashboard')} className="btn-approve flex items-center gap-2 py-2 px-4 text-xs">
                  My Dashboard
                </button>
              )}
              <button onClick={() => setSession(null)} className="btn-reject flex items-center gap-2 py-2 px-4 text-xs">
                <LogOut size={14} /> Exit System
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Navigation */}
      <div className="floating-nav-container">
        <nav className="floating-nav">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button 
              key={key} 
              onClick={() => setActiveTab(key)}
              className={`floating-nav-item ${activeTab === key ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span className="hidden md:block">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <main className="page-content-wrapper relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Total Workforce" value={employees.length} color="93,173,226" />
                  <StatCard icon={Activity} label="Currently Live" value={liveCount} color="132,204,22" sub={`${Math.round((liveCount / (approved || 1)) * 100)}% Engagement`} />
                  <StatCard icon={Clock} label="Today's Hours" value={`${Math.floor(attendance.filter(a => new Date(a.clockIn).toDateString() === new Date().toDateString()).reduce((s, a) => s + (a.shiftDuration || 0), 0) / 60)}h`} color="91,192,222" />
                  <StatCard icon={ClipboardList} label="Open Tasks" value={openTasks} color="129,140,248" sub={`${submittedTasks} awaiting review`} />
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Workforce Attendance Analytics */}
                  <div className="glass-card p-6 border-cyan-400/10">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-cyan-400" /> Workforce Attendance
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Present Today</p>
                          <p className="text-lg font-black text-white">{liveCount} / {approved}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <UserCheck size={20} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Engagement Rate</p>
                          <p className="text-lg font-black text-white">{approved > 0 ? Math.round((liveCount / approved) * 100) : 0}%</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <Activity size={20} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Velocity Analytics */}
                  <div className="glass-card p-6 border-fuchsia-400/10">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <ClipboardList size={16} className="text-fuchsia-400" /> System Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Awaiting Review</p>
                          <p className="text-lg font-black text-white">{submittedTasks}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <AlertCircle size={20} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Critical Deadlines</p>
                          <p className="text-lg font-black text-white">{tasks.filter(t => t.status === 'OPEN' && new Date(t.deadline) < new Date()).length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                          <Activity size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {liveCount > 0 && (
                  <div className="glass-card p-5 border-emerald-500/20">
                    <h3 className="font-bold text-emerald-400 text-sm mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Now</h3>
                    <div className="flex flex-wrap gap-3">
                      {liveEmployees.map(emp => (
                        <div key={emp.id} className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                          {emp.profilePhoto ? (
                            <img src={emp.profilePhoto} className="w-6 h-6 rounded-lg object-cover" alt={emp.name} />
                          ) : (
                            <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-6 h-6 rounded-lg" alt={emp.name} />
                          )}
                          <span className="text-xs font-bold text-white/80">{emp.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Segregations Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-amber-400" /> Role Segregation
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(roleSegregation).map(([role, count]) => (
                        <div key={role} className="p-3 rounded-xl bg-white/2 border border-white/5 text-center">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1 truncate">{role}</p>
                          <p className="text-xl font-black text-white">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Users size={16} className="text-cyan-400" /> Department Distribution
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(deptSegregation).map(([dept, count]) => (
                        <div key={dept} className="p-3 rounded-xl bg-white/2 border border-white/5 text-center">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1 truncate">{dept || 'Unassigned'}</p>
                          <p className="text-xl font-black text-white">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6 border-emerald-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Now</h3>
                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{liveCount} Active Sessions</span>
                    </div>
                    {liveCount === 0 ? (
                      <div className="py-8 text-center text-white/10 border border-dashed border-white/10 rounded-xl">
                        <p className="text-xs">No employees are currently clocked in.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {liveEmployees.map(emp => (
                          <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                            <div className="flex items-center gap-2">
                              <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-8 h-8 rounded-lg border border-white/10" alt={emp.name} />
                              <div>
                                <p className="text-sm font-semibold text-white">{emp.name}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-tighter">
                                  {attendance.find(a => a.employeeId === emp.id && !a.clockOut)?.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-emerald-400">ACTIVE</p>
                              <p className="text-[9px] text-white/20">Since {new Date(attendance.find(a => a.employeeId === emp.id && !a.clockOut)?.clockIn || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="glass-card p-6 border-cyan-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-cyan-400 text-sm flex items-center gap-2"><Users size={14} /> Add New Staff</h3>
                      <button onClick={() => setShowAddForm(!showAddForm)} className="text-[10px] text-cyan-400 hover:underline uppercase font-bold tracking-widest">{showAddForm ? 'Hide' : 'Manual Entry'}</button>
                    </div>
                    {showAddForm ? (
                      <div className="space-y-3">
                        <input type="text" placeholder="Full Name" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="cyber-input py-2 text-xs" />
                        <input type="email" placeholder="Email Address" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className="cyber-input py-2 text-xs" />
                        <select value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value as Designation})} className="cyber-input py-2 text-xs">
                          <option value="employee">Employee</option>
                          <option value="founding piller">Founding Piller</option>
                          <option value="intern">Intern</option>
                          <option value="fresher">Fresher</option>
                          <option value="HR">HR</option>
                          <option value="Team leader">Team Leader</option>
                        </select>
                        <button onClick={handleManualAdd} className="w-full py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-cyan-400/20 transition-all">Register Employee</button>
                        {manualPin && (
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center animate-pulse">
                            <p className="text-[10px] font-bold">GENERATED PIN: {manualPin}</p>
                            <button onClick={() => setManualPin(null)} className="text-[8px] underline mt-1">Dismiss</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-white/10 border border-dashed border-white/10 rounded-xl">
                        <p className="text-xs">Use registration form or manual entry.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workforce Roster - SHOW ALL EMPLOYEES */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><LayoutDashboard size={14} className="text-fuchsia-400" /> Active Workforce Roster</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {employees.filter(e => e.status === 'APPROVED').length === 0 ? (
                      <div className="col-span-full py-10 text-center text-white/20">No active employees found.</div>
                    ) : (
                      employees.filter(e => e.status === 'APPROVED').map(emp => (
                        <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all">
                          <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-10 h-10 rounded-lg" alt={emp.name} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{emp.name}</p>
                            <p className="text-[10px] text-fuchsia-400 font-mono uppercase">{emp.role}</p>
                            <p className="text-[9px] text-white/20">Joined: {new Date(emp.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── EMPLOYEES ── */}
            {activeTab === 'employees' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…" className="cyber-input pl-9" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                      <button key={f} onClick={() => setFilter(f as any)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border
                          ${filter === f ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
                        {f}
                      </button>
                    ))}
                    <button onClick={downloadEmployeeData} className="px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-2 ml-auto">
                      <FolderOpen size={14} /> Download Data
                    </button>
                  </div>
                </div>
                <div className="glass-card overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="py-16 text-center text-white/30"><Users size={40} className="mx-auto mb-3 opacity-30" /><p>No employees found.</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="cyber-table">
                        <thead><tr><th>Employee</th><th>Role/Position</th><th className="hidden md:table-cell">Secure PIN</th><th>Status</th><th>Joined</th><th className="text-right">Actions</th></tr></thead>
                        <tbody>
                          {filtered.map((emp, i) => (
                            <motion.tr key={emp.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                              <td>
                                <div className="flex items-center gap-3">
                                  {emp.profilePhoto ? (
                                    <img src={emp.profilePhoto} className="w-9 h-9 rounded-lg object-cover border border-white/10" alt={emp.name} />
                                  ) : (
                                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-9 h-9 rounded-lg border border-white/10" alt={emp.name} />
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-white text-sm">{emp.name}</p>
                                      {(emp.socials?.linkedin || emp.socials?.github || emp.socials?.twitter || emp.socials?.portfolio) && (
                                        <button 
                                          onClick={() => setExpandedEmployee(expandedEmployee === emp.id ? null : emp.id)}
                                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                          <ExternalLink size={12} />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-xs text-white/40">{emp.email}</p>
                                    
                                    <AnimatePresence>
                                      {expandedEmployee === emp.id && (
                                        <motion.div 
                                          initial={{ height: 0, opacity: 0 }} 
                                          animate={{ height: 'auto', opacity: 1 }} 
                                          exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden mt-2"
                                        >
                                          <div className="flex flex-wrap gap-3 py-2 border-t border-white/5">
                                            {emp.socials?.linkedin && <a href={emp.socials.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="text-white/40 hover:text-cyan-400 transition-all"><Users size={14} /></a>}
                                            {emp.socials?.github && <a href={`https://github.com/${emp.socials.github}`} target="_blank" rel="noreferrer" title="GitHub" className="text-white/40 hover:text-white transition-all"><Github size={14} /></a>}
                                            {emp.socials?.twitter && <a href={`https://twitter.com/${emp.socials.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" title="Twitter" className="text-white/40 hover:text-blue-400 transition-all"><MessageSquare size={14} /></a>}
                                            {emp.socials?.whatsapp && <a href={`https://wa.me/${emp.socials.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp" className="text-white/40 hover:text-green-400 transition-all"><Phone size={14} /></a>}
                                            {emp.socials?.instagram && <a href={`https://instagram.com/${emp.socials.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" title="Instagram" className="text-white/40 hover:text-pink-400 transition-all"><Instagram size={14} /></a>}
                                            {emp.socials?.youtube && <a href={emp.socials.youtube} target="_blank" rel="noreferrer" title="YouTube" className="text-white/40 hover:text-red-500 transition-all"><Youtube size={14} /></a>}
                                            {emp.socials?.facebook && <a href={emp.socials.facebook} target="_blank" rel="noreferrer" title="Facebook" className="text-white/40 hover:text-blue-600 transition-all"><Facebook size={14} /></a>}
                                            {emp.socials?.portfolio && <a href={emp.socials.portfolio} target="_blank" rel="noreferrer" title="Portfolio" className="text-white/40 hover:text-amber-400 transition-all"><Globe size={14} /></a>}
                                          </div>

                                          <div className="mt-4 p-4 rounded-xl bg-white/2 border border-white/5">
                                            <div className="flex items-center justify-between mb-4">
                                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Internal Evaluation</p>
                                              <span className="text-[10px] font-mono text-white/20">Last Updated: {emp.evaluation?.lastUpdated ? new Date(emp.evaluation.lastUpdated).toLocaleDateString() : 'Never'}</span>
                                            </div>
                                            <div className="space-y-4">
                                              <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                  <span className="text-white/60">Performance Score</span>
                                                  <span className="text-fuchsia-400 font-bold">{emp.evaluation?.score || 0}%</span>
                                                </div>
                                                <input 
                                                  type="range" min="0" max="100" 
                                                  value={emp.evaluation?.score || 0}
                                                  onChange={(e) => updateEmployeeEvaluation(emp.id, parseInt(e.target.value), emp.evaluation?.remarks || '')}
                                                  className="w-full h-1.5 accent-fuchsia-500 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                                />
                                              </div>
                                              <div>
                                                <p className="text-[10px] font-bold text-white/40 uppercase mb-2">Director&apos;s Remarks</p>
                                                <textarea 
                                                  placeholder="Add internal notes about employee performance..."
                                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-fuchsia-400/50 min-h-[60px]"
                                                  value={emp.evaluation?.remarks || ''}
                                                  onChange={(e) => updateEmployeeEvaluation(emp.id, emp.evaluation?.score || 0, e.target.value)}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="flex flex-col">
                                  <select 
                                    value={emp.role} 
                                    onChange={(e) => {
                                      const newRole = e.target.value as Designation;
                                      setProcessing(emp.id + 'ROLE');
                                      setTimeout(() => {
                                        updateEmployeeRole(emp.id, newRole);
                                        setProcessing(null);
                                      }, 500);
                                    }}
                                    className={`role-badge bg-transparent border-none cursor-pointer outline-none ${
                                      emp.role === 'founding piller' ? 'role-piller' : 
                                      emp.role === 'Team leader' ? 'role-leader' : 
                                      emp.role === 'HR' ? 'role-hr' : 
                                      emp.role === 'intern' ? 'role-intern' :
                                      emp.role === 'fresher' ? 'role-fresher' : 'role-employee'
                                    }`}
                                  >
                                    <option value="employee">Employee</option>
                                    <option value="founding piller">Founding Piller</option>
                                    <option value="intern">Intern</option>
                                    <option value="fresher">Fresher</option>
                                    <option value="HR">HR</option>
                                    <option value="Team leader">Team Leader</option>
                                  </select>
                                  <span className="text-[9px] text-white/20 ml-2">{emp.department}</span>
                                </div>
                              </td>
                              <td className="hidden md:table-cell">
                                <code className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded border border-white/10 text-cyan-400">
                                  {emp.pin.slice(0,4)}-{emp.pin.slice(4,8)}-{emp.pin.slice(8,12)}
                                </code>
                              </td>
                              <td><span className={emp.status === 'PENDING' ? 'badge-pending' : emp.status === 'APPROVED' ? 'badge-approved' : 'badge-rejected'}>{emp.status}</span></td>
                              <td className="text-xs text-white/40">{new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!isHR && (
                                    <button 
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to terminate ${emp.name}? This action is irreversible.`)) {
                                          deleteEmployee(emp.id);
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
                                    >
                                      <UserX size={12} /> Terminate
                                    </button>
                                  )}
                                  {emp.status === 'PENDING' && !isHR && (
                                    <>
                                      <button onClick={() => handleAction(emp.id, 'APPROVED')} disabled={!!processing} className="btn-approve flex items-center gap-1 text-xs">
                                        {processing === emp.id + 'APPROVED' ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Approve
                                      </button>
                                      <button onClick={() => handleAction(emp.id, 'REJECTED')} disabled={!!processing} className="btn-reject flex items-center gap-1 text-xs">
                                        {processing === emp.id + 'REJECTED' ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />} Reject
                                      </button>
                                    </>
                                  )}
                                  {emp.status === 'APPROVED' && (
                                    <button onClick={() => handleAction(emp.id, 'REJECTED')} disabled={!!processing} className="btn-reject flex items-center gap-1 text-xs"><XCircle size={11} /> Revoke</button>
                                  )}
                                  {emp.status === 'REJECTED' && (
                                    <button onClick={() => handleAction(emp.id, 'APPROVED')} disabled={!!processing} className="btn-approve flex items-center gap-1 text-xs"><RefreshCw size={11} /> Re-activate</button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'attendance' && <AdminAttendanceModule />}
            {activeTab === 'tasks' && <AdminTasksModule />}
            {activeTab === 'comms' && <AdminChatModule />}
            {activeTab === 'meetings' && <AdminMeetingsModule />}
            {activeTab === 'files' && <AdminFilesModule />}
            {activeTab === 'badges' && <AdminBadgesModule />}
            {activeTab === 'tickets' && <AdminTicketsModule />}
            {activeTab === 'settings' && <SettingsModule employeeId="admin" />}
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
              className="relative w-full max-w-lg glass-card p-10 text-center border-fuchsia-500/30"
            >
              <div className="w-20 h-20 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
                <ShieldCheck size={40} className="text-fuchsia-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">System Initialization</h2>
              <p className="text-fuchsia-400 font-mono text-sm mb-6 uppercase tracking-widest">Access Granted: Abhinav Patta</p>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Welcome back to the NovelleyX Command Center. All systems are operational. 
                Your digital ecosystem is synchronized and ready for management.
              </p>
              <button 
                onClick={() => setWelcomeOpen(false)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all"
              >
                Enter System
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminBadgesModule() {
  const { customBadges, addCustomBadge } = useStore();
  const [newBadge, setNewBadge] = useState({ label: '', desc: '', xp: 50, icon: 'Shield' });

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-white mb-2">Badge Control Panel</h3>
        <p className="text-white/40 text-sm mb-6">Create new achievements to boost employee efficiency and engagement.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Badge Label</label>
            <input type="text" value={newBadge.label} onChange={e => setNewBadge({...newBadge, label: e.target.value})} placeholder="e.g. Code Ninja" className="cyber-input" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">XP Reward</label>
            <input type="number" value={newBadge.xp} onChange={e => setNewBadge({...newBadge, xp: parseInt(e.target.value) || 0})} className="cyber-input" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Visual Icon</label>
            <select value={newBadge.icon} onChange={e => setNewBadge({...newBadge, icon: e.target.value})} className="cyber-input">
              <option>Shield</option>
              <option>Zap</option>
              <option>Star</option>
              <option>Trophy</option>
              <option>Code</option>
              <option>Rocket</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { addCustomBadge(newBadge); setNewBadge({ label: '', desc: '', xp: 50, icon: 'Shield' }); }}
              className="btn-cyber w-full py-3"
            >
              Generate Badge
            </button>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Description / Criteria</label>
          <input type="text" value={newBadge.desc} onChange={e => setNewBadge({...newBadge, desc: e.target.value})} placeholder="Awarded for solving 10 critical bugs in a week..." className="cyber-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customBadges.map((badge) => (
          <div key={badge.id} className="glass-card p-6 border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white">{badge.label}</h4>
              <p className="text-[10px] text-white/40 mb-1">{badge.desc}</p>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">+{badge.xp} XP REWARD</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTicketsModule() {
  const { tickets, updateTicketStatus } = useStore();

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-white mb-2">Support Tickets</h3>
        <p className="text-white/40 text-sm mb-6">Manage elevation requests and troubleshooting tickets from your workforce.</p>

        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="py-20 text-center text-white/20">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-10" />
              <p>No support tickets found.</p>
            </div>
          ) : (
            [...tickets].reverse().map(t => (
              <div key={t.id} className="glass-card p-5 border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.status === 'OPEN' ? 'bg-amber-400/10 text-amber-400' : t.status === 'RESOLVED' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-purple-400/10 text-purple-400'}`}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      {t.subject}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${t.status === 'OPEN' ? 'bg-amber-400 text-black' : 'bg-cyan-400 text-black'}`}>
                        {t.status}
                      </span>
                    </h4>
                    <p className="text-xs text-white/50 mt-0.5">Submitted by <span className="text-white font-semibold">{t.employeeName}</span> ({t.type})</p>
                    <p className="text-[10px] text-white/30 mt-1">{new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {t.status !== 'RESOLVED' && (
                    <button 
                      onClick={() => updateTicketStatus(t.id, 'RESOLVED')}
                      className="px-4 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold hover:bg-cyan-400/20 transition-all"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {t.status === 'OPEN' && (
                    <button 
                      onClick={() => updateTicketStatus(t.id, 'IN_PROGRESS')}
                      className="px-4 py-2 rounded-lg bg-purple-400/10 border border-purple-400/30 text-purple-400 text-xs font-bold hover:bg-purple-400/20 transition-all"
                    >
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminAttendanceModule() {
  const { attendance, employees } = useStore();
  const [search, setSearch] = useState('');

  const filtered = attendance.filter(a => {
    const emp = employees.find(e => e.id === a.employeeId);
    return emp?.name.toLowerCase().includes(search.toLowerCase()) || emp?.email.toLowerCase().includes(search.toLowerCase());
  }).reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Attendance Audit</h3>
          <p className="text-white/40 text-sm text-fuchsia-400">Monitoring all workforce sessions and shift compliance.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="cyber-input pl-9 py-2 text-xs" 
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="cyber-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Duration</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-20 text-white/20">No records found.</td></tr>
            ) : (
              filtered.map(r => {
                const emp = employees.find(e => e.id === r.employeeId);
                const isLive = !r.clockOut;
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp?.avatarSeed || 'system'}&backgroundColor=0a0a1a`} className="w-6 h-6 rounded" alt="" />
                        <span className="font-bold text-white text-xs">{emp?.name || 'Terminated User'}</span>
                      </div>
                    </td>
                    <td className="text-xs text-white/50">{new Date(r.clockIn).toLocaleString()}</td>
                    <td className="text-xs text-white/50">{r.clockOut ? new Date(r.clockOut).toLocaleString() : '—'}</td>
                    <td>
                      {r.shiftDuration != null ? (
                        <span className={`text-xs font-mono font-bold ${r.shiftDuration >= 240 ? 'text-lime-400' : 'text-amber-400'}`}>
                          {Math.floor(r.shiftDuration / 60)}h {r.shiftDuration % 60}m
                        </span>
                      ) : <span className="text-emerald-400 animate-pulse text-[10px] font-black uppercase">Live</span>}
                    </td>
                    <td className="text-[10px] text-white/30 font-mono">{r.location}</td>
                    <td>
                      {isLive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black border border-emerald-500/20">PRESENT</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[9px] font-black border border-white/10">COMPLETED</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
