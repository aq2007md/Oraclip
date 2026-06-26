import { cn } from "@/lib/utils";
import type { Goal } from "@/components/ContentUploader";

export type Sentiment = "positive" | "neutral" | "negative";

export type Persona = {
  name: string;
  age_range: string;
  description: string;
  quote: string;
  sentiment: Sentiment;
};

export type MetricTile = {
  label: string;
  /** Pretty mid value, e.g. "12K". */
  value: string;
  /** Pretty range, e.g. "9K – 16K". */
  range: string;
};

export interface AudienceResponseCardProps {
  goal: Goal | null;
  metrics: MetricTile[];
  personas: Persona[];
  className?: string;
}

const GOAL_HEADINGS: Record<Goal | "default", string> = {
  reach: "Reach metrics",
  followers: "Follower metrics",
  engagement: "Engagement metrics",
  leads: "Lead metrics",
  awareness: "Awareness metrics",
  traffic: "Traffic metrics",
  other: "Engagement metrics",
  default: "Engagement metrics",
};

const SENTIMENT_STYLES: Record<Sentiment, { badge: string; label: string }> = {
  positive: {
    badge: "bg-mint text-teal-deep",
    label: "Positive",
  },
  neutral: {
    badge: "bg-muted text-muted-foreground",
    label: "Neutral",
  },
  negative: {
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
    label: "Negative",
  },
};

// Cycle through hue-shifted teals/mints for avatar circles.
const AVATAR_BG = [
  "bg-mint text-teal-deep",
  "bg-teal-deep text-mint",
  "bg-primary/20 text-primary",
  "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  "bg-mint/40 text-teal-deep",
  "bg-muted text-foreground",
];

export function AudienceResponseCard({
  goal,
  metrics,
  personas,
  className,
}: AudienceResponseCardProps) {
  const heading = GOAL_HEADINGS[goal ?? "default"];

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl bg-teal-deep p-6 text-teal-foreground shadow-xl ring-1 ring-white/5",
        className,
      )}
      role="group"
      aria-label="Predicted audience response"
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-mint">
          Predicted audience response
        </h3>
      </div>

      {/* Metric tiles */}
      <div className="mt-5 space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-mint/60">
          {heading}
        </p>
        <div
          className={cn(
            "grid gap-2",
            metrics.length >= 4
              ? "grid-cols-2"
              : metrics.length === 3
                ? "grid-cols-3"
                : "grid-cols-2",
          )}
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg bg-white/5 p-3 ring-1 ring-white/5"
            >
              <p className="text-[10px] uppercase tracking-wider text-teal-foreground/60">
                {m.label}
              </p>
              <p
                className="mt-1 text-2xl font-semibold tabular-nums text-mint leading-none"
                style={{ filter: "drop-shadow(0 0 8px var(--mint-glow))" }}
              >
                {m.value}
              </p>
              <p className="mt-1 text-[11px] text-teal-foreground/55 tabular-nums">
                {m.range}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Persona grid */}
      <div className="mt-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-mint/60">
          Persona reactions
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {personas.map((p, i) => {
            const sentimentStyle = SENTIMENT_STYLES[p.sentiment];
            const avatarStyle = AVATAR_BG[i % AVATAR_BG.length];
            const initial = p.name.trim().charAt(0).toUpperCase() || "?";
            return (
              <div
                key={`${p.name}-${i}`}
                className="rounded-lg bg-white/5 p-3 ring-1 ring-white/5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      avatarStyle,
                    )}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-teal-foreground">
                      {p.name}, {p.age_range}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-teal-foreground/65 line-clamp-2">
                  {p.description}
                </p>
                <p className="mt-2 text-[11px] italic leading-snug text-teal-foreground/85 line-clamp-3">
                  “{p.quote}”
                </p>
                <span
                  className={cn(
                    "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                    sentimentStyle.badge,
                  )}
                >
                  {sentimentStyle.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AudienceResponseCard;
