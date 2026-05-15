'use client'

import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, set, update, push, remove, onDisconnect, runTransaction } from 'firebase/database'
import { getRealtimeDb, isFirebaseConfigured } from '@/lib/firebase'

export function useRealtimeData<T>(path: string, initialData: T): {
  data: T
  loading: boolean
  error: Error | null
  refresh: () => void
} {
  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    if (!isFirebaseConfigured()) {
      setTimeout(() => setLoading(false), 300)
      return
    }
    const db = getRealtimeDb()
    const dataRef = ref(db, path)
    onValue(dataRef, (snapshot) => {
      const val = snapshot.val()
      setData(val || initialData)
      setLoading(false)
    }, { onlyOnce: true })
  }, [path, initialData])

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setData(initialData)
      setLoading(false)
      return
    }

    const db = getRealtimeDb()
    const dataRef = ref(db, path)
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const val = snapshot.val()
        setData(val || initialData)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [path])

  return { data, loading, error, refresh }
}

export function usePresence(userId: string) {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSeen, setLastSeen] = useState<string>(new Date().toISOString())

  useEffect(() => {
    if (!isFirebaseConfigured() || !userId) {
      const interval = setInterval(() => setLastSeen(new Date().toISOString()), 60000)
      const handleVis = () => setIsOnline(!document.hidden)
      document.addEventListener('visibilitychange', handleVis)
      return () => { clearInterval(interval); document.removeEventListener('visibilitychange', handleVis) }
    }

    const db = getRealtimeDb()
    const presenceRef = ref(db, `presence/${userId}`)
    const connectedRef = ref(db, '.info/connected')

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        set(presenceRef, {
          isOnline: true,
          lastSeen: new Date().toISOString(),
        })
        onDisconnect(presenceRef).set({
          isOnline: false,
          lastSeen: new Date().toISOString(),
        })
        setIsOnline(true)
      }
    })

    const presenceUnsub = onValue(presenceRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        setIsOnline(val.isOnline)
        setLastSeen(val.lastSeen)
      }
    })

    return () => {
      unsubscribe()
      presenceUnsub()
    }
  }, [userId])

  return { isOnline, lastSeen }
}

export function useTypingIndicator(channelId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const startTyping = useCallback(() => {
    setIsTyping(true)
    if (!isFirebaseConfigured()) return
    const db = getRealtimeDb()
    set(ref(db, `typing/${channelId}/${userId}`), {
      typing: true,
      timestamp: Date.now(),
    })
  }, [channelId, userId])

  const stopTyping = useCallback(() => {
    setIsTyping(false)
    if (!isFirebaseConfigured()) return
    const db = getRealtimeDb()
    remove(ref(db, `typing/${channelId}/${userId}`))
  }, [channelId, userId])

  useEffect(() => {
    if (!isFirebaseConfigured()) return

    const db = getRealtimeDb()
    const typingRef = ref(db, `typing/${channelId}`)
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const data = snapshot.val() || {}
      const users = Object.keys(data).filter(
        (id) => id !== userId && data[id].typing
      )
      setTypingUsers(users)
    })
    return () => unsubscribe()
  }, [channelId, userId])

  return { typingUsers, isTyping, startTyping, stopTyping }
}

export function useRealtimeCounter(path: string, initialValue: number = 0) {
  const [count, setCount] = useState(initialValue)

  useEffect(() => {
    if (!isFirebaseConfigured()) return
    const db = getRealtimeDb()
    const counterRef = ref(db, path)
    const unsub = onValue(counterRef, (snapshot) => {
      setCount(snapshot.val() ?? initialValue)
    })
    return () => unsub()
  }, [path, initialValue])

  const increment = useCallback(() => {
    if (!isFirebaseConfigured()) {
      setCount((prev) => prev + 1)
      return
    }
    const db = getRealtimeDb()
    runTransaction(ref(db, path), (current) => (current || 0) + 1)
  }, [path])

  const decrement = useCallback(() => {
    if (!isFirebaseConfigured()) {
      setCount((prev) => Math.max(0, prev - 1))
      return
    }
    const db = getRealtimeDb()
    runTransaction(ref(db, path), (current) => Math.max(0, (current || 0) - 1))
  }, [path])

  const reset = useCallback(() => {
    if (!isFirebaseConfigured()) {
      setCount(initialValue)
      return
    }
    const db = getRealtimeDb()
    set(ref(db, path), initialValue)
  }, [initialValue, path])

  return { count, increment, decrement, reset }
}

export function useRealtimeList<T extends { id: string }>(
  path: string,
  initialData: T[] = []
) {
  const [items, setItems] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setItems(initialData)
      setLoading(false)
      return
    }

    const db = getRealtimeDb()
    const listRef = ref(db, path)
    const unsub = onValue(listRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        const list = Object.entries(val).map(([key, value]) => ({
          ...(value as object),
          id: key,
        })) as T[]
        setItems(list)
      } else {
        setItems([])
      }
      setLoading(false)
    })
    return () => unsub()
  }, [path])

  const addItem = useCallback(
    async (item: Omit<T, 'id'>) => {
      if (!isFirebaseConfigured()) {
        const newItem = { ...item, id: `local-${Date.now()}` } as T
        setItems((prev) => [...prev, newItem])
        return newItem.id
      }
      const db = getRealtimeDb()
      const newRef = push(ref(db, path))
      await set(newRef, item)
      return newRef.key || ''
    },
    [path]
  )

  const updateItem = useCallback(
    async (id: string, data: Partial<T>) => {
      if (!isFirebaseConfigured()) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
        return
      }
      const db = getRealtimeDb()
      await update(ref(db, `${path}/${id}`), data)
    },
    [path]
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (!isFirebaseConfigured()) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        return
      }
      const db = getRealtimeDb()
      await remove(ref(db, `${path}/${id}`))
    },
    [path]
  )

  return { items, loading, addItem, updateItem, removeItem }
}
