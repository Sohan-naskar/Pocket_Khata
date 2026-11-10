# PocketKhata — Authentication & Authorization Security Specification (AUTH_SECURITY.md)

> **Document Status**: Production Verified  
> **Version**: 2.0.0  
> **Standard**: NextAuth.js v5 / Auth.js (Edge-Safe Middleware + RBAC + Anti-Auto-Registration Guard)  

---

## 1. Authentication Architecture Overview

PocketKhata implements a zero-trust authentication boundary designed to prevent unauthorized access, enforce strict role-based routing, and safeguard personal financial records.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT VIEWPORT                                   |
|   - /login (Unified Credentials + Google OAuth Sign-In)                           |
|   - /signup (Strictly creates Personal USER accounts)                            |
|   - /unauthorized (Custom Neo-Fintech 403 Forbidden page)                        |
|   - /admin (Open Direct-Access Platform Telemetry Portal - No Auth Required)      |
|   - /dashboard (Personal Finance Dashboard partitioned by userId - Auth Required)  |
+-----------------------------------------------------------------------------------+
                                       |
                               HTTP / NextRequest
                                       v
+-----------------------------------------------------------------------------------+
|                           EDGE ROUTE MIDDLEWARE (middleware.ts)                   |
|   - Inspects JWT session token & decoded role                                     |
|   - /admin/:path* & /api/admin/* -> Public direct access (bypasses auth checks)   |
|   - Unauthenticated on protected student routes -> Redirect to /login             |
|   - Public routes allowed: /admin, /api/admin/*, /login, /signup, /unauthorized   |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                              AUTH.JS CORE (auth.ts)                               |
|   - Credentials Provider: Email + Password validated with bcryptjs                |
|     * Unregistered email -> Returns/Throws UnauthorizedAccount error              |
|   - Google OAuth Provider: In signIn callback:                                    |
|     * If user.email not in DB -> Returns /login?error=UnauthorizedAccount         |
|     * Auto-registration is strictly BLOCKED during login                          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Authentication Restriction & "Unauthorized Account" Error

### 2.1 Credentials Sign-In Policy
- When a user inputs an email and password on `/login`:
  1. The server checks `prisma.user.findUnique({ where: { email } })`.
  2. If no record is found, the system **strictly prohibits auto-creating an account**.
  3. NextAuth returns a dedicated `UnauthorizedAccount` error.
  4. On the `/login` screen, an explicit red alert banner is displayed:
     > **Unauthorized Account**: This email is not registered. Please create an account or contact the administrator.

### 2.2 Google OAuth Policy
- In the `signIn({ user, account })` callback:
  1. For `account.provider === "google"`, the callback checks `prisma.user.findUnique({ where: { email } })`.
  2. If the Google account's email does not exist in the database, the callback rejects authentication and returns:
     `"/login?error=UnauthorizedAccount"`
  3. No user record, wallet profile, or token is created for unknown Google emails during login.
  4. The user is redirected to `/login?error=UnauthorizedAccount`, where the red alert banner is displayed.
  5. New users must register explicitly through `/signup`.

---

## 3. Role-Based Access Control (RBAC) & Route Protection

PocketKhata defines two system roles:
1. `USER` (Default): Access to personal financial features (`/dashboard`, `/transactions`, `/udhaar`, `/analytics`, `/wallet-settings`). User cannot access `/admin`.
2. `ADMIN`: Elevated role granting access to `/admin` for platform telemetry and user registry management. Financial data of other users is strictly hidden from admins.

### 3.1 Middleware Guard Invariants (`src/auth.config.ts`)

| Requested Path | Authentication State | User Role | Resulting Action |
| :--- | :--- | :--- | :--- |
| `/admin/*` | Unauthenticated / Authenticated | Any | **Allowed** (Open direct-access telemetry portal for local administration; NO authentication required) |
| `/api/admin/*` | Unauthenticated / Authenticated | Any | **Allowed** (Open direct telemetry data APIs; Strict Financial Privacy enforced) |
| `/dashboard/*` | Unauthenticated | N/A | Redirect to `/login?callbackUrl=/dashboard` |
| `/dashboard/*` | Authenticated | `USER` / `ADMIN` | **Allowed** (Personal finance partition) |
| `/transactions/*` | Unauthenticated | N/A | Redirect to `/login?callbackUrl=/transactions` |
| `/udhaar/*` | Unauthenticated | N/A | Redirect to `/login?callbackUrl=/udhaar` |
| `/analytics/*` | Unauthenticated | N/A | Redirect to `/login?callbackUrl=/analytics` |
| `/wallet-settings` | Unauthenticated | N/A | Redirect to `/login?callbackUrl=/wallet-settings` |
| `/unauthorized` | Any | Any | **Allowed** (Displays Neo-Fintech 403 page) |

### 3.2 Custom 403 / Unauthorized Page (`src/app/unauthorized/page.tsx`)
- Displayed when an authenticated non-admin user navigates to `/admin`.
- Features:
  - Header badge: `403 • Unauthorized Access`
  - Title: `403 - Unauthorized Access`
  - Warning: *"You do not have administrative privileges to view this portal."*
  - Current account email and role indicator.
  - Primary Action Button: **"Back to My Dashboard"** (links to `/dashboard`).
  - Secondary Action Button: **"Sign Out & Switch Account"** (clears session and returns to `/login`).

---

## 4. Initial Admin Bootstrapping & Seed Script

### 4.1 Script Definition (`prisma/seed.ts`)
- Script command in `package.json`: `"db:seed": "tsx prisma/seed.ts"`
- Bootstrapping logic:
  1. Checks if any user with `role: "ADMIN"` exists in the database:
     `await prisma.user.findFirst({ where: { role: "ADMIN" } })`
  2. If no admin exists:
     - Creates the Super Admin:
       - Name: `"System Administrator"`
       - Email: Configured via `ADMIN_INIT_EMAIL` in `.env` (defaults to `"admin@pocketkhata.app"`)
       - Password: Hashed via `bcryptjs` from `ADMIN_INIT_PASSWORD` in `.env` (defaults to `"adminPassword123"`)
       - Role: `"ADMIN"`
       - Creates an initial empty wallet profile (`onlineBalance: 0, cashBalance: 0`)
     - Logs: `"✅ Initial Admin successfully seeded. You can now log into /admin."`
  3. If an admin already exists:
     - Safely skips creation to prevent overwriting existing administrators.

---

## 5. Security & Privacy Safeguards Summary

1. **No Password Plaintext**: All passwords hashed using `bcryptjs` (cost factor 10-12).
2. **Strict Financial Privacy**: Admin telemetry queries (`/api/admin/metrics`) explicitly omit `onlineBalance`, `cashBalance`, and monetary amounts from `prisma.user` select projections.
3. **Multi-User Isolation**: Every financial query (`transaction`, `loan`, `walletProfile`) strictly enforces `where: { userId: session.user.id }`.
4. **Session Tamper Protection**: Sessions signed using `AUTH_SECRET` via JSON Web Tokens (JWT) with Edge-compatible verification.

