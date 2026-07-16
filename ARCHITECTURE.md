# EthioERP — Architecture Guide

> **Stack:** Next.js 16.2.9 · React 19.2.4 · Better Auth 1.6.23 · Hono 4.12.30 · Prisma 7.8.0 · TanStack Query 5 · TanStack Table 8 · Zustand 5 · TailwindCSS 4 · shadcn/ui · Zod 4.4.3 · Recharts · DnD Kit

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Directory Structure](#3-directory-structure)
4. [Multi-Tenancy Model](#4-multi-tenancy-model)
5. [Authentication (Better Auth)](#5-authentication-better-auth)
6. [API Layer (Hono)](#6-api-layer-hono)
7. [Frontend Module Architecture](#7-frontend-module-architecture)
8. [Database Schema (Prisma)](#8-database-schema-prisma)
9. [State Management](#9-state-management)
10. [Middleware / Proxy](#10-middleware--proxy)
11. [Routing & Layouts](#11-routing--layouts)
12. [UI Component System](#12-ui-component-system)
13. [API Documentation](#13-api-documentation)
14. [Environment Variables](#14-environment-variables)
15. [Common Patterns](#15-common-patterns)

---

## 1. Project Overview

EthioERP is a multi-tenant ERP built with Next.js. It supports Ethiopian and Gregorian calendar fiscal years, inventory management, and employee (HR) management. Each user belongs to an **Organization** (Better Auth tenant) and further to a **Company** within that organization, which scopes all ERP data.

### Current Modules

| Module | Status | Description |
|--------|--------|-------------|
| Auth | Complete | Better Auth with email/password + organizations |
| Workspace | Complete | Organization management via Better Auth org plugin |
| Company | Complete | Company CRUD within organizations |
| Fiscal Year | Complete | CRUD + activate/close/reopen, Ethiopian & Gregorian calendars |
| Inventory | Complete | CRUD with categories, SKUs, low-stock alerts, bulk actions |
| HR / Employees | Complete | CRUD with departments, status, search, bulk actions |

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Next.js 16 App Router                          │
│                                                                      │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐  │
│  │  Pages/Layout │    │  Middleware       │    │  API (Hono)        │  │
│  │  (src/app/)   │◄──►│  (src/proxy.ts)   │    │  (src/app/api/)    │  │
│  └──────┬───────┘    └──────────────────┘    └────────┬───────────┘  │
│         │                                              │             │
│  ┌──────▼─────────────────────────────────────────────▼─────────┐   │
│  │                   Modules (src/modules/)                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│  │  │  Auth    │ │Workspace │ │Inventory │ │  HR / FY / Co.   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                          │                                             │
│  ┌───────────────────────▼─────────────────────────────────────────┐  │
│  │              Shared Components (src/shared/)                      │  │
│  │  ┌────────────┐ ┌──────────────┐ ┌───────────────────────────┐  │  │
│  │  │  UI (26+)  │ │  Layout      │ │  lib (cn, openapi, slug)  │  │  │
│  │  └────────────┘ └──────────────┘ └───────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                          │                                             │
│  ┌───────────────────────▼─────────────────────────────────────────┐  │
│  │  Prisma ORM → PostgreSQL (with @prisma/adapter-pg)              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Feature-based modules** — Each domain is a self-contained module with its own types, API routes, components, hooks, services, and stores.
- **Hono for API** — Instead of Next.js Route Handlers, uses Hono with `@hono/zod-openapi` for OpenAPI 3.1-compliant routes. Type-safe request/response validation and auto-generated Swagger docs.
- **Better Auth** — Handles authentication (sign in/up, sessions) and multi-tenancy via its `organization` plugin.
- **Zustand for global client state** — Only when state must be shared across unrelated components (e.g., department filter, bulk selection, auth user).
- **TanStack Query for server state** — All API data fetching uses `useQuery`/`useMutation`.
- **Prisma with `@prisma/adapter-pg`** — Uses the new Prisma adapter for direct PostgreSQL connections.
- **@better-fetch/fetch** — Typed HTTP client used in TanStack Query hooks.

---

## 3. Directory Structure

```
EthioERP/
├── prisma/
│   ├── schema.prisma              # Database schema (12 models, 7 enums)
│   ├── migrations/                # Migration history
│   └── migration_lock.toml
├── src/
│   ├── app/
│   │   ├── globals.css            # Tailwind + CSS custom properties + dark mode
│   │   ├── layout.tsx             # Root layout (QueryProvider + TooltipProvider + fonts)
│   │   ├── page.tsx               # Landing page (hero + CTA)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx         # Auth layout (PublicNavbar)
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx         # Main layout (TenantProvider + MainAppShell)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── hr/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx  # Edit employee
│   │   │   │   └── add/page.tsx   # Redirect
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx  # Edit item
│   │   │   │   └── add/page.tsx   # Redirect
│   │   │   ├── fiscalyear/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx  # Edit fiscal year
│   │   │   ├── profile/page.tsx
│   │   │   └── workspace/
│   │   │       ├── page.tsx
│   │   │       └── [organizationId]/page.tsx
│   │   ├── api/
│   │   │   ├── [[...route]]/route.ts   # Hono catch-all handler (GET/POST/PUT/PATCH/DELETE)
│   │   │   ├── app.ts                  # OpenAPIHono app — registers all module routes
│   │   │   ├── routes/
│   │   │   │   ├── health.ts           # GET /api/v1/health
│   │   │   │   └── docs.ts            # Swagger UI + OpenAPI JSON
│   │   │   ├── lib/
│   │   │   │   └── resolveActiveCompany.ts  # Session/org/company validation helper
│   │   │   └── types/
│   │   │       └── context.ts          # AppVariables, isOrganizationOwner()
│   │   └── onboarding/page.tsx
│   ├── generated/prisma/          # Auto-generated Prisma client
│   ├── hooks/
│   │   └── use-mobile.ts          # Responsive sidebar hook
│   ├── lib/
│   │   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
│   │   ├── db.ts                  # PrismaClient singleton (HMR-safe with globalThis)
│   │   ├── auth.ts                # Better Auth server config
│   │   └── auth-client.ts         # Better Auth client config
│   ├── modules/
│   │   ├── auth/                  # Auth module
│   │   ├── company/               # Company CRUD
│   │   ├── workspace/             # Organization management + TenantProvider
│   │   ├── fiscalyear/            # Fiscal year (Ethiopian & Gregorian)
│   │   ├── hr/                    # Employee management
│   │   └── inventory/             # Inventory management
│   ├── providers/
│   │   └── QueryProvider.tsx      # TanStack Query client provider
│   ├── proxy.ts                   # Next.js middleware (session + onboarding checks)
│   └── shared/
│       ├── lib/
│       │   ├── openapi.ts         # OpenAPI document config
│       │   ├── slug.ts            # Slugify utility
│       │   └── form-errors.ts     # TanStack Form error formatting
│       ├── store/
│       │   ├── inventoryStatsStore.ts  # Low-stock count (read by sidebar badge)
│       │   └── employeeStatsStore.ts   # On-leave count (read by sidebar badge)
│       └── components/
│           ├── ui/                # 26+ shadcn/ui components
│           ├── layout/
│           │   ├── MainAppShell.tsx
│           │   ├── PublicNavbar.tsx
│           │   ├── LandingCta.tsx
│           │   └── AuthNavActions.tsx
│           ├── app-sidebar.tsx
│           ├── site-header.tsx
│           ├── page-header.tsx
│           ├── nav-main.tsx
│           ├── nav-user.tsx
│           ├── nav-secondary.tsx
│           ├── nav-documents.tsx
│           ├── section-cards.tsx
│           ├── chart-area-interactive.tsx
│           ├── data-table.tsx
│           ├── data-table-column-header.tsx
│           └── data-table-pagination.tsx
├── .env                           # Environment variables (gitignored)
├── prisma.config.ts               # Prisma CLI config (dotenv + schema path)
├── components.json                # shadcn/ui configuration
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
└── package.json
```

---

## 4. Multi-Tenancy Model

Two-level tenancy system:

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

An application-level entity that scopes ERP data. Companies are created within organizations. The active company is stored in a cookie named `activeCompanyId` (constant defined in `src/modules/company/types/constants.ts`).

### TenantProvider

The `TenantProvider` at `src/modules/workspace/components/TenantProvider.tsx` syncs the Better Auth session user and the active workspace/company into Zustand stores:
- `authStore` — app-wide user state
- `fiscalYearStore` / `tenantStore` — tenant/company IDs

### How API Routes Get Tenant Context

Every module API route calls `resolveActiveCompany(c)` which:
1. Checks the session exists (from `c.get("session")`)
2. Reads `activeOrganizationId` from the session
3. Reads the `activeCompanyId` cookie
4. Verifies the user is a member of that org
5. Verifies the company belongs to that org
6. Returns `{ ok: true, tenantId, companyId, userId }` or an error Response

---

## 5. Authentication (Better Auth)

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

Better Auth handles the full auth API: sign-up/email, sign-in/email, sign-out, session, organization CRUD, member management, invitations.

### Auth Flow

1. User visits a protected route → `src/proxy.ts` checks the session
2. No session → redirect to `/signin`
3. Session exists but no active org → redirect to `/onboarding`
4. Session + active org but no active company → redirect to `/onboarding`
5. Everything set → render the page

---

## 6. API Layer (Hono)

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

1. **Auth middleware** — Runs on every request, attaches `user` and `session` to context via `auth.api.getSession()`
2. **Better Auth handler** — Proxies `POST`/`GET` `/auth/*` to `auth.handler()`
3. **Module routes** — Registered via `app.openapi(routeDefinition, handler as never)` (the `as never` assertion avoids a union-type incompatibility with `@hono/zod-openapi`'s strict response type inference)
4. **Swagger docs** — Served at `/api/v1/ui` and `/api/v1/doc`

### Route Pattern

Each module defines routes in `modules/<name>/api/routes/route.ts` using `@hono/zod-openapi`:

```ts
export const listEmployeesRoute = createRoute({
  method: "get",
  path: "/employees",
  tags: ["Employees"],
  responses: {
    200: { description: "Employees", content: { "application/json": { schema: EmployeeListResponseSchema } } },
    ...authErrorResponses,
  },
});

export const listEmployeesHandler = async (c: Context<EmployeeEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;
  const employees = await listEmployees(context.companyId);
  return c.json({ employees }, 200);
};
```

### Context Helpers

- `resolveActiveCompany(c)` — For company-scoped routes (Inventory, HR, FiscalYear). Returns `{ ok: true, tenantId, companyId, userId }` or error `Response`.
- `resolveOrgContext(c)` — For org-scoped routes (Company module). Returns `{ ok: true, tenantId }` or error `Response`.

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

## 7. Frontend Module Architecture

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
│   ├── <Entity>DetailPanel.tsx  # Expandable row detail (HR, Inventory)
│   ├── <Entity>Actions.tsx   # Delete with confirmation
│   ├── BulkActionBar.tsx     # Fixed bottom bulk action bar
│   ├── CategoryFilter.tsx    # (or DepartmentFilter)
│   └── SearchBar.tsx
├── hooks/
│   └── use<Entities>.ts     # TanStack Query hooks
├── services/
│   ├── <entity>Repository.ts # Prisma data access layer (server-side)
│   └── <entity>Service.ts   # Business logic / computed stats
├── store/ (optional)
│   ├── selectionStore.ts     # Bulk selection state (Zustand)
│   └── <module>FilterStore.ts # Filter state (Zustand)
└── types/
    └── index.ts              # Zod schemas + TypeScript types
```

### Layer Responsibilities

| Layer | Location | Purpose |
|-------|----------|---------|
| **Types** | `types/index.ts` | Zod schemas for forms + API responses. Used for validation and OpenAPI doc generation. |
| **Repository** | `services/<entity>Repository.ts` | Prisma queries (findMany, create, update, delete). Throws `EntityRepositoryError` with `status` field on failure. |
| **Service** | `services/<entity>Service.ts` | Business rules, validation, computed stats (e.g., `countLowStock`, `countEmployeesOnLeave`). |
| **API Routes** | `api/routes/route.ts` | Hono route definitions (`createRoute`) + handlers. Call repository functions, wrap errors. |
| **Hooks** | `hooks/use<Entities>.ts` | TanStack Query `useQuery`/`useMutation` wrapping `fetch` or `@better-fetch/fetch` calls. |
| **Components** | `components/` | UI components (Table, Form, Dialogs, Filters, SearchBar, BulkActionBar, DetailPanel). |
| **Store** | `store/` | Zustand for client-side global state (selection, filters). |

### Data Flow

```
User action (click, form submit)
  → React component calls hook (e.g., useCreateEmployee)
    → Hook fires fetch() to /api/v1/employees
      → Hono handler receives request
        → resolveActiveCompany(c) validates session/tenant/company
          → Repository function runs Prisma query
            → On success: handler returns c.json(response, status)
              → TanStack Query updates cache
                → UI re-renders
```

### Pattern: TanStack Query Hooks

```ts
// modules/hr/hooks/useEmployees.ts
export function useEmployees(search?: string, department?: string) {
  return useQuery({
    queryKey: ["employees", search, department],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (department) params.set("department", department);
      const res = await fetch(`/api/v1/employees?${params}`);
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
        method: "POST", headers: { "Content-Type": "application/json" },
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

### Pattern: TanStack React Form

Forms use `@tanstack/react-form` with Zod validation:

```ts
// hooks/useEmployeeForm.ts
export function useEmployeeForm({ defaultValues, onSubmit }: EmployeeFormOptions) {
  return useForm({
    defaultValues,
    validators: { onChange: CreateEmployeeSchema },
    onSubmit: async ({ value }) => { await onSubmit(value); },
  });
}
```

---

## 8. Database Schema (Prisma)

### Models

| Model | Table | Description |
|-------|-------|-------------|
| `User` | `user` | Better Auth user accounts |
| `Session` | `session` | Auth sessions with `activeOrganizationId` |
| `Account` | `account` | OAuth/provider accounts |
| `Verification` | `verification` | Email verification codes |
| `Organization` | `organization` | Better Auth tenant (multi-tenant root) |
| `Member` | `member` | User ↔ Organization membership with role |
| `Invitation` | `invitation` | Org invitations |
| `Company` | `companies` | ERP data scope (belongs to an organization) |
| `FiscalYear` | `fiscal_years` | Fiscal year periods (Ethiopian & Gregorian) |
| `InventoryItem` | `inventory_items` | Inventory with category, SKU, quantity, price |
| `Employee` | `employees` | Employee records with department and status |

### Entity Relationship

```
┌──────────────┐       ┌──────────────┐       ┌─────────────┐
│    User      │       │ Organization  │       │  Company    │
├──────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)      │◄────┐ │ id (PK)      │◄────┐ │ id (PK)     │
│ name         │      │ │ name         │      │ │ name        │
│ email (UQ)   │      │ │ slug (UQ)    │      │ │ slug        │
│ ...          │      │ │ logo         │      │ │ orgId (FK)──┘
└──────────────┘      │ │              │      │ └─────────────┘
                      │ └──────────────┘      │       │
┌──────────────┐      │                       │       ├───────────────────┐
│   Member     │      │                       │       │                   │
├──────────────┤      │                       │  ┌────▼────┐    ┌────────▼──┐
│ id (PK)      │      │                       │  │ Fiscal  │    │ Inventory │
│ orgId (FK)───┼──────┘                       │  │ Year    │    │   Item    │
│ userId (FK)──┼────┐                         │  ├─────────┤    ├───────────┤
│ role         │    │                         │  │ id (PK) │    │ id (PK)   │
└──────────────┘    │                         │  │ tenant  │    │ company   │
                    │                         │  │ company │    │   (FK)    │
┌──────────────┐    │                         │  │ name    │    │ name      │
│   Session    │    │                         │  │ dates   │    │ sku       │
├──────────────┤    │                         │  │ status  │    │ category  │
│ id (PK)      │    │                         │  │ ⋮       │    │ quantity  │
│ userId (FK)──┼────┘                         │  └─────────┘    │ price     │
│ token (UQ)   │                              │                 │ ⋮         │
│ orgId        │                              │                 └───────────┘
└──────────────┘                              │
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
                                              └── (User models: Account,
                                                   Verification, Invitation)
```

### Enums

| Enum | Values |
|------|--------|
| `CalendarType` | `ETHIOPIAN`, `GREGORIAN` |
| `FiscalYearStatus` | `OPEN`, `CLOSED`, `REOPENED` |
| `InventoryCategory` | `Stationery`, `Electronics`, `Furniture`, `Other` |
| `InventoryUnit` | `pcs`, `box`, `kg`, `liter` |
| `InventoryItemStatus` | `active`, `inactive` |
| `EmployeeDepartment` | `Store`, `Engineering`, `Finance`, `Marketing` |
| `EmployeeStatus` | `active`, `on_leave` |

### Uniqueness & Indexes

- `fiscal_years(tenant_id, company_id, fiscal_year_name)` — unique per company
- `companies(organizationId, slug)` — unique slug per org
- `inventory_items(companyId, sku)` — unique SKU per company
- `employees(companyId, email)` — unique email per company
- All foreign tables have indexes on their company/org foreign keys

---

## 9. State Management

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
| `modules/fiscalyear/store/FiscalYearStore.ts` | `useTenantStore` (tenant/company IDs) + `useFiscalAuthStore` (auth user for FY) |
| `shared/store/inventoryStatsStore.ts` | Low-stock item count (global badge in sidebar) |
| `shared/store/employeeStatsStore.ts` | Employees-on-leave count (global badge in sidebar) |

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

## 10. Middleware / Proxy

The file `src/proxy.ts` serves as Next.js **middleware**.

### Matched Paths

```ts
matcher: [
  "/dashboard/:path*",
  "/fiscalyear/:path*",
  "/hr/:path*",
  "/inventory/:path*",
  "/profile/:path*",
  "/workspace/:path*",
]
```

### Logic Flow

```
Request to matched path
  → Check session (auth.api.getSession)
    → No session → redirect /signin
  → Relaxed routes (/workspace, /profile, and subpaths) → allow through
  → Check activeOrganizationId
    → None → redirect /onboarding
  → Check activeCompanyId cookie
    → None → redirect /onboarding
  → Verify company exists & belongs to org
    → Invalid → redirect /onboarding
  → Allow request
```

---

## 11. Routing & Layouts

### Route Groups

```
src/app/
├── (auth)/           # Group: no sidebar, PublicNavbar
│   ├── signin/
│   └── signup/
├── (main)/           # Group: sidebar + site header
│   ├── dashboard/
│   ├── hr/
│   │   ├── page.tsx       # Employee table
│   │   ├── [id]/page.tsx  # Edit employee
│   │   └── add/page.tsx   # Redirect to /hr
│   ├── inventory/
│   │   ├── page.tsx       # Inventory table
│   │   ├── [id]/page.tsx  # Edit item
│   │   └── add/page.tsx   # Redirect to /inventory
│   ├── fiscalyear/
│   │   ├── page.tsx       # Fiscal year table
│   │   └── [id]/page.tsx  # Edit fiscal year
│   ├── profile/
│   └── workspace/
│       ├── page.tsx                # List organizations
│       └── [organizationId]/       # Organization detail + company list
├── onboarding/       # No layout group, standalone
└── api/              # Hono API
```

### Layout Hierarchy

```
RootLayout (QueryProvider + TooltipProvider + fonts)
├── AuthLayout (PublicNavbar)          → /signin, /signup
├── MainLayout (TenantProvider + MainAppShell)
│   └── Sidebar + SiteHeader + Content → /dashboard, /hr, /inventory, /fiscalyear, /profile
├── OnboardingPage (standalone)        → /onboarding
└── APILayout (none)                   → /api/*
```

### MainAppShell Logic

1. If pathname starts with `/workspace` → render children in a plain container (no sidebar)
2. If still loading org/company → show skeleton
3. If no complete selection → render children in plain container
4. Otherwise → SidebarProvider → AppSidebar + SiteHeader + children

---

## 12. UI Component System

### shadcn/ui Components (26+)

Located in `src/shared/components/ui/`. Config file is `components.json`.

Key components: `sidebar`, `table`, `dialog`, `drawer`, `select`, `button`, `input`, `badge`, `card`, `breadcrumb`, `dropdown-menu`, `sheet`, `tabs`, `toggle`, `toggle-group`, `tooltip`, `checkbox`, `separator`, `skeleton`, `sonner` (toast), `chart`, `avatar`, `label`, `textarea`.

### Data Table Components

| Component | File | Description |
|-----------|------|-------------|
| `DataTable` | `shared/components/data-table.tsx` | Generic TanStack Table wrapper with sorting, filtering, pagination, expandable rows, row selection |
| `DataTableColumnHeader` | `shared/components/data-table-column-header.tsx` | Sortable column header with dropdown |
| `DataTablePagination` | `shared/components/data-table-pagination.tsx` | Pagination controls (page size, page nav, row count) |

### Custom Components

| Component | File | Description |
|-----------|------|-------------|
| `AppSidebar` | `shared/components/app-sidebar.tsx` | Main sidebar navigation with badges for low stock / on-leave counts |
| `SiteHeader` | `shared/components/site-header.tsx` | Breadcrumb-based header with sidebar trigger |
| `PageHeader` | `shared/components/page-header.tsx` | Reusable title + action button |
| `MainAppShell` | `shared/components/layout/MainAppShell.tsx` | App shell with sidebar provider |
| `PublicNavbar` | `shared/components/layout/PublicNavbar.tsx` | Landing/auth navbar |
| `AuthNavActions` | `shared/components/layout/AuthNavActions.tsx` | Sign in/up or user menu dropdown |
| `LandingCta` | `shared/components/layout/LandingCta.tsx` | Conditional CTA (Get Started / Go to Dashboard) |
| `NavMain` | `shared/components/nav-main.tsx` | Main nav group in sidebar |
| `NavUser` | `shared/components/nav-user.tsx` | User avatar + dropdown in sidebar footer |
| `SectionCards` | `shared/components/section-cards.tsx` | Dashboard stat cards (demo) |
| `ChartAreaInteractive` | `shared/components/chart-area-interactive.tsx` | Dashboard area chart (demo) |

### Theme System

- CSS custom properties for colors, shadows, fonts
- Light/dark theme via `.dark` class
- TailwindCSS 4 with `@custom-variant dark`
- Fonts: Geist (sans, via next/font), Fira Code (mono, via CSS)
- Sidebar colors independently configurable from main theme

---

## 13. API Documentation

The API is documented via **Swagger UI** at:

```
http://localhost:3000/api/v1/ui
```

The OpenAPI JSON spec is at:

```
http://localhost:3000/api/v1/doc
```

Configuration is in `src/shared/lib/openapi.ts`. Routes are documented inline using `@hono/zod-openapi` — each route definition includes path, method, tags, and response schemas.

---

## 14. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Yes | Base URL of the app (e.g., `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Yes | Secret key for session encryption (min 32 chars) |

Note: `SHADOW_DATABASE_URL` is no longer required with Prisma 7.8's migration engine.

---

## 15. Common Patterns

### Adding a New Module

1. **Database** — Add model to `prisma/schema.prisma`, run `npx prisma migrate dev --name <name>`
2. **Types** — Create `modules/<name>/types/index.ts` with Zod schemas (`.openapi("Name")` for OpenAPI, `CreateSchema = BaseSchema.omit({...})`, `UpdateSchema = CreateSchema.partial()`, list response schema, delete response schema)
3. **Repository** — Create `modules/<name>/services/<entity>Repository.ts` (Prisma queries)
4. **API Routes** — Create `modules/<name>/api/routes/route.ts` with Hono route definitions + handlers. Use `resolveActiveCompany(c)` for company-level routes or `resolveOrgContext(c)` for org-level routes.
5. **Register routes** — Import and register in `src/app/api/app.ts` (use `as never` for handler type assertion)
6. **Hooks** — Create `modules/<name>/hooks/use<Entities>.ts` with TanStack Query hooks
7. **Components** — Create table (TanStack Table), form (TanStack React Form), dialogs, filters, search bar, bulk action bar, detail panel
8. **Stores** — Add Zustand stores if needed (selection, filters, stats counts)
9. **Pages** — Create pages in `src/app/(main)/<name>/`
10. **Middleware** — Add path to `config.matcher` in `src/proxy.ts`
11. **Sidebar** — Add navigation item in `src/shared/components/app-sidebar.tsx`

### CRUD Route Template

Every module has 5 standard routes: LIST (GET), GET (GET /:id), CREATE (POST), UPDATE (PATCH /:id), DELETE (DELETE /:id). Fiscal Year additionally has activate/close/reopen. See Inventory or HR modules as the canonical example.

### Error Handling

- Repositories throw `EntityRepositoryError` (extends `Error` with a `status` field)
- Route handlers catch these and return `c.json({ error: message }, statusCode)`
- TanStack Query hooks expose `error` state for the UI
- Forms show errors via toast (sonner)

### Business Logic Pattern

Business rules live in `services/<entity>Service.ts`, **not** in the repository or components:

```ts
// modules/inventory/services/inventoryService.ts
export function countLowStock(items: InventoryItem[]) {
  return items.filter((item) => item.quantity <= item.reorderLevel).length;
}
```

### Fiscal Year Calendar Conversion

The `modules/fiscalyear/services/convertCalendar.ts` handles Ethiopian ↔ Gregorian date conversion using marker-based math. Fiscal years store both Ethiopian and Gregorian start/end dates.

### HMR Safety

The Prisma client singleton in `src/lib/db.ts` uses `globalThis` caching with a delegate check to survive Next.js hot module replacement without leaking connections.
