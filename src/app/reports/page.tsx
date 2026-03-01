"use client";

import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import {
  ReportIcon,
  PrinterIcon,
  FundingIcon,
  CampaignIcon,
  AidIcon,
  CalendarIcon,
} from "@/components/layout/icons";
import { useState } from "react";

type ReportType = "funding" | "campaign" | "aid";

export default function ReportsPage() {
  const { campaigns, donations, expenses, aidRecords, beneficiaries, getFundingSummary } = useStore();
  const { t, td } = useLang();
  const [activeReport, setActiveReport] = useState<ReportType>("funding");
  const funding = getFundingSummary();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container-page">
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="section-title">{t("reports.title")}</h1>
            <p className="section-subtitle">{t("reports.subtitle")}</p>
          </div>
          <button onClick={handlePrint} className="btn-secondary no-print">
            <PrinterIcon className="w-4 h-4" />
            {t("reports.print")}
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1 no-print">
        {([
          { key: "funding" as const, label: t("reports.fundingReport"), icon: FundingIcon },
          { key: "campaign" as const, label: t("reports.campaignSummary"), icon: CampaignIcon },
          { key: "aid" as const, label: t("reports.aidDistribution"), icon: AidIcon },
        ]).map((report) => (
          <button
            key={report.key}
            onClick={() => setActiveReport(report.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
              ${activeReport === report.key
                ? "bg-primary-600 text-white"
                : "bg-warmgray-100 text-warmgray-600 hover:bg-warmgray-200"
              }`}
          >
            <report.icon className="w-4 h-4" />
            {report.label}
          </button>
        ))}
      </div>

      {/* Funding Report */}
      {activeReport === "funding" && (
        <div className="card p-6">
          <div className="text-center mb-6 border-b border-warmgray-200 pb-4">
            <h2 className="text-xl font-bold text-warmgray-900">{t("reports.fundingReport")}</h2>
            <p className="text-sm text-warmgray-500">{t("reports.communityWelfare")}</p>
            <p className="text-xs text-warmgray-400 mt-1">{`${t("reports.generated")}:`} {formatDate(new Date().toISOString())}</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-xs text-green-600 font-medium">{t("reports.totalCollected")}</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(funding.totalCollected)}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-xs text-yellow-600 font-medium">{t("reports.totalSpent")}</p>
              <p className="text-xl font-bold text-yellow-700">{formatCurrency(funding.totalSpent)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 font-medium">{t("reports.balance")}</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(funding.balance)}</p>
            </div>
          </div>

          {/* Donations Table */}
          <h3 className="text-sm font-bold text-warmgray-900 mb-3">{t("reports.allDonations")}</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warmgray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.date")}</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.donor")}</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.source")}</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.amount")}</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b border-warmgray-50">
                    <td className="py-2 px-3 text-warmgray-600">{formatDate(d.date)}</td>
                    <td className="py-2 px-3 text-warmgray-700">{d.anonymous ? t("common.anonymous") : d.donorName}</td>
                    <td className="py-2 px-3 text-warmgray-600">{t(`donationSource.${d.source}`)}</td>
                    <td className="py-2 px-3 text-right font-medium text-warmgray-800">{formatCurrency(d.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-warmgray-50 font-bold">
                  <td colSpan={3} className="py-2 px-3">{t("reports.total")}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(funding.totalCollected)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Expenses Table */}
          <h3 className="text-sm font-bold text-warmgray-900 mb-3">{t("reports.allApprovedExpenses")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warmgray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.date")}</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.description")}</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.category")}</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.amount")}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.filter(e => e.status === "approved").map((e) => (
                  <tr key={e.id} className="border-b border-warmgray-50">
                    <td className="py-2 px-3 text-warmgray-600">{formatDate(e.date)}</td>
                    <td className="py-2 px-3 text-warmgray-700">{td(`${e.id}.description`, e.description)}</td>
                    <td className="py-2 px-3 text-warmgray-600">{t(`expenseCategory.${e.category}`) !== `expenseCategory.${e.category}` ? t(`expenseCategory.${e.category}`) : e.category}</td>
                    <td className="py-2 px-3 text-right font-medium text-warmgray-800">{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-warmgray-50 font-bold">
                  <td colSpan={3} className="py-2 px-3">{t("reports.total")}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(funding.totalSpent)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Summary Report */}
      {activeReport === "campaign" && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="card p-6">
              <div className="text-center mb-4 border-b border-warmgray-200 pb-3">
                <h2 className="text-lg font-bold text-warmgray-900">{td(`${campaign.id}.title`, campaign.title)}</h2>
                <p className="text-sm text-warmgray-500">{td(`${campaign.id}.purpose`, campaign.purpose)}</p>
                <p className="text-xs text-warmgray-400 mt-1">
                  {formatDate(campaign.startDate)} — {campaign.endDate ? formatDate(campaign.endDate) : t("reports.ongoing")}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center p-3 bg-warmgray-50 rounded-lg">
                  <p className="text-2xs text-warmgray-500">{t("reports.target")}</p>
                  <p className="text-sm font-bold">{formatCurrency(campaign.targetAmount)}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xs text-green-600">{t("reports.collected")}</p>
                  <p className="text-sm font-bold text-green-700">{formatCurrency(campaign.collectedAmount)}</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xs text-yellow-600">{t("reports.spent")}</p>
                  <p className="text-sm font-bold text-yellow-700">{formatCurrency(campaign.spentAmount)}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xs text-blue-600">{t("reports.balance")}</p>
                  <p className="text-sm font-bold text-blue-700">{formatCurrency(campaign.collectedAmount - campaign.spentAmount)}</p>
                </div>
              </div>

              {/* Expenses */}
              <h3 className="text-xs font-bold text-warmgray-700 uppercase tracking-wide mb-2">{t("reports.expenses")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-warmgray-200">
                      <th className="text-left py-1.5 px-2 text-xs text-warmgray-500">{t("reports.item")}</th>
                      <th className="text-left py-1.5 px-2 text-xs text-warmgray-500">{t("reports.category")}</th>
                      <th className="text-left py-1.5 px-2 text-xs text-warmgray-500">{t("reports.approvedBy")}</th>
                      <th className="text-right py-1.5 px-2 text-xs text-warmgray-500">{t("reports.amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.expenses.map((exp) => (
                      <tr key={exp.id} className="border-b border-warmgray-50">
                        <td className="py-1.5 px-2 text-warmgray-700">{td(`${exp.id}.description`, exp.description)}</td>
                        <td className="py-1.5 px-2 text-warmgray-500">{t(`expenseCategory.${exp.category}`) !== `expenseCategory.${exp.category}` ? t(`expenseCategory.${exp.category}`) : exp.category}</td>
                        <td className="py-1.5 px-2 text-warmgray-500">{exp.approvedBy}</td>
                        <td className="py-1.5 px-2 text-right font-medium">{formatCurrency(exp.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aid Distribution Report */}
      {activeReport === "aid" && (
        <div className="card p-6">
          <div className="text-center mb-6 border-b border-warmgray-200 pb-4">
            <h2 className="text-xl font-bold text-warmgray-900">{t("reports.aidDistributionReport")}</h2>
            <p className="text-sm text-warmgray-500">{t("reports.communityWelfare")}</p>
            <p className="text-xs text-warmgray-400 mt-1">{`${t("reports.generated")}:`} {formatDate(new Date().toISOString())}</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-warmgray-50 rounded-xl">
              <p className="text-2xl font-bold text-warmgray-900">{beneficiaries.length}</p>
              <p className="text-xs text-warmgray-500">{t("reports.familiesRegistered")}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-700">{aidRecords.filter(a => a.status === "delivered").length}</p>
              <p className="text-xs text-warmgray-500">{t("reports.aidDelivered")}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{aidRecords.length}</p>
              <p className="text-xs text-warmgray-500">{t("reports.totalRecords")}</p>
            </div>
          </div>

          {/* Aid Records Table (privacy-safe for printing) */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warmgray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.initials")}</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.aidType")}</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.description")}</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.status")}</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-warmgray-500">{t("reports.date")}</th>
                </tr>
              </thead>
              <tbody>
                {aidRecords.map((record) => {
                  const b = beneficiaries.find((b) => b.id === record.beneficiaryId);
                  return (
                    <tr key={record.id} className="border-b border-warmgray-50">
                      <td className="py-2 px-3 font-medium">{b?.initials || "?"}</td>
                      <td className="py-2 px-3 text-warmgray-600">{t(`aidType.${record.aidType}`)}</td>
                      <td className="py-2 px-3 text-warmgray-700">{td(`${record.id}.description`, record.description)}</td>
                      <td className="py-2 px-3">
                        <span className="capitalize text-warmgray-600">{t(`status.${record.status}`)}</span>
                      </td>
                      <td className="py-2 px-3 text-warmgray-600">{formatDate(record.appliedDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
