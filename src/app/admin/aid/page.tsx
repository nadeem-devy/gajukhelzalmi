"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import Badge from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  AidIcon,
  AdminIcon,
  CheckCircleIcon,
} from "@/components/layout/icons";

export default function AdminAidPage() {
  const { t, td } = useLang();
  const { user, canManageAid } = useAuth();
  const { aidRecords, beneficiaries, verifyAid, approveAid, deliverAid } = useStore();

  if (!canManageAid) {
    return (
      <div className="container-page">
        <div className="empty-state">
          <AdminIcon className="w-12 h-12 text-warmgray-300" />
          <h2 className="text-lg font-bold text-warmgray-700 mt-3">{t("adminAid.adminAccessRequired")}</h2>
          <Link href="/login" className="btn-primary mt-4">{t("admin.goToLogin")}</Link>
        </div>
      </div>
    );
  }

  const pendingRecords = aidRecords.filter((a) => a.status === "applied" || a.status === "verified");
  const approvedRecords = aidRecords.filter((a) => a.status === "approved");

  return (
    <div className="container-page">
      <div className="page-header">
        <Link href="/admin" className="btn-ghost mb-3 inline-flex">
          <ArrowLeftIcon className="w-4 h-4" />
          {t("adminAid.backToAdmin")}
        </Link>
        <h1 className="section-title">{t("adminAid.title")}</h1>
        <p className="section-subtitle">{t("adminAid.subtitle")}</p>
      </div>

      {/* Pending Action */}
      {pendingRecords.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">
            {t("adminAid.needsYourAction")} ({pendingRecords.length})
          </h2>
          <div className="space-y-3">
            {pendingRecords.map((record) => {
              const b = beneficiaries.find((b) => b.id === record.beneficiaryId);
              return (
                <div key={record.id} className="card p-4 border-l-4 border-l-yellow-400">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-700">{b?.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-warmgray-900">{b ? td(`${b.id}.fullName`, b.fullName) : ""}</p>
                        <p className="text-xs text-warmgray-500">
                          {t(`aidType.${record.aidType}`)} &middot; {td(`${record.id}.description`, record.description)}
                        </p>
                      </div>
                    </div>
                    <Badge status={record.status} />
                  </div>

                  {/* Verification Notes */}
                  {b?.verificationNotes && (
                    <div className="bg-yellow-50 rounded-lg p-2 mb-3 text-xs text-yellow-800">
                      <span className="font-semibold">{t("adminAid.notes")}:</span> {td(`${b.id}.verificationNotes`, b.verificationNotes)}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {record.status === "applied" && (
                      <button onClick={() => verifyAid(record.id)} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
                        {t("adminAid.markVerified")}
                      </button>
                    )}
                    {record.status === "verified" && (
                      <>
                        <button onClick={() => approveAid(record.id, user!.id)} className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100">
                          <span className="flex items-center justify-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            {t("adminAid.approve")}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Approved - Ready for Delivery */}
      {approvedRecords.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">
            {t("adminAid.approvedAwaitingDelivery")} ({approvedRecords.length})
          </h2>
          <div className="space-y-2">
            {approvedRecords.map((record) => {
              const b = beneficiaries.find((b) => b.id === record.beneficiaryId);
              return (
                <div key={record.id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-700">{b?.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-warmgray-900">{b ? td(`${b.id}.fullName`, b.fullName) : ""}</p>
                      <p className="text-xs text-warmgray-500">{t(`aidType.${record.aidType}`)} &middot; {td(`${record.id}.description`, record.description)}</p>
                    </div>
                  </div>
                  <button onClick={() => deliverAid(record.id)} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100">
                    {t("adminAid.markDelivered")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Records */}
      <div>
        <h2 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">
          {t("adminAid.allAidRecords")} ({aidRecords.length})
        </h2>
        <div className="card overflow-hidden">
          <div className="divide-y divide-warmgray-100">
            {aidRecords.map((record) => {
              const b = beneficiaries.find((b) => b.id === record.beneficiaryId);
              return (
                <div key={record.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-warmgray-500 w-6">{b?.initials}</span>
                    <div>
                      <p className="text-sm text-warmgray-700">{b ? td(`${b.id}.fullName`, b.fullName) : ""} — {td(`${record.id}.description`, record.description)}</p>
                      <p className="text-xs text-warmgray-400">{formatDate(record.appliedDate)}</p>
                    </div>
                  </div>
                  <Badge status={record.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
