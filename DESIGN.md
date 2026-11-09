# HostelKhata — UI/UX Design System & Style Guide

> **Design Theme**: Clean, high-contrast, modern Fintech crafted for students & bachelors.  
> **Mobile Target**: Fluid responsive layouts for smartphones (360px+) through ultrawide laptops with zero horizontal scrolling (`overflow-x-hidden`).

---

## 1. Color Palette & Visual Token Identity

### Semantic Wallet Color Architecture
| Semantic Role | Color Name | Hex Code | Tailwind Equivalent | Meaning / Context |
|---|---|---|---|---|
| **Online Wallet (Primary)** | UPI Blue | `#2563EB` | `bg-blue-600` / `text-blue-600` | Bank accounts, Google Pay, PhonePe, Paytm, NetBanking |
| **Online Wallet Glow** | Electric Sky | `#38BDF8` | `text-sky-400` / `border-sky-500` | High-contrast highlights for online balance cards |
| **Cash Wallet** | Physical Emerald | `#059669` | `bg-emerald-600` / `text-emerald-600` | Cash in pocket, notes in desk, physical currency |
| **Cash Wallet Glow** | Mint Glow | `#34D399` | `text-emerald-400` / `border-emerald-500`| High-contrast highlights for cash balance cards |
| **Total Balance (Combined)** | Indigo Royale | `#4F46E5` | `bg-indigo-600` / `text-indigo-600` | The unified net financial position |
| **Expense (Debit)** | Crimson Rose | `#E11D48` | `bg-rose-600` / `text-rose-600` | Money going out, expenses, fees, chai |
| **Income (Credit)** | Emerald Green | `#10B981` | `bg-emerald-500` / `text-emerald-500`| Allowance from parents, salary, refunds |
| **Udhaar / Alert (Lent)** | Amber Sunset | `#D97706` | `bg-amber-600` / `text-amber-500` | Money lent to friends, pending collection |
| **Overdue Danger** | Bright Red | `#DC2626` | `bg-red-600` / `text-red-500` | Overdue loans past collection date |

### Neutrals & Surfaces (Dark Mode Focused with High-Contrast Light Mode)
- **Background Primary**: `#090D16` (Deep Obsidian Midnight)
- **Card / Surface Background**: `#111827` (Rich Slate Glass)
- **Surface Hover**: `#1F2937` (Muted Slate)
- **Border Subtle**: `#374151` / `rgba(255, 255, 255, 0.1)`
- **Text Primary**: `#F9FAFB` (Crisp Ice White)
- **Text Secondary / Muted**: `#9CA3AF` (Balanced Silver Gray)

---

## 2. Typography

HostelKhata uses a dual-font pairing strategy:
1. **Primary Interface Font**: `Inter` (or system modern sans-serif: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
   - Used for headers, descriptions, buttons, forms, labels, alerts.
   - Clean, highly legible on small mobile screens.
2. **Financial Numbers Font**: `JetBrains Mono` (or `monospace` with `tabular-nums font-mono`)
   - Used for all currency values, amounts, wallet balances, dates (`DD-MM-YYYY`), and phone numbers.
   - Fixed-width characters prevent layout jumping during live calculation and counter animations.

---

## 3. Responsive Breakpoints & Mobile-First Navigation

- **Mobile (< 640px)**:
  - Top mini-header with Logo, current role badge, and user avatar.
  - Full-screen container with `px-4 py-3`, no horizontal scroll (`overflow-x-hidden`).
  - **Fixed Bottom Navigation Bar** with 4 core icons: Dashboard, Ledger, Udhaar, and Profile/Settings (minimum 56px height with 44x44px touch targets).
  - Quick "+ Log" floating action button (FAB) or dedicated bottom sheet for rapid logging on the go.
  - Multi-column tables collapse into vertical card components with clear visual hierarchy.
- **Tablet (640px – 1023px)**:
  - 2-column grid for wallet summary cards.
  - Side drawer or top navigation bar.
- **Laptop & Desktop (>= 1024px)**:
  - Left persistent sidebar (with Logo, Navigation, Role badge, User info, Sign Out).
  - 3-column top card grid: Total Balance, Online Balance, Cash Balance.
  - Split views: Ledger on the left, Udhaar Reminder panel & Analytics on the right.

---

## 4. Component States & Interactive Feedback

- **Buttons**:
  - Minimum touch target: **44px × 44px**.
  - Default: Bold text, clear icon, visible background.
  - Hover: Subtle brightness lift or scale (`hover:brightness-110 active:scale-[0.98]`).
  - Loading: Animated SVG spinner (`lucide-react` Loader2) with disabled interaction and `opacity-75`.
  - Disabled: Grayscale opacity (`cursor-not-allowed opacity-50`).
- **Interactive Feedback (Toasts)**:
  - **Green Success Toast**: Checkmark icon, clear confirmation (e.g., "Expense of ₹120 logged from Cash").
  - **Red Error Toast**: AlertCircle icon, actionable message (e.g., "Starting balance cannot be negative").
  - **Amber Notice Toast**: AlertTriangle icon (e.g., "Expected return date cannot be before lent date").
- **Modals & Bottom Sheets**:
  - Smooth slide-up on mobile, centered dialog on desktop.
  - Backdrop blur (`backdrop-blur-sm bg-black/60`).
  - Auto-focus on primary input, escape key and overlay tap to dismiss.

---

## 5. 20-Point Quality UX Enforcement Matrix

1. **No Horizontal Scroll**: Applied `overflow-x-hidden` on `body`, `main`, and inner wrappers.
2. **Zero Broken Links**: All routes (`/`, `/dashboard`, `/transactions`, `/udhaar`, `/analytics`, `/wallet-settings`, `/admin`) validly mapped.
3. **Responsive Mobile Menu**: Dual system: sticky bottom bar on mobile + hamburger drawer with quick actions.
4. **Custom Favicon & Metadata**: Dynamic `title` ("HostelKhata — Student Wallet & Udhaar Tracker") and structured meta description on every page.
5. **Dynamic Footer**: Dynamic `new Date().getFullYear()` and helpful student links (Privacy, Terms, Help, GitHub).
6. **Custom 404 Page**: Custom styled `not-found.tsx` with animated broken-chai icon and "Return to Dashboard" button.
7. **SVG / Icon Optimization**: Crisp Lucide React SVG icons.
8. **Loading & Disabled States**: Every form submit button has `isSubmitting` spinner state.
9. **Zero Lorem Ipsum**: 100% genuine student context (e.g., "Canteen chai", "Hostel Mess Advance", "Lab Manual Xerox").
10. **RBAC Visibility**: Non-admin users never see the `/admin` navigation item.
11. **Responsive Table to Card**: Tables transform into readable stacked cards on screens < 768px.
12. **Clickable Brand Logo**: Directly navigates back to `/dashboard` (or landing page if unauthenticated).
13. **Clickable Contacts**: All borrower phone numbers wrapped in `<a href="tel:...">` and emails in `<a href="mailto:...">`.
14. **44x44px Touch Targets**: Enforced on all tap targets for effortless one-handed smartphone use.
15. **Strict Date Standard**: All dates displayed in `DD-MM-YYYY` format.
16. **Live Calculation Feed**: Real-time balance updates upon logging income, expenses, and loan recoveries.
17. **Overdue Banner**: High-contrast reminder card at the very top of dashboard when loans are overdue.
18. **Accessible Form Labels**: Proper `htmlFor`, ARIA tags, and placeholder text.
19. **Empty States**: Encouraging friendly illustrations when there are no transactions or loans yet.
20. **Smooth Transitions**: Micro-interactions with CSS transitions for smooth and snappy feel.

