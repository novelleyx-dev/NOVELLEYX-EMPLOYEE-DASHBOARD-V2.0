'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, CheckCircle2, XCircle, AlertCircle, Timer, User, Loader2, Image as ImageIcon } from 'lucide-react';
import { useStore, Task } from '@/store/useStore';

export default function AdminTasksModule() {
  const { employees, tasks, assignTask, updateTaskStatus, extendTaskDeadline } = useStore();
  const approved = employees.filter(e => e.status === 'APPROVED');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'MEDIUM' as Task['priority'], deadline: '' });
  const [extendId, setExtendId] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!form.title.trim() || !form.assignedTo) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const deadline = form.deadline ? new Date(form.deadline).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    assignTask({ title: form.title, description: form.description, assignedTo: form.assignedTo, assignedBy: 'admin', deadline, priority: form.priority });
    setForm({ title: '', description: '', assignedTo: '', priority: 'MEDIUM', deadline: '' });
    setShowForm(false);
    setSubmitting(false);
  };

  const priorityColor = (p: Task['priority']) => p === 'HIGH' ? '#f87171' : p === 'MEDIUM' ? '#fbbf24' : '#84cc16';

  const statusBadge = (s: Task['status']) => {
    const map: Record<string, string> = { OPEN: 'badge-pending', SUBMITTED: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' };
    return map[s] || 'badge-pending';
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Work Assignment</h2>
          <p className="text-white/40 text-sm">Assign tasks · 24hr default timeout · extend anytime</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-cyber flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={15} /> Assign Task
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-cyan-400 text-sm uppercase tracking-wider">New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Title *</label>
                <input className="cyber-input" placeholder="Task title…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Assign To *</label>
                <select className="cyber-input" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                  <option value="">— Select Employee —</option>
                  {approved.map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Description</label>
                <textarea className="cyber-input resize-none" rows={3} placeholder="Task details…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Priority</label>
                <select className="cyber-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Custom Deadline (optional)</label>
                <input type="datetime-local" className="cyber-input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAssign} disabled={submitting} className="btn-cyber flex items-center gap-2 py-2 px-5 text-sm">
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Assigning…</> : 'Assign Task'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="glass-card p-12 text-center text-white/30">
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>No tasks assigned yet.</p>
          </div>
        )}
        {[...tasks].reverse().map((task, i) => {
          const emp = employees.find(e => e.id === task.assignedTo);
          const dl = task.adminExtendedUntil || task.deadline;
          const expired = new Date(dl) < new Date() && task.status === 'OPEN';
          const remaining = Math.max(0, new Date(dl).getTime() - Date.now());
          const hrs = Math.floor(remaining / 3600000);
          const mins = Math.floor((remaining % 3600000) / 60000);
          return (
            <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover:border-cyan-400/20 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: priorityColor(task.priority) }} />
                    <h3 className="font-bold text-white text-sm">{task.title}</h3>
                    <span className={statusBadge(task.status)}>{task.status}</span>
                    {expired && <span className="badge-rejected">EXPIRED</span>}
                  </div>
                  {task.description && <p className="text-white/50 text-xs mb-2">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1"><User size={10} /> {emp?.name || 'Unknown'}</span>
                    <span className="flex items-center gap-1"><Timer size={10} />
                      {task.status === 'OPEN' && !expired ? `${hrs}h ${mins}m left` : new Date(dl).toLocaleString()}
                    </span>
                    {task.adminExtendedUntil && <span className="text-cyan-400 text-xs">⏱ Extended</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.submissionPhoto && (
                    <button onClick={() => setViewPhoto(task.submissionPhoto!)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs hover:bg-purple-500/20 transition-all">
                      <ImageIcon size={11} /> View Submission
                    </button>
                  )}
                  {task.status === 'SUBMITTED' && (
                    <>
                      <button onClick={() => updateTaskStatus(task.id, 'APPROVED')}
                        className="btn-approve flex items-center gap-1 text-xs"><CheckCircle2 size={11} /> Approve</button>
                      <button onClick={() => updateTaskStatus(task.id, 'REJECTED')}
                        className="btn-reject flex items-center gap-1 text-xs"><XCircle size={11} /> Reject</button>
                    </>
                  )}
                  {task.status === 'OPEN' && (
                    <button onClick={() => { setExtendId(task.id); setExtendDate(''); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs hover:bg-amber-500/20 transition-all">
                      <Clock size={11} /> Extend
                    </button>
                  )}
                </div>
              </div>
              {extendId === task.id && (
                <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 items-center">
                  <input type="datetime-local" className="cyber-input text-sm py-1.5 flex-1" value={extendDate} onChange={e => setExtendDate(e.target.value)} />
                  <button onClick={() => { if (extendDate) { extendTaskDeadline(task.id, new Date(extendDate).toISOString()); setExtendId(null); } }}
                    className="btn-cyber py-1.5 px-4 text-xs">Set</button>
                  <button onClick={() => setExtendId(null)} className="text-white/40 hover:text-white text-xs px-2">Cancel</button>
                </div>
              )}
              {task.submissionNote && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-white/40">📝 Employee note: <span className="text-white/70">{task.submissionNote}</span></p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {viewPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setViewPhoto(null)}>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={viewPhoto} alt="Submission"
              className="max-w-lg max-h-[80vh] rounded-xl border border-white/10 object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
