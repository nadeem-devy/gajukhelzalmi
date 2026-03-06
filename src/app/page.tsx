"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatCurrency, formatDate, getProgressPercentage } from "@/lib/utils";
import StatCard from "@/components/ui/stat-card";
import Badge from "@/components/ui/badge";
import ProgressBar from "@/components/ui/progress-bar";
import {
  FundingIcon,
  AidIcon,
  CampaignIcon,
  ActivityIcon,
  ChevronRightIcon,
  UsersIcon,
  CheckCircleIcon,
} from "@/components/layout/icons";
import { useLang } from "@/lib/i18n/context";
import HeroSlider from "@/components/home/hero-slider";

export default function HomePage() {
  const { t, td } = useLang();
  const { campaigns, activities, aidRecords, getFundingSummary } = useStore();
  const funding = getFundingSummary();
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const recentActivities = activities.filter((a) => a.status === "completed" || a.status === "ongoing").slice(0, 3);
  const recentAid = aidRecords.filter((a) => a.status === "delivered").slice(0, 5);
  const totalBeneficiaries = new Set(aidRecords.map((a) => a.beneficiaryId)).size;

  return (
    <div className="container-page">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={<FundingIcon />}
          label={t("home.totalCollected")}
          value={formatCurrency(funding.totalCollected)}
          subtitle={t("home.thisYear")}
        />
        <StatCard
          icon={<CheckCircleIcon />}
          label={t("home.totalSpent")}
          value={formatCurrency(funding.totalSpent)}
          subtitle={t("home.allApproved")}
        />
        <StatCard
          icon={<AidIcon />}
          label={t("home.familiesHelped")}
          value={String(totalBeneficiaries)}
          subtitle={t("home.andCounting")}
          trend="up"
        />
        <StatCard
          icon={<UsersIcon />}
          label={t("home.activeCampaigns")}
          value={String(activeCampaigns.length)}
          subtitle={t("home.rightNow")}
        />
      </section>

      {/* Active Campaigns */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">{t("home.activeCampaignsTitle")}</h2>
            <p className="section-subtitle">{t("home.activeCampaignsSubtitle")}</p>
          </div>
          <Link href="/campaigns" className="btn-ghost text-primary-600">
            {t("home.viewAll")} <ChevronRightIcon />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeCampaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns#${campaign.id}`} className="card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <CampaignIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <Badge status={campaign.status} />
                </div>
              </div>
              <h3 className="font-bold text-warmgray-900 text-lg mb-1">{td(`${campaign.id}.title`, campaign.title)}</h3>
              <p className="text-sm text-warmgray-500 mb-4 line-clamp-2">{td(`${campaign.id}.purpose`, campaign.purpose)}</p>

              <ProgressBar
                value={campaign.collectedAmount}
                max={campaign.targetAmount}
                label={`${formatCurrency(campaign.collectedAmount)} ${t("common.of")} ${formatCurrency(campaign.targetAmount)}`}
              />

              <div className="mt-3 flex items-center justify-between text-xs text-warmgray-500">
                <span>{t("home.spent")}: {formatCurrency(campaign.spentAmount)}</span>
                <span>{t("home.balance")}: {formatCurrency(campaign.collectedAmount - campaign.spentAmount)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activities */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">{t("home.recentActivities")}</h2>
            <p className="section-subtitle">{t("home.recentActivitiesSubtitle")}</p>
          </div>
          <Link href="/activities" className="btn-ghost text-primary-600">
            {t("home.viewAll")} <ChevronRightIcon />
          </Link>
        </div>

        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <Link key={activity.id} href="/activities" className="card-hover p-4 flex items-center gap-4">
              <div className="p-2.5 bg-earth-100 rounded-xl shrink-0">
                <ActivityIcon className="w-5 h-5 text-earth-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-warmgray-900 text-sm truncate">{td(`${activity.id}.title`, activity.title)}</h3>
                  <Badge status={activity.status} />
                </div>
                <p className="text-xs text-warmgray-500">{formatDate(activity.date)} &middot; {td(`${activity.id}.location`, activity.location)}</p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-warmgray-400 shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Aid */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">{t("home.recentAid")}</h2>
            <p className="section-subtitle">{t("home.recentAidSubtitle")}</p>
          </div>
          <Link href="/aid" className="btn-ghost text-primary-600">
            {t("home.viewAll")} <ChevronRightIcon />
          </Link>
        </div>

        <div className="card overflow-hidden">
          <div className="divide-y divide-warmgray-100">
            {recentAid.map((aid) => (
              <div key={aid.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <AidIcon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warmgray-800">{td(`${aid.id}.description`, aid.description)}</p>
                    <p className="text-xs text-warmgray-500">{formatDate(aid.deliveredDate || aid.approvedDate || aid.appliedDate)}</p>
                  </div>
                </div>
                <Badge status={aid.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t("home.trustTitle")}</h2>
        <p className="text-primary-100 text-sm sm:text-base max-w-lg mx-auto mb-4">
          {t("home.trustDesc")}
        </p>
        <Link href="/about" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-sm">
          {t("home.learnMore")}
          <ChevronRightIcon />
        </Link>
      </section>
    </div>
  );
}
