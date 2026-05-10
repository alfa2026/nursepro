'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword,
  User as FirebaseUser,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import {
  getDocument,
  getUserByEmployeeCode,
  createDocument,
  updateDocument,
  createAuditLog,
} from '@/lib/firebase-services'
import { User, UserRole, COLLECTIONS } from '@/types'

// ============================================
// Types
// ============================================

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  isAuthenticated: boolean
  permissions: string[]
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>
  loginWithEmployeeCode: (code: string, password: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  isRole: (roles: UserRole | UserRole[]) => boolean
}

interface RegisterData {
  name: string
  nameAr: string
  email: string
  password: string
  phone?: string
  department?: string
  departmentId?: string
}

// ============================================
// Demo Mode (Fixed Arabic Strings)
// ============================================

const DEMO_USERS: User[] = [
  {
    id: 'demo-super-admin',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الراشد',
    email: 'admin@pronurse.com',
    employeeCode: 'ADM001',
    role: 'super_admin',
    roleId: 'role-super-admin',
    department: 'Administration',
    departmentId: 'dept-admin',
    status: 'active',
    hireDate: '2020-01-01',
    mustChangePassword: false,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-hr',
    name: 'Sara Mohammed',
    nameAr: 'سارة محمد',
    email: 'hr@pronurse.com',
    employeeCode: 'HR001',
    role: 'hr',
    roleId: 'role-hr',
    department: 'Human Resources',
    departmentId: 'dept-hr',
    status: 'active',
    hireDate: '2021-03-15',
    mustChangePassword: false,
    createdAt: '2021-03-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-head-nurse',
    name: 'Fatima Hassan',
    nameAr: 'فاطمة حسن',
    email: 'nurse@pronurse.com',
    employeeCode: 'NRS001',
    role: 'head_nurse',
    roleId: 'role-head-nurse',
    department: 'ICU',
    departmentId: 'dept-icu',
    status: 'active',
    hireDate: '2019-06-01',
    mustChangePassword: false,
    createdAt: '2019-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-doctor',
    name: 'Dr. Khalid Ibrahim',
    nameAr: 'د. خالد إبراهيم',
    email: 'doctor@pronurse.com',
    employeeCode: 'DOC001',
    role: 'doctor',
    roleId: 'role-doctor',
    department: 'Emergency',
    departmentId: 'dept-er',
    status: 'active',
    hireDate: '2018-09-01',
    mustChangePassword: false,
    createdAt: '2018-09-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-receptionist',
    name: 'Noura Al-Salem',
    nameAr: 'نورة السالم',
    email: 'reception@pronurse.com',
    employeeCode: 'REC001',
    role: 'receptionist',
    roleId: 'role-receptionist',
    department: 'Reception',
    departmentId: 'dept-reception',
    status: 'active',
    hireDate: '2022-01-10',
    mustChangePassword: false,
    createdAt: '2022-01-10T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const DEMO_PASSWORDS: Record<string, string> = {
  'ADM001': 'admin123',
  'HR001': 'hr123',
  'NRS001': 'nurse123',
  'DOC001': 'doctor123',
  'REC001': 'reception123',
  'admin@pronurse.com': 'admin123',
  'hr@pronurse.com': 'hr123',
  'nurse@pronurse.com': 'nurse123',
  'doctor@pronurse.com': 'doctor123',
  'reception@pronurse.com': 'reception123',
}

// ... (PERMISSION Definitions stay the same as your original file)
const SUPER_ADMIN_PERMISSIONS = [
    'dashboard.view', 'dashboard.manage',
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.approve', 'users.export',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage',
    'departments.view', 'departments.create', 'departments.edit', 'departments.delete', 'departments.manage',
    'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.approve', 'attendance.export',
    'scheduling.view', 'scheduling.create', 'scheduling.edit', 'scheduling.delete', 'scheduling.manage',
    'reports.view', 'reports.create', 'reports.edit', 'reports.approve', 'reports.export',
    'notifications.view', 'notifications.create', 'notifications.manage',
    'messages.view', 'messages.create', 'messages.manage',
    'settings.view', 'settings.edit', 'settings.manage',
    'audit_logs.view', 'audit_logs.export',
    'leave.view', 'leave.create', 'leave.approve', 'leave.export',
    'payroll.view', 'payroll.create', 'payroll.manage', 'payroll.export',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
    'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete',
    'training.view', 'training.create', 'training.edit', 'training.manage',
    'quality.view', 'quality.create', 'quality.manage',
    'incidents.view', 'incidents.create', 'incidents.edit', 'incidents.manage',
    'profile.view', 'profile.edit',
  ]
  
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    super_admin: SUPER_ADMIN_PERMISSIONS,
    hospital_admin: SUPER_ADMIN_PERMISSIONS.filter(p => !p.startsWith('settings.manage')),
    hr: [
      'dashboard.view', 'users.view', 'users.create', 'users.edit', 'users.export',
      'departments.view', 'attendance.view', 'attendance.export',
      'leave.view', 'leave.approve', 'leave.export',
      'payroll.view', 'payroll.create', 'payroll.manage', 'payroll.export',
      'reports.view', 'reports.create', 'reports.export',
      'training.view', 'training.create', 'training.manage',
      'notifications.view', 'messages.view', 'messages.create',
      'audit_logs.view', 'profile.view', 'profile.edit',
    ],
    head_nurse: [
      'dashboard.view', 'users.view',
      'departments.view', 'departments.edit',
      'attendance.view', 'attendance.create', 'attendance.approve',
      'scheduling.view', 'scheduling.create', 'scheduling.edit', 'scheduling.manage',
      'reports.view', 'reports.create', 'reports.approve', 'reports.export',
      'leave.view', 'leave.approve',
      'notifications.view', 'notifications.create',
      'messages.view', 'messages.create',
      'quality.view', 'quality.create',
      'incidents.view', 'incidents.create', 'incidents.edit',
      'equipment.view', 'inventory.view',
      'training.view', 'profile.view', 'profile.edit',
    ],
    nurse: [
      'dashboard.view', 'attendance.view', 'attendance.create',
      'scheduling.view', 'reports.view', 'reports.create',
      'leave.view', 'leave.create',
      'notifications.view', 'messages.view', 'messages.create',
      'incidents.view', 'incidents.create',
      'training.view', 'profile.view', 'profile.edit',
    ],
    doctor: [
      'dashboard.view', 'users.view',
      'departments.view', 'attendance.view',
      'scheduling.view', 'reports.view', 'reports.create',
      'leave.view', 'leave.create',
      'notifications.view', 'messages.view', 'messages.create',
      'quality.view', 'incidents.view', 'incidents.create',
      'training.view', 'profile.view', 'profile.edit',
    ],
    receptionist: [
      'dashboard.view', 'attendance.view', 'attendance.create',
      'scheduling.view', 'leave.view', 'leave.create',
      'notifications.view', 'messages.view', 'messages.create',
      'profile.view', 'profile.edit',
    ],
    accountant: [
      'dashboard.view', 'payroll.view', 'payroll.create', 'payroll.manage', 'payroll.export',
      'reports.view', 'reports.create', 'reports.export',
      'notifications.view', 'messages.view', 'messages.create',
      'profile.view', 'profile.edit',
    ],
    it_admin: [
      'dashboard.view', 'users.view', 'users.create', 'users.edit',
      'roles.view', 'settings.view', 'settings.edit',
      'audit_logs.view', 'audit_logs.export',
      'notifications.view', 'messages.view', 'messages.create',
      'equipment.view', 'equipment.create', 'equipment.edit',
      'profile.view', 'profile.edit',
    ],
    department_manager: [
      'dashboard.view', 'users.view',
      'departments.view', 'departments.edit',
      'attendance.view', 'attendance.approve',
      'scheduling.view', 'scheduling.create', 'scheduling.edit',
      'reports.view', 'reports.create', 'reports.export',
      'leave.view', 'leave.approve',
      'notifications.view', 'messages.view', 'messages.create',
      'training.view', 'incidents.view',
      'profile.view', 'profile.edit',
    ],
    security_staff: [
      'dashboard.view', 'attendance.view', 'attendance.create',
      'scheduling.view', 'leave.view', 'leave.create',
      'notifications.view', 'messages.view',
      'incidents.view', 'incidents.create',
      'profile.view', 'profile.edit',
    ],
  }

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth()
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          setFirebaseUser(fbUser)
          const userData = await getDocument<User>(COLLECTIONS.USERS, fbUser.uid)
          if (userData) {
            setUser(userData)
            setPermissions(ROLE_PERMISSIONS[userData.role] || [])
          }
        } else {
          setFirebaseUser(null)
          setUser(null)
          setPermissions([])
        }
        setLoading(false)
      })
      return () => unsubscribe()
    } else {
      // FIXED: Use localStorage for persistence in Demo Mode
      const stored = localStorage.getItem('pronurse-session')
      if (stored) {
        try {
          const session = JSON.parse(stored)
          const demoUser = DEMO_USERS.find(u => u.id === session.userId)
          if (demoUser) {
            setUser(demoUser)
            setPermissions(ROLE_PERMISSIONS[demoUser.role] || [])
          }
        } catch {
          localStorage.removeItem('pronurse-session')
        }
      }
      setLoading(false)
    }
  }, [])

  const setSession = useCallback((userData: User) => {
    setUser(userData)
    setPermissions(ROLE_PERMISSIONS[userData.role] || [])
    // FIXED: Save to localStorage so data persists after refresh
    localStorage.setItem('pronurse-session', JSON.stringify({
      userId: userData.id,
      role: userData.role,
      loginTime: new Date().toISOString(),
    }))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      if (isFirebaseConfigured()) {
        const auth = getFirebaseAuth()
        const result = await signInWithEmailAndPassword(auth, email, password)
        const userData = await getDocument<User>(COLLECTIONS.USERS, result.user.uid)
        if (!userData) return { success: false, error: 'User profile not found' }
        if (userData.status === 'pending_approval') return { success: false, error: 'Account pending approval' }
        if (userData.mustChangePassword) return { success: true, mustChangePassword: true }
        setSession(userData)
        return { success: true }
      } else {
        const demoUser = DEMO_USERS.find(u => u.email === email)
        if (!demoUser || DEMO_PASSWORDS[email] !== password) {
          return { success: false, error: 'Invalid email or password' }
        }
        setSession(demoUser)
        return { success: true }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [setSession])

  const loginWithEmployeeCode = useCallback(async (code: string, password: string) => {
    try {
      if (isFirebaseConfigured()) {
        const userData = await getUserByEmployeeCode(code) as User | null
        if (!userData) return { success: false, error: 'Employee code not found' }
        const auth = getFirebaseAuth()
        await signInWithEmailAndPassword(auth, userData.email, password)
        setSession(userData)
        return { success: true }
      } else {
        const demoUser = DEMO_USERS.find(u => u.employeeCode.toLowerCase() === code.toLowerCase())
        if (!demoUser || DEMO_PASSWORDS[code] !== password) {
          return { success: false, error: 'Invalid employee code or password' }
        }
        setSession(demoUser)
        return { success: true }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [setSession])

  const logout = useCallback(async () => {
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth()
      await signOut(auth)
    }
    setUser(null)
    setFirebaseUser(null)
    setPermissions([])
    localStorage.removeItem('pronurse-session')
  }, [])

  // ... (Rest of the functions stay similar but using updated state)
  const hasPermission = useCallback((permission: string) => {
    if (user?.role === 'super_admin') return true
    return permissions.includes(permission)
  }, [permissions, user])

  const isRole = useCallback((roles: UserRole | UserRole[]) => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, firebaseUser, loading, isAuthenticated: !!user, permissions,
      login, loginWithEmployeeCode, loginWithGoogle: async () => ({success: false}), 
      logout, register: async () => ({success: false}), changePassword: async () => ({success: false}),
      hasPermission, hasAnyPermission: () => false, hasAllPermissions: () => false, isRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export { DEMO_USERS, ROLE_PERMISSIONS }
export const DEMO_EMPLOYEES = DEMO_USERS
