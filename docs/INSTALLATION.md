# Installation Guide

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18.0 | v20+ LTS |
| PostgreSQL | v14 | v15+ |
| RAM | 1 GB | 2 GB+ |
| Disk Space | 500 MB | 1 GB+ |
| OS | Linux, macOS, Windows | Ubuntu 22.04 LTS |

---

## Option 1: Docker (Recommended)

The fastest way to get AlpineCRM running.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) v20+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/lucamoretti09/AlpineCRM.git
cd AlpineCRM

# 2. Create environment file
cp .env.example .env
```

Edit `.env` and set your secrets:
```env
JWT_SECRET=your-strong-random-secret-here
JWT_REFRESH_SECRET=your-strong-random-refresh-secret
POSTGRES_PASSWORD=a-secure-database-password
```

```bash
# 3. Start all services
docker-compose up -d

# 4. Check that everything is running
docker-compose ps

# 5. View logs (optional)
docker-compose logs -f
```

The application is now available:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Seeding Demo Data

```bash
docker-compose exec backend npx prisma db seed
```

### Stopping

```bash
docker-compose down

# To also remove the database volume:
docker-compose down -v
```

---

## Option 2: Manual Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- [npm](https://www.npmjs.com/) v9+

### 1. Clone the Repository

```bash
git clone https://github.com/lucamoretti09/AlpineCRM.git
cd AlpineCRM
```

### 2. Set Up the Database

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE alpine_crm;

# Exit
\q
```

### 3. Set Up the Backend

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env
```

Edit `server/.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/alpine_crm?schema=public"
JWT_SECRET="your-strong-random-secret-here"
JWT_REFRESH_SECRET="your-strong-random-refresh-secret"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed sample data (optional)
npm run db:seed

# Start the backend server
npm run dev
```

The backend is now running at `http://localhost:5000`.

### 4. Set Up the Frontend

```bash
cd ../client

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env
echo "VITE_SOCKET_URL=http://localhost:5000" >> .env

# Start the frontend dev server
npm run dev
```

The frontend is now running at `http://localhost:5173`.

### 5. Default Login Credentials

After seeding the database:

| Email | Password | Role |
|-------|----------|------|
| admin@alpinecrm.com | Admin123! | Admin |
| john@alpinecrm.com | Password123! | Manager |
| jane@alpinecrm.com | Password123! | User |
| mike@alpinecrm.com | Password123! | User |

---

## Production Deployment

### Building for Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
# Serve the dist/ folder with any static file server
```

### Environment Variables

For production, make sure to:

1. Set `NODE_ENV=production`
2. Use strong, unique values for `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. Set `FRONTEND_URL` to your actual frontend domain
4. Configure SMTP settings if you need email functionality
5. Use a secure PostgreSQL password

### Reverse Proxy (nginx)

For production, place nginx in front of the application:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## Troubleshooting

### Database connection refused
- Ensure PostgreSQL is running: `pg_isready`
- Check the `DATABASE_URL` in your `.env` file
- Verify your PostgreSQL user has access to the database

### Port already in use
- Backend default port is 5000. Change with `PORT` in `.env`
- Frontend default port is 5173. Change in `vite.config.ts`

### Prisma migration errors
```bash
# Reset the database completely
npx prisma migrate reset

# Regenerate the Prisma client
npx prisma generate
```

### Frontend can't connect to backend
- Check that the backend is running on the expected port
- Verify `VITE_API_URL` in the client `.env` file
- Check CORS settings in `FRONTEND_URL` on the backend

### Docker build fails
- Ensure Docker has enough memory allocated (minimum 2GB)
- Try rebuilding with no cache: `docker-compose build --no-cache`
