'use client';

/**
 * Performance Engine — Gamification Module
 * XP bar, level, badges with Framer Motion hover effects
 */

import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Shield, Clock, Bug, Flame, Target, Award, TrendingUp, Printer, Download, Layout, MessageCircle, Globe } from 'lucide-react';
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
  const { employees, customBadges, companyProgress } = useStore();
  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) return null;

  const { level, title, next } = getLevel(emp.xp);
  const prevLevel = getLevel(emp.xp - 1);
  const xpInLevel = emp.xp - (prevLevel.next === 9999 ? 0 : [0, 500, 1000, 2000, 3500, 5000][level - 1] ?? 0);
  const levelRange = (level < 6 ? next : 9999) - ([0, 500, 1000, 2000, 3500, 5000][level - 1] ?? 0);
  const progress = Math.min(100, (xpInLevel / levelRange) * 100);

  // Dynamic Leaderboard from Store
  const leaderboard = [...employees]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  const allBadges = [...BADGE_CATALOG, ...customBadges.map(b => ({
    id: b.label,
    icon: Star, // Default icon for custom
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.1)',
    border: 'rgba(34,211,238,0.3)',
    desc: b.desc
  }))];
  const generateCertificate = (badgeName: string) => {
    const certWindow = window.open('', '_blank');
    if (!certWindow) return;

    const certHtml = `
      <html>
        <head>
          <title>Certificate of Achievement - ${badgeName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;700&display=swap');
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0a0a0a; font-family: 'Inter', sans-serif; }
            .cert-container { width: 800px; height: 500px; padding: 40px; border: 15px solid #1a1a1a; background: white; position: relative; overflow: hidden; text-align: center; margin: auto; }
            .border-inner { border: 2px solid #c5a059; height: 100%; width: 100%; box-sizing: border-box; padding: 30px; display: flex; flex-direction: column; justify-content: center; }
            .logo { width: 60px; margin: 0 auto 20px; }
            .title { font-family: 'Cinzel', serif; font-size: 36px; color: #1a1a1a; margin: 0; }
            .subtitle { font-size: 14px; color: #666; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 4px; }
            .name { font-size: 28px; font-weight: 700; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; display: inline-block; padding: 0 30px 5px; margin-bottom: 15px; }
            .achievement { font-size: 16px; color: #444; line-height: 1.5; margin-bottom: 30px; }
            .footer { display: flex; justify-content: space-around; margin-top: 30px; }
            .sign { border-top: 1px solid #1a1a1a; padding-top: 8px; width: 180px; }
            .sign-text { font-family: 'Cinzel', serif; font-size: 12px; color: #1a1a1a; }
            p { margin: 5px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="cert-container">
            <div class="border-inner">
              <img src="https://i.ibb.co/L8mNf9G/novelleyx-logo.png" class="logo" />
              <div class="title">Certificate</div>
              <div class="subtitle">Of Achievement</div>
              <p>This is to certify that</p>
              <div class="name">${emp.name}</div>
              <p class="achievement">
                Has successfully earned the <strong>${badgeName} Badge</strong> <br/>
                for outstanding contribution and professional excellence within the NovelleyX ecosystem.
              </p>
              <div class="footer">
                <div class="sign">
                  <div class="sign-text">Abhinav Patta</div>
                  <div style="font-size: 9px; color: #888;">Founder & Director</div>
                </div>
                <div class="sign">
                  <div class="sign-text">${new Date().toLocaleDateString()}</div>
                  <div style="font-size: 9px; color: #888;">Date of Issuance</div>
                </div>
              </div>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    certWindow.document.write(certHtml);
    certWindow.document.close();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Performance Engine</h2>
          <p className="text-white/40 text-sm mt-1">Your XP progression, badges earned, and internal evaluations.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-3 border-amber-400/20">
            <Globe size={16} className="text-amber-400" />
            <div>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Company Progress</p>
              <p className="text-sm font-black text-white">{companyProgress}%</p>
            </div>
          </div>
        </div>
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

            {emp.badges.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <Trophy size={32} className="mx-auto mb-3 text-white/5" />
                <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">Ready to begin your journey?</p>
                <p className="text-white/10 text-[10px] mt-1">Complete tasks and clock in on time to unlock badges.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BADGE_CATALOG.map(({ id, icon: Icon, color, bg, border, desc }) => {
                  const earned = emp.badges.includes(id);
                  if (!earned) return null; // Only show earned badges as per user request for "clear and empty"
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
                    <p className="text-xs font-bold" style={{ color: color }}>{id}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{desc}</p>
                    
                    {earned && (
                      <button 
                        onClick={() => generateCertificate(id)}
                        className="mt-3 w-full py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <Printer size={10} /> Certificate
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
            )}
          </motion.div>

          {/* ── Internal Evaluation ─────────────────────────────────────── */}
          {emp.evaluation && (
            <motion.div 
              className="glass-card p-6 border-fuchsia-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Shield size={16} className="text-fuchsia-400" /> Internal Evaluation
                </h3>
                <span className="text-[10px] font-mono text-white/30">Updated: {new Date(emp.evaluation.lastUpdated).toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-fuchsia-500" 
                      strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * emp.evaluation.score) / 100} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white">{emp.evaluation.score}%</span>
                    <span className="text-[8px] text-white/40 uppercase font-bold">Score</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="p-4 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/10">
                    <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MessageCircle size={10} /> Director&apos;s Remarks
                    </p>
                    <p className="text-sm text-white/70 italic leading-relaxed">
                      &ldquo;{emp.evaluation.remarks}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
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
                  ${entry.id === emp.id
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

                <div className="flex-shrink-0 relative">
                  {entry.profilePhoto ? (
                    <img src={entry.profilePhoto} className="w-9 h-9 rounded-lg object-cover border border-white/10" alt={entry.name} />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${entry.avatarSeed}&backgroundColor=0a0a1a`} className="w-9 h-9 rounded-lg border border-white/10" alt={entry.name} />
                  )}
                  {i < 3 && <div className="absolute -top-1 -right-1 text-[8px]">⭐</div>}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.id === emp.id ? 'text-cyan-400' : 'text-white/70'}`}>
                    {entry.name} {entry.id === emp.id && <span className="text-xs text-white/40">(you)</span>}
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
