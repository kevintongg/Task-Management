import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Headphones,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Users,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 9 AM - 5 PM PST',
      action: 'Start Chat',
      actionUrl: '#',
      color: 'blue',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us your questions and get detailed responses',
      availability: 'Response within 24 hours',
      action: 'Send Email',
      actionUrl: '/contact',
      color: 'green',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our technical experts',
      availability: 'Pro & Enterprise plans only',
      action: 'Call Now',
      actionUrl: 'tel:+15551234567',
      color: 'purple',
    },
  ]

  const helpResources = [
    {
      icon: BookOpen,
      title: 'Getting Started Guide',
      description: 'Learn the basics of TaskFlow in 10 minutes',
      category: 'Documentation',
      url: '#',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      category: 'Videos',
      url: '#',
    },
    {
      icon: FileText,
      title: 'API Documentation',
      description: 'Technical documentation for developers',
      category: 'Documentation',
      url: '#',
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with other TaskFlow users',
      category: 'Community',
      url: '#',
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Answers to frequently asked questions',
      category: 'Documentation',
      url: '#',
    },
    {
      icon: FileText,
      title: 'Best Practices',
      description: 'Tips to maximize your productivity',
      category: 'Guides',
      url: '#',
    },
  ]

  const popularArticles = [
    {
      title: 'How to create your first task',
      category: 'Getting Started',
      readTime: '2 min read',
    },
    {
      title: 'Setting up team collaboration',
      category: 'Team Management',
      readTime: '5 min read',
    },
    {
      title: 'Using categories and filters effectively',
      category: 'Organization',
      readTime: '3 min read',
    },
    {
      title: 'Integrating TaskFlow with other tools',
      category: 'Integrations',
      readTime: '7 min read',
    },
    {
      title: 'Mobile app setup and features',
      category: 'Mobile',
      readTime: '4 min read',
    },
  ]

  const statusItems = [
    {
      service: 'TaskFlow Web App',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      service: 'Mobile Apps',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      service: 'API Services',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      service: 'Email Notifications',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                TaskFlow
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-6">
            <Headphones className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 sm:text-5xl md:text-6xl">
            How Can We Help?
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
            Find answers, get support, and learn how to make the most of TaskFlow.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, and more..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get Support</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose the best way to get help based on your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600"
              >
                <div
                  className={`flex items-center justify-center w-16 h-16 bg-${option.color}-100 dark:bg-${option.color}-900/30 rounded-full mx-auto mb-6`}
                >
                  <option.icon
                    className={`h-8 w-8 text-${option.color}-600 dark:text-${option.color}-400`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{option.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                  {option.availability}
                </p>
                <a
                  href={option.actionUrl}
                  className={`inline-flex items-center justify-center px-6 py-3 bg-${option.color}-600 hover:bg-${option.color}-700 text-white font-medium rounded-lg transition-colors duration-200`}
                >
                  {option.action}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Resources */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Help Resources
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Self-service resources to help you succeed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
              >
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                    <resource.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                    {resource.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Articles */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Articles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Most helpful articles from our knowledge base
            </p>
          </div>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <a
                key={index}
                href="#"
                className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Current status of all TaskFlow services
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {statusItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <item.icon className={`h-5 w-5 mr-3 ${item.color}`} />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.service}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Contact Support
            </Link>
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium rounded-lg transition-colors duration-200"
            >
              Start Live Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Support
