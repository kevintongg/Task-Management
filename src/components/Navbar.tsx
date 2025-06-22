import { Bell, CheckSquare, LogOut, Menu, Plus, Settings, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NavbarProps, User as UserType } from '../types'
import ThemeToggle from './ThemeToggle'

/**
 * Navigation bar component with responsive design and user menu
 */
const Navbar: React.FC<NavbarProps> = ({ user, onSignOut, taskStats = null }) => {
  const navigate = useNavigate()

  // State for mobile menu and user dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false)

  // Refs for click outside detection
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  /**
   * Handle click outside to close menus
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)

    if (onSignOut) {
      await onSignOut()
    }

    navigate('/login')
  }

  /**
   * Navigation links for authenticated users
   */
  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: CheckSquare },
        { to: '/dashboard?action=create', label: 'New Task', icon: Plus },
      ]
    : []

  /**
   * User menu items
   */
  const userMenuItems = [
    {
      label: 'Profile',
      icon: User,
      onClick: () => {
        setIsUserMenuOpen(false)
        navigate('/profile')
      },
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => {
        setIsUserMenuOpen(false)
        navigate('/settings')
      },
    },
    {
      label: 'Sign Out',
      icon: LogOut,
      onClick: handleSignOut,
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    },
  ]

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (user: UserType | null): string => {
    if (!user) return '??'

    const name = user.user_metadata?.name || user.email || 'User'
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  /**
   * Render notification badge
   */
  const renderNotificationBadge = () => {
    if (!taskStats || !user) return null

    const overdueTasks = taskStats.overdue || 0
    const urgentTasks = taskStats.urgent || 0
    const notificationCount = overdueTasks + urgentTasks

    if (notificationCount === 0) return null

    return (
      <button
        className={`
          relative p-2 text-secondary-600 hover:text-secondary-800
          hover:bg-secondary-100 rounded-lg transition-colors duration-200
        `}
        title={`${notificationCount} notifications`}
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      </button>
    )
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                TaskFlow
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Stats */}
            {taskStats && (
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>{taskStats.total} Total</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>{taskStats.completed} Done</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span>{taskStats.pending} Pending</span>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                    {getUserInitials(user)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : 'User')}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium">
                      {user?.user_metadata?.name ||
                        (user?.email ? user.email.split('@')[0] : 'User')}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">{user?.email}</div>
                  </div>

                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </button>

                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>

                  <button
                    onClick={onSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {/* Mobile Stats */}
            {taskStats && (
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Quick Stats
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {taskStats.total}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {taskStats.completed}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {taskStats.pending}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Pending</div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile User Info */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                    {getUserInitials(user)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : 'User')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
              </div>

              <div className="space-y-1">
                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </button>

                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </button>

                <button
                  onClick={onSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
