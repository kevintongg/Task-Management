# Project Guide for Claude

This document provides context and instructions for the Claude agent working on this project.

## 1. Project Overview

This is a full-stack task management web application built with a modern tech stack. It uses React for the frontend, Supabase for the backend (database, authentication), and is styled with Tailwind CSS.

- **Frontend:** React, Vite, TypeScript
- **Backend & Auth:** Supabase
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **Testing:** Vitest, React Testing Library
- **Linting & Formatting:** ESLint, Prettier

## 2. Key Commands

All commands should be run using `pnpm`:

- `pnpm install`: Installs all project dependencies.
- `pnpm dev`: Starts the Vite development server, typically on `http://localhost:5173`.
- `pnpm build`: Compiles the TypeScript code and builds the application for production in the `dist/` directory.
- `pnpm lint`: Runs ESLint to check for code quality and style issues.
- `pnpm type-check`: Runs the TypeScript compiler (`tsc`) to check for any type errors in the codebase.
- `pnpm test`: Runs the unit and component test suite using Vitest.

## 3. Project Structure

The `src/` directory is organized as follows:

- `src/assets/`: Static assets like images and SVGs.
- `src/components/`: Reusable React components used throughout the application (e.g., `Button`, `Modal`, `TaskCard`).
- `src/contexts/`: React Context providers for global state management (e.g., `AuthContext.tsx`, `ThemeContext.tsx`).
- `src/hooks/`: Custom React hooks for shared logic (e.g., `useAuth.ts`, `useTasks.ts`).
- `src/pages/`: Top-level components that correspond to application routes (e.g., `Dashboard.tsx`, `Login.tsx`).
- `src/types/`: Shared TypeScript type definitions.
- `src/utils/`: Utility functions, particularly for interacting with the Supabase backend (e.g., `supabase.ts`, `auth.ts`, `tasks.ts`).

## 4. Development Workflow

1.  **Setup:** Run `pnpm install` to install dependencies.
2.  **Environment:** Copy the `env.example` file to a new `.env` file and add your Supabase project URL and anon key.
3.  **Run:** Use `pnpm dev` to start the development server.
4.  **Verification:** Before committing changes, always run `pnpm lint` and `pnpm type-check` to ensure the code is clean and type-safe.

## 5. Architectural Notes

- **Authentication:** Auth is handled by Supabase. All authentication logic is centralized in `src/utils/auth.ts`. The `AuthContext` provides the user session state to the application. Use the `ProtectedRoute` and `PublicRoute` components to manage access to routes.
- **State Management:** For global state (auth, theme), we use React Context. For component-level state, use standard React hooks like `useState`.
- **Styling:** The project uses Tailwind CSS for styling. Prefer utility classes over custom CSS. Theme customizations are defined in `tailwind.config.js`.
- **Code Quality:** The project is configured with strict ESLint and Prettier rules. Please adhere to these standards.

## 6. Task Management

- **Update TODO.md:** After every significant update, please review and update the `TODO.md` file to reflect the current status of the project. This includes adding new tasks, marking tasks as complete, or updating the scope of existing tasks.
