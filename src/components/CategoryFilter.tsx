import { Listbox, Transition } from '@headlessui/react'
import { Check, ChevronDown, Plus, Tag } from 'lucide-react'
import React, { Fragment } from 'react'
import type { Category, CategoryFilterProps } from '../types'

interface ExtendedCategoryFilterProps
  extends Omit<CategoryFilterProps, 'onCreateCategory' | 'taskCounts'> {
  onCreateCategory?: () => void
  showCreateOption?: boolean
  className?: string
}

const CategoryFilter: React.FC<ExtendedCategoryFilterProps> = ({
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  onCreateCategory,
  showCreateOption = false,
  className = '',
}) => {
  // Add "All Categories" option
  const allOptions = [{ id: 'all', name: 'All Categories', color: '#6b7280' }, ...categories]

  const selectedOption = allOptions.find(cat => cat.id === selectedCategory) || allOptions[0]

  const handleChange = (category: { id: string; name: string; color: string }) => {
    if (category.id === 'create-new' && onCreateCategory) {
      onCreateCategory()
    } else {
      onCategoryChange?.(category.id)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Listbox value={selectedOption} onChange={handleChange}>
        {({ open }) => (
          <>
            <Listbox.Button className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <span className="flex items-center">
                <div
                  className="flex-shrink-0 h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: selectedOption.color }}
                />
                <span className="block truncate text-gray-900 dark:text-white">
                  {selectedOption.name}
                </span>
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                    open ? 'transform rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-150"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-700 overflow-auto focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-700 origin-top transform transition-all duration-100">
                {allOptions.map(category => (
                  <Listbox.Option
                    key={category.id}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors duration-100 ${
                        active
                          ? 'text-white bg-blue-600'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`
                    }
                    value={category}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                          <span
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                          >
                            {category.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                              active ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}

                {/* Create new category option */}
                {showCreateOption && onCreateCategory && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                    <Listbox.Option
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors duration-100 ${
                          active
                            ? 'text-white bg-green-600'
                            : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`
                      }
                      value={{ id: 'create-new', name: 'Create New Category', color: '#10b981' }}
                    >
                      {({ active }) => (
                        <div className="flex items-center">
                          <Plus
                            className={`flex-shrink-0 h-4 w-4 mr-2 ${
                              active ? 'text-white' : 'text-green-600 dark:text-green-400'
                            }`}
                          />
                          <span className="block truncate font-medium">Create New Category</span>
                        </div>
                      )}
                    </Listbox.Option>
                  </>
                )}
              </Listbox.Options>
            </Transition>
          </>
        )}
      </Listbox>
    </div>
  )
}

// Simple version without Headless UI for basic use cases
export const SimpleCategoryFilter: React.FC<{
  categories: Category[]
  selectedCategory?: string
  onCategoryChange?: (categoryId: string) => void
  className?: string
}> = ({ categories = [], selectedCategory = 'all', onCategoryChange, className = '' }) => {
  return (
    <select
      value={selectedCategory}
      onChange={e => onCategoryChange?.(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
    >
      <option value="all">All Categories</option>
      {categories.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  )
}

// Category badge component for displaying category info
export const CategoryBadge: React.FC<{
  category?: Category | null
  size?: 'xs' | 'sm' | 'md'
}> = ({ category, size = 'sm' }) => {
  if (!category) return null

  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-2.5 py-1.5',
    md: 'text-base px-3 py-2',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: `${category.color}40`,
      }}
    >
      <Tag className="h-3 w-3 mr-1" />
      {category.name}
    </span>
  )
}

export default CategoryFilter
