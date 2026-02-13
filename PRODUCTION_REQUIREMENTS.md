# TechMate Production Requirements

## Current State Summary

### ✅ Production-Ready
| Component | Status | Files |
|-----------|--------|-------|
| Authentication | Fully wired | `useAuth.ts`, `authService.ts` |
| Supabase Client | Typed | `supabaseClient.ts` with `Database` generic |
| User Overview | Real data | `useDashboardData.ts` → profiles, orders, invoices |
| User Orders | Real data | Direct Supabase queries in `UserOrders.tsx` |
| User Profile | Real CRUD | Supabase profile + avatar upload |

### ❌ Demo/Hardcoded Data
| Component | Issue | Priority |
|-----------|-------|----------|
| Admin Overview | ~280 lines of inline mock arrays | **High** |
| Admin Projects | Hardcoded project list | **High** |
| Admin Revenue | Mock financial data | **High** |
| Admin Analytics | Static chart data | **Medium** |
| Admin Clients | Mock client list | **Medium** |
| Admin Services | Static service categories | **Medium** |
| Admin Consulting | Mock consulting data | **Low** |
| Admin Deployments | Mock deployment data | **Low** |
| Billing | Local state only | **Medium** |
| Messages | 800 lines of mock conversations | **Medium** |
| Notifications | Mock notifications | **Medium** |
| User Settings | No persistence | **Low** |

---

## Implemented Infrastructure (This Upgrade)

### Database Schema (15 tables)
`database/production_schema.sql` — Profiles, businesses, projects, orders, deliverables, invoices, requests, responses, notifications, messages, activity_logs, admin_metrics, service_categories, user_settings, support_tickets.

### Security
`database/rls_policies.sql` — Row Level Security: users see own data, admins see all. `is_admin()` helper function.

### Database Functions
`database/functions.sql` — Auto-update triggers, invoice number generation, auto-profile creation on signup, `get_admin_metrics()`, `get_user_stats()`, `get_user_growth()`, `get_revenue_by_month()`.

### TypeScript Types
- `src/types/database.types.ts` — Row/Insert/Update types for all 15 tables, Database interface
- `src/types/api.types.ts` — Pagination, filtering, sorting, service responses, admin metrics

### Service Layer
| Service | Capabilities |
|---------|-------------|
| `users.service.ts` | CRUD, pagination, search, admin ops |
| `projectService.ts` | Enhanced CRUD, pagination, stats |
| `orders.service.ts` | CRUD, status management, deliverables |
| `admin.service.ts` | Dashboard metrics, chart data, system health |
| `notifications.service.ts` | CRUD, real-time subscriptions |
| `messages.service.ts` | Conversations, send/receive, real-time |
| `requests.service.ts` | Marketplace CRUD, response management |

### React Hooks
| Hook | Purpose |
|------|---------|
| `useAdmin` | Admin dashboard data + auto-refresh |
| `useProjects` | User/admin project views |
| `useOrders` | User/admin order views |
| `useNotifications` | Real-time notifications |
| `useMessages` | Real-time messaging |
| `useRealtime` | Generic real-time utility |

---

## Data Flow

```
Supabase DB → Service Layer → React Hooks → Page Components
     ↕              ↕              ↕
  RLS Policies   Type Safety   State Management
     ↕              ↕              ↕
  Functions    Error Handling   Real-time Updates
```

---

## Remaining Work (Dashboard Integration)

### Phase 5: Admin Dashboard Pages
Replace hardcoded data in each page with `useAdmin()` / `useProjects()` / `useOrders()` hooks.

### Phase 6: User Dashboard Pages
Wire `Billing.tsx`, `Messages.tsx`, `Notifications.tsx`, `UserSettings.tsx` to services.

### Phase 7: Real-time Features
Enable real-time subscriptions on admin dashboard for live updates.

---

## Deployment Checklist

1. Run `production_schema.sql` in Supabase SQL Editor
2. Run `rls_policies.sql`
3. Run `functions.sql`
4. Run `indexes.sql`
5. Run `seed_data.sql` (update UUIDs first)
6. Move Supabase keys to `.env` file (recommended)
7. Run `pnpm run build` to verify
8. Deploy to Vercel
