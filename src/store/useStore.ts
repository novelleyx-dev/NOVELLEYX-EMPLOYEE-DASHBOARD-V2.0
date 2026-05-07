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
export type Designation = 'founding piller' | 'employee' | 'intern' | 'fresher' | 'HR' | 'Team leader';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: Designation;
  pin: string;
  status: UserStatus;
  createdAt: string;
  avatarSeed: string;
  profilePhoto?: string;
  emergencyContact?: { name: string; relation: string; phone: string };
  xp: number;
  badges: string[];
  socials?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
    whatsapp?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  evaluation?: {
    score: number; // 0-100
    remarks: string;
    lastUpdated: string;
  };
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

export interface CustomBadge {
  id: string;
  label: string;
  icon: string;
  xp: number;
  desc: string;
}

export interface EmployeeSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  notificationChannels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  dndMode: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;   // HH:mm
  };
  localization: {
    timezone: string;
    language: string;
  };
  landingPage: string;
  integrations: {
    slack: boolean;
    teams: boolean;
    github: boolean;
    figma: boolean;
    notion: boolean;
  };
  profilePhoto?: string;
  bio?: string;
  twoFactor: boolean;
  biometrics: boolean;
  activityVisibility: boolean;
  linkedEmail?: string;
  customBackground?: string;
}

export interface SupportTicket {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'TICKET' | 'SYSTEM' | 'URGENT';
  relatedId?: string; // e.g. employeeId or ticketId
  read: boolean;
  createdAt: string;
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
  updateEmployeeProfile: (id: string, name: string, photo?: string) => void;
  updateEmployeeRole: (id: string, role: Designation) => void;
  updateEmployeeSocials: (id: string, socials: Employee['socials']) => void;

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

  customBadges: CustomBadge[];
  addCustomBadge: (badge: Omit<CustomBadge, 'id'>) => void;

  tickets: SupportTicket[];
  submitTicket: (employeeId: string, type: string, subject: string) => void;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;

  adminNotifications: AdminNotification[];
  addAdminNotification: (title: string, message: string, type: AdminNotification['type'], relatedId?: string) => void;
  markAdminNotificationRead: (id: string) => void;

  joinMeeting: (employeeId: string, meetingId: string) => void;

  monthlyProductivity: number[]; // 7 months of data
  updateMonthlyProductivity: (data: number[]) => void;
  
  companyProgress: number; // 0-100
  updateCompanyProgress: (progress: number) => void;

  updateEmployeeEvaluation: (id: string, score: number, remarks: string) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const generate12DigitPin = (): string => {
  let pin = '';
  for (let i = 0; i < 12; i++) pin += Math.floor(Math.random() * 10).toString();
  return pin;
};

const generateId = (): string =>
  Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const awardXP = (set: any, id: string, amount: number) => {
  set((state: any) => ({
    employees: state.employees.map((e: any) =>
      e.id === id ? { ...e, xp: e.xp + amount } : e
    )
  }));
};

const awardBadge = (set: any, id: string, badge: string) => {
  set((state: any) => ({
    employees: state.employees.map((e: any) =>
      e.id === id && !e.badges.includes(badge)
        ? { ...e, badges: [...e.badges, badge] }
        : e
    )
  }));
};

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Finance', 'HR', 'Executive'];
const ROLES: Designation[] = ['employee', 'fresher', 'intern', 'Team leader', 'HR', 'founding piller'];

const buildPaystubs = (employeeId: string): PayStub[] => {
  const months = ['November 2024', 'December 2024', 'January 2025', 'February 2025', 'March 2025', 'April 2025'];
  return months.map((month, i) => ({
    id: generateId(), employeeId, month,
    baseSalary: 85000, bonus: i % 2 === 0 ? 5000 : 8000, deductions: 12000,
    net: 85000 + (i % 2 === 0 ? 5000 : 8000) - 12000,
  }));
};

const SEED_MESSAGES: Message[] = [];

const DEFAULT_SETTINGS: EmployeeSettings = {
  theme: 'cyber-dark',
  notificationsEnabled: true,
  notificationChannels: { email: true, push: true, sms: false, inApp: true },
  dndMode: { enabled: false, start: '22:00', end: '08:00' },
  localization: { timezone: 'UTC+5:30', language: 'English (US)' },
  landingPage: 'profile',
  integrations: { slack: false, teams: false, github: false, figma: false, notion: false },
  twoFactor: true,
  biometrics: false,
  activityVisibility: true,
  customBackground: ''
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
          xp: 0,
          badges: [],
        };
        set((state) => ({ 
          employees: [...state.employees, newEmployee] 
        }));

        // Add Admin Notification
        get().addAdminNotification(
          'New Registration',
          `${newEmployee.name} (${newEmployee.email}) is awaiting approval. PIN: ${pin}`,
          'SYSTEM',
          id
        );

        // Also send a Broadcast Message (System) so it shows up in Chat Feed
        get().sendMessage(
          'SYSTEM', 
          'System Protocol', 
          `🚨 NEW REGISTRATION: ${newEmployee.name} is awaiting approval. Secure Key (PIN) has been generated.`, 
          true
        );

        return pin;
      },

      updateEmployeeStatus: (id, status) => {
        set((state) => ({ employees: state.employees.map((e) => e.id === id ? { ...e, status } : e) }));
      },

      updateEmergencyContact: (id, contact) => {
        set((state) => ({ employees: state.employees.map((e) => e.id === id ? { ...e, emergencyContact: contact } : e) }));
      },

      updateProfilePhoto: (id, photo) => {
        set((state) => ({ employees: state.employees.map((e) => e.id === id ? { ...e, profilePhoto: photo } : e) }));
      },

      getEmployeeById: (id) => get().employees.find((e) => e.id === id),

      updateEmployeeProfile: (id, name, photo) => {
        set((state) => ({
          employees: state.employees.map((e) => e.id === id ? { ...e, name, profilePhoto: photo || e.profilePhoto } : e)
        }));
      },

      updateEmployeeRole: (id: string, role: Designation) => {
        set((state) => ({
          employees: state.employees.map((e) => e.id === id ? { ...e, role } : e)
        }));
      },

      updateEmployeeSocials: (id, socials) => {
        set((state) => ({
          employees: state.employees.map((e) => e.id === id ? { ...e, socials } : e)
        }));
      },

      // ── Attendance ──────────────────────────────────────────────────────────
      attendance: [],

      clockIn: (employeeId, location) => {
        const id = generateId();
        const now = new Date();
        const record: AttendanceRecord = { id, employeeId, clockIn: now.toISOString(), location };
        set((state) => ({ attendance: [...state.attendance, record] }));
        
        awardXP(set, employeeId, 50);
        if (now.getHours() < 9) awardBadge(set, employeeId, 'Early Bird');
        awardBadge(set, employeeId, 'Clockwork');
      },

      clockOut: (employeeId) => {
        const now = new Date();
        set((state) => ({
          attendance: state.attendance.map((r) => {
            if (r.employeeId === employeeId && !r.clockOut) {
              const clockOutTime = now.toISOString();
              const duration = Math.round((now.getTime() - new Date(r.clockIn).getTime()) / 60000);
              return { ...r, clockOut: clockOutTime, shiftDuration: duration };
            }
            return r;
          }),
        }));
        awardXP(set, employeeId, 25);
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
        // Initializing with empty array as per user request for "clean/empty" start
        if (get().paystubs.some((p) => p.employeeId === employeeId)) return;
        set((state) => ({ paystubs: state.paystubs }));
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
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;
        set((state) => ({ tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t) }));
        
        if (status === 'APPROVED') {
          const xpGain = task.priority === 'HIGH' ? 200 : task.priority === 'MEDIUM' ? 150 : 100;
          awardXP(set, task.assignedTo, xpGain);
          
          const approvedCount = get().tasks.filter(t => t.assignedTo === task.assignedTo && t.status === 'APPROVED').length;
          if (approvedCount >= 5) awardBadge(set, task.assignedTo, 'Overachiever');
          if (approvedCount >= 10) awardBadge(set, task.assignedTo, 'Mentor');
        }
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

      // ── Custom Badges ──────────────────────────────────────────────────────
      customBadges: [
        { id: 'b1', label: 'Early Bird', icon: 'Sun', xp: 50, desc: 'Clocked in before 9 AM' },
        { id: 'b2', label: 'Clockwork', icon: 'Clock', xp: 25, desc: 'Consistent attendance streak' },
      ],
      addCustomBadge: (badge) => {
        const id = 'cb-' + generateId();
        set((state) => ({ customBadges: [...state.customBadges, { ...badge, id }] }));
      },

      // ── Support Tickets ───────────────────────────────────────────────────
      tickets: [],
      submitTicket: (employeeId, type, subject) => {
        const emp = get().employees.find(e => e.id === employeeId);
        const ticket: SupportTicket = {
          id: 'TKT-' + generateId(),
          employeeId,
          employeeName: emp?.name || 'Unknown',
          type,
          subject,
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tickets: [...state.tickets, ticket] }));
        get().addAdminNotification(
          'New Support Ticket',
          `${emp?.name || 'An employee'} submitted a ${type} ticket: "${subject}"`,
          'TICKET'
        );
      },
      updateTicketStatus: (id, status) => {
        set((state) => ({ tickets: state.tickets.map(t => t.id === id ? { ...t, status } : t) }));
      },

      // ── Admin Notifications ───────────────────────────────────────────────
      adminNotifications: [],
      addAdminNotification: (title, message, type, relatedId) => {
        const notification: AdminNotification = {
          id: generateId(),
          title,
          message,
          type,
          relatedId,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ adminNotifications: [notification, ...state.adminNotifications] }));
      },
      markAdminNotificationRead: (id) => {
        set((state) => ({ adminNotifications: state.adminNotifications.map(n => n.id === id ? { ...n, read: true } : n) }));
      },

      joinMeeting: (employeeId, meetingId) => {
        set((state) => ({
          employees: state.employees.map(e => e.id === employeeId ? { ...e, xp: e.xp + 30 } : e)
        }));
        get().addAdminNotification(
          'Meeting Attendance',
          `${get().employees.find(e => e.id === employeeId)?.name} joined a meeting.`,
          'SYSTEM'
        );
      },

      monthlyProductivity: [65, 59, 80, 81, 56, 55, 40],
      updateMonthlyProductivity: (data) => set({ monthlyProductivity: data }),

      companyProgress: 75,
      updateCompanyProgress: (progress) => set({ companyProgress: progress }),

      updateEmployeeEvaluation: (id, score, remarks) => {
        set((state) => ({
          employees: state.employees.map((e) => e.id === id ? { ...e, evaluation: { score, remarks, lastUpdated: new Date().toISOString() } } : e)
        }));
      },
    }),
    {
      name: 'novelleyx-store-v5',
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
        customBadges: state.customBadges,
        tickets: state.tickets,
        adminNotifications: state.adminNotifications,
      }),
    }
  )
);
