import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | PocketKhata",
    default: "PocketKhata — Daily Expense, Wallet & Udhaar Tracker",
  },
  description:
    "Responsive multi-user day-to-day personal finance, dual-wallet (UPI vs Cash), and lending (Udhaar) tracker designed for everyday life. Track daily spending with zero effort.",
  keywords: [
    "PocketKhata",
    "daily expense tracker",
    "personal finance",
    "UPI vs Cash",
    "udhaar tracker",
    "day to day expenses",
    "daily hisab",
  ],
  authors: [{ name: "PocketKhata Team" }],
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('pocketkhata_theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0B0F19] dark:bg-[#0B0F19] light:bg-[#F8FAFC] text-slate-100 dark:text-slate-100 light:text-slate-900 antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
