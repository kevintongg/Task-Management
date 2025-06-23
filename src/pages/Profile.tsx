import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  Edit3,
  Mail,
  Save,
  Settings,
  Shield,
  User,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import type { User as UserType } from '../types'
import { getCurrentUser } from '../utils/auth'
import { supabase } from '../utils/supabase'

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user: currentUser, error } = await getCurrentUser()
        if (error) {
          setError(error)
        } else if (currentUser) {
          setUser(currentUser)
          setFormData({
            name: currentUser.user_metadata?.name || '',
            email: currentUser.email || '',
          })
        }
      } catch {
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Handle form submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name.trim(),
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Profile updated successfully!')
        setEditing(false)

        // Refresh user data
        const { user: updatedUser } = await getCurrentUser()
        if (updatedUser) {
          setUser(updatedUser)
        }
      }
    } catch {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
    })
    setEditing(false)
    setError(null)
    setSuccess(null)
  }

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get account age
  const getAccountAge = () => {
    if (!user?.created_at) return 'Unknown'
    const created = new Date(user.created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years > 1 ? 's' : ''}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to Load Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load your profile information.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <div className="text-left mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your account information and preferences
              </p>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="absolute top-0 right-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden mb-8">
          {/* Profile Header with Gradient */}
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 px-8 py-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <Avatar
                  email={user.email}
                  name={user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  size="xl"
                  className="ring-4 ring-white/20 shadow-2xl"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              </div>

              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-blue-100 text-lg mb-4">{user.email}</p>
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <Award className="h-4 w-4 mr-2" />
                  Member since {formatDate(user.created_at)} • {getAccountAge()} with us
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {/* Messages */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                  <span className="text-red-800 dark:text-red-200">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-green-800 dark:text-green-200">{success}</span>
                </div>
              </div>
            )}

            {editing ? (
              /* Edit Form */
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        readOnly
                        className="block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed text-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Email cannot be changed for security reasons
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-8">
                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information Card */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 text-center">
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Personal Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Full Name
                        </label>
                        <p className="text-gray-900 dark:text-white text-lg font-medium">
                          {user.user_metadata?.name || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Email Address
                        </label>
                        <p className="text-gray-900 dark:text-white text-lg font-medium break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information Card */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 text-center">
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                        <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Account Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Member Since
                        </label>
                        <p className="text-gray-900 dark:text-white text-lg font-medium">
                          {formatDate(user.created_at)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Account Status
                        </label>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Active ({getAccountAge()})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                      to="/settings"
                      className="group flex items-center justify-center px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                    >
                      <Settings className="h-5 w-5 mr-3 group-hover:text-blue-600" />
                      Account Settings
                    </Link>
                    <Link
                      to="/forgot-password"
                      className="group flex items-center justify-center px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                    >
                      <Shield className="h-5 w-5 mr-3 group-hover:text-orange-600" />
                      Change Password
                    </Link>
                    <button
                      onClick={() => setEditing(true)}
                      className="group flex items-center justify-center px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                    >
                      <Edit3 className="h-5 w-5 mr-3 group-hover:text-green-600" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
