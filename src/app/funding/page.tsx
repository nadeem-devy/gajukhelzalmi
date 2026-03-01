"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n/context";
import { formatCurrency, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/badge";
import StatCard from "@/components/ui/stat-card";
import Modal from "@/components/ui/modal";
import DonutChart from "@/components/charts/donut-chart";
import BarChart from "@/components/charts/bar-chart";
import HorizontalBars from "@/components/charts/horizontal-bars";
import { getMonthlyComparison, getDonationsBySource, getExpensesByCategory } from "@/components/charts/chart-utils";
import {
  FundingIcon,
  CalendarIcon,
  FilterIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
} from "@/components/layout/icons";
import type { DonationSource } from "@/lib/types";

type TabType = "overview" | "donations" | "expenses";

export default function FundingPage() {
  const { user, canRecordDonations } = useAuth();
  const { donations, expenses, getFundingSummary, recordDonation } = useStore();
  const { t, td, lang } = useLang();
  const [tab, setTab] = useState<TabType>("overview");
  const funding = getFundingSummary();

  // Record donation modal
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [dAmount, setDAmount] = useState("");
  const [dSource, setDSource] = useState<DonationSource>("cash");
  const [dName, setDName] = useState("");
  const [dReceiver, setDReceiver] = useState("");
  const [dAnonymous, setDAnonymous] = useState(false);
  const [dNotes, setDNotes] = useState("");
  const [dDone, setDDone] = useState(false);

  const handleRecordDonation = () => {
    if (!dAmount || !user || !dName || !dReceiver) return;
    recordDonation({
      amount: Number(dAmount),
      source: dSource,
      donorName: dName,
      anonymous: false,
      notes: dNotes || undefined,
      recordedBy: user.id,
      receiverName: dReceiver,
    });
    setDDone(true);
  };

  const closeDonateForm = () => {
    setShowDonateForm(false);
    setDAmount("");
    setDName("");
    setDReceiver("");
    setDAnonymous(false);
    setDSource("cash");
    setDNotes("");
    setDDone(false);
  };

  const sortedDonations = [...donations].filter(d => d.status !== "rejected").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedExpenses = [...expenses].filter(e => e.status !== "rejected").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container-page">
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="section-title">{t("funding.title")}</h1>
            <p className="section-subtitle">{t("funding.subtitle")}</p>
          </div>
          {canRecordDonations && (
            <button onClick={() => { setShowDonateForm(true); setDDone(false); }} className="btn-primary">
              <PlusIcon className="w-4 h-4" />
              {t("funding.recordDonation")}
            </button>
          )}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <div className="p-2 bg-primary-100 rounded-lg shrink-0">
          <CheckCircleIcon className="w-5 h-5 text-primary-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-900">{t("funding.trustBadgeTitle")}</p>
          <p className="text-xs text-primary-700 mt-0.5">
            {t("funding.trustBadgeDesc")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<FundingIcon />}
          label={t("funding.totalCollected")}
          value={formatCurrency(funding.totalCollected)}
        />
        <StatCard
          icon={<CheckCircleIcon />}
          label={t("funding.totalSpent")}
          value={formatCurrency(funding.totalSpent)}
        />
        <div className="card p-4 sm:p-5">
          <p className="stat-label">{t("funding.balance")}</p>
          <p className="stat-value text-primary-600">{formatCurrency(funding.balance)}</p>
          <p className="text-xs text-warmgray-500 mt-0.5">{t("funding.availableFunds")}</p>
        </div>
        <div className="card p-4 sm:p-5">
          <p className="stat-label">{t("funding.thisMonth")}</p>
          <p className="text-lg font-bold text-green-600">+{formatCurrency(funding.thisMonth.collected)}</p>
          <p className="text-xs text-warmgray-500 mt-0.5">{t("funding.collected")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-warmgray-100 rounded-xl p-1 mb-6">
        {(["overview", "donations", "expenses"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === tabKey
                ? "bg-white text-warmgray-900 shadow-sm"
                : "text-warmgray-500 hover:text-warmgray-700"
              }`}
          >
            {t(`funding.${tabKey}`)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Charts */}
          <DonutChart
            data={getDonationsBySource(donations).map((d) => ({
              label: t(`funding.${d.source}`),
              value: d.amount,
              color: d.color,
            }))}
            title={t("charts.donationsBySource")}
            centerLabel={t("charts.total")}
          />
          <BarChart
            data={getMonthlyComparison(donations, expenses, 6)}
            title={t("charts.monthlyOverview")}
            incomeLabel={t("charts.income")}
            expenseLabel={t("charts.expenses")}
          />
          <HorizontalBars
            data={getExpensesByCategory(expenses).map((c) => ({
              label: t(`expenseCategory.${c.category}`) !== `expenseCategory.${c.category}` ? t(`expenseCategory.${c.category}`) : c.category,
              value: c.amount,
            }))}
            title={t("charts.expenseCategories")}
          />
          {/* Running Balance View */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-warmgray-900 mb-4">{t("funding.runningBalance")}</h3>
            <div className="space-y-2">
              {/* Show combined timeline of donations and expenses */}
              {[...sortedDonations.filter(d => d.status === "approved").map(d => ({
                type: "in" as const,
                date: d.date,
                description: d.anonymous ? t("funding.anonymousDonation") : d.donorName || t("funding.donation"),
                amount: d.amount,
                source: t(`donationSource.${d.source}`),
              })), ...sortedExpenses.filter(e => e.status === "approved").map(e => ({
                type: "out" as const,
                date: e.date,
                description: td(`${e.id}.description`, e.description),
                amount: e.amount,
                source: t(`expenseCategory.${e.category}`) !== `expenseCategory.${e.category}` ? t(`expenseCategory.${e.category}`) : e.category,
              }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15).map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-warmgray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${entry.type === "in" ? "bg-green-500" : "bg-yellow-500"}`} />
                    <div>
                      <p className="text-sm text-warmgray-700">{entry.description}</p>
                      <p className="text-xs text-warmgray-400">{formatDate(entry.date)} &middot; {entry.source}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${entry.type === "in" ? "text-green-600" : "text-yellow-600"}`}>
                    {entry.type === "in" ? "+" : "-"}{formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Donations Tab */}
      {tab === "donations" && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 bg-warmgray-50 border-b border-warmgray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-warmgray-700">{t("funding.allDonations")}</span>
            <span className="text-sm text-warmgray-500">{sortedDonations.length} {t("funding.records")}</span>
          </div>
          <div className="divide-y divide-warmgray-100">
            {sortedDonations.map((donation) => (
              <div key={donation.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold
                    ${donation.source === "cash" ? "bg-green-100 text-green-700" :
                      donation.source === "bank" ? "bg-blue-100 text-blue-700" :
                      donation.source === "jazzcash" ? "bg-red-100 text-red-700" :
                      donation.source === "easypaisa" ? "bg-emerald-100 text-emerald-700" :
                      "bg-warmgray-100 text-warmgray-700"
                    }`}
                  >
                    {donation.source === "cash" ? "₨" :
                     donation.source === "bank" ? "🏦" :
                     donation.source === "jazzcash" ? "📱" :
                     donation.source === "easypaisa" ? "📱" : "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-warmgray-800">
                        {donation.anonymous ? t("funding.anonymousDonor") : td(`donor.${donation.donorName}`, donation.donorName || "") || t("funding.donation")}
                      </p>
                      {donation.status !== "approved" && <Badge status={donation.status} />}
                    </div>
                    <p className="text-xs text-warmgray-500">
                      {formatDate(donation.date)} &middot; {t(`donationSource.${donation.source}`)}
                      {donation.notes && ` &middot; ${donation.notes}`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                  +{formatCurrency(donation.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {tab === "expenses" && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 bg-warmgray-50 border-b border-warmgray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-warmgray-700">{t("funding.allExpenses")}</span>
            <span className="text-sm text-warmgray-500">{sortedExpenses.length} {t("funding.records")}</span>
          </div>
          <div className="divide-y divide-warmgray-100">
            {sortedExpenses.map((expense) => (
              <div key={expense.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <Badge status={expense.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warmgray-800">{td(`${expense.id}.description`, expense.description)}</p>
                    <p className="text-xs text-warmgray-500">
                      {formatDate(expense.date)} &middot; {t(`expenseCategory.${expense.category}`) !== `expenseCategory.${expense.category}` ? t(`expenseCategory.${expense.category}`) : expense.category}
                      {expense.approvedBy && (
                        <> &middot; {t("funding.approved")}</>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-warmgray-700 whitespace-nowrap">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Record Donation Modal */}
      {showDonateForm && (
        <Modal isOpen={showDonateForm} onClose={closeDonateForm} title={dDone ? t("funding.donationSubmitted") : t("funding.recordDonation")}>
          {dDone ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-warmgray-900 mb-2">{t("funding.submittedForApproval")}</h3>
              <p className="text-sm text-warmgray-500 mb-6">
                {t("funding.submittedForApprovalDesc")}
              </p>
              <button onClick={closeDonateForm} className="btn-primary justify-center w-full">{t("common.done")}</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("campaigns.fullName")} <span className="text-red-500">*</span></label>
                <input type="text" className="input-field" placeholder={t("campaigns.fullNamePlaceholder")} value={dName} onChange={(e) => setDName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("funding.amountRs")} <span className="text-red-500">*</span></label>
                <input type="number" className="input-field" placeholder={lang === "ur" ? "مثلاً ۱۰۰۰۰" : "e.g. 10000"} value={dAmount} onChange={(e) => setDAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("campaigns.receiverName")} <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {["Gohar Ali", "Jasir Khan", "Asim Khan"].map((name) => (
                    <button
                      key={name}
                      onClick={() => setDReceiver(name)}
                      className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors text-left
                        ${dReceiver === name ? "bg-primary-50 border-primary-300 text-primary-700" : "border-warmgray-200 text-warmgray-600 hover:bg-warmgray-50"}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("campaigns.accountType")} <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {(["jazzcash", "easypaisa", "bank", "cash"] as const).map((src) => (
                    <button
                      key={src}
                      onClick={() => setDSource(src)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors
                        ${dSource === src ? "bg-primary-50 border-primary-300 text-primary-700" : "border-warmgray-200 text-warmgray-600 hover:bg-warmgray-50"}`}
                    >
                      {t(`funding.${src}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("funding.notes")} <span className="text-warmgray-400">({t("funding.optional")})</span></label>
                <input type="text" className="input-field" placeholder={t("funding.forRamadan")} value={dNotes} onChange={(e) => setDNotes(e.target.value)} />
              </div>
              <button
                onClick={handleRecordDonation}
                disabled={!dAmount || Number(dAmount) <= 0 || !dName || !dReceiver}
                className={`w-full justify-center mt-2 ${dAmount && Number(dAmount) > 0 && dName && dReceiver ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"}`}
              >
                {t("funding.recordDonationBtn")}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
