import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupee currency (e.g. ₹1,250.00 or ₹1,250)
 */
export function formatCurrency(amount: number, showDecimals: boolean = true): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return `${isNegative ? "-" : ""}₹${formatted}`;
}

/**
 * Clean phone number for tel: link (defaults to +91 country code if 10-digit Indian mobile)
 */
export function formatPhoneForTel(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.length === 10 && !cleaned.startsWith("+")) {
    return `+91${cleaned}`;
  }
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

/**
 * Generate a friendly hostel reminder mailto link
 */
export function createMailtoReminder({
  email,
  borrowerName,
  amount,
  dueDate,
  lenderName,
}: {
  email: string;
  borrowerName: string;
  amount: number;
  dueDate: string;
  lenderName?: string;
}): string {
  const subject = encodeURIComponent(`Hostel Reminder: Pending Udhaar of ₹${amount}`);
  const body = encodeURIComponent(
    `Hey ${borrowerName},\n\nJust a quick and friendly reminder regarding the ₹${amount} borrowed on HostelKhata, which was due on ${dueDate}.\n\nPlease UPI it over whenever you get a chance.\n\nThanks!\n${lenderName || "Your Roommate"}`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

