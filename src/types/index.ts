// Database types
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task
        Insert: TaskInsert
        Update: TaskUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
    }
  }
}

// User types from Supabase Auth
export interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
  app_metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

// Task types
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  category_id?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  created_at: string
  updated_at: string
  user_id: string
  order_index: number
}

export interface TaskInsert {
  title: string
  description?: string
  completed?: boolean
  category_id?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
  user_id: string
  order_index?: number
}

export interface TaskUpdate {
  title?: string
  description?: string
  completed?: boolean
  category_id?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
  order_index?: number
  updated_at?: string
}

// Category types
export interface Category {
  id: string
  name: string
  color: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface CategoryInsert {
  name: string
  color?: string
  user_id: string
}

export interface CategoryUpdate {
  name?: string
  color?: string
  updated_at?: string
}

// Task statistics
export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  urgent: number
  byPriority: {
    low: number
    medium: number
    high: number
  }
  byCategory: Record<string, number>
}

// Filter and search types
export interface TaskFilters {
  category?: string
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
  search?: string
  sortBy?: 'created_at' | 'due_date' | 'priority' | 'title'
  sortOrder?: 'asc' | 'desc'
}

// Form types
export interface TaskFormData {
  title: string
  description?: string
  category_id?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
}

export interface CategoryFormData {
  name: string
  color: string
}

export interface AuthFormData {
  email: string
  password: string
  name?: string
}

// Component prop types
export interface TaskCardProps {
  task: Task
  category?: Category
  categories?: Category[]
  onUpdate: (taskId: string, updates: TaskUpdate) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  isDragging?: boolean
}

export interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  loading: boolean
  error: string | null
  onCreateTask: (taskData: TaskFormData) => Promise<void>
  onUpdateTask: (taskId: string, updates: TaskUpdate) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
  onReorderTasks: (sourceIndex: number, destinationIndex: number) => Promise<void>
}

export interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
  onCategoryChange: (categoryId?: string) => void
  onCreateCategory: (categoryData: CategoryFormData) => Promise<void>
  taskCounts?: Record<string, number>
}

export interface NavbarProps {
  user: User | null
  onSignOut: () => Promise<void>
  taskStats?: TaskStats | null
}

export interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (data: AuthFormData) => Promise<void>
  loading?: boolean
  error?: string | null
}

// Hook return types
export interface UseTasksReturn {
  tasks: Task[]
  categories: Category[]
  loading: boolean
  error: string | null
  taskStats: TaskStats
  createTask: (taskData: TaskFormData) => Promise<void>
  updateTask: (taskId: string, updates: TaskUpdate) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  createCategory: (categoryData: CategoryFormData) => Promise<void>
  updateCategory: (categoryId: string, updates: CategoryUpdate) => Promise<void>
  deleteCategory: (categoryId: string) => Promise<void>
  reorderTasks: (sourceIndex: number, destinationIndex: number) => Promise<void>
  refreshTasks: () => Promise<void>
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// Utility types
export type AsyncFunction<T extends any[] = [], R = void> = (...args: T) => Promise<R>
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Event handler types
export type TaskEventHandler = (taskId: string) => void | Promise<void>
export type TaskUpdateHandler = (taskId: string, updates: TaskUpdate) => void | Promise<void>
export type CategoryEventHandler = (categoryId: string) => void | Promise<void>

// React component types
export type FC<P = {}> = React.FunctionComponent<P>
export type PropsWithChildren<P = {}> = P & { children?: React.ReactNode }

// Drag and drop types
export interface DragResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  } | null
  reason: 'DROP' | 'CANCEL'
}

// Environment variables
export interface EnvConfig {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_APP_NAME?: string
  VITE_APP_VERSION?: string
}

// Error types
export interface AppError extends Error {
  code?: string
  details?: string
  statusCode?: number
}

export class TaskError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string
  ) {
    super(message)
    this.name = 'TaskError'
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string
  ) {
    super(message)
    this.name = 'AuthError'
  }
}
