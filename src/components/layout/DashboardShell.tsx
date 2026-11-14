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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col overflow-x-hidden selection:bg-zinc-800 selection:text-white">
      {/* Top Skiper Dynamic Navbar */}
      <AppNavbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenNewEntry={handleOpenNewEntry}
        onOpenAddExpense={() => handleOpenNewEntry("EXPENSE")}
        onOpenAddIncome={() => handleOpenNewEntry("INCOME")}
        onOpenLendModal={() => handleOpenNewEntry("LEND")}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Obsidian Sidebar */}
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

      {/* Unified Fast Entry Modal (Single modal replaces multiple redundant separate modals) */}
      <UnifiedTransactionModal
        isOpen={isUnifiedModalOpen}
        initialTab={modalTab}
        onClose={() => setIsUnifiedModalOpen(false)}
        onSuccess={() => triggerRefresh()}
      />
    </div>
  );
}
