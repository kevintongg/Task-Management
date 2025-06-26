import React, { Suspense, lazy } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationToast from './components/NotificationToast'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import SuspenseLoader from './components/SuspenseLoader'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'))
const Features = lazy(() => import('./pages/Features'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Support = lazy(() => import('./pages/Support'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <div className="App">
                <NotificationToast />
                <Suspense fallback={<SuspenseLoader />}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <PublicRoute>
                          <Home />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/features"
                      element={
                        <PublicRoute>
                          <Features />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/about"
                      element={
                        <PublicRoute>
                          <About />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/contact"
                      element={
                        <PublicRoute>
                          <Contact />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/pricing"
                      element={
                        <PublicRoute>
                          <Pricing />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/security"
                      element={
                        <PublicRoute>
                          <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                            <div className="text-center">
                              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Security
                              </h1>
                              <p className="text-gray-600 dark:text-gray-300">Coming soon!</p>
                            </div>
                          </div>
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/support"
                      element={
                        <PublicRoute>
                          <Support />
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
                    <Route path="/auth/callback" element={<AuthCallback />} />
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
