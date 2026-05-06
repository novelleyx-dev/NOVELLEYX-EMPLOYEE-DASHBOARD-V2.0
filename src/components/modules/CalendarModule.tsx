'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { useStore, AttendanceRecord } from '@/store/useStore';

interface Props { employeeId: string; }

export default function CalendarModule({ employeeId }: Props) {
  const { attendance } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  for (let i = 0; i < firstDayOfMonth(year, month); i++) days.push(null);
  for (let i = 1; i <= daysInMonth(year, month); i++) days.push(new Date(year, month, i));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    if (year > 2024 || month > 0) {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };
  const nextMonth = () => {
    if (year < 3000) {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const getAttendanceForDate = (date: Date) => {
    const dStr = date.toDateString();
    return attendance.filter(r => r.employeeId === employeeId && new Date(r.clockIn).toDateString() === dStr);
  };

  const formatDuration = (mins?: number) => {
    if (!mins) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const selectedAttendance = selectedDate ? getAttendanceForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Attendance Archive</h2>
          <p className="text-white/40 text-sm">Historical shift logs until year 3000</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-1">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><ChevronLeft size={18} /></button>
          <div className="text-sm font-bold text-white min-w-[120px] text-center">{monthName} {year}</div>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-white/20 tracking-widest py-2">{d}</div>
            ))}
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
              
              const hasAttendance = getAttendanceForDate(date).length > 0;
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative group
                    ${isSelected ? 'bg-cyan-400 border-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-white/3 border border-white/5 hover:border-white/20 text-white/60'}
                    ${isToday && !isSelected ? 'border-amber-400/50' : ''}`}
                >
                  <span className="text-sm font-bold">{date.getDate()}</span>
                  {hasAttendance && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                  )}
                  {isToday && !isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 h-full border-white/10">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CalendarIcon size={16} className="text-cyan-400" />
              {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>

            <div className="space-y-3">
              {selectedAttendance.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle size={32} className="mx-auto mb-3 text-white/10" />
                  <p className="text-white/30 text-sm">No attendance records found for this date.</p>
                </div>
              ) : (
                selectedAttendance.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center">
                          <Clock size={14} className="text-lime-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Shift Log</p>
                          <p className="text-[10px] text-white/40">{new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-cyan-400">{formatDuration(rec.shiftDuration)}</p>
                        <p className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">Duration</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <MapPin size={10} className="text-white/30" />
                      <span className="text-[10px] text-white/40 truncate">{rec.location || 'Unknown Location'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.clockOut ? (
                        <span className="badge-approved flex items-center gap-1 text-[9px] px-2 py-0.5"><CheckCircle2 size={10} /> Shift Completed</span>
                      ) : (
                        <span className="badge-pending flex items-center gap-1 text-[9px] px-2 py-0.5 animate-pulse"><Clock size={10} /> Active Session</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
