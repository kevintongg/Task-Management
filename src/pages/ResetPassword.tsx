import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import PublicRoute from '../components/PublicRoute'
import { updatePassword } from '../utils/auth'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check for access_token in URL on component mount
    const accessToken = searchParams.get('access_token')
    if (!accessToken) {
      setError('Invalid password reset link. Missing access token.')
    }
  }, [searchParams])

  const handleSubmit = async (formData: { password: string; confirmPassword: string }) => {
    setLoading(true)
    setMessage(null)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const { error: updateError } = await updatePassword(formData.password)

    if (updateError) {
      setError(updateError)
    } else {
      setMessage('Your password has been reset successfully. You can now log in.')
      setTimeout(() => {
        navigate('/login')
      }, 3000) // Redirect to login after 3 seconds
    }
    setLoading(false)
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Reset Your Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your new password below.
            </p>
          </div>
          <AuthForm
            formType="reset-password"
            onSubmit={handleSubmit}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            loading={loading}
            message={message}
            error={error}
          />
        </div>
      </div>
    </PublicRoute>
  )
}

export default ResetPassword
