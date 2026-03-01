"use client";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ icon, label, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="card p-3 sm:p-5 text-center">
      <div className="inline-flex p-1.5 sm:p-2 bg-primary-50 rounded-xl text-primary-600 mb-1.5">
        {icon}
      </div>
      <p className="text-2xs sm:text-xs text-warmgray-500 font-medium">{label}</p>
      <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-warmgray-900 leading-tight mt-0.5">{value}</p>
      {subtitle && (
        <p className={`text-2xs sm:text-xs mt-0.5 ${
          trend === "up" ? "text-green-600" :
          trend === "down" ? "text-red-600" :
          "text-warmgray-500"
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
