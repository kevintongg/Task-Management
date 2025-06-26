/* eslint-disable react-refresh/only-export-components */
import React, { createContext, ReactNode, useCallback, useState } from 'react'
import type { Notification, NotificationContextType } from '../types/notifications'

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const addNotification = useCallback(
    (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newNotification: Notification = {
        ...notificationData,
        id,
        timestamp: new Date(),
        read: false,
      }

      setNotifications(prev => [newNotification, ...prev])

      // Auto-remove notification after duration (default 5 seconds for non-persistent ones)
      if (notificationData.duration !== 0) {
        const duration = notificationData.duration || 5000
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }
    },
    [removeNotification]
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
