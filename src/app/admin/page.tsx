"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import {
  CampaignIcon,
  FundingIcon,
  AidIcon,
  RequestIcon,
  ReportIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  AdminIcon,
} from "@/components/layout/icons";

export default function AdminPage() {
  const { t } = useLang();
  const { user, canViewAdminPanel, isSuperAdmin, canManageRequests, canApproveDonations } = useAuth();
  const { campaigns, expenses, requests, aidRecords, donations, getFundingSummary } = useStore();
  const funding = getFundingSummary();

  if (!canViewAdminPanel) {
    return (
      <div className="container-page">
        <div className="empty-state">
          <AdminIcon className="w-12 h-12 text-warmgray-300" />
          <h2 className="text-lg font-bold text-warmgray-700 mt-3">{t("admin.accessRequired")}</h2>
          <p className="text-sm text-warmgray-500 mt-1">{t("admin.accessRequiredDesc")}</p>
          <Link href="/login" className="btn-primary mt-4">{t("admin.goToLogin")}</Link>
        </div>
      </div>
    );
  }

  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const pendingDonations = donations.filter((d) => d.status === "pending");
  const pendingRequests = requests.filter((r) => r.status === "submitted" || r.status === "reviewing");
  const pendingAid = aidRecords.filter((a) => a.status === "applied" || a.status === "verified");
  const activeCampaigns = campaigns.filter((c) => c.status === "active");

  const manageLinks = [
    { href: "/admin/campaigns", label: t("admin.campaigns"), icon: CampaignIcon, color: "bg-primary-50 text-primary-600", desc: `${activeCampaigns.length} ${t("admin.active")}`, show: true },
    { href: "/admin/donations", label: t("admin.donations"), icon: FundingIcon, color: "bg-emerald-50 text-emerald-600", desc: `${pendingDonations.length} ${t("admin.pending")}`, show: canApproveDonations },
    { href: "/admin/expenses", label: t("admin.expenses"), icon: FundingIcon, color: "bg-yellow-50 text-yellow-600", desc: `${pendingExpenses.length} ${t("admin.pending")}`, show: true },
    { href: "/admin/aid", label: t("admin.aidRecords"), icon: AidIcon, color: "bg-green-50 text-green-600", desc: `${aidRecords.length} ${t("admin.total")}`, show: isSuperAdmin },
    { href: "/admin/requests", label: t("admin.requests"), icon: RequestIcon, color: "bg-blue-50 text-blue-600", desc: `${pendingRequests.length} ${t("admin.open")}`, show: canManageRequests },
    { href: "/admin/reports", label: t("admin.reports"), icon: ReportIcon, color: "bg-purple-50 text-purple-600", desc: t("admin.generate"), show: true },
    { href: "/about", label: t("admin.auditLog"), icon: CheckCircleIcon, color: "bg-warmgray-50 text-warmgray-600", desc: t("admin.viewTrail"), show: isSuperAdmin },
  ].filter((item) => item.show);

  return (
    <div className="container-page">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary-50 rounded-lg">
            <AdminIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="section-title">{isSuperAdmin ? t("admin.title") : t("admin.dashboard")}</h1>
            <p className="section-subtitle">{t("admin.welcomeBack")}, {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <p className="stat-label">{t("admin.balance")}</p>
          <p className="text-xl font-bold text-primary-600">{formatCurrency(funding.balance)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-700">{activeCampaigns.length}</span>
            </div>
            <p className="text-sm text-warmgray-600">{t("admin.activeCampaigns")}</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-700">{pendingDonations.length}</span>
            </div>
            <p className="text-sm text-warmgray-600">{t("admin.pendingDonations")}</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-700">{pendingExpenses.length}</span>
            </div>
            <p className="text-sm text-warmgray-600">{t("admin.pendingExpenses")}</p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      {(pendingExpenses.length > 0 || pendingDonations.length > 0 || pendingRequests.length > 0 || pendingAid.length > 0) && (
        <>
          <h2 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">{t("admin.needsAttention")}</h2>
          <div className="space-y-3 mb-8">
            {pendingExpenses.length > 0 && (
              <Link href="/admin/expenses" className="card-hover p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <FundingIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-warmgray-900">
                      {pendingExpenses.length} {t("admin.expensesWaiting")}
                    </p>
                    <p className="text-xs text-warmgray-500">
                      {t("admin.total")}: {formatCurrency(pendingExpenses.reduce((sum, e) => sum + e.amount, 0))}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-warmgray-400" />
              </Link>
            )}
            {pendingDonations.length > 0 && canApproveDonations && (
              <Link href="/admin/donations" className="card-hover p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <FundingIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-warmgray-900">
                      {pendingDonations.length} {t("admin.donationsWaiting")}
                    </p>
                    <p className="text-xs text-warmgray-500">
                      {t("admin.total")}: {formatCurrency(pendingDonations.reduce((sum, d) => sum + d.amount, 0))}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-warmgray-400" />
              </Link>
            )}
            {pendingRequests.length > 0 && (
              <Link href="/admin/requests" className="card-hover p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <RequestIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-warmgray-900">
                      {pendingRequests.length} {t("admin.requestsNeedReview")}
                    </p>
                    <p className="text-xs text-warmgray-500">
                      {pendingRequests.filter(r => r.urgency === "high").length} {t("admin.markedHighUrgency")}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-warmgray-400" />
              </Link>
            )}
            {pendingAid.length > 0 && (
              <Link href="/admin/aid" className="card-hover p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <AidIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-warmgray-900">
                      {pendingAid.length} {t("admin.aidRecordsNeedAction")}
                    </p>
                    <p className="text-xs text-warmgray-500">
                      {pendingAid.filter(a => a.status === "applied").length} {t("status.applied")}, {pendingAid.filter(a => a.status === "verified").length} {t("status.verified")}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-warmgray-400" />
              </Link>
            )}
          </div>
        </>
      )}

      {/* Quick Links */}
      <h2 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">{t("admin.manage")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {manageLinks.map((item) => (
          <Link key={item.href} href={item.href} className="card-hover p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-warmgray-900">{item.label}</p>
            <p className="text-xs text-warmgray-500 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
