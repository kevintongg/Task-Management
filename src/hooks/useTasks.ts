import { useCallback, useEffect, useState } from 'react'
import type { Category, CategoryFormData, RealtimePayload, Task, TaskFormData, TaskStats, TaskUpdate, UseTasksReturn } from '../types'
import {
    createCategory,
    createTask,
    deleteCategory,
    deleteTask,
    fetchCategories,
    fetchTasks,
    reorderTasks,
    subscribeToCategories,
    subscribeToTasks,
    updateTask,
} from '../utils/tasks'

/**
 * Custom hook for managing tasks and categories with real-time updates
 */
export const useTasks = (userId: string | null): UseTasksReturn => {
  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Computed task statistics
  const taskStats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length,
    urgent: tasks.filter(t => !t.completed && t.priority === 'high').length,
    byPriority: {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
    },
    byCategory: categories.reduce((acc, category) => {
      acc[category.id] = tasks.filter(t => t.category_id === category.id).length
      return acc
    }, {} as Record<string, number>)
  }

  // Clear error after a delay
  const clearError = useCallback(() => {
    setTimeout(() => setError(null), 5000)
  }, [])

  // Set error with auto-clear
  const setErrorWithClear = useCallback((errorMessage: string) => {
    setError(errorMessage)
    clearError()
  }, [clearError])

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Load initial tasks and categories
   */
  const loadData = useCallback(async () => {
    if (!userId) {
      setTasks([])
      setCategories([])
      setLoading(false)
      return
    }

      setLoading(true)
      setError(null)

    try {
      // Fetch tasks and categories in parallel
      const [tasksResult, categoriesResult] = await Promise.all([
        fetchTasks(userId),
        fetchCategories(userId)
      ])

      if (tasksResult.error) {
        setErrorWithClear(tasksResult.error)
      } else {
        setTasks(tasksResult.data)
      }

      if (categoriesResult.error) {
        setErrorWithClear(categoriesResult.error)
      } else {
        setCategories(categoriesResult.data)
      }
    } catch (_err) {
      setErrorWithClear('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [userId, setErrorWithClear])

  // ============================================================================
  // TASK OPERATIONS
  // ============================================================================

  /**
   * Add a new task
   * @param {Object} taskData - Task data to create
   * @returns {Promise<boolean>} Success status
   */
  const addTask = useCallback(async (taskData: TaskFormData) => {
    if (!userId) {
      setErrorWithClear('User not authenticated')
      return
    }

    try {
      const result = await createTask(taskData, userId)
      if (result.error) {
        setErrorWithClear(result.error)
      } else if (result.data) {
        setTasks(prev => [...prev, result.data!])
      }
    } catch (_err) {
      setErrorWithClear('Failed to create task')
    }
  }, [userId, setErrorWithClear])

  /**
   * Update an existing task
   * @param {string} taskId - Task ID to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<boolean>} Success status
   */
  const editTask = useCallback(async (taskId: string, updates: TaskUpdate) => {
    if (!userId) {
      setErrorWithClear('User not authenticated')
      return
    }

    try {
      const result = await updateTask(taskId, updates, userId)
      if (result.error) {
        setErrorWithClear(result.error)
      } else if (result.data) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? result.data! : task
        ))
      }
    } catch (_err) {
      setErrorWithClear('Failed to update task')
    }
  }, [userId, setErrorWithClear])

  /**
   * Remove a task
   * @param {string} taskId - Task ID to delete
   * @returns {Promise<boolean>} Success status
   */
  const removeTask = useCallback(async (taskId: string) => {
    if (!userId) {
      setErrorWithClear('User not authenticated')
      return
    }

    try {
      const result = await deleteTask(taskId, userId)
      if (result.error) {
        setErrorWithClear(result.error)
      } else {
        setTasks(prev => prev.filter(task => task.id !== taskId))
      }
    } catch (_err) {
      setErrorWithClear('Failed to delete task')
    }
  }, [userId, setErrorWithClear])

  const reorderTasksList = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    if (!userId) {
      setErrorWithClear('User not authenticated')
      return
    }

    try {
      // Optimistically update the UI
      const newTasks = [...tasks]
      const [removed] = newTasks.splice(sourceIndex, 1)
      newTasks.splice(destinationIndex, 0, removed)
      setTasks(newTasks)

      // Update the server
      const taskIds = newTasks.map(task => task.id)
      const result = await reorderTasks(taskIds, userId)

      if (result.error) {
        setErrorWithClear(result.error)
        // Revert the optimistic update
        loadData()
      }
    } catch (_err) {
      setErrorWithClear('Failed to reorder tasks')
      loadData()
    }
  }, [userId, tasks, setErrorWithClear, loadData])

  // ============================================================================
  // CATEGORY OPERATIONS
  // ============================================================================

  /**
   * Add a new category
   * @param {Object} categoryData - Category data to create
   * @returns {Promise<boolean>} Success status
   */
  const addCategory = useCallback(async (categoryData: CategoryFormData) => {
    if (!userId) {
      setErrorWithClear('User not authenticated')
      return
    }

    try {
      const result = await createCategory(categoryData, userId)
      if (result.error) {
        setErrorWithClear(result.error)
      } else if (result.data) {
        setCategories(prev => [...prev, result.data!])
      }
    } catch (_err) {
      setErrorWithClear('Failed to create category')
    }
  }, [userId, setErrorWithClear])

  /**
   * Remove a category
   * @param {string} categoryId - Category ID to delete
   * @returns {Promise<boolean>} Success status
   */
  const removeCategory = useCallback(async (categoryId: string) => {
    if (!userId) {
      setErrorWithClear('User not authenticated')
      return
    }

    try {
      const result = await deleteCategory(categoryId, userId)
      if (result.error) {
        setErrorWithClear(result.error)
      } else {
        setCategories(prev => prev.filter(category => category.id !== categoryId))
        // Also update tasks that had this category
        setTasks(prev => prev.map(task =>
          task.category_id === categoryId
            ? { ...task, category_id: undefined }
            : task
        ))
      }
    } catch (_err) {
      setErrorWithClear('Failed to delete category')
    }
  }, [userId, setErrorWithClear])

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Handle real-time task changes
   */
  const handleTaskChange = useCallback((payload: RealtimePayload<Task>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        // Add new task if not already in state
        setTasks(prev => {
          const exists = prev.find(task => task.id === newRecord.id)
          if (exists) return prev
          return [...prev, newRecord].sort((a, b) => a.order_index - b.order_index)
        })
        break

      case 'UPDATE':
        // Update existing task
        setTasks(prev =>
          prev.map(task =>
            task.id === newRecord.id ? { ...task, ...newRecord } : task
          ).sort((a, b) => a.order_index - b.order_index)
        )
        break

      case 'DELETE':
        // Remove deleted task
        setTasks(prev =>
          prev.filter(task => task.id !== oldRecord.id)
        )
        break

      default:
        // Unknown event type - silently ignore for forward compatibility
    }
  }, [])

  /**
   * Handle real-time category changes
   */
  const handleCategoryChange = useCallback((payload: RealtimePayload<Category>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        // Add new category if not already in state
        setCategories(prev => {
          const exists = prev.find(category => category.id === newRecord.id)
          if (exists) return prev
          return [...prev, newRecord].sort((a, b) => a.name.localeCompare(b.name))
        })
        break

      case 'UPDATE':
        // Update existing category
        setCategories(prev =>
          prev.map(category =>
            category.id === newRecord.id ? { ...category, ...newRecord } : category
          ).sort((a, b) => a.name.localeCompare(b.name))
        )
        break

      case 'DELETE':
        // Remove deleted category
        setCategories(prev =>
          prev.filter(category => category.id !== oldRecord.id)
        )
        break

      default:
        // Unknown event type - silently ignore for forward compatibility
    }
  }, [])

  // Real-time subscriptions
  useEffect(() => {
    if (!userId) return

    // Create wrapper functions to handle type conversion
    const taskChangeWrapper = (payload: unknown) => {
      handleTaskChange(payload as RealtimePayload<Task>)
    }

    const categoryChangeWrapper = (payload: unknown) => {
      handleCategoryChange(payload as RealtimePayload<Category>)
    }

    // Subscribe to changes
    const taskSubscription = subscribeToTasks(userId, taskChangeWrapper)
    const categorySubscription = subscribeToCategories(userId, categoryChangeWrapper)

    // Cleanup subscriptions
    return () => {
      taskSubscription?.unsubscribe()
      categorySubscription?.unsubscribe()
    }
  }, [userId, handleTaskChange, handleCategoryChange])

  // Load data on mount and when userId changes
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    tasks,
    categories,
    loading,
    error,
    taskStats,
    createTask: addTask,
    updateTask: editTask,
    deleteTask: removeTask,
    createCategory: addCategory,
    updateCategory: async () => {}, // Not implemented
    deleteCategory: removeCategory,
    reorderTasks: reorderTasksList,
    refreshTasks: loadData,
  }
}
