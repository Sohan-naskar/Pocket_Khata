import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    template: "%s | HostelKhata",
    default: "HostelKhata — Student Wallet & Udhaar Tracker",
  },
  description:
    "Responsive multi-user day-to-day personal finance and lending (Udhaar) tracker designed for students, bachelors, and hostellers. Track UPI vs Cash balances with zero effort.",
  keywords: [
    "HostelKhata",
    "hostel expense tracker",
    "bachelor finance",
    "student wallet",
    "udhaar tracker",
    "UPI vs Cash",
  ],
  authors: [{ name: "HostelKhata Team" }],
};

export const viewport: Viewport = {
  themeColor: "#090D16",
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090D16] text-[#F9FAFB] antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

