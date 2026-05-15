'use client'

import { getFirestoreDb, isFirebaseConfigured } from './firebase'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import { COLLECTIONS } from '@/types'
import { ORG_COLLECTIONS } from '@/types/organization'

/**
 * Seeds Firestore with initial data if the collections are empty.
 * This runs once on first deployment to populate the database.
 */
export async function seedInitialData(): Promise<void> {
  if (!isFirebaseConfigured()) return

  const db = getFirestoreDb()

  // Check if data already exists
  const usersSnap = await getDocs(collection(db, COLLECTIONS.DEPARTMENTS))
  if (!usersSnap.empty) return // Already seeded

  const batch = writeBatch(db)
  const now = new Date().toISOString()

  // Seed Departments
  const departments = [
    { id: 'dept-icu', name: 'ICU', nameAr: '\u0627\u0644\u0639\u0646\u0627\u064a\u0629 \u0627\u0644\u0645\u0631\u0643\u0632\u0629', category: 'medical', code: 'ICU', floor: '3', building: 'Main', beds: 20, capacity: 20, currentOccupancy: 15, staffCount: 25, isActive: true, color: '#ef4444' },
    { id: 'dept-er', name: 'Emergency', nameAr: '\u0627\u0644\u0637\u0648\u0627\u0631\u0626', category: 'medical', code: 'ER', floor: '1', building: 'Main', beds: 30, capacity: 30, currentOccupancy: 22, staffCount: 35, isActive: true, color: '#f97316' },
    { id: 'dept-surgical', name: 'Surgical', nameAr: '\u0627\u0644\u062c\u0631\u0627\u062d\u0629', category: 'medical', code: 'SRG', floor: '2', building: 'Main', beds: 40, capacity: 40, currentOccupancy: 32, staffCount: 30, isActive: true, color: '#8b5cf6' },
    { id: 'dept-medical', name: 'Medical Ward', nameAr: '\u0627\u0644\u062c\u0646\u0627\u062d \u0627\u0644\u0637\u0628\u064a', category: 'medical', code: 'MED', floor: '4', building: 'Main', beds: 50, capacity: 50, currentOccupancy: 40, staffCount: 28, isActive: true, color: '#3b82f6' },
    { id: 'dept-pediatric', name: 'Pediatric', nameAr: '\u0627\u0644\u0623\u0637\u0641\u0627\u0644', category: 'medical', code: 'PED', floor: '5', building: 'Main', beds: 25, capacity: 25, currentOccupancy: 18, staffCount: 20, isActive: true, color: '#10b981' },
    { id: 'dept-ob', name: 'OB/GYN', nameAr: '\u0627\u0644\u0646\u0633\u0627\u0626\u064a\u0629 \u0648\u0627\u0644\u062a\u0648\u0644\u064a\u062f', category: 'medical', code: 'OBG', floor: '6', building: 'Main', beds: 20, capacity: 20, currentOccupancy: 12, staffCount: 18, isActive: true, color: '#ec4899' },
    { id: 'dept-admin', name: 'Administration', nameAr: '\u0627\u0644\u0625\u062f\u0627\u0631\u0629', category: 'administrative', code: 'ADM', staffCount: 15, isActive: true, color: '#6366f1' },
    { id: 'dept-hr', name: 'Human Resources', nameAr: '\u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629', category: 'administrative', code: 'HR', staffCount: 8, isActive: true, color: '#14b8a6' },
    { id: 'dept-reception', name: 'Reception', nameAr: '\u0627\u0644\u0627\u0633\u062a\u0642\u0628\u0627\u0644', category: 'support', code: 'RCP', staffCount: 12, isActive: true, color: '#f59e0b' },
    { id: 'dept-pharmacy', name: 'Pharmacy', nameAr: '\u0627\u0644\u0635\u064a\u062f\u0644\u064a\u0629', category: 'medical', code: 'PHR', staffCount: 10, isActive: true, color: '#06b6d4' },
    { id: 'dept-lab', name: 'Laboratory', nameAr: '\u0627\u0644\u0645\u062e\u062a\u0628\u0631', category: 'medical', code: 'LAB', staffCount: 12, isActive: true, color: '#84cc16' },
    { id: 'dept-radiology', name: 'Radiology', nameAr: '\u0627\u0644\u0623\u0634\u0639\u0629', category: 'medical', code: 'RAD', staffCount: 8, isActive: true, color: '#a855f7' },
  ]

  for (const dept of departments) {
    const { id, ...data } = dept
    batch.set(doc(db, COLLECTIONS.DEPARTMENTS, id), { ...data, createdAt: now, updatedAt: now })
  }

  // Seed Roles
  const roles = [
    { id: 'role-super-admin', name: 'Super Admin', nameAr: '\u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645', description: 'Full system access', descriptionAr: '\u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0643\u0627\u0645\u0644\u0629', isActive: true, isSystem: true },
    { id: 'role-hospital-admin', name: 'Hospital Admin', nameAr: '\u0645\u062f\u064a\u0631 \u0627\u0644\u0645\u0633\u062a\u0634\u0641\u0649', description: 'Hospital management access', descriptionAr: '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u0634\u0641\u0649', isActive: true, isSystem: true },
    { id: 'role-hr', name: 'HR Manager', nameAr: '\u0645\u062f\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629', description: 'Human resources management', descriptionAr: '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629', isActive: true, isSystem: true },
    { id: 'role-head-nurse', name: 'Head Nurse', nameAr: '\u0631\u0626\u064a\u0633\u0629 \u0627\u0644\u062a\u0645\u0631\u064a\u0636', description: 'Department nursing lead', descriptionAr: '\u0631\u0626\u064a\u0633 \u0627\u0644\u062a\u0645\u0631\u064a\u0636', isActive: true, isSystem: true },
    { id: 'role-nurse', name: 'Nurse', nameAr: '\u0645\u0645\u0631\u0636/\u0629', description: 'Nursing staff', descriptionAr: '\u0637\u0627\u0642\u0645 \u0627\u0644\u062a\u0645\u0631\u064a\u0636', isActive: true, isSystem: true },
    { id: 'role-doctor', name: 'Doctor', nameAr: '\u0637\u0628\u064a\u0628', description: 'Medical doctor', descriptionAr: '\u0637\u0628\u064a\u0628', isActive: true, isSystem: true },
    { id: 'role-receptionist', name: 'Receptionist', nameAr: '\u0645\u0648\u0638\u0641 \u0627\u0633\u062a\u0642\u0628\u0627\u0644', description: 'Front desk', descriptionAr: '\u0627\u0633\u062a\u0642\u0628\u0627\u0644', isActive: true, isSystem: true },
    { id: 'role-accountant', name: 'Accountant', nameAr: '\u0645\u062d\u0627\u0633\u0628', description: 'Financial operations', descriptionAr: '\u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0627\u0644\u064a\u0629', isActive: true, isSystem: true },
    { id: 'role-it-admin', name: 'IT Admin', nameAr: '\u0645\u062f\u064a\u0631 \u062a\u0642\u0646\u064a\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a', description: 'IT administration', descriptionAr: '\u0625\u062f\u0627\u0631\u0629 \u062a\u0642\u0646\u064a\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a', isActive: true, isSystem: true },
  ]

  for (const role of roles) {
    const { id, ...data } = role
    batch.set(doc(db, COLLECTIONS.ROLES, id), { ...data, createdAt: now, updatedAt: now, createdBy: 'system' })
  }

  // Seed Settings
  batch.set(doc(db, COLLECTIONS.SETTINGS, 'hospital'), {
    general: {
      name: 'PRO Nurse Hospital',
      nameAr: '\u0645\u0633\u062a\u0634\u0641\u0649 \u0628\u0631\u0648 \u0646\u064a\u0631\u0633',
      phone: '+966-11-000-0000',
      email: 'info@pronurse.com',
      address: 'Riyadh, Saudi Arabia',
      addressAr: '\u0627\u0644\u0631\u064a\u0627\u0636\u060c \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629',
      timezone: 'Asia/Riyadh',
      language: 'ar',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumber: true,
      passwordRequireSpecial: false,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      mfaEnabled: false,
      mfaRequired: false,
    },
    authentication: {
      googleLoginEnabled: true,
      employeeCodeLoginEnabled: true,
      emailLoginEnabled: true,
      requireApprovalForNewUsers: true,
      autoGenerateEmployeeCodes: true,
      employeeCodePrefix: 'EMP',
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      soundEnabled: true,
      shiftReminders: true,
      shiftReminderMinutesBefore: 30,
      leaveApprovalNotify: true,
      attendanceAlerts: true,
    },
    attendance: {
      lateToleranceMinutes: 15,
      overtimeThresholdMinutes: 480,
      autoCheckoutEnabled: false,
      autoCheckoutTime: '23:59',
      weekendDays: [5, 6],
      workingHoursPerDay: 8,
    },
    scheduling: {
      defaultShiftDuration: 8,
      minRestBetweenShifts: 8,
      maxConsecutiveShifts: 6,
      allowShiftSwap: true,
      requireApprovalForSwap: true,
      conflictDetection: true,
    },
    appearance: {
      defaultTheme: 'light',
      primaryColor: '#2563eb',
      accentColor: '#7c3aed',
      sidebarCollapsed: false,
    },
    features: {
      modulesEnabled: ['dashboard', 'staff', 'departments', 'attendance', 'scheduling', 'reports', 'notifications', 'messages', 'settings', 'leave', 'payroll', 'inventory', 'equipment', 'training', 'quality', 'incidents', 'emergency', 'handover', 'vitals', 'ews', 'tasks', 'workflows', 'organization'],
      betaFeaturesEnabled: false,
    },
    updatedAt: now,
  })

  await batch.commit()
  console.log('Initial data seeded successfully')
}
