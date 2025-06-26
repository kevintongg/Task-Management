import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Database,
  Download,
  FileText,
  HardDrive,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import {
  createBackup,
  getDataStats,
  importUserData,
  parseImportData,
  type ImportStats,
} from '../utils/dataManagement'

interface DataManagementProps {
  userId: string
  onDataUpdated: () => void
}

const DataManagement = ({ userId, onDataUpdated }: DataManagementProps) => {
  const [loading, setLoading] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [dataStats, setDataStats] = useState<{
    totalTasks: number
    totalCategories: number
    completedTasks: number
    completionRate: number
    recentTasks: number
    dataSize: number
  } | null>(null)
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addNotification } = useNotifications()

  // Handle escape key for closing modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowImportModal(false)
        setShowStatsModal(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const content = await file.text()
      const { data, errors } = parseImportData(content)

      if (errors.length > 0) {
        setImportErrors(errors)
        addNotification({
          type: 'error',
          title: 'Import Validation Failed',
          message: `Found ${errors.length} error(s) in the import file. Please fix these issues and try again.`,
          duration: 8000,
        })
        return
      }

      if (!data) {
        setImportErrors(['Invalid file format'])
        addNotification({
          type: 'error',
          title: 'Import Failed',
          message: 'Unable to parse the import file. Please check the file format.',
          duration: 6000,
        })
        return
      }

      const stats = await importUserData(data, userId, importOptions)
      setImportStats(stats)
      setImportErrors([])
      setShowImportModal(false)
      onDataUpdated()

      if (stats.errors.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Import Completed with Issues',
          message: `Imported ${stats.tasksImported} tasks and ${stats.categoriesImported} categories, but encountered ${stats.errors.length} error(s).`,
          duration: 8000,
        })
      } else {
        addNotification({
          type: 'success',
          title: 'Import Successful',
          message: `Successfully imported ${stats.tasksImported} tasks and ${stats.categoriesImported} categories.`,
          duration: 6000,
        })
      }
    } catch {
      setImportErrors([`Import failed: Unknown error`])
      addNotification({
        type: 'error',
        title: 'Import Error',
        message: 'An unexpected error occurred during import. Please try again.',
        duration: 6000,
      })
    } finally {
      setLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleExportBackup = async () => {
    try {
      setLoading(true)
      const result = await createBackup(userId)

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Backup Downloaded',
          message: 'Your data backup has been successfully downloaded.',
          duration: 5000,
        })
      } else {
        addNotification({
          type: 'error',
          title: 'Backup Failed',
          message: result.error || 'Failed to create backup. Please try again.',
          duration: 6000,
        })
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Backup Error',
        message: 'An unexpected error occurred while creating backup.',
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShowStats = async () => {
    try {
      setLoading(true)
      const stats = await getDataStats(userId)
      setDataStats(stats)
      setShowStatsModal(true)

      addNotification({
        type: 'info',
        title: 'Statistics Loaded',
        message: 'Your data statistics have been loaded successfully.',
        duration: 3000,
      })
    } catch {
      addNotification({
        type: 'error',
        title: 'Statistics Error',
        message: 'Failed to load data statistics. Please try again.',
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const clearImportResults = () => {
    setImportStats(null)
    setImportErrors([])
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Data Management Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Import, export, and manage your task data. Keep your data safe with regular backups.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Import Data */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Import Data</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Import tasks and categories from a JSON backup file.
            </p>
            <button
              onClick={() => setShowImportModal(true)}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
          </div>

          {/* Export Backup */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Export Backup</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Download a complete backup of all your tasks and categories.
            </p>
            <button
              onClick={handleExportBackup}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>

          {/* Data Statistics */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Data Overview</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              View detailed statistics about your task data and usage.
            </p>
            <button
              onClick={handleShowStats}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Results */}
      {(importStats || importErrors.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Results</h3>
            <button
              onClick={clearImportResults}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {importErrors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-red-800 dark:text-red-200">Import Errors</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                {importErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {importStats && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-green-800 dark:text-green-200">Import Summary</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    Tasks Imported
                  </div>
                  <div className="text-green-600 dark:text-green-400">
                    {importStats.tasksImported}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    Categories Imported
                  </div>
                  <div className="text-green-600 dark:text-green-400">
                    {importStats.categoriesImported}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    Tasks Skipped
                  </div>
                  <div className="text-green-600 dark:text-green-400">
                    {importStats.tasksSkipped}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    Categories Skipped
                  </div>
                  <div className="text-green-600 dark:text-green-400">
                    {importStats.categoriesSkipped}
                  </div>
                </div>
              </div>
              {importStats.errors.length > 0 && (
                <div className="mt-3">
                  <div className="font-medium text-green-800 dark:text-green-200 mb-1">Errors:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300">
                    {importStats.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Data</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Import Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={importOptions.skipDuplicates}
                    onChange={e =>
                      setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Skip duplicate items
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={importOptions.updateExisting}
                    onChange={e =>
                      setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Update existing items
                  </span>
                </label>
              </div>

              {/* File Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200 disabled:opacity-50"
                >
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {loading ? 'Processing...' : 'Choose JSON file to import'}
                  </span>
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Only JSON files exported from TaskFlow are supported.
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Stats Modal */}
      {showStatsModal && dataStats && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowStatsModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Statistics
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {dataStats.totalCategories}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Categories</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {dataStats.completionRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Completion Rate</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {dataStats.recentTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Tasks This Month</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {dataStats.dataSize} KB
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Data Size</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataManagement
