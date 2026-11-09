# HostelKhata — Technical Requirements Document (TRD)

> **Document Version**: 1.0.0  
> **Architecture Pattern**: Next.js App Router + TypeScript + Tailwind CSS + Prisma ORM + Auth.js v5 + SQLite / PostgreSQL  
> **Security Standard**: Role-Based Access Control (RBAC), user-partitioned queries, bcrypt password hashing.

---

## 1. System Architecture Overview

```
+-------------------------------------------------------------------------+
|                                CLIENT                                   |
|   Responsive Web App (Laptop / Mobile PWA-Ready Viewport)               |
|   - Tailwind CSS Mobile Breakpoints (<640px, <768px, >=1024px)          |
|   - Bottom Nav Bar (Mobile) + Collapsible Sidebar / Header (Desktop)    |
|   - JetBrains Mono financial numbers + Inter typography                 |
+-------------------------------------------------------------------------+
                                    |
                            HTTP / JSON / RSC
                                    v
+-------------------------------------------------------------------------+
|                         NEXT.JS APP ROUTER                              |
|   - Middleware (Route protection & RBAC redirection)                    |
|   - Server Components (Direct DB queries via Prisma)                    |
|   - Server Actions & Route Handlers (/api/auth, /api/transactions, etc) |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                          AUTHENTICATION LAYER                           |
|   - NextAuth.js v5 / Auth.js                                            |
|   - Credentials Provider (Email/Password with bcryptjs)                 |
|   - Google OAuth Provider (Ready for client credentials)                |
|   - Session Token JWT with Role & UserID payload                        |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                           PRISMA ORM LAYER                              |
|   - SQLite (Local development zero-config: dev.db)                      |
|   - Compatible with PostgreSQL (by swapping provider url)               |
|   - Strict User-scoped operations (where: { userId: session.user.id })  |
+-------------------------------------------------------------------------+
```

---

## 2. Complete Prisma Database Schema

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum WalletType {
  ONLINE
  CASH
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
  LOAN_DISBURSEMENT
  LOAN_REPAYMENT
}

enum LoanStatus {
  PENDING
  COLLECTED
  CANCELLED
}

model User {
  id            String         @id @default(cuid())
  name          String?
  email         String         @unique
  emailVerified DateTime?
  passwordHash  String?
  image         String?
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  accounts      Account[]
  sessions      Session[]
  walletProfile WalletProfile?
  transactions  Transaction[]
  loans         Loan[]

  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model WalletProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  onlineBalance Float    @default(0.0)
  cashBalance   Float    @default(0.0)
  currency      String   @default("INR")
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Transaction {
  id          String          @id @default(cuid())
  userId      String
  type        TransactionType
  wallet      WalletType
  amount      Float
  category    String          // e.g., "Food & Mess", "Chai & Snacks", "Allowance", etc.
  description String?
  date        DateTime        // Transaction date (normalized to UTC, rendered DD-MM-YYYY)
  loanId      String?         // Optional link if generated by a loan
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  loan Loan? @relation(fields: [loanId], references: [id], onDelete: SetNull)

  @@index([userId, date])
  @@index([userId, type])
}

model Loan {
  id                 String      @id @default(cuid())
  userId             String
  borrowerName       String
  borrowerPhone      String
  borrowerEmail      String?
  amount             Float
  wallet             WalletType  // Wallet from which money was lent (ONLINE or CASH)
  lentDate           DateTime    // Date money was given (rendered DD-MM-YYYY)
  dueDate            DateTime    // Expected return date (rendered DD-MM-YYYY)
  status             LoanStatus  @default(PENDING)
  notes              String?
  collectedAt        DateTime?
  repaymentWallet    WalletType? // Wallet into which repaid money was returned
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId, status])
  @@index([userId, dueDate])
}
```

---

## 3. Dual-Wallet Calculation Engine

### Balance State Invariants:
1. `Online Balance` = Initial Online Starting Balance + $\sum$ Online Incomes - $\sum$ Online Expenses - $\sum$ Online Loans Lent + $\sum$ Online Loans Repaid.
2. `Cash Balance` = Initial Cash Starting Balance + $\sum$ Cash Incomes - $\sum$ Cash Expenses - $\sum$ Cash Loans Lent + $\sum$ Cash Loans Repaid.
3. `Total Balance` = `Online Balance` + `Cash Balance`.

### Atomic Transaction Execution:
When logging an action, the server updates `WalletProfile` atomically inside a Prisma transaction (`prisma.$transaction`):
- **Income**:
  ```ts
  await prisma.$transaction([
    prisma.transaction.create({ data: { userId, type: 'INCOME', wallet, amount, ... } }),
    prisma.walletProfile.update({
      where: { userId },
      data: wallet === 'ONLINE' ? { onlineBalance: { increment: amount } } : { cashBalance: { increment: amount } }
    })
  ]);
  ```
- **Expense**:
  ```ts
  await prisma.$transaction([
    prisma.transaction.create({ data: { userId, type: 'EXPENSE', wallet, amount, ... } }),
    prisma.walletProfile.update({
      where: { userId },
      data: wallet === 'ONLINE' ? { onlineBalance: { decrement: amount } } : { cashBalance: { decrement: amount } }
    })
  ]);
  ```
- **Lend Udhaar**:
  ```ts
  await prisma.$transaction([
    prisma.loan.create({ data: { userId, borrowerName, borrowerPhone, amount, wallet, lentDate, dueDate, status: 'PENDING' } }),
    prisma.transaction.create({ data: { userId, type: 'LOAN_DISBURSEMENT', wallet, amount, description: `Udhaar to ${borrowerName}`, date: lentDate } }),
    prisma.walletProfile.update({
      where: { userId },
      data: wallet === 'ONLINE' ? { onlineBalance: { decrement: amount } } : { cashBalance: { decrement: amount } }
    })
  ]);
  ```
- **Collect Udhaar**:
  ```ts
  await prisma.$transaction([
    prisma.loan.update({ where: { id: loanId }, data: { status: 'COLLECTED', collectedAt: new Date(), repaymentWallet: returnWallet } }),
    prisma.transaction.create({ data: { userId, type: 'LOAN_REPAYMENT', wallet: returnWallet, amount: loan.amount, description: `Collected Udhaar from ${loan.borrowerName}`, date: new Date(), loanId } }),
    prisma.walletProfile.update({
      where: { userId },
      data: returnWallet === 'ONLINE' ? { onlineBalance: { increment: loan.amount } } : { cashBalance: { increment: loan.amount } }
    })
  ]);
  ```

---

## 4. Date Architecture: Strict `DD-MM-YYYY` Specification
HostelKhata standardizes all visual date outputs to `DD-MM-YYYY`:
```ts
// src/lib/date-utils.ts
export function formatDateDDMMYYYY(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "DD-MM-YYYY";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function parseDDMMYYYY(dateString: string): Date {
  const [day, month, year] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}
```

---

## 5. Security & RBAC Implementation
1. **Password Hashing**: `bcryptjs` with salt round 12.
2. **NextAuth Session Token**:
   - `jwt` callback attaches `token.sub`, `token.role = user.role`, `token.email`.
   - `session` callback maps `session.user.id = token.sub` and `session.user.role = token.role`.
3. **Route Guard Middleware**:
   - Any path under `/dashboard`, `/transactions`, `/udhaar`, `/analytics`, `/settings` requires valid session; redirects unauthenticated visitors to `/login`.
   - Route `/admin` inspects `session.user.role === 'ADMIN'`. If false, returns `403 Forbidden` or redirects to `/dashboard`.
4. **Data Isolation**: All database find/update/delete operations include `where: { userId: session.user.id }`.

---

## 6. REST API & Server Action Endpoints
- `POST /api/auth/register` - Create student account (checks uniqueness, hashes password, creates default `WalletProfile`).
- `GET /api/wallet` & `POST /api/wallet/setup` - Fetch or update starting wallet balances.
- `GET /api/transactions` & `POST /api/transactions` - Fetch filtered transactions & create income/expense.
- `GET /api/loans` & `POST /api/loans` - Fetch peer loans & create new Udhaar.
- `POST /api/loans/[id]/collect` - Mark loan as collected and deposit into chosen wallet.
- `GET /api/analytics` - Return monthly totals (Total Spent, Total Saved, Category breakdown).
- `GET /api/admin/metrics` - Admin-only user statistics and registry list.

