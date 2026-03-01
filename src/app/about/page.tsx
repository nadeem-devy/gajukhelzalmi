"use client";

import { users } from "@/lib/data";
import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import {
  AboutIcon,
  CheckCircleIcon,
  UsersIcon,
  FundingIcon,
  EyeIcon,
  AidIcon,
} from "@/components/layout/icons";

export default function AboutPage() {
  const { t, td } = useLang();
  const { auditLog, getFundingSummary } = useStore();
  const funding = getFundingSummary();
  const committee = users.filter((u) => u.role === "super_admin");
  const volunteers = users.filter((u) => u.role === "volunteer");

  return (
    <div className="container-page">
      <div className="page-header">
        <h1 className="section-title">{t("about.title")}</h1>
        <p className="section-subtitle">{t("about.subtitle")}</p>
      </div>

      {/* Mission Statement */}
      <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold mb-3">{t("about.aboutTitle")}</h2>
        <p className="text-primary-100 leading-relaxed mb-4">
          {t("about.aboutP1")}
        </p>
        <p className="text-primary-100 leading-relaxed mb-4">
          {t("about.aboutP2")}
        </p>
        <p className="text-primary-100 leading-relaxed">
          {t("about.aboutP3")}
        </p>
      </div>

      {/* Trust Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <EyeIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-warmgray-900">{t("about.everythingVisible")}</h3>
          </div>
          <ul className="space-y-2 text-sm text-warmgray-600">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              {t("about.visible1")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              {t("about.visible2")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              {t("about.visible3")}
            </li>
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <AboutIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-warmgray-900">{t("about.nothingHidden")}</h3>
          </div>
          <ul className="space-y-2 text-sm text-warmgray-600">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              {t("about.hidden1")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              {t("about.hidden2")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              {t("about.hidden3")}
            </li>
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <AidIcon className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-warmgray-900">{t("about.dignityProtected")}</h3>
          </div>
          <ul className="space-y-2 text-sm text-warmgray-600">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              {t("about.dignity1")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              {t("about.dignity2")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              {t("about.dignity3")}
            </li>
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <UsersIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-bold text-warmgray-900">{t("about.communityGoverned")}</h3>
          </div>
          <ul className="space-y-2 text-sm text-warmgray-600">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              {t("about.governed1")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              {t("about.governed2")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              {t("about.governed3")}
            </li>
          </ul>
        </div>
      </div>

      {/* Team */}
      <div className="mb-8">
        <h2 className="section-title mb-4">{t("about.ourTeam")}</h2>

        <h3 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">{t("about.committee")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {committee.map((member) => (
            <div key={member.id} className="card p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-700">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="font-semibold text-warmgray-900">{member.name}</p>
                <p className="text-xs text-warmgray-500">{t("about.committeeMember")} &middot; {t("about.since")} {formatDate(member.joinedAt)}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">{t("about.volunteers")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {volunteers.map((member) => (
            <div key={member.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-earth-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-earth-700">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="font-medium text-warmgray-900 text-sm">{member.name}</p>
                <p className="text-xs text-warmgray-500">{t("about.volunteer")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail Preview */}
      <div className="mb-8">
        <h2 className="section-title mb-4">{t("about.recentAuditTrail")}</h2>
        <p className="section-subtitle mb-4">{t("about.auditSubtitle")}</p>

        <div className="card overflow-hidden">
          <div className="divide-y divide-warmgray-100">
            {auditLog.map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
                <div className="w-2 h-2 bg-warmgray-300 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-warmgray-700">{td(`${entry.id}.details`, entry.details)}</p>
                  <p className="text-xs text-warmgray-400 mt-0.5">
                    {t("about.by")} {entry.userName} &middot; {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Snapshot */}
      <div className="card p-6 text-center">
        <h2 className="text-lg font-bold text-warmgray-900 mb-4">{t("about.financialSnapshot")}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-extrabold text-green-600">{formatCurrency(funding.totalCollected)}</p>
            <p className="text-xs text-warmgray-500 mt-1">{t("about.totalCollected")}</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-yellow-600">{formatCurrency(funding.totalSpent)}</p>
            <p className="text-xs text-warmgray-500 mt-1">{t("about.totalSpent")}</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-primary-600">{formatCurrency(funding.balance)}</p>
            <p className="text-xs text-warmgray-500 mt-1">{t("about.availableBalance")}</p>
          </div>
        </div>
        <p className="text-xs text-warmgray-400 mt-4">
          {t("about.snapshotNote")}
        </p>
      </div>
    </div>
  );
}
