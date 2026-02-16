# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                       Client                             │
│  React 19 + TypeScript + Tailwind CSS + Vite            │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Features  │ │  Stores  │ │   Lib    │ │Components │  │
│  │ (Pages)   │ │ (Zustand)│ │(API/Utils)│ │(Layout/UI)│  │
│  └─────┬────┘ └────┬─────┘ └────┬─────┘ └───────────┘  │
│        │           │            │                        │
│        └───────────┼────────────┘                        │
│                    │                                     │
│            TanStack React Query                          │
│                    │                                     │
└────────────────────┼─────────────────────────────────────┘
                     │
          HTTP (REST API) + WebSocket (Socket.IO)
                     │
┌────────────────────┼─────────────────────────────────────┐
│                    │         Server                       │
│  Express.js + TypeScript + Socket.IO                     │
│                    │                                     │
│  ┌─────────┐ ┌────┴─────┐ ┌──────────┐ ┌───────────┐   │
│  │ Routes   │ │Controllers│ │ Services │ │Middleware │   │
│  │          ├─┤          ├─┤(Business)├─┤(Auth/Val) │   │
│  └─────────┘ └──────────┘ └────┬─────┘ └───────────┘   │
│                                │                         │
│                          Prisma ORM                      │
│                                │                         │
└────────────────────────────────┼─────────────────────────┘
                                 │
                          ┌──────┴──────┐
                          │ PostgreSQL  │
                          │   Database  │
                          └─────────────┘
```

---

## Backend Architecture

### Request Flow

```
HTTP Request
    │
    ▼
Express Router (routes/*.ts)
    │
    ▼
Middleware Chain
    ├── auth.ts (JWT verification)
    ├── validateRequest.ts (Zod schema validation)
    └── requestLogger.ts (logging)
    │
    ▼
Controller (controllers/*.ts)
    │  - Parse request parameters
    │  - Call service methods
    │  - Format HTTP response
    │
    ▼
Service (services/*.ts)
    │  - Business logic
    │  - Data validation
    │  - Activity logging
    │  - Socket.IO events
    │
    ▼
Prisma ORM
    │
    ▼
PostgreSQL
```

### Directory Structure

```
server/src/
├── app.ts                 # Entry point - Express setup, middleware, routes
├── controllers/           # HTTP request handlers (thin layer)
│   ├── authController.ts
│   ├── contactController.ts
│   ├── dealController.ts
│   ├── taskController.ts
│   ├── ticketController.ts
│   ├── appointmentController.ts
│   ├── invoiceController.ts
│   ├── emailController.ts
│   ├── dashboardController.ts
│   └── notificationController.ts
├── services/              # Business logic layer
│   ├── authService.ts
│   ├── contactService.ts
│   ├── dealService.ts
│   ├── taskService.ts
│   ├── ticketService.ts
│   ├── appointmentService.ts
│   ├── invoiceService.ts
│   ├── emailService.ts
│   ├── analyticsService.ts
│   ├── notificationService.ts
│   └── activityService.ts
├── routes/                # Express route definitions
├── validators/            # Zod validation schemas
├── middleware/             # Express middleware
│   ├── auth.ts            # JWT authentication & RBAC
│   ├── errorHandler.ts    # Global error handling
│   ├── requestLogger.ts   # Request logging
│   ├── validate.ts        # express-validator integration
│   └── validateRequest.ts # Zod validation middleware
├── socket/                # Socket.IO setup
│   └── index.ts           # Real-time event handling
└── utils/
    └── logger.ts          # Winston logger configuration
```

### Key Design Decisions

**Service Layer Pattern**: All business logic lives in services, not controllers. Controllers are thin adapters between HTTP and the service layer. This makes the business logic testable and reusable.

**Activity Logging**: Every data-changing operation creates an activity record via `activityService`. This provides a complete audit trail visible in the dashboard.

**Real-Time Updates**: Services emit Socket.IO events when data changes. Connected clients receive instant updates without polling.

---

## Frontend Architecture

### Directory Structure

```
client/src/
├── App.tsx                # Root component with routing + lazy loading
├── main.tsx               # Entry point
├── features/              # Feature-based modules (one per page)
│   ├── dashboard/
│   │   └── components/
│   │       └── Dashboard.tsx
│   ├── contacts/
│   │   └── components/
│   │       └── ContactsPage.tsx
│   ├── deals/
│   │   └── components/
│   │       └── DealsPage.tsx
│   ├── tasks/
│   │   └── components/
│   │       └── TasksPage.tsx
│   ├── tickets/
│   │   └── components/
│   │       └── TicketsPage.tsx
│   ├── calendar/
│   │   └── components/
│   │       └── CalendarPage.tsx
│   ├── invoices/
│   │   └── components/
│   │       └── InvoicesPage.tsx
│   ├── emails/
│   │   └── components/
│   │       └── EmailsPage.tsx
│   └── settings/
│       └── components/
│           └── SettingsPage.tsx
├── components/
│   ├── layouts/           # App shell
│   │   ├── AppLayout.tsx  # Main layout (sidebar + navbar + content)
│   │   ├── Sidebar.tsx    # Collapsible navigation sidebar
│   │   └── Navbar.tsx     # Top navigation bar
│   └── common/            # Shared components
│       ├── StatsCard.tsx
│       ├── ActivityFeed.tsx
│       └── CommandPalette.tsx
├── lib/
│   ├── api.ts             # Axios instance with interceptors
│   ├── socket.ts          # Socket.IO client
│   ├── queryClient.ts     # TanStack React Query config
│   ├── utils.ts           # Utility functions
│   └── mockData.ts        # Demo data for standalone mode
├── stores/
│   ├── authStore.ts       # Authentication state (Zustand)
│   ├── themeStore.ts      # Theme + sidebar state (Zustand)
│   └── notificationStore.ts
├── hooks/
│   └── useRealtime.ts     # Socket.IO event subscriptions
└── index.css              # Design system (CSS variables, animations)
```

### State Management Strategy

```
┌─────────────────────────────────────────────┐
│              State Management                │
│                                              │
│  ┌──────────────┐    ┌───────────────────┐  │
│  │ Server State │    │   Client State    │  │
│  │ (React Query)│    │    (Zustand)      │  │
│  │              │    │                   │  │
│  │ - Contacts   │    │ - Auth (user,     │  │
│  │ - Deals      │    │   token)          │  │
│  │ - Tasks      │    │ - Theme (dark,    │  │
│  │ - Tickets    │    │   sidebar)        │  │
│  │ - Calendar   │    │ - Notifications   │  │
│  │ - Invoices   │    │   (unread count)  │  │
│  │ - Emails     │    │                   │  │
│  │ - Dashboard  │    │ Persisted to      │  │
│  │              │    │ localStorage      │  │
│  └──────────────┘    └───────────────────┘  │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         Local State (useState)       │   │
│  │                                      │   │
│  │  - Form inputs                       │   │
│  │  - Modal open/close                  │   │
│  │  - Selected items                    │   │
│  │  - Search/filter values              │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Server State** (TanStack React Query): All data fetched from the API is managed by React Query. It handles caching, refetching, pagination, and optimistic updates.

**Client State** (Zustand): UI-only state like authentication, theme preferences, and sidebar collapse state. Persisted to localStorage.

**Local State** (useState): Component-specific state like form inputs, modal visibility, and selected items.

### Code-Splitting

All feature pages are lazy-loaded using `React.lazy()`:

```
Initial Bundle (~334 KB)
├── React + React DOM
├── App shell (AppLayout, Sidebar, Navbar)
├── Zustand stores
├── Utilities

Lazy Chunks (loaded on navigation)
├── Dashboard (~24 KB)
├── ContactsPage (~18 KB)
├── DealsPage (~19 KB)
├── TasksPage (~14 KB)
├── TicketsPage (~27 KB)
├── CalendarPage (~30 KB)
├── InvoicesPage (~24 KB)
├── EmailsPage (~26 KB)
├── SettingsPage (~22 KB)
└── CommandPalette (~8 KB)

Vendor Chunks (cached separately)
├── vendor-recharts (~350 KB)
├── vendor-utils (~78 KB)
└── vendor-query (~44 KB)
```

### Styling System

The design system uses CSS custom properties for theming:

```css
/* Light theme */
:root {
  --bg-primary: #f5f7fb;
  --text-primary: #0f0d23;
  --border-color: #e0e4ef;
  /* ... */
}

/* Dark theme */
.dark {
  --bg-primary: #06070e;
  --text-primary: #eef0fa;
  --border-color: rgba(255, 255, 255, 0.06);
  /* ... */
}
```

All components use these variables via Tailwind classes like `text-[var(--text-primary)]`, making theme switching instant without re-rendering.

---

## Database Schema

### Entity Relationship Overview

```
User ─────┬──── Contact
          │        │
          │        ├──── Deal
          │        │       │
          │        ├──── Task
          │        │
          │        ├──── Ticket ──── TicketComment
          │        │
          │        ├──── Appointment
          │        │
          │        ├──── Invoice
          │        │
          │        └──── Email
          │
          ├──── Activity
          ├──── Notification
          └──── Setting

EmailTemplate (standalone)
Lead (standalone with Contact link)
```

### Key Relationships

- A **User** owns contacts, deals, tasks, tickets, appointments, invoices, and emails
- A **Contact** can have multiple deals, tasks, tickets, appointments, invoices, and emails
- A **Deal** belongs to a contact and a user (owner)
- A **Ticket** has multiple **TicketComments**
- Every data change creates an **Activity** record
- **Notifications** are per-user with read/unread status

---

## Real-Time Architecture

```
Client A                    Server                    Client B
   │                          │                          │
   │  socket.connect()        │                          │
   │─────────────────────────>│                          │
   │                          │   socket.connect()       │
   │                          │<─────────────────────────│
   │                          │                          │
   │  HTTP: Update Deal       │                          │
   │─────────────────────────>│                          │
   │                          │── dealService.update()   │
   │                          │── activityService.log()  │
   │                          │                          │
   │  200 OK                  │  emit('deal:updated')    │
   │<─────────────────────────│─────────────────────────>│
   │                          │                          │
   │                          │  React Query invalidates │
   │                          │  and refetches           │
```

Socket.IO events flow through user-specific rooms, ensuring users only receive events relevant to them.
