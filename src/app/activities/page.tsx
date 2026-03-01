"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import Badge from "@/components/ui/badge";
import { ActivityIcon, MapPinIcon, CalendarIcon, UsersIcon, FilterIcon } from "@/components/layout/icons";
import type { ActivityStatus } from "@/lib/types";

export default function ActivitiesPage() {
  const { t, td } = useLang();
  const { activities } = useStore();
  const [filter, setFilter] = useState<ActivityStatus | "all">("all");

  const filtered = filter === "all" ? activities : activities.filter((a) => a.status === filter);

  return (
    <div className="container-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="section-title">{t("activities.title")}</h1>
        <p className="section-subtitle">{t("activities.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        <FilterIcon className="w-4 h-4 text-warmgray-400 shrink-0" />
        {(["all", "completed", "ongoing", "planned"] as const).map((status) => (
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

      {/* Activity Cards */}
      <div className="space-y-4">
        {filtered.map((activity) => (
          <div key={activity.id} className="card overflow-hidden">
            {/* Story Header */}
            <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 bg-earth-100 rounded-xl shrink-0">
                  <ActivityIcon className="w-5 h-5 text-earth-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-warmgray-900">{td(`${activity.id}.title`, activity.title)}</h2>
                    <Badge status={activity.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-warmgray-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {formatDate(activity.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {td(`${activity.id}.location`, activity.location)}
                    </span>
                  </div>
                </div>
              </div>

              {/* What was done */}
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-warmgray-500 uppercase tracking-wide mb-1">{t("activities.whatWasDone")}</h3>
                <p className="text-sm text-warmgray-700 leading-relaxed">{td(`${activity.id}.description`, activity.description)}</p>
              </div>

              {/* Why it matters */}
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 mb-3">
                <h3 className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-1">{t("activities.whyItMatters")}</h3>
                <p className="text-sm text-primary-800">{td(`${activity.id}.whyItMatters`, activity.whyItMatters)}</p>
              </div>

              {/* Volunteers */}
              <div className="flex items-center gap-2 text-sm text-warmgray-600">
                <UsersIcon className="w-4 h-4 text-warmgray-400" />
                <span className="font-medium">{t("activities.whoHelped")}</span>
                <span className="text-warmgray-500">{activity.volunteers.map(v => td(`vol.${v}`, v)).join("، ")}</span>
              </div>
            </div>

            {/* Photo Proof Section */}
            {(activity.photosBefore?.length || activity.photosAfter?.length || activity.photos?.length) && (
              <div className="border-t border-warmgray-100 p-5">
                <h3 className="text-xs font-semibold text-warmgray-500 uppercase tracking-wide mb-3">{t("activities.visualProof")}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activity.photosBefore?.map((_, i) => (
                    <div key={`before-${i}`} className="aspect-square bg-warmgray-100 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl">📷</span>
                        <p className="text-2xs text-warmgray-500 mt-1">{t("activities.before")}</p>
                      </div>
                    </div>
                  ))}
                  {activity.photosAfter?.map((_, i) => (
                    <div key={`after-${i}`} className="aspect-square bg-primary-50 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl">📷</span>
                        <p className="text-2xs text-primary-600 mt-1">{t("activities.after")}</p>
                      </div>
                    </div>
                  ))}
                  {activity.photos?.map((_, i) => (
                    <div key={`photo-${i}`} className="aspect-square bg-warmgray-100 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl">📷</span>
                        <p className="text-2xs text-warmgray-500 mt-1">{t("activities.photo")} {i + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <ActivityIcon className="w-12 h-12 text-warmgray-300" />
          <h3 className="text-lg font-semibold text-warmgray-600 mt-3">{t("activities.noActivities")}</h3>
          <p className="text-sm text-warmgray-400 mt-1">{t("activities.tryChangingFilter")}</p>
        </div>
      )}
    </div>
  );
}
