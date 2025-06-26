import { BarChart3, CheckCircle, Shield, Smartphone, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const Features = () => {
  const features = [
    {
      icon: CheckCircle,
      title: 'Task Management',
      description:
        'Create, organize, and track your tasks with ease. Set priorities, due dates, and categories.',
      details: [
        'Create unlimited tasks',
        'Set priorities (High, Medium, Low)',
        'Due date tracking',
        'Task categories and filters',
      ],
    },
    {
      icon: Zap,
      title: 'Drag & Drop Interface',
      description:
        'Intuitive drag-and-drop interface for effortless task organization and prioritization.',
      details: [
        'Reorder tasks instantly',
        'Visual task management',
        'Smooth animations',
        'Touch-friendly on mobile',
      ],
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description:
        'Work together seamlessly with real-time updates and synchronized task management.',
      details: ['Real-time sync', 'Team workspaces', 'Shared task lists', 'Activity notifications'],
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description:
        'Your data is protected with enterprise-grade security and row-level security policies.',
      details: [
        'End-to-end encryption',
        'Row-level security',
        'OAuth authentication',
        'GDPR compliant',
      ],
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your productivity with detailed analytics and progress visualization.',
      details: [
        'Completion statistics',
        'Productivity insights',
        'Progress charts',
        'Goal tracking',
      ],
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description:
        'Access your tasks anywhere, anytime with our fully responsive mobile-friendly design.',
      details: [
        'Mobile optimized',
        'Touch gestures',
        'Offline capabilities',
        'Cross-platform sync',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm backdrop-blur-sm">
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 sm:text-5xl md:text-6xl">
            Powerful Features
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover all the tools and capabilities that make TaskFlow the perfect solution for your
            productivity needs
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-6">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to experience these features?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Start using TaskFlow today and boost your productivity
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features
