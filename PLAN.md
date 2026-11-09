# HostelKhata — Vertical Slice Implementation Plan (PLAN.md)

> **Execution Strategy**: Phased vertical-slice implementation. Each phase is independently testable, verified end-to-end, and recorded with checked boxes `[x]`.

---

## Phase 1: Scaffolding, Core Infrastructure & Database Schema
- [x] 1.1 Scaffold Next.js 14+ App Router project with TypeScript, Tailwind CSS, and essential utilities (`lucide-react`, `clsx`, `tailwind-merge`, `bcryptjs`, `date-fns`).
- [x] 1.2 Initialize Prisma ORM with SQLite database (`dev.db`).
- [x] 1.3 Write `prisma/schema.prisma` with User, Account, Session, WalletProfile, Transaction, and Loan models.
- [x] 1.4 Generate Prisma Client and run migrations.
- [x] 1.5 Create database seed script (`prisma/seed.ts`) with demo admin and hosteller accounts, realistic hostel expenses, and sample Udhaar records.
- [x] 1.6 Verify database connection and models.

---

## Phase 2: Multi-User Authentication & Role-Based Access Control (RBAC)
- [x] 2.1 Configure Auth.js / NextAuth v5 credentials provider with password hashing (`bcryptjs`) and Google OAuth structure.
- [x] 2.2 Configure session callback and JWT callback to pass `user.id` and `user.role` (`USER` vs `ADMIN`).
- [x] 2.3 Build clean, high-conversion `/signup` page with validation (Name, Email, Password, Student/Admin selection).
- [x] 2.4 Build `/login` page supporting Email/Password and "Continue with Google" button.
- [x] 2.5 Implement auth middleware to protect `/dashboard`, `/transactions`, `/udhaar`, `/analytics`, `/wallet-settings`, and restrict `/admin` to `ADMIN` role only.
- [x] 2.6 Verify student-isolated sessions (every query scoped to session `userId`).

---

## Phase 3: Dual-Wallet Calculation Engine & Live Dashboard
- [x] 3.1 Implement Wallet Profile API / Server Action for retrieving and setting starting balance for **Online (UPI)** and **Cash (Physical)**.
- [x] 3.2 Build Dashboard Top Summary Cards:
  - **Total Balance** (Online + Cash)
  - **Online Balance** (UPI / Bank)
  - **Cash Balance** (Physical Cash)
- [x] 3.3 Build "+ Add Money (Income)" Modal & Server Action:
  - Select wallet (`ONLINE` or `CASH`)
  - Increment selected wallet and Total Balance in real time with green success toast.
- [x] 3.4 Build "+ Spend Money (Expense)" Modal & Server Action:
  - Select wallet (`ONLINE` or `CASH`)
  - Decrement selected wallet and Total Balance in real time with green success toast.
- [x] 3.5 Build quick Starting Balance Onboarding / Reconcile Modal for quick adjustments.

---

## Phase 4: Day-to-Day Ledger (DD-MM-YYYY) & Monthly Analytics
- [x] 4.1 Implement `date-utils.ts` to strictly enforce `DD-MM-YYYY` formatting across the entire app.
- [x] 4.2 Build `/transactions` page with full chronological ledger, search, wallet filter (`All`, `Online`, `Cash`), and category badge filters.
- [x] 4.3 Build Monthly Summary Analytics component:
  - Month and Year selector (`MM-YYYY`).
  - Calculate and display **Total Spent** vs **Total Saved** for the chosen month.
  - Category spending breakdown and wallet usage distribution.
- [x] 4.4 Embed recent transactions feed into the main `/dashboard` screen.

---

## Phase 5: Lending ("Udhaar") Tracker & Automated Collection Reminders
- [x] 5.1 Build "+ Lend Money (Udhaar)" Modal & Server Action:
  - Borrower Name, Phone Number, Email, Amount, Wallet Lent (`ONLINE` or `CASH`), Lent Date, Expected Return Date (`DD-MM-YYYY`).
  - Automatically deduct lent amount from chosen wallet and create a `PENDING` Loan record.
- [x] 5.2 Build `/udhaar` page with tabs for Active/Overdue loans and Collected loans.
- [x] 5.3 Implement Overdue Detection Algorithm:
  - Compare `dueDate` with current local date.
  - Surface prominent **Warning Banner & Alert Card** on `/dashboard` and `/udhaar`.
- [x] 5.4 Implement one-tap collection reminders:
  - Clickable `<a href="tel:+91...">` for instant phone call.
  - Clickable `<a href="mailto:...">` with pre-filled friendly hostel subject and reminder text.
- [x] 5.5 Implement "Mark as Collected" flow:
  - Choose receiving wallet (`ONLINE` or `CASH`).
  - Add amount back to selected wallet balance atomically and mark status `COLLECTED`.

---

## Phase 6: Admin Dashboard (`/admin`) & 20-Point UX Quality Checklist Audit
- [x] 6.1 Build `/admin` telemetry page:
  - Total registered students count.
  - Active users this month count.
  - Platform volume overview.
  - Student registry table with registration timestamp (`DD-MM-YYYY`) and role.
  - Non-admin redirection with 403 or redirect to dashboard.
- [x] 6.2 Implement 20-point quality checklist:
  - [x] No horizontal scrolling (`overflow-x-hidden` on main containers).
  - [x] Zero broken links across navbar, sidebar, footer, and brand logo.
  - [x] Responsive mobile menu (bottom navigation bar + hamburger drawer on mobile).
  - [x] Custom favicon and page metadata (`title` & `meta description` on every route).
  - [x] Working footer links with dynamic current copyright year (`new Date().getFullYear()`).
  - [x] Custom styled `not-found.tsx` (404 page) with return-to-dashboard CTA.
  - [x] Optimized SVG icons (`lucide-react`).
  - [x] Loading, disabled, green success toast, and red error toast states on every form/button.
  - [x] Zero Lorem Ipsum text — 100% authentic student financial context.
  - [x] Hide `/admin` navigation link for non-admin users.
  - [x] Responsive table to card transformation on mobile (< 768px).
  - [x] Clickable brand logo routing to `/dashboard` (or `/` if unauthenticated).
  - [x] Clickable phone numbers (`tel:`) and emails (`mailto:`).
  - [x] 100% mobile-optimized touch targets (>= 44x44px).
- [x] 6.3 Run build validation (`npm run build`) and test execution (Both verified 100% passing).
