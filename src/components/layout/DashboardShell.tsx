"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { UnifiedTransactionModal, EntryTabType } from "@/components/modals/UnifiedTransactionModal";

export interface DashboardShellProps {
  children: (props: {
    onOpenAddExpense: () => void;
    onOpenAddIncome: () => void;
    onOpenLendModal: () => void;
    onOpenNewEntry: (tab?: EntryTabType) => void;
    refreshKey: number;
    triggerRefresh: () => void;
  }) => React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<EntryTabType>("EXPENSE");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenNewEntry = (tab: EntryTabType = "EXPENSE") => {
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
            onOpenAddExpense: () => handleOpenNewEntry("EXPENSE"),
            onOpenAddIncome: () => handleOpenNewEntry("INCOME"),
            onOpenLendModal: () => handleOpenNewEntry("LEND"),
            onOpenNewEntry: handleOpenNewEntry,
            refreshKey,
            triggerRefresh,
          })}
        </main>
      </div>

      {/* Mobile Floating Action Nav (4 icons + 1 center action) */}
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

      {/* Unified Fast Entry Modal (Replaces 3 redundant separate modals) */}
      <UnifiedTransactionModal
        isOpen={isUnifiedModalOpen}
        onClose={() => setIsUnifiedModalOpen(false)}
        defaultTab={modalTab}
        onSuccess={() => triggerRefresh()}
      />
    </div>
  );
}
