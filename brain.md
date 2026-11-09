# HostelKhata — Persistent Project Brain & Context Memory

> **System Memory & Source of Truth for Antigravity AI**
> Last Updated: 2026-11-09 | Version: 1.0.0
> Target Users: Students, Hostellers, Bachelors, Flatmates

---

## 1. Project Summary & Core Mission
**HostelKhata** is an ultra-fast, responsive (laptop + mobile) multi-user day-to-day personal finance and peer-lending ("Udhaar") tracker. It solves the unique financial chaotic reality of hostel and bachelor life:
1. **Dual-Wallet Reality**: Students operate simultaneously with **Online (UPI / Google Pay / PhonePe / Bank)** and **Cash (Physical wallet)**. HostelKhata tracks both independently and sums them into a live Total Balance.
2. **Udhaar / Peer Lending Chaos**: Friends borrow money for canteens, auto-rickshaws, chai, mess bills, and online orders. HostelKhata logs borrower details, deducts from the lending wallet, tracks due dates, and provides instant **one-tap collection reminders** via `tel:` phone call and `mailto:` email, returning funds to the selected wallet when collected.
3. **Strict DD-MM-YYYY Day-to-Day Ledger**: Clear chronological daily logs, monthly comparisons (Total Spent vs. Total Saved), and zero confusing financial jargon.
4. **Multi-User Isolation & Role-Based Access Control**: Student accounts are strictly partitioned by `user_id`. An `ADMIN` role can access `/admin` for platform user telemetry, invisible to regular users.

---

## 2. Technical Stack & Architecture
- **Framework**: Next.js 14+ (App Router, Server Actions, Route Handlers, React 18)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS, Lucide React icons
- **UI Components**: Accessible primitives (Dialog, Tabs, Toast, Badge, Card, Slide-Over Drawer, Bottom Navigation)
- **Database & ORM**: Prisma ORM with SQLite (`file:./dev.db`) for immediate portable zero-friction local execution, fully compatible with PostgreSQL.
- **Authentication**: Auth.js / NextAuth.js v5 with Credentials (Email/Password) + Google OAuth provider structure, secure password hashing (`bcryptjs`), Edge-safe `authConfig` split.
- **Date Architecture**: Strict `DD-MM-YYYY` client formatting with ISO-8601 storage in DB.

---

## 3. File Priority Order (Read & Reference Sequence)
1. `brain.md` (This file — persistent state, guidelines, guardrails)
2. `PLAN.md` (Implementation phases, vertical slices, progress tracker)
3. `PRD.md` (Product specifications, user stories, acceptance criteria)
4. `TRD.md` (Technical architecture, Prisma schema, API routes, security)
5. `DESIGN.md` (Colors, hex codes, typography, touch target specs)
6. `APP_FLOW.md` (Screen routes, navigation, responsive drawers, modals)
7. `prisma/schema.prisma` (Database schema & relations)
8. `src/lib/*` (Auth, db, formatters, calculations, date utilities)
9. `src/app/*` (Pages, layouts, routes, server actions)

---

## 4. Strict DO and DO NOT Guardrails

### Strict DOs:
- **DO** scope every database query strictly by the authenticated session `user.id`.
- **DO** enforce dual-wallet integrity: every expense and loan deduction must decrease the selected wallet (`ONLINE` or `CASH`); every income and loan repayment must increase the selected wallet.
- **DO** format dates on all UI elements strictly as `DD-MM-YYYY` (e.g. `09-11-2026`).
- **DO** use `tabular-nums` and font `font-financial` / `JetBrains Mono` for currency and balances (`₹1,250.00`).
- **DO** provide clickable `tel:` links and `mailto:` links with pre-filled reminder text for overdue borrowers.
- **DO** ensure touch targets on mobile are at least 44x44px.
- **DO** prevent horizontal overflow on every screen (`overflow-x-hidden`).
- **DO** display interactive toast notifications (green for success, red for errors) on every action.
- **DO** hide `/admin` from navbar, drawer, and direct routing if user role is not `ADMIN`.

### Strict DO NOTs:
- **DO NOT** hardcode secrets or credentials in repository files.
- **DO NOT** use generic `Lorem Ipsum` or placeholder dummy text; use realistic hosteller/student terms (e.g., "Mess Fees", "Chai & Samosa", "Semester Exam Form", "Roommate Wi-Fi split").
- **DO NOT** allow wallet balances to drift out of sync with transactions; recalculate or maintain transactional state with atomic updates.
- **DO NOT** create broken navigation links; every button and menu item must have an active route or functional modal trigger.
- **DO NOT** scan the entire codebase blindly; refer to `brain.md` and `PLAN.md` to identify the exact files needed.

---

## 5. Current Implementation State
- [x] Step 1: Brain & Source-of-Truth Markdown documentation generated
- [x] Phase 1: Next.js scaffolding, Tailwind, Prisma schema, Database init & seed
- [x] Phase 2: Multi-User Authentication (Credentials + Google OAuth ready) & RBAC
- [x] Phase 3: Dual-Wallet Engine (Online + Cash), Starting Balance, Live Top Cards
- [x] Phase 4: Day-to-Day Ledger (DD-MM-YYYY), Monthly Analytics (Spent vs Saved)
- [x] Phase 5: Udhaar / Lending Tracker, Due Date Alerts, One-Tap Tel/Mail Reminders
- [x] Phase 6: Admin Dashboard (/admin), 20-Point UX Quality Checklist Audit
