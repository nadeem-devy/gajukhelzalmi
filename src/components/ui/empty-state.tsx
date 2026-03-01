"use client";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="text-warmgray-300 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-warmgray-700 mb-1">{title}</h3>
      <p className="text-warmgray-500 text-sm max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
