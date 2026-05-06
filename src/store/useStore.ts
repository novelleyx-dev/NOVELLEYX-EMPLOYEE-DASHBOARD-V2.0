'use client';

/**
 * NovelleyX Global Zustand Store
 * Handles: auth, employees, attendance, messages, paystubs,
 *          tasks, meetings, DMs, file-transfers, employee settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Type Definitions ───────────────────────────────────────────────────────

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ThemeMode = 'cyber-dark' | 'day' | 'night' | 'forest' | 'ocean' | 'zen';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  pin: string;
  status: UserStatus;
  createdAt: string;
  avatarSeed: string;
  profilePhoto?: string;
  emergencyContact?: { name: string; relation: string; phone: string };
  xp: number;
  badges: string[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  location?: string;
  shiftDuration?: number; // minutes
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isAdmin: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

// Direct Messages between 2 parties
export interface DMMessage {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface PayStub {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  net: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;      // employeeId
  assignedBy: string;      // 'admin'
  assignedAt: string;      // ISO
  deadline: string;        // ISO (default: assignedAt + 24h)
  status: 'OPEN' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submissionPhoto?: string;   // base64 data URL
  submissionNote?: string;
  submittedAt?: string;
  adminExtendedUntil?: string; // ISO override deadline
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;   // ISO
  duration: number;      // minutes
  meetLink?: string;
  createdBy: 'admin';
  attendees: string[];   // ['all'] or array of employeeIds
}

export interface FileTransfer {
  id: string;
  senderId: string;      // 'admin' or employeeId
  receiverId: string;    // 'admin' | employeeId | 'all'
  fileName: string;
  fileUrl: string;       // base64 data URL
  fileType: string;
  fileSize: number;
  timestamp: string;
}

export interface EmployeeSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  profilePhoto?: string;
  bio?: string;
}

export type SessionUser =
  | { type: 'admin' }
  | { type: 'employee'; employeeId: string };

// ─── Store Interface ─────────────────────────────────────────────────────────

interface NovelleyXStore {
  session: SessionUser | null;
  setSession: (s: SessionUser | null) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'pin' | 'createdAt' | 'avatarSeed' | 'xp' | 'badges' | 'status'>) => string;
  updateEmployeeStatus: (id: string, status: UserStatus) => void;
  updateEmergencyContact: (id: string, contact: Employee['emergencyContact']) => void;
  updateProfilePhoto: (id: string, photo: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;

  attendance: AttendanceRecord[];
  clockIn: (employeeId: string, location: string) => void;
  clockOut: (employeeId: string) => void;
  getActiveSession: (employeeId: string) => AttendanceRecord | undefined;
  getTodayMinutes: (employeeId: string) => number;

  messages: Message[];
  sendMessage: (senderId: string, senderName: string, content: string, isAdmin: boolean, mediaUrl?: string, mediaType?: 'image' | 'video') => void;

  dmMessages: DMMessage[];
  sendDM: (senderId: string, receiverId: string, senderName: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  getDMThread: (userA: string, userB: string) => DMMessage[];

  paystubs: PayStub[];
  seedPaystubs: (employeeId: string) => void;

  tasks: Task[];
  assignTask: (task: Omit<Task, 'id' | 'assignedAt' | 'status'>) => string;
  submitTask: (taskId: string, submissionPhoto: string, note: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  extendTaskDeadline: (taskId: string, newDeadline: string) => void;
  getTasksForEmployee: (employeeId: string) => Task[];

  meetings: Meeting[];
  scheduleMeeting: (meeting: Omit<Meeting, 'id' | 'createdBy'>) => void;
  getUpcomingMeetings: (employeeId: string) => Meeting[];

  fileTransfers: FileTransfer[];
  sendFile: (file: Omit<FileTransfer, 'id' | 'timestamp'>) => void;
  getFilesForUser: (userId: string) => FileTransfer[];

  employeeSettings: Record<string, EmployeeSettings>;
  updateSettings: (employeeId: string, settings: Partial<EmployeeSettings>) => void;
  getSettings: (employeeId: string) => EmployeeSettings;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const generate12DigitPin = (): string => {
  let pin = '';
  for (let i = 0; i < 12; i++) pin += Math.floor(Math.random() * 10).toString();
  return pin;
};

const generateId = (): string =>
  Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Finance', 'HR'];
const ROLES = ['Software Engineer', 'UI Designer', 'Marketing Lead', 'Ops Manager', 'Analyst', 'HR Specialist'];

const buildPaystubs = (employeeId: string): PayStub[] => {
  const months = ['November 2024', 'December 2024', 'January 2025', 'February 2025', 'March 2025', 'April 2025'];
  return months.map((month, i) => ({
    id: generateId(), employeeId, month,
    baseSalary: 85000, bonus: i % 2 === 0 ? 5000 : 8000, deductions: 12000,
    net: 85000 + (i % 2 === 0 ? 5000 : 8000) - 12000,
  }));
};

const SEED_MESSAGES: Message[] = [
  { id: 'msg-0', senderId: 'admin', senderName: 'Admin — Abhinav', content: '🚀 Welcome to the NovelleyX Comm-Link! Secure internal messaging board.', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), isAdmin: true },
  { id: 'msg-1', senderId: 'admin', senderName: 'Admin — Abhinav', content: '📋 Reminder: Q2 performance reviews begin next Monday. Please update your self-assessments.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), isAdmin: true },
];

const DEFAULT_SETTINGS: EmployeeSettings = {
  theme: 'cyber-dark',
  notificationsEnabled: true,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create<NovelleyXStore>()(
  persist(
    (set, get) => ({
      session: null,
      setSession: (s) => set({ session: s }),

      // ── Employees ──────────────────────────────────────────────────────────
      employees: [],

      addEmployee: (emp) => {
        const id = generateId();
        const pin = generate12DigitPin();
        const deptIndex = Math.floor(Math.random() * DEPARTMENTS.length);
        const newEmployee: Employee = {
          ...emp,
          id, pin,
          department: emp.department || DEPARTMENTS[deptIndex],
          role: emp.role || ROLES[deptIndex],
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          avatarSeed: emp.name.toLowerCase().replace(/\s/g, '-') + '-' + id,
          xp: Math.floor(Math.random() * 2000) + 500,
          badges: [],
        };
        set((state) => ({ employees: [...state.employees, newEmployee] }));
        return pin;
      },

      updateEmployeeStatus: (id, status) => {
        set((state) => ({ employees: state.employees.map((e) => e.id === id ? { ...e, status } : e) }));
        if (status === 'APPROVED') get().seedPaystubs(id);
      },

      updateEmergencyContact: (id, contact) => {
        set((state) => ({ employees: state.employees.map((e) => e.id === id ? { ...e, emergencyContact: contact } : e) }));
      },

      updateProfilePhoto: (id, photo) => {
        set((state) => ({ employees: state.employees.map((e) => e.id === id ? { ...e, profilePhoto: photo } : e) }));
      },

      getEmployeeById: (id) => get().employees.find((e) => e.id === id),

      // ── Attendance ──────────────────────────────────────────────────────────
      attendance: [],

      clockIn: (employeeId, location) => {
        const record: AttendanceRecord = { id: generateId(), employeeId, clockIn: new Date().toISOString(), location };
        set((state) => ({ attendance: [...state.attendance, record] }));
        const isEarlyBird = new Date().getHours() < 9;
        set((state) => ({
          employees: state.employees.map((e) => {
            if (e.id !== employeeId) return e;
            const newXp = e.xp + 50;
            const newBadges = [...e.badges];
            if (isEarlyBird && !newBadges.includes('Early Bird')) newBadges.push('Early Bird');
            if (!newBadges.includes('Clockwork')) newBadges.push('Clockwork');
            return { ...e, xp: newXp, badges: newBadges };
          }),
        }));
      },

      clockOut: (employeeId) => {
        set((state) => ({
          attendance: state.attendance.map((r) => {
            if (r.employeeId === employeeId && !r.clockOut) {
              const clockOutTime = new Date().toISOString();
              const duration = Math.round((new Date(clockOutTime).getTime() - new Date(r.clockIn).getTime()) / 60000);
              return { ...r, clockOut: clockOutTime, shiftDuration: duration };
            }
            return r;
          }),
        }));
        set((state) => ({
          employees: state.employees.map((e) => e.id === employeeId ? { ...e, xp: e.xp + 25 } : e),
        }));
      },

      getActiveSession: (employeeId) => get().attendance.find((r) => r.employeeId === employeeId && !r.clockOut),

      getTodayMinutes: (employeeId) => {
        const today = new Date().toDateString();
        return get().attendance
          .filter((r) => r.employeeId === employeeId && new Date(r.clockIn).toDateString() === today && r.clockOut)
          .reduce((sum, r) => sum + (r.shiftDuration || 0), 0);
      },

      // ── Broadcast Messages ──────────────────────────────────────────────────
      messages: SEED_MESSAGES,

      sendMessage: (senderId, senderName, content, isAdmin, mediaUrl, mediaType) => {
        const msg: Message = { id: generateId(), senderId, senderName, content, timestamp: new Date().toISOString(), isAdmin, mediaUrl, mediaType };
        set((state) => ({ messages: [...state.messages, msg] }));
      },

      // ── Direct Messages ─────────────────────────────────────────────────────
      dmMessages: [],

      sendDM: (senderId, receiverId, senderName, content, mediaUrl, mediaType) => {
        const msg: DMMessage = { id: generateId(), senderId, receiverId, senderName, content, timestamp: new Date().toISOString(), mediaUrl, mediaType };
        set((state) => ({ dmMessages: [...state.dmMessages, msg] }));
      },

      getDMThread: (userA, userB) =>
        get().dmMessages.filter((m) =>
          (m.senderId === userA && m.receiverId === userB) ||
          (m.senderId === userB && m.receiverId === userA)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),

      // ── Paystubs ────────────────────────────────────────────────────────────
      paystubs: [],

      seedPaystubs: (employeeId) => {
        if (get().paystubs.some((p) => p.employeeId === employeeId)) return;
        set((state) => ({ paystubs: [...state.paystubs, ...buildPaystubs(employeeId)] }));
      },

      // ── Tasks ───────────────────────────────────────────────────────────────
      tasks: [],

      assignTask: (task) => {
        const id = generateId();
        const now = new Date().toISOString();
        const deadline = task.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const newTask: Task = { ...task, id, assignedAt: now, deadline, status: 'OPEN' };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        return id;
      },

      submitTask: (taskId, submissionPhoto, note) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: 'SUBMITTED', submissionPhoto, submissionNote: note, submittedAt: new Date().toISOString() } : t
          ),
        }));
      },

      updateTaskStatus: (taskId, status) => {
        set((state) => ({ tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t) }));
      },

      extendTaskDeadline: (taskId, newDeadline) => {
        set((state) => ({ tasks: state.tasks.map((t) => t.id === taskId ? { ...t, adminExtendedUntil: newDeadline } : t) }));
      },

      getTasksForEmployee: (employeeId) => get().tasks.filter((t) => t.assignedTo === employeeId),

      // ── Meetings ────────────────────────────────────────────────────────────
      meetings: [],

      scheduleMeeting: (meeting) => {
        const newMeeting: Meeting = { ...meeting, id: generateId(), createdBy: 'admin' };
        set((state) => ({ meetings: [...state.meetings, newMeeting] }));
      },

      getUpcomingMeetings: (employeeId) => {
        const now = new Date();
        return get().meetings
          .filter((m) => new Date(m.scheduledAt) > now && (m.attendees.includes('all') || m.attendees.includes(employeeId)))
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      },

      // ── File Transfers ──────────────────────────────────────────────────────
      fileTransfers: [],

      sendFile: (file) => {
        const newFile: FileTransfer = { ...file, id: generateId(), timestamp: new Date().toISOString() };
        set((state) => ({ fileTransfers: [...state.fileTransfers, newFile] }));
      },

      getFilesForUser: (userId) =>
        get().fileTransfers.filter((f) => f.senderId === userId || f.receiverId === userId || f.receiverId === 'all'),

      // ── Employee Settings ───────────────────────────────────────────────────
      employeeSettings: {},

      updateSettings: (employeeId, settings) => {
        set((state) => ({
          employeeSettings: {
            ...state.employeeSettings,
            [employeeId]: { ...(state.employeeSettings[employeeId] || DEFAULT_SETTINGS), ...settings },
          },
        }));
      },

      getSettings: (employeeId) => get().employeeSettings[employeeId] || DEFAULT_SETTINGS,
    }),
    {
      name: 'novelleyx-store-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        employees: state.employees,
        attendance: state.attendance,
        messages: state.messages,
        dmMessages: state.dmMessages,
        paystubs: state.paystubs,
        tasks: state.tasks,
        meetings: state.meetings,
        fileTransfers: state.fileTransfers,
        employeeSettings: state.employeeSettings,
        session: state.session,
      }),
    }
  )
);
