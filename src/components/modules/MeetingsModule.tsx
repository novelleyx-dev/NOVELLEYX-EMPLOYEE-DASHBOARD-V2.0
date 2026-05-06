'use client';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Link, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function MeetingsModule({ employeeId }: { employeeId: string }) {
  const { getUpcomingMeetings, meetings } = useStore();
  const upcoming = getUpcomingMeetings(employeeId);
  const past = meetings
    .filter(m => new Date(m.scheduledAt) <= new Date() && (m.attendees.includes('all') || m.attendees.includes(employeeId)))
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const timeUntil = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff < 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const d = Math.floor(h / 24);
    if (d > 0) return `in ${d}d ${h % 24}h`;
    if (h > 0) return `in ${h}h ${m}m`;
    return `in ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Meetings</h2>
        <p className="text-white/40 text-sm">Upcoming sessions · timings · join links</p>
      </div>

      {upcoming.length === 0 ? (
        <div className="glass-card p-12 text-center text-white/30">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>No upcoming meetings scheduled.</p>
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h3>
          <div className="space-y-4">
            {upcoming.map((m, i) => {
              const until = timeUntil(m.scheduledAt);
              const isImminent = !!(until && until.includes('in') && parseInt(until.split('in ')[1]) < 60 && until.includes('m'));
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -2 }}
                  className={`glass-card p-5 transition-all ${isImminent ? 'border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                          <Video size={14} className="text-cyan-400" />
                        </div>
                        <h3 className="font-bold text-white">{m.title}</h3>
                        {isImminent && (
                          <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                            className="badge-pending text-xs flex items-center gap-1"><Bell size={9} /> Soon</motion.span>
                        )}
                      </div>
                      {m.description && <p className="text-white/50 text-sm mb-3">{m.description}</p>}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-white/50"><Calendar size={10} />{formatDate(m.scheduledAt).split(',')[0]}</div>
                        <div className="flex items-center gap-1 text-cyan-400 font-mono font-bold"><Clock size={10} />{formatTime(m.scheduledAt)}</div>
                        <div className="flex items-center gap-1 text-white/50"><Clock size={10} />{m.duration} min</div>
                        {until && <div className="text-amber-400 font-semibold">{until}</div>}
                      </div>
                      <p className="text-xs text-white/30 mt-2">{formatDate(m.scheduledAt)}</p>
                    </div>
                    {m.meetLink && (
                      <a href={m.meetLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-400/20 transition-all whitespace-nowrap">
                        <Link size={13} /> Join Meeting
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white/30 uppercase tracking-wider mb-3">Past Meetings</h3>
          <div className="space-y-2">
            {past.slice(0, 5).map(m => (
              <div key={m.id} className="glass-card p-4 opacity-60 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">{m.title}</p>
                  <p className="text-xs text-white/40">{formatDate(m.scheduledAt)} · {formatTime(m.scheduledAt)} · {m.duration} min</p>
                </div>
                <span className="badge-rejected text-xs">Past</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
