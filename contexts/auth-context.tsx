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
  changePassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
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
// Demo Users (Fixed Arabic Language)
// ============================================

export const DEMO_USERS: User[] = [
  {
    id: 'demo-super-admin',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الراشد',
    email: 'admin@pronurse.com',
    employeeCode: 'ADM001',
    role: 'super_admin',
    roleId: 'role-super-admin',
    department: 'الإدارة',
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
    department: 'الموارد البشرية',
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
    department: 'العناية المركزة',
    departmentId: 'dept-icu',
    status: 'active',
    hireDate: '2019-06-01',
    mustChangePassword: false,
    createdAt: '2019-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
]

// Alias for backwards compatibility
export const DEMO_EMPLOYEES = DEMO_USERS

const DEMO_PASSWORDS: Record<string, string> = {
  'ADM001': 'admin123',
  'admin@pronurse.com': 'admin123',
}

// ============================================
// Permissions (Roles logic)
// ============================================

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['dashboard.view', 'dashboard.manage', 'users.view', 'users.create', 'users.edit', 'settings.view', 'settings.edit'],
  nurse: ['dashboard.view', 'attendance.view', 'reports.create'],
  // أضف باقي الأدوار هنا حسب حاجتك
}

// ============================================
// Auth Provider Component
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])

  // إعداد الجلسة وحفظها بشكل دائم
  const setSession = useCallback((userData: User) => {
    setUser(userData)
    setPermissions(ROLE_PERMISSIONS[userData.role] || [])
    localStorage.setItem('pronurse-session', JSON.stringify({
      userId: userData.id,
      role: userData.role,
      loginTime: new Date().toISOString()
    }))
  }, [])

  useEffect(() => {
    // إجبار الكود على استخدام Firebase
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
        // إذا لم يكن هناك مستخدم مسجل في Firebase، تحقق من التخزين المحلي (للوضع التجريبي)
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
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth()
      const result = await signInWithEmailAndPassword(auth, email, password)
      const userData = await getDocument<User>(COLLECTIONS.USERS, result.user.uid)
      
      if (!userData) return { success: false, error: 'لم يتم العثور على ملف المستخدم' }
      
      setSession(userData)
      return { success: true }
    } catch (error: any) {
      // لو الـ Firebase مش شغال، جرب يدخل Demo
      const demoUser = DEMO_USERS.find(u => u.email === email)
      if (demoUser && DEMO_PASSWORDS[email] === password) {
        setSession(demoUser)
        return { success: true }
      }
      return { success: false, error: 'فشل تسجيل الدخول. تأكد من البيانات أو اتصال السحابة.' }
    }
  }, [setSession])

  const loginWithEmployeeCode = useCallback(async (code: string, password: string) => {
    try {
      const userData = await getUserByEmployeeCode(code) as User | null
      if (!userData) throw new Error('Employee not found')
      
      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, userData.email, password)
      setSession(userData)
      return { success: true }
    } catch (error: any) {
      const demoUser = DEMO_USERS.find(u => u.employeeCode.toLowerCase() === code.toLowerCase())
      if (demoUser && DEMO_PASSWORDS[code] === password) {
        setSession(demoUser)
        return { success: true }
      }
      return { success: false, error: 'كود الموظف غير صحيح أو السحابة غير متصلة' }
    }
  }, [setSession])

  const loginWithGoogle = useCallback(async () => {
    try {
      const auth = getFirebaseAuth()
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // محاولة الحصول على بيانات المستخدم من Firestore
      let userData = await getDocument<User>(COLLECTIONS.USERS, result.user.uid)
      
      // لو المستخدم جديد، أنشئ ملف له
      if (!userData) {
        userData = {
          id: result.user.uid,
          name: result.user.displayName || '',
          nameAr: result.user.displayName || '',
          email: result.user.email || '',
          employeeCode: result.user.email?.split('@')[0] || '',
          role: 'nurse', // دور افتراضي
          roleId: 'role-nurse',
          department: '',
          departmentId: '',
          status: 'active',
          hireDate: new Date().toISOString().split('T')[0],
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        // احفظ البيانات في Firestore
        await createDocument(COLLECTIONS.USERS, result.user.uid, userData)
        
        // اكتب في Audit Log
        await createAuditLog({
          action: 'USER_CREATED_VIA_GOOGLE',
          userId: result.user.uid,
          details: `User created via Google Sign-in: ${result.user.email}`,
          timestamp: new Date().toISOString(),
        } as any)
      }
      
      setSession(userData)
      return { success: true }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      return { success: false, error: error.message || 'فشل تسجيل الدخول عبر Google' }
    }
  }, [setSession])

  const register = useCallback(async (data: RegisterData) => {
    try {
      const auth = getFirebaseAuth()
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password)
      
      const userData: User = {
        id: result.user.uid,
        name: data.name,
        nameAr: data.nameAr,
        email: data.email,
        employeeCode: data.name.split(' ')[0].toUpperCase() + '001',
        role: 'nurse',
        roleId: 'role-nurse',
        department: data.department || '',
        departmentId: data.departmentId || '',
        status: 'active',
        hireDate: new Date().toISOString().split('T')[0],
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      await createDocument(COLLECTIONS.USERS, result.user.uid, userData)
      setSession(userData)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [setSession])

  const changePassword = useCallback(async (userId: string, newPassword: string) => {
    try {
      const auth = getFirebaseAuth()
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword)
        return { success: true }
      }
      return { success: false, error: 'لا يوجد مستخدم مسجل' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth()
    await signOut(auth)
    setUser(null)
    setFirebaseUser(null)
    setPermissions([])
    localStorage.removeItem('pronurse-session')
  }, [])

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
      user, firebaseUser, loading, isAuthenticated: !!user, permissions,
      login, loginWithEmployeeCode, loginWithGoogle, logout, 
      register, changePassword,
      hasPermission, hasAnyPermission, hasAllPermissions, isRole
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
