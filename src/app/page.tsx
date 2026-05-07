'use client';

/**
 * NovelleyX — Login / Registration Page
 * Handles:
 *  - Admin login (email + 6-digit master PIN)
 *  - Employee login (12-digit PIN)
 *  - New employee registration (name + email → generates 12-digit PIN)
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, User, Lock, Mail, UserPlus, LogIn, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { useStore, Designation } from '@/store/useStore';

// ─── Admin Credentials (hardcoded, no external auth) ───────────────────────
const ADMIN_EMAIL = 'abhinav.patta01@gmail.com';
const ADMIN_PIN = '161706';

// ─── Tab type ───────────────────────────────────────────────────────────────
type Tab = 'login' | 'register';
type LoginMode = 'admin' | 'employee';

export default function LoginPage() {
  const router = useRouter();
  const { setSession, employees, addEmployee, syncWithCloud } = useStore();

  // Tab state
  const [tab, setTab] = useState<Tab>('login');
  const [loginMode, setLoginMode] = useState<LoginMode>('employee');

  // Admin login fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);

  // Employee login field (12-digit PIN)
  const [empPin, setEmpPin] = useState('');
  const [showEmpPin, setShowEmpPin] = useState(false);

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<Designation>('employee');
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [secretPin, setSecretPin] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Scanning line ref
  const pinRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    syncWithCloud();
  }, []);

  // If already logged in, redirect
  const session = useStore((s) => s.session);
  useEffect(() => {
    if (!mounted) return;
    if (session?.type === 'admin') router.replace('/admin');
    else if (session?.type === 'employee') router.replace('/dashboard');
  }, [session, router, mounted]);

  if (!mounted) return null;

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // ── Admin Login ────────────────────────────────────────────────────────────
  const handleAdminLogin = async () => {
    clearMessages();
    if (!adminEmail.trim() || !adminPin.trim()) {
      setError('Please enter both email and PIN.');
      return;
    }
    setLoading(true);
    // Simulate processing delay for UX
    await new Promise((r) => setTimeout(r, 1000));
    if (adminEmail.trim().toLowerCase() === ADMIN_EMAIL && adminPin === ADMIN_PIN) {
      setSession({ type: 'admin' });
      setSuccess('Access granted. Redirecting to command center…');
      setTimeout(() => router.push('/admin'), 1200);
    } else {
      setError('Invalid credentials. Access denied.');
    }
    setLoading(false);
  };

  // ── Employee Login ─────────────────────────────────────────────────────────
  const handleEmployeeLogin = async () => {
    clearMessages();
    if (empPin.length < 12) {
      setError('Enter your complete 12-digit PIN.');
      return;
    }
    if (secretPin !== '2026') {
      setError('Invalid Secret PIN (2FA failed).');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const emp = employees.find((e) => e.pin === empPin);
    if (!emp) {
      setError('Invalid PIN. No matching employee found.');
      setLoading(false);
      return;
    }
    // APPROVED
    setSession({ type: 'employee', employeeId: emp.id });
    setSuccess(`Welcome back, ${emp.name}! Initializing dashboard…`);
    setTimeout(() => router.push('/dashboard'), 1200);
    setLoading(false);
  };

  // ── Employee Registration ─────────────────────────────────────────────────
  const handleRegister = async () => {
    clearMessages();
    if (!regName.trim() || !regEmail.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (employees.some((e) => e.email.toLowerCase() === regEmail.toLowerCase())) {
      setError('This email is already registered.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const pin = addEmployee({
      name: regName.trim(), 
      email: regEmail.trim(), 
      department: '', 
      role: regRole,
    });
    setGeneratedPin(pin);
    setLoading(false);
  };

  // ── Animation variants ─────────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'backOut' } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Premium Login Background */}
      <div className="login-page-bg" />

      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo / Brand */}
        <motion.div className="text-center mb-8" variants={logoVariants}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(168,85,247,0.15))',
              border: '1px solid rgba(34,211,238,0.3)',
              boxShadow: '0 0 30px rgba(34,211,238,0.2)',
            }}>
            <ShieldCheck size={36} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-neon-blue">NOVELLEY</span>
            <span className="text-white">X</span>
          </h1>
          <p className="text-white/40 text-sm mt-1 font-mono tracking-wider">EMPLOYEE PORTAL v2.0</p>
        </motion.div>

        {/* Tab switcher */}
        <div className="glass-card p-1.5 flex gap-1 mb-4">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); clearMessages(); setGeneratedPin(null); setSecretPin(''); setEmpPin(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 capitalize
                ${tab === t
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                  : 'text-white/40 hover:text-white/70'}`}
            >
              {t === 'login' ? <><LogIn size={14} className="inline mr-1.5" />Sign In</> : <><UserPlus size={14} className="inline mr-1.5" />Register</>}
            </button>
          ))}
        </div>

        {/* Main Card */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">

            {/* ── LOGIN TAB ─────────────────────────────────────────── */}
            {tab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Login mode toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => { setLoginMode('employee'); clearMessages(); setSecretPin(''); setEmpPin(''); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border
                      ${loginMode === 'employee'
                        ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
                        : 'bg-white/3 border-white/10 text-white/40 hover:text-white/60'}`}
                  >
                    <User size={12} className="inline mr-1" /> Employee
                  </button>
                  <button
                    onClick={() => { setLoginMode('admin'); clearMessages(); setSecretPin(''); setEmpPin(''); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border
                      ${loginMode === 'admin'
                        ? 'bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-400'
                        : 'bg-white/3 border-white/10 text-white/40 hover:text-white/60'}`}
                  >
                    <ShieldCheck size={12} className="inline mr-1" /> Admin
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* Employee Login */}
                  {loginMode === 'employee' && (
                    <motion.div key="emp-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h2 className="text-lg font-bold text-white mb-1">Employee Access</h2>
                      <p className="text-white/40 text-sm mb-6">Enter your 12-digit secure PIN to continue.</p>

                      <div className="space-y-4">
                        <div className="relative">
                          <label className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2 block">
                            <Lock size={10} className="inline mr-1" /> 12-Digit PIN
                          </label>
                          <div className="relative">
                            <input
                              type={showEmpPin ? 'text' : 'password'}
                              value={empPin}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 12);
                                setEmpPin(v);
                                clearMessages();
                              }}
                              placeholder="············"
                              className="cyber-input font-mono text-center text-xl tracking-widest pr-12"
                              onKeyDown={(e) => e.key === 'Enter' && handleEmployeeLogin()}
                            />
                            <button
                              onClick={() => setShowEmpPin(!showEmpPin)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400 transition-colors"
                            >
                              {showEmpPin ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {/* PIN progress indicator */}
                          <div className="flex gap-1 mt-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-200
                                ${i < empPin.length ? 'bg-cyan-400 shadow-[0_0_4px_#22d3ee]' : 'bg-white/10'}`} />
                            ))}
                          </div>
                        </div>

                        {/* 2FA Secret PIN */}
                        <div className="mt-6">
                          <label className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2 block">
                            <ShieldCheck size={10} className="inline mr-1" /> 2FA System Authentication
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              value={secretPin}
                              onChange={(e) => {
                                setSecretPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                                clearMessages();
                              }}
                              placeholder="··········"
                              className="cyber-input font-mono text-center text-xl tracking-[0.8em]"
                              maxLength={4}
                              onKeyDown={(e) => e.key === 'Enter' && handleEmployeeLogin()}
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                              <span className="text-[10px] font-bold text-white/20 uppercase">4-Digit</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleEmployeeLogin}
                        disabled={loading}
                        className="btn-cyber w-full mt-6 flex items-center justify-center gap-2 py-3 text-sm"
                      >
                        {loading
                          ? <><Loader2 size={16} className="animate-spin" /> Authenticating…</>
                          : <><LogIn size={16} /> Access Dashboard</>
                        }
                      </button>
                    </motion.div>
                  )}

                  {/* Admin Login */}
                  {loginMode === 'admin' && (
                    <motion.div key="admin-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h2 className="text-lg font-bold mb-1" style={{ color: '#e879f9' }}>Admin Command Center</h2>
                      <p className="text-white/40 text-sm mb-6">Restricted access. Authorized personnel only.</p>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(232,121,249,0.7)' }}>
                            <Mail size={10} className="inline mr-1" /> Admin Email
                          </label>
                          <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => { setAdminEmail(e.target.value); clearMessages(); }}
                            placeholder="admin@novelleyx.com"
                            className="cyber-input"
                            style={{ borderColor: adminEmail ? 'rgba(232,121,249,0.4)' : undefined }}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(232,121,249,0.7)' }}>
                            <Lock size={10} className="inline mr-1" /> Master PIN (6-digit)
                          </label>
                          <div className="relative">
                            <input
                              type={showAdminPin ? 'text' : 'password'}
                              value={adminPin}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setAdminPin(v);
                                clearMessages();
                              }}
                              placeholder="● ● ● ● ● ●"
                              className="cyber-input font-mono text-center text-xl tracking-widest pr-12"
                              style={{ borderColor: adminPin ? 'rgba(232,121,249,0.4)' : undefined }}
                              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                            />
                            <button
                              onClick={() => setShowAdminPin(!showAdminPin)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-fuchsia-400 transition-colors"
                            >
                              {showAdminPin ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleAdminLogin}
                        disabled={loading}
                        className="w-full mt-6 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, rgba(232,121,249,0.15), rgba(168,85,247,0.1))',
                          border: '1px solid rgba(232,121,249,0.4)',
                          color: '#e879f9',
                          boxShadow: loading ? 'none' : '0 0 20px rgba(232,121,249,0.2)',
                        }}
                      >
                        {loading
                          ? <><Loader2 size={16} className="animate-spin" /> Verifying Identity…</>
                          : <><ShieldCheck size={16} /> Enter Command Center</>
                        }
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── REGISTER TAB ──────────────────────────────────────── */}
            {tab === 'register' && !generatedPin && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-bold text-white mb-1">New Employee Registration</h2>
                <p className="text-white/40 text-sm mb-6">Fill in your details. A secure PIN will be generated for you.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2 block">
                      <User size={10} className="inline mr-1" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => { setRegName(e.target.value); clearMessages(); }}
                      placeholder="John Doe"
                      className="cyber-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2 block">
                      <Mail size={10} className="inline mr-1" /> Work Email
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); clearMessages(); }}
                      placeholder="you@company.com"
                      className="cyber-input"
                      onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2 block">
                      <User size={10} className="inline mr-1" /> Designation
                    </label>
                    <select 
                      value={regRole} 
                      onChange={(e) => setRegRole(e.target.value as Designation)}
                      className="cyber-input"
                    >
                      <option value="employee">Employee</option>
                      <option value="founding piller">Founding Piller</option>
                      <option value="intern">Intern</option>
                      <option value="fresher">Fresher</option>
                      <option value="HR">HR</option>
                      <option value="Team leader">Team Leader</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
                  <p className="text-cyan-400/80 text-xs text-center">
                    <ShieldCheck size={10} className="inline mr-1" />
                    Secure registration active. Your unique 12-digit PIN will be generated instantly.
                  </p>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="btn-cyber w-full mt-5 flex items-center justify-center gap-2 py-3 text-sm"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Generating Secure PIN…</>
                    : <><Sparkles size={16} /> Generate My PIN</>
                  }
                </button>
              </motion.div>
            )}

            {/* ── PIN GENERATED SCREEN ──────────────────────────────── */}
            {tab === 'register' && generatedPin && (
              <motion.div
                key="pin-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'backOut' }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-lime-400/10 border border-lime-400/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-lime-400" />
                </div>

                <h2 className="text-xl font-bold text-white mb-1">Registration Complete!</h2>
                <p className="text-white/40 text-sm mb-6">
                  Your 12-digit PIN has been generated. <strong className="text-amber-400">Save it now</strong> — it won&apos;t be shown again.
                </p>

                {/* PIN display with scanner effect */}
                <div ref={pinRef} className="pin-display relative overflow-hidden mb-6">
                  <div className="scanner-line" />
                  {generatedPin.match(/.{1,4}/g)?.join(' — ')}
                </div>

                <div className="p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/15 text-left mb-6">
                  <p className="text-cyan-400/70 text-xs leading-relaxed text-center">
                    <CheckCircle2 size={10} className="inline mr-1" />
                    Registration Successful! You can now log in using your 12-digit PIN and the system default 4-digit Secret Key.
                  </p>
                </div>

                <button
                  onClick={() => { setTab('login'); setLoginMode('employee'); setGeneratedPin(null); setRegName(''); setRegEmail(''); }}
                  className="btn-cyber w-full flex items-center justify-center gap-2 py-3 text-sm"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ background: 'rgba(132,204,22,0.1)', border: '1px solid rgba(132,204,22,0.3)', color: '#84cc16' }}
              >
                <CheckCircle2 size={16} />
                {success}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6 font-mono">
          NovelleyX Enterprise Portal · Secured · {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
