'use client'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryConstraint,
  Unsubscribe,
  setDoc,
  writeBatch,
  increment,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'
import { COLLECTIONS } from '@/types'

// ============================================
// Generic Firestore CRUD Operations
// ============================================

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const db = getFirestoreDb()
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return docRef.id
}

export async function createDocumentWithId<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: Omit<T, 'id'>
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const db = getFirestoreDb()
  await setDoc(doc(db, collectionName, id), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  if (!isFirebaseConfigured()) return null
  const db = getFirestoreDb()
  const docRef = doc(db, collectionName, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as T
}

export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  if (!isFirebaseConfigured()) return []
  const db = getFirestoreDb()
  const q = query(collection(db, collectionName), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T))
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const db = getFirestoreDb()
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const db = getFirestoreDb()
  await deleteDoc(doc(db, collectionName, id))
}

// ============================================
// Real-time Listeners
// ============================================

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    callback([])
    return () => {}
  }
  const db = getFirestoreDb()
  const q = query(collection(db, collectionName), ...constraints)
  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T))
    callback(results)
  })
}

export function subscribeToDocument<T>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    callback(null)
    return () => {}
  }
  const db = getFirestoreDb()
  return onSnapshot(doc(db, collectionName, id), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
      return
    }
    callback({ id: snapshot.id, ...snapshot.data() } as T)
  })
}

// ============================================
// Batch Operations
// ============================================

export async function batchCreate<T extends DocumentData>(
  collectionName: string,
  items: Omit<T, 'id'>[]
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const db = getFirestoreDb()
  const batch = writeBatch(db)
  const now = new Date().toISOString()

  items.forEach((item) => {
    const docRef = doc(collection(db, collectionName))
    batch.set(docRef, { ...item, createdAt: now, updatedAt: now })
  })

  await batch.commit()
}

export async function batchUpdate(
  collectionName: string,
  updates: { id: string; data: Partial<DocumentData> }[]
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const db = getFirestoreDb()
  const batch = writeBatch(db)
  const now = new Date().toISOString()

  updates.forEach(({ id, data }) => {
    const docRef = doc(db, collectionName, id)
    batch.update(docRef, { ...data, updatedAt: now })
  })

  await batch.commit()
}

// ============================================
// User-specific Operations
// ============================================

export async function getUserByEmployeeCode(code: string) {
  const users = await getDocuments<DocumentData>(COLLECTIONS.USERS, [
    where('employeeCode', '==', code),
    limit(1),
  ])
  return users[0] || null
}

export async function getUsersByDepartment(departmentId: string) {
  return getDocuments(COLLECTIONS.USERS, [
    where('departmentId', '==', departmentId),
    where('status', '==', 'active'),
    orderBy('name'),
  ])
}

export async function getUsersByRole(roleId: string) {
  return getDocuments(COLLECTIONS.USERS, [
    where('roleId', '==', roleId),
    orderBy('name'),
  ])
}

// ============================================
// Notification Operations
// ============================================

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: DocumentData[]) => void
): Unsubscribe {
  return subscribeToCollection(
    COLLECTIONS.NOTIFICATIONS,
    [
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50),
    ],
    callback
  )
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDocument(COLLECTIONS.NOTIFICATIONS, id, { read: true })
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const unread = await getDocuments<DocumentData>(COLLECTIONS.NOTIFICATIONS, [
    where('recipientId', '==', userId),
    where('read', '==', false),
  ])
  if (unread.length === 0) return
  await batchUpdate(
    COLLECTIONS.NOTIFICATIONS,
    unread.map((n) => ({ id: (n as { id: string }).id, data: { read: true } }))
  )
}

export async function createNotification(data: {
  type: string
  title: string
  titleAr: string
  message: string
  messageAr: string
  priority: string
  recipientId: string
  senderId?: string
  senderName?: string
  actionUrl?: string
  data?: Record<string, unknown>
}): Promise<string> {
  return createDocument(COLLECTIONS.NOTIFICATIONS, {
    ...data,
    read: false,
    createdAt: new Date().toISOString(),
  })
}

// ============================================
// Audit Log Operations
// ============================================

export async function createAuditLog(data: {
  action: string
  userId: string
  userName: string
  userRole: string
  targetType?: string
  targetId?: string
  targetName?: string
  details: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  await createDocument(COLLECTIONS.AUDIT_LOGS, {
    ...data,
    timestamp: new Date().toISOString(),
  })
}

// ============================================
// Settings Operations
// ============================================

export async function getSettings(): Promise<DocumentData | null> {
  return getDocument(COLLECTIONS.SETTINGS, 'hospital')
}

export function subscribeToSettings(
  callback: (settings: DocumentData | null) => void
): Unsubscribe {
  return subscribeToDocument(COLLECTIONS.SETTINGS, 'hospital', callback)
}

export async function updateSettings(data: Partial<DocumentData>): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const db = getFirestoreDb()
  await setDoc(doc(db, COLLECTIONS.SETTINGS, 'hospital'), data, { merge: true })
}

// ============================================
// Activity Feed
// ============================================

export function subscribeToActivities(
  callback: (activities: DocumentData[]) => void,
  maxItems = 20
): Unsubscribe {
  return subscribeToCollection(
    COLLECTIONS.ACTIVITIES,
    [orderBy('timestamp', 'desc'), limit(maxItems)],
    callback
  )
}

export async function logActivity(data: {
  type: string
  userId: string
  userName: string
  action: string
  actionAr: string
  target?: string
  targetId?: string
  department?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  await createDocument(COLLECTIONS.ACTIVITIES, {
    ...data,
    timestamp: new Date().toISOString(),
  })
}

// ============================================
// Query Helpers
// ============================================

export { where, orderBy, limit, query, collection, doc, serverTimestamp, Timestamp }
export type { QueryConstraint, Unsubscribe }
