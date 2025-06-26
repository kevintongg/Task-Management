import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import React from 'react'
import { useNotifications } from '../hooks/useNotifications'
import type { Notification } from '../types/notifications'

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  // Only show recent notifications that should appear as toasts
  const toastNotifications = notifications
    .filter(
      notification =>
        notification.duration !== 0 && // Don't show persistent notifications as toasts
        Date.now() - notification.timestamp.getTime() < 10000 // Only show recent ones
    )
    .slice(0, 5) // Limit to 5 toasts max

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getToastStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  if (toastNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toastNotifications.map(notification => (
        <div
          key={notification.id}
          className={`
            max-w-sm w-full pointer-events-auto
            border rounded-lg shadow-lg
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
            ${getToastStyles(notification.type)}
          `}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {notification.message}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationToast
