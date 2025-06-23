import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AlertCircle, Calendar, Plus, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { Category, Task, TaskFormData, TaskListProps } from '../types'
import CategoryFilter from './CategoryFilter'
import SortableTaskCard from './TaskCard'

const TaskList: React.FC<TaskListProps> = ({
  tasks = [],
  categories = [],
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  loading = false,
  error = null,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [showCompleted, setShowCompleted] = useState<boolean>(true)
  const [isCreating, setIsCreating] = useState<boolean>(false)

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task: Task) => {
      // Search filter
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = selectedCategory === 'all' || task.category_id === selectedCategory

      // Completed filter
      const matchesCompleted = showCompleted || !task.completed

      return matchesSearch && matchesCategory && matchesCompleted
    })
    .sort((a: Task, b: Task) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'priority':
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over) return

      const activeIndex = filteredTasks.findIndex(task => task.id === active.id)
      const overIndex = filteredTasks.findIndex(task => task.id === over.id)

      if (activeIndex !== overIndex) {
        onReorderTasks?.(activeIndex, overIndex)
      }
    },
    [filteredTasks, onReorderTasks]
  )

  // Handle create new task
  const handleCreateTask = useCallback(async () => {
    if (isCreating) return

    setIsCreating(true)
    try {
      const newTask: TaskFormData = {
        title: 'New Task',
        description: '',
        priority: 'medium',
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        due_date: undefined,
      }

      await onCreateTask?.(newTask)
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsCreating(false)
    }
  }, [isCreating, onCreateTask, selectedCategory])

  // Get task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t: Task) => t.completed).length,
    pending: tasks.filter((t: Task) => !t.completed).length,
    overdue: tasks.filter(
      (t: Task) => !t.completed && t.due_date && new Date(t.due_date) < new Date()
    ).length,
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load tasks
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
        <div className="relative mb-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Tasks
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage and organize your tasks efficiently
            </p>
          </div>

          {/* New Task button - positioned on the right on desktop, centered below on mobile */}
          <div className="mt-4 flex justify-center sm:absolute sm:top-0 sm:right-0 sm:mt-0">
            <button
              onClick={handleCreateTask}
              disabled={isCreating || loading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              {isCreating ? 'Creating...' : 'New Task'}
            </button>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 lg:p-6 text-center border border-gray-100 dark:border-gray-600">
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {taskStats.total}
            </div>
            <div className="text-sm lg:text-base font-medium text-gray-600 dark:text-gray-400">
              Total
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 lg:p-6 text-center border border-green-100 dark:border-green-800">
            <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
              {taskStats.completed}
            </div>
            <div className="text-sm lg:text-base font-medium text-green-700 dark:text-green-300">
              Completed
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 lg:p-6 text-center border border-blue-100 dark:border-blue-800">
            <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {taskStats.pending}
            </div>
            <div className="text-sm lg:text-base font-medium text-blue-700 dark:text-blue-300">
              Pending
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 lg:p-6 text-center border border-red-100 dark:border-red-800">
            <div className="text-3xl lg:text-4xl font-bold text-red-600 dark:text-red-400 mb-1">
              {taskStats.overdue}
            </div>
            <div className="text-sm lg:text-base font-medium text-red-700 dark:text-red-300">
              Overdue
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-4 lg:gap-6 max-w-6xl mx-auto">
          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={categoryId => setSelectedCategory(categoryId || 'all')}
            />
          </div>

          {/* Sort */}
          <div className="lg:w-44">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
            >
              <option value="created_at">Latest</option>
              <option value="title">Title</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Show Completed Toggle */}
          <div className="flex items-center lg:ml-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={e => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 w-4 h-4"
              />
              <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                Show completed
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-6xl mx-auto mb-8">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading tasks...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center p-12">
            <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Create your first task to get started!'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={handleCreateTask}
                disabled={isCreating}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {filteredTasks.map((task: Task, index: number) => (
                  <div key={task.id} className="group">
                    <SortableTaskCard
                      task={task}
                      category={categories.find((c: Category) => c.id === task.category_id)}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      isDragging={false}
                      categories={categories}
                    />
                    {index < filteredTasks.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent mx-4 my-1 opacity-60" />
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

export default TaskList
