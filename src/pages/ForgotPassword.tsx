import { CheckCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import PublicRoute from '../components/PublicRoute'
import ThemeToggle from '../components/ThemeToggle'
import { resetPassword } from '../utils/auth'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSuccessModal) {
        setShowSuccessModal(false)
      }
    }

    if (showSuccessModal) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showSuccessModal])

  const handleSubmit = async (formData: { email: string }) => {
    setLoading(true)
    setShowSuccessModal(false)
    setError(null)

    // Clear email field only after validation passes and we're actually making the API call
    setEmail('')

    const { error: resetError } = await resetPassword(formData.email)

    if (resetError) {
      setError(resetError)
    } else {
      setShowSuccessModal(true)
    }
    setLoading(false)
  }

  const closeModal = () => {
    setShowSuccessModal(false)
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Floating Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

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
            error={error}
          />
          <div className="text-sm text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Remembered your password? Sign in
            </Link>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Success icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-3">
                Check Your Email
              </h3>

              {/* Message */}
              <div className="text-center text-gray-600 dark:text-gray-300 space-y-3">
                <p>
                  If an account with that email address exists, we have sent you a password reset
                  link.
                </p>
                <p className="text-sm">
                  Please check your email{' '}
                  <span className="font-medium">(including spam folder)</span> and follow the
                  instructions to reset your password.
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={closeModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Got it
                </button>
                <Link
                  to="/login"
                  className="block w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium py-2 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicRoute>
  )
}

export default ForgotPassword
