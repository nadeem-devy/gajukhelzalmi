"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/i18n/context";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import { RequestIcon, AidIcon, FilterIcon, PlusIcon, CheckCircleIcon } from "@/components/layout/icons";
import type { RequestType } from "@/lib/types";

export default function RequestsPage() {
  const { canViewFullNames } = useAuth();
  const { requests, submitRequest } = useStore();
  const { t, td } = useLang();
  const [filter, setFilter] = useState<RequestType | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<RequestType>("aid");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formUrgency, setFormUrgency] = useState<"low" | "medium" | "high">("medium");
  const [submitted, setSubmitted] = useState(false);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.type === filter);

  const handleSubmit = () => {
    if (!formDesc.trim()) return;
    submitRequest({
      type: formType,
      name: formName || undefined,
      phone: formPhone || undefined,
      description: formDesc,
      urgency: formType === "aid" ? formUrgency : undefined,
      anonymous: !formName.trim(),
    });
    setFormName("");
    setFormPhone("");
    setFormDesc("");
    setFormUrgency("medium");
    setSubmitted(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSubmitted(false);
  };

  return (
    <div className="container-page">
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="section-title">{t("requests.title")}</h1>
            <p className="section-subtitle">{t("requests.subtitle")}</p>
          </div>
          <button onClick={() => { setShowForm(true); setSubmitted(false); }} className="btn-primary">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t("requests.submitRequest")}</span>
            <span className="sm:hidden">{t("requests.new")}</span>
          </button>
        </div>
      </div>

      {/* Safe Space Notice */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <div className="p-2 bg-green-100 rounded-lg shrink-0">
          <RequestIcon className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-900">{t("requests.safeSpace")}</p>
          <p className="text-xs text-green-700 mt-0.5">
            {t("requests.safeSpaceDesc")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <FilterIcon className="w-4 h-4 text-warmgray-400" />
        {(["all", "aid", "work"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === type
                ? "bg-primary-600 text-white"
                : "bg-warmgray-100 text-warmgray-600 hover:bg-warmgray-200"
              }`}
          >
            {type === "all" ? t("common.all") : type === "aid" ? t("requests.aidRequests") : t("requests.workRequests")}
          </button>
        ))}
      </div>

      {/* Request List */}
      <div className="space-y-3">
        {filtered.map((request) => (
          <div key={request.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${request.type === "aid" ? "bg-red-50" : "bg-blue-50"}`}>
                  {request.type === "aid" ? (
                    <AidIcon className="w-4 h-4 text-red-600" />
                  ) : (
                    <RequestIcon className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-warmgray-500 uppercase">
                      {request.type === "aid" ? t("requests.aidRequest") : t("requests.workRequest")}
                    </span>
                    <Badge status={request.status} />
                    {request.urgency && request.urgency !== "low" && (
                      <span className={`badge ${
                        request.urgency === "high" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {t(`status.${request.urgency}`)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-warmgray-400">{formatDate(request.submittedAt)}</span>
            </div>

            <p className="text-sm text-warmgray-700 mb-2">{td(`${request.id}.description`, request.description)}</p>

            <div className="flex items-center gap-3 text-xs text-warmgray-500">
              <span>{`${t("requests.from")}:`} {request.anonymous ? t("common.anonymous") : request.name}</span>
              {canViewFullNames && request.adminNotes && (
                <span className="text-yellow-600">{`${t("requests.note")}:`} {request.adminNotes}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <RequestIcon className="w-12 h-12 text-warmgray-300" />
          <h3 className="text-lg font-semibold text-warmgray-600 mt-3">{t("requests.noRequests")}</h3>
          <p className="text-sm text-warmgray-400 mt-1">{t("requests.noRequestsSubtitle")}</p>
        </div>
      )}

      {/* Submit Request Modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={submitted ? t("requests.requestSubmitted") : t("requests.submitRequest")}>
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-warmgray-900 mb-2">{t("requests.requestSubmittedTitle")}</h3>
            <p className="text-sm text-warmgray-500 mb-6">
              {t("requests.requestSubmittedDesc")}
            </p>
            <button onClick={closeForm} className="btn-primary justify-center w-full">
              {t("requests.done")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="text-sm font-medium text-warmgray-700 block mb-2">{t("requests.whatKindOfHelp")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormType("aid")}
                  className={`p-4 rounded-xl border-2 text-center transition-colors
                    ${formType === "aid" ? "border-primary-500 bg-primary-50" : "border-warmgray-200 hover:border-warmgray-300"}`}
                >
                  <AidIcon className={`w-6 h-6 mx-auto mb-1 ${formType === "aid" ? "text-primary-600" : "text-warmgray-400"}`} />
                  <p className="text-sm font-medium">{t("requests.aidSupport")}</p>
                  <p className="text-xs text-warmgray-500 mt-0.5">{t("requests.aidSupportDesc")}</p>
                </button>
                <button
                  onClick={() => setFormType("work")}
                  className={`p-4 rounded-xl border-2 text-center transition-colors
                    ${formType === "work" ? "border-primary-500 bg-primary-50" : "border-warmgray-200 hover:border-warmgray-300"}`}
                >
                  <RequestIcon className={`w-6 h-6 mx-auto mb-1 ${formType === "work" ? "text-primary-600" : "text-warmgray-400"}`} />
                  <p className="text-sm font-medium">{t("requests.work")}</p>
                  <p className="text-xs text-warmgray-500 mt-0.5">{t("requests.workDesc")}</p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-warmgray-700 block mb-1">
                {t("requests.yourName")} <span className="text-warmgray-400">({t("requests.yourNameOptional")})</span>
              </label>
              <input type="text" className="input-field" placeholder={t("requests.leaveEmpty")} value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-warmgray-700 block mb-1">
                {t("requests.phoneNumber")} <span className="text-warmgray-400">({t("requests.phoneOptional")})</span>
              </label>
              <input type="tel" className="input-field" placeholder={t("requests.soWeCanReach")} value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-warmgray-700 block mb-1">
                {t("requests.tellUsWhatYouNeed")} <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input-field min-h-[100px]"
                placeholder={formType === "aid" ? t("requests.describeAid") : t("requests.describeWork")}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            {formType === "aid" && (
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-2">{t("requests.howUrgent")}</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormUrgency(level)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors
                        ${formUrgency === level
                          ? level === "high" ? "border-red-500 bg-red-50 text-red-700" :
                            level === "medium" ? "border-yellow-500 bg-yellow-50 text-yellow-700" :
                            "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-warmgray-200 bg-warmgray-50 text-warmgray-600 hover:border-warmgray-300"
                        }`}
                    >
                      {t(`status.${level}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!formDesc.trim()}
              className={`w-full justify-center mt-4 ${formDesc.trim() ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"}`}
            >
              {t("requests.submitRequestBtn")}
            </button>

            <p className="text-xs text-warmgray-400 text-center">
              {t("requests.requestReviewNote")}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
