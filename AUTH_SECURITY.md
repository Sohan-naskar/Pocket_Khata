# PocketKhata — Authentication & Authorization Security Specification (AUTH_SECURITY.md)

> **Document Status**: Production Verified  
> **Version**: 3.0.0  
> **Standard**: NextAuth.js v5 / Auth.js (Strict Split Authentication: Student Google OAuth vs Admin Password Portal)  

---

## 1. Authentication Architecture Overview

PocketKhata implements a unified dual-role authentication system with a strict role selector on `/login`:

1. **Unified Login Portal (`/login`)**:
   - Contains an **Account Type** selector: **[ Personal Account ]** vs **[ System Admin ]** (styled identically to the reference specifications).
   - **Personal Account**: Students can authenticate via **Email + Password** or one-click **Sign in with Google**.
   - **System Admin**: Authorized platform administrators authenticate via **Admin Email + Password**. Google OAuth is blocked for admin accounts.
   - If an unauthorized account attempts to log in under the System Admin tab, an explicit **403 Access Denied** screen is displayed right on the login page with only one option: **Return to Login Page**.
2. **Account Creation (`/signup`)**:
   - Strictly provisions **Personal Accounts (USER)** only. The System Admin account type is removed from signup.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT VIEWPORT                                   |
|   - /login (Student Login: One-Click Google OAuth ONLY)                          |
|   - /admin/login (Dedicated Administrator Portal Login: Email + Password ONLY)   |
|   - /admin (Protected Admin Telemetry & User Registry - Requires ADMIN Role)     |
|   - /dashboard (Personal Finance Dashboard - Requires USER Role)                 |
+-----------------------------------------------------------------------------------+
                                       |
                               HTTP / NextRequest
                                       v
+-----------------------------------------------------------------------------------+
|                           EDGE ROUTE MIDDLEWARE (middleware.ts)                   |
|   - Inspects JWT session token & decoded role                                     |
|   - /admin/login -> Public (Redirects to /admin if already logged in as ADMIN)    |
|   - /admin/:path* -> Protected: Redirects to /admin/login if not ADMIN            |
|   - /api/admin/* -> Protected: Returns 403 Forbidden if not ADMIN                |
|   - Student routes (/dashboard, /transactions, etc.) -> Redirects to /login        |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                              AUTH.JS CORE (auth.ts)                               |
|   - Credentials Provider: EXCLUSIVELY for ADMIN accounts                          |
|     * Verifies email + bcrypt password; strictly checks user.role === 'ADMIN'     |
|     * Any non-admin account is rejected from credentials authorization            |
|   - Google OAuth Provider: EXCLUSIVELY for USER (Student) accounts                |
|     * If user.email is registered as ADMIN, rejects with:                        |
|       /login?error=AdminMustUsePassword                                           |
|     * If user does not exist in DB, automatically creates USER account + wallet   |
|     * Enforces user.role = 'USER' for all Google sign-ins                         |
+-----------------------------------------------------------------------------------+
```

---

## 2. Authentication Restriction & Guard Policies

### 2.1 Student Google OAuth Policy (`/login`)
- Students sign in using the **"Continue with Google"** button on `/login`.
- If the user account does not yet exist, it is automatically provisioned as `role: "USER"` with an initialized wallet profile (`onlineBalance: 0, cashBalance: 0`).
- If an email registered as an `ADMIN` attempts to log in via Google, the sign-in callback rejects the request and redirects to:
  `"/login?error=AdminMustUsePassword"`
- On `/login`, an alert banner is displayed:
  > **Admin Notice**: Admin accounts cannot use Google sign-in. Please log in at `/admin/login`.

### 2.2 Administrator Credentials Policy (`/admin/login`)
- Dedicated administration login at `/admin/login`.
- Fields: Admin Email and Password.
- `CredentialsProvider.authorize` validates password via `bcrypt.compare` and strictly checks:
  `user.role === 'ADMIN'`.
- If the account role is not `ADMIN`, authorization is rejected.

---

## 3. Role-Based Access Control (RBAC) & Route Protection

| Requested Path | Authentication State | User Role | Resulting Action |
| :--- | :--- | :--- | :--- |
| `/admin/login` | Unauthenticated | N/A | **Allowed** (Admin sign-in form) |
| `/admin/login` | Authenticated | `ADMIN` | Redirect to `/admin` |
| `/admin/*` | Unauthenticated | N/A | Redirect to `/admin/login?callbackUrl=/admin` |
| `/admin/*` | Authenticated | `USER` | Redirect to `/admin/login?error=AdminUnauthorized` |
| `/admin/*` | Authenticated | `ADMIN` | **Allowed** (Admin Platform Telemetry) |
| `/api/admin/*` | Unauthenticated | N/A | Return 403 Forbidden |
| `/api/admin/*` | Authenticated | `USER` | Return 403 Forbidden |
| `/api/admin/*` | Authenticated | `ADMIN` | **Allowed** (Strict Financial Privacy Enforced) |
| `/dashboard/*` | Unauthenticated | N/A | Redirect to `/login?callbackUrl=/dashboard` |
| `/dashboard/*` | Authenticated | `USER` | **Allowed** (Personal Finance Workspace) |
| `/dashboard/*` | Authenticated | `ADMIN` | Redirect to `/admin` |
| `/login` | Unauthenticated | N/A | **Allowed** (Student Google OAuth) |
| `/login` | Authenticated | `USER` | Redirect to `/dashboard` |
| `/login` | Authenticated | `ADMIN` | Redirect to `/admin` |

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
       - Name: `"Sohan Naskar"`
       - Email: Configured via `ADMIN_INIT_EMAIL` in `.env` (defaults to `"sohannaskar2304@gmail.com"`)
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

