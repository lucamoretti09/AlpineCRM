# API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production:  https://your-domain.com/api
```

## Authentication

All API requests (except login, register, and public endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@alpinecrm.com",
  "password": "Admin123!"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@alpinecrm.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## Pagination

List endpoints support pagination via query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `search` | string | - | Search query |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | Sort direction (asc/desc) |

**Response format:**
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Contacts

### List Contacts

```http
GET /api/contacts?search=john&status=active&limit=20&page=1
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name, email, company |
| `status` | string | Filter by status (active, inactive, churned) |
| `owner` | string | Filter by owner user ID |
| `limit` | number | Items per page (default: 20) |
| `page` | number | Page number (default: 1) |

### Create Contact

```http
POST /api/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Maria",
  "lastName": "Popescu",
  "email": "maria@company.ro",
  "phone": "+40 721 123 456",
  "company": "TechCorp SRL",
  "position": "CEO",
  "status": "active"
}
```

### Update Contact

```http
PUT /api/contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Maria",
  "lastName": "Popescu-Ionescu",
  "status": "active"
}
```

### Delete Contact

```http
DELETE /api/contacts/:id
Authorization: Bearer <token>
```

### Get Contact Statistics

```http
GET /api/contacts/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total": 150,
    "active": 120,
    "inactive": 25,
    "churned": 5
  }
}
```

---

## Deals

### List Deals

```http
GET /api/deals?stage=negotiation&sortBy=value&sortOrder=desc
Authorization: Bearer <token>
```

### Get Kanban Board Data

```http
GET /api/deals/kanban
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "prospecting": [...deals],
    "qualification": [...deals],
    "proposal": [...deals],
    "negotiation": [...deals],
    "closed_won": [...deals],
    "closed_lost": [...deals]
  }
}
```

### Create Deal

```http
POST /api/deals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Enterprise License",
  "value": 50000,
  "stage": "prospecting",
  "probability": 20,
  "expectedCloseDate": "2026-06-15",
  "contactId": "contact-uuid"
}
```

### Update Deal Stage (Kanban Move)

```http
PATCH /api/deals/:id/stage
Authorization: Bearer <token>
Content-Type: application/json

{
  "stage": "negotiation"
}
```

### Get Deal Forecast

```http
GET /api/deals/forecast
Authorization: Bearer <token>
```

---

## Tasks

### List Tasks

```http
GET /api/tasks?status=pending&priority=high&assignedTo=user-uuid
Authorization: Bearer <token>
```

### Create Task

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Follow up with client",
  "description": "Send proposal document",
  "priority": "high",
  "dueDate": "2026-02-20",
  "type": "follow_up",
  "contactId": "contact-uuid",
  "dealId": "deal-uuid"
}
```

### Complete Task

```http
PATCH /api/tasks/:id/complete
Authorization: Bearer <token>
```

---

## Tickets

### Create Ticket

```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Login issue",
  "description": "Customer cannot log in",
  "priority": "high",
  "category": "technical",
  "contactId": "contact-uuid"
}
```

### Add Comment

```http
POST /api/tickets/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "I've investigated and found the issue.",
  "isInternal": false
}
```

---

## Appointments

### List Appointments (Date Range)

```http
GET /api/appointments?start=2026-02-01&end=2026-02-28
Authorization: Bearer <token>
```

### Create Appointment

```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Client meeting",
  "startTime": "2026-02-20T10:00:00Z",
  "endTime": "2026-02-20T11:00:00Z",
  "type": "meeting",
  "contactId": "contact-uuid"
}
```

---

## Invoices

### Create Invoice

```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "contactId": "contact-uuid",
  "dueDate": "2026-03-15",
  "items": [
    {
      "description": "Web Development",
      "quantity": 40,
      "unitPrice": 100
    },
    {
      "description": "UI Design",
      "quantity": 20,
      "unitPrice": 120
    }
  ],
  "taxRate": 19,
  "notes": "Payment due within 30 days"
}
```

---

## Emails

### Send Email

```http
POST /api/emails
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "client@example.com",
  "subject": "Proposal for your review",
  "body": "<p>Please find the proposal attached.</p>",
  "contactId": "contact-uuid"
}
```

### List Email Templates

```http
GET /api/emails/templates
Authorization: Bearer <token>
```

---

## Dashboard

### Get Dashboard Statistics

```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "contacts": { "total": 150, "active": 120 },
    "deals": {
      "total": 45,
      "open": 30,
      "won": 12,
      "pipelineValue": 500000,
      "wonValue": 180000,
      "winRate": 40
    },
    "tasks": { "total": 80, "pending": 25, "overdue": 5 },
    "tickets": { "total": 30, "open": 12 },
    "invoices": { "total": 20, "paid": 15, "totalRevenue": 150000 },
    "recentActivities": [...]
  }
}
```

---

## Rate Limiting

The API enforces rate limiting:

- **Default**: 1000 requests per 15-minute window per IP
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when the limit resets

When rate limited, the API returns:
```json
{
  "status": "error",
  "message": "Too many requests, please try again later."
}
```

---

## WebSocket Events

Connect to Socket.IO for real-time updates:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

// Listen for events
socket.on('deal:updated', (data) => { /* ... */ });
socket.on('task:assigned', (data) => { /* ... */ });
socket.on('notification:new', (data) => { /* ... */ });
socket.on('activity:created', (data) => { /* ... */ });
```
