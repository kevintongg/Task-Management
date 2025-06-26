import {
  AlertTriangle,
  Archive,
  Calendar,
  Check,
  CheckSquare,
  Download,
  Square,
  Tag,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import type { Category, Task } from '../types'
import {
  bulkDeleteTasks,
  bulkUpdateTasks,
  downloadDataAsJson,
  downloadTasksAsCsv,
  exportUserData,
} from '../utils/dataManagement'
import Modal from './Modal'

interface BulkTaskActionsProps {
  tasks: Task[]
  categories: Category[]
  selectedTasks: Set<string>
  onSelectionChange: (taskIds: Set<string>) => void
  onTasksUpdated: () => void
  userId: string
}

const BulkTaskActions = ({
  tasks,
  categories,
  selectedTasks,
  onSelectionChange,
  onTasksUpdated,
  userId,
}: BulkTaskActionsProps) => {
  const [loading, setLoading] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { addNotification } = useNotifications()

  const allSelected = tasks.length > 0 && selectedTasks.size === tasks.length
  const someSelected = selectedTasks.size > 0 && selectedTasks.size < tasks.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(tasks.map(task => task.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return
    setShowDeleteModal(true)
  }

  const confirmBulkDelete = async () => {
    try {
      setLoading(true)
      const result = await bulkDeleteTasks(Array.from(selectedTasks), userId)

      if (result.success > 0) {
        addNotification({
          type: 'success',
          title: 'Tasks Deleted',
          message: `Successfully deleted ${result.success} task(s).`,
          duration: 5000,
        })
        onSelectionChange(new Set())
        onTasksUpdated()
      }

      if (result.failed > 0) {
        addNotification({
          type: 'warning',
          title: 'Deletion Issues',
          message: `${result.failed} task(s) could not be deleted. ${result.errors.join(', ')}`,
          duration: 8000,
        })
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'An error occurred while deleting tasks. Please try again.',
        duration: 6000,
      })
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
    }
  }

  const handleBulkComplete = async (completed: boolean) => {
    if (selectedTasks.size === 0) return

    setLoading(true)
    try {
      const updates = Array.from(selectedTasks).map(id => ({
        id,
        updates: { completed },
      }))

      const result = await bulkUpdateTasks(updates, userId)

      if (result.success > 0) {
        addNotification({
          type: 'success',
          title: completed ? 'Tasks Completed' : 'Tasks Marked Incomplete',
          message: `Successfully updated ${result.success} task(s).`,
          duration: 5000,
        })
        onTasksUpdated()

        if (result.failed > 0) {
          addNotification({
            type: 'warning',
            title: 'Update Issues',
            message: `${result.failed} task(s) could not be updated. ${result.errors.join(', ')}`,
            duration: 8000,
          })
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update tasks: ' + result.errors.join(', '),
          duration: 6000,
        })
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'An error occurred while updating tasks. Please try again.',
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkCategoryChange = async (categoryId: string | null) => {
    if (selectedTasks.size === 0) return

    setLoading(true)
    try {
      const updates = Array.from(selectedTasks).map(id => ({
        id,
        updates: { category_id: categoryId || undefined },
      }))

      const result = await bulkUpdateTasks(updates, userId)

      if (result.success > 0) {
        const categoryName = categoryId
          ? categories.find(c => c.id === categoryId)?.name || 'Unknown'
          : 'No Category'

        addNotification({
          type: 'success',
          title: 'Category Updated',
          message: `Successfully moved ${result.success} task(s) to "${categoryName}".`,
          duration: 5000,
        })
        onTasksUpdated()
        setShowCategoryDropdown(false)
      } else {
        addNotification({
          type: 'warning',
          title: 'Category Update Issues',
          message: `${result.failed} task(s) could not be updated. ${result.errors.join(', ')}`,
          duration: 8000,
        })
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Category Update Failed',
        message: 'An error occurred while updating task categories. Please try again.',
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkPriorityChange = async (priority: 'low' | 'medium' | 'high') => {
    if (selectedTasks.size === 0) return

    setLoading(true)
    try {
      const updates = Array.from(selectedTasks).map(id => ({
        id,
        updates: { priority },
      }))

      const result = await bulkUpdateTasks(updates, userId)

      if (result.success > 0) {
        addNotification({
          type: 'success',
          title: 'Priority Updated',
          message: `Successfully updated ${result.success} task(s) to ${priority} priority.`,
          duration: 5000,
        })
        onTasksUpdated()
        setShowPriorityDropdown(false)
      } else {
        addNotification({
          type: 'warning',
          title: 'Priority Update Issues',
          message: `${result.failed} task(s) could not be updated. ${result.errors.join(', ')}`,
          duration: 8000,
        })
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Priority Update Failed',
        message: 'An error occurred while updating task priorities. Please try again.',
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportSelected = async () => {
    if (selectedTasks.size === 0) return

    const selectedTasksData = tasks.filter(task => selectedTasks.has(task.id))
    downloadTasksAsCsv(
      selectedTasksData,
      categories,
      `selected-tasks-${new Date().toISOString().split('T')[0]}.csv`
    )

    addNotification({
      type: 'success',
      title: 'Export Complete',
      message: `Successfully exported ${selectedTasks.size} selected task(s) as CSV.`,
      duration: 5000,
    })
  }

  const handleExportAll = async () => {
    setLoading(true)
    try {
      const exportData = await exportUserData(userId)
      if (exportData) {
        downloadDataAsJson(exportData)
        addNotification({
          type: 'success',
          title: 'Export Complete',
          message: 'Successfully exported all data as JSON backup.',
          duration: 5000,
        })
      } else {
        addNotification({
          type: 'error',
          title: 'Export Failed',
          message: 'Failed to export data. Please try again.',
          duration: 6000,
        })
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'An error occurred while exporting all data.',
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'low':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Calendar className="h-4 w-4" />
      case 'low':
        return <Check className="h-4 w-4" />
      default:
        return null
    }
  }

  if (tasks.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Selection Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            {allSelected ? (
              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : someSelected ? (
              <div className="h-5 w-5 bg-blue-600 dark:bg-blue-400 rounded flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-sm" />
              </div>
            ) : (
              <Square className="h-5 w-5" />
            )}
            <span className="text-sm">
              {selectedTasks.size > 0 ? `${selectedTasks.size} selected` : 'Select all'}
            </span>
          </button>
        </div>

        {/* Export Controls */}
        <div className="flex items-center space-x-2">
          {selectedTasks.size > 0 && !allSelected && (
            <button
              onClick={handleExportSelected}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Export Selected ({selectedTasks.size})</span>
            </button>
          )}

          <button
            onClick={handleExportAll}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedTasks.size > 0 && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center gap-3">
            {/* Complete/Incomplete Actions */}
            <button
              onClick={() => handleBulkComplete(true)}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>Mark Complete</span>
            </button>

            <button
              onClick={() => handleBulkComplete(false)}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Archive className="h-4 w-4" />
              <span>Mark Incomplete</span>
            </button>

            {/* Category Assignment */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <Tag className="h-4 w-4" />
                <span>Assign Category</span>
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleBulkCategoryChange(null)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Remove Category
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleBulkCategoryChange(category.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Assignment */}
            <div className="relative">
              <button
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Set Priority</span>
              </button>

              {showPriorityDropdown && (
                <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                  {(['high', 'medium', 'low'] as const).map(priority => (
                    <button
                      key={priority}
                      onClick={() => handleBulkPriorityChange(priority)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${getPriorityColor(priority)}`}
                    >
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(priority)}
                        <span className="capitalize">{priority}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Action */}
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>

          {loading && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Processing {selectedTasks.size} task(s)...
            </div>
          )}
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Tasks"
          size="md"
          showCloseButton={!loading}
        >
          <div className="space-y-6">
            {/* Warning Icon and Message */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Delete {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}?
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  This action cannot be undone.{' '}
                  {selectedTasks.size === 1 ? 'The task' : 'These tasks'} and all{' '}
                  {selectedTasks.size === 1 ? 'its' : 'their'} data will be permanently removed.
                </p>
              </div>
            </div>

            {/* Task Count Summary */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTasks.size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Task{selectedTasks.size !== 1 ? 's' : ''} selected for deletion
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default BulkTaskActions
