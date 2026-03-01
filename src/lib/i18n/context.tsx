"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import en from "./en";
import ur from "./ur";
import type { Dictionary } from "./en";

type Lang = "en" | "ur";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  td: (key: string, fallback: string) => string;
  setDataUrduMap: (map: Record<string, string>) => void;
  isRTL: boolean;
  dir: "ltr" | "rtl";
}

const dictionaries: Record<Lang, Dictionary> = { en, ur };

const LangContext = createContext<LangContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [dataUrduMap, setDataUrduMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("gz-lang") as Lang | null;
    if (stored === "en" || stored === "ur") {
      setLangState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("gz-lang", newLang);
  }, []);

  const t = useCallback((key: string): string => {
    return getNestedValue(dictionaries[lang] as unknown as Record<string, unknown>, key);
  }, [lang]);

  const td = useCallback((key: string, fallback: string): string => {
    if (lang === "ur") return dataUrduMap[key] || fallback;
    return fallback;
  }, [lang, dataUrduMap]);

  const isRTL = lang === "ur";
  const dir = isRTL ? "rtl" as const : "ltr" as const;

  return (
    <LangContext.Provider value={{ lang, setLang, t, td, setDataUrduMap, isRTL, dir }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
