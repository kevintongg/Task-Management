import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import type { AuthFormData, AuthFormProps } from '../types'

/**
 * Reusable authentication form component for login and signup
 * @param {Object} props - Component props
 * @param {string} props.mode - 'login' or 'signup'
 * @param {Function} props.onSubmit - Form submission handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.success - Success message
 * @param {Function} props.onModeChange - Handler for switching between login/signup
 */
interface AuthFormPropsExtended extends AuthFormProps {
  success?: string | null
  onModeChange?: (() => void) | null
  // Add specific props for forgot/reset password forms
  email?: string
  setEmail?: (email: string) => void
  password?: string
  setPassword?: (password: string) => void
  confirmPassword?: string
  setConfirmPassword?: (confirmPassword: string) => void
}

const AuthForm: React.FC<AuthFormPropsExtended> = ({
  mode = 'login',
  formType = 'login', // Add formType prop
  onSubmit,
  loading = false,
  error = null,
  success = null,
  onModeChange = null,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    email: email || '',
    password: password || '',
    confirmPassword: confirmPassword || '',
    name: '',
  })

  // UI state
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Determine if we're in signup mode
  const isSignup = mode === 'signup'
  const isForgotPassword = formType === 'forgot-password'
  const isResetPassword = formType === 'reset-password'

  /**
   * Handle input changes with validation
   */
  const handleInputChange = (field: string, value: string) => {
    if (field === 'email' && setEmail) {
      setEmail(value)
    } else if (field === 'password' && setPassword) {
      setPassword(value)
    } else if (field === 'confirmPassword' && setConfirmPassword) {
      setConfirmPassword(value)
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Email validation
    if (isForgotPassword || mode === 'login' || mode === 'signup') {
      if (!formData.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }
    }

    // Password validation (for login, signup, reset-password)
    if (mode === 'login' || mode === 'signup' || isResetPassword) {
      if (!formData.password) {
        errors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long'
      }
    }

    // Signup and Reset Password specific validation
    if (isSignup || isResetPassword) {
      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    // Signup-specific validation (name)
    if (isSignup && !formData.name.trim()) {
      errors.name = 'Name is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (isForgotPassword) {
      ;(onSubmit as (email: string) => Promise<void>)(formData.email)
    } else if (isResetPassword) {
      ;(onSubmit as (data: { password: string; confirmPassword: string }) => Promise<void>)({ password: formData.password, confirmPassword: formData.confirmPassword })
    } else {
      // Call the onSubmit handler with form data for login/signup
      const authData: AuthFormData = {
        email: formData.email.trim(),
        password: formData.password,
        name: isSignup ? formData.name.trim() : undefined,
      }
      ;(onSubmit as (data: AuthFormData) => Promise<void>)(authData)
    }
  }

  /**
   * Render input field with validation
   */
  const renderInputField = ({
    name,
    type,
    placeholder,
    icon: Icon,
    showToggle = false,
    showValue = false,
    toggleValue = false,
    onToggle = null,
  }: {
    name: string
    type: string
    placeholder: string
    icon: React.ComponentType<{ className?: string }>
    showToggle?: boolean
    showValue?: boolean
    toggleValue?: boolean
    onToggle?: (() => void) | null
  }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>

      <input
        type={showToggle && showValue ? 'text' : type}
        name={name}
        value={name === 'email' ? email : name === 'password' ? password : name === 'confirmPassword' ? confirmPassword : formData[name as keyof typeof formData]}
        onChange={e => handleInputChange(name, e.target.value)}
        className={`
          block w-full pl-10 pr-10 py-3 border rounded-lg
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${
            validationErrors[name]
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        placeholder={placeholder}
        disabled={loading}
        autoComplete={
          name === 'email'
            ? 'email'
            : name === 'password'
              ? isSignup || isResetPassword
                ? 'new-password'
                : 'current-password'
              : name === 'confirmPassword'
                ? 'new-password'
                : 'name'
        }
      />

      {showToggle && onToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={onToggle}
          disabled={loading}
        >
          {toggleValue ? (
            <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
          )}
        </button>
      )}

      {validationErrors[name] && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validationErrors[name]}
        </p>
      )}
    </div>
  )

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {isSignup ? 'Sign up to start managing your tasks' : 'Sign in to access your tasks'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              Authentication Error
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name field (signup only) */}
        {isSignup && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Full Name
            </label>
            {renderInputField({
              name: 'name',
              type: 'text',
              placeholder: 'Enter your full name',
              icon: User,
            })}
          </div>
        )}

        {/* Email field (login, signup, forgot-password) */}
        {(mode === 'login' || mode === 'signup' || isForgotPassword) && (
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            {renderInputField({
              name: 'email',
              type: 'email',
              placeholder: 'Enter your email address',
              icon: Mail,
            })}
          </div>
        )}

        {/* Password field (login, signup, reset-password) */}
        {(mode === 'login' || mode === 'signup' || isResetPassword) && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            {renderInputField({
              name: 'password',
              type: 'password',
              placeholder: 'Enter your password',
              icon: Lock,
              showToggle: true,
              showValue: showPassword,
              toggleValue: showPassword,
              onToggle: () => setShowPassword(!showPassword),
            })}
          </div>
        )}

        {/* Confirm Password field (signup and reset-password) */}
        {(isSignup || isResetPassword) && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Confirm Password
            </label>
            {renderInputField({
              name: 'confirmPassword',
              type: 'password',
              placeholder: 'Confirm your password',
              icon: Lock,
              showToggle: true,
              showValue: showConfirmPassword,
              toggleValue: showConfirmPassword,
              onToggle: () => setShowConfirmPassword(!showConfirmPassword),
            })}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full flex justify-center py-3 px-4 border border-transparent rounded-lg
            text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isSignup
                ? 'Creating Account...'
                : isForgotPassword
                  ? 'Sending Reset Link...'
                  : isResetPassword
                    ? 'Resetting Password...'
                    : 'Signing In...'}
            </div>
          ) : isSignup ? (
            'Create Account'
          ) : isForgotPassword ? (
            'Send Reset Link'
          ) : isResetPassword ? (
            'Reset Password'
          ) : (
            'Sign In'
          )}
        </button>

        {/* Mode Switch (login/signup only) */}
        {onModeChange && (mode === 'login' || mode === 'signup') && (
          <div className="text-center">
            <button
              type="button"
              onClick={onModeChange}
              disabled={loading}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium disabled:opacity-50"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default AuthForm
