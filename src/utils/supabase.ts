import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

// Supabase configuration - these values come from your Supabase project dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with optimized configuration
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth settings for better UX
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Store session in localStorage for persistence across browser sessions
    storage: window.localStorage
  },
  // Enable real-time subscriptions
  realtime: {
    params: {
      eventsPerSecond: 10 // Throttle real-time events to prevent spam
    }
  }
})

// Database table names - centralized for easy maintenance
export const TABLES = {
  TASKS: 'tasks',
  CATEGORIES: 'categories'
}

// Task status options
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done'
} as const

// Priority constants
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const

// Category colors
export const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e'
] as const

// Helper function to handle Supabase errors consistently
export const handleSupabaseError = (error: any, context = ''): string => {
  if (!error) return 'An unknown error occurred'

  const message = error.message || error.error_description || 'An unexpected error occurred'

  if (context) {
    console.error(`${context}:`, error)
  } else {
    console.error('Supabase error:', error)
  }

  return message
}

// Helper function to get the current user ID safely
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return !error && !!user
}

export default supabase
