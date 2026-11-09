# HostelKhata — Screen-by-Screen Application Flow (APP_FLOW.md)

> **Document Version**: 1.0.0  
> **Target Devices**: Mobile (iOS & Android Web/PWA) + Tablet + Laptop/Desktop  
> **Navigation Model**: Desktop Collapsible Sidebar + Mobile Bottom Navigation & Quick Action Drawer

---

## 1. Application Sitemap & Route Hierarchy

```
HostelKhata
│
├── Public Routes (Unauthenticated)
│   ├── /                      --> High-conversion Landing Page with feature highlights
│   ├── /login                 --> Sign in via Email/Password or "Continue with Google"
│   └── /signup                --> Student registration (Name, Email, Password, Role)
│
├── Authenticated Student Routes (/dashboard & sub-routes)
│   ├── /dashboard             --> Home command center:
│   │                             ├── 3 Live Cards: Total, Online (UPI), Cash
│   │                             ├── Overdue Udhaar Reminder Alert Banner
│   │                             ├── Quick Action Buttons (+ Expense, + Income, + Lend)
│   │                             ├── Current Month Spent vs Saved Quick Widget
│   │                             └── Recent Day-to-Day Ledger Feed (DD-MM-YYYY)
│   │
│   ├── /transactions          --> Full Day-to-Day Ledger:
│   │                             ├── Search by description / category
│   │                             ├── Filter by Wallet (All, Online, Cash)
│   │                             ├── Filter by Type (All, Income, Expense, Udhaar)
│   │                             └── Strict DD-MM-YYYY chronological date grouping
│   │
│   ├── /udhaar                --> Peer Lending ("Udhaar") Tracker:
│   │                             ├── Tab 1: Pending & Overdue Loans
│   │                             ├── Tab 2: Fully Collected History
│   │                             ├── Contact Cards with one-tap `tel:` and `mailto:`
│   │                             └── "Mark as Collected" action with return wallet selector
│   │
│   ├── /analytics             --> Monthly Spending & Savings Intelligence:
│   │                             ├── Month & Year selector (MM-YYYY)
│   │                             ├── Spent vs Saved comparison bar
│   │                             ├── Category expenditure breakdown
│   │                             └── Wallet usage comparison (UPI vs Cash)
│   │
│   └── /wallet-settings       --> Wallet Profile & Reconcile:
│                                 ├── Edit starting balance for Online & Cash
│                                 ├── Reset / Recalibrate physical wallet
│                                 └── Account profile & sign out
│
├── Administrative Routes (RBAC Protected: ADMIN only)
│   └── /admin                 --> System Admin Telemetry:
│                                 ├── Total Registered Students
│                                 ├── Active Users This Month
│                                 ├── Platform-wide Volume metrics
│                                 └── User Registry with Registration Dates (DD-MM-YYYY)
│
└── Error & Fallback Routes
    └── /not-found             --> Custom 404 page with return-to-dashboard CTA
```

---

## 2. Detailed Screen Navigation & Interactive Modal Flows

### Flow A: Landing & Authentication
```
[Visitor at /]
      │
      ├──> Click "Get Started Free" / "Log In"
      │          │
      │          v
      │      [/login] <─────> [/signup]
      │          │
      │          ├──> Option 1: "Continue with Google" (OAuth)
      │          └──> Option 2: Email + Password submission
      │                    │
      │                    v
      └───────── Validated & Session Created
                           │
                           v
                     [/dashboard]
```

### Flow B: Live Dual-Wallet Operations (Expense / Income)
```
[/dashboard]
      │
      ├──> Tap "+ Add Expense" Button
      │          │
      │          v
      │      [Add Expense Modal]
      │          ├── Category: (Food & Mess, Chai, Xerox, Travel, etc.)
      │          ├── Amount: ₹...
      │          ├── Wallet: [ONLINE (UPI)] or [CASH (Physical)]
      │          ├── Date: DD-MM-YYYY (Default: Today)
      │          └── Note: Optional description
      │          │
      │          v
      │      Click "Record Expense"
      │          │
      │          v
      │      Prisma atomic decrement of selected wallet balance
      │      Instant UI update on Total Balance & Target Wallet Card
      │      Green toast: "₹... expense recorded from ..."
      │
      └──> Tap "+ Add Money (Income)" Button
                 │
                 v
             [Add Income Modal]
                 ├── Amount: ₹...
                 ├── Wallet: [ONLINE] or [CASH]
                 ├── Category: (Monthly Allowance, Refund, Freelance, etc.)
                 └── Date: DD-MM-YYYY
                 │
                 v
             Atomic increment of selected wallet balance & Total balance
```

### Flow C: Udhaar (Lending) Lifecycle & Overdue Reminder
```
[/dashboard] or [/udhaar]
      │
      ├──> Tap "+ Lend Money"
      │          │
      │          v
      │      [Lend Money Modal]
      │          ├── Borrower Name: "Vikram"
      │          ├── Phone: "9876543210"
      │          ├── Email: "vikram@hostel.edu"
      │          ├── Amount: ₹500
      │          ├── Wallet Lent From: [ONLINE] or [CASH]
      │          ├── Lent Date: DD-MM-YYYY
      │          ├── Expected Return Date: DD-MM-YYYY
      │          └── Purpose / Note
      │          │
      │          v
      │      Deducts ₹500 from chosen wallet
      │      Creates Loan record with status 'PENDING'
      │
      ▼
When current date >= Expected Return Date:
      │
      ├──> Dashboard surfaces [Overdue Udhaar Alert Banner]
      │          ├── High-visibility Amber/Red callout card
      │          ├── Borrower Name & Overdue Amount
      │          ├── Clickable [Call: tel:+91...] button (immediate phone dialer)
      │          ├── Clickable [Email: mailto:...] button (pre-filled reminder email)
      │          └── [Mark as Collected] button
      │
      ▼
When Borrower repays:
      │
      ├──> Tap [Mark as Collected]
      │          │
      │          v
      │      [Collect Udhaar Modal]
      │          ├── Confirm Amount: ₹500
      │          └── Received In Wallet: [ONLINE (UPI)] or [CASH]
      │          │
      │          v
      │      Status -> 'COLLECTED'
      │      Credits ₹500 back to the chosen wallet
      │      Overdue alert dismisses automatically
      │      Green toast: "Udhaar from Vikram marked as collected!"
```

---

## 3. Responsive Navigation Behavior (Desktop vs Mobile)

### Desktop (>= 1024px)
- **Persistent Left Sidebar** (width: 260px):
  - Brand Logo + HostelKhata tag.
  - Active links: Dashboard, Ledger, Udhaar, Analytics, Wallet Settings.
  - Role-protected Admin link (`/admin`) visible only if `session.user.role === 'ADMIN'`.
  - User profile strip at bottom with avatar, name, email, and one-click Sign Out.
- **Top Header**:
  - Page title.
  - Quick action buttons: "+ Add Expense", "+ Add Income", "+ Lend Money".
  - Date indicator in `DD-MM-YYYY`.

### Mobile (< 1024px)
- **Top App Bar**:
  - HostelKhata logo (tap routes to `/dashboard`).
  - Mobile hamburger button opening a Slide-Over Navigation Drawer with full links.
  - Role indicator badge (`USER` or `ADMIN`).
- **Sticky Bottom Navigation Bar**:
  - 4 high-priority items with minimum 44x44px touch targets:
    1. **Dashboard** (Home icon)
    2. **Ledger** (ReceiptText icon)
    3. **Udhaar** (HandCoins icon with pending badge count)
    4. **Analytics** (BarChart3 icon)
- **Floating / Sticky Action**:
  - Prominent "+ Log" button on dashboard for lightning-fast expense entry while walking in the hostel corridor.

