"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n/context";
import { formatCurrency, formatDate, getProgressPercentage } from "@/lib/utils";
import Badge from "@/components/ui/badge";
import ProgressBar from "@/components/ui/progress-bar";
import Modal from "@/components/ui/modal";
import {
  CampaignIcon,
  CalendarIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  FundingIcon,
  FilterIcon,
} from "@/components/layout/icons";
import type { Campaign, DonationSource } from "@/lib/types";

export default function CampaignsPage() {
  const { user } = useAuth();
  const { campaigns, recordDonation } = useStore();
  const { t, td } = useLang();
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "upcoming">("all");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Donate modal state
  const [donateCampaign, setDonateCampaign] = useState<Campaign | null>(null);
  const [donateAmount, setDonateAmount] = useState("");
  const [donateSource, setDonateSource] = useState<DonationSource>("cash");
  const [donateName, setDonateName] = useState("");
  const [donateReceiver, setDonateReceiver] = useState("");
  const [donated, setDonated] = useState(false);

  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  const handleDonate = () => {
    if (!donateAmount || !donateCampaign || !donateName || !donateReceiver) return;
    recordDonation({
      amount: Number(donateAmount),
      source: donateSource,
      donorName: donateName,
      anonymous: false,
      campaignId: donateCampaign.id,
      recordedBy: user?.id || "public",
      receiverName: donateReceiver,
    });
    setDonated(true);
  };

  const closeDonateModal = () => {
    setDonateCampaign(null);
    setDonateAmount("");
    setDonateName("");
    setDonateReceiver("");
    setDonateSource("cash");
    setDonated(false);
  };

  return (
    <div className="container-page">
      <div className="page-header">
        <h1 className="section-title">{t("campaigns.title")}</h1>
        <p className="section-subtitle">{t("campaigns.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        <FilterIcon className="w-4 h-4 text-warmgray-400 shrink-0" />
        {(["all", "active", "completed", "upcoming"] as const).map((status) => (
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

      {/* Campaign Cards */}
      <div className="space-y-5">
        {filtered.map((campaign) => {
          const progress = getProgressPercentage(campaign.collectedAmount, campaign.targetAmount);
          const remaining = campaign.collectedAmount - campaign.spentAmount;

          return (
            <div key={campaign.id} id={campaign.id} className="card overflow-hidden">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <CampaignIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <Badge status={campaign.status} />
                  </div>
                  <div className="text-end text-xs text-warmgray-500">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {formatDate(campaign.startDate)}
                      {campaign.endDate && ` — ${formatDate(campaign.endDate)}`}
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-warmgray-900 mb-2">{td(`${campaign.id}.title`, campaign.title)}</h2>

                {/* Purpose */}
                <div className="bg-earth-50 border border-earth-100 rounded-xl p-3 mb-4">
                  <h3 className="text-xs font-semibold text-earth-700 uppercase tracking-wide mb-1">{t("campaigns.purpose")}</h3>
                  <p className="text-sm text-warmgray-700">{td(`${campaign.id}.purpose`, campaign.purpose)}</p>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-warmgray-50 rounded-xl p-3 text-center">
                    <p className="text-2xs text-warmgray-500 font-medium">{t("campaigns.target")}</p>
                    <p className="text-base font-bold text-warmgray-900">{formatCurrency(campaign.targetAmount)}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xs text-green-600 font-medium">{t("campaigns.collected")}</p>
                    <p className="text-base font-bold text-green-700">{formatCurrency(campaign.collectedAmount)}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-2xs text-yellow-600 font-medium">{t("campaigns.spent")}</p>
                    <p className="text-base font-bold text-yellow-700">{formatCurrency(campaign.spentAmount)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xs text-blue-600 font-medium">{t("campaigns.remaining")}</p>
                    <p className="text-base font-bold text-blue-700">{formatCurrency(remaining)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <ProgressBar
                  value={campaign.collectedAmount}
                  max={campaign.targetAmount}
                  label={`${progress}% ${t("campaigns.funded")}`}
                  showPercentage={false}
                />

                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="flex-1 btn-ghost text-primary-600 justify-center"
                  >
                    {t("campaigns.viewDetails")}
                    <ChevronRightIcon />
                  </button>
                  {campaign.status === "active" && (
                    <button
                      onClick={() => { setDonateCampaign(campaign); setDonated(false); }}
                      className="flex-1 btn-primary justify-center"
                    >
                      <FundingIcon className="w-4 h-4" />
                      {t("campaigns.contribute")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Modal
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          title={td(`${selectedCampaign.id}.title`, selectedCampaign.title)}
          size="lg"
        >
          <div className="mb-6">
            <h3 className="text-sm font-bold text-warmgray-900 mb-3 flex items-center gap-2">
              <FundingIcon className="w-4 h-4 text-warmgray-500" />
              {t("campaigns.expenseBreakdown")}
            </h3>
            <p className="text-xs text-warmgray-500 mb-3">{t("campaigns.everyExpense")}</p>
            <div className="space-y-2">
              {selectedCampaign.expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-warmgray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-warmgray-800">{td(`${expense.id}.description`, expense.description)}</p>
                    <p className="text-xs text-warmgray-500 mt-0.5">
                      {formatDate(expense.date)} &middot; {t(`expenseCategory.${expense.category}`) !== `expenseCategory.${expense.category}` ? t(`expenseCategory.${expense.category}`) : expense.category} &middot; {t("campaigns.approvedBy")} {expense.approvedBy}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-warmgray-900 whitespace-nowrap ml-3">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-warmgray-100 rounded-xl flex items-center justify-between">
              <span className="text-sm font-bold text-warmgray-700">{t("campaigns.totalExpenses")}</span>
              <span className="text-base font-bold text-warmgray-900">
                {formatCurrency(selectedCampaign.expenses.reduce((sum, e) => sum + e.amount, 0))}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-warmgray-900 mb-3 flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-warmgray-500" />
              {t("campaigns.campaignUpdates")}
            </h3>
            <div className="space-y-3">
              {selectedCampaign.updates.map((update, i) => (
                <div key={update.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-1.5" />
                    {i < selectedCampaign.updates.length - 1 && (
                      <div className="w-0.5 flex-1 bg-warmgray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-warmgray-500">{formatDate(update.date)}</p>
                    <p className="text-sm text-warmgray-700 mt-0.5">{td(`${update.id}.message`, update.message)}</p>
                    <p className="text-xs text-warmgray-400 mt-0.5">— {update.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Donate Modal */}
      {donateCampaign && (
        <Modal
          isOpen={!!donateCampaign}
          onClose={closeDonateModal}
          title={donated ? t("campaigns.thankYou") : `${t("campaigns.contributeTo")} ${td(`${donateCampaign.id}.title`, donateCampaign.title)}`}
        >
          {donated ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-warmgray-900 mb-2">{t("campaigns.donationSubmitted")}</h3>
              <p className="text-sm text-warmgray-500 mb-6">
                {t("campaigns.donationSubmittedDesc")}
              </p>
              <button onClick={closeDonateModal} className="btn-primary justify-center w-full">{t("campaigns.done")}</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("campaigns.fullName")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={t("campaigns.fullNamePlaceholder")}
                  value={donateName}
                  onChange={(e) => setDonateName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("campaigns.amountRs")} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 5000"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("campaigns.receiverName")} <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {["Gohar Ali", "Jasir Khan", "Asim Khan"].map((name) => (
                    <button
                      key={name}
                      onClick={() => setDonateReceiver(name)}
                      className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors text-left
                        ${donateReceiver === name
                          ? "bg-primary-50 border-primary-300 text-primary-700"
                          : "border-warmgray-200 text-warmgray-600 hover:bg-warmgray-50"
                        }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-warmgray-700 block mb-1">{t("campaigns.accountType")} <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {(["jazzcash", "easypaisa", "bank", "cash"] as const).map((src) => (
                    <button
                      key={src}
                      onClick={() => setDonateSource(src)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors
                        ${donateSource === src
                          ? "bg-primary-50 border-primary-300 text-primary-700"
                          : "border-warmgray-200 text-warmgray-600 hover:bg-warmgray-50"
                        }`}
                    >
                      {t(`campaigns.${src}`)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleDonate}
                disabled={!donateAmount || Number(donateAmount) <= 0 || !donateName || !donateReceiver}
                className={`w-full justify-center mt-2 ${donateAmount && Number(donateAmount) > 0 && donateName && donateReceiver ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"}`}
              >
                <FundingIcon className="w-4 h-4" />
                {`${t("campaigns.contributeRs")} ${donateAmount ? Number(donateAmount).toLocaleString() : "0"}`}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
