'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, CheckCircle2, AlertCircle, Timer, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

const REQUIRED_MINUTES = 240; // 4 hours

export default function AttendanceModule({ employeeId }: { employeeId: string }) {
  const { clockIn, clockOut, getActiveSession, attendance, getTodayMinutes } = useStore();
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const active = getActiveSession(employeeId);
  const todayMinutes = getTodayMinutes(employeeId);
  const shiftProgress = Math.min(100, (todayMinutes / REQUIRED_MINUTES) * 100);
  const remaining = Math.max(0, REQUIRED_MINUTES - todayMinutes);
  const remainHrs = Math.floor(remaining / 60);
  const remainMins = remaining % 60;

  const liveElapsed = active ? Math.floor((now.getTime() - new Date(active.clockIn).getTime()) / 60000) : 0;
  const totalToday = todayMinutes + liveElapsed;
  const liveProgress = Math.min(100, (totalToday / REQUIRED_MINUTES) * 100);

  const handleClockIn = () => {
    setLocating(true); setLocError('');
    navigator.geolocation.getCurrentPosition(
      pos => { clockIn(employeeId, `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`); setLocating(false); },
      () => { clockIn(employeeId, 'Location unavailable'); setLocating(false); }
    );
  };

  const handleClockOut = () => {
    if (liveElapsed < 1) { setLocError('You must be clocked in for at least 1 minute.'); return; }
    clockOut(employeeId);
  };

  // Last 7 days records
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const mins = attendance
      .filter(r => r.employeeId === employeeId && new Date(r.clockIn).toDateString() === dateStr && r.clockOut)
      .reduce((s, r) => s + (r.shiftDuration || 0), 0);
    return { date: d, mins, label: d.toLocaleDateString('en-US', { weekday: 'short' }) };
  });

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Time-Space Tracker</h2>
        <p className="text-white/40 text-sm">Strict 4-hour daily shift · punch in &amp; out</p>
      </div>

      <div className="glass-card p-6 border-cyan-400/10">
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          <div className="text-center p-4 rounded-2xl bg-cyan-400/5 border border-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            <div className="digital-clock mb-1 text-4xl sm:text-5xl">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            <p className="text-cyan-400/40 text-xs font-mono uppercase tracking-[0.2em]">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Today&apos;s Progress</span>
                <span>{Math.floor(totalToday / 60)}h {totalToday % 60}m / 4h 00m</span>
              </div>
              <div className="xp-bar">
                <motion.div className="xp-fill" initial={{ width: 0 }} animate={{ width: `${liveProgress}%` }} transition={{ duration: 0.8 }}
                  style={{ background: liveProgress >= 100 ? 'linear-gradient(90deg, #84cc16, #22c55e)' : undefined }} />
              </div>
              {liveProgress >= 100 && <p className="text-lime-400 text-xs mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> 4-hour shift complete!</p>}
            </div>

            {active ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-lime-400 text-sm">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                  <span className="font-mono font-bold">CLOCKED IN — {Math.floor(liveElapsed / 60)}h {liveElapsed % 60}m elapsed</span>
                </div>
                <button onClick={handleClockOut} className="btn-reject flex items-center gap-2 py-2 px-5 text-sm">
                  <Timer size={14} /> Clock Out
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {!active && (
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                    <span>Not clocked in</span>
                  </div>
                )}
                {liveProgress < 100 && (
                  <button onClick={handleClockIn} disabled={locating}
                    className="btn-cyber flex items-center gap-2 py-2 px-5 text-sm">
                    <MapPin size={14} /> {locating ? 'Getting Location…' : 'Clock In'}
                  </button>
                )}
              </div>
            )}

            {locError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={10} /> {locError}</p>}
            {active && <p className="text-white/30 text-xs flex items-center gap-1"><MapPin size={10} /> {active.location}</p>}
          </div>
        </div>
      </div>

      {/* Weekly Graph */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-cyan-400" /> This Week</h3>
        <div className="flex items-end gap-3 h-24">
          {week.map((day, i) => {
            const pct = Math.min(100, (day.mins / REQUIRED_MINUTES) * 100);
            const isToday = day.date.toDateString() === new Date().toDateString();
            const met = day.mins >= REQUIRED_MINUTES;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${day.label}: ${Math.floor(day.mins / 60)}h ${day.mins % 60}m`}>
                <div className="w-full rounded-t-sm flex flex-col justify-end" style={{ height: '80px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${pct}%` }} transition={{ delay: i * 0.08, duration: 0.6 }}
                    className="w-full rounded-t-sm"
                    style={{ background: met ? 'linear-gradient(180deg, #84cc16, #22c55e)' : isToday ? 'linear-gradient(180deg, #22d3ee, #3b82f6)' : 'linear-gradient(180deg, rgba(34,211,238,0.5), rgba(168,85,247,0.3))' }} />
                </div>
                <span className={`text-xs font-semibold ${isToday ? 'text-cyan-400' : 'text-white/30'}`}>{day.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-lime-400" /> Goal met (4h)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-400" /> Today</span>
        </div>
      </div>

      {/* History */}
      <div className="glass-card p-5">
        <h3 className="font-bold text-white text-sm mb-4">Recent Records</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {attendance.filter(r => r.employeeId === employeeId).slice().reverse().slice(0, 15).map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-all text-sm">
              <div>
                <p className="font-semibold text-white">{new Date(r.clockIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p className="text-xs text-white/40 font-mono">{formatTime(r.clockIn)} — {r.clockOut ? formatTime(r.clockOut) : '…'}</p>
              </div>
              <div className="text-right">
                {r.shiftDuration != null ? (
                  <span className={`font-mono text-sm font-bold ${r.shiftDuration >= REQUIRED_MINUTES ? 'text-lime-400' : 'text-amber-400'}`}>
                    {Math.floor(r.shiftDuration / 60)}h {r.shiftDuration % 60}m
                  </span>
                ) : <span className="text-lime-400 animate-pulse text-xs">Live</span>}
              </div>
            </div>
          ))}
          {attendance.filter(r => r.employeeId === employeeId).length === 0 && (
            <p className="text-white/30 text-sm text-center py-6">No attendance records yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
