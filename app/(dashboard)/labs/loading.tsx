// ViperRange — Labs Loading State
// ZeroDay Security Services

import { LabCardSkeleton } from "@/components/ui/skeleton";

export default function LabsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-surface/80 rounded animate-pulse" />
        <div className="h-4 w-80 bg-surface/80 rounded animate-pulse" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <LabCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
