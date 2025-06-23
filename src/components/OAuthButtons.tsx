import { useState } from 'react'
import { signInWithOAuth } from '../utils/auth'

interface OAuthButtonsProps {
  onError?: (error: string) => void
  className?: string
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onError, className = '' }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleOAuthSignIn = async (
    provider: 'google' | 'github' | 'facebook' | 'azure' | 'apple'
  ) => {
    setIsLoading(provider)

    try {
      const { error } = await signInWithOAuth(provider)

      if (error) {
        onError?.(error)
      }
      // If successful, user will be redirected by Supabase
    } catch {
      onError?.('An unexpected error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Facebook OAuth Button */}
      <button
        onClick={() => handleOAuthSignIn('facebook')}
        disabled={isLoading !== null}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading === 'facebook' ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-200 mr-3"></div>
        ) : (
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        {isLoading === 'facebook' ? 'Signing in...' : 'Continue with Facebook'}
      </button>

      {/* Google OAuth Button */}
      <button
        onClick={() => handleOAuthSignIn('google')}
        disabled={isLoading !== null}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading === 'google' ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-200 mr-3"></div>
        ) : (
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {isLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
      </button>

      {/* Microsoft OAuth Button */}
      <button
        onClick={() => handleOAuthSignIn('azure')}
        disabled={isLoading !== null}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading === 'azure' ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-200 mr-3"></div>
        ) : (
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.4 24H0L7.7 8.2L11.4 24zM24 24h-4.6l-9.2-12.2L18.8 0H24L15.4 10L24 24z" />
            <path d="M12.2 13.8l6.6-13.8H0l7.7 15.8L12.2 13.8z" opacity="0.6" />
          </svg>
        )}
        {isLoading === 'azure' ? 'Signing in...' : 'Continue with Microsoft'}
      </button>

      {/* Apple OAuth Button */}
      <button
        onClick={() => handleOAuthSignIn('apple')}
        disabled={isLoading !== null}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading === 'apple' ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-200 mr-3"></div>
        ) : (
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
        )}
        {isLoading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
      </button>

      {/* GitHub OAuth Button */}
      <button
        onClick={() => handleOAuthSignIn('github')}
        disabled={isLoading !== null}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading === 'github' ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-200 mr-3"></div>
        ) : (
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {isLoading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  )
}

export default OAuthButtons
