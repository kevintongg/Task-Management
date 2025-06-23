import AuthCallback from '@/pages/AuthCallback'
import Dashboard from '@/pages/Dashboard'
import ForgotPassword from '@/pages/ForgotPassword'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import ResetPassword from '@/pages/ResetPassword'
import Settings from '@/pages/Settings'
import Signup from '@/pages/Signup'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import React, { Component, ReactNode } from 'react'
import { Link, Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './contexts/ThemeContext'
import type { User } from './types'
import { onAuthStateChange } from './utils/auth'

// Types for our components
interface ProtectedRouteProps {
  children: ReactNode
}

interface PublicRouteProps {
  children: ReactNode
}

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

// Auth Context to manage authentication state globally
interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
})

// Auth Provider Component
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Listen to auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange((_event, user) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected Route Component - only accessible when authenticated
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// Public Route Component - only accessible when not authenticated
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

// 404 Not Found Component
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

// Error Boundary Component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-red-500 mb-4">
                <AlertCircle className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <Home />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  }
                />

                {/* OAuth callback route - needs special handling */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
