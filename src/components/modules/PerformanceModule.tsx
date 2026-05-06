'use client';

/**
 * Performance Engine — Gamification Module
 * XP bar, level, badges with Framer Motion hover effects
 */

import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Shield, Clock, Bug, Flame, Target, Award, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props { employeeId: string; }

// All possible badges with icon, color, and description
const BADGE_CATALOG = [
  { id: 'Early Bird', icon: Clock, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', desc: 'Clocked in before 9 AM' },
  { id: 'Clockwork', icon: Target, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)', desc: 'Consistent attendance streak' },
  { id: 'Bug Squasher', icon: Bug, color: '#84cc16', bg: 'rgba(132,204,22,0.1)', border: 'rgba(132,204,22,0.3)', desc: 'Resolved critical issues' },
  { id: 'Overachiever', icon: Flame, color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', desc: 'Exceeded quarterly targets' },
  { id: 'Team Player', icon: Shield, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', desc: 'Outstanding collaboration' },
  { id: 'Mentor', icon: Star, color: '#e879f9', bg: 'rgba(232,121,249,0.1)', border: 'rgba(232,121,249,0.3)', desc: 'Guided 3+ team members' },
];

// XP level thresholds
function getLevel(xp: number) {
  if (xp < 500) return { level: 1, title: 'Recruit', next: 500 };
  if (xp < 1000) return { level: 2, title: 'Associate', next: 1000 };
  if (xp < 2000) return { level: 3, title: 'Specialist', next: 2000 };
  if (xp < 3500) return { level: 4, title: 'Senior', next: 3500 };
  if (xp < 5000) return { level: 5, title: 'Lead', next: 5000 };
  return { level: 6, title: 'Principal', next: 9999 };
}

export default function PerformanceModule({ employeeId }: Props) {
  const employees = useStore((s) => s.employees);
  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) return null;

  const { level, title, next } = getLevel(emp.xp);
  const prevLevel = getLevel(emp.xp - 1);
  const xpInLevel = emp.xp - (prevLevel.next === 9999 ? 0 : [0, 500, 1000, 2000, 3500, 5000][level - 1] ?? 0);
  const levelRange = (level < 6 ? next : 9999) - ([0, 500, 1000, 2000, 3500, 5000][level - 1] ?? 0);
  const progress = Math.min(100, (xpInLevel / levelRange) * 100);

  // Leaderboard mock data
  const leaderboard = [
    { name: emp.name, xp: emp.xp, you: true },
    { name: 'Sarah K.', xp: 4200 },
    { name: 'Marcus T.', xp: 3800 },
    { name: 'Priya N.', xp: 3100 },
    { name: 'James W.', xp: 2700 },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">Performance Engine</h2>
        <p className="text-white/40 text-sm mt-1">Your XP progression, badges earned, and leaderboard ranking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── XP & Level Card ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Level header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-cyan-400/70 font-semibold uppercase tracking-wider mb-1">Current Rank</p>
                <h3 className="text-3xl font-black text-white">Level {level}</h3>
                <p className="text-cyan-400 font-bold mt-0.5 text-neon-blue">{title}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/30 mb-1">Total XP</p>
                <p className="text-2xl font-black font-mono" style={{ color: '#22d3ee', textShadow: '0 0 15px rgba(34,211,238,0.7)' }}>
                  {emp.xp.toLocaleString()}
                </p>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="mb-2 flex items-center justify-between text-xs font-mono text-white/40">
              <span>Progress to Level {level + 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="xp-bar mb-1">
              <motion.div
                className="xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <p className="text-xs text-white/30 text-right font-mono mt-1">
              {emp.xp.toLocaleString()} / {next.toLocaleString()} XP
            </p>

            {/* XP gain tips */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { action: 'Clock In', xp: '+50 XP', icon: Clock },
                { action: 'Clock Out', xp: '+25 XP', icon: Target },
                { action: 'Early Bird', xp: 'Badge', icon: Star },
              ].map(({ action, xp, icon: Icon }) => (
                <div key={action} className="text-center p-3 rounded-xl bg-white/3 border border-white/6">
                  <Icon size={16} className="text-cyan-400/60 mx-auto mb-1.5" />
                  <p className="text-xs text-white/50">{action}</p>
                  <p className="text-xs font-bold text-lime-400 mt-0.5">{xp}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Badges ──────────────────────────────────────────────────── */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Award size={16} className="text-fuchsia-400" /> Badges & Achievements
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BADGE_CATALOG.map(({ id, icon: Icon, color, bg, border, desc }) => {
                const earned = emp.badges.includes(id);
                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-4 rounded-xl border text-center transition-all duration-300 ${earned ? '' : 'opacity-35 grayscale'}`}
                    style={{
                      background: earned ? bg : 'rgba(255,255,255,0.02)',
                      borderColor: earned ? border : 'rgba(255,255,255,0.06)',
                      boxShadow: earned ? `0 0 15px ${color}25` : 'none',
                    }}
                  >
                    {earned && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-lime-400 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-black" />
                      </div>
                    )}
                    <div
                      className="hex-badge mx-auto mb-2"
                      style={{ background: earned ? bg : 'rgba(255,255,255,0.04)' }}
                    >
                      <Icon size={24} style={{ color: earned ? color : '#444' }} />
                    </div>
                    <p className="text-xs font-bold" style={{ color: earned ? color : '#555' }}>{id}</p>
                    <p className="text-xs text-white/30 mt-0.5 leading-tight">{desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Leaderboard ──────────────────────────────────────────────── */}
        <motion.div
          className="glass-card p-6 h-fit"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" /> Team Leaderboard
          </h3>

          <div className="space-y-3">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${entry.you
                    ? 'bg-cyan-400/8 border-cyan-400/25 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'bg-white/2 border-white/5'}`}
              >
                {/* Rank */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                  ${i === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' :
                    i === 1 ? 'bg-slate-400/20 text-slate-400 border border-slate-400/40' :
                    i === 2 ? 'bg-orange-800/20 text-orange-600 border border-orange-800/40' :
                    'bg-white/5 text-white/30 border border-white/10'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.you ? 'text-cyan-400' : 'text-white/70'}`}>
                    {entry.name} {entry.you && <span className="text-xs text-white/40">(you)</span>}
                  </p>
                </div>
                <p className="text-xs font-bold font-mono text-white/60">
                  {entry.xp.toLocaleString()} XP
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
