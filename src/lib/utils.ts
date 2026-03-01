// Utility functions for Gajukhel Zalmi

function getCurrentLang(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gz-lang") || "en";
  }
  return "en";
}

export function formatCurrency(amount: number): string {
  const lang = getCurrentLang();
  if (lang === "ur") return `${amount.toLocaleString("ur-PK")} روپے`;
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

export function formatDate(dateStr: string): string {
  const lang = getCurrentLang();
  const locale = lang === "ur" ? "ur-PK" : "en-PK";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const lang = getCurrentLang();
  const locale = lang === "ur" ? "ur-PK" : "en-PK";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function maskName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length === 1) {
    return parts[0][0] + "***";
  }
  return parts[0][0] + "*** " + parts[parts.length - 1][0] + "***";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Activity
    planned: "bg-blue-100 text-blue-800",
    ongoing: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    // Campaign
    active: "bg-green-100 text-green-800",
    upcoming: "bg-blue-100 text-blue-800",
    // Aid
    applied: "bg-gray-100 text-gray-800",
    verified: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    delivered: "bg-emerald-100 text-emerald-800",
    closed: "bg-warmgray-100 text-warmgray-800",
    // Expense
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    // Request
    submitted: "bg-gray-100 text-gray-800",
    reviewing: "bg-yellow-100 text-yellow-800",
    converted: "bg-purple-100 text-purple-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getAidTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    food: "Food Support",
    medical: "Medical Aid",
    education: "Education Help",
    financial: "Financial Aid",
    housing: "Housing Support",
    clothing: "Clothing",
    other: "Other Support",
  };
  return labels[type] || type;
}

export function getDonationSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank: "Bank Transfer",
    online: "Online Payment",
    other: "Other",
  };
  return labels[source] || source;
}

export function getProgressPercentage(collected: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((collected / target) * 100));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function timeAgo(dateStr: string): string {
  const lang = getCurrentLang();
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (lang === "ur") {
    if (seconds < 60) return "ابھی ابھی";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} منٹ پہلے`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} گھنٹے پہلے`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} دن پہلے`;
    return formatDateShort(dateStr);
  }

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDateShort(dateStr);
}
