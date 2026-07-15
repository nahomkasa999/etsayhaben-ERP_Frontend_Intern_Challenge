# EthioERP

Multi-tenant ERP built with **Next.js 16**, **Hono**, **Better Auth**, **Prisma**, **TanStack Query**, and **Zustand**.

Supports Ethiopian and Gregorian calendar fiscal years, inventory management, and employee (HR) management.

## Modules

| Module | Description |
|--------|-------------|
| Auth | Sign in / sign up via Better Auth, email/password + organizations |
| Workspace | Organization and company onboarding flow |
| Company | Company CRUD scoped to organizations |
| Fiscal Year | CRUD with activate/close/reopen, dual-calendar support |
| Inventory | CRUD with categories, SKUs, low-stock alerts |
| HR / Employees | CRUD with departments, status, bulk actions |

## Quick Start

```bash
# Install
npm install

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

See `ARCHITECTURE.md` for full setup, architecture guide, and module conventions.

## Development

```bash
npm run dev       # Start dev server
npx tsc --noEmit  # Type check
npm run lint      # ESLint
```

## Stack

Next.js 16 · React 19 · Better Auth 1.6 · Hono 4.12 · Prisma 7.8 · TanStack Query 5 · Zustand 5 · TailwindCSS 4 · shadcn/ui · Zod 4 · PostgreSQL
