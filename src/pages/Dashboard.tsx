import { AlertCircle, Database, Settings as SettingsIcon } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BulkTaskActions from '../components/BulkTaskActions'
import CategoryFilter from '../components/CategoryFilter'
import DataManagement from '../components/DataManagement'
import Navbar from '../components/Navbar'
import TaskList from '../components/TaskList'
import { useNotifications } from '../hooks/useNotifications'
import { useTasks } from '../hooks/useTasks'
import type { TaskFormData, TaskUpdate, User } from '../types'
import { getCurrentUser, signOut } from '../utils/auth'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [showDataManagement, setShowDataManagement] = useState(false)

  const {
    tasks,
    categories,
    loading: tasksLoading,
    error: tasksError,
    taskStats,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    refreshTasks,
  } = useTasks(user?.id || null)

  // Load user on component mount
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser.user) {
        setUser(currentUser.user)
      } else {
        setError('Failed to authenticate user')
        navigate('/login')
      }
      setLoading(false)
    }

    loadUser()
  }, [navigate])

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      navigate('/login')
    } catch {
      setError('Failed to sign out')
    }
  }, [navigate])

  // Task handlers
  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      await createTask(taskData)
      addNotification({
        type: 'success',
        title: 'Task Created',
        message: `"${taskData.title}" has been created successfully.`,
        duration: 4000,
      })
    } catch {
      setError('Failed to create task')
      addNotification({
        type: 'error',
        title: 'Create Failed',
        message: 'Unable to create task. Please try again.',
        duration: 5000,
      })
    }
  }

  const handleUpdateTask = async (taskId: string, updates: TaskUpdate) => {
    try {
      await updateTask(taskId, updates)

      // Show different messages based on update type
      if (updates.completed !== undefined) {
        addNotification({
          type: 'success',
          title: updates.completed ? 'Task Completed' : 'Task Reopened',
          message: updates.completed
            ? 'Great job! Task marked as complete.'
            : 'Task marked as incomplete.',
          duration: 3000,
        })
      } else {
        addNotification({
          type: 'success',
          title: 'Task Updated',
          message: 'Task has been updated successfully.',
          duration: 3000,
        })
      }
    } catch {
      setError('Failed to update task')
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Unable to update task. Please try again.',
        duration: 5000,
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      addNotification({
        type: 'success',
        title: 'Task Deleted',
        message: 'Task has been deleted successfully.',
        duration: 4000,
      })
    } catch {
      setError('Failed to delete task')
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Unable to delete task. Please try again.',
        duration: 5000,
      })
    }
  }

  const handleReorderTasks = async (sourceIndex: number, destinationIndex: number) => {
    try {
      await reorderTasks(sourceIndex, destinationIndex)
      addNotification({
        type: 'success',
        title: 'Tasks Reordered',
        message: 'Task order has been updated successfully.',
        duration: 3000,
      })
    } catch {
      setError('Failed to reorder tasks')
      addNotification({
        type: 'error',
        title: 'Reorder Failed',
        message: 'Unable to reorder tasks. Please try again.',
        duration: 5000,
      })
    }
  }

  // Selection handlers
  const handleSelectionChange = (taskIds: Set<string>) => {
    setSelectedTasks(taskIds)
  }

  const handleTasksUpdated = () => {
    refreshTasks()
    setSelectedTasks(new Set()) // Clear selection after bulk operations
  }

  // Handle manual refresh with toast notification
  const handleManualRefresh = async () => {
    try {
      await refreshTasks()
      addNotification({
        type: 'info',
        title: 'Tasks Refreshed',
        message: 'Your tasks have been refreshed successfully.',
        duration: 3000,
      })
    } catch {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Unable to refresh tasks. Please try again.',
        duration: 5000,
      })
    }
  }

  // Get user display name - ES2022: Use Array.at() for cleaner array access
  const getUserDisplayName = (user: User): string => {
    return (
      user?.user_metadata?.name || (user?.email ? (user.email.split('@').at(0) ?? 'User') : 'User')
    )
  }

  // Filter tasks by selected category
  const filteredTasks =
    selectedCategory === 'all' ? tasks : tasks.filter(task => task.category_id === selectedCategory)

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Navbar user={user} onSignOut={handleSignOut} taskStats={taskStats} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Welcome back, {user ? getUserDisplayName(user) : 'User'}!
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Here's what you need to focus on today.
              </p>
            </div>

            {/* Action buttons - responsive positioning */}
            <div className="flex justify-center sm:justify-end space-x-3">
              <button
                onClick={() => setShowDataManagement(!showDataManagement)}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white sm:bg-white sm:hover:bg-gray-50 sm:text-gray-700 sm:dark:bg-gray-800 sm:dark:hover:bg-gray-700 sm:dark:text-gray-200 border border-transparent sm:border-gray-300 sm:dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors text-sm font-medium"
              >
                <Database className="h-4 w-4 mr-2" />
                Data Management
              </button>

              <button
                onClick={handleManualRefresh}
                disabled={tasksLoading}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white sm:bg-white sm:hover:bg-gray-50 sm:text-gray-700 sm:dark:bg-gray-800 sm:dark:hover:bg-gray-700 sm:dark:text-gray-200 border border-transparent sm:border-gray-300 sm:dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {(error || tasksError) && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error || tasksError}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Management Panel */}
        {showDataManagement && user && (
          <div className="mb-6 sm:mb-8">
            <DataManagement userId={user.id} onDataUpdated={handleTasksUpdated} />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 dark:bg-blue-500 rounded"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Tasks
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {taskStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 dark:bg-green-500 rounded-full"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Completed
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {taskStats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-600 dark:bg-yellow-500 rounded-md"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pending
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {taskStats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 dark:bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Urgent
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {taskStats.urgent}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Category Management */}
        <div className="mb-6 sm:mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory === 'all' ? undefined : selectedCategory}
            onCategoryChange={categoryId => setSelectedCategory(categoryId || 'all')}
            onCreateCategory={() => {}} // This will be handled by the CategoryFilter component
          />
        </div>

        {/* Bulk Task Actions */}
        {filteredTasks.length > 0 && user && (
          <BulkTaskActions
            tasks={filteredTasks}
            categories={categories}
            selectedTasks={selectedTasks}
            onSelectionChange={handleSelectionChange}
            onTasksUpdated={handleTasksUpdated}
            userId={user.id}
          />
        )}

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          categories={categories}
          loading={tasksLoading}
          error={tasksError}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onReorderTasks={handleReorderTasks}
          selectedTasks={selectedTasks}
          onSelectionChange={handleSelectionChange}
          showSelection={filteredTasks.length > 1}
        />
      </main>
    </div>
  )
}

export default Dashboard
