'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle2, XCircle, Upload, AlertCircle, Timer, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function TasksModule({ employeeId }: { employeeId: string }) {
  const { getTasksForEmployee, submitTask } = useStore();
  const tasks = getTasksForEmployee(employeeId);

  const [submitting, setSubmitting] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<Record<string, string>>({});
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handlePhoto = (taskId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(p => ({ ...p, [taskId]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (taskId: string) => {
    if (!photoPreview[taskId]) return;
    setSubmitting(taskId);
    await new Promise(r => setTimeout(r, 800));
    submitTask(taskId, photoPreview[taskId], note[taskId] || '');
    setSubmitting(null);
  };

  const statusColor: Record<string, string> = { OPEN: 'text-amber-400', SUBMITTED: 'text-cyan-400', APPROVED: 'text-lime-400', REJECTED: 'text-red-400' };
  const priorityColor: Record<string, string> = { HIGH: '#f87171', MEDIUM: '#fbbf24', LOW: '#84cc16' };

  const open = tasks.filter(t => t.status === 'OPEN');
  const done = tasks.filter(t => t.status !== 'OPEN');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">My Work</h2>
        <p className="text-white/40 text-sm">Assigned tasks · 24h timeout · submit with photo proof</p>
      </div>

      {tasks.length === 0 && (
        <div className="glass-card p-12 text-center text-white/30">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p>No tasks assigned to you yet.</p>
        </div>
      )}

      {open.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Active Tasks ({open.length})</h3>
          <div className="space-y-4">
            {open.map(task => {
              const dl = task.adminExtendedUntil || task.deadline;
              const elapsed = Math.max(0, Date.now() - new Date(task.assignedAt).getTime());
              const hrs = Math.floor(elapsed / 3600000);
              const mins = Math.floor((elapsed % 3600000) / 60000);
              const expired = false; // Tasks no longer "expire" with a countdown; we track time active
              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 hover:border-cyan-400/20 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: priorityColor[task.priority] }} />
                        <h3 className="font-bold text-white">{task.title}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${priorityColor[task.priority]}20`, color: priorityColor[task.priority] }}>{task.priority}</span>
                      </div>
                      {task.description && <p className="text-white/50 text-sm mb-2">{task.description}</p>}
                      <div className="flex items-center gap-2 text-xs">
                        <Timer size={11} className="text-cyan-400" />
                        <span className="text-cyan-400">
                          {hrs}h {mins}m active
                        </span>
                        {task.adminExtendedUntil && <span className="text-amber-400">⏱ Deadline Extended</span>}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Submit Work Photo</p>
                    {photoPreview[task.id] ? (
                      <div className="relative rounded-xl overflow-hidden border border-cyan-400/20 max-h-40">
                        <img src={photoPreview[task.id]} className="w-full max-h-40 object-cover" alt="preview" />
                        <button onClick={() => setPhotoPreview(p => { const n = { ...p }; delete n[task.id]; return n; })}
                          className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-lg">✕ Remove</button>
                      </div>
                    ) : (
                      <div onClick={() => fileRefs.current[task.id]?.click()}
                        className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-400/30 hover:bg-cyan-400/3 transition-all">
                        <Upload size={24} className="mx-auto mb-1 text-white/30" />
                        <p className="text-sm text-white/40">Click to upload photo of completed work</p>
                      </div>
                    )}
                    <input ref={el => { fileRefs.current[task.id] = el; }} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handlePhoto(task.id, e.target.files[0])} />
                    <textarea className="cyber-input resize-none text-sm" rows={2} placeholder="Optional note…"
                      value={note[task.id] || ''} onChange={e => setNote(n => ({ ...n, [task.id]: e.target.value }))} />
                    <button onClick={() => handleSubmit(task.id)} disabled={!photoPreview[task.id] || submitting === task.id}
                      className="btn-cyber w-full flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-40">
                      {submitting === task.id ? 'Submitting…' : <><CheckCircle2 size={14} /> Submit Work</>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white/30 uppercase tracking-wider mb-3">Completed ({done.length})</h3>
          <div className="space-y-2">
            {done.map(task => (
              <div key={task.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">{task.title}</p>
                  <p className={`text-xs font-bold mt-0.5 ${statusColor[task.status]}`}>{task.status}</p>
                </div>
                {task.submissionPhoto && (
                  <button onClick={() => setViewPhoto(task.submissionPhoto!)}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                    <ImageIcon size={12} /> View
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {viewPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewPhoto(null)}>
            <img src={viewPhoto} className="max-w-lg max-h-[80vh] rounded-xl border border-white/10 object-contain" alt="Submission" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
