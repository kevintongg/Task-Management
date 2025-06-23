# TaskFlow - Modern Task Management App

A full-stack task management web application built with React, TypeScript, Vite,
Tailwind CSS, and Supabase. This project showcases modern web development
practices including real-time updates, authentication, drag-and-drop
functionality, and responsive design with full TypeScript support.

## 🚀 Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Task Management**: Create, edit, delete, and organize tasks
- **Drag & Drop**: Reorder tasks with React Beautiful DnD
- **Real-time Updates**: Live synchronization across devices
- **Categories**: Organize tasks with custom categories
- **Due Dates**: Set and track task deadlines
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Row Level Security**: Database-level security with Supabase RLS
- **Progressive Web App**: Optimized for mobile and desktop

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and context
- **TypeScript** - Full type safety and enhanced developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Beautiful DnD** - Drag and drop functionality
- **Lucide React** - Beautiful SVG icons

### Backend

- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level authorization
- **Real-time subscriptions** - Live data updates

### Deployment

- **Vercel** - Modern deployment platform
- **Serverless Functions** - API endpoints with Vercel functions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **pnpm** (recommended) or npm/yarn
- **Git** for version control
- **Supabase account** ([sign up here](https://supabase.com))
- **Vercel account** ([sign up here](https://vercel.com))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd task-management-app
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Set Up Supabase

1. **Create a new Supabase project**:

   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Fill in your project details

2. **Get your project credentials**:

   - Go to Settings > API
   - Copy your project URL and anon key

3. **Configure environment variables**:

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Set Up Database Schema

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  category UUID REFERENCES categories(id) ON DELETE SET NULL,
  due_date DATE,
  status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_order_position ON tasks(order_position);
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for categories
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
```

### 5. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:5173`

## 🚀 Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

### 4. Set Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add your Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 5. Redeploy

```bash
vercel --prod
```

## 📱 Key Features Explained

### Authentication with Supabase

- Secure user registration and login
- Session management with automatic token refresh
- Password reset functionality
- Protected routes with authentication guards

### Real-time Updates

- Live synchronization of tasks across devices
- Automatic UI updates when data changes
- Efficient subscription management to prevent memory leaks

### Drag and Drop

- Intuitive task reordering with React Beautiful DnD
- Optimistic updates for smooth user experience
- Batch updates to minimize database calls

### Row Level Security (RLS)

- Database-level security ensuring users only access their data
- Automatic filtering based on authenticated user
- Protection against data leaks and unauthorized access

## 🧪 Testing

### Run Unit Tests

```bash
pnpm test
# or
npm test
```

### Run Tests with UI

```bash
pnpm test:ui
# or
npm run test:ui
```

## 📁 Project Structure

```
src/
├── components/             # Reusable UI components
│   ├── AuthForm.tsx        # Authentication form
│   ├── CategoryFilter.tsx  # Category filtering
│   ├── Navbar.tsx          # Navigation component
│   ├── TaskCard.tsx        # Individual task display
│   └── TaskList.tsx        # Task list with drag-and-drop
├── hooks/                  # Custom React hooks
│   └── useTasks.ts         # Task management hook
├── pages/                  # Route components
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Home.tsx           # Landing page
│   ├── Login.tsx          # Login page
│   └── Signup.tsx         # Registration page
├── types/                  # TypeScript type definitions
│   └── index.ts           # Centralized type exports
├── utils/                  # Utility functions
│   ├── auth.ts            # Authentication helpers
│   ├── supabase.ts        # Supabase client config
│   └── tasks.ts           # Task CRUD operations
├── test/                   # Test configuration
│   └── setup.ts           # Test environment setup
├── App.tsx                # Main app component
└── main.tsx               # App entry point
```

## 🔧 Configuration

### Vite Configuration

The `vite.config.ts` file includes:

- React plugin for JSX/TSX support
- TypeScript configuration
- Path aliases for cleaner imports
- Build optimizations
- Development server settings

### TypeScript Configuration

The project uses TypeScript for enhanced developer experience and type safety:

#### `tsconfig.json`

- Strict type checking enabled
- Modern ES2020 target
- Path mapping for clean imports
- React JSX support

#### Type Definitions (`src/types/index.ts`)

- Comprehensive type definitions for all data models
- Supabase database types
- Component prop types
- API response types
- Custom utility types

#### Benefits of TypeScript in this project:

- **Type Safety**: Catch errors at compile time
- **Better IntelliSense**: Enhanced autocomplete and refactoring
- **Self-Documenting Code**: Types serve as inline documentation
- **Easier Refactoring**: Confident code changes with type checking
- **Team Collaboration**: Clearer interfaces and contracts

#### Development Scripts:

```bash
# Type checking
pnpm type-check

# Build with type checking
pnpm build

# Development with live type checking
pnpm dev
```

### Tailwind Configuration

The `tailwind.config.js` includes:

- Custom color palette
- Extended animations
- Responsive breakpoints
- Plugin configurations

### Supabase Configuration

- Client initialization with auth settings
- Real-time subscription setup
- Error handling utilities
- Type definitions for better DX

## 🎨 Design System

### Colors

- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for text and borders
- **Success**: Green for completed tasks
- **Warning**: Yellow for due soon
- **Error**: Red for overdue and errors

### Typography

- **Font**: Inter for clean, modern look
- **Scales**: Consistent text sizing
- **Weights**: Appropriate emphasis

### Components

- Consistent spacing and padding
- Rounded corners and shadows
- Hover and focus states
- Loading and disabled states

## 📚 Learning Resources

### Supabase

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Authentication Deep Dive](https://supabase.com/docs/guides/auth)

### React & Modern JavaScript

- [React Documentation](https://react.dev)
- [DND Kit](https://github.com/clauderic/dnd-kit)
- [Modern JavaScript Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

### Styling & UI

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev)
- [CSS Grid and Flexbox](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Deployment & DevOps

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Environment Variables Best Practices](https://12factor.net/config)

## 🐛 Debugging Tips

### Common Issues

1. **RLS Policy Errors**

   - Check if policies are correctly configured
   - Verify user authentication status
   - Use Supabase dashboard to test queries

2. **Real-time Subscription Issues**

   - Ensure tables are added to publication
   - Check for memory leaks with useEffect cleanup
   - Verify subscription filters

3. **Authentication Problems**

   - Check environment variables
   - Verify Supabase project settings
   - Test auth flows in isolation

4. **Drag and Drop Issues**
   - Ensure unique draggableId values
   - Check for React key warnings
   - Verify drop zone configuration

### Development Tools

- React Developer Tools
- Supabase Dashboard SQL editor
- Browser Network tab for API calls
- Console for real-time events

## 🔒 Security Best Practices

### Database Security

- Row Level Security (RLS) enabled on all tables
- Policies restrict access to user's own data
- Foreign key constraints maintain data integrity
- Input validation on both client and server

### Authentication

- Secure session management with Supabase Auth
- Automatic token refresh
- Protected routes and components
- Proper logout and session cleanup

### Environment Variables

- Sensitive data stored in environment variables
- Different configs for development and production
- No secrets committed to version control

## 🚀 Performance Optimizations

### Frontend

- Component lazy loading where appropriate
- Optimistic updates for better UX
- Efficient re-rendering with React keys
- Debounced search and filters

### Backend

- Database indexes on frequently queried columns
- Efficient query patterns with joins
- Real-time subscription optimization
- Batch operations for bulk updates

### Network

- Minimized API calls with intelligent caching
- Compressed assets and images
- CDN delivery via Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for
details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the
   [GitHub Issues](https://github.com/your-username/task-management-app/issues)
2. Review the documentation and debugging tips above
3. Create a new issue with detailed information

## 🎯 Future Enhancements

- [ ] Team collaboration features
- [ ] Task templates
- [ ] Time tracking
- [ ] Calendar integration
- [ ] Mobile app with React Native
- [ ] Advanced filtering and search
- [ ] Task dependencies
- [ ] Reporting and analytics
- [ ] Dark mode theme
- [ ] Offline support with PWA
