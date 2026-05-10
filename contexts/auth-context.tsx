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
// Demo Mode (when Firebase is not configured)
// ============================================

const DEMO_USERS: User[] = [
  {
    id: 'demo-super-admin',
    name: 'Ahmed Al-Rashid',
    nameAr: '\u0623\u062d\u0645\u062f \u0627\u0644\u0631\u0627\u0634\u062f',
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
    nameAr: '\u0633\u0627\u0631\u0629 \u0645\u062d\u0645\u062f',
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
    nameAr: '\u0641\u0627\u0637\u0645\u0629 \u062d\u0633\u0646',
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
    nameAr: '\u062f. \u062e\u0627\u0644\u062f \u0625\u0628\u0631\u0627\u0647\u064a\u0645',
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
    nameAr: '\u0646\u0648\u0631\u0629 \u0627\u0644\u0633\u0627\u0644\u0645',
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

// Full permissions for super_admin demo
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

  // Load session from storage on mount
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth()
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          setFirebaseUser(fbUser)
          const userData = await getDocument<User>(COLLECTIONS.USERS, fbUser.uid)
          if (userData) {
            setUser(userData)
            const rolePerms = ROLE_PERMISSIONS[userData.role] || []
            setPermissions(rolePerms)
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
      // Demo mode - check session storage
      const stored = sessionStorage.getItem('pronurse-session')
      if (stored) {
        try {
          const session = JSON.parse(stored)
          const demoUser = DEMO_USERS.find(u => u.id === session.userId)
          if (demoUser) {
            setUser(demoUser)
            setPermissions(ROLE_PERMISSIONS[demoUser.role] || [])
          }
        } catch {
          sessionStorage.removeItem('pronurse-session')
        }
      }
      setLoading(false)
    }
  }, [])

  const setSession = useCallback((userData: User) => {
    setUser(userData)
    const rolePerms = ROLE_PERMISSIONS[userData.role] || []
    setPermissions(rolePerms)
    sessionStorage.setItem('pronurse-session', JSON.stringify({
      userId: userData.id,
      role: userData.role,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
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
        if (userData.status === 'suspended') return { success: false, error: 'Account suspended' }
        if (userData.mustChangePassword) return { success: true, mustChangePassword: true }
        setSession(userData)
        await updateDocument(COLLECTIONS.USERS, userData.id, { lastLogin: new Date().toISOString() })
        await createAuditLog({ action: 'login', userId: userData.id, userName: userData.name, userRole: userData.role, details: 'Email login' })
        return { success: true }
      } else {
        // Demo mode
        const demoUser = DEMO_USERS.find(u => u.email === email)
        if (!demoUser) return { success: false, error: 'Invalid email or password' }
        if (DEMO_PASSWORDS[email] !== password) return { success: false, error: 'Invalid email or password' }
        setSession(demoUser)
        return { success: true }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Login failed'
      return { success: false, error: msg }
    }
  }, [setSession])

  const loginWithEmployeeCode = useCallback(async (code: string, password: string) => {
    try {
      if (isFirebaseConfigured()) {
        const userData = await getUserByEmployeeCode(code) as User | null
        if (!userData) return { success: false, error: 'Employee code not found' }
        if (userData.status === 'pending_approval') return { success: false, error: 'Account pending approval' }
        if (userData.status === 'suspended') return { success: false, error: 'Account suspended' }
        // Sign in with email/password (employee code maps to email)
        const auth = getFirebaseAuth()
        await signInWithEmailAndPassword(auth, userData.email, password)
        if (userData.mustChangePassword) return { success: true, mustChangePassword: true }
        setSession(userData)
        await updateDocument(COLLECTIONS.USERS, userData.id, { lastLogin: new Date().toISOString() })
        await createAuditLog({ action: 'login', userId: userData.id, userName: userData.name, userRole: userData.role, details: 'Employee code login' })
        return { success: true }
      } else {
        // Demo mode
        const demoUser = DEMO_USERS.find(u => u.employeeCode.toLowerCase() === code.toLowerCase())
        if (!demoUser) return { success: false, error: 'Employee code not found' }
        if (DEMO_PASSWORDS[code] !== password) return { success: false, error: 'Invalid password' }
        setSession(demoUser)
        return { success: true }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Login failed'
      return { success: false, error: msg }
    }
  }, [setSession])

  const loginWithGoogle = useCallback(async () => {
    try {
      if (!isFirebaseConfigured()) {
        return { success: false, error: 'Google login requires Firebase configuration' }
      }
      const auth = getFirebaseAuth()
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      let userData = await getDocument<User>(COLLECTIONS.USERS, result.user.uid)
      if (!userData) {
        // Create new user with pending status
        const newUser: Omit<User, 'id'> = {
          name: result.user.displayName || '',
          nameAr: '',
          email: result.user.email || '',
          employeeCode: `EMP${Date.now().toString().slice(-6)}`,
          role: 'nurse',
          roleId: 'role-nurse',
          department: '',
          departmentId: '',
          status: 'pending_approval',
          avatar: result.user.photoURL || undefined,
          hireDate: new Date().toISOString().split('T')[0],
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await createDocument(COLLECTIONS.USERS, newUser)
        return { success: false, error: 'Account created. Pending admin approval.' }
      }
      if (userData.status === 'pending_approval') return { success: false, error: 'Account pending approval' }
      if (userData.status === 'suspended') return { success: false, error: 'Account suspended' }
      setSession(userData)
      await updateDocument(COLLECTIONS.USERS, userData.id, { lastLogin: new Date().toISOString() })
      return { success: true }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Google login failed'
      return { success: false, error: msg }
    }
  }, [setSession])

  const logout = useCallback(async () => {
    if (user) {
      if (isFirebaseConfigured()) {
        await createAuditLog({ action: 'logout', userId: user.id, userName: user.name, userRole: user.role, details: 'User logged out' })
        const auth = getFirebaseAuth()
        await signOut(auth)
      }
    }
    setUser(null)
    setFirebaseUser(null)
    setPermissions([])
    sessionStorage.removeItem('pronurse-session')
  }, [user])

  const register = useCallback(async (data: RegisterData) => {
    try {
      if (!isFirebaseConfigured()) {
        return { success: false, error: 'Registration requires Firebase configuration' }
      }
      const auth = getFirebaseAuth()
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const newUser: Omit<User, 'id'> = {
        name: data.name,
        nameAr: data.nameAr,
        email: data.email,
        phone: data.phone,
        employeeCode: `EMP${Date.now().toString().slice(-6)}`,
        role: 'nurse',
        roleId: 'role-nurse',
        department: data.department || '',
        departmentId: data.departmentId || '',
        status: 'pending_approval',
        hireDate: new Date().toISOString().split('T')[0],
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await createDocument(COLLECTIONS.USERS, newUser)
      await signOut(auth)
      return { success: true }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Registration failed'
      return { success: false, error: msg }
    }
  }, [])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      if (!isFirebaseConfigured() || !firebaseUser) {
        return { success: false, error: 'Password change requires Firebase' }
      }
      await updatePassword(firebaseUser, newPassword)
      if (user) {
        await updateDocument(COLLECTIONS.USERS, user.id, { mustChangePassword: false })
        await createAuditLog({ action: 'password_changed', userId: user.id, userName: user.name, userRole: user.role, details: 'Password changed' })
      }
      return { success: true }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Password change failed'
      return { success: false, error: msg }
    }
  }, [firebaseUser, user])

  const hasPermission = useCallback((permission: string) => {
    if (user?.role === 'super_admin') return true
    return permissions.includes(permission)
  }, [permissions, user])

  const hasAnyPermission = useCallback((perms: string[]) => {
    if (user?.role === 'super_admin') return true
    return perms.some(p => permissions.includes(p))
  }, [permissions, user])

  const hasAllPermissions = useCallback((perms: string[]) => {
    if (user?.role === 'super_admin') return true
    return perms.every(p => permissions.includes(p))
  }, [permissions, user])

  const isRole = useCallback((roles: UserRole | UserRole[]) => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      isAuthenticated: !!user,
      permissions,
      login,
      loginWithEmployeeCode,
      loginWithGoogle,
      logout,
      register,
      changePassword,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      isRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { DEMO_USERS, ROLE_PERMISSIONS }
export const DEMO_EMPLOYEES = DEMO_USERS
