"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-white border-t border-warmgray-200 mt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg overflow-hidden">
                <svg viewBox="0 0 512 512" className="w-full h-full">
                  <defs>
                    <linearGradient id="ft-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#16a34a"/>
                      <stop offset="100%" stopColor="#15803d"/>
                    </linearGradient>
                  </defs>
                  <rect width="512" height="512" rx="96" fill="url(#ft-bg)"/>
                  <path d="M56 400 L160 240 L280 180 L390 200 L456 400 Z" fill="white" opacity="0.15"/>
                  <text x="256" y="340" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="180" fontWeight="800" fill="white">GZ</text>
                </svg>
              </div>
              <span className="font-bold text-warmgray-900">{t("home.title")}</span>
            </div>
            <p className="text-sm text-warmgray-500 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-warmgray-900 mb-3">{t("footer.quickLinks")}</h3>
            <div className="space-y-2">
              <Link href="/campaigns" className="block text-sm text-warmgray-500 hover:text-primary-600">{t("footer.campaigns")}</Link>
              <Link href="/funding" className="block text-sm text-warmgray-500 hover:text-primary-600">{t("footer.funding")}</Link>
              <Link href="/aid" className="block text-sm text-warmgray-500 hover:text-primary-600">{t("footer.aidSupport")}</Link>
              <Link href="/about" className="block text-sm text-warmgray-500 hover:text-primary-600">{t("footer.trustTransparency")}</Link>
            </div>
          </div>

          {/* Trust */}
          <div>
            <h3 className="font-semibold text-warmgray-900 mb-3">{t("footer.ourPromise")}</h3>
            <ul className="space-y-2 text-sm text-warmgray-500">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">&#10003;</span>
                {t("footer.promise1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">&#10003;</span>
                {t("footer.promise2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">&#10003;</span>
                {t("footer.promise3")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">&#10003;</span>
                {t("footer.promise4")}
              </li>
            </ul>
          </div>
        </div>

        <div className="divider mt-8 mb-4" />
        <p className="text-center text-xs text-warmgray-400">
          {t("footer.tagline")}
        </p>
      </div>
    </footer>
  );
}
