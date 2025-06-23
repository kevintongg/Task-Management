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
const TaskCard: React.FC<
  TaskCardProps & { dragHandleProps?: Record<string, unknown>; isMobile?: boolean }
> = ({
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
   * Parse date string in a timezone-aware way for global collaboration
   */
  const parseDate = (dateString: string): Date => {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString)

    if (isDateOnly) {
      // For date-only strings, parse as local date to maintain user intent
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day)
    } else {
      // Parse as full datetime (UTC-aware)
      return new Date(dateString)
    }
  }

  /**
   * Format due date for display with timezone context and collaborative clarity
   */
  const formatDueDate = (dateString: string): string => {
    const date = parseDate(dateString)
    const now = new Date()

    // Normalize both dates to start of day for accurate comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const diffTime = dateOnly.getTime() - nowOnly.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    // Handle timezone edge cases with more context for global collaboration
    if (diffDays === 0) {
      return 'Today'
    }
    if (diffDays === 1) {
      return 'Tomorrow'
    }
    if (diffDays === -1) {
      return 'Yesterday'
    }
    if (diffDays > 1 && diffDays <= 7) {
      // Show both relative and absolute date for clarity across timezones
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      return `${dayName} (${diffDays} days)`
    }
    if (diffDays < -1 && diffDays >= -7) {
      return `${Math.abs(diffDays)} days ago`
    }

    // For dates beyond a week, show full date with day of week for global context
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }

    return date.toLocaleDateString('en-US', options)
  }

  /**
   * Get timezone-aware urgency level for collaborative context
   */
  const getTaskUrgency = (): 'overdue' | 'due-soon' | 'upcoming' | 'normal' => {
    if (!task.due_date || task.completed) return 'normal'

    const date = parseDate(task.due_date)
    const now = new Date()

    // Normalize dates for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const diffTime = dateOnly.getTime() - nowOnly.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'overdue'
    if (diffDays === 0 || diffDays === 1) return 'due-soon'
    if (diffDays <= 3) return 'upcoming'
    return 'normal'
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
    // Close delete modal and edit modal if they were open
    setShowDeleteModal(false)
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

        {/* Task Title - Centered with other elements */}
        <div className="flex-1 min-w-0 flex items-center">
          <h3
            className={`text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight ${
              task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
            }`}
          >
            {task.title}
          </h3>
        </div>

        {/* Priority Badge - Centered */}
        <div className="flex-shrink-0 flex items-center">
          <span
            className={`px-2.5 py-1 rounded-md border font-medium text-xs ${priorityConfig.color}`}
          >
            {priorityConfig.label}
          </span>
        </div>

        {/* Due Date - Centered */}
        {task.due_date && (
          <div className="flex-shrink-0 flex items-center">
            <span
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium text-xs ${
                getTaskUrgency() === 'overdue'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
                  : getTaskUrgency() === 'due-soon'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
                    : getTaskUrgency() === 'upcoming'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
              }`}
              title={`Due: ${parseDate(task.due_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} (in your timezone)`}
            >
              {getTaskUrgency() === 'overdue' ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{formatDueDate(task.due_date)}</span>
            </span>
          </div>
        )}

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

      {/* Task Description and Category - Below main row */}
      {(task.description || category) && (
        <div className="mt-2 sm:mt-3 ml-8 sm:ml-10">
          {/* Task Description */}
          {task.description && (
            <p
              className={`text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed ${
                task.completed ? 'line-through' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Category and Created Date */}
          <div className="flex items-center gap-2">
            {/* Category Badge */}
            {category && (
              <span
                className="px-2.5 py-1 rounded-md text-white font-medium flex items-center gap-1 text-xs"
                style={{ backgroundColor: category.color }}
              >
                <Tag className="h-3 w-3" />
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.slice(0, 3)}</span>
              </span>
            )}

            {/* Created Date */}
            <span className="hidden lg:flex text-gray-500 dark:text-gray-400 items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {new Date(task.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        task={task}
        categories={[]} // Will be passed from parent
        onSave={handleEditSave}
        onDelete={() => {
          setShowEditModal(false)
          setShowDeleteModal(true)
        }}
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
