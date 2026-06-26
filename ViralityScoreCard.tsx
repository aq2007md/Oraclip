import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORY_BADGE,
  CATEGORY_LABELS,
  type RecommendationCategory,
} from "@/lib/recommendations";

export type StoredRecommendation = {
  id: string;
  category: RecommendationCategory;
  title: string;
  detail: string;
  predicted_lift: number;
  is_done: boolean;
};

export interface RecommendationsCardProps {
  recommendations: StoredRecommendation[];
  className?: string;
}

function liftBadgeClass(lift: number, done: boolean): string {
  if (done) {
    return "bg-mint/20 text-mint/70";
  }
  if (lift >= 9) return "bg-mint text-teal-deep";
  if (lift >= 6) return "bg-mint/80 text-teal-deep";
  return "bg-mint/60 text-teal-deep";
}

function liftSizeClass(lift: number): string {
  if (lift >= 9) return "text-sm px-2.5 py-1";
  if (lift >= 6) return "text-xs px-2 py-1";
  return "text-[11px] px-2 py-0.5";
}

export function RecommendationsCard({
  recommendations,
  className,
}: RecommendationsCardProps) {
  // Local optimistic state mirroring is_done.
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(recommendations.map((r) => [r.id, r.is_done])),
  );

  const sorted = useMemo(() => {
    return [...recommendations].sort((a, b) => {
      const ad = doneMap[a.id] ? 1 : 0;
      const bd = doneMap[b.id] ? 1 : 0;
      if (ad !== bd) return ad - bd; // not-done first
      return b.predicted_lift - a.predicted_lift;
    });
  }, [recommendations, doneMap]);

  const toggle = async (rec: StoredRecommendation) => {
    const next = !doneMap[rec.id];
    setDoneMap((m) => ({ ...m, [rec.id]: next }));
    const { error } = await supabase
      .from("recommendations")
      .update({
        is_done: next,
        done_at: next ? new Date().toISOString() : null,
      })
      .eq("id", rec.id);
    if (error) {
      console.error("[recommendation toggle]", error);
      // revert
      setDoneMap((m) => ({ ...m, [rec.id]: !next }));
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl bg-card p-6 text-foreground shadow-xl ring-1 ring-border",
        className,
      )}
      role="group"
      aria-label="Recommendations to improve this video"
    >
      <h3 className="text-base font-semibold text-foreground">
        How to improve this video
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Each suggestion shows the estimated virality lift if applied. Sorted by
        impact.
      </p>

      <ul className="mt-5 space-y-3">
        {sorted.map((rec) => {
          const done = !!doneMap[rec.id];
          return (
            <li
              key={rec.id}
              className={cn(
                "rounded-xl border border-border bg-background/60 p-3 transition-opacity",
                done && "opacity-60",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                        CATEGORY_BADGE[rec.category],
                      )}
                    >
                      {CATEGORY_LABELS[rec.category]}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-1.5 text-sm font-semibold leading-snug text-foreground",
                      done && "line-through text-muted-foreground",
                    )}
                  >
                    {rec.title}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {rec.detail}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full font-semibold tabular-nums",
                      liftBadgeClass(rec.predicted_lift, done),
                      liftSizeClass(rec.predicted_lift),
                    )}
                  >
                    {done && <Check className="h-3 w-3" />}+{rec.predicted_lift}
                    <span className="font-normal opacity-80">pts</span>
                  </span>
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Checkbox
                      checked={done}
                      onCheckedChange={() => toggle(rec)}
                      aria-label={
                        done
                          ? `Mark "${rec.title}" as not done`
                          : `Mark "${rec.title}" as done`
                      }
                    />
                    <span>{done ? "Done" : "Mark done"}</span>
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RecommendationsCard;
