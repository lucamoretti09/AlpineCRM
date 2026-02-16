# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | Yes      |

## Reporting a Vulnerability

If you discover a security vulnerability in AlpineCRM, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email security concerns to the project maintainers or open a private security advisory on GitHub.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix**: Depending on severity, typically within 2 weeks for critical issues

## Security Measures

AlpineCRM implements the following security measures:

### Authentication & Authorization
- JWT-based authentication with token expiration
- Bcrypt password hashing (12 salt rounds)
- Role-based access control (Admin, Manager, User)
- Secure token refresh mechanism

### API Security
- Rate limiting (1000 requests per 15 minutes per IP)
- Helmet.js security headers
- CORS configuration with allowed origins
- Request body size limits (10MB)
- Input validation with Zod schemas

### Data Protection
- Prisma ORM prevents SQL injection
- React auto-escapes output (XSS prevention)
- Environment variables for sensitive configuration
- No secrets stored in source code

### Infrastructure
- Docker containers with non-root users
- HTTPS recommended for production
- Database connection via environment variables

## Best Practices for Self-Hosting

1. **Always change default secrets** - Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
2. **Use HTTPS** - Deploy behind a reverse proxy (nginx/Caddy) with TLS
3. **Restrict database access** - Don't expose PostgreSQL to the public internet
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Enable firewall rules** - Only expose ports 80/443 publicly
6. **Back up your database** - Set up automated PostgreSQL backups
