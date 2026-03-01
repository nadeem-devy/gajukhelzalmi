"use client";

import { getStatusColor } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";

interface BadgeProps {
  status: string;
  label?: string;
}

export default function Badge({ status, label }: BadgeProps) {
  const { t } = useLang();
  const translated = t(`status.${status}`);
  const displayLabel = label || (translated !== `status.${status}` ? translated : status.charAt(0).toUpperCase() + status.slice(1));
  return (
    <span className={`badge ${getStatusColor(status)}`}>
      {displayLabel}
    </span>
  );
}
