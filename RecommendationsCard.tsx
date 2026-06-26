import { cn } from "@/lib/utils";

export interface EstimatedReachCardProps {
  reach_low: number;
  reach_high: number;
  platform_label: string;
  className?: string;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `${Math.round(n)}`;
}

export function EstimatedReachCard({
  reach_low,
  reach_high,
  platform_label,
  className,
}: EstimatedReachCardProps) {
  const lo = Math.max(0, Math.min(reach_low, reach_high));
  const hi = Math.max(reach_low, reach_high);

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl bg-teal-deep p-8 text-teal-foreground shadow-xl ring-1 ring-white/5",
        className,
      )}
      role="group"
      aria-label="Estimated reach"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs uppercase tracking-[0.2em] text-mint/70">
          Estimated reach
        </span>
        <p
          className="text-center text-4xl font-semibold tabular-nums text-mint leading-tight"
          style={{ filter: "drop-shadow(0 0 12px var(--mint-glow))" }}
        >
          {formatViews(lo)} – {formatViews(hi)}{" "}
          <span className="text-2xl font-medium text-mint/70">views</span>
        </p>
        <p className="text-center text-sm text-teal-foreground/70">
          Based on similar content in your niche on {platform_label}.
        </p>
      </div>
    </div>
  );
}

export default EstimatedReachCard;
