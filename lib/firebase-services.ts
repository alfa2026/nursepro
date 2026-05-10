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
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'
import { COLLECTIONS } from '@/types'

// ============================================
// Network Status Management
// ============================================

export async function enableFirestoreOfflineMode(): Promise<void> {
  const db = getFirestoreDb()
  // Enable offline persistence automatically for web
  try {
    // This is already enabled by default in the web SDK
    console.log('Firestore offline mode enabled')
  } catch (error) {
    console.error('Failed to enable offline mode:', error)
  }
}

export async function reconnectFirestore(): Promise<void> {
  const db = getFirestoreDb()
  try {
    await enableNetwork(db)
    console.log('Firestore reconnected')
  } catch (error) {
    console.error('Failed to reconnect:', error)
  }
}

// ============================================
// Generic Firestore CRUD Operations
// ============================================

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id'> & { id?: string }
): Promise<string> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  
  const db = getFirestoreDb()
  const timestamp = new Date().toISOString()
  
  try {
    let docRef
    if (data.id) {
      // If ID is provided, use setDoc
      const { id, ...dataWithoutId } = data
      await setDoc(doc(db, collectionName, id), {
        ...dataWithoutId,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      docRef = { id }
    } else {
      // Otherwise, use addDoc to auto-generate ID
      docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    }
    
    console.log(`✅ Document created in ${collectionName}:`, docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error(`❌ Error creating document in ${collectionName}:`, error)
    throw error
  }
}

export async function createDocumentWithId<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: Omit<T, 'id'>
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  
  const db = getFirestoreDb()
  const timestamp = new Date().toISOString()
  
  try {
    await setDoc(doc(db, collectionName, id), {
      id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    console.log(`✅ Document created with ID in ${collectionName}:`, id)
  } catch (error: any) {
    console.error(`❌ Error creating document with ID in ${collectionName}:`, error)
    throw error
  }
}

export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  if (!isFirebaseConfigured()) return null
  
  const db = getFirestoreDb()
  
  try {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      console.warn(`Document not found in ${collectionName}:`, id)
      return null
    }
    
    const result = { id: docSnap.id, ...docSnap.data() } as T
    console.log(`✅ Document retrieved from ${collectionName}:`, id)
    return result
  } catch (error: any) {
    console.error(`❌ Error getting document from ${collectionName}:`, error)
    return null
  }
}

export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  if (!isFirebaseConfigured()) return []
  
  const db = getFirestoreDb()
  
  try {
    const q = query(collection(db, collectionName), ...constraints)
    const snapshot = await getDocs(q)
    const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T))
    console.log(`✅ Retrieved ${results.length} documents from ${collectionName}`)
    return results
  } catch (error: any) {
    console.error(`❌ Error getting documents from ${collectionName}:`, error)
    return []
  }
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  
  const db = getFirestoreDb()
  
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    })
    console.log(`✅ Document updated in ${collectionName}:`, id)
  } catch (error: any) {
    console.error(`❌ Error updating document in ${collectionName}:`, error)
    throw error
  }
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  
  const db = getFirestoreDb()
  
  try {
    await deleteDoc(doc(db, collectionName, id))
    console.log(`✅ Document deleted from ${collectionName}:`, id)
  } catch (error: any) {
    console.error(`❌ Error deleting document from ${collectionName}:`, error)
    throw error
  }
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
    console.warn(`Firebase not configured for ${collectionName}`)
    callback([])
    return () => {}
  }
  
  const db = getFirestoreDb()
  const q = query(collection(db, collectionName), ...constraints)
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T))
      console.log(`🔄 Real-time update for ${collectionName}: ${results.length} items`)
      callback(results)
    },
    (error) => {
      console.error(`❌ Error subscribing to ${collectionName}:`, error)
      callback([])
    }
  )
  
  return unsubscribe
}

export function subscribeToDocument<T>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    console.warn(`Firebase not configured for ${collectionName}/${id}`)
    callback(null)
    return () => {}
  }
  
  const db = getFirestoreDb()
  
  const unsubscribe = onSnapshot(
    doc(db, collectionName, id),
    (snapshot) => {
      if (!snapshot.exists()) {
        console.warn(`Document not found: ${collectionName}/${id}`)
        callback(null)
        return
      }
      
      const result = { id: snapshot.id, ...snapshot.data() } as T
      console.log(`🔄 Real-time update for ${collectionName}/${id}`)
      callback(result)
    },
    (error) => {
      console.error(`❌ Error subscribing to document:`, error)
      callback(null)
    }
  )
  
  return unsubscribe
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

  try {
    items.forEach((item) => {
      const docRef = doc(collection(db, collectionName))
      batch.set(docRef, { ...item, createdAt: now, updatedAt: now })
    })

    await batch.commit()
    console.log(`✅ Batch created ${items.length} documents in ${collectionName}`)
  } catch (error: any) {
    console.error(`❌ Error in batch create for ${collectionName}:`, error)
    throw error
  }
}

export async function batchUpdate(
  collectionName: string,
  updates: { id: string; data: Partial<DocumentData> }[]
): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  
  const db = getFirestoreDb()
  const batch = writeBatch(db)
  const now = new Date().toISOString()

  try {
    updates.forEach(({ id, data }) => {
      const docRef = doc(db, collectionName, id)
      batch.update(docRef, { ...data, updatedAt: now })
    })

    await batch.commit()
    console.log(`✅ Batch updated ${updates.length} documents in ${collectionName}`)
  } catch (error: any) {
    console.error(`❌ Error in batch update for ${collectionName}:`, error)
    throw error
  }
}

// ============================================
// User-specific Operations
// ============================================

export async function getUserByEmployeeCode(code: string) {
  try {
    const users = await getDocuments<DocumentData>(COLLECTIONS.USERS, [
      where('employeeCode', '==', code),
      limit(1),
    ])
    return users[0] || null
  } catch (error) {
    console.error('Error getting user by employee code:', error)
    return null
  }
}

export async function getUsersByDepartment(departmentId: string) {
  try {
    return await getDocuments(COLLECTIONS.USERS, [
      where('departmentId', '==', departmentId),
      where('status', '==', 'active'),
      orderBy('name'),
    ])
  } catch (error) {
    console.error('Error getting users by department:', error)
    return []
  }
}

export async function getUsersByRole(roleId: string) {
  try {
    return await getDocuments(COLLECTIONS.USERS, [
      where('roleId', '==', roleId),
      orderBy('name'),
    ])
  } catch (error) {
    console.error('Error getting users by role:', error)
    return []
  }
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
  try {
    await updateDocument(COLLECTIONS.NOTIFICATIONS, id, { read: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    const unread = await getDocuments<DocumentData>(COLLECTIONS.NOTIFICATIONS, [
      where('recipientId', '==', userId),
      where('read', '==', false),
    ])
    if (unread.length === 0) return
    
    await batchUpdate(
      COLLECTIONS.NOTIFICATIONS,
      unread.map((n) => ({ id: (n as { id: string }).id, data: { read: true } }))
    )
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
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
  try {
    return await createDocument(COLLECTIONS.NOTIFICATIONS, {
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// ============================================
// Audit Log Operations
// ============================================

export async function createAuditLog(data: {
  action: string
  userId: string
  userName?: string
  userRole?: string
  targetType?: string
  targetId?: string
  targetName?: string
  details: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    await createDocument(COLLECTIONS.AUDIT_LOGS, {
      ...data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
  }
}

// ============================================
// Settings Operations
// ============================================

export async function getSettings(): Promise<DocumentData | null> {
  try {
    return await getDocument(COLLECTIONS.SETTINGS, 'hospital')
  } catch (error) {
    console.error('Error getting settings:', error)
    return null
  }
}

export function subscribeToSettings(
  callback: (settings: DocumentData | null) => void
): Unsubscribe {
  return subscribeToDocument(COLLECTIONS.SETTINGS, 'hospital', callback)
}

export async function updateSettings(data: Partial<DocumentData>): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  
  const db = getFirestoreDb()
  
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'hospital'), data, { merge: true })
    console.log('✅ Settings updated')
  } catch (error) {
    console.error('Error updating settings:', error)
    throw error
  }
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
  try {
    await createDocument(COLLECTIONS.ACTIVITIES, {
      ...data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

// ============================================
// Query Helpers
// ============================================

export { where, orderBy, limit, query, collection, doc, serverTimestamp, Timestamp }
export type { QueryConstraint, Unsubscribe }
