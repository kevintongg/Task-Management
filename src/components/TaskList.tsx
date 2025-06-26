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
import React, { useCallback, useState } from 'react'
import type { Task, TaskFormData, TaskListProps } from '../types'
import SortableTaskCard from './TaskCard'

// Enhanced TaskListProps to include selection functionality
interface EnhancedTaskListProps extends TaskListProps {
  selectedTasks?: Set<string>
  onSelectionChange?: (taskIds: Set<string>) => void
  showSelection?: boolean
}

const TaskList: React.FC<EnhancedTaskListProps> = React.memo(
  ({
    tasks = [],
    categories = [],
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
    onReorderTasks,
    loading = false,
    error = null,
    selectedTasks = new Set<string>(),
    onSelectionChange,
    showSelection = false,
  }) => {
    const [searchQuery, setSearchQuery] = useState<string>('')
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

        // Completed filter
        const matchesCompleted = showCompleted || !task.completed

        return matchesSearch && matchesCompleted
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
          case 'priority': {
            const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          }
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

    // Handle individual task selection
    const handleTaskSelection = (taskId: string, selected: boolean) => {
      if (!onSelectionChange) return

      const newSelection = new Set(selectedTasks)
      if (selected) {
        newSelection.add(taskId)
      } else {
        newSelection.delete(taskId)
      }
      onSelectionChange(newSelection)
    }

    // Handle create new task
    const handleCreateTask = useCallback(async () => {
      if (isCreating) return

      setIsCreating(true)
      try {
        // Set default due date to tomorrow in user's local timezone
        // Use local date calculation to avoid timezone conversion issues
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const day = today.getDate()

        const tomorrow = new Date(year, month, day + 1)
        const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(tomorrow.getDate()).padStart(2, '0')}`

        const newTask: TaskFormData = {
          title: 'New Task',
          description: '',
          priority: 'medium',
          category_id: undefined,
          due_date: tomorrowStr,
        }

        await onCreateTask?.(newTask)
      } catch (error) {
        console.error('Failed to create task:', error)
      } finally {
        setIsCreating(false)
      }
    }, [isCreating, onCreateTask])

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
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Tasks
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Manage and organize your tasks efficiently
                </p>
              </div>

              {/* New Task button - responsive positioning */}
              <div className="flex justify-center sm:justify-end">
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
          </div>

          {/* Filters and Search */}
          <div className="mt-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at">Created Date</option>
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={e => setShowCompleted(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show completed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading tasks...</span>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery || !showCompleted
                  ? 'Try adjusting your filters or search query.'
                  : "You don't have any tasks yet. Create your first task to get started!"}
              </p>
              {!searchQuery && showCompleted && (
                <button
                  onClick={handleCreateTask}
                  disabled={isCreating}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? 'Creating...' : 'Create your first task'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="p-4">
                      <SortableTaskCard
                        task={task}
                        category={categories.find(cat => cat.id === task.category_id)}
                        categories={categories}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                        isSelected={selectedTasks.has(task.id)}
                        onSelectionChange={handleTaskSelection}
                        showSelection={showSelection}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    )
  }
)

export default TaskList

