"use client";

import React, { useState } from "react";
import { AlertTriangle, Phone, Mail, CheckCircle2, ChevronRight, BellRing } from "lucide-react";
import { LoanItem } from "@/types";
import { formatCurrency, formatPhoneForTel, createMailtoReminder } from "@/lib/utils";
import { formatDateDDMMYYYY, getLoanDueStatus } from "@/lib/date-utils";
import { CollectLoanModal } from "@/components/modals/CollectLoanModal";

interface OverdueAlertBannerProps {
  overdueLoans: LoanItem[];
  onLoanCollected: () => void;
}

export function OverdueAlertBanner({
  overdueLoans,
  onLoanCollected,
}: OverdueAlertBannerProps) {
  const [selectedLoanForCollect, setSelectedLoanForCollect] = useState<LoanItem | null>(null);

  if (!overdueLoans || overdueLoans.length === 0) return null;

  const totalOverdueAmount = overdueLoans.reduce((sum, loan) => sum + loan.amount, 0);

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/90 via-red-950/70 to-slate-900 border-2 border-amber-500/50 p-4 sm:p-5 shadow-2xl shadow-amber-950/40 relative overflow-hidden animate-in fade-in duration-300">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header alert text */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Overdue Udhaar Alert!
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-600 text-white">
                  {overdueLoans.length} Due
                </span>
              </div>
              <p className="text-xs text-amber-300/90">
                You have {formatCurrency(totalOverdueAmount)} pending collection from friends.
              </p>
            </div>
          </div>
        </div>

        {/* List of overdue loans with 1-tap contact buttons */}
        <div className="mt-3 space-y-2.5">
          {overdueLoans.map((loan) => {
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
                className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 gap-3"
              >
                {/* Borrower details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white">
                      {loan.borrowerName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      {status.label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      (Due: {formatDateDDMMYYYY(loan.dueDate)})
                    </span>
                  </div>
                  {loan.notes && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Purpose: &ldquo;{loan.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Amount and interactive actions */}
                <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                  <span className="text-base font-financial font-extrabold text-amber-400 mr-1">
                    {formatCurrency(loan.amount)}
                  </span>

                  {/* 1-Tap Call */}
                  <a
                    href={telHref}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition min-h-[44px] min-w-[44px] justify-center"
                    title={`Call ${loan.borrowerName}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  {/* 1-Tap Email */}
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

                  {/* Mark as Collected button */}
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
      </div>

      {/* Collect Modal */}
      <CollectLoanModal
        loan={selectedLoanForCollect}
        isOpen={!!selectedLoanForCollect}
        onClose={() => setSelectedLoanForCollect(null)}
        onSuccess={() => {
          setSelectedLoanForCollect(null);
          onLoanCollected();
        }}
      />
    </>
  );
}

