'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { Notification, Activity, UserPresence, COLLECTIONS } from '@/types'
import { toast } from 'sonner'
import { isFirebaseConfigured } from '@/lib/firebase'
import {
  subscribeToCollection,
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification as createFirestoreNotification,
  logActivity,
  deleteDocument,
  createDocument,
  orderBy,
  limit,
  where,
} from '@/lib/firebase-services'

// State
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  activities: Activity[]
  onlineUsers: UserPresence[]
  isConnected: boolean
  soundEnabled: boolean
}

// Actions
type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'SET_ONLINE_USERS'; payload: UserPresence[] }
  | { type: 'UPDATE_USER_PRESENCE'; payload: UserPresence }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'TOGGLE_SOUND' }

// Reducer
function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.read).length,
      }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }
    case 'REMOVE_NOTIFICATION': {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      )
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
        unreadCount: notification && !notification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }
    }
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload }
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 50),
      }
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload }
    case 'UPDATE_USER_PRESENCE': {
      const existingIndex = state.onlineUsers.findIndex(
        (u) => u.id === action.payload.id
      )
      if (existingIndex >= 0) {
        const newUsers = [...state.onlineUsers]
        newUsers[existingIndex] = action.payload
        return { ...state, onlineUsers: newUsers }
      }
      return { ...state, onlineUsers: [...state.onlineUsers, action.payload] }
    }
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled }
    default:
      return state
  }
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  activities: [],
  onlineUsers: [],
  isConnected: false,
  soundEnabled: true,
}

// Fallback data for when Firebase is not configured
const FALLBACK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'emergency_code',
    title: 'Code Blue Activated',
    titleAr: '\u062a\u0641\u0639\u064a\u0644 \u0643\u0648\u062f \u0623\u0632\u0631\u0642',
    message: 'Code Blue in ICU - Room 302',
    messageAr: '\u0643\u0648\u062f \u0623\u0632\u0631\u0642 \u0641\u064a \u0627\u0644\u0639\u0646\u0627\u064a\u0629 \u0627\u0644\u0645\u0631\u0643\u0632\u0629 - \u063a\u0631\u0641\u0629 302',
    priority: 'urgent',
    read: false,
    actionUrl: '/emergency',
    actionLabel: 'View Details',
    actionLabelAr: '\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    recipientId: 'all',
  },
  {
    id: '2',
    type: 'handover_request',
    title: 'Handover Request',
    titleAr: '\u0637\u0644\u0628 \u062a\u0633\u0644\u064a\u0645 \u0645\u0646\u0627\u0648\u0628\u0629',
    message: 'Sarah Ahmed requested handover for 5 patients',
    messageAr: '\u0633\u0627\u0631\u0629 \u0623\u062d\u0645\u062f \u0637\u0644\u0628\u062a \u062a\u0633\u0644\u064a\u0645 5 \u0645\u0631\u0636\u0649',
    priority: 'high',
    read: false,
    actionUrl: '/handover',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    recipientId: 'user-1',
    senderId: 'user-2',
    senderName: '\u0633\u0627\u0631\u0629 \u0623\u062d\u0645\u062f',
  },
]

const FALLBACK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'report_submitted',
    userId: 'user-2',
    userName: '\u0633\u0627\u0631\u0629 \u0623\u062d\u0645\u062f',
    action: 'submitted shift report',
    actionAr: '\u0623\u0631\u0633\u0644\u062a \u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629',
    target: 'Morning Shift Report',
    department: 'ICU',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
]

// Context
interface NotificationContextType extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  toggleSound: () => void
  sendEmergencyAlert: (type: string, location: string, department: string) => void
  sendTaskNotification: (taskId: string, assigneeId: string, title: string) => void
  sendHandoverRequest: (fromNurse: string, toNurseId: string, patientName: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

// Provider
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: FALLBACK_NOTIFICATIONS })
      dispatch({ type: 'SET_ACTIVITIES', payload: FALLBACK_ACTIVITIES })
      dispatch({ type: 'SET_CONNECTED', payload: true })
      return
    }

    dispatch({ type: 'SET_CONNECTED', payload: true })

    // Subscribe to notifications (for current user, handled by caller passing userId)
    const unsubNotifications = subscribeToCollection<Notification>(
      COLLECTIONS.NOTIFICATIONS,
      [orderBy('createdAt', 'desc'), limit(50)],
      (notifications) => {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications })
      }
    )

    // Subscribe to activities
    const unsubActivities = subscribeToCollection<Activity>(
      COLLECTIONS.ACTIVITIES,
      [orderBy('timestamp', 'desc'), limit(20)],
      (activities) => {
        dispatch({ type: 'SET_ACTIVITIES', payload: activities })
      }
    )

    return () => {
      unsubNotifications()
      unsubActivities()
    }
  }, [])

  const playNotificationSound = useCallback(() => {
    if (state.soundEnabled && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch {}
    }
  }, [state.soundEnabled])

  const addNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      }

      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

      const toastOptions = {
        description: notification.messageAr,
        action: notification.actionUrl
          ? {
              label: notification.actionLabelAr || '\u0639\u0631\u0636',
              onClick: () => {
                window.location.href = notification.actionUrl!
              },
            }
          : undefined,
      }

      switch (notification.priority) {
        case 'urgent':
          toast.error(notification.titleAr, toastOptions)
          playNotificationSound()
          break
        case 'high':
          toast.warning(notification.titleAr, toastOptions)
          playNotificationSound()
          break
        default:
          toast.info(notification.titleAr, toastOptions)
      }

      if (isFirebaseConfigured()) {
        try {
          await createFirestoreNotification({
            type: notification.type as string,
            title: notification.title,
            titleAr: notification.titleAr,
            message: notification.message,
            messageAr: notification.messageAr,
            priority: notification.priority,
            recipientId: notification.recipientId,
            senderId: notification.senderId,
            senderName: notification.senderName,
            actionUrl: notification.actionUrl,
            data: notification.data as Record<string, unknown>,
          })
        } catch (err) {
          console.error('Failed to save notification to Firestore:', err)
        }
      }
    },
    [playNotificationSound]
  )

  const markAsRead = useCallback(async (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id })
    if (isFirebaseConfigured()) {
      try {
        await markNotificationRead(id)
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    dispatch({ type: 'MARK_ALL_AS_READ' })
    if (isFirebaseConfigured()) {
      try {
        await markAllNotificationsRead('all')
      } catch (err) {
        console.error('Failed to mark all as read:', err)
      }
    }
  }, [])

  const removeNotification = useCallback(async (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    if (isFirebaseConfigured()) {
      try {
        await deleteDocument(COLLECTIONS.NOTIFICATIONS, id)
      } catch (err) {
        console.error('Failed to remove notification:', err)
      }
    }
  }, [])

  const addActivity = useCallback(
    async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
      const newActivity: Activity = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_ACTIVITY', payload: newActivity })

      if (isFirebaseConfigured()) {
        try {
          await logActivity({
            type: activity.type,
            userId: activity.userId,
            userName: activity.userName,
            action: activity.action,
            actionAr: activity.actionAr,
            target: activity.target,
            targetId: activity.targetId,
            department: activity.department,
            metadata: activity.metadata as Record<string, unknown>,
          })
        } catch (err) {
          console.error('Failed to log activity:', err)
        }
      }
    },
    []
  )

  const toggleSound = useCallback(() => {
    dispatch({ type: 'TOGGLE_SOUND' })
  }, [])

  const sendEmergencyAlert = useCallback(
    (type: string, location: string, department: string) => {
      addNotification({
        type: 'emergency_code',
        title: `Emergency Code ${type.toUpperCase()}`,
        titleAr: `\u0643\u0648\u062f \u0637\u0648\u0627\u0631\u0626 ${type === 'blue' ? '\u0623\u0632\u0631\u0642' : type === 'red' ? '\u0623\u062d\u0645\u0631' : type}`,
        message: `Emergency at ${location} - ${department}`,
        messageAr: `\u0637\u0648\u0627\u0631\u0626 \u0641\u064a ${location} - ${department}`,
        priority: 'urgent',
        read: false,
        actionUrl: '/emergency',
        actionLabel: 'Respond',
        actionLabelAr: '\u0627\u0633\u062a\u062c\u0627\u0628\u0629',
        recipientId: 'all',
        data: { type, location, department },
      })

      addActivity({
        type: 'emergency_code',
        userId: 'current-user',
        userName: '\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u062d\u0627\u0644\u064a',
        action: `activated Code ${type.toUpperCase()}`,
        actionAr: `\u0641\u0639\u0651\u0644 \u0643\u0648\u062f ${type === 'blue' ? '\u0623\u0632\u0631\u0642' : type === 'red' ? '\u0623\u062d\u0645\u0631' : type}`,
        target: location,
        department,
      })
    },
    [addNotification, addActivity]
  )

  const sendTaskNotification = useCallback(
    (taskId: string, assigneeId: string, title: string) => {
      addNotification({
        type: 'task_assigned',
        title: 'New Task Assigned',
        titleAr: '\u0645\u0647\u0645\u0629 \u062c\u062f\u064a\u062f\u0629',
        message: `You have been assigned: ${title}`,
        messageAr: `\u062a\u0645 \u062a\u0639\u064a\u064a\u0646 \u0645\u0647\u0645\u0629 \u0644\u0643: ${title}`,
        priority: 'high',
        read: false,
        actionUrl: '/tasks',
        recipientId: assigneeId,
        data: { taskId },
      })
    },
    [addNotification]
  )

  const sendHandoverRequest = useCallback(
    (fromNurse: string, toNurseId: string, patientName: string) => {
      addNotification({
        type: 'handover_request',
        title: 'Handover Request',
        titleAr: '\u0637\u0644\u0628 \u062a\u0633\u0644\u064a\u0645 \u0645\u0646\u0627\u0648\u0628\u0629',
        message: `${fromNurse} requested handover for ${patientName}`,
        messageAr: `${fromNurse} \u0637\u0644\u0628 \u062a\u0633\u0644\u064a\u0645 ${patientName}`,
        priority: 'high',
        read: false,
        actionUrl: '/handover',
        recipientId: toNurseId,
        senderName: fromNurse,
      })
    },
    [addNotification]
  )

  const value: NotificationContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addActivity,
    toggleSound,
    sendEmergencyAlert,
    sendTaskNotification,
    sendHandoverRequest,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return context
}
