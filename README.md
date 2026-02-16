<p align="center">
  <img src="https://img.shields.io/badge/AlpineCRM-Modern%20Self--Hosted%20CRM-4F46E5?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTMgOSAzLTMgMy0zIDQgNCA0LTQgMy0zIDMgMyIvPjxwYXRoIGQ9Ik0zIDE1djRjMCAxLjEuOSAyIDIgMmgxNCIvPjwvc3ZnPg==" alt="AlpineCRM" />
</p>

<h1 align="center">AlpineCRM</h1>

<p align="center">
  <strong>The modern, self-hostable CRM for teams that value data ownership and beautiful design.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

---

## Overview

AlpineCRM is a **full-featured, open-source CRM** built for small-to-medium businesses and sales teams who want complete control over their data. Unlike expensive SaaS CRMs, AlpineCRM can be self-hosted with a single `docker-compose up` command.

### Why AlpineCRM?

| Feature | AlpineCRM | Salesforce | HubSpot |
|---------|-----------|------------|---------|
| Self-hosted | Yes | No | No |
| Data ownership | 100% yours | Vendor-locked | Vendor-locked |
| Real-time collaboration | Built-in | Add-on | Limited |
| Dark mode | Native | No | Limited |
| Pricing | Free (OSS) | $25+/user/mo | $45+/user/mo |
| Setup time | < 5 minutes | Weeks | Days |
| Modern tech stack | Yes | Legacy | Mixed |

---

## Features

### Contact Management
- Full CRUD with search, filtering, and sorting
- Lead scoring and lifecycle tracking
- Custom fields and tags
- Bulk import support
- Activity timeline per contact

### Sales Pipeline
- Visual Kanban board with drag-and-drop
- 6 pipeline stages: Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
- Auto-probability calculation per stage
- Deal forecasting and analytics
- Revenue tracking and win rate metrics

### Task Management
- Create, assign, and track tasks
- Priority levels (Low, Medium, High, Urgent)
- Due date tracking with overdue alerts
- Task types: Task, Call, Meeting, Email, Follow-up
- Link tasks to contacts and deals

### Ticket System
- Customer support ticket management
- Priority and status workflow
- Internal and external comment threads
- SLA tracking
- Category-based organization

### Calendar & Appointments
- Monthly calendar view with appointment visualization
- Create and manage appointments
- Link appointments to contacts and deals
- All-day event support
- Timezone-aware scheduling

### Invoicing
- Create professional invoices with line items
- Auto-calculate subtotals, tax, and totals
- Invoice status tracking: Draft, Sent, Viewed, Paid, Overdue
- Unique invoice numbering
- Link invoices to contacts and deals

### Email Integration
- Send emails directly from the CRM
- Email templates with variables
- Open and click tracking
- Email threading
- Attachment support

### Real-Time Collaboration
- Live updates across all connected clients via Socket.IO
- Real-time notification system
- Activity feed with live updates
- See teammates' changes instantly

### Dashboard & Analytics
- Key metrics at a glance (deals, revenue, contacts, tasks)
- Sales pipeline visualization
- Activity timeline
- Upcoming tasks widget
- Top performers leaderboard

### Additional Features
- **Command Palette** (Cmd/Ctrl+K) for quick navigation and actions
- **Dark/Light mode** with system preference detection
- **Responsive design** for desktop and mobile
- **JWT authentication** with secure token refresh
- **Role-based access** (Admin, Manager, User)
- **Rate limiting** and security headers
- **Docker deployment** for easy self-hosting

---

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **ORM**: Prisma with PostgreSQL
- **Auth**: JWT with bcrypt password hashing
- **Real-time**: Socket.IO
- **Email**: Nodemailer (SMTP)
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, rate limiting

### Frontend
- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (persist middleware)
- **Data Fetching**: TanStack React Query
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Charts**: Recharts
- **Real-time**: Socket.IO Client

### Infrastructure
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: Vercel-ready
- **Backend Hosting**: Railway/Render-ready

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) 15+ (or use Docker)
- [npm](https://www.npmjs.com/) v9+

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/AlpineCRM.git
cd AlpineCRM

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# The app will be available at:
# Frontend: http://localhost:80
# Backend API: http://localhost:5000
```

### Option 2: Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/AlpineCRM.git
cd AlpineCRM
```

**Backend Setup:**
```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp ../.env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database (optional - adds sample data)
npx prisma db seed

# Start development server
npm run dev
```

**Frontend Setup:**
```bash
cd client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Default Credentials (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@alpinecrm.com | Admin123! | Admin |
| john@alpinecrm.com | Password123! | Manager |
| jane@alpinecrm.com | Password123! | User |
| mike@alpinecrm.com | Password123! | User |

---

## Project Structure

```
AlpineCRM/
├── server/                    # Backend application
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── validators/        # Zod validation schemas
│   │   ├── routes/            # Express routes
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   ├── socket/            # Socket.IO real-time handlers
│   │   ├── utils/             # Logger, helpers
│   │   └── index.ts           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (13 models)
│   │   └── seed.ts            # Sample data seeder
│   ├── Dockerfile
│   └── package.json
│
├── client/                    # Frontend application
│   ├── src/
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Login, register, password reset
│   │   │   ├── dashboard/     # Dashboard with analytics
│   │   │   ├── contacts/      # Contact management
│   │   │   ├── deals/         # Sales pipeline (Kanban + List)
│   │   │   ├── tasks/         # Task management
│   │   │   ├── tickets/       # Support tickets
│   │   │   ├── calendar/      # Calendar & appointments
│   │   │   ├── invoices/      # Invoicing
│   │   │   ├── emails/        # Email integration
│   │   │   └── settings/      # User & app settings
│   │   ├── components/
│   │   │   ├── layouts/       # AppLayout, Sidebar, Navbar
│   │   │   ├── common/        # CommandPalette, ActivityFeed, StatsCard
│   │   │   └── ui/            # Reusable UI primitives
│   │   ├── lib/               # API client, Socket.IO, utils
│   │   ├── stores/            # Zustand state stores
│   │   ├── hooks/             # Custom React hooks
│   │   └── App.tsx            # Root component with routing
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml         # Full-stack Docker setup
├── .github/workflows/         # CI/CD pipelines
├── .env.example               # Environment variables template
└── README.md                  # This file
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/logout` | Logout (invalidate token) |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/password` | Update password |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List contacts (with search/filter) |
| GET | `/api/contacts/:id` | Get contact details |
| POST | `/api/contacts` | Create a contact |
| PUT | `/api/contacts/:id` | Update a contact |
| DELETE | `/api/contacts/:id` | Delete a contact |
| GET | `/api/contacts/stats` | Get contact statistics |
| POST | `/api/contacts/import` | Bulk import contacts |

### Deals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deals` | List deals (with filters) |
| GET | `/api/deals/kanban` | Get deals grouped by stage |
| GET | `/api/deals/:id` | Get deal details |
| POST | `/api/deals` | Create a deal |
| PUT | `/api/deals/:id` | Update a deal |
| PATCH | `/api/deals/:id/stage` | Update deal stage (Kanban) |
| DELETE | `/api/deals/:id` | Delete a deal |
| GET | `/api/deals/stats` | Get deal statistics |
| GET | `/api/deals/forecast` | Get revenue forecast |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| GET | `/api/tasks/:id` | Get task details |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| PATCH | `/api/tasks/:id/complete` | Mark task as completed |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tasks/stats` | Get task statistics |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List tickets (with filters) |
| GET | `/api/tickets/:id` | Get ticket with comments |
| POST | `/api/tickets` | Create a ticket |
| PUT | `/api/tickets/:id` | Update a ticket |
| DELETE | `/api/tickets/:id` | Delete a ticket |
| POST | `/api/tickets/:id/comments` | Add comment to ticket |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments (date range) |
| GET | `/api/appointments/:id` | Get appointment details |
| POST | `/api/appointments` | Create an appointment |
| PUT | `/api/appointments/:id` | Update an appointment |
| DELETE | `/api/appointments/:id` | Delete an appointment |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices (with filters) |
| GET | `/api/invoices/:id` | Get invoice details |
| POST | `/api/invoices` | Create an invoice |
| PUT | `/api/invoices/:id` | Update an invoice |
| DELETE | `/api/invoices/:id` | Delete an invoice |
| GET | `/api/invoices/stats` | Get invoice statistics |

### Emails
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emails` | List emails |
| GET | `/api/emails/:id` | Get email details |
| POST | `/api/emails` | Send an email |
| GET | `/api/emails/templates` | List email templates |
| POST | `/api/emails/templates` | Create email template |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List user notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/pipeline` | Get pipeline overview |
| GET | `/api/dashboard/activities` | Get recent activities |
| GET | `/api/dashboard/top-performers` | Get top performers |

---

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/alpine_crm` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | (required) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | (required for emails) |
| `SMTP_PASS` | SMTP password | (required for emails) |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` (10MB) |
| `UPLOAD_DIR` | Upload directory | `./uploads` |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO URL | `http://localhost:5000` |

---

## Database Schema

AlpineCRM uses **13 database models** covering all CRM needs:

- **User** - Authentication, roles, preferences
- **Contact** - Customer/prospect information with custom fields
- **Lead** - Lead tracking with conversion workflow
- **Deal** - Sales pipeline with stages and probabilities
- **Task** - Task management with assignments and recurrence
- **Ticket** - Support tickets with SLA tracking
- **TicketComment** - Threaded comments on tickets
- **Appointment** - Calendar events with attendees
- **Invoice** - Invoicing with line items and tax
- **Email** - Email tracking with open/click metrics
- **Activity** - Comprehensive audit trail
- **Notification** - User notification system
- **Setting** - Application configuration
- **EmailTemplate** - Reusable email templates

---

## Deployment

### Vercel (Frontend)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the root directory to `client`
4. Add environment variables:
   - `VITE_API_URL` = your backend API URL
   - `VITE_SOCKET_URL` = your backend URL
5. Deploy

### Railway (Backend)

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL database
3. Add a new service from your GitHub repo
4. Set the root directory to `server`
5. Add environment variables from `.env.example`
6. Deploy

### Docker (Self-Hosted)

```bash
# Production deployment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Development

### Running Tests

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

### Database Management

```bash
# Generate Prisma client after schema changes
cd server && npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio
```

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- Feature-based directory structure
- Service layer pattern on backend

---

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/AlpineCRM.git
cd AlpineCRM

# Install all dependencies
cd server && npm install && cd ../client && npm install && cd ..

# Set up environment
cp .env.example .env

# Start PostgreSQL (Docker)
docker-compose up -d postgres

# Run migrations
cd server && npx prisma migrate deploy && npx prisma db seed

# Start backend (terminal 1)
cd server && npm run dev

# Start frontend (terminal 2)
cd client && npm run dev
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Esc` | Close modals and overlays |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [React](https://react.dev), [Express](https://expressjs.com), [Prisma](https://prisma.io), and [Tailwind CSS](https://tailwindcss.com)
- Icons by [Lucide](https://lucide.dev)
- Charts by [Recharts](https://recharts.org)

---

<p align="center">
  <strong>Built with care for teams that deserve better tools.</strong>
</p>
