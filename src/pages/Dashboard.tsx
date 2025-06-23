import { AlertCircle, Settings as SettingsIcon } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CategoryFilter from '../components/CategoryFilter'
import Navbar from '../components/Navbar'
import TaskList from '../components/TaskList'
import { useTasks } from '../hooks/useTasks'
import type { TaskFormData, TaskUpdate, User } from '../types'
import { getCurrentUser, signOut } from '../utils/auth'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
    } catch {
      setError('Failed to create task')
    }
  }

  const handleUpdateTask = async (taskId: string, updates: TaskUpdate) => {
    try {
      await updateTask(taskId, updates)
    } catch {
      setError('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
    } catch {
      setError('Failed to delete task')
    }
  }

  const handleReorderTasks = async (sourceIndex: number, destinationIndex: number) => {
    try {
      await reorderTasks(sourceIndex, destinationIndex)
    } catch {
      setError('Failed to reorder tasks')
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

            {/* Refresh button - responsive positioning */}
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={refreshTasks}
                disabled={tasksLoading}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 sm:bg-white sm:dark:bg-gray-800 text-white sm:text-gray-700 sm:dark:text-gray-200 border border-transparent sm:border-gray-300 sm:dark:border-gray-600 rounded-lg hover:bg-blue-700 sm:hover:bg-gray-50 sm:dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 transition-colors text-sm font-medium"
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
              <div></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 dark:bg-green-500 rounded"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Completed
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {taskStats.completed}
                </p>
              </div>
              <div></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-600 dark:bg-yellow-500 rounded"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pending
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {taskStats.pending}
                </p>
              </div>
              <div></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 dark:bg-red-500 rounded"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Overdue
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {
                    tasks.filter(
                      t => !t.completed && t.due_date && new Date(t.due_date) < new Date()
                    ).length
                  }
                </p>
              </div>
              <div></div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Priority Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Breakdown of tasks by priority level
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="grid grid-cols-3 items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 dark:bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">-</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Low Priority
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter(t => t.priority === 'low').length}
                </p>
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-3 items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-600 dark:bg-yellow-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">~</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Medium Priority
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter(t => t.priority === 'medium').length}
                </p>
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-3 items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-red-600 dark:bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter(t => t.priority === 'high').length}
                </p>
              </div>
              <div></div>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-4 sm:mb-6 p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={categoryId => setSelectedCategory(categoryId || 'all')}
          />
        </div>

        {/* Task list */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <TaskList
            tasks={filteredTasks}
            categories={categories}
            loading={loading}
            error={error || tasksError}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onReorderTasks={handleReorderTasks}
          />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
