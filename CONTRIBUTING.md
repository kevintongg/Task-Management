# Contributing to TaskFlow

Thank you for your interest in contributing to TaskFlow! This document provides
guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of
Conduct. By participating, you are expected to uphold this code. Please report
unacceptable behavior to the project maintainers.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm/yarn
- Git
- Supabase account (for database access)

### Development Setup

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/your-username/task-management-app.git
   cd task-management-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Run tests**
   ```bash
   pnpm test
   ```

## 🔄 Contributing Process

### 1. Choose What to Work On

- Check existing
  [issues](https://github.com/your-username/task-management-app/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Create a new issue if you want to propose a new feature

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run all tests
pnpm test

# Run linting
pnpm lint

# Run type checking (if applicable)
pnpm type-check

# Test the build
pnpm build
```

### 5. Commit Your Changes

Use conventional commit messages:

```bash
git add .
git commit -m "feat: add task priority feature"
```

#### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**

```
feat(auth): add password reset functionality
fix(tasks): resolve drag and drop ordering issue
docs(readme): update installation instructions
test(components): add TaskCard component tests
```

## 📝 Coding Standards

### JavaScript/React

- Use functional components with hooks
- Prefer arrow functions for component definitions
- Use descriptive variable and function names
- Keep components small and focused
- Use PropTypes or TypeScript for prop validation

### Code Style

- **Formatting**: Prettier handles most formatting
- **Linting**: ESLint enforces code quality rules
- **Naming Conventions**:
  - Components: PascalCase (`TaskCard.jsx`)
  - Functions/Variables: camelCase (`fetchTasks`)
  - Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
  - Files: kebab-case for utilities (`task-utils.js`)

### CSS/Styling

- Use Tailwind CSS utility classes
- Create custom components for reusable patterns
- Follow mobile-first responsive design
- Use semantic color names from the theme

### File Organization

```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global styles and themes
└── test/               # Test utilities and setup
```

## 🧪 Testing Guidelines

### Writing Tests

- Write tests for all new features
- Test both happy paths and edge cases
- Use descriptive test names
- Mock external dependencies (Supabase, APIs)

### Test Structure

```javascript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  })

  it('should render correctly', () => {
    // Test implementation
  })

  it('should handle user interactions', () => {
    // Test implementation
  })

  afterEach(() => {
    // Cleanup
  })
})
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test TaskCard.test.jsx
```

## 📤 Submitting Changes

### Pull Request Process

1. **Update your branch**

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Push your changes**

   ```bash
   git push origin your-feature-branch
   ```

3. **Create a Pull Request**
   - Go to GitHub and create a PR from your fork
   - Use a descriptive title and fill out the PR template
   - Link any related issues

### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots to help explain your changes

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to hard-to-understand areas
- [ ] Documentation updated
- [ ] No new warnings introduced
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected behavior** vs actual behavior
4. **Environment details** (browser, OS, Node version)
5. **Screenshots** or error messages if applicable

### Bug Report Template

```markdown
**Describe the bug** A clear description of what the bug is.

**To Reproduce** Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior** A clear description of what you expected to happen.

**Screenshots** If applicable, add screenshots to help explain your problem.

**Environment:**

- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**Additional context** Add any other context about the problem here.
```

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with clear use cases
4. **Consider alternatives** you've explored

### Feature Request Template

```markdown
**Is your feature request related to a problem?** A clear description of what
the problem is.

**Describe the solution you'd like** A clear description of what you want to
happen.

**Describe alternatives you've considered** A clear description of alternative
solutions or features you've considered.

**Additional context** Add any other context or screenshots about the feature
request here.
```

## 📚 Additional Resources

### Documentation

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)

### Tools

- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Supabase Dashboard](https://app.supabase.com)

### Community

- [GitHub Discussions](https://github.com/your-username/task-management-app/discussions)
- [Discord Server](#) (if applicable)

## ❓ Questions?

If you have questions that aren't covered in this guide:

1. Check the [README](./README.md)
2. Search existing
   [issues](https://github.com/your-username/task-management-app/issues)
3. Create a new issue with the `question` label
4. Reach out to maintainers

Thank you for contributing to TaskFlow! 🎉
