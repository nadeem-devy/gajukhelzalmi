"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import Badge from "@/components/ui/badge";
import ProgressBar from "@/components/ui/progress-bar";
import Modal from "@/components/ui/modal";
import {
  ArrowLeftIcon,
  PlusIcon,
  AdminIcon,
  CheckCircleIcon,
} from "@/components/layout/icons";
import type { Campaign } from "@/lib/types";

export default function AdminCampaignsPage() {
  const { t, td, lang } = useLang();
  const { user, canManageCampaigns } = useAuth();
  const { campaigns, createCampaign, updateCampaign } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [created, setCreated] = useState(false);

  // Edit campaign state
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPurpose, setEditPurpose] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editSpent, setEditSpent] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "completed" | "upcoming">("active");
  const [editDone, setEditDone] = useState(false);

  const openEdit = (campaign: Campaign) => {
    setEditCampaign(campaign);
    setEditTitle(campaign.title);
    setEditPurpose(campaign.purpose);
    setEditTarget(String(campaign.targetAmount));
    setEditSpent(String(campaign.spentAmount));
    setEditStartDate(campaign.startDate);
    setEditEndDate(campaign.endDate || "");
    setEditStatus(campaign.status);
    setEditDone(false);
  };

  const handleUpdate = () => {
    if (!editCampaign || !editTitle.trim() || !editPurpose.trim() || !editTarget) return;
    updateCampaign(editCampaign.id, {
      title: editTitle,
      purpose: editPurpose,
      targetAmount: Number(editTarget),
      spentAmount: Number(editSpent) || 0,
      startDate: editStartDate,
      endDate: editEndDate || undefined,
      status: editStatus,
    });
    setEditDone(true);
  };

  const closeEdit = () => {
    setEditCampaign(null);
    setEditDone(false);
  };

  if (!canManageCampaigns) {
    return (
      <div className="container-page">
        <div className="empty-state">
          <AdminIcon className="w-12 h-12 text-warmgray-300" />
          <h2 className="text-lg font-bold text-warmgray-700 mt-3">{t("adminCampaigns.adminAccessRequired")}</h2>
          <Link href="/login" className="btn-primary mt-4">{t("admin.goToLogin")}</Link>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    if (!title.trim() || !purpose.trim() || !target) return;
    createCampaign({
      title,
      purpose,
      targetAmount: Number(target),
      startDate,
      endDate: endDate || undefined,
      userId: user!.id,
    });
    setTitle("");
    setPurpose("");
    setTarget("");
    setEndDate("");
    setCreated(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setCreated(false);
  };

  return (
    <div className="container-page">
      <div className="page-header">
        <Link href="/admin" className="btn-ghost mb-3 inline-flex">
          <ArrowLeftIcon className="w-4 h-4" />
          {t("adminCampaigns.backToAdmin")}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="section-title">{t("adminCampaigns.title")}</h1>
            <p className="section-subtitle">{t("adminCampaigns.subtitle")}</p>
          </div>
          <button onClick={() => { setShowForm(true); setCreated(false); }} className="btn-primary">
            <PlusIcon className="w-4 h-4" />
            {t("adminCampaigns.newCampaign")}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-warmgray-900">{td(`${campaign.id}.title`, campaign.title)}</h2>
                  <Badge status={campaign.status} />
                </div>
                <p className="text-xs text-warmgray-500">
                  {formatDate(campaign.startDate)} — {campaign.endDate ? formatDate(campaign.endDate) : t("adminCampaigns.ongoing")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center">
                <p className="text-xs text-warmgray-500">{t("adminCampaigns.target")}</p>
                <p className="text-sm font-bold">{formatCurrency(campaign.targetAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-green-600">{t("adminCampaigns.collected")}</p>
                <p className="text-sm font-bold text-green-700">{formatCurrency(campaign.collectedAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-yellow-600">{t("adminCampaigns.spent")}</p>
                <p className="text-sm font-bold text-yellow-700">{formatCurrency(campaign.spentAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-600">{t("adminCampaigns.balance")}</p>
                <p className="text-sm font-bold text-blue-700">{formatCurrency(campaign.collectedAmount - campaign.spentAmount)}</p>
              </div>
            </div>

            <ProgressBar value={campaign.collectedAmount} max={campaign.targetAmount} size="sm" />

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-warmgray-500">
                <span>{campaign.expenses.length} {t("adminCampaigns.expenses")}</span>
                <span>&middot;</span>
                <span>{campaign.updates.length} {t("adminCampaigns.updates")}</span>
              </div>
              <button
                onClick={() => openEdit(campaign)}
                className="btn-ghost text-primary-600 text-sm"
              >
                {t("adminCampaigns.edit")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={created ? t("adminCampaigns.campaignCreated") : t("adminCampaigns.createNewCampaign")}>
        {created ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-warmgray-900 mb-2">{t("adminCampaigns.campaignCreated")}!</h3>
            <p className="text-sm text-warmgray-500 mb-6">
              {t("adminCampaigns.campaignCreatedDesc")}
            </p>
            <button onClick={closeForm} className="btn-primary justify-center w-full">{t("adminCampaigns.done")}</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.campaignTitle")} <span className="text-red-500">*</span></label>
              <input type="text" className="input-field" placeholder={t("adminCampaigns.campaignTitlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.purposeLabel")} <span className="text-red-500">*</span></label>
              <textarea className="input-field min-h-[80px]" placeholder={t("adminCampaigns.purposePlaceholder")} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.targetAmount")} <span className="text-red-500">*</span></label>
              <input type="number" className="input-field" placeholder={lang === "ur" ? "مثلاً ۱۰۰۰۰۰" : "e.g. 100000"} value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.startDate")}</label>
                <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.endDate")} <span className="text-warmgray-400">({t("common.optional")})</span></label>
                <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || !purpose.trim() || !target}
              className={`w-full justify-center mt-4 ${title.trim() && purpose.trim() && target ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"}`}
            >
              {t("adminCampaigns.createCampaign")}
            </button>
          </div>
        )}
      </Modal>

      {/* Edit Campaign Modal */}
      {editCampaign && (
        <Modal
          isOpen={!!editCampaign}
          onClose={closeEdit}
          title={editDone ? t("adminCampaigns.campaignUpdated") : t("adminCampaigns.editCampaign")}
        >
          {editDone ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-warmgray-900 mb-2">{t("adminCampaigns.campaignUpdated")}!</h3>
              <p className="text-sm text-warmgray-500 mb-6">{t("adminCampaigns.campaignUpdatedDesc")}</p>
              <button onClick={closeEdit} className="btn-primary justify-center w-full">{t("adminCampaigns.done")}</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.campaignTitle")} <span className="text-red-500">*</span></label>
                <input type="text" className="input-field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.purposeLabel")} <span className="text-red-500">*</span></label>
                <textarea className="input-field min-h-[80px]" value={editPurpose} onChange={(e) => setEditPurpose(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.targetAmount")} <span className="text-red-500">*</span></label>
                  <input type="number" className="input-field" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.spentAmount")}</label>
                  <input type="number" className="input-field" value={editSpent} onChange={(e) => setEditSpent(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.statusLabel")} <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {(["active", "completed", "upcoming"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditStatus(s)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors
                        ${editStatus === s ? "bg-primary-50 border-primary-300 text-primary-700" : "border-warmgray-200 text-warmgray-600 hover:bg-warmgray-50"}`}
                    >
                      {t(`status.${s}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.startDate")}</label>
                  <input type="date" className="input-field" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("adminCampaigns.endDate")} <span className="text-warmgray-400">({t("common.optional")})</span></label>
                  <input type="date" className="input-field" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                </div>
              </div>
              <button
                onClick={handleUpdate}
                disabled={!editTitle.trim() || !editPurpose.trim() || !editTarget}
                className={`w-full justify-center mt-4 ${editTitle.trim() && editPurpose.trim() && editTarget ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"}`}
              >
                {t("adminCampaigns.saveChanges")}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
