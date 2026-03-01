"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import Badge from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  RequestIcon,
  AidIcon,
  AdminIcon,
  CheckCircleIcon,
} from "@/components/layout/icons";

export default function AdminRequestsPage() {
  const { t, td } = useLang();
  const { user, canManageRequests } = useAuth();
  const { requests, reviewRequest, approveRequest, rejectRequest, convertRequestToAid } = useStore();

  if (!canManageRequests) {
    return (
      <div className="container-page">
        <div className="empty-state">
          <AdminIcon className="w-12 h-12 text-warmgray-300" />
          <h2 className="text-lg font-bold text-warmgray-700 mt-3">{t("adminRequests.adminAccessRequired")}</h2>
          <Link href="/login" className="btn-primary mt-4">{t("admin.goToLogin")}</Link>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "submitted" || r.status === "reviewing");
  const otherRequests = requests.filter((r) => r.status !== "submitted" && r.status !== "reviewing");

  return (
    <div className="container-page">
      <div className="page-header">
        <Link href="/admin" className="btn-ghost mb-3 inline-flex">
          <ArrowLeftIcon className="w-4 h-4" />
          {t("adminRequests.backToAdmin")}
        </Link>
        <h1 className="section-title">{t("adminRequests.title")}</h1>
        <p className="section-subtitle">{t("adminRequests.subtitle")}</p>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">
            {t("adminRequests.needsReview")} ({pendingRequests.length})
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="card p-4 border-l-4 border-l-blue-400">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${request.type === "aid" ? "bg-red-50" : "bg-blue-50"}`}>
                      {request.type === "aid" ? (
                        <AidIcon className="w-4 h-4 text-red-600" />
                      ) : (
                        <RequestIcon className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <Badge status={request.status} />
                    {request.urgency === "high" && (
                      <span className="badge bg-red-100 text-red-700">{t("adminRequests.urgent")}</span>
                    )}
                  </div>
                  <span className="text-xs text-warmgray-400">{formatDate(request.submittedAt)}</span>
                </div>

                <p className="text-sm text-warmgray-700 mb-2">{td(`${request.id}.description`, request.description)}</p>

                <div className="text-xs text-warmgray-500 mb-3">
                  {t("adminRequests.from")}: {request.anonymous ? t("common.anonymous") : request.name}
                  {request.phone && ` | ${request.phone}`}
                </div>

                {/* Admin Notes */}
                {request.adminNotes && (
                  <div className="bg-yellow-50 rounded-lg p-2 mb-3 text-xs text-yellow-800">
                    <span className="font-semibold">{t("adminRequests.note")}:</span> {request.adminNotes}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {request.status === "submitted" && (
                    <button onClick={() => reviewRequest(request.id)} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
                      {t("adminRequests.markReviewing")}
                    </button>
                  )}
                  <button onClick={() => approveRequest(request.id, user!.id)} className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100">
                    {t("adminRequests.approve")}
                  </button>
                  <button onClick={() => convertRequestToAid(request.id, user!.id)} className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100">
                    {t("adminRequests.convertToAid")}
                  </button>
                  <button onClick={() => rejectRequest(request.id, user!.id)} className="py-2 px-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">
                    {t("adminRequests.reject")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      <div>
        <h2 className="text-sm font-bold text-warmgray-700 uppercase tracking-wide mb-3">
          {t("adminRequests.processed")} ({otherRequests.length})
        </h2>
        <div className="card overflow-hidden">
          <div className="divide-y divide-warmgray-100">
            {otherRequests.map((request) => (
              <div key={request.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-warmgray-500 uppercase">{request.type === "aid" ? t("requests.aidRequest") : t("requests.workRequest")}</span>
                    <Badge status={request.status} />
                  </div>
                  <span className="text-xs text-warmgray-400">{formatDate(request.submittedAt)}</span>
                </div>
                <p className="text-sm text-warmgray-700">{td(`${request.id}.description`, request.description)}</p>
                <p className="text-xs text-warmgray-500 mt-1">
                  {request.anonymous ? t("common.anonymous") : request.name}
                  {request.adminNotes && ` — ${request.adminNotes}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
