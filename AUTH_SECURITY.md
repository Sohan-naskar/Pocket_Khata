# PocketKhata — Authentication & Authorization Security Specification (AUTH_SECURITY.md)

> **Document Status**: Production Verified  
> **Version**: 4.0.0  
> **Standard**: NextAuth.js v5 / Auth.js (Pure Manual Username/Email & Password Authentication + Zero Third-Party OAuth)  

---

## 1. Authentication Architecture Overview

PocketKhata implements a clean, self-contained authentication architecture utilizing strictly **Username/Email and Password** authentication across all authentication screens, with all third-party OAuth (including Google) completely removed:

1. **Unified Login Portal (`/login`)**:
   - Contains an **Account Type** selector: **[ Personal Account ]** vs **[ System Admin ]** (styled with high-contrast active tabs).
   - **Personal Account**: Students and individuals log in using **Username or Email** + **Password**.
   - **System Admin**: Authorized platform administrators log in using **Admin Username or Email** + **Password**.
   - If an unauthorized account attempts to log in under the System Admin tab, an explicit **403 Access Denied** screen is rendered directly on the login page with only one option: **Return to Login Page**.
2. **Account Creation (`/signup`)**:
   - Strictly provisions **Personal Accounts (USER)** only (no System Admin option on signup).
   - Fields: **Full Name**, **Username**, **Email Address**, and **Password (min 6 chars)**.
   - Saves `username` and `email` uniquely to the `User` database table.
3. **Self-Service Password Reset (`/forgot-password` & `/reset-password`)**:
   - Secure token-based password reset using `PasswordResetToken` (1-hour expiry).
   - Anti-enumeration protection on request submission.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT VIEWPORT                                   |
|   - /login (Unified Credentials Login: Personal Account & System Admin tabs)      |
|   - /signup (Personal Account Creation: Full Name, Username, Email, Password)     |
|   - /forgot-password & /reset-password (Self-service recovery with 1hr token)     |
|   - /unauthorized (403 Access Denied Guard with Single "Return to Login Page")    |
|   - /admin (Protected Admin Telemetry & User Registry - Requires ADMIN Role)      |
|   - /dashboard (Personal Finance Dashboard - Requires USER Role)                  |
+-----------------------------------------------------------------------------------+
                                       |
                               HTTP / NextRequest
                                       v
+-----------------------------------------------------------------------------------+
|                           EDGE ROUTE MIDDLEWARE (middleware.ts)                   |
|   - Inspects JWT session token & decoded role                                     |
|   - /admin/:path* -> Protected: Redirects to /login?callbackUrl=/admin if not     |
|     logged in, or /login?error=AdminUnauthorized if role is not ADMIN             |
|   - /api/admin/* -> Protected: Returns 403 Forbidden if not ADMIN                 |
|   - Student routes (/dashboard, /transactions, etc.) -> Redirects to /login       |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                              AUTH.JS CORE (auth.ts)                               |
|   - Pure Credentials Provider: Username/Email + Password validated with bcryptjs  |
|   - Multi-Identifier Resolution: User can log in with EITHER their email address   |
|     OR their unique username                                                      |
|   - Zero Third-Party Providers: No Google OAuth or external identity dependencies  |
|   - Enforces Role-Based Access: Injects user.role (USER vs ADMIN) into JWT token   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Authentication Restriction & Guard Policies

### 2.1 Personal Account Credentials Policy (`/login`)
- Students and personal users log in with their **Username or Email** and **Password**.
- The `CredentialsProvider` resolves both `@email` and `username` columns from `prisma.user`.
- Passwords verified securely via `bcrypt.compare`.
- Upon successful sign-in, users are redirected to `/dashboard`.

### 2.2 System Administrator Credentials Policy (`/login` & `/admin/login`)
- Platform administrators switch the **Account Type** toggle to **System Admin**.
- Enter administrative Username or Email and Password.
- If credentials belong to a standard `USER` account:
  - The session is immediately revoked via `signOut({ redirect: false })`.
  - The login page renders the **403 • Unauthorized Account (Access Denied)** card.
  - The card displays: Signed In As, Account Role (`USER`), Admin Status (`Not Authorized`), and a single button: **Return to Login Page**.
- If credentials belong to an authentic `ADMIN` account:
  - Session established with `role: "ADMIN"`.
  - User redirected to `/admin`.

### 2.3 Registration Policy (`/signup`)
- Public registration creates **Personal Accounts** strictly with `role: "USER"`.
- Validates that both `email` and `username` are globally unique.
- Password must be at least 6 characters, hashed using `bcryptjs` with salt rounds = 10.
- Automatically provisions an initialized `WalletProfile` (`onlineBalance: 0, cashBalance: 0, currency: "INR"`).

---

## 3. Role-Based Access Control (RBAC) & Route Protection

| Requested Path | Authentication State | User Role | Resulting Action |
| :--- | :--- | :--- | :--- |
| `/login` | Unauthenticated | N/A | **Allowed** (Unified Credentials Login) |
| `/login` | Authenticated | `USER` | Redirect to `/dashboard` |
| `/login` | Authenticated | `ADMIN` | Redirect to `/admin` |
| `/signup` | Unauthenticated | N/A | **Allowed** (Personal Account Creation) |
| `/signup` | Authenticated | `USER` | Redirect to `/dashboard` |
| `/signup` | Authenticated | `ADMIN` | Redirect to `/admin` |
| `/admin/*` | Unauthenticated | N/A | Redirect to `/login?callbackUrl=/admin` |
| `/admin/*` | Authenticated | `USER` | Redirect to `/login?error=AdminUnauthorized` (or `/unauthorized`) |
| `/admin/*` | Authenticated | `ADMIN` | **Allowed** (Admin Platform Telemetry) |
| `/api/admin/*` | Unauthenticated | N/A | Return 403 Forbidden |
| `/api/admin/*` | Authenticated | `USER` | Return 403 Forbidden |
| `/api/admin/*` | Authenticated | `ADMIN` | **Allowed** (Strict Financial Privacy Enforced) |
| `/dashboard/*` | Unauthenticated | N/A | Redirect to `/login?callbackUrl=/dashboard` |
| `/dashboard/*` | Authenticated | `USER` | **Allowed** (Personal Finance Workspace) |
| `/dashboard/*` | Authenticated | `ADMIN` | Redirect to `/admin` |

---

## 4. Admin Bootstrapping Script (`prisma/seed.ts`)

- Script command: `npm run db:seed`
- Checks if the primary administrator exists:
  - Name: `"Sohan Naskar"`
  - Email: Configured via `ADMIN_INIT_EMAIL` in `.env` (defaults to `"sohannaskar2304@gmail.com"`)
  - Password: Hashed via `bcryptjs` from `ADMIN_INIT_PASSWORD` in `.env` (defaults to `"adminPassword123"`)
  - Role: `"ADMIN"`

---

## 5. Security & Privacy Safeguards Summary

1. **Zero External OAuth Leaks**: No credentials or tokens transmitted to third-party identity servers.
2. **Multi-Identifier Resilience**: Users can sign in using their unique username or email address.
3. **No Password Plaintext**: All passwords hashed using `bcryptjs` (cost factor 10).
4. **Strict Financial Privacy**: Admin telemetry queries (`/api/admin/metrics`, `/api/admin/users`) strictly omit `onlineBalance`, `cashBalance`, and monetary amounts from `prisma.user` select projections.
