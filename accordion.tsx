import { cn } from "@/lib/utils";
import {
  Zap,
  Clock,
  Music,
  Type,
  Eye,
  MousePointerClick,
  Layers,
  Check,
  Sparkles,
  Plus,
} from "lucide-react";
import {
  CATEGORY_LABEL,
  type PatternCategory,
  type MatchStatus,
} from "@/lib/reference-patterns";
import type { TargetPlatform } from "@/components/ContentUploader";

export interface ReferencePattern {
  id: string;
  category: PatternCategory;
  title: string;
  description: string;
  match_status: MatchStatus;
}

export interface ReferencePatternsCardProps {
  patterns: ReferencePattern[];
  platformLabel: string;
  className?: string;
}

const CATEGORY_ICON: Record<PatternCategory, React.ComponentType<{ className?: string }>> = {
  hook: Zap,
  pacing: Clock,
  audio: Music,
  caption: Type,
  visual: Eye,
  cta: MousePointerClick,
  structure: Layers,
};

function MatchBadge({ status }: { status: MatchStatus }) {
  if (status === "uses_this") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-medium text-mint">
        <Check className="h-3 w-3" /> Your video uses this
      </span>
    );
  }
  if (status === "missing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
        <Plus className="h-3 w-3" /> Missing in your video
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-teal-foreground/60">
      <Sparkles className="h-3 w-3" /> Worth trying
    </span>
  );
}

export function ReferencePatternsCard({
  patterns,
  platformLabel,
  className,
}: ReferencePatternsCardProps) {
  if (patterns.length === 0) return null;

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl bg-teal-deep p-6 text-teal-foreground shadow-xl ring-1 ring-white/5",
        className,
      )}
      role="group"
      aria-label="Patterns we looked for"
    >
      <h3 className="text-lg font-semibold text-mint">Patterns we looked for</h3>
      <p className="mt-1 text-sm text-teal-foreground/70">
        Common traits in top-performing {platformLabel} videos for your goal and
        audience. These shaped your score and recommendations.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {patterns.map((p) => {
          const Icon = CATEGORY_ICON[p.category];
          return (
            <div
              key={p.id}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-mint/10 text-mint">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-foreground/50">
                  {CATEGORY_LABEL[p.category]}
                </span>
              </div>
              <p className="text-sm font-semibold leading-snug text-teal-foreground">
                {p.title}
              </p>
              <p className="text-xs leading-snug text-teal-foreground/65">
                {p.description}
              </p>
              <div className="mt-1">
                <MatchBadge status={p.match_status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReferencePatternsCard;

// re-export so callers can pass platform label without importing
export type { TargetPlatform };
