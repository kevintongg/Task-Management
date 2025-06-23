import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import OAuthButtons from '../components/OAuthButtons'
import type { AuthFormData } from '../types'
import { signUpWithEmail } from '../utils/auth'

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (data: AuthFormData) => {
    setAuthLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await signUpWithEmail(data)
      if (result.error) {
        setError(result.error)
      } else if (result.message) {
        setSuccess(result.message)
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg px-8 py-10">
          <div className="space-y-8">
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Create your account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Or{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  sign in to your existing account
                </Link>
              </p>
            </div>

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                <div className="text-green-800 dark:text-green-200 text-sm">{success}</div>
              </div>
            )}

            <div className="space-y-6">
              {/* OAuth Buttons */}
              <OAuthButtons onError={setError} />

              {/* Email/Password Form */}
              <div>
                <AuthForm
                  mode="signup"
                  onSubmit={handleSubmit}
                  loading={authLoading}
                  error={error}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
