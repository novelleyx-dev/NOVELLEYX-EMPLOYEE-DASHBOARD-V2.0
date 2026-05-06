'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, AlertCircle, LogOut, Search, CheckCircle2, XCircle,
  RefreshCw, Loader2, UserCheck, UserX, MessageSquare, ClipboardList,
  Calendar, FolderOpen, Activity, LayoutDashboard, Menu
} from 'lucide-react';
import { useStore, Employee } from '@/store/useStore';
import AdminTasksModule from '@/components/modules/admin/TasksModule';
import AdminChatModule from '@/components/modules/admin/ChatModule';
import AdminMeetingsModule from '@/components/modules/admin/MeetingsModule';
import AdminFilesModule from '@/components/modules/admin/FilesModule';

type AdminTab = 'overview' | 'employees' | 'tasks' | 'comms' | 'meetings' | 'files';

const TABS: { key: AdminTab; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'tasks', label: 'Work', icon: ClipboardList },
  { key: 'comms', label: 'Communications', icon: MessageSquare },
  { key: 'meetings', label: 'Meetings', icon: Calendar },
  { key: 'files', label: 'Files', icon: FolderOpen },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { session, setSession, employees, updateEmployeeStatus, tasks, meetings, attendance } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!session) { router.replace('/'); return; }
    if (session.type !== 'admin') { router.replace('/dashboard'); }
  }, [session, router]);

  if (!session || session.type !== 'admin') return null;

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
    setProcessing(null);
  };

  const StatCard = ({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: number; color: string; sub?: string }) => (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} className="glass-card p-5 flex items-center gap-4 cursor-default">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `rgba(${color}, 0.1)`, border: `1px solid rgba(${color}, 0.3)` }}>
        <Icon size={22} style={{ color: `rgb(${color})` }} />
      </div>
      <div>
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-white/30">{sub}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen transition-colors duration-500">
      {/* Header Bar */}
      <header className="header-bar">
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
              <p className="text-xs font-bold text-white">Abhinav Patta</p>
              <p className="text-[10px] text-fuchsia-400/70">Master Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
              <ShieldCheck size={16} className="text-fuchsia-400" />
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
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
                    className="absolute right-0 mt-2 w-48 glass-card p-2 z-50 border border-white/10"
                  >
                    <button onClick={() => { setSession(null); router.push('/'); }} className="nav-item w-full text-red-400 hover:bg-red-400/10">
                      <LogOut size={16} /> Logout System
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
          {TABS.map(({ key, label, icon: Icon }) => (
            <button 
              key={key} 
              onClick={() => setActiveTab(key)}
              className={`floating-nav-item ${activeTab === key ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span className="hidden md:block">{label}</span>
              {key === 'employees' && pending > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] flex items-center justify-center font-bold">{pending}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <main className="page-content-wrapper max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
                  <StatCard icon={Users} label="Total Employees" value={employees.length} color="34,211,238" />
                  <StatCard icon={AlertCircle} label="Pending Approval" value={pending} color="245,158,11" />
                  <StatCard icon={UserCheck} label="Approved" value={approved} color="132,204,22" />
                  <StatCard icon={ClipboardList} label="Open Tasks" value={openTasks} color="168,85,247" sub={`${submittedTasks} awaiting review`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard icon={Calendar} label="Upcoming Meetings" value={upcomingMeetings} color="34,211,238" />
                  <StatCard icon={Activity} label="Tasks Submitted" value={submittedTasks} color="217,70,239" />
                </div>
                {pending > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-2"><AlertCircle size={14} /> Pending Approvals</h3>
                    <div className="space-y-2">
                      {employees.filter(e => e.status === 'PENDING').map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-400/5 border border-amber-400/15">
                          <div className="flex items-center gap-2">
                            <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-8 h-8 rounded-lg border border-white/10" alt={emp.name} />
                            <div><p className="text-sm font-semibold text-white">{emp.name}</p><p className="text-xs text-white/40">{emp.email}</p></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleAction(emp.id, 'APPROVED')} disabled={!!processing} className="btn-approve flex items-center gap-1 text-xs">
                              {processing === emp.id + 'APPROVED' ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Approve
                            </button>
                            <button onClick={() => handleAction(emp.id, 'REJECTED')} disabled={!!processing} className="btn-reject flex items-center gap-1 text-xs">
                              {processing === emp.id + 'REJECTED' ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />} Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                      <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border
                          ${filter === f ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="glass-card overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="py-16 text-center text-white/30"><Users size={40} className="mx-auto mb-3 opacity-30" /><p>No employees found.</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="cyber-table">
                        <thead><tr><th>Employee</th><th>Department</th><th className="hidden md:table-cell">PIN</th><th>Status</th><th>Joined</th><th className="text-right">Actions</th></tr></thead>
                        <tbody>
                          {filtered.map((emp, i) => (
                            <motion.tr key={emp.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                              <td>
                                <div className="flex items-center gap-3">
                                  <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a`} className="w-9 h-9 rounded-lg border border-white/10" alt={emp.name} />
                                  <div><p className="font-semibold text-white text-sm">{emp.name}</p><p className="text-xs text-white/40">{emp.email}</p></div>
                                </div>
                              </td>
                              <td>
                                <span className={`role-badge ${
                                  emp.role === 'founding piller' ? 'role-piller' : 
                                  emp.role === 'Team leader' ? 'role-leader' : 
                                  emp.role === 'HR' ? 'role-hr' : 
                                  emp.role === 'intern' ? 'role-intern' :
                                  emp.role === 'fresher' ? 'role-fresher' : 'role-employee'
                                }`}>{emp.role}</span>
                              </td>
                              <td><span className={emp.status === 'PENDING' ? 'badge-pending' : emp.status === 'APPROVED' ? 'badge-approved' : 'badge-rejected'}>{emp.status}</span></td>
                              <td className="text-xs text-white/40">{new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {emp.status === 'PENDING' && (
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
                                    <button onClick={() => handleAction(emp.id, 'APPROVED')} disabled={!!processing} className="btn-approve flex items-center gap-1 text-xs"><RefreshCw size={11} /> Re-approve</button>
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

            {activeTab === 'tasks' && <AdminTasksModule />}
            {activeTab === 'comms' && <AdminChatModule />}
            {activeTab === 'meetings' && <AdminMeetingsModule />}
            {activeTab === 'files' && <AdminFilesModule />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
