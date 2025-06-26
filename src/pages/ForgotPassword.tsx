import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import PublicRoute from '../components/PublicRoute'
import { resetPassword } from '../utils/auth'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: { email: string }) => {
    setLoading(true)
    setMessage(null)
    setError(null)

    const { error: resetError, message: resetMessage } = await resetPassword(formData.email)

    if (resetError) {
      setError(resetError)
    } else {
      setMessage(resetMessage || 'Password reset email sent. Please check your inbox.')
      // setEmail('') // Clear email field on success - handled by AuthForm now
    }
    setLoading(false)
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Forgot Your Password?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your email address below and we'll send you a link to reset your password.
            </p>
          </div>
          <AuthForm
            formType="forgot-password"
            onSubmit={handleSubmit}
            email={email}
            setEmail={setEmail}
            loading={loading}
            message={message}
            error={error}
          />
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Remembered your password? Sign in
            </Link>
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}

export default ForgotPassword