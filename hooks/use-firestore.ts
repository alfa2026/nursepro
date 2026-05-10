'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  doc,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  Unsubscribe,
  getDoc,
  getDocs,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '@/lib/firebase'

/**
 * Hook for real-time Firestore collection subscription.
 * Falls back to provided initial data when Firebase is not configured.
 */
export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  fallbackData: T[] = []
) {
  const [data, setData] = useState<T[]>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const unsubRef = useRef<Unsubscribe | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setData(fallbackData)
      setLoading(false)
      return
    }

    setLoading(true)
    const db = getFirestoreDb()
    const q = query(collection(db, collectionName), ...constraints)

    unsubRef.current = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as T[]
        setData(results)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(`Firestore subscription error [${collectionName}]:`, err)
        setError(err)
        setLoading(false)
      }
    )

    return () => {
      unsubRef.current?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(constraints.map(c => c.type))])

  const add = useCallback(
    async (item: Omit<T, 'id'>) => {
      if (!isFirebaseConfigured()) {
        const newItem = { ...item, id: `local-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as T
        setData((prev) => [...prev, newItem])
        return newItem.id
      }
      const db = getFirestoreDb()
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return docRef.id
    },
    [collectionName]
  )

  const update = useCallback(
    async (id: string, updates: Partial<T>) => {
      if (!isFirebaseConfigured()) {
        setData((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        )
        return
      }
      const db = getFirestoreDb()
      await updateDoc(doc(db, collectionName, id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    },
    [collectionName]
  )

  const remove = useCallback(
    async (id: string) => {
      if (!isFirebaseConfigured()) {
        setData((prev) => prev.filter((item) => item.id !== id))
        return
      }
      const db = getFirestoreDb()
      await deleteDoc(doc(db, collectionName, id))
    },
    [collectionName]
  )

  const set = useCallback(
    async (id: string, item: Omit<T, 'id'>) => {
      if (!isFirebaseConfigured()) {
        setData((prev) => {
          const exists = prev.find((i) => i.id === id)
          if (exists) return prev.map((i) => (i.id === id ? { ...item, id } as T : i))
          return [...prev, { ...item, id } as T]
        })
        return
      }
      const db = getFirestoreDb()
      await setDoc(doc(db, collectionName, id), {
        ...item,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    },
    [collectionName]
  )

  return { data, loading, error, add, update, remove, set }
}

/**
 * Hook for a single Firestore document subscription.
 */
export function useFirestoreDocument<T extends { id: string }>(
  collectionName: string,
  documentId: string | null,
  fallbackData: T | null = null
) {
  const [data, setData] = useState<T | null>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!documentId) {
      setData(null)
      setLoading(false)
      return
    }

    if (!isFirebaseConfigured()) {
      setData(fallbackData)
      setLoading(false)
      return
    }

    setLoading(true)
    const db = getFirestoreDb()

    const unsub = onSnapshot(
      doc(db, collectionName, documentId),
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error(`Firestore doc error [${collectionName}/${documentId}]:`, err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [collectionName, documentId])

  const update = useCallback(
    async (updates: Partial<T>) => {
      if (!documentId) return
      if (!isFirebaseConfigured()) {
        setData((prev) => (prev ? { ...prev, ...updates } : prev))
        return
      }
      const db = getFirestoreDb()
      await updateDoc(doc(db, collectionName, documentId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    },
    [collectionName, documentId]
  )

  return { data, loading, error, update }
}
