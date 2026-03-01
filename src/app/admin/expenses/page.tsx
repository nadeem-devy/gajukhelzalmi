"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  AdminIcon,
} from "@/components/layout/icons";
import type { Expense } from "@/lib/types";

export default function AdminExpensesPage() {
  const { t, td } = useLang();
  const { user, canSubmitExpenses, canApproveExpenses } = useAuth();
  const { expenses, approveExpense, rejectExpense } = useStore();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  if (!canSubmitExpenses) {
    return (
      <div className="container-page">
        <div className="empty-state">
          <AdminIcon className="w-12 h-12 text-warmgray-300" />
          <h2 className="text-lg font-bold text-warmgray-700 mt-3">{t("adminExpenses.adminAccessRequired")}</h2>
          <Link href="/login" className="btn-primary mt-4">{t("admin.goToLogin")}</Link>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? expenses : expenses.filter(e => e.status === filter);
  const pendingCount = expenses.filter(e => e.status === "pending").length;

  const handleApprove = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    approveExpense(id, user!.id);
    if (selectedExpense?.id === id) setSelectedExpense(null);
  };

  const handleReject = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    rejectExpense(id);
    if (selectedExpense?.id === id) setSelectedExpense(null);
  };

  return (
    <div className="container-page">
      <div className="page-header">
        <Link href="/admin" className="btn-ghost mb-3 inline-flex">
          <ArrowLeftIcon className="w-4 h-4" />
          {t("adminExpenses.backToAdmin")}
        </Link>
        <h1 className="section-title">{t("adminExpenses.title")}</h1>
        <p className="section-subtitle">{t("adminExpenses.subtitle")} &middot; {pendingCount} {t("admin.pending")}</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${filter === status
                ? "bg-primary-600 text-white"
                : "bg-warmgray-100 text-warmgray-600 hover:bg-warmgray-200"
              }`}
          >
            {status === "all" ? t("common.all") : t(`status.${status}`)}
            {status === "pending" && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filtered.map((expense) => (
          <div
            key={expense.id}
            className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${
              expense.status === "pending" ? "border-l-4 border-l-yellow-400" : ""
            }`}
            onClick={() => setSelectedExpense(expense)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-warmgray-900">{td(`${expense.id}.description`, expense.description)}</h3>
                  <Badge status={expense.status} />
                </div>
                <p className="text-xs text-warmgray-500">
                  {formatDate(expense.date)} &middot; {t(`expenseCategory.${expense.category}`) !== `expenseCategory.${expense.category}` ? t(`expenseCategory.${expense.category}`) : expense.category}
                </p>
              </div>
              <p className="text-base font-bold text-warmgray-900">{formatCurrency(expense.amount)}</p>
            </div>

            {expense.status === "pending" && canApproveExpenses && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  onClick={(e) => handleApprove(expense.id, e)}
                >
                  {t("adminExpenses.approve")}
                </button>
                <button
                  className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  onClick={(e) => handleReject(expense.id, e)}
                >
                  {t("adminExpenses.reject")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <CheckCircleIcon className="w-12 h-12 text-warmgray-300" />
          <h3 className="text-lg font-semibold text-warmgray-600 mt-3">{t("adminExpenses.noExpenses")}</h3>
          <p className="text-sm text-warmgray-400 mt-1">{t("adminExpenses.allCaughtUp")}</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedExpense && (
        <Modal isOpen={!!selectedExpense} onClose={() => setSelectedExpense(null)} title={t("adminExpenses.expenseDetails")}>
          <div className="space-y-4">
            <div className="bg-warmgray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-extrabold text-warmgray-900">{formatCurrency(selectedExpense.amount)}</p>
              <div className="mt-2"><Badge status={selectedExpense.status} /></div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-warmgray-100">
                <span className="text-warmgray-500">{t("adminExpenses.description")}</span>
                <span className="font-medium">{td(`${selectedExpense.id}.description`, selectedExpense.description)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-warmgray-100">
                <span className="text-warmgray-500">{t("adminExpenses.category")}</span>
                <span className="font-medium">{t(`expenseCategory.${selectedExpense.category}`) !== `expenseCategory.${selectedExpense.category}` ? t(`expenseCategory.${selectedExpense.category}`) : selectedExpense.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-warmgray-100">
                <span className="text-warmgray-500">{t("adminExpenses.date")}</span>
                <span className="font-medium">{formatDate(selectedExpense.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-warmgray-100">
                <span className="text-warmgray-500">{t("adminExpenses.submitted")}</span>
                <span className="font-medium">{formatDate(selectedExpense.submittedAt)}</span>
              </div>
              {selectedExpense.approvedAt && (
                <div className="flex justify-between py-2 border-b border-warmgray-100">
                  <span className="text-warmgray-500">{t("adminExpenses.approved")}</span>
                  <span className="font-medium">{formatDate(selectedExpense.approvedAt)}</span>
                </div>
              )}
            </div>

            {selectedExpense.status === "pending" && canApproveExpenses && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleApprove(selectedExpense.id)} className="flex-1 btn-primary justify-center bg-green-600 hover:bg-green-700">
                  <CheckCircleIcon className="w-4 h-4" />
                  {t("adminExpenses.approve")}
                </button>
                <button onClick={() => handleReject(selectedExpense.id)} className="flex-1 btn-secondary text-red-600 border-red-200 hover:bg-red-50">
                  {t("adminExpenses.reject")}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
