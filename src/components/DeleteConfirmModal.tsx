import { AlertTriangle, Calendar, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Category, Task } from '../types'
import Modal from './Modal'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  category?: Category | null
  onConfirm: (taskId: string) => Promise<void>
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  task,
  category,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!task) return

    setIsDeleting(true)
    try {
      await onConfirm(task.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  const formatDueDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getPriorityConfig = (priority: string) => {
    const configs = {
      high: {
        color:
          'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        label: 'High',
      },
      medium: {
        color:
          'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        label: 'Medium',
      },
      low: {
        color:
          'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        label: 'Low',
      },
    }
    return configs[priority as keyof typeof configs] || configs.medium
  }

  if (!task) return null

  const priorityConfig = getPriorityConfig(task.priority)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Task"
      size="md"
      showCloseButton={!isDeleting}
    >
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Are you sure you want to delete this task?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This action cannot be undone. The task and all its data will be permanently removed.
            </p>
          </div>
        </div>

        {/* Task Preview */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="space-y-3">
            {/* Task Title */}
            <div className="text-center">
              <h4 className="font-medium text-gray-900 dark:text-white text-lg">{task.title}</h4>
              {task.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Task Metadata */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              {/* Priority */}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}
              >
                {priorityConfig.label} Priority
              </span>

              {/* Category */}
              {category && (
                <span className="inline-flex items-center text-gray-600 dark:text-gray-300">
                  <Tag className="h-3 w-3 mr-1" />
                  <span
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </span>
              )}

              {/* Due Date */}
              {task.due_date && (
                <span className="inline-flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDueDate(task.due_date)}
                </span>
              )}

              {/* Completion Status */}
              {task.completed && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                  Completed
                </span>
              )}
            </div>

            {/* Creation Date */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Created{' '}
              {new Date(task.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </>
            )}
          </button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
          Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd>{' '}
          to cancel
        </div>
      </div>
    </Modal>
  )
}

export default DeleteConfirmModal
