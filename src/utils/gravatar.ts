import CryptoJS from 'crypto-js'

/**
 * Generate MD5 hash of email for Gravatar
 */
const generateMD5Hash = (email: string): string => {
  return CryptoJS.MD5(email.toLowerCase().trim()).toString()
}

/**
 * Generate Gravatar URL for a given email
 * @param email - User's email address
 * @param size - Avatar size (default: 80)
 * @param defaultImage - What to show if no Gravatar exists ('404', 'mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'robohash', 'blank')
 * @returns Gravatar URL
 */
export const getGravatarUrl = (
  email: string | undefined,
  size: number = 80,
  defaultImage: string = '404'
): string => {
  if (!email) return ''

  const hash = generateMD5Hash(email)
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=g`
}

/**
 * Check if a Gravatar exists for the given email
 * @param email - User's email address
 * @returns Promise<boolean> - True if Gravatar exists
 */
export const checkGravatarExists = async (email: string | undefined): Promise<boolean> => {
  if (!email) return false

  try {
    const url = getGravatarUrl(email, 80, '404')
    const response = await fetch(url, { method: 'HEAD' })
    return response.status === 200
  } catch (error) {
    console.warn('Failed to check Gravatar:', error)
    return false
  }
}

/**
 * Get the best avatar URL with fallback options
 * @param email - User's email address
 * @param size - Avatar size
 * @returns Promise<string | null> - Gravatar URL or null if not available
 */
export const getAvatarUrl = async (
  email: string | undefined,
  size: number = 80
): Promise<string | null> => {
  if (!email) return null

  const gravatarExists = await checkGravatarExists(email)
  if (gravatarExists) {
    return getGravatarUrl(email, size, 'mp')
  }

  return null
}
