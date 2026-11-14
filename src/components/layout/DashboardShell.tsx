"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { UnifiedTransactionModal, EntryTab } from "@/components/modals/UnifiedTransactionModal";

export interface DashboardShellProps {
  children: (props: {
    onOpenNewEntry: (tab?: EntryTab) => void;
    onOpenAddExpense: () => void;
    onOpenAddIncome: () => void;
    onOpenLendModal: () => void;
    refreshKey: number;
    triggerRefresh: () => void;
  }) => React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<EntryTab>("EXPENSE");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenNewEntry = (tab: EntryTab = "EXPENSE") => {
    setModalTab(tab);
    setIsUnifiedModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] dark:bg-[#0B0F19] text-slate-100 dark:text-slate-100 flex flex-col overflow-x-hidden relative transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      {/* Neo-Fintech Ambient Radiant Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-600/15 dark:bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none z-0" />

      {/* Top Glass Navbar */}
      <AppNavbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenNewEntry={handleOpenNewEntry}
        onOpenAddExpense={() => handleOpenNewEntry("EXPENSE")}
        onOpenAddIncome={() => handleOpenNewEntry("INCOME")}
        onOpenLendModal={() => handleOpenNewEntry("LEND")}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Desktop Frosted Sidebar */}
        <AppSidebar
          onOpenNewEntry={handleOpenNewEntry}
          onOpenAddExpense={() => handleOpenNewEntry("EXPENSE")}
          onOpenAddIncome={() => handleOpenNewEntry("INCOME")}
          onOpenLendModal={() => handleOpenNewEntry("LEND")}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden pb-24 lg:pb-12">
          {children({
            onOpenNewEntry: handleOpenNewEntry,
            onOpenAddExpense: () => handleOpenNewEntry("EXPENSE"),
            onOpenAddIncome: () => handleOpenNewEntry("INCOME"),
            onOpenLendModal: () => handleOpenNewEntry("LEND"),
            refreshKey,
            triggerRefresh,
          })}
        </main>
      </div>

      {/* Mobile Floating Action Nav */}
      <BottomNav onOpenQuickMenu={() => handleOpenNewEntry("EXPENSE")} />

      {/* Mobile Slide-Over Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenNewEntry={handleOpenNewEntry}
        onOpenAddExpense={() => handleOpenNewEntry("EXPENSE")}
        onOpenAddIncome={() => handleOpenNewEntry("INCOME")}
        onOpenLendModal={() => handleOpenNewEntry("LEND")}
      />

      {/* Unified Fast Entry Modal with Neo-Fintech Glass Styling */}
      <UnifiedTransactionModal
        isOpen={isUnifiedModalOpen}
        initialTab={modalTab}
        onClose={() => setIsUnifiedModalOpen(false)}
        onSuccess={() => triggerRefresh()}
      />
    </div>
  );
}
