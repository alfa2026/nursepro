'use client'

/**
 * Central module for all Firestore collection CRUD helpers.
 * Each function wraps the generic firebase-services layer with the
 * correct collection name and type, and re-exports real-time subscription
 * helpers so pages don't need to import from multiple places.
 */

import {
  createDocument,
  createDocumentWithId,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  batchCreate,
  batchUpdate,
  where,
  orderBy,
  limit,
} from './firebase-services'
import { COLLECTIONS } from '@/types'
import type {
  Department,
  Shift,
  AttendanceRecord,
  LeaveRequest,
  Report,
  Equipment,
  InventoryItem,
  Training,
  IncidentReport,
  QualityIndicator,
  EmergencyCode,
  PayrollRecord,
  NursingTask,
  Handover,
  VitalSigns,
  Message,
  Role,
} from '@/types'
import type { Unsubscribe, QueryConstraint } from 'firebase/firestore'

// ── Departments ──────────────────────────────────────────────
export const departmentService = {
  create: (data: Omit<Department, 'id'>) => createDocument<Department>(COLLECTIONS.DEPARTMENTS, data as never),
  get: (id: string) => getDocument<Department>(COLLECTIONS.DEPARTMENTS, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<Department>(COLLECTIONS.DEPARTMENTS, constraints ?? [orderBy('name')]),
  update: (id: string, data: Partial<Department>) => updateDocument(COLLECTIONS.DEPARTMENTS, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.DEPARTMENTS, id),
  subscribe: (cb: (d: Department[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<Department>(COLLECTIONS.DEPARTMENTS, constraints ?? [orderBy('name')], cb),
}

// ── Shifts ───────────────────────────────────────────────────
export const shiftService = {
  create: (data: Omit<Shift, 'id'>) => createDocument<Shift>(COLLECTIONS.SHIFTS, data as never),
  get: (id: string) => getDocument<Shift>(COLLECTIONS.SHIFTS, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<Shift>(COLLECTIONS.SHIFTS, constraints ?? [orderBy('date', 'desc')]),
  update: (id: string, data: Partial<Shift>) => updateDocument(COLLECTIONS.SHIFTS, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.SHIFTS, id),
  subscribe: (cb: (d: Shift[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<Shift>(COLLECTIONS.SHIFTS, constraints ?? [orderBy('date', 'desc')], cb),
}

// ── Attendance ───────────────────────────────────────────────
export const attendanceService = {
  create: (data: Omit<AttendanceRecord, 'id'>) => createDocument<AttendanceRecord>(COLLECTIONS.ATTENDANCE, data as never),
  get: (id: string) => getDocument<AttendanceRecord>(COLLECTIONS.ATTENDANCE, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<AttendanceRecord>(COLLECTIONS.ATTENDANCE, constraints ?? [orderBy('date', 'desc')]),
  update: (id: string, data: Partial<AttendanceRecord>) => updateDocument(COLLECTIONS.ATTENDANCE, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.ATTENDANCE, id),
  subscribe: (cb: (d: AttendanceRecord[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<AttendanceRecord>(COLLECTIONS.ATTENDANCE, constraints ?? [orderBy('date', 'desc')], cb),
}

// ── Leave Requests ───────────────────────────────────────────
export const leaveService = {
  create: (data: Omit<LeaveRequest, 'id'>) => createDocument<LeaveRequest>(COLLECTIONS.LEAVE_REQUESTS, data as never),
  get: (id: string) => getDocument<LeaveRequest>(COLLECTIONS.LEAVE_REQUESTS, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<LeaveRequest>(COLLECTIONS.LEAVE_REQUESTS, constraints ?? [orderBy('createdAt', 'desc')]),
  update: (id: string, data: Partial<LeaveRequest>) => updateDocument(COLLECTIONS.LEAVE_REQUESTS, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.LEAVE_REQUESTS, id),
  subscribe: (cb: (d: LeaveRequest[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<LeaveRequest>(COLLECTIONS.LEAVE_REQUESTS, constraints ?? [orderBy('createdAt', 'desc')], cb),
}

// ── Reports ──────────────────────────────────────────────────
export const reportService = {
  create: (data: Omit<Report, 'id'>) => createDocument<Report>(COLLECTIONS.REPORTS, data as never),
  get: (id: string) => getDocument<Report>(COLLECTIONS.REPORTS, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<Report>(COLLECTIONS.REPORTS, constraints ?? [orderBy('createdAt', 'desc')]),
  update: (id: string, data: Partial<Report>) => updateDocument(COLLECTIONS.REPORTS, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.REPORTS, id),
  subscribe: (cb: (d: Report[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<Report>(COLLECTIONS.REPORTS, constraints ?? [orderBy('createdAt', 'desc')], cb),
}

// ── Equipment ────────────────────────────────────────────────
export const equipmentService = {
  create: (data: Omit<Equipment, 'id'>) => createDocument<Equipment>(COLLECTIONS.EQUIPMENT, data as never),
  get: (id: string) => getDocument<Equipment>(COLLECTIONS.EQUIPMENT, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<Equipment>(COLLECTIONS.EQUIPMENT, constraints ?? [orderBy('name')]),
  update: (id: string, data: Partial<Equipment>) => updateDocument(COLLECTIONS.EQUIPMENT, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.EQUIPMENT, id),
  subscribe: (cb: (d: Equipment[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<Equipment>(COLLECTIONS.EQUIPMENT, constraints ?? [orderBy('name')], cb),
}

// ── Inventory ────────────────────────────────────────────────
export const inventoryService = {
  create: (data: Omit<InventoryItem, 'id'>) => createDocument<InventoryItem>(COLLECTIONS.INVENTORY, data as never),
  get: (id: string) => getDocument<InventoryItem>(COLLECTIONS.INVENTORY, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<InventoryItem>(COLLECTIONS.INVENTORY, constraints ?? [orderBy('name')]),
  update: (id: string, data: Partial<InventoryItem>) => updateDocument(COLLECTIONS.INVENTORY, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.INVENTORY, id),
  subscribe: (cb: (d: InventoryItem[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<InventoryItem>(COLLECTIONS.INVENTORY, constraints ?? [orderBy('name')], cb),
}

// ── Training ─────────────────────────────────────────────────
export const trainingService = {
  create: (data: Omit<Training, 'id'>) => createDocument<Training>(COLLECTIONS.TRAINING, data as never),
  get: (id: string) => getDocument<Training>(COLLECTIONS.TRAINING, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<Training>(COLLECTIONS.TRAINING, constraints ?? [orderBy('name')]),
  update: (id: string, data: Partial<Training>) => updateDocument(COLLECTIONS.TRAINING, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.TRAINING, id),
  subscribe: (cb: (d: Training[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<Training>(COLLECTIONS.TRAINING, constraints ?? [orderBy('name')], cb),
}

// ── Incidents ────────────────────────────────────────────────
export const incidentService = {
  create: (data: Omit<IncidentReport, 'id'>) => createDocument<IncidentReport>(COLLECTIONS.INCIDENTS, data as never),
  get: (id: string) => getDocument<IncidentReport>(COLLECTIONS.INCIDENTS, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<IncidentReport>(COLLECTIONS.INCIDENTS, constraints ?? [orderBy('createdAt', 'desc')]),
  update: (id: string, data: Partial<IncidentReport>) => updateDocument(COLLECTIONS.INCIDENTS, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.INCIDENTS, id),
  subscribe: (cb: (d: IncidentReport[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<IncidentReport>(COLLECTIONS.INCIDENTS, constraints ?? [orderBy('createdAt', 'desc')], cb),
}

// ── Quality ──────────────────────────────────────────────────
export const qualityService = {
  create: (data: Omit<QualityIndicator, 'id'>) => createDocument<QualityIndicator>(COLLECTIONS.QUALITY_INDICATORS, data as never),
  get: (id: string) => getDocument<QualityIndicator>(COLLECTIONS.QUALITY_INDICATORS, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<QualityIndicator>(COLLECTIONS.QUALITY_INDICATORS, constraints ?? []),
  update: (id: string, data: Partial<QualityIndicator>) => updateDocument(COLLECTIONS.QUALITY_INDICATORS, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.QUALITY_INDICATORS, id),
  subscribe: (cb: (d: QualityIndicator[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<QualityIndicator>(COLLECTIONS.QUALITY_INDICATORS, constraints ?? [], cb),
}

// ── Emergency ────────────────────────────────────────────────
export const emergencyService = {
  create: (data: Omit<EmergencyCode, 'id'>) => createDocument<EmergencyCode>(COLLECTIONS.EMERGENCY_CODES, data as never),
  get: (id: string) => getDocument<EmergencyCode>(COLLECTIONS.EMERGENCY_CODES, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<EmergencyCode>(COLLECTIONS.EMERGENCY_CODES, constraints ?? [orderBy('startTime', 'desc')]),
  update: (id: string, data: Partial<EmergencyCode>) => updateDocument(COLLECTIONS.EMERGENCY_CODES, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.EMERGENCY_CODES, id),
  subscribe: (cb: (d: EmergencyCode[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<EmergencyCode>(COLLECTIONS.EMERGENCY_CODES, constraints ?? [orderBy('startTime', 'desc')], cb),
}

// ── Payroll ──────────────────────────────────────────────────
export const payrollService = {
  create: (data: Omit<PayrollRecord, 'id'>) => createDocument<PayrollRecord>(COLLECTIONS.PAYROLL, data as never),
  get: (id: string) => getDocument<PayrollRecord>(COLLECTIONS.PAYROLL, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<PayrollRecord>(COLLECTIONS.PAYROLL, constraints ?? [orderBy('createdAt', 'desc')]),
  update: (id: string, data: Partial<PayrollRecord>) => updateDocument(COLLECTIONS.PAYROLL, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.PAYROLL, id),
  subscribe: (cb: (d: PayrollRecord[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<PayrollRecord>(COLLECTIONS.PAYROLL, constraints ?? [orderBy('createdAt', 'desc')], cb),
}

// ── Messages ─────────────────────────────────────────────────
export const messageService = {
  create: (data: Omit<Message, 'id'>) => createDocument<Message>(COLLECTIONS.MESSAGES, data as never),
  get: (id: string) => getDocument<Message>(COLLECTIONS.MESSAGES, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<Message>(COLLECTIONS.MESSAGES, constraints ?? [orderBy('createdAt', 'desc')]),
  update: (id: string, data: Partial<Message>) => updateDocument(COLLECTIONS.MESSAGES, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.MESSAGES, id),
  subscribe: (cb: (d: Message[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<Message>(COLLECTIONS.MESSAGES, constraints ?? [orderBy('createdAt', 'desc')], cb),
}

// ── Roles ────────────────────────────────────────────────────
export const roleService = {
  create: (data: Omit<Role, 'id'>) => createDocument<Role>(COLLECTIONS.ROLES, data as never),
  get: (id: string) => getDocument<Role>(COLLECTIONS.ROLES, id),
  list: (constraints?: QueryConstraint[]) => getDocuments<Role>(COLLECTIONS.ROLES, constraints ?? [orderBy('name')]),
  update: (id: string, data: Partial<Role>) => updateDocument(COLLECTIONS.ROLES, id, data),
  remove: (id: string) => deleteDocument(COLLECTIONS.ROLES, id),
  subscribe: (cb: (d: Role[]) => void, constraints?: QueryConstraint[]): Unsubscribe =>
    subscribeToCollection<Role>(COLLECTIONS.ROLES, constraints ?? [orderBy('name')], cb),
}

// Re-export query helpers
export { where, orderBy, limit }
