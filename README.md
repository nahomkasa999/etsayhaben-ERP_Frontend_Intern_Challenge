# EthioERP

> [**Live Demo**](https://ethio-erp.vercel.app/) — Try it instantly.

Multi-tenant ERP built with **Next.js 16**, **Hono**, **Better Auth**, **Prisma**, **TanStack Query**, and **Zustand**.

Supports Ethiopian and Gregorian calendar fiscal years, inventory management, and employee (HR) management.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Spin up a database (choose one)

# Option A — Local Prisma Postgres (easiest)
npx prisma dev --port 51213

# Option B — Cloud PostgreSQL (free, no install)
npx create-db --interactive

# 3. Copy the connection URL from step 2 into .env as DATABASE_URL
#    (see .env.example for the full list of variables)

# 4. Run migrations
npx prisma migrate dev

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/signin`.

## First-Time Flow

1. **Sign up** at `/signup`
2. **Create an organization** (you're redirected to onboarding)
3. **Create a company** within that organization
4. You land on the **dashboard**

## Development

```bash
npm run dev       # Start dev server
npx tsc --noEmit  # Type check
npm run lint      # ESLint
```

## Stack

Next.js 16 · React 19 · Better Auth 1.6 · Hono 4.12 · Prisma 7.8 · TanStack Query 5 · Zustand 5 · TailwindCSS 4 · shadcn/ui · Zod 4 · PostgreSQL
