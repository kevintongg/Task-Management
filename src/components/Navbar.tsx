import { Bell, LogOut, Menu, Settings as SettingsIcon, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import type { NavbarProps } from '../types'
import Avatar from './Avatar'
import NotificationDropdown from './NotificationDropdown'
import ThemeToggle from './ThemeToggle'

/**
 * Navigation bar component with responsive design and user menu
 */
const Navbar: React.FC<NavbarProps> = ({ user, onSignOut, taskStats = null }) => {
  // State for mobile menu and user dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false)

  // Refs for click outside detection
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Get notification context
  const { unreadCount } = useNotifications()

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
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
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
    setIsNotificationsOpen(false)
    onSignOut()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
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
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <Avatar
                  email={user?.email}
                  name={
                    user?.user_metadata?.name ||
                    (user?.email ? (user.email.split('@').at(0) ?? 'User') : 'User')
                  }
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.user_metadata?.name ||
                    (user?.email ? (user.email.split('@').at(0) ?? 'User') : 'User')}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium">
                      {user?.user_metadata?.name ||
                        (user?.email ? (user.email.split('@').at(0) ?? 'User') : 'User')}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">{user?.email}</div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <SettingsIcon className="h-4 w-4 mr-3" />
                    Settings
                  </Link>

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>

                  <button
                    onClick={handleSignOut}
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
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg animate-in slide-in-from-top-2 duration-200"
            ref={mobileMenuRef}
          >
            {/* Mobile User Info */}
            <div className="px-3 py-4 text-center">
              <div className="flex flex-col items-center space-y-3 mb-4">
                <Avatar
                  email={user?.email}
                  name={
                    user?.user_metadata?.name ||
                    (user?.email ? (user.email.split('@').at(0) ?? 'User') : 'User')
                  }
                  size="lg"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.user_metadata?.name ||
                      (user?.email ? (user.email.split('@').at(0) ?? 'User') : 'User')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Mobile Stats */}
            {taskStats && (
              <div className="px-3 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mx-3 mb-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Quick Stats
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {taskStats.total}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {taskStats.completed}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Done</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {taskStats.pending}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Actions */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <SettingsIcon className="h-4 w-4 mr-3" />
                  Settings
                </Link>

                <button
                  onClick={handleSignOut}
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
