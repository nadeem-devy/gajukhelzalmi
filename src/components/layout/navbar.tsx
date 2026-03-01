"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n/context";
import {
  HomeIcon,
  ActivityIcon,
  CampaignIcon,
  FundingIcon,
  AidIcon,
  RequestIcon,
  ReportIcon,
  AboutIcon,
  AdminIcon,
  BellIcon,
  UserIcon,
  XIcon,
  LogOutIcon,
  MenuIcon,
} from "./icons";

// All navigation items
const allNav = [
  { href: "/", labelKey: "nav.home", icon: HomeIcon },
  { href: "/activities", labelKey: "nav.activities", icon: ActivityIcon },
  { href: "/campaigns", labelKey: "nav.campaigns", icon: CampaignIcon },
  { href: "/funding", labelKey: "nav.funding", icon: FundingIcon },
  { href: "/aid", labelKey: "nav.aid", icon: AidIcon },
  { href: "/requests", labelKey: "nav.requests", icon: RequestIcon },
  { href: "/reports", labelKey: "nav.reports", icon: ReportIcon },
  { href: "/about", labelKey: "nav.trust", icon: AboutIcon },
];

// Bottom tab items for mobile (5 tabs max — like a real app)
const bottomTabs = [
  { href: "/", labelKey: "nav.home", icon: HomeIcon },
  { href: "/campaigns", labelKey: "nav.campaigns", icon: CampaignIcon },
  { href: "/funding", labelKey: "nav.funding", icon: FundingIcon },
  { href: "/aid", labelKey: "nav.aid", icon: AidIcon },
  { href: "/", labelKey: "nav.more", icon: MenuIcon, isMore: true },
];

// "More" menu items (those not in bottom tabs)
const moreItems = [
  { href: "/activities", labelKey: "nav.activities", icon: ActivityIcon },
  { href: "/requests", labelKey: "nav.requests", icon: RequestIcon },
  { href: "/reports", labelKey: "nav.reports", icon: ReportIcon },
  { href: "/about", labelKey: "nav.trust", icon: AboutIcon },
];

function MoreIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, canViewAdminPanel, isSuperAdmin, logout } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead, dismissNotification } = useStore();
  const { t, td, lang, setLang } = useLang();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleLang = () => setLang(lang === "en" ? "ur" : "en");

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  // Check if current page is in "more" section
  const isMoreActive = moreItems.some((item) => isActive(item.href));

  return (
    <>
      {/* Top Bar — simplified on mobile */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-warmgray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shrink-0">
                <svg viewBox="0 0 512 512" className="w-full h-full">
                  <defs>
                    <linearGradient id="nav-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#16a34a"/>
                      <stop offset="100%" stopColor="#15803d"/>
                    </linearGradient>
                    <linearGradient id="nav-sun" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047"/>
                      <stop offset="100%" stopColor="#facc15"/>
                    </linearGradient>
                  </defs>
                  <rect width="512" height="512" rx="96" fill="url(#nav-bg)"/>
                  <path d="M56 400 L160 240 L210 300 L280 180 L340 260 L390 200 L456 400 Z" fill="white" opacity="0.15"/>
                  <path d="M160 400 L256 210 L352 400 Z" fill="white" opacity="0.2"/>
                  <circle cx="345" cy="195" r="32" fill="url(#nav-sun)" opacity="0.8"/>
                  <circle cx="358" cy="187" r="28" fill="url(#nav-bg)"/>
                  <text x="256" y="340" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="160" fontWeight="800" fill="white">GZ</text>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-warmgray-900 leading-tight">{t("home.title")}</h1>
                <p className="text-2xs text-warmgray-500 leading-tight">{t("nav.communityWelfare")}</p>
              </div>
              <span className="sm:hidden text-base font-bold text-warmgray-900">{t("home.title")}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {allNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? "bg-primary-50 text-primary-700"
                      : "text-warmgray-600 hover:bg-warmgray-100 hover:text-warmgray-800"
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className="px-2.5 py-1.5 hover:bg-warmgray-100 rounded-lg transition-colors text-xs font-semibold text-warmgray-600"
                aria-label="Toggle language"
              >
                {lang === "en" ? "اردو" : "EN"}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-warmgray-100 rounded-lg transition-colors relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-5 h-5 text-warmgray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 end-1 w-4 h-4 bg-red-500 text-white text-2xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute end-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-warmgray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-warmgray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-warmgray-900">{t("nav.updates")}</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllNotificationsRead()}
                          className="text-xs text-primary-600 font-medium hover:underline"
                        >
                          {t("nav.markAllRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-warmgray-400">
                          {t("nav.noNotifications")}
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-warmgray-50 flex items-start gap-2 group ${
                              !n.read ? "bg-primary-50/50" : ""
                            }`}
                          >
                            <div className="flex-1 cursor-pointer" onClick={() => markNotificationRead(n.id)}>
                              <p className="text-sm font-medium text-warmgray-900">{td(`${n.id}.title`, n.title)}</p>
                              <p className="text-xs text-warmgray-500 mt-0.5">{td(`${n.id}.message`, n.message)}</p>
                              <p className="text-2xs text-warmgray-400 mt-1">{n.date}</p>
                            </div>
                            <button
                              onClick={() => dismissNotification(n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-warmgray-100 rounded transition-all"
                              aria-label={t("nav.dismiss")}
                            >
                              <XIcon className="w-3.5 h-3.5 text-warmgray-400" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User / Login — desktop only */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  {canViewAdminPanel && (
                    <Link href="/admin" className="btn-ghost text-xs">
                      <AdminIcon className="w-4 h-4" />
                      {isSuperAdmin ? t("nav.admin") : t("nav.dashboard")}
                    </Link>
                  )}
                  <span className="text-sm text-warmgray-600">{user.name}</span>
                  <button onClick={logout} className="p-2 hover:bg-warmgray-100 rounded-lg">
                    <LogOutIcon className="w-4 h-4 text-warmgray-500" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden sm:flex btn-ghost text-xs">
                  <UserIcon className="w-4 h-4" />
                  {t("nav.login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-warmgray-200 lg:hidden safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {bottomTabs.map((item, i) => {
            if (item.isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setShowMore(!showMore)}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors
                    ${isMoreActive || showMore ? "text-primary-600" : "text-warmgray-400"}`}
                >
                  <MoreIcon className="w-6 h-6" />
                  <span className="text-2xs font-medium">{t(item.labelKey)}</span>
                </button>
              );
            }

            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors
                  ${active ? "text-primary-600" : "text-warmgray-400"}`}
              >
                <item.icon className={`w-6 h-6 ${active ? "stroke-[2.5]" : ""}`} />
                <span className="text-2xs font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* "More" Sheet (slides up from bottom) */}
      {showMore && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-16 inset-x-0 bg-white rounded-t-2xl shadow-2xl z-50 safe-bottom animate-slide-up">
            <div className="w-10 h-1 bg-warmgray-300 rounded-full mx-auto mt-3" />
            <div className="p-4 pb-2 space-y-1">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors
                      ${active
                        ? "bg-primary-50 text-primary-700"
                        : "text-warmgray-600 hover:bg-warmgray-50 active:bg-warmgray-100"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}

              <div className="divider" />

              {/* User actions in "More" menu on mobile */}
              {user ? (
                <>
                  {canViewAdminPanel && (
                    <Link
                      href="/admin"
                      onClick={() => setShowMore(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-warmgray-600 hover:bg-warmgray-50"
                    >
                      <AdminIcon className="w-5 h-5" />
                      {isSuperAdmin ? t("nav.adminPanel") : t("nav.dashboard")}
                    </Link>
                  )}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-warmgray-600">{user.name}</span>
                    <button
                      onClick={() => { logout(); setShowMore(false); }}
                      className="text-sm text-red-600 font-medium"
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setShowMore(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-primary-700 hover:bg-primary-50"
                >
                  <UserIcon className="w-5 h-5" />
                  {t("nav.login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
      )}
    </>
  );
}
