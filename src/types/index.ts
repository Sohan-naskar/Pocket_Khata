export type Role = "USER" | "ADMIN";

export type WalletType = "ONLINE" | "CASH";

export type TransactionType =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER"
  | "LOAN_DISBURSEMENT"
  | "LOAN_REPAYMENT";

export type LoanStatus = "PENDING" | "COLLECTED" | "CANCELLED";

export interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

export interface WalletBalances {
  onlineBalance: number;
  cashBalance: number;
  totalBalance: number;
  currency: string;
}

export interface TransactionItem {
  id: string;
  userId: string;
  type: TransactionType;
  wallet: WalletType;
  amount: number;
  category: string;
  description?: string | null;
  date: string | Date;
  loanId?: string | null;
  createdAt: string | Date;
}

export interface LoanItem {
  id: string;
  userId: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerEmail?: string | null;
  amount: number;
  wallet: WalletType;
  lentDate: string | Date;
  dueDate: string | Date;
  status: LoanStatus;
  notes?: string | null;
  collectedAt?: string | Date | null;
  repaymentWallet?: WalletType | null;
  createdAt: string | Date;
}

export const EVERYDAY_EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Groceries & Supermarket",
  "Chai & Snacks",
  "Bills & Recharges",
  "Travel & Fuel",
  "Shopping & Clothes",
  "Health & Pharmacy",
  "Rent & Utilities",
  "Entertainment & OTT",
  "Personal Care",
  "Family & Gifts",
  "Miscellaneous",
] as const;

export const EVERYDAY_INCOME_CATEGORIES = [
  "Monthly Salary",
  "Freelance & Business Gigs",
  "Pocket Money / Allowance",
  "Investments & Dividends",
  "Cashback & Refunds",
  "Other Income",
] as const;

// Backward-compatible aliases
export const HOSTEL_EXPENSE_CATEGORIES = EVERYDAY_EXPENSE_CATEGORIES;
export const HOSTEL_INCOME_CATEGORIES = EVERYDAY_INCOME_CATEGORIES;
