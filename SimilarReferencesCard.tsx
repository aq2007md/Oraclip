import { cn } from "@/lib/utils";

export interface ReachEstimateProps {
  /** Lower bound of estimated views */
  low: number;
  /** Upper bound of estimated views */
  high: number;
  /** Share of reach from existing followers, 0-1. Defaults to 0.6 */
  followerShare?: number;
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

export function ReachEstimate({
  low,
  high,
  followerShare = 0.6,
  className,
}: ReachEstimateProps) {
  const lo = Math.max(0, Math.min(low, high));
  const hi = Math.max(low, high);
  const mid = Math.round((lo + hi) / 2);
  const followerPct = Math.round(Math.max(0, Math.min(1, followerShare)) * 100);
  const discoveryPct = 100 - followerPct;

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl bg-teal-deep p-6 text-teal-foreground shadow-xl ring-1 ring-white/5",
        className,
      )}
      role="group"
      aria-label="Estimated reach"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-teal-foreground/60">
          Estimated reach
        </span>
        <span className="text-sm font-medium tabular-nums text-mint">
          {formatViews(lo)}–{formatViews(hi)} views
        </span>
      </div>

      <div className="relative mt-5">
        {/* Track */}
        <div className="h-2 w-full rounded-full bg-white/5 ring-1 ring-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mint/40 via-mint to-mint/40"
            style={{ filter: "drop-shadow(0 0 8px var(--mint-glow))" }}
          />
        </div>

        {/* Midpoint marker */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: "50%" }}
          aria-hidden="true"
        >
          <div className="h-4 w-[2px] rounded-full bg-teal-foreground" />
        </div>

        {/* Endpoint labels */}
        <div className="mt-2 flex justify-between text-[11px] tabular-nums text-teal-foreground/60">
          <span>{formatViews(lo)}</span>
          <span className="text-teal-foreground/80">~{formatViews(mid)}</span>
          <span>{formatViews(hi)}</span>
        </div>
      </div>

      <p className="mt-5 text-xs text-teal-foreground/70">
        ~<span className="font-medium text-teal-foreground/90">{followerPct}%</span>{" "}
        existing followers, ~
        <span className="font-medium text-teal-foreground/90">{discoveryPct}%</span>{" "}
        algorithmic discovery
      </p>
    </div>
  );
}

export default ReachEstimate;
