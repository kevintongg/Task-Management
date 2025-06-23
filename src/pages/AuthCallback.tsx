import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        // We just need to check if the user is authenticated
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('OAuth callback error:', error)
          navigate('/login?error=oauth_failed')
          return
        }

        if (session) {
          // User successfully authenticated, redirect to dashboard
          navigate('/dashboard')
        } else {
          // No session found, redirect back to login
          navigate('/login')
        }
      } catch (error) {
        console.error('Unexpected error during OAuth callback:', error)
        navigate('/login?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Completing sign in...
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  )
}

export default AuthCallback
