# EthioERP — Architecture & Handoff Guide

> **Stack:** Next.js 16.2.9 · React 19.2.4 · Better Auth 1.6.23 · Hono 4.12.30 · Prisma 7.8.0 · TanStack Query 5 · TanStack Table 8 · Zustand 5 · TailwindCSS 4 · shadcn/ui · Zod 4.4.3 · Recharts · DnD Kit

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Getting Started](#2-getting-started)
3. [Architecture Overview](#3-architecture-overview)
4. [Directory Structure](#4-directory-structure)
5. [Multi-Tenancy Model](#5-multi-tenancy-model)
6. [Authentication (Better Auth)](#6-authentication-better-auth)
7. [API Layer (Hono)](#7-api-layer-hono)
8. [Frontend Module Architecture](#8-frontend-module-architecture)
9. [Database Schema (Prisma)](#9-database-schema-prisma)
10. [State Management](#10-state-management)
11. [Middleware / Proxy](#11-middleware--proxy)
12. [Routing & Layouts](#12-routing--layouts)
13. [UI Component System](#13-ui-component-system)
14. [API Documentation](#14-api-documentation)
15. [Environment Variables](#15-environment-variables)
16. [Common Patterns](#16-common-patterns)
17. [FAQ / Troubleshooting](#17-faq--troubleshooting)

---

## 1. Project Overview

EthioERP is a multi-tenant ERP frontend built with Next.js. It supports Ethiopian and Gregorian calendar fiscal years, inventory management, and employee (HR) management. Each user belongs to an **Organization** (Better Auth tenant) and further to a **Company** within that organization, which scopes all ERP data.

### Current Modules

| Module | Status | Description |
|--------|--------|-------------|
| Auth (sign in / sign up) | Complete | Better Auth with email/password + organizations |
| Company | Complete | Company CRUD within organizations |
| Workspace | Complete | Organization management (via Better Auth) |
| Fiscal Year | Complete | CRUD + activate/close/reopen, Ethiopian & Gregorian |
| Inventory | Complete | CRUD with categories, SKUs, low-stock alerts |
| HR / Employees | Complete | CRUD with departments, status, bulk actions |

---

## 2. Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 14
- npm

### 2.1 Database Setup (Local PostgreSQL)

#### Option A — Using Prisma Postgres (easiest)

Run a local Prisma Postgres instance via the Prisma CLI:

```bash
npx prisma dev --port 51213
```

This starts a local PostgreSQL server on port 51213 with Prisma's connection pooling. The `prisma dev` command automatically provisions two databases (main + shadow) and prints the connection URL. Use that URL in your `.env`.

#### Option B — Standalone PostgreSQL

If you have PostgreSQL installed locally (or via Docker):

```bash
# Create the database
createdb ethioerp

# Create a shadow database for migrations
createdb ethioerp_shadow
```

Then update your `.env` accordingly.

#### Option C — Docker PostgreSQL (recommended for consistency)

Create a `docker-compose.yml` at the project root:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "51214:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: template1
    volumes:
      - pgdata:/var/lib/postgresql/data

  postgres-shadow:
    image: postgres:16-alpine
    ports:
      - "51215:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: template1
    volumes:
      - pgdata-shadow:/var/lib/postgresql/data

volumes:
  pgdata:
  pgdata-shadow:
```

```bash
docker compose up -d
```

### 2.2 Environment Configuration

Create `.env` in the project root:

```env
# ── Database ──────────────────────────────────────────
# Main database connection (Prisma adapter)
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"

# Shadow database (used by Prisma Migrate for detecting schema drift)
SHADOW_DATABASE_URL="postgres://postgres:postgres@localhost:51215/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"

# ── Better Auth ───────────────────────────────────────
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<generate-your-own-secret>
```

> **Generate a secret:** Run `openssl rand -hex 32` or use any 32+ character random string.

> **Never commit `.env` to git.** It is already in `.gitignore`.

### 2.3 Run Migrations

```bash
npx prisma migrate dev
```

This applies all existing migrations in `prisma/migrations/` and regenerates the Prisma client in `src/generated/prisma/`.

### 2.4 Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/signin`.

### 2.5 First-Time User Flow

1. **Sign up** at `/signup` (creates a Better Auth user)
2. **Create an organization** on the onboarding page (a tenant in Better Auth)
3. **Create a company** within that organization (scopes ERP data)
4. You are redirected to the **dashboard**

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Next.js 16 App Router                    │
│                                                                  │
│  ┌──────────────┐    ┌────────────────┐    ┌──────────────────┐  │
│  │  Pages/Layout │    │  Middleware     │    │  API (Hono)      │  │
│  │  (src/app/)   │◄──►│  (src/proxy.ts) │    │  (src/app/api/)  │  │
│  └──────┬───────┘    └────────────────┘    └────────┬─────────┘  │
│         │                                            │           │
│  ┌──────▼───────────────────────────────────────────▼───────┐   │
│  │                    Modules (src/modules/)                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │   │
│  │  │  Auth    │ │Workspace │ │Inventory │ │   HR / FY    │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │   │
│  └───────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │              Shared Components (src/shared/)               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────────────────┐  │  │
│  │  │  UI (28) │ │  Layout  │ │  lib (cn, openapi, slug)  │  │  │
│  │  └──────────┘ └──────────┘ └───────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │  Prisma ORM → PostgreSQL                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Feature-based modules** — Each domain (auth, inventory, hr, fiscal year, workspace) is a self-contained module with its own types, API routes, components, hooks, services, and stores.
- **Hono for API** — Instead of Next.js Route Handlers, the project uses Hono with `@hono/zod-openapi` for OpenAPI 3.1-compliant route definitions. This gives us type-safe request/response validation and auto-generated Swagger docs.
- **Better Auth** — Handles authentication (sign in/up, sessions) and multi-tenancy via its `organization` plugin.
- **Zustand for global state** — Only when state needs to be shared across unrelated components (e.g., department filter, bulk selection, auth user).
- **TanStack Query for server state** — All API data fetching uses `useQuery`/`useMutation`. No Redux-style stores for server data.
- **Prisma with `@prisma/adapter-pg`** — Uses the new Prisma adapter for direct PostgreSQL connections (not the traditional `@prisma/client` driver adapter).

---

## 4. Directory Structure

```
EthioERP/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Migration history
│   └── migration_lock.toml
├── src/
│   ├── app/
│   │   ├── globals.css            # Tailwind + theme variables
│   │   ├── layout.tsx             # Root layout (QueryProvider + TooltipProvider)
│   │   ├── page.tsx               # Landing page
│   │   ├── (auth)/
│   │   │   ├── layout.tsx         # Auth layout (PublicNavbar)
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx         # Main layout (TenantProvider + MainAppShell)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── hr/
│   │   │   ├── inventory/
│   │   │   ├── fiscalyear/
│   │   │   ├── profile/page.tsx
│   │   │   └── workspace/
│   │   ├── api/
│   │   │   ├── [[...route]]/route.ts   # Hono catch-all handler
│   │   │   ├── app.ts                  # OpenAPIHono app (registers all routes)
│   │   │   ├── routes/                 # Health + Swagger docs
│   │   │   ├── lib/                    # resolveActiveCompany helper
│   │   │   └── types/                  # Context types
│   │   └── onboarding/page.tsx
│   ├── generated/prisma/          # Auto-generated Prisma client
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── utils.ts               # cn() helper
│   │   ├── db.ts                  # PrismaClient singleton
│   │   ├── auth.ts                # Better Auth server config
│   │   └── auth-client.ts         # Better Auth client config
│   ├── modules/
│   │   ├── auth/                  # Auth module (PascalCase types)
│   │   ├── company/               # Company CRUD (org-level auth)
│   │   ├── fiscalyear/            # Fiscal year (camelCase, renamed store)
│   │   ├── hr/                    # Employee management
│   │   ├── inventory/             # Inventory management
│   │   └── workspace/             # Organization management
│   ├── providers/
│   │   └── QueryProvider.tsx      # TanStack Query client
│   ├── proxy.ts                   # Middleware (session + onboarding checks)
│   └── shared/
│       ├── lib/
│       │   ├── openapi.ts         # OpenAPI document config
│       │   └── slug.ts            # Slugify utility
│       ├── store/                 # Shared stores (stats counters)
│       └── components/
│           ├── ui/                # 28 shadcn/ui components
│           ├── layout/            # MainAppShell, PublicNavbar, etc.
│           ├── app-sidebar.tsx
│           ├── site-header.tsx
│           ├── page-header.tsx
│           ├── nav-main.tsx
│           ├── nav-user.tsx
│           ├── nav-secondary.tsx
│           ├── nav-documents.tsx
│           ├── section-cards.tsx
│           └── chart-area-interactive.tsx
├── .env                           # Environment variables
├── prisma.config.ts               # Prisma CLI config
├── components.json                # shadcn/ui configuration
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
└── package.json
```

---

## 5. Multi-Tenancy Model

The project uses a **two-level tenancy** system:

```
Organization (Better Auth tenant)
│
└── Company (ERP data scope)
    │
    ├── FiscalYears
    ├── InventoryItems
    └── Employees
```

### Organization

Managed by **Better Auth's Organization plugin**. Each user can belong to multiple organizations with different roles (`owner`, `admin`, `member`). The active organization is stored in the session's `activeOrganizationId`.

### Company

An application-level entity that scopes ERP data. Companies are created within organizations. The active company is stored in a cookie named `activeCompanyId`.

### TenantProvider

The `TenantProvider` at `src/modules/workspace/components/TenantProvider.tsx` syncs the Better Auth session user and the active workspace/company into two Zustand stores:
- `authStore` (app-wide user state)
- `fiscalYearStore` (fiscal-year-specific auth + tenant IDs)

### How API Routes Get Tenant Context

Every module API route calls `resolveActiveCompany(c)` which:
1. Checks the session exists (from `c.get("session")`)
2. Reads `activeOrganizationId` from the session
3. Reads the `activeCompanyId` cookie
4. Verifies the user is a member of that org
5. Verifies the company belongs to that org
6. Returns `{ ok: true, tenantId, companyId, userId }` or an error Response

---

## 6. Authentication (Better Auth)

### Server Config — `src/lib/auth.ts`

```ts
export const auth = betterAuth({
  basePath: "/api/v1/auth",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [organization({ allowUserToCreateOrganization: true })],
});
```

- All auth endpoints are mounted at `/api/v1/auth/*`
- Uses email/password authentication
- Organization plugin enabled; users can create their own orgs

### Client Config — `src/lib/auth-client.ts`

```ts
export const authClient = createAuthClient({
  basePath: "/api/v1/auth",
  plugins: [organizationClient()],
});
```

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/sign-up/email` | Register |
| POST | `/api/v1/auth/sign-in/email` | Login |
| POST | `/api/v1/auth/sign-out` | Logout |
| GET | `/api/v1/auth/session` | Get current session |
| POST | `/api/v1/auth/organization/create` | Create org |
| GET | `/api/v1/auth/organization/list` | List user's orgs |
| POST | `/api/v1/auth/organization/set-active` | Set active org |
| POST | `/api/v1/auth/organization/update` | Update org |
| ... | ... | (full Better Auth org API) |

### Auth Flow

1. User visits a protected route → `src/proxy.ts` checks the session
2. No session → redirect to `/signin`
3. Session exists but no active org → redirect to `/onboarding`
4. Session + active org but no active company → redirect to `/onboarding`
5. Everything set → render the page

---

## 7. API Layer (Hono)

### Architecture

The API is served through a single Next.js catch-all route at `src/app/api/[[...route]]/route.ts`:

```ts
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
```

All HTTP verbs are forwarded to a single **Hono** app defined in `src/app/api/app.ts`.

### App Setup (`src/app/api/app.ts`)

```ts
const app = new OpenAPIHono<{ Variables: AppVariables }>().basePath("/api/v1");
```

1. **Auth middleware** — Runs on every request, attaches `user` and `session` to context
2. **Better Auth handler** — Proxies `POST`/`GET` `/auth/*` to `auth.handler()`
3. **Module routes** — Registered via `app.openapi(routeDefinition, handler as never)` (the `as never` assertion avoids a union-type incompatibility with `@hono/zod-openapi`'s strict response type inference when handlers return both success and error responses)
4. **Swagger docs** — Served at `/api/v1/ui` and `/api/v1/doc`

### Route Pattern

Each module defines routes in `modules/<name>/api/routes/route.ts` using `@hono/zod-openapi`:

```ts
export const listEmployeesRoute = createRoute({
  method: "get",
  path: "/employees",
  tags: ["Employees"],
  summary: "List employees for the active company",
  responses: {
    200: { description: "Employees", content: { "application/json": { schema: EmployeeListResponseSchema } } },
    ...authErrorResponses,
  },
});

export const listEmployeesHandler = async (c: Context<EmployeeEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;
  try {
    const employees = await listEmployees(context.companyId);
    return c.json({ employees }, 200);
  } catch (error) {
    return repositoryErrorResponse(c, error);
  }
};
```

Routes are registered in `app.ts` with `as never` due to Hono's strict type inference with union responses:

```ts
app.openapi(listEmployeesRoute, listEmployeesHandler as never);
```

### Context Helpers

- `resolveActiveCompany(c)` — For company-scoped routes (Inventory, HR, FiscalYear). Extracts session, org, and company from cookie. Returns `{ ok: true, tenantId, companyId, userId }` or error `Response`.
- `resolveOrgContext(c)` — For org-scoped routes (Company module). Extracts session and org only. Returns `{ ok: true, tenantId }` or error `Response`.

### Error Handling

```ts
function repositoryErrorResponse(c: Context, error: unknown) {
  if (error instanceof EntityRepositoryError) {
    return c.json({ error: error.message }, error.status as never);
  }
  return c.json({ error: "Internal server error" }, 500);
}
```

### Full API Endpoint Map

| Method | Path | Module | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/health` | — | Health check |
| GET | `/api/v1/doc` | — | OpenAPI JSON |
| GET | `/api/v1/ui` | — | Swagger UI |
| POST/GET | `/api/v1/auth/*` | Auth | Better Auth handler |
| GET | `/api/v1/organizations` | Workspace | List organizations |
| POST | `/api/v1/organizations` | Workspace | Create organization |
| POST | `/api/v1/organizations/set-active` | Workspace | Set active org |
| GET | `/api/v1/companies` | Company | List companies |
| POST | `/api/v1/companies` | Company | Create company |
| GET | `/api/v1/companies/{id}` | Company | Get company |
| PATCH | `/api/v1/companies/{id}` | Company | Update company |
| DELETE | `/api/v1/companies/{id}` | Company | Delete company |
| POST | `/api/v1/companies/select` | Company | Select active company |
| GET | `/api/v1/fiscal-years` | FiscalYear | List fiscal years |
| GET | `/api/v1/fiscal-years/active` | FiscalYear | Get active FY |
| GET | `/api/v1/fiscal-years/by-date` | FiscalYear | Get FY by date |
| GET | `/api/v1/fiscal-years/{id}` | FiscalYear | Get FY by ID |
| POST | `/api/v1/fiscal-years` | FiscalYear | Create FY |
| PATCH | `/api/v1/fiscal-years/{id}` | FiscalYear | Update FY |
| POST | `/api/v1/fiscal-years/{id}/activate` | FiscalYear | Activate FY |
| POST | `/api/v1/fiscal-years/{id}/close` | FiscalYear | Close FY |
| POST | `/api/v1/fiscal-years/{id}/reopen` | FiscalYear | Reopen FY |
| DELETE | `/api/v1/fiscal-years/{id}` | FiscalYear | Delete FY |
| GET | `/api/v1/inventory-items` | Inventory | List items |
| GET | `/api/v1/inventory-items/{id}` | Inventory | Get item |
| POST | `/api/v1/inventory-items` | Inventory | Create item |
| PATCH | `/api/v1/inventory-items/{id}` | Inventory | Update item |
| DELETE | `/api/v1/inventory-items/{id}` | Inventory | Delete item |
| GET | `/api/v1/employees` | HR | List employees |
| GET | `/api/v1/employees/{id}` | HR | Get employee |
| POST | `/api/v1/employees` | HR | Create employee |
| PATCH | `/api/v1/employees/{id}` | HR | Update employee |
| DELETE | `/api/v1/employees/{id}` | HR | Delete employee |

---

## 8. Frontend Module Architecture

Every module follows the same structure:

```
modules/<name>/
├── api/
│   ├── index.ts              # Re-exports schemas
│   └── routes/route.ts       # Hono route definitions + handlers
├── components/
│   ├── <Entity>Table.tsx     # Main data table (TanStack Table)
│   ├── <Entity>Form.tsx      # Create/edit form
│   ├── <Entity>Edit.tsx      # Edit page wrapper
│   ├── Create<Entity>Dialog.tsx
│   ├── <Entity>DetailPanel.tsx  # Expandable row detail
│   ├── <Entity>Actions.tsx   # Delete with confirmation
│   ├── BulkActionBar.tsx     # Fixed bottom bulk action bar
│   ├── CategoryFilter.tsx    # (or DepartmentFilter)
│   └── SearchBar.tsx
├── hooks/
│   └── use<Entities>.ts     # TanStack Query hooks
├── services/
│   ├── <entity>Repository.ts # Prisma data access layer (server-side)
│   └── <entity>Service.ts   # Business logic / validation
├── services/
│   └── <entity>Repository.ts # Prisma data access + DTO conversion
├── store/ (optional)
│   ├── selectionStore.ts     # Bulk selection state (Zustand)
│   └── <module>FilterStore.ts # Filter state (Zustand)
└── types/
    └── index.ts              # Zod schemas + TypeScript types
```

### Layer Responsibilities

| Layer | Location | Purpose |
|-------|----------|---------|
| **Types** | `types/index.ts` | Zod schemas for forms + API responses. Used for both validation and OpenAPI doc generation. |
| **Repository** | `services/<entity>Repository.ts` | Prisma queries (findMany, create, update, delete) + DTO conversion (snake_case ↔ camelCase). Throws `EntityRepositoryError` with `status` field on failure. |
| **Service** (optional) | `services/<entity>Service.ts` | Business rules, validation, computed stats. |
| **API Routes** | `api/routes/route.ts` | Hono route definitions (`createRoute`) + handlers. Call repository functions, wrap errors via `repositoryErrorResponse`. |
| **Hooks** | `hooks/use<Entities>.ts` | TanStack Query `useQuery`/`useMutation` wrapping `@better-fetch/fetch` calls to the API. |
| **Components** | `components/` | UI components (Table, Form, Dialog, Actions, Filters, SearchBar). |
| **Store** | `store/` | Zustand for client-side global state (selection, filters). |

### Data Flow

```
User action (click, form submit)
  → React component calls hook (e.g., useCreateEmployee)
    → Hook fires fetch() (via @better-fetch/fetch) to /api/v1/employees
      → Hono handler receives request
        → resolveActiveCompany(c) validates session/tenant/company (or resolveOrgContext for org-level routes)
          → Repository function runs Prisma query with DTO conversion
            → On error: repository throws RepositoryError → handler catches → repositoryErrorResponse(c, error)
            → On success: handler returns c.json(response, status)
              → TanStack Query updates cache
                → UI re-renders
```

### Pattern: TanStack Query Hooks

```ts
// modules/hr/hooks/useEmployees.ts
export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await fetch("/api/v1/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");
      return res.json();
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEmployeeSchemaType) => {
      const res = await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create employee");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });
}
```

### Pattern: Zod Schemas for Types + OpenAPI

```ts
// modules/hr/types/index.ts
export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  department: z.nativeEnum(EmployeeDepartment),
  status: z.nativeEnum(EmployeeStatus),
  updatedAt: z.string().datetime(),
}).openapi("Employee");

export const CreateEmployeeSchema = EmployeeSchema.omit({ id: true, companyId: true, updatedAt: true });
```

### Pattern: Repository Layer

```ts
// modules/hr/services/employeeRepository.ts
export class EmployeeRepositoryError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function listEmployees(companyId: string) {
  return prisma.employee.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });
}

export async function createEmployee(companyId: string, data: CreateEmployeeSchemaType) {
  const existing = await prisma.employee.findUnique({
    where: { companyId_email: { companyId, email: data.email } },
  });
  if (existing) {
    throw new EmployeeRepositoryError("Employee with this email already exists", 409);
  }
  return prisma.employee.create({ data: { ...data, companyId } });
}
```

---

## 9. Database Schema (Prisma)

### Entity Relationship Diagram (text)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   User      │       │ Organization  │       │  Company    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │◄────┐ │ id (PK)      │◄────┐ │ id (PK)     │
│ name        │      │ │ name         │      │ │ name        │
│ email (UQ)  │      │ │ slug (UQ)    │      │ │ slug        │
│ ...         │      │ │ logo         │      │ │ orgId (FK)──┘
└─────────────┘      │ │              │      │ └─────────────┘
                     │ └──────────────┘      │       │
┌─────────────┐      │                       │       ├──────────────────┐
│   Member    │      │                       │       │                  │
├─────────────┤      │                       │  ┌────▼────┐    ┌───────▼───┐
│ id (PK)     │      │                       │  │ Fiscal  │    │ Inventory │
│ orgId (FK)──┼──────┘                       │  │ Year    │    │   Item    │
│ userId (FK)─┼────┐                         │  ├─────────┤    ├───────────┤
│ role        │    │                         │  │ id (PK) │    │ id (PK)   │
└─────────────┘    │                         │  │ tenant  │    │ company   │
                   │                         │  │ company │    │   (FK)    │
┌─────────────┐    │                         │  │ name    │    │ name      │
│  Session    │    │                         │  │ dates   │    │ sku       │
├─────────────┤    │                         │  │ status  │    │ category  │
│ id (PK)     │    │                         │  │ ⋮       │    │ quantity  │
│ userId (FK)─┼────┘                         │  └─────────┘    │ price     │
│ token (UQ)  │                              │                 │ ⋮         │
│ orgId       │                              │                 └───────────┘
└─────────────┘                              │
                                             │  ┌─────────────┐
                                             │  │  Employee   │
                                             │  ├─────────────┤
                                             │  │ id (PK)     │
                                             │  │ company     │
                                             │  │   (FK)      │
                                             │  │ name        │
                                             │  │ email       │
                                             │  │ department  │
                                             │  │ status      │
                                             │  └─────────────┘
                                             └── (User models continue
                                                  Account, Verification,
                                                  Invitation)
```

### Key Tables

| Table | Description |
|-------|-------------|
| `user` | Better Auth user accounts |
| `session` | Auth sessions with `activeOrganizationId` |
| `account` | OAuth/provider accounts |
| `organization` | Better Auth tenant (multi-tenant root) |
| `member` | User ↔ Organization membership with role |
| `invitation` | Org invitations |
| `companies` | ERP data scope (belongs to an organization) |
| `fiscal_years` | Fiscal year periods (supports Ethiopian & Gregorian) |
| `inventory_items` | Inventory with category, SKU, quantity, price |
| `employees` | Employee records with department and status |

### Uniqueness & Indexes

- `fiscal_years(tenant_id, company_id, fiscal_year_name)` — unique per company
- `companies(organizationId, slug)` — unique slug per org
- `inventory_items(companyId, sku)` — unique SKU per company
- `employees(companyId, email)` — unique email per company
- All foreign tables have indexes on their company/org foreign keys

---

## 10. State Management

### Three Layers of State

| Type | Tool | When to Use | Examples |
|------|------|-------------|---------|
| **Server state** | TanStack Query | Data fetched from the API | Employees list, inventory items, fiscal years |
| **Global client state** | Zustand | Cross-component state not from the API | Department filter, selected items, auth user |
| **Local component state** | `useState` / `useReducer` | Component-specific state | Form inputs, dialog open/close |

### Zustand Stores

| Store File | Purpose |
|------------|---------|
| `modules/auth/store/authStore.ts` | Current user (id, name, email) |
| `modules/hr/store/selectionStore.ts` | Selected employee IDs for bulk actions |
| `modules/hr/store/departmentFilterStore.ts` | Active department filter |
| `modules/inventory/store/selectionStore.ts` | Selected item IDs for bulk actions |
| `modules/inventory/store/inventoryFilterStore.ts` | Active category filter |
| `modules/fiscalyear/store/fiscalYearStore.ts` | `useTenantStore` (tenant/company IDs) + `useFiscalAuthStore` (auth user for FY) |
| `shared/store/inventoryStatsStore.ts` | Low-stock item count (global badge) |
| `shared/store/employeeStatsStore.ts` | Employees-on-leave count (global badge) |

### Store Pattern (Zustand)

```ts
import { create } from "zustand";

interface DepartmentFilterState {
  department: string;
  setDepartment: (dept: string) => void;
}

export const useDepartmentFilterStore = create<DepartmentFilterState>((set) => ({
  department: "",
  setDepartment: (department) => set({ department }),
}));
```

---

## 11. Middleware / Proxy

The file `src/proxy.ts` serves as Next.js **middleware** (applied via the `config.matcher` export).

### Matched Paths

```ts
matcher: ["/dashboard/:path*", "/fiscalyear/:path*", "/hr/:path*", "/inventory/:path*", "/profile/:path*", "/workspace/:path*"]
```

### Logic Flow

```
Request to matched path
  → Check session (auth.api.getSession)
    → No session → redirect /signin
  → Check activeOrganizationId
    → None → redirect /onboarding
  → Relaxed routes (/workspace, /profile) → allow through
  → Check activeCompanyId cookie
    → None → redirect /onboarding
  → Verify company exists & belongs to org
    → Invalid → redirect /onboarding
  → Allow request
```

---

## 12. Routing & Layouts

### Route Groups

```
src/app/
├── (auth)/           # Group: no sidebar, PublicNavbar
│   ├── signin/
│   └── signup/
├── (main)/           # Group: sidebar + site header
│   ├── dashboard/
│   ├── hr/
│   ├── inventory/
│   ├── fiscalyear/
│   ├── profile/
│   └── workspace/
├── onboarding/       # No layout group, standalone
└── api/              # Hono API
```

### Layout Hierarchy

```
RootLayout (QueryProvider + TooltipProvider)
├── AuthLayout (PublicNavbar)          → /signin, /signup
├── MainLayout (TenantProvider + MainAppShell)
│   └── Sidebar + SiteHeader + Content → /dashboard, /hr, /inventory, /fiscalyear, /profile
├── OnboardingPage (standalone)        → /onboarding
└── APILayout (none)                   → /api/*
```

### `MainAppShell.tsx` Logic

```
1. If pathname starts with /workspace → render children in a plain container (no sidebar)
2. If still loading org/company → show skeleton
3. If no complete selection → render children in plain container
4. Otherwise → SidebarProvider → AppSidebar + SiteHeader + children
```

---

## 13. UI Component System

### shadcn/ui Components (28 total)

Located in `src/shared/components/ui/`. Config file is `components.json`.

Key components used: `sidebar`, `table`, `data-table`, `dialog`, `drawer`, `select`, `button`, `input`, `badge`, `card`, `breadcrumb`, `dropdown-menu`, `sheet`, `tabs`, `toggle`, `toggle-group`, `tooltip`, `checkbox`, `separator`, `skeleton`, `sonner` (toast), `chart`, `avatar`, `label`, `textarea`.

### Theme System

- Uses CSS custom properties for colors, shadows, fonts
- Light/dark theme via `.dark` class
- TailwindCSS 4 with `@custom-variant dark`
- Fonts: Montserrat (sans), Fira Code (mono), Georgia (serif)
- Sidebar colors are independently configurable from the main theme

### Custom Components

| Component | File | Description |
|-----------|------|-------------|
| `AppSidebar` | `shared/components/app-sidebar.tsx` | Main sidebar navigation |
| `SiteHeader` | `shared/components/site-header.tsx` | Breadcrumb-based header |
| `PageHeader` | `shared/components/page-header.tsx` | Reusable title + action button |
| `MainAppShell` | `shared/components/layout/MainAppShell.tsx` | App shell with sidebar |
| `PublicNavbar` | `shared/components/layout/PublicNavbar.tsx` | Landing/auth navbar |
| `AuthNavActions` | `shared/components/layout/AuthNavActions.tsx` | Sign in/up or user menu |
| `NavMain` | `shared/components/nav-main.tsx` | Main nav group |
| `NavUser` | `shared/components/nav-user.tsx` | User dropdown |
| `SectionCards` | `shared/components/section-cards.tsx` | Dashboard stat cards |
| `ChartAreaInteractive` | `shared/components/chart-area-interactive.tsx` | Dashboard chart |

---

## 14. API Documentation

The API is documented via **Swagger UI** at:

```
http://localhost:3000/api/v1/ui
```

The OpenAPI JSON spec is at:

```
http://localhost:3000/api/v1/doc
```

Configuration is in `src/shared/lib/openapi.ts`. Routes are documented inline using `@hono/zod-openapi` — each route definition includes path, method, tags, summary, request schemas (params, body), and response schemas.

---

## 15. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma |
| `SHADOW_DATABASE_URL` | Yes | Separate PG database for Prisma Migrate |
| `BETTER_AUTH_URL` | Yes | Base URL of the app (http://localhost:3000) |
| `BETTER_AUTH_SECRET` | Yes | Secret key for session encryption (min 32 chars) |

### `.env.example`

```env
# ── Database ──────────────────────────────────────────
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"
SHADOW_DATABASE_URL="postgres://postgres:postgres@localhost:51215/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"

# ── Better Auth ───────────────────────────────────────
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-here-min-32-chars-long
```

---

## 16. Common Patterns

### Adding a New Module

1. **Database** — Add model to `prisma/schema.prisma`, run `npx prisma migrate dev --name <name>`
2. **Types** — Create `modules/<name>/types/index.ts` with Zod schemas (`.openapi("Name")` for OpenAPI, `CreateSchema = BaseSchema.omit({...})`, `UpdateSchema = CreateSchema.partial()`, array list response, `{ success: true }` for deletes)
3. **Repository** — Create `modules/<name>/services/<entity>Repository.ts` (Prisma queries + DTO conversion layer)
4. **API Routes** — Create `modules/<name>/api/routes/route.ts` with Hono route definitions + handlers. Use `resolveActiveCompany(c)` for company-level routes or `resolveOrgContext(c)` for org-level routes. Register handlers with `app.openapi(route, handler as never)`.
5. **Register routes** — Import and register in `src/app/api/app.ts` (use `as never` for handler type assertion)
6. **Hooks** — Create `modules/<name>/hooks/use<Entities>.ts` with TanStack Query hooks using `@better-fetch/fetch` with `createSchema` for type-safe API calls
7. **Components** — Create table (TanStack Table), form (reused for create/edit), dialogs, filters, search bar, bulk action bar, detail panel
8. **Stores** — Add Zustand stores if needed (selection, filters, stats counts)
9. **Pages** — Create pages in `src/app/(main)/<name>/`
10. **Middleware** — Add path to `config.matcher` in `src/proxy.ts`
11. **Sidebar** — Add navigation item in `src/shared/components/app-sidebar.tsx`

### CRUD Route Template

Every module has 5 standard routes: LIST (GET), GET (GET /:id), CREATE (POST), UPDATE (PATCH /:id), DELETE (DELETE /:id). See Inventory or HR modules as the canonical example.

### Error Handling

- Repositories throw `EntityRepositoryError` (extends `Error` with a `status` field)
- Route handlers catch these and return `c.json({ error: message }, statusCode)`
- TanStack Query hooks expose `error` state for the UI
- Forms show errors via toast (sonner) or inline messages

### Business Logic Pattern

Business rules should live in `services/<entity>Service.ts`, **not** in the repository or components. Example from `inventoryService.ts`:

```ts
export function getLowStockItems(items: InventoryItem[]) {
  return items.filter((item) => item.quantity <= item.reorderLevel);
}
```

---

## 17. FAQ / Troubleshooting

### Prisma client not found

If you see errors about missing Prisma client, regenerate:

```bash
npx prisma generate
```

### Migration issues

```bash
# Reset DB and re-run all migrations
npx prisma migrate reset

# Create a new migration after schema changes
npx prisma migrate dev --name description_of_change
```

### "No active organization" after sign in

Follow the onboarding flow: create an organization → create a company. If redirected in a loop, clear cookies for `localhost:3000` and sign in again.

### Port already in use

PostgreSQL ports `51214` and `51215` must be available. Change them in both `docker-compose.yml` and `.env` if needed.

### Better Auth URL mismatch

`BETTER_AUTH_URL` must match the actual app URL (including port). For local dev: `http://localhost:3000`.

### HMR / Prisma Client stale

The `src/lib/db.ts` file handles HMR by checking if the global Prisma client has the `employee` delegate. If you add new models and see "unknown model" errors, restart the dev server.

### Lint & TypeCheck

```bash
npm run lint          # ESLint
npx tsc --noEmit     # TypeScript check
```

---

> **Pro tip:** The Inventory and HR modules are the canonical reference implementations. When in doubt about patterns, folder structure, or conventions, look at `src/modules/inventory/` or `src/modules/hr/`.
