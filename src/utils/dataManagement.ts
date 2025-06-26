import type { Category, Task, TaskFormData } from '../types'
import { supabase } from './supabase'

// Data validation schemas
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface BulkOperationResult {
  success: number
  failed: number
  errors: string[]
}

export interface ExportData {
  tasks: Task[]
  categories: Category[]
  exportedAt: string
  version: string
}

export interface ImportStats {
  tasksImported: number
  categoriesImported: number
  tasksSkipped: number
  categoriesSkipped: number
  errors: string[]
}

/**
 * Task data validation and sanitization
 */
export const validateTaskData = (taskData: Partial<TaskFormData>): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Title validation
  if (!taskData.title || typeof taskData.title !== 'string') {
    errors.push('Task title is required and must be a string')
  } else {
    const title = taskData.title.trim()
    if (title.length === 0) {
      errors.push('Task title cannot be empty')
    } else if (title.length > 255) {
      errors.push('Task title must be 255 characters or less')
    } else if (title.length < 3) {
      warnings.push('Task title is very short - consider being more descriptive')
    }
  }

  // Description validation
  if (taskData.description && typeof taskData.description === 'string') {
    if (taskData.description.length > 2000) {
      errors.push('Task description must be 2000 characters or less')
    }
  }

  // Priority validation
  if (taskData.priority && !['low', 'medium', 'high'].includes(taskData.priority)) {
    errors.push('Task priority must be one of: low, medium, high')
  }

  // Due date validation
  if (taskData.due_date) {
    const dueDate = new Date(taskData.due_date)
    if (isNaN(dueDate.getTime())) {
      errors.push('Due date must be a valid date')
    } else {
      const now = new Date()
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(now.getFullYear() + 1)

      if (dueDate < now) {
        warnings.push('Due date is in the past')
      } else if (dueDate > oneYearFromNow) {
        warnings.push('Due date is more than a year away - consider breaking this into smaller tasks')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Sanitize task data before saving
 */
export const sanitizeTaskData = (taskData: Partial<TaskFormData>): Partial<TaskFormData> => {
  const sanitized: Partial<TaskFormData> = {}

  if (taskData.title) {
    sanitized.title = taskData.title.trim().slice(0, 255)
  }

  if (taskData.description) {
    sanitized.description = taskData.description.trim().slice(0, 2000)
  }

  if (taskData.priority && ['low', 'medium', 'high'].includes(taskData.priority)) {
    sanitized.priority = taskData.priority
  }

  if (taskData.category_id) {
    sanitized.category_id = taskData.category_id
  }

  if (taskData.due_date) {
    try {
      const date = new Date(taskData.due_date)
      if (!isNaN(date.getTime())) {
        sanitized.due_date = date.toISOString()
      }
    } catch {
      // Invalid date, don't include it
    }
  }

  return sanitized
}

/**
 * Bulk delete tasks
 */
export const bulkDeleteTasks = async (
  taskIds: string[],
  userId: string
): Promise<BulkOperationResult> => {
  if (!taskIds.length || !userId) {
    return {
      success: 0,
      failed: 0,
      errors: ['Task IDs and User ID are required']
    }
  }

  const results = await Promise.allSettled(
    taskIds.map(async (taskId) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to delete task ${taskId}: ${error.message}`)
      }
      return taskId
    })
  )

  const successful = results.filter(result => result.status === 'fulfilled')
  const failed = results.filter(result => result.status === 'rejected')

  return {
    success: successful.length,
    failed: failed.length,
    errors: failed.map(result =>
      result.status === 'rejected' ? result.reason.message : 'Unknown error'
    )
  }
}

/**
 * Bulk update tasks
 */
export const bulkUpdateTasks = async (
  updates: Array<{ id: string; updates: Partial<Task> }>,
  userId: string
): Promise<BulkOperationResult> => {
  if (!updates.length || !userId) {
    return {
      success: 0,
      failed: 0,
      errors: ['Updates and User ID are required']
    }
  }

  const results = await Promise.allSettled(
    updates.map(async ({ id, updates: taskUpdates }) => {
      const updateData = {
        ...taskUpdates,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to update task ${id}: ${error.message}`)
      }
      return id
    })
  )

  const successful = results.filter(result => result.status === 'fulfilled')
  const failed = results.filter(result => result.status === 'rejected')

  return {
    success: successful.length,
    failed: failed.length,
    errors: failed.map(result =>
      result.status === 'rejected' ? result.reason.message : 'Unknown error'
    )
  }
}

/**
 * Export user data (tasks and categories)
 */
export const exportUserData = async (userId: string): Promise<ExportData | null> => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (tasksError) {
      throw new Error(`Failed to fetch tasks: ${tasksError.message}`)
    }

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`)
    }

    return {
      tasks: tasks || [],
      categories: categories || [],
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  } catch (error) {
    console.error('Export failed:', error)
    return null
  }
}

/**
 * Download data as JSON file
 */
export const downloadDataAsJson = (data: ExportData, filename?: string): void => {
  const jsonData = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download data as CSV file
 */
export const downloadTasksAsCsv = (tasks: Task[], categories: Category[], filename?: string): void => {
  // Create category lookup map
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]))

  // Define CSV headers
  const headers = [
    'Title',
    'Description',
    'Completed',
    'Priority',
    'Category',
    'Due Date',
    'Created At',
    'Updated At'
  ]

  // Convert tasks to CSV rows
  const rows = tasks.map(task => [
    `"${(task.title || '').replace(/"/g, '""')}"`,
    `"${(task.description || '').replace(/"/g, '""')}"`,
    task.completed ? 'Yes' : 'No',
    task.priority || 'medium',
    task.category_id ? `"${(categoryMap.get(task.category_id) || 'Unknown').replace(/"/g, '""')}"` : '',
    task.due_date || '',
    task.created_at || '',
    task.updated_at || ''
  ])

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `taskflow-tasks-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Parse and validate import data
 */
export const parseImportData = (jsonData: string): { data: ExportData | null; errors: string[] } => {
  const errors: string[] = []

  try {
    const parsed = JSON.parse(jsonData)

    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      errors.push('Invalid data format')
      return { data: null, errors }
    }

    if (!Array.isArray(parsed.tasks)) {
      errors.push('Tasks data must be an array')
    }

    if (!Array.isArray(parsed.categories)) {
      errors.push('Categories data must be an array')
    }

    if (errors.length > 0) {
      return { data: null, errors }
    }

    // Validate individual tasks
    parsed.tasks.forEach((task: unknown, index: number) => {
      const taskObj = task as Record<string, unknown>
      if (!taskObj.title || typeof taskObj.title !== 'string') {
        errors.push(`Task ${index + 1}: Missing or invalid title`)
      }
      if (taskObj.priority && !['low', 'medium', 'high'].includes(taskObj.priority as string)) {
        errors.push(`Task ${index + 1}: Invalid priority value`)
      }
    })

    // Validate individual categories
    parsed.categories.forEach((category: unknown, index: number) => {
      const categoryObj = category as Record<string, unknown>
      if (!categoryObj.name || typeof categoryObj.name !== 'string') {
        errors.push(`Category ${index + 1}: Missing or invalid name`)
      }
    })

    return {
      data: errors.length === 0 ? parsed as ExportData : null,
      errors
    }
  } catch {
    errors.push('Invalid JSON format')
    return { data: null, errors }
  }
}

/**
 * Import user data (with conflict resolution)
 */
export const importUserData = async (
  importData: ExportData,
  userId: string,
  options: {
    skipDuplicates?: boolean
    updateExisting?: boolean
  } = {}
): Promise<ImportStats> => {
  const stats: ImportStats = {
    tasksImported: 0,
    categoriesImported: 0,
    tasksSkipped: 0,
    categoriesSkipped: 0,
    errors: []
  }

  try {
    // Import categories first (tasks may reference them)
    for (const category of importData.categories) {
      try {
        // Check if category already exists
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .eq('name', category.name)
          .single()

        if (existing && options.skipDuplicates) {
          stats.categoriesSkipped++
          continue
        }

        if (existing && options.updateExisting) {
          // Update existing category
          const { error } = await supabase
            .from('categories')
            .update({
              color: category.color,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)

          if (error) {
            stats.errors.push(`Failed to update category "${category.name}": ${error.message}`)
          } else {
            stats.categoriesImported++
          }
        } else {
          // Create new category
          const { error } = await supabase
            .from('categories')
            .insert({
              name: category.name,
              color: category.color || '#3B82F6',
              user_id: userId
            })

          if (error) {
            stats.errors.push(`Failed to import category "${category.name}": ${error.message}`)
          } else {
            stats.categoriesImported++
          }
        }
      } catch (error) {
        stats.errors.push(`Error processing category "${category.name}": ${error}`)
      }
    }

    // Import tasks
    for (const task of importData.tasks) {
      try {
        // Validate task data
        const validation = validateTaskData(task)
        if (!validation.isValid) {
          stats.errors.push(`Invalid task "${task.title}": ${validation.errors.join(', ')}`)
          stats.tasksSkipped++
          continue
        }

        // Check if task already exists (by title and user)
        const { data: existing } = await supabase
          .from('tasks')
          .select('id')
          .eq('user_id', userId)
          .eq('title', task.title)
          .single()

        if (existing && options.skipDuplicates) {
          stats.tasksSkipped++
          continue
        }

        // Get the highest order_index for proper ordering
        const { data: existingTasks } = await supabase
          .from('tasks')
          .select('order_index')
          .eq('user_id', userId)
          .order('order_index', { ascending: false })
          .limit(1)

        const nextOrderIndex =
          existingTasks && existingTasks.length > 0 ? (existingTasks[0].order_index || 0) + 1 : 1

        const sanitizedTask = sanitizeTaskData(task)

        if (existing && options.updateExisting) {
          // Update existing task
          const { error } = await supabase
            .from('tasks')
            .update({
              ...sanitizedTask,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)

          if (error) {
            stats.errors.push(`Failed to update task "${task.title}": ${error.message}`)
          } else {
            stats.tasksImported++
          }
        } else {
          // Create new task
          const { error } = await supabase
            .from('tasks')
            .insert({
              ...sanitizedTask,
              user_id: userId,
              completed: task.completed || false,
              order_index: nextOrderIndex
            })

          if (error) {
            stats.errors.push(`Failed to import task "${task.title}": ${error.message}`)
          } else {
            stats.tasksImported++
          }
        }
      } catch (error) {
        stats.errors.push(`Error processing task "${task.title}": ${error}`)
        stats.tasksSkipped++
      }
    }

    return stats
  } catch (error) {
    stats.errors.push(`Import failed: ${error}`)
    return stats
  }
}

/**
 * Create a backup of user data
 */
export const createBackup = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const exportData = await exportUserData(userId)
    if (!exportData) {
      return { success: false, error: 'Failed to export user data' }
    }

    downloadDataAsJson(exportData)
    return { success: true }
  } catch (error) {
    return { success: false, error: `Backup failed: ${error}` }
  }
}

/**
 * Get data usage statistics
 */
export const getDataStats = async (userId: string) => {
  try {
    const [tasksResult, categoriesResult] = await Promise.all([
      supabase
        .from('tasks')
        .select('id, created_at, completed')
        .eq('user_id', userId),
      supabase
        .from('categories')
        .select('id, created_at')
        .eq('user_id', userId)
    ])

    const tasks = tasksResult.data || []
    const categories = categoriesResult.data || []

    // Calculate stats
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentTasks = tasks.filter(task => new Date(task.created_at) >= thirtyDaysAgo)
    const weeklyTasks = tasks.filter(task => new Date(task.created_at) >= sevenDaysAgo)
    const completedTasks = tasks.filter(task => task.completed)

    return {
      totalTasks: tasks.length,
      totalCategories: categories.length,
      completedTasks: completedTasks.length,
      completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      recentTasks: recentTasks.length,
      weeklyTasks: weeklyTasks.length,
      dataSize: Math.round((JSON.stringify({ tasks, categories }).length) / 1024) // KB
    }
  } catch (error) {
    console.error('Failed to get data stats:', error)
    return null
  }
}
