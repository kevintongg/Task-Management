import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationToast from './components/NotificationToast'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import About from './pages/About'
import AuthCallback from './pages/AuthCallback'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Features from './pages/Features'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Pricing from './pages/Pricing'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import Settings from './pages/Settings'
import Signup from './pages/Signup'
import Support from './pages/Support'

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
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
