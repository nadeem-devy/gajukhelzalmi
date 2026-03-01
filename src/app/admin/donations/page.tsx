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
  FundingIcon,
} from "@/components/layout/icons";
import type { Donation } from "@/lib/types";

export default function AdminDonationsPage() {
  const { t } = useLang();
  const { user, canApproveDonations } = useAuth();
  const { donations, approveDonation, rejectDonation, users } = useStore();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  if (!canApproveDonations) {
    return (
      <div className="container-page">
        <div className="empty-state">
          <AdminIcon className="w-12 h-12 text-warmgray-300" />
          <h2 className="text-lg font-bold text-warmgray-700 mt-3">{t("admin.adminAccessRequired")}</h2>
          <Link href="/login" className="btn-primary mt-4">{t("admin.goToLogin")}</Link>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? donations : donations.filter(d => d.status === filter);
  const pendingCount = donations.filter(d => d.status === "pending").length;

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || userId;

  const handleApprove = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    approveDonation(id, user!.id);
    if (selectedDonation?.id === id) setSelectedDonation(null);
  };

  const handleReject = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    rejectDonation(id);
    if (selectedDonation?.id === id) setSelectedDonation(null);
  };

  return (
    <div className="container-page">
      <div className="page-header">
        <Link href="/admin" className="btn-ghost mb-3 inline-flex">
          <ArrowLeftIcon className="w-4 h-4" />
          {t("adminDonations.backToAdmin")}
        </Link>
        <h1 className="section-title">{t("adminDonations.title")}</h1>
        <p className="section-subtitle">{t("adminDonations.subtitle")} &middot; {pendingCount} {t("admin.pending")}</p>
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

      {/* Donation List */}
      <div className="space-y-3">
        {filtered.map((donation) => (
          <div
            key={donation.id}
            className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${
              donation.status === "pending" ? "border-l-4 border-l-yellow-400" : ""
            }`}
            onClick={() => setSelectedDonation(donation)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-warmgray-900">
                    {donation.anonymous ? t("funding.anonymous") : (donation.donorName || t("funding.anonymous"))}
                  </h3>
                  <Badge status={donation.status} />
                </div>
                <p className="text-xs text-warmgray-500">
                  {formatDate(donation.date)} &middot; {t(`funding.${donation.source}`)}
                  {donation.campaignId && " &middot; Campaign"}
                </p>
              </div>
              <p className="text-base font-bold text-warmgray-900">{formatCurrency(donation.amount)}</p>
            </div>

            {donation.notes && (
              <p className="text-xs text-warmgray-400 mt-1">{donation.notes}</p>
            )}

            {donation.status === "pending" && canApproveDonations && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  onClick={(e) => handleApprove(donation.id, e)}
                >
                  {t("adminDonations.approve")}
                </button>
                <button
                  className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  onClick={(e) => handleReject(donation.id, e)}
                >
                  {t("adminDonations.reject")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <FundingIcon className="w-12 h-12 text-warmgray-300" />
          <h3 className="text-lg font-semibold text-warmgray-600 mt-3">{t("adminDonations.noDonations")}</h3>
          <p className="text-sm text-warmgray-400 mt-1">{t("adminDonations.allCaughtUp")}</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDonation && (
        <Modal isOpen={!!selectedDonation} onClose={() => setSelectedDonation(null)} title={t("adminDonations.donationDetails")}>
          <div className="space-y-4">
            <div className="bg-warmgray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-extrabold text-warmgray-900">{formatCurrency(selectedDonation.amount)}</p>
              <div className="mt-2"><Badge status={selectedDonation.status} /></div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-warmgray-100">
                <span className="text-warmgray-500">{t("adminDonations.donor")}</span>
                <span className="font-medium">{selectedDonation.anonymous ? t("funding.anonymous") : (selectedDonation.donorName || t("funding.anonymous"))}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-warmgray-100">
                <span className="text-warmgray-500">{t("adminDonations.source")}</span>
                <span className="font-medium">{t(`funding.${selectedDonation.source}`)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-warmgray-100">
                <span className="text-warmgray-500">{t("adminDonations.date")}</span>
                <span className="font-medium">{formatDate(selectedDonation.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-warmgray-100">
                <span className="text-warmgray-500">{t("adminDonations.recordedBy")}</span>
                <span className="font-medium">{getUserName(selectedDonation.recordedBy)}</span>
              </div>
              {selectedDonation.notes && (
                <div className="flex justify-between py-2 border-b border-warmgray-100">
                  <span className="text-warmgray-500">{t("adminDonations.notes")}</span>
                  <span className="font-medium">{selectedDonation.notes}</span>
                </div>
              )}
              {selectedDonation.approvedAt && (
                <div className="flex justify-between py-2 border-b border-warmgray-100">
                  <span className="text-warmgray-500">{t("adminDonations.approvedOn")}</span>
                  <span className="font-medium">{formatDate(selectedDonation.approvedAt)}</span>
                </div>
              )}
              {selectedDonation.approvedBy && (
                <div className="flex justify-between py-2 border-b border-warmgray-100">
                  <span className="text-warmgray-500">{t("adminDonations.approvedBy")}</span>
                  <span className="font-medium">{getUserName(selectedDonation.approvedBy)}</span>
                </div>
              )}
            </div>

            {selectedDonation.status === "pending" && canApproveDonations && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleApprove(selectedDonation.id)} className="flex-1 btn-primary justify-center bg-green-600 hover:bg-green-700">
                  <CheckCircleIcon className="w-4 h-4" />
                  {t("adminDonations.approve")}
                </button>
                <button onClick={() => handleReject(selectedDonation.id)} className="flex-1 btn-secondary text-red-600 border-red-200 hover:bg-red-50">
                  {t("adminDonations.reject")}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
