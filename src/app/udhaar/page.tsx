"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { LoanItem } from "@/types";
import { formatCurrency, formatPhoneForTel, createMailtoReminder } from "@/lib/utils";
import { formatDateDDMMYYYY, getLoanDueStatus } from "@/lib/date-utils";
import { CollectLoanModal } from "@/components/modals/CollectLoanModal";
import {
  HandCoins,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  PlusCircle,
  AlertTriangle,
  History,
  CreditCard,
  Banknote,
} from "lucide-react";

export default function UdhaarPage() {
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [activeTab, setActiveTab] = useState<"PENDING" | "COLLECTED">("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoanForCollect, setSelectedLoanForCollect] = useState<LoanItem | null>(null);

  const fetchLoans = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/loans");
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (err) {
      console.error("Loans fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const pendingLoans = loans.filter((l) => l.status === "PENDING");
  const collectedLoans = loans.filter((l) => l.status === "COLLECTED");
  const totalPendingAmount = pendingLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalCollectedAmount = collectedLoans.reduce((sum, l) => sum + l.amount, 0);

  return (
    <DashboardShell>
      {({ onOpenLendModal, refreshKey }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (refreshKey > 0) {
            fetchLoans();
          }
        }, [refreshKey]);

        return (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <HandCoins className="w-4 h-4" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Peer Lending (Udhaar) Tracker
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Track money lent to roommates & friends with 1-tap call & email reminders.
                </p>
              </div>

              <button
                onClick={onOpenLendModal}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Lend New Udhaar</span>
              </button>
            </div>

            {/* Summary Cards for Udhaar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#111827] border border-amber-500/30 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Total Pending to Collect</span>
                </div>
                <p className="text-2xl sm:text-3xl font-financial font-extrabold text-amber-400">
                  {formatCurrency(totalPendingAmount)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Across {pendingLoans.length} active borrower{pendingLoans.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#111827] border border-emerald-500/30 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Total Recovered / Repaid</span>
                </div>
                <p className="text-2xl sm:text-3xl font-financial font-extrabold text-emerald-400">
                  {formatCurrency(totalCollectedAmount)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Across {collectedLoans.length} collected loan{collectedLoans.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab("PENDING")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[44px] ${
                  activeTab === "PENDING"
                    ? "bg-amber-600/20 border border-amber-500/50 text-amber-300"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Active & Overdue ({pendingLoans.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("COLLECTED")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[44px] ${
                  activeTab === "COLLECTED"
                    ? "bg-emerald-600/20 border border-emerald-500/50 text-emerald-300"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Collected History ({collectedLoans.length})</span>
              </button>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-[#111827] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : activeTab === "PENDING" ? (
              pendingLoans.length === 0 ? (
                <div className="text-center py-16 px-4 bg-[#111827] rounded-2xl border border-slate-800">
                  <HandCoins className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-base font-semibold text-white">No pending Udhaar!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Nobody owes you money right now. Tap &ldquo;+ Lend New Udhaar&rdquo; to record a loan.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingLoans.map((loan) => {
                    const status = getLoanDueStatus(loan.dueDate);
                    const telHref = `tel:${formatPhoneForTel(loan.borrowerPhone)}`;
                    const mailtoHref = loan.borrowerEmail
                      ? createMailtoReminder({
                          email: loan.borrowerEmail,
                          borrowerName: loan.borrowerName,
                          amount: loan.amount,
                          dueDate: formatDateDDMMYYYY(loan.dueDate),
                        })
                      : null;

                    return (
                      <div
                        key={loan.id}
                        className={`p-4 sm:p-5 rounded-2xl bg-[#111827] border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          status.isOverdue
                            ? "border-amber-500/60 shadow-lg shadow-amber-950/30"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* Left Details */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-white">
                              {loan.borrowerName}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                status.isOverdue
                                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {status.label}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-1 ${
                                loan.wallet === "ONLINE"
                                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {loan.wallet === "ONLINE" ? (
                                <>
                                  <CreditCard className="w-2.5 h-2.5" /> Lent via UPI
                                </>
                              ) : (
                                <>
                                  <Banknote className="w-2.5 h-2.5" /> Lent via Cash
                                </>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono flex-wrap">
                            <span>Lent: {formatDateDDMMYYYY(loan.lentDate)}</span>
                            <span>Due: {formatDateDDMMYYYY(loan.dueDate)}</span>
                            <span>Phone: {loan.borrowerPhone}</span>
                            {loan.borrowerEmail && <span>Email: {loan.borrowerEmail}</span>}
                          </div>

                          {loan.notes && (
                            <p className="text-xs text-slate-300 italic">
                              &ldquo;{loan.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Right: Amount & 1-tap Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                          <div className="text-left md:text-right mr-2">
                            <p className="text-xs text-slate-400">Amount Due</p>
                            <p className="text-xl font-financial font-extrabold text-amber-400">
                              {formatCurrency(loan.amount)}
                            </p>
                          </div>

                          {/* 1-Tap Call Link */}
                          <a
                            href={telHref}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition min-h-[44px] min-w-[44px] justify-center"
                            title={`Call ${loan.borrowerName}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>

                          {/* 1-Tap Email Link */}
                          {mailtoHref ? (
                            <a
                              href={mailtoHref}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition min-h-[44px] min-w-[44px] justify-center"
                              title={`Send email reminder to ${loan.borrowerName}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </a>
                          ) : null}

                          {/* Mark as Collected */}
                          <button
                            onClick={() => setSelectedLoanForCollect(loan)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition min-h-[44px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Collected</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              // Collected Loans Tab
              collectedLoans.length === 0 ? (
                <div className="text-center py-16 px-4 bg-[#111827] rounded-2xl border border-slate-800">
                  <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-base font-semibold text-white">No collected loans yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When friends return borrowed money, tap &ldquo;Collected&rdquo; on an active loan!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collectedLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-90"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {loan.borrowerName}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Collected
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-3 flex-wrap">
                          <span>Lent: {formatDateDDMMYYYY(loan.lentDate)}</span>
                          <span>
                            Collected on:{" "}
                            {loan.collectedAt
                              ? formatDateDDMMYYYY(loan.collectedAt)
                              : "Earlier"}
                          </span>
                          <span>
                            Deposited to:{" "}
                            {loan.repaymentWallet === "ONLINE" ? "Online UPI" : "Cash"}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-lg font-financial font-extrabold text-emerald-400">
                          +{formatCurrency(loan.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Collect Modal */}
            <CollectLoanModal
              loan={selectedLoanForCollect}
              isOpen={!!selectedLoanForCollect}
              onClose={() => setSelectedLoanForCollect(null)}
              onSuccess={() => {
                setSelectedLoanForCollect(null);
                fetchLoans();
              }}
            />
          </div>
        );
      }}
    </DashboardShell>
  );
}

