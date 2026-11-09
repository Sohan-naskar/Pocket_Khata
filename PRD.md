# HostelKhata — Product Requirements Document (PRD)

> **Document Version**: 1.0.0  
> **Target Audience**: Students, Hostellers, Bachelors, Flatmates  
> **Core Value Proposition**: Instant control over Online (UPI) vs Cash balances, effortless day-to-day spending logs, and foolproof peer lending ("Udhaar") tracking with automated collection reminders.

---

## 1. Problem Statement
Hostel students and bachelors live in a chaotic micro-economy:
1. **The Dual-Wallet Dilemma**: Money is split between bank accounts (UPI / GPay / PhonePe) and physical cash. Most expense trackers lump everything into one generic "Balance", leading to situations where a student thinks they have ₹1,000 to spend, only to realize ₹900 is in cash while the online canteen only accepts UPI.
2. **The "Udhaar" Black Hole**: Roommates and hostel friends constantly borrow ₹50 for tea, ₹300 for dinner, or ₹1,500 for semester notes. Because tracking is awkward or forgotten in WhatsApp chats, students lose hundreds or thousands of rupees every semester.
3. **Complex Enterprise Apps**: Existing accounting apps are bloated with business invoices, GST, multiple foreign currencies, and complicated charts that bachelors abandon in 2 days.
4. **Mobile & Network Constraints**: Hostellers frequently check finances on cheap smartphones under poor hostel Wi-Fi; apps must be lightweight, fast, touch-friendly, and mobile-responsive with zero horizontal scrolling.

---

## 2. Target User Personas

### Persona A: Aryan Sharma (20, Engineering Hosteller)
- **Context**: Lives in a 3-seater college hostel room, receives ₹6,000 monthly allowance from parents.
- **Pain Point**: Spends rapidly on UPI for snacks, stationery, and laundry, while keeping ₹1,000 cash for emergencies. Regularly lends ₹100–₹500 to roommates who forget to return it.
- **Goal**: Needs to see his exact UPI vs Cash balance at a glance and track who owes him money with dates and contact links.

### Persona B: Priya Nair (23, Bachelor / Junior Software Developer)
- **Context**: Lives in a shared 2BHK flat with 2 flatmates, manages flat groceries, utility bills, and personal daily expenses.
- **Pain Point**: Frequently fronts money for water cans and Wi-Fi bills and needs to collect dues without awkward confrontation.
- **Goal**: Easily record who owes what, see expected return dates, and tap one button to WhatsApp/call/email them.

### Persona C: Hostel Warden / System Admin
- **Context**: Administering user registrations and monitoring system health across hostel batches.
- **Goal**: Role-based access to view registered user statistics, active users this month, and platform growth metrics.

---

## 3. Core MVP Feature Scope

### Feature 1: Multi-User Authentication & Role-Based Access Control (RBAC)
- **Email + Password Signup & Login**: Fast validation, secure password hashing (`bcryptjs`), session persistence.
- **Google OAuth Integration**: "Continue with Google" one-click sign-in.
- **Data Isolation**: Every transaction, wallet configuration, and loan is partitioned strictly by `userId`.
- **Role System**: `USER` (default hosteller) and `ADMIN` (system administrator with access to `/admin` dashboard).

### Feature 2: Dual-Wallet Auto-Calculation Engine (Online vs Cash)
- **Initial Setup**: Set initial balances for **Online (UPI/Bank)** and **Cash (Physical)**.
- **Live Summary Cards**:
  1. `Total Balance`: Online + Cash
  2. `Online Balance`: UPI/Bank funds
  3. `Cash Balance`: Physical pocket cash
- **Auto-Calculated Wallet Updates**:
  - Adding Income to `ONLINE` increments Online Balance and Total Balance.
  - Adding Income to `CASH` increments Cash Balance and Total Balance.
  - Adding Expense from `ONLINE` decrements Online Balance and Total Balance.
  - Adding Expense from `CASH` decrements Cash Balance and Total Balance.
  - Wallet balance adjustment tool if user miscounted cash or reconciles bank SMS.

### Feature 3: Day-to-Day Ledger (DD-MM-YYYY) & Monthly Analytics
- **Chronological Transaction Feed**:
  - Category tags (e.g., Food & Mess, Chai & Snacks, Travel & Auto, Academics & Books, Rent & Wi-Fi, Entertainment, Medical).
  - Explicit Wallet indicator badge (`ONLINE` vs `CASH`).
  - Strict `DD-MM-YYYY` date display and filtering (e.g., `09-11-2026`).
- **Monthly Summary Analytics**:
  - Month/Year selector (`MM-YYYY`).
  - Total Income vs Total Spent vs Total Saved calculation.
  - Spending breakdown by category and by wallet type.

### Feature 4: Lending ("Udhaar") Tracker & Automated Collection Reminders
- **Loan Creation**:
  - Borrower Name
  - Borrower Phone Number (format validated)
  - Borrower Email (optional or provided)
  - Amount lent
  - Lending Wallet (`ONLINE` or `CASH` — automatically deducted upon lending)
  - Date Lent (`DD-MM-YYYY`)
  - Expected Return Date (`DD-MM-YYYY`)
  - Optional note (e.g., "Dinner at dhaba", "Chemistry xerox")
- **Status Workflow**:
  - `PENDING`: Loan is active, money has left the user's wallet.
  - `OVERDUE`: Return date is today or has passed; triggers a high-visibility reminder card.
  - `COLLECTED`: Loan repaid; user selects which wallet (`ONLINE` or `CASH`) received the money, returning funds to balance.
- **Collection Reminders**:
  - Prominent Warning Banner on dashboard for overdue loans.
  - One-tap `tel:+91...` button to directly place a phone call from mobile.
  - One-tap `mailto:...` button with pre-filled subject and friendly hostel reminder text.

### Feature 5: Admin Platform Telemetry (`/admin`)
- Accessible strictly to users with `role: "ADMIN"`.
- Total registered students/users.
- Active users in the current month.
- User registry table with email, name, role, registration timestamp (`DD-MM-YYYY`), and loan/transaction counts.

---

## 4. User Flows

### Flow 1: New Student Onboarding
1. User visits `/signup` or `/login`.
2. Registers with email/password or "Continue with Google".
3. Redirected to `/dashboard` with a friendly "Welcome to HostelKhata" onboarding modal prompting:
   - "Enter starting Online balance (UPI/Bank)" (e.g., ₹2,500)
   - "Enter starting Cash balance (Pocket money)" (e.g., ₹600)
4. Balances immediately populate the 3 live summary cards.

### Flow 2: Daily Expense Logging
1. User buys chai & samosa for ₹40 in cash.
2. Taps "+ Add Expense" (accessible from top bar or floating action button).
3. Selects Category: "Chai & Snacks", Amount: 40, Wallet: "Cash", Date: Today (`09-11-2026`).
4. Clicks "Save Expense".
5. Cash Balance decrements from ₹600 to ₹560; Total decrements from ₹3,100 to ₹3,060.
6. Green toast appears: "Expense recorded successfully".

### Flow 3: Roommate Udhaar & Collection
1. Roommate Vikram borrows ₹300 via PhonePe for dinner.
2. User taps "+ Lend Money (Udhaar)".
3. Inputs: Vikram, Phone: 9876543210, Email: vikram@hostel.edu, Amount: ₹300, Wallet: "Online", Due Date: Tomorrow.
4. Online balance decrements by ₹300.
5. Next day, Vikram hasn't paid. Dashboard shows amber alert banner: "1 Pending Udhaar Due: Vikram (₹300)".
6. User taps the phone icon to call Vikram directly.
7. Vikram sends ₹300 on GPay. User clicks "Mark as Collected" -> select Online wallet -> Online balance restored by ₹300.

---

## 5. Non-Functional & UX Requirements
- **Mobile First**: Minimum touch target 44x44px. Full responsiveness on 360px wide devices up to 4K displays.
- **Performance**: Zero client bundle bloat, Next.js server components where appropriate, instant optimistic UI responses.
- **Zero Horizontal Scroll**: Strictly enforced with `overflow-x-hidden` containers and responsive tables turning into cards on mobile.
- **Data Safety**: Password encryption with `bcryptjs`, protected API routes, session tokens.

