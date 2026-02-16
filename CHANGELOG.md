# Changelog

All notable changes to AlpineCRM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-17

### Added

#### Backend
- Express.js + TypeScript server with full REST API
- PostgreSQL database with Prisma ORM (15 models)
- JWT authentication with register, login, logout, password reset
- Role-based access control (Admin, Manager, User)
- Contact management API (CRUD, search, filter, bulk import, tags, lead scoring)
- Deal/sales pipeline API (CRUD, Kanban grouping, stage transitions, forecasting)
- Task management API (CRUD, completion, priority, overdue detection)
- Ticket system API (CRUD, comments, auto-numbering)
- Appointment/calendar API (CRUD, date range filtering)
- Invoice management API (CRUD, auto-numbering, financial statistics)
- Email integration API (send, templates, open/click tracking)
- Dashboard analytics API (stats, pipeline, revenue, top performers)
- Notification system API (CRUD, unread count, mark as read)
- Activity logging service for audit trail
- Socket.IO real-time events for live updates
- Zod validation schemas for all endpoints
- Rate limiting (1000 req/15min)
- Security headers with Helmet
- Winston logging with file and console transports
- Database seed script with sample data
- Docker support with multi-stage build

#### Frontend
- React 19 + TypeScript + Vite frontend
- Tailwind CSS v4 design system with dark/light mode
- 9 fully implemented feature pages:
  - Dashboard with stats cards, pipeline chart, activity feed, upcoming tasks
  - Contacts page with search, filters, CRUD, avatar gradients
  - Deals page with Kanban board + list view, drag-and-drop
  - Tasks page with status tracking, priority levels, completion
  - Tickets page with comments, status workflow, priority
  - Calendar page with monthly view, appointment management
  - Invoices page with line items, tax calculation, status tracking
  - Emails page with templates, compose, tracking indicators
  - Settings page with profile, account, appearance, notifications tabs
- Collapsible sidebar with animated navigation
- Navbar with search, theme toggle, notifications dropdown, user menu
- Command Palette (Cmd/Ctrl+K) with search and quick actions
- Activity feed component with real-time updates
- Stats cards with animated shimmer effects
- Glassmorphism UI with premium animations
- Code-splitting with lazy loading for all pages
- Zustand stores for auth, theme, and notifications
- TanStack React Query for data fetching with retry logic
- Socket.IO client for real-time updates
- Mock data system for standalone demo
- Error handling with Romanian toast messages
- Responsive design for desktop and mobile
- Romanian language throughout the UI

#### Infrastructure
- Docker Compose setup (PostgreSQL, backend, frontend with nginx)
- GitHub Actions CI/CD pipeline (lint, build, Docker build test)
- Vercel deployment configuration
- Environment variable templates (.env.example)

#### Documentation
- Comprehensive README with features, setup, API reference
- Contributing guide with development workflow
- Code of Conduct (Contributor Covenant)
- Security policy
- Architecture documentation
- Installation guide
- MIT License
