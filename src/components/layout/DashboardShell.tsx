"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { AppFooter } from "@/components/layout/AppFooter";
import { AddExpenseModal } from "@/components/modals/AddExpenseModal";
import { AddIncomeModal } from "@/components/modals/AddIncomeModal";
import { LendLoanModal } from "@/components/modals/LendLoanModal";
import { MobileQuickActionsModal } from "@/components/modals/MobileQuickActionsModal";

interface DashboardShellProps {
  children: (props: {
    onOpenAddExpense: () => void;
    onOpenAddIncome: () => void;
    onOpenLendModal: () => void;
    refreshKey: number;
    triggerRefresh: () => void;
  }) => React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isLendOpen, setIsLendOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col overflow-x-hidden">
      {/* Top Navbar */}
      <AppNavbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAddExpense={() => setIsExpenseOpen(true)}
        onOpenAddIncome={() => setIsIncomeOpen(true)}
        onOpenLendModal={() => setIsLendOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <AppSidebar
          onOpenAddExpense={() => setIsExpenseOpen(true)}
          onOpenAddIncome={() => setIsIncomeOpen(true)}
          onOpenLendModal={() => setIsLendOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden pb-24 lg:pb-12">
          {children({
            onOpenAddExpense: () => setIsExpenseOpen(true),
            onOpenAddIncome: () => setIsIncomeOpen(true),
            onOpenLendModal: () => setIsLendOpen(true),
            refreshKey,
            triggerRefresh,
          })}
        </main>
      </div>

      {/* Footer */}
      <AppFooter />

      {/* Mobile Sticky Bottom Nav */}
      <BottomNav onOpenQuickMenu={() => setIsQuickActionsOpen(true)} />

      {/* Mobile Slide-Over Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAddExpense={() => setIsExpenseOpen(true)}
        onOpenAddIncome={() => setIsIncomeOpen(true)}
        onOpenLendModal={() => setIsLendOpen(true)}
      />

      {/* Mobile Center Quick Action Sheet */}
      <MobileQuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onSelectExpense={() => setIsExpenseOpen(true)}
        onSelectIncome={() => setIsIncomeOpen(true)}
        onSelectLend={() => setIsLendOpen(true)}
      />

      {/* Modals */}
      <AddExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onSuccess={() => triggerRefresh()}
      />

      <AddIncomeModal
        isOpen={isIncomeOpen}
        onClose={() => setIsIncomeOpen(false)}
        onSuccess={() => triggerRefresh()}
      />

      <LendLoanModal
        isOpen={isLendOpen}
        onClose={() => setIsLendOpen(false)}
        onSuccess={() => triggerRefresh()}
      />
    </div>
  );
}

