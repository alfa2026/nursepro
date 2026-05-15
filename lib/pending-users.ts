/**
 * Pending users store — localStorage-based
 * Used by auth-context (write) and admin/users page (read/approve/reject)
 */

export type PendingStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'admin' | 'head_nurse' | 'supervisor' | 'staff'

export interface PendingUser {
  id: string           // Firebase UID
  name: string
  email: string
  photoURL?: string
  requestedAt: string  // ISO date
  status: PendingStatus
  role?: UserRole      // set on approval
  department?: string  // set on approval
  reviewedAt?: string
  reviewedBy?: string
}

const KEY = 'pronurse_pending_users'

export function getPendingUsers(): PendingUser[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function savePendingUsers(list: PendingUser[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function upsertPendingUser(user: Omit<PendingUser, 'status' | 'requestedAt'> & { requestedAt?: string }): PendingUser {
  const list = getPendingUsers()
  const existing = list.find((u) => u.id === user.id)
  if (existing) return existing          // already registered — don't overwrite

  const entry: PendingUser = {
    ...user,
    requestedAt: user.requestedAt || new Date().toISOString(),
    status: 'pending',
  }
  savePendingUsers([...list, entry])
  return entry
}

export function updatePendingUser(id: string, updates: Partial<PendingUser>) {
  const list = getPendingUsers()
  const updated = list.map((u) => (u.id === id ? { ...u, ...updates } : u))
  savePendingUsers(updated)
  return updated.find((u) => u.id === id)
}

export function getPendingUserById(id: string): PendingUser | undefined {
  return getPendingUsers().find((u) => u.id === id)
}
