import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle,
  Eye,
  EyeOff,
  Github,
  Lock,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  Trash2,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import type { User as UserType } from '../types'
import { getCurrentUser, linkOAuthAccount, signOut, updatePassword } from '../utils/auth'
import { supabase } from '../utils/supabase'

const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('account')

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    taskReminders: true,
    weeklyDigest: false,
    securityAlerts: true,
  })
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null)

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // OAuth management state
  const [oauthLoading, setOauthLoading] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [oauthSuccess, setOauthSuccess] = useState<string | null>(null)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user: currentUser, error } = await getCurrentUser()
        if (error) {
          console.error('Error loading user:', error)
        } else if (currentUser) {
          setUser(currentUser)

          // Load notification preferences from user metadata
          const userMetadata = currentUser.user_metadata as Record<string, unknown>
          const userNotifications = userMetadata?.notifications as
            | Record<string, boolean>
            | undefined
          if (userNotifications) {
            setNotifications({
              emailUpdates: userNotifications.emailUpdates ?? true,
              taskReminders: userNotifications.taskReminders ?? true,
              weeklyDigest: userNotifications.weeklyDigest ?? false,
              securityAlerts: userNotifications.securityAlerts ?? true,
            })
          }
        }
      } catch {
        console.error('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      setPasswordLoading(false)
      return
    }

    try {
      const { error } = await updatePassword(passwordForm.newPassword)
      if (error) {
        setPasswordError(error)
      } else {
        setPasswordSuccess('Password updated successfully!')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch {
      setPasswordError('Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Handle notification updates
  const handleNotificationSave = async () => {
    setNotificationLoading(true)
    setNotificationError(null)
    setNotificationSuccess(null)

    try {
      // Save notification preferences to Supabase user metadata
      const updateData: Record<string, unknown> = {
        notifications: notifications,
      }

      const { error } = await supabase.auth.updateUser({
        data: updateData,
      })

      if (error) {
        throw error
      }

      setNotificationSuccess('Notification preferences saved successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => {
        setNotificationSuccess(null)
      }, 3000)
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
      setNotificationError('Failed to save notification preferences. Please try again.')
    } finally {
      setNotificationLoading(false)
    }
  }

  // Handle OAuth account linking
  const handleLinkOAuth = async (
    provider: 'google' | 'github' | 'azure' | 'apple' | 'facebook'
  ) => {
    setOauthLoading(true)
    setOauthError(null)
    setOauthSuccess(null)

    try {
      const { error } = await linkOAuthAccount(provider)
      if (error) {
        setOauthError(error)
      } else {
        setOauthSuccess(
          `${provider} account linking initiated. You will be redirected to complete the process.`
        )
      }
    } catch {
      setOauthError('Failed to initiate account linking')
    } finally {
      setOauthLoading(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      return
    }

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      // First, delete all user-related data
      const userId = user?.id
      if (!userId) {
        throw new Error('User ID not found')
      }

      // Delete user's tasks (this should be handled by RLS policies)
      const { error: tasksError } = await supabase.from('tasks').delete().eq('user_id', userId)

      if (tasksError) {
        console.error('Error deleting user tasks:', tasksError)
        // Continue with account deletion even if task deletion fails
      }

      // Delete the user account using the user's own session
      // This uses the user's JWT token, not admin privileges
      const { error: deleteError } = await supabase.rpc('delete_user')

      if (deleteError) {
        // If the RPC function doesn't exist, we'll need to handle this differently
        // For now, we'll mark the account for deletion by updating user metadata
        const { error: markError } = await supabase.auth.updateUser({
          data: {
            account_deleted: true,
            deleted_at: new Date().toISOString(),
          },
        })

        if (markError) {
          throw new Error('Failed to mark account for deletion')
        }

        // Sign out the user
        await signOut()
        navigate('/', {
          state: {
            message:
              'Account marked for deletion. Our team will process this request within 24 hours.',
          },
        })
      } else {
        // If deletion was successful, sign out and redirect
        await signOut()
        navigate('/', {
          state: {
            message: 'Account successfully deleted.',
          },
        })
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      setDeleteError('Failed to delete account. Please try again or contact support.')
      setDeleteLoading(false)
    }
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-8">
              <div className="p-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Settings
                </h2>
                <div className="space-y-1">
                  {tabs.map(tab => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                    Account Information
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account ID
                        </label>
                        <input
                          type="text"
                          value={user?.id || ''}
                          readOnly
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to="/profile"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Edit Profile
                      </Link>
                    </div>

                    {/* OAuth Account Management */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                        Connected Accounts
                      </h4>

                      {oauthError && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                            <span className="text-red-800 dark:text-red-200">{oauthError}</span>
                          </div>
                        </div>
                      )}

                      {oauthSuccess && (
                        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                            <span className="text-green-800 dark:text-green-200">
                              {oauthSuccess}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Facebook OAuth */}
                        <div className="flex items-center justify-between py-4 px-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            </div>
                            <span className="text-base font-medium text-gray-900 dark:text-white">
                              Facebook
                            </span>
                          </div>
                          <button
                            onClick={() => handleLinkOAuth('facebook')}
                            disabled={oauthLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {oauthLoading ? 'Connecting...' : 'Connect'}
                          </button>
                        </div>

                        {/* Google OAuth */}
                        <div className="flex items-center justify-between py-4 px-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                            </div>
                            <span className="text-base font-medium text-gray-900 dark:text-white">
                              Google
                            </span>
                          </div>
                          <button
                            onClick={() => handleLinkOAuth('google')}
                            disabled={oauthLoading}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {oauthLoading ? 'Connecting...' : 'Connect'}
                          </button>
                        </div>

                        {/* Microsoft OAuth */}
                        <div className="flex items-center justify-between py-4 px-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z" />
                              </svg>
                            </div>
                            <span className="text-base font-medium text-gray-900 dark:text-white">
                              Microsoft
                            </span>
                          </div>
                          <button
                            onClick={() => handleLinkOAuth('azure')}
                            disabled={oauthLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {oauthLoading ? 'Connecting...' : 'Connect'}
                          </button>
                        </div>

                        {/* Apple OAuth */}
                        <div className="flex items-center justify-between py-4 px-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                              </svg>
                            </div>
                            <span className="text-base font-medium text-gray-900 dark:text-white">
                              Apple
                            </span>
                          </div>
                          <button
                            onClick={() => handleLinkOAuth('apple')}
                            disabled={oauthLoading}
                            className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {oauthLoading ? 'Connecting...' : 'Connect'}
                          </button>
                        </div>

                        {/* GitHub OAuth */}
                        <div className="flex items-center justify-between py-4 px-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-white dark:to-gray-100 rounded-lg flex items-center justify-center">
                              <Github className="w-5 h-5 text-white dark:text-gray-900" />
                            </div>
                            <span className="text-base font-medium text-gray-900 dark:text-white">
                              GitHub
                            </span>
                          </div>
                          <button
                            onClick={() => handleLinkOAuth('github')}
                            disabled={oauthLoading}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {oauthLoading ? 'Connecting...' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                    Security
                  </h3>

                  {/* Password Change Form */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h4>

                    {passwordError && (
                      <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                          <span className="text-red-800 dark:text-red-200">{passwordError}</span>
                        </div>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                          <span className="text-green-800 dark:text-green-200">
                            {passwordSuccess}
                          </span>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            id="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={e =>
                              setPasswordForm(prev => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords(prev => ({ ...prev, current: !prev.current }))
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            id="newPassword"
                            value={passwordForm.newPassword}
                            onChange={e =>
                              setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))
                            }
                            className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            id="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={e =>
                              setPasswordForm(prev => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-8">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-8">
                      Notification Preferences
                    </h3>

                    {notificationError && (
                      <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                          <span className="text-red-800 dark:text-red-200">
                            {notificationError}
                          </span>
                        </div>
                      </div>
                    )}

                    {notificationSuccess && (
                      <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                          <span className="text-green-800 dark:text-green-200 font-medium">
                            {notificationSuccess}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-center py-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-center justify-between w-full max-w-sm">
                            <div className="text-left flex-1">
                              <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                                {key === 'emailUpdates' && 'Email Updates'}
                                {key === 'taskReminders' && 'Task Reminders'}
                                {key === 'weeklyDigest' && 'Weekly Digest'}
                                {key === 'securityAlerts' && 'Security Alerts'}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {key === 'emailUpdates' &&
                                  'Receive email updates about your account'}
                                {key === 'taskReminders' && 'Get reminded about upcoming tasks'}
                                {key === 'weeklyDigest' && 'Weekly summary of your productivity'}
                                {key === 'securityAlerts' && 'Important security notifications'}
                              </p>
                            </div>
                            <div className="ml-6">
                              <button
                                onClick={() =>
                                  setNotifications(prev => ({ ...prev, [key]: !value }))
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                    value ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                      <button
                        onClick={handleNotificationSave}
                        disabled={notificationLoading}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                      >
                        {notificationLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Preferences
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                    Appearance
                  </h3>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Theme
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                      ].map(option => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              if (option.value !== theme) {
                                toggleTheme()
                              }
                            }}
                            className={`flex items-center justify-center p-4 border-2 rounded-lg transition-colors duration-200 ${
                              theme === option.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <Icon className="h-5 w-5 mr-2" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {activeTab === 'danger' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-6">
                    Danger Zone
                  </h3>

                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                      <h4 className="text-lg font-medium text-red-900 dark:text-red-100">
                        Delete Account
                      </h4>
                    </div>

                    <p className="text-red-800 dark:text-red-200 mb-6">
                      Once you delete your account, there is no going back. This will permanently
                      delete your account and all associated data.
                    </p>

                    {deleteError && (
                      <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                          <span className="text-red-800 dark:text-red-200 text-sm">
                            {deleteError}
                          </span>
                        </div>
                      </div>
                    )}

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Delete Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                            Type "DELETE" to confirm
                          </label>
                          <input
                            type="text"
                            value={deleteConfirm}
                            onChange={e => setDeleteConfirm(e.target.value)}
                            className="block w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700"
                            placeholder="Type DELETE to confirm"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {deleteLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              'Confirm Delete'
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              setDeleteConfirm('')
                              setDeleteError(null)
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
