"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { UserIcon } from "@/components/layout/icons";
import { useLang } from "@/lib/i18n/context";

export default function LoginPage() {
  const { login, loginLoading, user } = useAuth();
  const router = useRouter();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Auto-redirect after login
  useEffect(() => {
    if (user) {
      const target = user.role === "super_admin" || user.role === "volunteer" ? "/admin" : "/";
      router.replace(target);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !password.trim()) {
      setError(t("login.fillBoth"));
      return;
    }

    const err = await login(name.trim(), password.trim());
    if (err) {
      setError(t("login.invalidCredentials"));
    }
  };

  if (user) {
    return (
      <div className="container-page">
        <div className="max-w-sm mx-auto text-center py-16">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-warmgray-900 mb-2">{t("login.welcome")}, {user.name}</h1>
          <button onClick={() => router.push("/")} className="btn-primary mt-4">
            {t("login.goHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <div className="max-w-sm mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-4">
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <defs>
                <linearGradient id="login-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16a34a"/>
                  <stop offset="100%" stopColor="#15803d"/>
                </linearGradient>
                <linearGradient id="login-sun" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde047"/>
                  <stop offset="100%" stopColor="#facc15"/>
                </linearGradient>
              </defs>
              <rect width="512" height="512" rx="96" fill="url(#login-bg)"/>
              <path d="M56 400 L160 240 L210 300 L280 180 L340 260 L390 200 L456 400 Z" fill="white" opacity="0.15"/>
              <path d="M160 400 L256 210 L352 400 Z" fill="white" opacity="0.2"/>
              <circle cx="345" cy="195" r="32" fill="url(#login-sun)" opacity="0.8"/>
              <circle cx="358" cy="187" r="28" fill="url(#login-bg)"/>
              <text x="256" y="340" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="160" fontWeight="800" fill="white">GZ</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-warmgray-900">{t("login.title")}</h1>
          <p className="text-sm text-warmgray-500 mt-1">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-warmgray-700 mb-1">
              {t("login.nameLabel")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder={t("login.namePlaceholder")}
              autoComplete="username"
              disabled={loginLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-warmgray-700 mb-1">
              {t("login.passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={t("login.passwordPlaceholder")}
              autoComplete="current-password"
              disabled={loginLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="btn-primary w-full justify-center"
          >
            {loginLoading ? t("login.loggingIn") : t("login.loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
