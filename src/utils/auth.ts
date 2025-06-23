import type { AuthChangeEvent } from '@supabase/supabase-js'
import type { AuthFormData, User } from '../types'
import { handleSupabaseError, supabase } from './supabase'

/**
 * Sign up a new user with email and password
 */
export const signUpWithEmail = async (
  formData: AuthFormData
): Promise<{ user: User | null; error: string | null; message?: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name || '',
        },
      },
    })

    if (error) {
      return { user: null, error: handleSupabaseError(error, 'Sign up') }
    }

    if (!data.user) {
      return { user: null, error: 'Failed to create user account' }
    }

    // Check if email confirmation is required
    if (!data.session) {
      return {
        user: data.user as User,
        error: null,
        message: 'Please check your email for a confirmation link.',
      }
    }

    return { user: data.user as User, error: null }
  } catch (error) {
    return { user: null, error: handleSupabaseError(error, 'Sign up') }
  }
}

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  formData: AuthFormData
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      return { user: null, error: handleSupabaseError(error, 'Sign in') }
    }

    if (!data.user) {
      return { user: null, error: 'Failed to sign in' }
    }

    return { user: data.user as User, error: null }
  } catch (error) {
    return { user: null, error: handleSupabaseError(error, 'Sign in') }
  }
}

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: handleSupabaseError(error, 'Sign out') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'Sign out') }
  }
}

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<{ user: User | null; error: string | null }> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: handleSupabaseError(error, 'Get current user') }
    }

    return { user: user as User | null, error: null }
  } catch (error) {
    return { user: null, error: handleSupabaseError(error, 'Get current user') }
  }
}

/**
 * Reset password for a user
 */
export const resetPassword = async (
  email: string
): Promise<{ error: string | null; message?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error: handleSupabaseError(error, 'Reset password') }
    }

    return {
      error: null,
      message: 'Password reset email sent. Please check your inbox.',
    }
  } catch (error) {
    return { error: handleSupabaseError(error, 'Reset password') }
  }
}

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: handleSupabaseError(error, 'Update password') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'Update password') }
  }
}

/**
 * Subscribe to authentication state changes
 */
export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, user: User | null) => void
) => {
  return supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
    callback(event, session?.user as User | null)
  })
}

/**
 * Check if the current user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { user } = await getCurrentUser()
  return !!user
}
