/**
 * Strict DD-MM-YYYY Date Utilities for HostelKhata
 */

/**
 * Formats any Date or date string into strict DD-MM-YYYY format (e.g. 09-11-2026)
 */
export function formatDateDDMMYYYY(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "DD-MM-YYYY";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "DD-MM-YYYY";
  
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Parses a DD-MM-YYYY string into a valid JavaScript Date
 */
export function parseDDMMYYYY(dateString: string): Date {
  const parts = dateString.split("-");
  if (parts.length !== 3) return new Date();
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day, 12, 0, 0);
}

/**
 * Converts a Date or ISO string into YYYY-MM-DD for standard HTML <input type="date">
 */
export function toInputDateValue(dateInput: Date | string | number = new Date()): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts an HTML date input value (YYYY-MM-DD) into strict DD-MM-YYYY
 */
export function inputToDDMMYYYY(inputVal: string): string {
  if (!inputVal) return formatDateDDMMYYYY(new Date());
  const [year, month, day] = inputVal.split("-");
  return `${day}-${month}-${year}`;
}

/**
 * Formats a Date into MM-YYYY format (e.g. 11-2026)
 */
export function formatMonthYear(dateInput: Date | string | number = new Date()): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "MM-YYYY";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${year}`;
}

/**
 * Checks if a given due date has passed or is today
 */
export function isOverdue(dueDateInput: Date | string | number): boolean {
  const dueDate = new Date(dueDateInput);
  if (isNaN(dueDate.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dueDate);
  target.setHours(0, 0, 0, 0);
  
  return target.getTime() <= today.getTime();
}

/**
 * Calculates days remaining or overdue
 */
export function getLoanDueStatus(dueDateInput: Date | string | number): {
  isOverdue: boolean;
  isToday: boolean;
  daysDiff: number;
  label: string;
} {
  const dueDate = new Date(dueDateInput);
  if (isNaN(dueDate.getTime())) {
    return { isOverdue: false, isToday: false, daysDiff: 0, label: "Invalid Date" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dueDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { isOverdue: true, isToday: true, daysDiff: 0, label: "Due Today!" };
  } else if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      isOverdue: true,
      isToday: false,
      daysDiff: overdueDays,
      label: `${overdueDays} day${overdueDays > 1 ? "s" : ""} overdue!`,
    };
  } else {
    return {
      isOverdue: false,
      isToday: false,
      daysDiff: diffDays,
      label: `${diffDays} day${diffDays > 1 ? "s" : ""} left`,
    };
  }
}
