# Alpine CRM

Modern, self-hostable CRM built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 19** + TypeScript
- **Vite 7** for blazing-fast builds
- **Tailwind CSS v4** with custom design system
- **Zustand** for state management
- **TanStack React Query** for data fetching
- **Recharts** for analytics visualizations
- **Lucide React** for icons

## Features

- Dashboard with real-time analytics and pipeline overview
- Contact management with search, filters, and bulk actions
- Deal pipeline with drag-and-drop Kanban board
- Task management with priority and status tracking
- Support ticket system with comments and SLA tracking
- Interactive calendar with appointment scheduling
- Invoice management with line items and status tracking
- Email system with templates and threading
- Settings with profile, appearance, and notification preferences
- Command palette (Ctrl+K) for quick navigation
- Dark/light mode with glassmorphism design
- Fully responsive layout

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
  components/
    common/       # Shared components (CommandPalette, StatsCard, ActivityFeed)
    layouts/      # AppLayout, Sidebar, Navbar
  features/
    calendar/     # Calendar & appointments
    contacts/     # Contact management
    dashboard/    # Dashboard & analytics
    deals/        # Sales pipeline
    emails/       # Email system
    invoices/     # Invoice management
    settings/     # User settings
    tasks/        # Task management
    tickets/      # Support tickets
  hooks/          # Custom React hooks
  lib/            # API client, mock data, utilities
  stores/         # Zustand state stores
```

## License

MIT
