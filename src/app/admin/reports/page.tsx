"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/i18n/context";
import {
  ArrowLeftIcon,
  ReportIcon,
  FundingIcon,
  CampaignIcon,
  AidIcon,
  UsersIcon,
  PrinterIcon,
  DownloadIcon,
  AdminIcon,
} from "@/components/layout/icons";

export default function AdminReportsPage() {
  const { t } = useLang();
  const { canGenerateReports } = useAuth();

  if (!canGenerateReports) {
    return (
      <div className="container-page">
        <div className="empty-state">
          <AdminIcon className="w-12 h-12 text-warmgray-300" />
          <h2 className="text-lg font-bold text-warmgray-700 mt-3">{t("adminReports.adminAccessRequired")}</h2>
          <Link href="/login" className="btn-primary mt-4">{t("admin.goToLogin")}</Link>
        </div>
      </div>
    );
  }

  const reportTypes = [
    {
      icon: FundingIcon,
      title: t("adminReports.monthlyFunding"),
      description: t("adminReports.monthlyFundingDesc"),
      color: "bg-green-50 text-green-600",
      href: "/reports",
    },
    {
      icon: CampaignIcon,
      title: t("adminReports.campaignSummary"),
      description: t("adminReports.campaignSummaryDesc"),
      color: "bg-primary-50 text-primary-600",
      href: "/reports",
    },
    {
      icon: AidIcon,
      title: t("adminReports.aidDistribution"),
      description: t("adminReports.aidDistributionDesc"),
      color: "bg-blue-50 text-blue-600",
      href: "/reports",
    },
    {
      icon: UsersIcon,
      title: t("adminReports.volunteerContributions"),
      description: t("adminReports.volunteerContributionsDesc"),
      color: "bg-purple-50 text-purple-600",
      href: "/reports",
    },
  ];

  return (
    <div className="container-page">
      <div className="page-header">
        <Link href="/admin" className="btn-ghost mb-3 inline-flex">
          <ArrowLeftIcon className="w-4 h-4" />
          {t("adminReports.backToAdmin")}
        </Link>
        <h1 className="section-title">{t("adminReports.title")}</h1>
        <p className="section-subtitle">{t("adminReports.subtitle")}</p>
      </div>

      {/* Report Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          <ReportIcon className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">{t("adminReports.reportsDesigned")}</p>
          <p className="text-xs text-blue-700 mt-0.5">
            {t("adminReports.reportsDesignedDesc")}
          </p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <div key={report.title} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${report.color}`}>
                <report.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-warmgray-900">{report.title}</h3>
            </div>
            <p className="text-sm text-warmgray-500 mb-4">{report.description}</p>
            <div className="flex items-center gap-2">
              <Link href={report.href} className="btn-primary text-xs flex-1 justify-center">
                <ReportIcon className="w-3.5 h-3.5" />
                {t("adminReports.viewReport")}
              </Link>
              <button
                onClick={() => window.print()}
                className="btn-secondary text-xs"
              >
                <PrinterIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
