import { Calendar, Save, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Category, Task, TaskUpdate } from '../types'
import CategoryFilter from './CategoryFilter'
import Modal from './Modal'

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  categories: Category[]
  onSave: (taskId: string, updates: TaskUpdate) => Promise<void>
  onDelete?: ((taskId: string) => Promise<void>) | (() => void)
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  categories,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category_id: '',
    due_date: '',
    completed: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDeleting, setIsDeleting] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      // Handle due_date - convert to datetime-local format if it exists
      let dueDateValue = ''
      if (task.due_date) {
        const date = new Date(task.due_date)
        // Format as YYYY-MM-DDTHH:MM for datetime-local input
        dueDateValue = date.toISOString().slice(0, 16)
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category_id: task.category_id || '',
        due_date: dueDateValue,
        completed: task.completed || false,
      })
      setErrors({})
    }
  }, [task])

  // Focus the modal when it opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        const focusButton = modalRef.current?.querySelector(
          '[data-focus-trap]'
        ) as HTMLButtonElement
        if (focusButton) {
          focusButton.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (formData.due_date) {
      // Parse the due date (now in YYYY-MM-DDTHH:MM format)
      const dueDate = new Date(formData.due_date)
      const now = new Date()

      if (dueDate < now) {
        newErrors.due_date = 'Due date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!task || !validateForm()) return

    setIsLoading(true)
    try {
      const updates: TaskUpdate = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority,
        category_id: formData.category_id || undefined,
        due_date: formData.due_date || undefined,
        completed: formData.completed,
      }

      await onSave(task.id, updates)
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
      setErrors({ general: 'Failed to save task. Please try again.' })
    } finally {
      setIsLoading(false)
      // Refocus modal after save attempt
      const focusButton = modalRef.current?.querySelector('[data-focus-trap]') as HTMLButtonElement
      if (focusButton) {
        focusButton.focus()
      }
    }
  }

  const handleDelete = async () => {
    if (!task || !onDelete) return

    // Check if onDelete expects a taskId parameter or is a simple callback
    if (onDelete.length === 0) {
      // Simple callback - doesn't need taskId and doesn't return Promise
      ;(onDelete as () => void)()
      return
    }

    setIsDeleting(true)
    try {
      await (onDelete as (taskId: string) => Promise<void>)(task.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
      setErrors({ general: 'Failed to delete task. Please try again.' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isLoading && !isDeleting) {
      setErrors({})
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isLoading || isDeleting) return

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    }
  }

  if (!task) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Task"
      size="lg"
      showCloseButton={!isLoading && !isDeleting}
    >
      <div ref={modalRef} className="space-y-6" onKeyDown={handleKeyDown}>
        {/* Hidden focus trap button */}
        <button
          data-focus-trap
          className="sr-only"
          tabIndex={-1}
          style={{ position: 'absolute', left: '-9999px' }}
          aria-hidden="true"
        />

        {/* General Error */}
        {errors.general && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.title
                ? 'border-red-300 dark:border-red-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter task title..."
            disabled={isLoading || isDeleting}
            autoFocus
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none ${
              errors.description
                ? 'border-red-300 dark:border-red-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Add a description..."
            disabled={isLoading || isDeleting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Priority and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  priority: e.target.value as 'low' | 'medium' | 'high',
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isLoading || isDeleting}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <CategoryFilter
              categories={categories}
              selectedCategory={formData.category_id || 'all'}
              onCategoryChange={categoryId =>
                setFormData(prev => ({
                  ...prev,
                  category_id: categoryId === 'all' || !categoryId ? '' : categoryId,
                }))
              }
            />
          </div>
        </div>

        {/* Due Date and Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Due Date & Time
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
            <input
              type="datetime-local"
              value={formData.due_date}
              onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className={`w-full pl-11 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.due_date
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isLoading || isDeleting}
              placeholder="Select date and time"
            />
          </div>
          {errors.due_date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.due_date}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Set a specific date and time for your task deadline
          </p>
        </div>

        {/* Completed Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="completed"
            checked={formData.completed}
            onChange={e => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 w-4 h-4"
            disabled={isLoading || isDeleting}
          />
          <label
            htmlFor="completed"
            className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Mark as completed
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Delete Button - Left Side */}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
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
                  Delete
                </>
              )}
            </button>
          )}

          {/* Cancel and Save Buttons - Right Side */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading || isDeleting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={e => {
                handleSave()
                // Prevent losing focus
                e.currentTarget.blur()
                const focusButton = modalRef.current?.querySelector(
                  '[data-focus-trap]'
                ) as HTMLButtonElement
                if (focusButton) {
                  focusButton.focus()
                }
              }}
              disabled={isLoading || isDeleting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
          Press{' '}
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded border">
            Ctrl+Enter
          </kbd>{' '}
          to save or{' '}
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded border">
            Esc
          </kbd>{' '}
          to cancel
        </div>
      </div>
    </Modal>
  )
}

export default EditTaskModal
