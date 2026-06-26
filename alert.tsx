import { cn } from "@/lib/utils";

export type Confidence = "low" | "medium" | "high";

export interface ViralityScoreCardProps {
  score: number; // 0-100
  verdict: string;
  confidence: Confidence;
  className?: string;
}

const CONFIDENCE_META: Record<
  Confidence,
  { label: string; dots: number; tone: string; pillBg: string; dotOn: string; dotOff: string }
> = {
  low: {
    label: "Low confidence",
    dots: 1,
    tone: "text-amber-200",
    pillBg: "bg-amber-400/10 ring-1 ring-amber-300/20",
    dotOn: "bg-amber-300",
    dotOff: "bg-amber-300/20",
  },
  medium: {
    label: "Medium confidence",
    dots: 2,
    tone: "text-teal-foreground/80",
    pillBg: "bg-white/5 ring-1 ring-white/10",
    dotOn: "bg-teal-foreground/70",
    dotOff: "bg-white/15",
  },
  high: {
    label: "High confidence",
    dots: 3,
    tone: "text-mint",
    pillBg: "bg-mint/10 ring-1 ring-mint/20",
    dotOn: "bg-mint",
    dotOff: "bg-mint/20",
  },
};

export function ViralityScoreCard({
  score,
  verdict,
  confidence,
  className,
}: ViralityScoreCardProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 72;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const size = (radius + stroke) * 2;
  const meta = CONFIDENCE_META[confidence];

  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl bg-teal-deep p-8 text-teal-foreground shadow-xl ring-1 ring-white/5",
        className,
      )}
      role="group"
      aria-label="Virality score"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth={stroke}
              fill="none"
              className="text-mint"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              fill="none"
              className="text-mint transition-[stroke-dashoffset] duration-700 ease-out"
              style={{ filter: "drop-shadow(0 0 12px var(--mint-glow))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-semibold tabular-nums text-mint leading-none">
                {clamped}
              </span>
              <span className="text-lg font-medium tabular-nums text-teal-foreground/40 leading-none">
                / 100
              </span>
            </div>
            <span className="mt-2 text-xs uppercase tracking-[0.2em] text-teal-foreground/60">
              Virality
            </span>
          </div>
        </div>

        <p className="text-center text-base leading-relaxed text-teal-foreground/90">
          {verdict}
        </p>

        <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5", meta.pillBg)}>
          <div className="flex items-center gap-1" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn("h-1.5 w-1.5 rounded-full", i <= meta.dots ? meta.dotOn : meta.dotOff)}
              />
            ))}
          </div>
          <span className={cn("text-xs font-medium", meta.tone)}>{meta.label}</span>
        </div>
      </div>
    </div>
  );
}

export default ViralityScoreCard;
