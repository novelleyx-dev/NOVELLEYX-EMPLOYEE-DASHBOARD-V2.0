'use client';

/**
 * Profile / Onboarding Hub Module
 * Shows employee details, avatar, department, and emergency contact form.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Briefcase, Phone, Heart, Save, CheckCircle2, Edit3, Shield, Calendar, Camera } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRef } from 'react';

interface Props { employeeId: string; }

export default function ProfileModule({ employeeId }: Props) {
  const { employees, updateEmergencyContact, updateEmployeeProfile } = useStore();
  const emp = employees.find((e) => e.id === employeeId);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [contact, setContact] = useState({
    name: emp?.emergencyContact?.name ?? '',
    relation: emp?.emergencyContact?.relation ?? '',
    phone: emp?.emergencyContact?.phone ?? '',
  });

  if (!emp) return null;

  const handleSave = () => {
    updateEmergencyContact(employeeId, contact);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const infoItems = [
    { icon: User, label: 'Full Name', value: emp.name },
    { icon: Mail, label: 'Email', value: emp.email },
    { icon: Building2, label: 'Department', value: emp.department || 'Engineering' },
    { icon: Briefcase, label: 'Role', value: emp.role || 'Software Engineer' },
    { icon: Calendar, label: 'Joined', value: new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
    { icon: Shield, label: 'Status', value: emp.status },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">Onboarding Hub</h2>
        <p className="text-white/40 text-sm mt-1">Your employee profile and emergency contact information.</p>
      </div>

      <motion.div
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Avatar card ─────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <div className="glass-card p-6 text-center border-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-3xl mx-auto overflow-hidden border-2 p-1 group cursor-pointer relative"
                onClick={() => fileRef.current?.click()}
                style={{ borderColor: 'rgba(34,211,238,0.3)', boxShadow: '0 0 30px rgba(34,211,238,0.1)' }}>
                {emp.profilePhoto ? (
                  <img src={emp.profilePhoto} className="w-full h-full object-cover rounded-2xl" alt="profile" />
                ) : (
                  <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${emp.avatarSeed}&backgroundColor=0a0a1a,0d1117&shapeColor=22d3ee,a855f7`}
                    alt={emp.name}
                    className="w-full h-full rounded-2xl"
                  />
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => updateEmployeeProfile(employeeId, emp.name, reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-lime-400 rounded-full border-4 border-black flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">{emp.name}</h3>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mx-auto
              ${emp.role === 'founding piller' ? 'role-piller' : 
                emp.role === 'Team leader' ? 'role-leader' : 
                emp.role === 'HR' ? 'role-hr' : 
                emp.role === 'intern' ? 'role-intern' :
                emp.role === 'fresher' ? 'role-fresher' : 'role-employee'}`}>
              <Shield size={10} /> {emp.role}
            </div>
            <p className="text-white/30 text-[10px] mt-2">{emp.department || 'General'}</p>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-2">Secure Access Key</p>
              <div className="font-mono text-sm font-bold text-cyan-400/40 tracking-widest bg-white/5 py-2 rounded-lg border border-white/5">
                ****-****-{emp.pin.slice(-4)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Details grid ─────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <div className="glass-card p-8 h-full border-white/5">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                <User size={16} className="text-cyan-400" />
              </div>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: 'Full Name', value: emp.name },
                { icon: Mail, label: 'Email', value: emp.email },
                { icon: Building2, label: 'Department', value: emp.department || 'Not Set' },
                { icon: Briefcase, label: 'Role', value: emp.role || 'Not Set' },
                { icon: Calendar, label: 'Joined', value: new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                { icon: Shield, label: 'Account Status', value: emp.status },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={12} className="text-cyan-400/50" />
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-sm text-white font-semibold">
                    {label === 'Account Status'
                      ? <span className={value === 'APPROVED' ? 'badge-approved' : value === 'PENDING' ? 'badge-pending' : 'badge-rejected'}>{value}</span>
                      : label === 'Role' ? (
                        <span className={`role-badge ${
                          value === 'founding piller' ? 'role-piller' : 
                          value === 'Team leader' ? 'role-leader' : 
                          value === 'HR' ? 'role-hr' : 
                          value === 'intern' ? 'role-intern' :
                          value === 'fresher' ? 'role-fresher' : 'role-employee'
                        }`}>{value}</span>
                      ) : value
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Emergency Contact ────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="xl:col-span-3">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Heart size={16} className="text-fuchsia-400" /> Emergency Contact
              </h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn-cyber flex items-center gap-2 py-2 px-4 text-xs">
                  <Edit3 size={13} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 border border-white/10 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="btn-approve flex items-center gap-1.5 px-4 py-2 text-xs">
                    <Save size={13} /> Save
                  </button>
                </div>
              )}
            </div>

            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ background: 'rgba(132,204,22,0.1)', border: '1px solid rgba(132,204,22,0.3)', color: '#84cc16' }}
              >
                <CheckCircle2 size={15} /> Emergency contact saved successfully.
              </motion.div>
            )}

            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2 block">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="cyber-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2 block">
                    Relation
                  </label>
                  <input
                    type="text"
                    value={contact.relation}
                    onChange={(e) => setContact({ ...contact, relation: e.target.value })}
                    placeholder="Spouse / Parent / Sibling"
                    className="cyber-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="cyber-input"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: User, label: 'Name', value: emp.emergencyContact?.name || '—' },
                  { icon: Heart, label: 'Relation', value: emp.emergencyContact?.relation || '—' },
                  { icon: Phone, label: 'Phone', value: emp.emergencyContact?.phone || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/3 border border-white/6">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={12} className="text-fuchsia-400/70" />
                      <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-sm text-white font-medium">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
