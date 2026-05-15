// ============================================
// PRO Nurse Enterprise Hospital ERP - Types
// ============================================

// User Roles - Dynamic, stored in Firestore
export type UserRole =
  | 'super_admin'
  | 'hospital_admin'
  | 'hr'
  | 'head_nurse'
  | 'nurse'
  | 'doctor'
  | 'receptionist'
  | 'accountant'
  | 'it_admin'
  | 'department_manager'
  | 'security_staff'
  | 'pharmacist'
  | 'lab_technician'
  | 'maintenance_staff'
  | string

export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'on_leave' | 'terminated'

export type DepartmentCategory = 'medical' | 'administrative' | 'support'

// ============================================
// Core User & Authentication
// ============================================

export interface User {
  id: string
  name: string
  nameAr: string
  email: string
  phone?: string
  employeeCode: string
  role: UserRole
  roleId: string
  department: string
  departmentId: string
  status: EmployeeStatus
  avatar?: string
  hireDate: string
  lastLogin?: string
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  metadata?: Record<string, unknown>
}

// ============================================
// Dynamic Roles & Permissions
// ============================================

export interface Permission {
  id: string
  module: string
  action: string
  label: string
  labelAr: string
  description?: string
}

export interface Role {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  permissions: string[]
  isActive: boolean
  isSystem: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  userCount?: number
}

export type PermissionModule =
  | 'dashboard'
  | 'users'
  | 'roles'
  | 'departments'
  | 'attendance'
  | 'scheduling'
  | 'reports'
  | 'notifications'
  | 'messages'
  | 'settings'
  | 'audit_logs'
  | 'profile'
  | 'leave'
  | 'payroll'
  | 'inventory'
  | 'equipment'
  | 'training'
  | 'quality'
  | 'incidents'

// ============================================
// Departments
// ============================================

export interface Department {
  id: string
  name: string
  nameAr: string
  category: DepartmentCategory
  code: string
  managerId?: string
  managerName?: string
  floor?: string
  building?: string
  phone?: string
  email?: string
  beds?: number
  capacity?: number
  currentOccupancy?: number
  staffCount: number
  isActive: boolean
  color?: string
  icon?: string
  settings?: DepartmentSettings
  createdAt: string
  updatedAt: string
}

export interface DepartmentSettings {
  shiftStartMorning?: string
  shiftStartEvening?: string
  shiftStartNight?: string
  minStaffMorning?: number
  minStaffEvening?: number
  minStaffNight?: number
  overtimeThreshold?: number
  lateToleranceMinutes?: number
}

// ============================================
// Shift & Scheduling
// ============================================

export type ShiftType = 'morning' | 'evening' | 'night' | 'on_call' | 'custom'

export interface Shift {
  id: string
  date: string
  shiftType: ShiftType
  departmentId: string
  departmentName: string
  assignedTo: string
  assignedToName: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'swapped'
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ShiftTemplate {
  id: string
  name: string
  nameAr: string
  departmentId: string
  shifts: {
    dayOfWeek: number
    shiftType: ShiftType
    startTime: string
    endTime: string
    minStaff: number
  }[]
  isActive: boolean
  createdAt: string
}

// ============================================
// Attendance
// ============================================

export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  departmentId: string
  date: string
  checkIn?: string
  checkOut?: string
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'on_leave' | 'holiday'
  lateMinutes?: number
  overtimeMinutes?: number
  shiftType: ShiftType
  notes?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// Leave Management
// ============================================

export type LeaveType = 'annual' | 'sick' | 'emergency' | 'maternity' | 'paternity' | 'unpaid' | 'compassionate' | 'study' | 'hajj'

export interface LeaveRequest {
  id: string
  userId: string
  userName: string
  departmentId: string
  departmentName: string
  type: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  rejectionReason?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface LeaveBalance {
  userId: string
  year: number
  annual: { total: number; used: number; remaining: number }
  sick: { total: number; used: number; remaining: number }
  emergency: { total: number; used: number; remaining: number }
  unpaid: { total: number; used: number; remaining: number }
}

// ============================================
// Notifications & Messages
// ============================================

export type NotificationType =
  | 'system'
  | 'alert'
  | 'approval_needed'
  | 'leave_request'
  | 'shift_change'
  | 'attendance'
  | 'message'
  | 'announcement'
  | 'emergency'
  | 'task_assigned'
  | 'report_submitted'
  | 'role_change'
  | 'department_update'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
  id: string
  type: NotificationType | string
  title: string
  titleAr: string
  message: string
  messageAr: string
  priority: NotificationPriority
  read: boolean
  actionUrl?: string
  actionLabel?: string
  actionLabelAr?: string
  recipientId: string
  senderId?: string
  senderName?: string
  data?: Record<string, unknown>
  createdAt: string
  expiresAt?: string
}

export interface Message {
  id: string
  fromId: string
  fromName: string
  toId: string
  toName: string
  subject: string
  content: string
  priority: NotificationPriority
  read: boolean
  starred: boolean
  archived: boolean
  attachments?: string[]
  threadId?: string
  parentId?: string
  createdAt: string
}

// ============================================
// Reports
// ============================================

export type ReportType = 'shift' | 'attendance' | 'staff' | 'department' | 'leave' | 'incident' | 'quality' | 'financial'
export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Report {
  id: string
  type: ReportType
  title: string
  titleAr: string
  description?: string
  departmentId?: string
  departmentName?: string
  authorId: string
  authorName: string
  status: ReportStatus
  dateRange?: { start: string; end: string }
  data?: Record<string, unknown>
  attachments?: string[]
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// Audit Logs
// ============================================

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'
  | 'department_created'
  | 'department_updated'
  | 'shift_created'
  | 'shift_updated'
  | 'leave_requested'
  | 'leave_approved'
  | 'leave_rejected'
  | 'settings_updated'
  | 'report_submitted'
  | 'report_approved'
  | 'permission_changed'
  | 'password_changed'
  | 'data_exported'

export interface AuditLog {
  id: string
  action: AuditAction
  userId: string
  userName: string
  userRole: string
  targetType?: string
  targetId?: string
  targetName?: string
  details: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

// ============================================
// Settings
// ============================================

export interface HospitalSettings {
  general: {
    name: string
    nameAr: string
    logo?: string
    phone: string
    email: string
    address: string
    addressAr: string
    timezone: string
    language: string
    dateFormat: string
    timeFormat: '12h' | '24h'
  }
  security: {
    passwordMinLength: number
    passwordRequireUppercase: boolean
    passwordRequireNumber: boolean
    passwordRequireSpecial: boolean
    sessionTimeoutMinutes: number
    maxLoginAttempts: number
    lockoutDurationMinutes: number
    mfaEnabled: boolean
    mfaRequired: boolean
  }
  authentication: {
    googleLoginEnabled: boolean
    employeeCodeLoginEnabled: boolean
    emailLoginEnabled: boolean
    requireApprovalForNewUsers: boolean
    autoGenerateEmployeeCodes: boolean
    employeeCodePrefix: string
  }
  notifications: {
    emailEnabled: boolean
    pushEnabled: boolean
    soundEnabled: boolean
    shiftReminders: boolean
    shiftReminderMinutesBefore: number
    leaveApprovalNotify: boolean
    attendanceAlerts: boolean
  }
  attendance: {
    lateToleranceMinutes: number
    overtimeThresholdMinutes: number
    autoCheckoutEnabled: boolean
    autoCheckoutTime: string
    weekendDays: number[]
    workingHoursPerDay: number
  }
  scheduling: {
    defaultShiftDuration: number
    minRestBetweenShifts: number
    maxConsecutiveShifts: number
    allowShiftSwap: boolean
    requireApprovalForSwap: boolean
    conflictDetection: boolean
  }
  appearance: {
    defaultTheme: 'light' | 'dark' | 'system'
    primaryColor: string
    accentColor: string
    sidebarCollapsed: boolean
  }
  features: {
    modulesEnabled: string[]
    betaFeaturesEnabled: boolean
  }
}

// ============================================
// Dashboard & Analytics
// ============================================

export interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalDepartments: number
  activeDepartments: number
  totalNurses: number
  totalDoctors: number
  activeShifts: number
  todayAttendance: number
  pendingLeaves: number
  pendingApprovals: number
  bedOccupancy?: number
  icuOccupancy?: number
  emergencyAlerts: number
}

export interface Activity {
  id: string
  type: string
  userId: string
  userName: string
  action: string
  actionAr: string
  target?: string
  targetId?: string
  department?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// ============================================
// Equipment & Inventory
// ============================================

export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'broken' | 'retired'

export interface Equipment {
  id: string
  name: string
  nameAr: string
  serialNumber: string
  category: string
  departmentId: string
  departmentName: string
  location: string
  status: EquipmentStatus
  lastMaintenance?: string
  nextMaintenance?: string
  purchaseDate: string
  warrantyExpiry?: string
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  name: string
  nameAr: string
  category: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  departmentId: string
  departmentName: string
  lastRestocked?: string
  expiryDate?: string
  supplier?: string
  unitCost?: number
  createdAt: string
  updatedAt: string
}

// ============================================
// Training & Development
// ============================================

export interface Training {
  id: string
  name: string
  nameAr: string
  type: 'mandatory' | 'optional' | 'specialized'
  category: string
  duration: number
  validityPeriod: number
  provider: string
  description?: string
  departmentIds?: string[]
  roleIds?: string[]
  isActive: boolean
  createdAt: string
}

export interface StaffCertification {
  id: string
  userId: string
  userName: string
  trainingId: string
  trainingName: string
  completedDate: string
  expiryDate: string
  status: 'valid' | 'expiring_soon' | 'expired'
  certificateUrl?: string
  score?: number
}

// ============================================
// Incidents & Quality
// ============================================

export type IncidentType = 'fall' | 'medication_error' | 'pressure_ulcer' | 'infection' | 'equipment_failure' | 'needle_stick' | 'patient_complaint' | 'workplace_injury' | 'security_breach' | 'other'
export type IncidentSeverity = 'near_miss' | 'minor' | 'moderate' | 'major' | 'catastrophic'

export interface IncidentReport {
  id: string
  type: IncidentType
  severity: IncidentSeverity
  departmentId: string
  departmentName: string
  location: string
  dateTime: string
  reportedBy: string
  reportedById: string
  description: string
  immediateActions: string
  witnesses?: string[]
  rootCause?: string
  correctiveActions?: string
  status: 'reported' | 'investigating' | 'resolved' | 'closed'
  assignedTo?: string
  resolvedAt?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface QualityIndicator {
  id: string
  name: string
  nameAr: string
  category: 'patient_safety' | 'clinical' | 'operational' | 'staff' | 'financial'
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  period: string
  departmentId?: string
  createdAt: string
}

// ============================================
// Emergency & Alerts
// ============================================

export type EmergencyCodeType = 'blue' | 'red' | 'black' | 'pink' | 'orange' | 'yellow' | 'green'

export interface EmergencyCode {
  id: string
  type: EmergencyCodeType
  location: string
  department: string
  departmentId: string
  calledBy: string
  calledById: string
  status: 'active' | 'resolved' | 'cancelled'
  startTime: string
  endTime?: string
  responders: string[]
  notes: string
  outcome?: string
  createdAt: string
}

// ============================================
// Payroll
// ============================================

export interface PayrollRecord {
  id: string
  userId: string
  userName: string
  departmentId: string
  month: string
  year: number
  baseSalary: number
  allowances: number
  deductions: number
  overtime: number
  netSalary: number
  status: 'draft' | 'processed' | 'paid'
  processedAt?: string
  processedBy?: string
  createdAt: string
}

// ============================================
// Vital Signs Monitoring
// ============================================

export interface VitalSigns {
  id: string
  patientId: string
  timestamp: string
  temperature: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  painLevel: number
  recordedBy: string
  notes?: string
}

// ============================================
// Task Management
// ============================================

export interface NursingTask {
  id: string
  patientId?: string
  patientName?: string
  department: string
  departmentId?: string
  type: 'medication' | 'assessment' | 'procedure' | 'documentation' | 'communication' | 'other'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  assignedToId: string
  dueTime: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  completedAt?: string
  completedBy?: string
  notes?: string
  createdAt: string
}

// ============================================
// Handover / SBAR
// ============================================

export interface Handover {
  id: string
  patientId: string
  patientName: string
  mrn: string
  department: string
  departmentId?: string
  fromNurse: string
  toNurse: string
  shift: 'morning' | 'evening' | 'night'
  date: string
  situation: string
  background: string
  assessment: string
  recommendation: string
  criticalAlerts: string[]
  pendingTasks: string[]
  status: 'pending' | 'acknowledged' | 'completed'
  createdAt: string
}

// ============================================
// Alerts
// ============================================

export interface Alert {
  id: string
  type: 'over_capacity' | 'low_staff' | 'critical_patient' | 'isolation' | 'emergency' | 'system'
  message: string
  messageAr: string
  department?: string
  departmentId?: string
  severity: 'warning' | 'critical' | 'info'
  timestamp: string
  resolved?: boolean
  resolvedAt?: string
}

// ============================================
// User Presence (Online Status)
// ============================================

export interface UserPresence {
  id: string
  name: string
  department: string
  role: UserRole
  isOnline: boolean
  lastSeen: string
  currentPage?: string
}

// ============================================
// Legacy Compatibility - Role Permissions
// ============================================

export interface RolePermissions {
  canViewDashboard: boolean
  canCreateReports: boolean
  canApproveReports: boolean
  canManageStaff: boolean
  canManageDepartments: boolean
  canViewAnalytics: boolean
  canManageUsers: boolean
  canManageRoles: boolean
  canViewAuditLogs: boolean
  canExportData: boolean
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  super_admin: {
    canViewDashboard: true, canCreateReports: true, canApproveReports: true,
    canManageStaff: true, canManageDepartments: true, canViewAnalytics: true,
    canManageUsers: true, canManageRoles: true, canViewAuditLogs: true, canExportData: true,
  },
  hospital_admin: {
    canViewDashboard: true, canCreateReports: true, canApproveReports: true,
    canManageStaff: true, canManageDepartments: true, canViewAnalytics: true,
    canManageUsers: true, canManageRoles: true, canViewAuditLogs: true, canExportData: true,
  },
  hr: {
    canViewDashboard: true, canCreateReports: true, canApproveReports: false,
    canManageStaff: true, canManageDepartments: false, canViewAnalytics: true,
    canManageUsers: true, canManageRoles: false, canViewAuditLogs: true, canExportData: true,
  },
  head_nurse: {
    canViewDashboard: true, canCreateReports: true, canApproveReports: true,
    canManageStaff: true, canManageDepartments: true, canViewAnalytics: true,
    canManageUsers: false, canManageRoles: false, canViewAuditLogs: true, canExportData: true,
  },
  nurse: {
    canViewDashboard: true, canCreateReports: true, canApproveReports: false,
    canManageStaff: false, canManageDepartments: false, canViewAnalytics: false,
    canManageUsers: false, canManageRoles: false, canViewAuditLogs: false, canExportData: false,
  },
  doctor: {
    canViewDashboard: true, canCreateReports: true, canApproveReports: true,
    canManageStaff: false, canManageDepartments: false, canViewAnalytics: true,
    canManageUsers: false, canManageRoles: false, canViewAuditLogs: false, canExportData: true,
  },
  receptionist: {
    canViewDashboard: true, canCreateReports: false, canApproveReports: false,
    canManageStaff: false, canManageDepartments: false, canViewAnalytics: false,
    canManageUsers: false, canManageRoles: false, canViewAuditLogs: false, canExportData: false,
  },
  department_manager: {
    canViewDashboard: true, canCreateReports: true, canApproveReports: true,
    canManageStaff: true, canManageDepartments: true, canViewAnalytics: true,
    canManageUsers: false, canManageRoles: false, canViewAuditLogs: true, canExportData: true,
  },
}

// ============================================
// Firestore Collection Paths
// ============================================

export const COLLECTIONS = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  DEPARTMENTS: 'departments',
  SHIFTS: 'shifts',
  SHIFT_TEMPLATES: 'shiftTemplates',
  ATTENDANCE: 'attendance',
  LEAVE_REQUESTS: 'leaveRequests',
  LEAVE_BALANCES: 'leaveBalances',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  REPORTS: 'reports',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
  EQUIPMENT: 'equipment',
  INVENTORY: 'inventory',
  TRAINING: 'training',
  CERTIFICATIONS: 'certifications',
  INCIDENTS: 'incidents',
  QUALITY_INDICATORS: 'qualityIndicators',
  PAYROLL: 'payroll',
  EMERGENCY_CODES: 'emergencyCodes',
  ACTIVITIES: 'activities',
} as const
