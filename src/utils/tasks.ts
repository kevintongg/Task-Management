import type { Category, CategoryFormData, Task, TaskFormData, TaskUpdate } from '../types';
import { handleSupabaseError, supabase } from './supabase';

/**
 * Fetch all tasks for a user
 */
export const fetchTasks = async (
  userId: string
): Promise<{ data: Task[]; error: string | null }> => {
  try {
    if (!userId) {
      return { data: [], error: 'User ID is required' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: handleSupabaseError(error, 'Fetch tasks') }
    }

    return { data: (data as Task[]) || [], error: null }
  } catch (error) {
    return { data: [], error: handleSupabaseError(error, 'Fetch tasks') }
  }
}

/**
 * Create a new task
 */
export const createTask = async (
  taskData: TaskFormData,
  userId: string
): Promise<{ data: Task | null; error: string | null }> => {
  try {
    if (!userId) {
      return { data: null, error: 'User ID is required' }
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

    const newTask = {
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      completed: false,
      priority: taskData.priority || 'medium',
      category_id: taskData.category_id || null,
      due_date: taskData.due_date || null,
      user_id: userId,
      order_index: nextOrderIndex,
    }

    const { data, error } = await supabase.from('tasks').insert([newTask]).select().single()

    if (error) {
      return { data: null, error: handleSupabaseError(error, 'Create task') }
    }

    return { data: data as Task, error: null }
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, 'Create task') }
  }
}

/**
 * Update an existing task
 */
export const updateTask = async (
  taskId: string,
  updates: TaskUpdate,
  userId: string
): Promise<{ data: Task | null; error: string | null }> => {
  try {
    if (!taskId || !userId) {
      return { data: null, error: 'Task ID and User ID are required' }
    }

    // Prepare the update object
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // ES2022: Remove undefined values using Object.hasOwn() for cleaner property checking
    Object.keys(updateData).forEach(key => {
      const typedKey = key as keyof typeof updateData
      if (Object.hasOwn(updateData, typedKey) && updateData[typedKey] === undefined) {
        delete updateData[typedKey]
      }
    })

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error, 'Update task') }
    }

    return { data: data as Task, error: null }
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, 'Update task') }
  }
}

/**
 * Delete a task
 */
export const deleteTask = async (
  taskId: string,
  userId: string
): Promise<{ error: string | null }> => {
  try {
    if (!taskId || !userId) {
      return { error: 'Task ID and User ID are required' }
    }

    const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId)

    if (error) {
      return { error: handleSupabaseError(error, 'Delete task') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'Delete task') }
  }
}

/**
 * Reorder tasks by updating their order_index
 */
export const reorderTasks = async (
  taskIds: string[],
  userId: string
): Promise<{ error: string | null }> => {
  try {
    if (!taskIds.length || !userId) {
      return { error: 'Task IDs and User ID are required' }
    }

    // Create update operations for each task
    const updates = taskIds.map((taskId, index) => ({
      id: taskId,
      order_index: index + 1,
      updated_at: new Date().toISOString(),
    }))

    // Execute all updates in parallel
    const results = await Promise.all(
      updates.map(update =>
        supabase
          .from('tasks')
          .update({
            order_index: update.order_index,
            updated_at: update.updated_at,
          })
          .eq('id', update.id)
          .eq('user_id', userId)
      )
    )

    // Check for any errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      return { error: handleSupabaseError(errors[0].error, 'Reorder tasks') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'Reorder tasks') }
  }
}

/**
 * Fetch all categories for a user
 */
export const fetchCategories = async (
  userId: string
): Promise<{ data: Category[]; error: string | null }> => {
  try {
    if (!userId) {
      return { data: [], error: 'User ID is required' }
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      return { data: [], error: handleSupabaseError(error, 'Fetch categories') }
    }

    return { data: (data as Category[]) || [], error: null }
  } catch (error) {
    return { data: [], error: handleSupabaseError(error, 'Fetch categories') }
  }
}

/**
 * Create a new category
 */
export const createCategory = async (
  categoryData: CategoryFormData,
  userId: string
): Promise<{ data: Category | null; error: string | null }> => {
  try {
    if (!userId) {
      return { data: null, error: 'User ID is required' }
    }

    const newCategory = {
      name: categoryData.name.trim(),
      color: categoryData.color || '#6b7280',
      user_id: userId,
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([newCategory])
      .select()
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error, 'Create category') }
    }

    return { data: data as Category, error: null }
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, 'Create category') }
  }
}

/**
 * Delete a category
 */
export const deleteCategory = async (
  categoryId: string,
  userId: string
): Promise<{ error: string | null }> => {
  try {
    if (!categoryId || !userId) {
      return { error: 'Category ID and User ID are required' }
    }

    // First, update any tasks that use this category to have no category
    await supabase
      .from('tasks')
      .update({ category_id: null })
      .eq('category_id', categoryId)
      .eq('user_id', userId)

    // Then delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId)

    if (error) {
      return { error: handleSupabaseError(error, 'Delete category') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'Delete category') }
  }
}

/**
 * Subscribe to real-time task changes
 */
export const subscribeToTasks = (userId: string, onTaskChange: (payload: unknown) => void) => {
  return supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      (payload: unknown) => {
        onTaskChange(payload)
      }
    )
    .subscribe()
}

/**
 * Subscribe to real-time category changes
 */
export const subscribeToCategories = (
  userId: string,
  onCategoryChange: (payload: unknown) => void
) => {
  return supabase
    .channel('categories-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
        filter: `user_id=eq.${userId}`,
      },
      (payload: unknown) => {
        onCategoryChange(payload)
      }
    )
    .subscribe()
}
