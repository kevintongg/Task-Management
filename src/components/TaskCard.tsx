import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Edit,
  GripVertical,
  MoreHorizontal,
  Tag,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { TaskCardProps, TaskUpdate } from '../types'
import DeleteConfirmModal from './DeleteConfirmModal'
import EditTaskModal from './EditTaskModal'

/**
 * Sortable wrapper for TaskCard component
 */
const SortableTaskCard: React.FC<TaskCardProps> = props => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Use a more reliable mobile detection
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isMobile ? listeners : {})}
      className={isMobile ? 'touch-none' : ''}
    >
      <TaskCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={!isMobile ? listeners : undefined}
        isMobile={isMobile}
      />
    </div>
  )
}

/**
 * Individual task card component with drag-and-drop support
 */
const TaskCard: React.FC<TaskCardProps & { dragHandleProps?: any; isMobile?: boolean }> = ({
  task,
  category,
  onUpdate,
  onDelete,
  isDragging = false,
  dragHandleProps,
  isMobile = false,
}) => {
  // State for modals and UI
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  // Refs for click outside detection
  const menuRef = useRef<HTMLDivElement>(null)

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
   * Handle edit task
   */
  const handleEdit = () => {
    setShowMenu(false)
    setShowEditModal(true)
  }

  /**
   * Handle delete task
   */
  const handleDelete = () => {
    setShowMenu(false)
    setShowDeleteModal(true)
  }

  /**
   * Handle edit modal save
   */
  const handleEditSave = async (taskId: string, updates: TaskUpdate) => {
    await onUpdate(taskId, updates)
  }

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async (taskId: string) => {
    await onDelete(taskId)
    // Close edit modal if it was open
    setShowEditModal(false)
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

  const priorityConfig = getPriorityConfig(task.priority)

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-200 dark:ring-blue-700' : 'hover:shadow-md'
      } ${task.completed ? 'opacity-75' : ''} ${
        isMobile ? 'active:shadow-md active:scale-[0.98] select-none' : ''
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile drag indicator - Show on mobile only */}
        {isMobile && (
          <div className="flex sm:hidden flex-shrink-0 items-center justify-center w-6 h-6">
            <div className="flex flex-col gap-0.5 items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Drag Handle - Hidden on mobile */}
        <div
          className="hidden sm:flex flex-shrink-0 items-center justify-center w-6 h-6"
          {...(dragHandleProps || {})}
        >
          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300" />
        </div>

        {/* Completion Checkbox */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <button
            onClick={handleToggleComplete}
            disabled={isLoading}
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white shadow-sm'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {task.completed && <Check className="h-3 w-3 sm:h-4 sm:w-4" />}
          </button>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="text-center sm:text-left">
            {/* Task Title */}
            <h3
              className={`text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight ${
                task.description ? 'mb-1 sm:mb-2' : 'mb-2 sm:mb-3'
              } ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
            >
              {task.title}
            </h3>

            {/* Task Description */}
            {task.description && (
              <p
                className={`text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 leading-relaxed ${
                  task.completed ? 'line-through' : ''
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Task Metadata */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
              {/* Priority Badge */}
              <span
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border font-medium text-xs ${priorityConfig.color}`}
              >
                {priorityConfig.label}
              </span>

              {/* Category Badge */}
              {category && (
                <span
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-white font-medium flex items-center gap-1 text-xs"
                  style={{ backgroundColor: category.color }}
                >
                  <Tag className="h-3 w-3" />
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{category.name.slice(0, 3)}</span>
                </span>
              )}

              {/* Due Date */}
              {task.due_date && (
                <span
                  className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1 font-medium text-xs ${
                    isOverdue()
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
                      : isDueSoon()
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {isOverdue() ? (
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden sm:inline">{formatDueDate(task.due_date)}</span>
                  <span className="sm:hidden">{formatDueDate(task.due_date).split(' ')[0]}</span>
                </span>
              )}

              {/* Created Date - Hidden on mobile */}
              <span className="hidden sm:flex text-gray-500 dark:text-gray-400 items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="flex-shrink-0 relative flex items-center justify-center" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={isLoading}
            className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
              <button
                onClick={handleEdit}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit task
              </button>

              <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>

              {/* Priority Selection */}
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
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors ${
                    task.priority === priority
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span className="capitalize">{priority}</span>
                  {task.priority === priority && <Check className="h-4 w-4" />}
                </button>
              ))}

              <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>

              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        task={task}
        categories={[]} // Will be passed from parent
        onSave={handleEditSave}
        onDelete={handleDeleteConfirm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        task={task}
        category={category}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default SortableTaskCard
