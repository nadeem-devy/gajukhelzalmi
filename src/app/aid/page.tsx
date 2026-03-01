"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/i18n/context";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import {
  AidIcon,
  FilterIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@/components/layout/icons";
import type { AidRecord, AidStatus } from "@/lib/types";

const aidStatusSteps: AidStatus[] = ["applied", "verified", "approved", "delivered", "closed"];

function AidTimeline({ record }: { record: AidRecord }) {
  const currentStep = aidStatusSteps.indexOf(record.status);

  return (
    <div className="flex items-center gap-1 mt-2">
      {aidStatusSteps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold
            ${i <= currentStep ? "bg-primary-500 text-white" : "bg-warmgray-200 text-warmgray-400"}`}
          >
            {i <= currentStep ? "✓" : i + 1}
          </div>
          {i < aidStatusSteps.length - 1 && (
            <div className={`w-4 sm:w-6 h-0.5 ${i < currentStep ? "bg-primary-500" : "bg-warmgray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AidPage() {
  const { canViewFullNames } = useAuth();
  const { aidRecords, beneficiaries } = useStore();
  const { t, td } = useLang();
  const [filter, setFilter] = useState<AidStatus | "all">("all");
  const [selectedRecord, setSelectedRecord] = useState<AidRecord | null>(null);

  const filtered = filter === "all" ? aidRecords : aidRecords.filter((a) => a.status === filter);

  const getBeneficiary = (id: string) => beneficiaries.find((b) => b.id === id);

  return (
    <div className="container-page">
      <div className="page-header">
        <h1 className="section-title">{t("aid.title")}</h1>
        <p className="section-subtitle">{t("aid.subtitle")}</p>
      </div>

      {/* Dignity Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          <AidIcon className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">{t("aid.dignityFirst")}</p>
          <p className="text-xs text-blue-700 mt-0.5">
            {t("aid.dignityDesc")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-warmgray-900">{beneficiaries.length}</p>
          <p className="text-xs text-warmgray-500">{t("aid.familiesRegistered")}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {aidRecords.filter((a) => a.status === "delivered").length}
          </p>
          <p className="text-xs text-warmgray-500">{t("aid.aidDelivered")}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {aidRecords.filter((a) => a.status !== "delivered" && a.status !== "closed").length}
          </p>
          <p className="text-xs text-warmgray-500">{t("aid.inProgress")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        <FilterIcon className="w-4 h-4 text-warmgray-400 shrink-0" />
        {(["all", ...aidStatusSteps] as const).map((status) => (
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
          </button>
        ))}
      </div>

      {/* Aid Records */}
      <div className="space-y-3">
        {filtered.map((record) => {
          const beneficiary = getBeneficiary(record.beneficiaryId);
          if (!beneficiary) return null;

          return (
            <div
              key={record.id}
              className="card-hover p-4 cursor-pointer"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-700">
                      {canViewFullNames ? beneficiary.initials : beneficiary.initials}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-warmgray-800">
                        {canViewFullNames ? td(`${beneficiary.id}.fullName`, beneficiary.fullName) : td(`${beneficiary.id}.maskedName`, beneficiary.maskedName)}
                      </p>
                      <Badge status={record.status} />
                    </div>
                    <p className="text-xs text-warmgray-500 mt-0.5">
                      {t(`aidType.${record.aidType}`)} &middot; {td(`${record.id}.description`, record.description)}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-warmgray-400 mt-1" />
              </div>

              {/* Mini Timeline */}
              <div className="mt-3 ml-13">
                <AidTimeline record={record} />
                <div className="flex items-center gap-3 mt-2 text-xs text-warmgray-400">
                  <span>{`${t("aid.applied")}:`} {formatDate(record.appliedDate)}</span>
                  {record.deliveredDate && <span>{`${t("aid.delivered")}:`} {formatDate(record.deliveredDate)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={t("aid.aidRecordDetails")}
        >
          {(() => {
            const beneficiary = getBeneficiary(selectedRecord.beneficiaryId);
            if (!beneficiary) return null;

            return (
              <div className="space-y-4">
                {/* Beneficiary Info */}
                <div className="bg-warmgray-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-warmgray-500 uppercase tracking-wide mb-2">{t("aid.beneficiary")}</h3>
                  <p className="text-base font-bold text-warmgray-900">
                    {canViewFullNames ? td(`${beneficiary.id}.fullName`, beneficiary.fullName) : td(`${beneficiary.id}.maskedName`, beneficiary.maskedName)}
                  </p>
                  {canViewFullNames && beneficiary.familySize && (
                    <p className="text-sm text-warmgray-600 mt-1">{`${t("aid.familySize")}:`} {beneficiary.familySize}</p>
                  )}
                  {!canViewFullNames && (
                    <p className="text-xs text-warmgray-400 mt-1">{t("aid.fullDetailsNote")}</p>
                  )}
                </div>

                {/* Aid Info */}
                <div>
                  <h3 className="text-xs font-semibold text-warmgray-500 uppercase tracking-wide mb-2">{t("aid.aidDetails")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-warmgray-500">{t("aid.type")}</span>
                      <span className="font-medium">{t(`aidType.${selectedRecord.aidType}`)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warmgray-500">{t("aid.description")}</span>
                      <span className="font-medium">{td(`${selectedRecord.id}.description`, selectedRecord.description)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warmgray-500">{t("aid.status")}</span>
                      <Badge status={selectedRecord.status} />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-xs font-semibold text-warmgray-500 uppercase tracking-wide mb-2">{t("aid.progress")}</h3>
                  <AidTimeline record={selectedRecord} />
                  <div className="mt-3 space-y-1 text-xs text-warmgray-500">
                    <p>{`${t("aid.applied")}:`} {formatDate(selectedRecord.appliedDate)}</p>
                    {selectedRecord.verifiedDate && <p>{`${t("aid.verified")}:`} {formatDate(selectedRecord.verifiedDate)}</p>}
                    {selectedRecord.approvedDate && <p>{`${t("aid.approved")}:`} {formatDate(selectedRecord.approvedDate)}</p>}
                    {selectedRecord.deliveredDate && <p>{`${t("aid.delivered")}:`} {formatDate(selectedRecord.deliveredDate)}</p>}
                  </div>
                </div>

                {/* Admin-only: Verification Notes */}
                {canViewFullNames && beneficiary.verificationNotes && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                    <h3 className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">{t("aid.verificationNotes")}</h3>
                    <p className="text-sm text-yellow-800">{td(`${beneficiary.id}.verificationNotes`, beneficiary.verificationNotes)}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
