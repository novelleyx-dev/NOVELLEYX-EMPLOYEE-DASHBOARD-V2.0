'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Video, Clock, Users, Link, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminMeetingsModule() {
  const { employees, meetings, scheduleMeeting } = useStore();
  const approved = employees.filter(e => e.status === 'APPROVED');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', scheduledAt: '', duration: '30', meetLink: '', attendees: 'all' });
  const [submitting, setSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!form.title.trim() || !form.scheduledAt) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    scheduleMeeting({
      title: form.title,
      description: form.description,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      duration: parseInt(form.duration),
      meetLink: form.meetLink,
      attendees: form.attendees === 'all' ? ['all'] : [form.attendees],
    });
    setForm({ title: '', description: '', scheduledAt: '', duration: '30', meetLink: '', attendees: 'all' });
    setShowForm(false);
    setSubmitting(false);
  };

  const upcoming = meetings.filter(m => new Date(m.scheduledAt) > new Date()).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const past = meetings.filter(m => new Date(m.scheduledAt) <= new Date()).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const MeetCard = ({ m }: { m: typeof meetings[0] }) => {
    const isPast = new Date(m.scheduledAt) <= new Date();
    return (
      <motion.div whileHover={{ y: -2 }} className="glass-card p-5 hover:border-cyan-400/20 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Video size={14} className={isPast ? 'text-white/30' : 'text-cyan-400'} />
              <h3 className="font-bold text-white text-sm">{m.title}</h3>
              {isPast && <span className="badge-rejected text-xs">Past</span>}
            </div>
            {m.description && <p className="text-white/50 text-xs mb-2">{m.description}</p>}
            <div className="flex flex-wrap gap-3 text-xs text-white/40">
              <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(m.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Clock size={10} /> {new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="flex items-center gap-1"><Clock size={10} /> {m.duration} min</span>
              <span className="flex items-center gap-1"><Users size={10} /> {m.attendees.includes('all') ? 'All Employees' : `${m.attendees.length} selected`}</span>
            </div>
          </div>
          {m.meetLink && !isPast && (
            <a href={m.meetLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs hover:bg-cyan-400/20 transition-all whitespace-nowrap">
              <Link size={11} /> Join
            </a>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Meeting Scheduler</h2>
          <p className="text-white/40 text-sm">Schedule meetings for all employees or individuals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-cyber flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={15} /> Schedule Meeting
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-cyan-400 text-sm uppercase tracking-wider">New Meeting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Title *</label>
              <input className="cyber-input" placeholder="Meeting title…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Attendees</label>
              <select className="cyber-input" value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))}>
                <option value="all">All Employees</option>
                {approved.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Date & Time *</label>
              <input type="datetime-local" className="cyber-input" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Duration (minutes)</label>
              <select className="cyber-input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                {['15', '30', '45', '60', '90', '120'].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Meet Link (optional)</label>
              <input className="cyber-input" placeholder="https://meet.google.com/…" value={form.meetLink} onChange={e => setForm(f => ({ ...f, meetLink: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Description</label>
              <textarea className="cyber-input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSchedule} disabled={submitting} className="btn-cyber flex items-center gap-2 py-2 px-5 text-sm">
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Scheduling…</> : 'Schedule Meeting'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/40 hover:text-white/70">Cancel</button>
          </div>
        </motion.div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h3>
          <div className="space-y-3">{upcoming.map(m => <MeetCard key={m.id} m={m} />)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white/30 uppercase tracking-wider mb-3">Past Meetings ({past.length})</h3>
          <div className="space-y-3">{past.slice(0, 5).map(m => <MeetCard key={m.id} m={m} />)}</div>
        </div>
      )}
      {meetings.length === 0 && (
        <div className="glass-card p-12 text-center text-white/30">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>No meetings scheduled yet.</p>
        </div>
      )}
    </div>
  );
}
