'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, File, Image as ImageIcon, Film, FileText, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminFilesModule() {
  const { employees, fileTransfers, sendFile, getFilesForUser } = useStore();
  const approved = employees.filter(e => e.status === 'APPROVED');
  const [target, setTarget] = useState('all');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const files = getFilesForUser('admin');

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      sendFile({
        senderId: 'admin',
        receiverId: target,
        fileName: file.name,
        fileUrl: reader.result as string,
        fileType: file.type,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const formatSize = (bytes: number) => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  const fileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={18} className="text-purple-400" />;
    if (type.startsWith('video/')) return <Film size={18} className="text-cyan-400" />;
    return <FileText size={18} className="text-white/50" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">File Transfer</h2>
        <p className="text-white/40 text-sm">Send files to all employees or specific individuals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Send To</label>
            <select className="cyber-input" value={target} onChange={e => setTarget(e.target.value)}>
              <option value="all">All Employees</option>
              {approved.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${dragging ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/15 hover:border-cyan-400/40 hover:bg-white/2'}`}>
            <Upload size={28} className={`mx-auto mb-2 ${dragging ? 'text-cyan-400' : 'text-white/30'}`} />
            <p className="text-sm text-white/50">Drop file here or <span className="text-cyan-400">click to browse</span></p>
            <p className="text-xs text-white/30 mt-1">Any file type</p>
          </div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleInput} />
        </div>

        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><File size={14} className="text-cyan-400" /> Sent Files ({files.length})</h3>
          {files.length === 0 ? (
            <div className="py-10 text-center text-white/30">
              <File size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No files sent yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {[...files].reverse().map(f => {
                const receiver = f.receiverId === 'all' ? 'All Employees' : employees.find(e => e.id === f.receiverId)?.name || f.receiverId;
                return (
                  <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      {fileIcon(f.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{f.fileName}</p>
                      <div className="flex gap-2 text-xs text-white/40">
                        <span>→ {receiver}</span>
                        <span>{formatSize(f.fileSize)}</span>
                        <span>{new Date(f.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a href={f.fileUrl} download={f.fileName}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20">
                      <Download size={14} />
                    </a>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
