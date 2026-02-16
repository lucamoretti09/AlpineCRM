# Contributing to AlpineCRM

Thank you for your interest in contributing to AlpineCRM! Every contribution helps make this the best open-source CRM available.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue.

---

## Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **PostgreSQL** 15+ ([download](https://www.postgresql.org/) or use Docker)
- **npm** v9+
- **Git** ([download](https://git-scm.com/))

### Setup

1. **Fork** the repository on GitHub

2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AlpineCRM.git
   cd AlpineCRM
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/lucamoretti09/AlpineCRM.git
   ```

4. **Install dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

5. **Set up environment**:
   ```bash
   cp .env.example server/.env
   ```
   Edit `server/.env` with your PostgreSQL credentials.

6. **Start the database** (if using Docker):
   ```bash
   docker-compose up -d postgres
   ```

7. **Run migrations and seed**:
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```

8. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

9. The app is now running at `http://localhost:5173`

---

## Development Workflow

1. **Sync with upstream** before starting work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes** following our [coding standards](#coding-standards)

4. **Test your changes**:
   ```bash
   # Type check
   cd server && npx tsc --noEmit
   cd ../client && npx tsc --noEmit

   # Build
   cd client && npm run build
   ```

5. **Commit your changes** using [conventional commits](#commit-messages)

6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** against the `main` branch

---

## Pull Request Process

1. **Fill out the PR template** completely
2. **Ensure all checks pass** (TypeScript compilation, build)
3. **Keep PRs focused** - one feature or fix per PR
4. **Update documentation** if your changes affect the public API or user-facing features
5. **Add screenshots** for UI changes
6. **Respond to review feedback** promptly

### PR Title Format

Use descriptive titles:
- `feat: add bulk export for contacts`
- `fix: resolve deal stage drag-and-drop on mobile`
- `docs: update API reference for invoice endpoints`
- `refactor: extract shared form components`

---

## Coding Standards

### TypeScript

- **Strict mode** is enabled - do not use `any` unless absolutely necessary
- Use **interfaces** for object shapes, **types** for unions/intersections
- Prefer **const assertions** and **enums** for constants
- Always type function parameters and return values for public APIs

### Backend (Express + Prisma)

- Follow the **service layer pattern**: `routes -> controllers -> services -> Prisma`
- All business logic belongs in **services**, not controllers
- Use **Zod** for request validation
- Handle errors with custom error classes from `middleware/errorHandler.ts`
- Log meaningful messages using the Winston **logger**
- Always create **activity records** for data-changing operations

### Frontend (React + Tailwind)

- Use **functional components** with hooks
- State management with **Zustand** (global state) and **useState** (local state)
- Data fetching with **TanStack React Query** (useQuery/useMutation)
- Style with **Tailwind CSS** utility classes
- Use the `cn()` utility for conditional classes
- Use **CSS variables** (`var(--text-primary)`, etc.) for theme-aware colors
- All user-facing text should be in **Romanian**

### File Organization

- Feature code goes in `client/src/features/{feature-name}/`
- Shared components go in `client/src/components/common/`
- Layout components go in `client/src/components/layouts/`
- API/utility code goes in `client/src/lib/`

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files (components) | PascalCase | `ContactsPage.tsx` |
| Files (utilities) | camelCase | `queryClient.ts` |
| Components | PascalCase | `function StatsCard()` |
| Hooks | camelCase with `use` prefix | `useRealtime()` |
| Variables/functions | camelCase | `const formatCurrency` |
| Constants | UPPER_SNAKE_CASE | `const PIPELINE_COLORS` |
| Types/Interfaces | PascalCase | `interface DealStage` |
| CSS variables | kebab-case | `--text-primary` |

---

## Commit Messages

We follow **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring (no feature/fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependencies |
| `ci` | CI/CD configuration |

### Examples

```
feat(contacts): add bulk export to CSV
fix(deals): prevent drag-and-drop on mobile touch events
docs(api): document pagination parameters
refactor(auth): extract token validation to middleware
chore(deps): update React to v19.2
```

---

## Reporting Bugs

Open an issue using the **Bug Report** template and include:

1. **Description** - What happened?
2. **Steps to Reproduce** - How can we replicate the issue?
3. **Expected Behavior** - What should have happened?
4. **Actual Behavior** - What actually happened?
5. **Screenshots** - If applicable
6. **Environment** - OS, browser, Node.js version
7. **Logs** - Any console errors or server logs

---

## Suggesting Features

Open an issue using the **Feature Request** template and include:

1. **Problem** - What problem does this solve?
2. **Proposed Solution** - How should it work?
3. **Alternatives Considered** - What other approaches did you consider?
4. **Additional Context** - Mockups, diagrams, examples

---

## Areas Where Help is Needed

We especially welcome contributions in these areas:

- **Internationalization (i18n)** - Adding support for more languages
- **Testing** - Unit tests, integration tests, E2E tests
- **Accessibility** - Improving keyboard navigation and screen reader support
- **Performance** - Optimizing database queries and frontend rendering
- **Documentation** - Improving guides, tutorials, and API docs
- **Mobile** - Improving responsive design for small screens

---

## License

By contributing to AlpineCRM, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for helping make AlpineCRM better!
