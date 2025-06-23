import type { AuthChangeEvent } from '@supabase/supabase-js';
import type { AuthFormData, User } from '../types';
import { handleSupabaseError, supabase } from './supabase';

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

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 */
export const signInWithOAuth = async (
  provider: 'google' | 'github' | 'azure' | 'apple' | 'discord' | 'linkedin' | 'facebook'
): Promise<{ error: string | null }> => {
  try {
          const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

    if (error) {
      return { error: handleSupabaseError(error, `OAuth ${provider} sign in`) }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, `OAuth ${provider} sign in`) }
  }
}

/**
 * Link an OAuth provider to existing account
 */
export const linkOAuthAccount = async (
  provider: 'google' | 'github' | 'azure' | 'apple' | 'discord' | 'linkedin' | 'facebook'
): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/settings?linked=${provider}`,
      },
    })

    if (error) {
      return { error: handleSupabaseError(error, `Link ${provider} account`) }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, `Link ${provider} account`) }
  }
}

/**
 * Get user's linked OAuth providers (for future account management)
 */
export const getUserIdentities = async (): Promise<{
  identities: unknown[]
  error: string | null
}> => {
  try {
    const { user } = await getCurrentUser()

    if (!user) {
      return { identities: [], error: 'No authenticated user' }
    }

    // For now, just return basic info - we can enhance this later
    // when Supabase types are more stable
    return { identities: [], error: null }
  } catch (error) {
    return { identities: [], error: handleSupabaseError(error, 'Get user identities') }
  }
}
