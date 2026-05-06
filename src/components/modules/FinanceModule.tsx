'use client';

/**
 * Finance Vault — Paystub Module
 * Shows salary history table and generates PDF paystubs using jsPDF.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Download, FileText, TrendingUp, Shield,
  ChevronDown, ChevronUp, Loader2, Lock
} from 'lucide-react';
import { useStore, PayStub } from '@/store/useStore';

interface Props { employeeId: string; }

export default function FinanceModule({ employeeId }: Props) {
  const { paystubs, employees } = useStore();
  const emp = employees.find((e) => e.id === employeeId);
  const myStubs = paystubs
    .filter((p) => p.employeeId === employeeId)
    .sort((a, b) => b.month.localeCompare(a.month));

  const [downloading, setDownloading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalNet = myStubs.reduce((s, p) => s + p.net, 0);
  const totalBonus = myStubs.reduce((s, p) => s + p.bonus, 0);

  const handleDownload = async (stub: PayStub) => {
    setDownloading(stub.id);
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const W = 210;
      const MARGIN = 20;

      // Background
      doc.setFillColor(3, 7, 18);
      doc.rect(0, 0, W, 297, 'F');

      // Header bar
      doc.setFillColor(10, 20, 40);
      doc.rect(0, 0, W, 40, 'F');

      // Company name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(34, 211, 238);
      doc.text('NOVELLEYX', MARGIN, 18);
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text('Enterprise Employee Portal', MARGIN, 26);

      // PAY STUB title
      doc.setFontSize(14);
      doc.setTextColor(168, 85, 247);
      doc.text('OFFICIAL PAY STUB', W - MARGIN, 18, { align: 'right' });
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 160);
      doc.text(stub.month, W - MARGIN, 26, { align: 'right' });

      // Divider
      doc.setDrawColor(34, 211, 238);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, 42, W - MARGIN, 42);

      let y = 54;

      // Employee info box
      doc.setFillColor(15, 25, 45);
      doc.roundedRect(MARGIN, y - 6, W - MARGIN * 2, 28, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 180, 220);
      doc.text('EMPLOYEE', MARGIN + 6, y + 2);
      doc.setTextColor(220, 220, 220);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(emp?.name ?? 'Employee', MARGIN + 6, y + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 170);
      doc.text(emp?.email ?? '', MARGIN + 6, y + 17);
      doc.text(`Dept: ${emp?.department ?? '—'}  |  Role: ${emp?.role ?? '—'}`, MARGIN + 6, y + 23);

      y += 36;

      // Earnings table header
      doc.setFillColor(34, 211, 238, 0.1);
      doc.setFillColor(20, 35, 60);
      doc.rect(MARGIN, y, W - MARGIN * 2, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(34, 211, 238);
      doc.text('DESCRIPTION', MARGIN + 4, y + 5.5);
      doc.text('AMOUNT (₹)', W - MARGIN - 4, y + 5.5, { align: 'right' });

      y += 10;

      const rows: [string, number, string][] = [
        ['Base Salary', stub.baseSalary, '#e2e8f0'],
        ['Performance Bonus', stub.bonus, '#84cc16'],
        ['Tax & Deductions', -stub.deductions, '#f87171'],
      ];

      rows.forEach(([label, amount, color]) => {
        doc.setFillColor(8, 15, 30);
        doc.rect(MARGIN, y - 1, W - MARGIN * 2, 10, 'F');
        doc.setDrawColor(30, 45, 70);
        doc.line(MARGIN, y + 9, W - MARGIN, y + 9);
        doc.setFontSize(9);
        doc.setTextColor(...hexToRgb(color));
        doc.text(label, MARGIN + 4, y + 5.5);
        doc.text(`₹ ${Math.abs(amount).toLocaleString('en-IN')}`, W - MARGIN - 4, y + 5.5, { align: 'right' });
        y += 11;
      });

      // Net pay
      y += 4;
      doc.setFillColor(10, 40, 60);
      doc.roundedRect(MARGIN, y, W - MARGIN * 2, 16, 2, 2, 'F');
      doc.setDrawColor(34, 211, 238);
      doc.setLineWidth(1);
      doc.roundedRect(MARGIN, y, W - MARGIN * 2, 16, 2, 2);
      doc.setFontSize(10);
      doc.setTextColor(34, 211, 238);
      doc.setFont('helvetica', 'bold');
      doc.text('NET PAY', MARGIN + 6, y + 10.5);
      doc.setFontSize(14);
      doc.text(`₹ ${stub.net.toLocaleString('en-IN')}`, W - MARGIN - 4, y + 10.5, { align: 'right' });

      y += 28;
      doc.setLineWidth(0.3);
      doc.setDrawColor(40, 60, 90);
      doc.line(MARGIN, y, W - MARGIN, y);

      // Footer
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 100, 130);
      doc.text('This is a computer-generated document and does not require a signature.', W / 2, y, { align: 'center' });
      doc.text('NovelleyX Confidential · For official use only.', W / 2, y + 6, { align: 'center' });

      doc.save(`NovelleyX_Paystub_${stub.month.replace(' ', '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
    setDownloading(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">Finance Vault</h2>
        <p className="text-white/40 text-sm mt-1">Your salary history and downloadable paystubs.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: DollarSign, label: 'Total Net Earned', value: `₹ ${totalNet.toLocaleString('en-IN')}`, color: '34,211,238' },
          { icon: TrendingUp, label: 'Total Bonuses', value: `₹ ${totalBonus.toLocaleString('en-IN')}`, color: '132,204,22' },
          { icon: FileText, label: 'Pay Records', value: myStubs.length.toString(), color: '168,85,247' },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-card p-5 flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.3)` }}>
              <Icon size={20} style={{ color: `rgb(${color})` }} />
            </div>
            <div>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-lg font-black text-white mt-0.5">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Paystub table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Lock size={15} className="text-fuchsia-400" />
          <h3 className="font-bold text-white">Salary History</h3>
          <span className="ml-auto">
            <span className="badge-approved">Encrypted</span>
          </span>
        </div>

        {myStubs.length === 0 ? (
          <div className="py-14 text-center text-white/30">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No paystubs available yet.</p>
            <p className="text-xs mt-1 text-white/20">Paystubs are generated upon account approval.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {myStubs.map((stub, i) => (
              <motion.div
                key={stub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {/* Row header */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/2 transition-colors"
                  onClick={() => setExpanded(expanded === stub.id ? null : stub.id)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
                    <FileText size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{stub.month}</p>
                    <p className="text-xs text-white/40">Net: <span className="text-lime-400 font-mono font-bold">₹ {stub.net.toLocaleString('en-IN')}</span></p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(stub); }}
                    disabled={!!downloading}
                    className="btn-cyber flex items-center gap-1.5 py-2 px-3 text-xs mr-2"
                  >
                    {downloading === stub.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Download size={13} />}
                    Download PDF
                  </button>
                  {expanded === stub.id ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                </div>

                {/* Expanded details */}
                {expanded === stub.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/2 rounded-xl p-4">
                      {[
                        { label: 'Base Salary', value: `₹ ${stub.baseSalary.toLocaleString('en-IN')}`, color: 'text-white' },
                        { label: 'Bonus', value: `₹ ${stub.bonus.toLocaleString('en-IN')}`, color: 'text-lime-400' },
                        { label: 'Deductions', value: `₹ ${stub.deductions.toLocaleString('en-IN')}`, color: 'text-red-400' },
                        { label: 'Net Pay', value: `₹ ${stub.net.toLocaleString('en-IN')}`, color: 'text-cyan-400' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                          <p className="text-xs text-white/40 mb-1 font-semibold uppercase tracking-wider">{label}</p>
                          <p className={`font-bold font-mono text-sm ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: Convert hex color to [r, g, b] tuple
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [200, 200, 200];
}
