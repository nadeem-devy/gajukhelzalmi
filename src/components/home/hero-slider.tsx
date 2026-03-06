"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

interface Slide {
  titleKey: string;
  subtitleKey: string;
  gradient: string;
  icon: React.ReactNode;
  image?: string;
}

// SVG icons for each slide
const TreeIcon = () => (
  <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
    <circle cx="60" cy="40" r="30" fill="white" opacity="0.15" />
    <circle cx="42" cy="38" r="22" fill="white" opacity="0.12" />
    <circle cx="78" cy="38" r="22" fill="white" opacity="0.12" />
    <rect x="56" y="60" width="8" height="30" rx="2" fill="white" opacity="0.2" />
    <circle cx="60" cy="35" r="18" fill="white" opacity="0.2" />
    <path d="M40 95 H80" stroke="white" strokeWidth="3" opacity="0.15" strokeLinecap="round" />
  </svg>
);

const MedicalIcon = () => (
  <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
    <rect x="30" y="30" width="60" height="60" rx="16" fill="white" opacity="0.15" />
    <rect x="52" y="40" width="16" height="40" rx="4" fill="white" opacity="0.25" />
    <rect x="40" y="52" width="40" height="16" rx="4" fill="white" opacity="0.25" />
  </svg>
);

const FoodIcon = () => (
  <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
    <ellipse cx="60" cy="70" rx="35" ry="20" fill="white" opacity="0.12" />
    <path d="M25 70 C25 50, 60 25, 60 25 C60 25, 95 50, 95 70" stroke="white" strokeWidth="3" opacity="0.2" fill="none" />
    <circle cx="48" cy="55" r="5" fill="white" opacity="0.2" />
    <circle cx="60" cy="48" r="5" fill="white" opacity="0.2" />
    <circle cx="72" cy="55" r="5" fill="white" opacity="0.2" />
    <rect x="30" y="82" width="60" height="6" rx="3" fill="white" opacity="0.15" />
  </svg>
);

const RoadIcon = () => (
  <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
    <path d="M35 95 L50 25 L70 25 L85 95" stroke="white" strokeWidth="3" opacity="0.2" fill="white" fillOpacity="0.08" />
    <rect x="55" y="35" width="10" height="12" rx="2" fill="white" opacity="0.2" />
    <rect x="55" y="55" width="10" height="12" rx="2" fill="white" opacity="0.2" />
    <rect x="55" y="75" width="10" height="12" rx="2" fill="white" opacity="0.2" />
  </svg>
);

const CommunityIcon = () => (
  <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
    <circle cx="60" cy="40" r="14" fill="white" opacity="0.2" />
    <circle cx="35" cy="50" r="10" fill="white" opacity="0.15" />
    <circle cx="85" cy="50" r="10" fill="white" opacity="0.15" />
    <path d="M30 85 C30 68, 45 58, 60 58 C75 58, 90 68, 90 85" fill="white" opacity="0.12" />
    <path d="M15 90 C15 78, 25 70, 35 70 C42 70, 48 74, 50 80" fill="white" opacity="0.08" />
    <path d="M105 90 C105 78, 95 70, 85 70 C78 70, 72 74, 70 80" fill="white" opacity="0.08" />
  </svg>
);

const slides: Slide[] = [
  {
    titleKey: "home.hero.slide1Title",
    subtitleKey: "home.hero.slide1Subtitle",
    gradient: "from-primary-600 via-primary-700 to-emerald-800",
    icon: <CommunityIcon />,
  },
  {
    titleKey: "home.hero.slide2Title",
    subtitleKey: "home.hero.slide2Subtitle",
    gradient: "from-emerald-600 via-teal-700 to-cyan-800",
    icon: <TreeIcon />,
    image: "/IMG_20240801_171725_optimized_2000.jpg",
  },
  {
    titleKey: "home.hero.slide3Title",
    subtitleKey: "home.hero.slide3Subtitle",
    gradient: "from-rose-500 via-red-600 to-rose-800",
    icon: <MedicalIcon />,
  },
  {
    titleKey: "home.hero.slide4Title",
    subtitleKey: "home.hero.slide4Subtitle",
    gradient: "from-amber-500 via-orange-600 to-amber-800",
    icon: <FoodIcon />,
  },
  {
    titleKey: "home.hero.slide5Title",
    subtitleKey: "home.hero.slide5Subtitle",
    gradient: "from-blue-500 via-indigo-600 to-blue-800",
    icon: <RoadIcon />,
  },
];

export default function HeroSlider() {
  const { t } = useLang();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div
        className={`bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-in-out`}
      >
        {/* Full-bleed campaign image on right half */}
        {slide.image && (
          <div key={`img-${current}`} className="absolute inset-0 animate-fade-in">
            <Image
              src={slide.image}
              alt={t(slide.titleKey)}
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Gradient fade: solid on left, transparent on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 via-emerald-800/90 via-40% to-emerald-800/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />
          </div>
        )}

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="absolute top-[-30%] right-[-20%] w-full h-full rounded-full bg-white" />
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
          <div className="absolute bottom-[-40%] left-[-30%] w-full h-full rounded-full bg-white" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-6 sm:px-10 py-8 sm:py-14">
          {/* Text */}
          <div className="flex-1 text-center sm:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 px-3 py-1 rounded-full text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {t("home.badge")}
            </div>
            <h1
              key={current}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3 animate-fade-in"
            >
              {t(slide.titleKey)}
            </h1>
            <p
              key={`sub-${current}`}
              className="text-white/80 text-sm sm:text-base max-w-lg mb-6 animate-fade-in"
            >
              {t(slide.subtitleKey)}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <Link
                href="/campaigns"
                className="inline-flex items-center gap-2 bg-white text-warmgray-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm shadow-lg shadow-black/10"
              >
                {t("home.viewCampaigns")}
              </Link>
              <Link
                href="/funding"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/25 transition-colors text-sm border border-white/20"
              >
                {t("home.seeAllFunds")}
              </Link>
            </div>
          </div>

          {/* Right side: icon (hidden on mobile, image slides use full-bleed bg) */}
          {!slide.image && (
            <div
              key={`icon-${current}`}
              className="hidden sm:block w-44 h-44 lg:w-52 lg:h-52 shrink-0 animate-fade-in"
            >
              {slide.icon}
            </div>
          )}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
