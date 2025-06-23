import { useEffect, useState } from 'react'
import { getGravatarUrl } from '../utils/gravatar'

interface AvatarProps {
  email?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ email, name = 'User', size = 'md', className = '' }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Size mappings
  const sizeMap = {
    sm: { container: 'h-8 w-8', text: 'text-sm', pixels: 32 },
    md: { container: 'h-10 w-10', text: 'text-sm', pixels: 40 },
    lg: { container: 'h-12 w-12', text: 'text-base', pixels: 48 },
    xl: { container: 'h-16 w-16', text: 'text-lg', pixels: 64 },
  }

  const sizeConfig = sizeMap[size]

  // Generate user initials
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Load Gravatar
  useEffect(() => {
    if (!email) {
      setLoading(false)
      return
    }

    const loadGravatar = async () => {
      try {
        // First try to get the Gravatar URL
        const gravatarUrl = getGravatarUrl(email, sizeConfig.pixels, '404')

        // Test if the image exists by trying to load it
        const img = new Image()
        img.onload = () => {
          setAvatarUrl(gravatarUrl)
          setImageError(false)
          setLoading(false)
        }
        img.onerror = () => {
          setAvatarUrl(null)
          setImageError(true)
          setLoading(false)
        }
        img.src = gravatarUrl
      } catch (error) {
        console.warn('Failed to load Gravatar:', error)
        setAvatarUrl(null)
        setImageError(true)
        setLoading(false)
      }
    }

    loadGravatar()
  }, [email, sizeConfig.pixels])

  // Show loading state
  if (loading) {
    return (
      <div
        className={`${sizeConfig.container} bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center animate-pulse ${className}`}
      >
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
      </div>
    )
  }

  // Show Gravatar image if available
  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className={`${sizeConfig.container} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    )
  }

  // Fallback to initials
  return (
    <div
      className={`${sizeConfig.container} bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center ${className}`}
    >
      <span className={`${sizeConfig.text} font-medium text-blue-600 dark:text-blue-300`}>
        {getUserInitials(name)}
      </span>
    </div>
  )
}

export default Avatar
