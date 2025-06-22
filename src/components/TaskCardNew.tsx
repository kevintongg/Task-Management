import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Edit3,
  GripVertical,
  MoreHorizontal,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { TaskCardProps, TaskUpdate } from '../types'

/**
 * Individual task card component with drag-and-drop support
 */
const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  onUpdate,
  onDelete,
  isDragging = false,
}) => {
  // State for inline editing
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editedTask, setEditedTask] = useState(task)
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Refs for click outside detection and input focus
  const menuRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle click outside to close menu
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Focus title input when editing starts
   */
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditing])

  /**
   * Get priority color and styling
   */
  const getPriorityConfig = (priority: string) => {
    const configs = {
      high: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'High',
      },
      medium: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Medium',
      },
      low: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Low',
      },
    }
    return configs[priority as keyof typeof configs] || configs.medium
  }

  /**
   * Check if task is overdue
   */
  const isOverdue = (): boolean => {
    if (!task.due_date) return false
    const today = new Date()
    const dueDate = new Date(task.due_date)
    return dueDate < today && !task.completed
  }

  /**
   * Check if task is due soon (within 24 hours)
   */
  const isDueSoon = (): boolean => {
    if (!task.due_date) return false
    const now = new Date()
    const dueDate = new Date(task.due_date)
    const timeDiff = dueDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    return hoursDiff > 0 && hoursDiff <= 24 && !task.completed
  }

  /**
   * Format due date for display
   */
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

  /**
   * Handle saving edited task
   */
  const handleSave = async () => {
    if (!editedTask.title.trim()) {
      setEditedTask(prev => ({ ...prev, title: task.title }))
      setIsEditing(false)
      return
    }

    if (
      editedTask.title === task.title &&
      editedTask.description === task.description &&
      editedTask.completed === task.completed &&
      editedTask.category_id === task.category_id &&
      editedTask.priority === task.priority &&
      editedTask.due_date === task.due_date
    ) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      const updates: TaskUpdate = {
        title: editedTask.title.trim(),
        description: editedTask.description?.trim() || '',
        completed: editedTask.completed,
        category_id: editedTask.category_id,
        priority: editedTask.priority,
        due_date: editedTask.due_date,
      }
      await onUpdate(task.id, updates)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving task:', error)
      // Reset to original values on error
      setEditedTask(task)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle cancel editing
   */
  const handleCancel = () => {
    setEditedTask(task)
    setIsEditing(false)
  }

  /**
   * Handle delete task
   */
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true)
      try {
        await onDelete(task.id)
      } catch (error) {
        console.error('Error deleting task:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  /**
   * Toggle task completion
   */
  const handleToggleComplete = async () => {
    setIsLoading(true)
    try {
      await onUpdate(task.id, { completed: !task.completed })
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle priority change
   */
  const handlePriorityChange = async (newPriority: 'low' | 'medium' | 'high') => {
    setIsLoading(true)
    try {
      await onUpdate(task.id, { priority: newPriority })
    } catch (error) {
      console.error('Error updating task priority:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle key press in edit mode
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const priorityConfig = getPriorityConfig(task.priority)

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        isDragging ? 'shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      } ${task.completed ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="flex-shrink-0 mt-1">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
        </div>

        {/* Completion Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <button
            onClick={handleToggleComplete}
            disabled={isLoading}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {task.completed && <Check className="h-3 w-3" />}
          </button>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                ref={titleInputRef}
                type="text"
                value={editedTask.title}
                onChange={e => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Task title..."
              />
              <textarea
                value={editedTask.description || ''}
                onChange={e => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={2}
                placeholder="Description (optional)..."
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading || !editedTask.title.trim()}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Task Title */}
              <h3
                className={`font-medium text-gray-900 dark:text-white mb-1 ${
                  task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                }`}
              >
                {task.title}
              </h3>

              {/* Task Description */}
              {task.description && (
                <p
                  className={`text-sm text-gray-600 dark:text-gray-300 mb-2 ${
                    task.completed ? 'line-through' : ''
                  }`}
                >
                  {task.description}
                </p>
              )}

              {/* Task Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Priority Badge */}
                <span className={`px-2 py-1 rounded-full border ${priorityConfig.color}`}>
                  {priorityConfig.label}
                </span>

                {/* Category Badge */}
                {category && (
                  <span
                    className="px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <Tag className="h-3 w-3 inline mr-1" />
                    {category.name}
                  </span>
                )}

                {/* Due Date */}
                {task.due_date && (
                  <span
                    className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                      isOverdue()
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
                        : isDueSoon()
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {isOverdue() ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <Calendar className="h-3 w-3" />
                    )}
                    {formatDueDate(task.due_date)}
                  </span>
                )}

                {/* Created Date */}
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Menu */}
        {!isEditing && (
          <div className="flex-shrink-0 relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={isLoading}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit task
                  </button>

                  <div className="border-t border-gray-100 dark:border-gray-600">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Priority
                    </div>
                    {(['low', 'medium', 'high'] as const).map(priority => (
                      <button
                        key={priority}
                        onClick={() => {
                          handlePriorityChange(priority)
                          setShowMenu(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                          task.priority === priority
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <span className="capitalize">{priority}</span>
                        {task.priority === priority && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-600">
                    <button
                      onClick={() => {
                        handleDelete()
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete task
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard
