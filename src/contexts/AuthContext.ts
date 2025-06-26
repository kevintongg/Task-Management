import { createContext } from 'react'
import type { User } from '../types'

export interface AuthContextType {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
