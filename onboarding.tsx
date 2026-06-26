import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { tierById } from "@/lib/account-tiers";
import {
  ChevronDown,
  FileVideo,
  Music2,
  Instagram,
  Youtube,
  Facebook,
  Loader2,
  Repeat2,
  Lock,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViralityScoreCard, type Confidence } from "@/components/ViralityScoreCard";
import { EstimatedReachCard } from "@/components/EstimatedReachCard";
import {
  AudienceResponseCard,
  type Persona,
  type Sentiment,
  type MetricTile,
} from "@/components/AudienceResponseCard";
import {
  RecommendationsCard,
  type StoredRecommendation,
} from "@/components/RecommendationsCard";
import {
  SimilarReferencesCard,
  type SimilarReference,
} from "@/components/SimilarReferencesCard";
import {
  ReferencePatternsCard,
  type ReferencePattern,
} from "@/components/ReferencePatternsCard";
import type { TargetPlatform, Goal } from "@/components/ContentUploader";

const searchSchema = z.object({
  expand: z.string().optional(),
});

export const Route = createFileRoute("/account/history")({
  validateSearch: searchSchema,
  component: HistoryPage,
});

const PLATFORM_LABELS: Record<TargetPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube Shorts",
  facebook: "Facebook Reels",
};
const PLATFORM_ICONS: Record<TargetPlatform, typeof Music2> = {
  tiktok: Music2,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
};

const PLATFORM_OPTIONS: ("all" | TargetPlatform)[] = ["all", "tiktok", "instagram", "youtube", "facebook"];
const GOAL_OPTIONS = ["all", "reach", "followers", "engagement", "leads", "awareness", "traffic"] as const;
type GoalFilter = (typeof GOAL_OPTIONS)[number];
type SortOption = "recent" | "highest" | "lowest";

type Run = {
  id: string;
  score: number | null;
  confidence: Confidence | null;
  reach_low: number | null;
  reach_high: number | null;
  created_at: string;
  submission_id: string;
  platform: TargetPlatform;
  goal: Goal | null;
  filename: string;
  caption: string | null;
  audience_description: string | null;
  audience_tags: string[] | null;
};

function relativeDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 86_400_000;
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return d.toLocaleDateString();
}

function HistoryPage() {
  const { profile } = useAuth();
  const search = useSearch({ from: "/account/history" });
  const tier = tierById(profile?.subscription_tier);

  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<"all" | TargetPlatform>("all");
  const [goalFilter, setGoalFilter] = useState<GoalFilter>("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [expanded, setExpanded] = useState<string | null>(search.expand ?? null);

  useEffect(() => {
    if (!profile?.default_organization_id) return;
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("simulation_runs")
        .select(
          "id, virality_score, confidence, reach_low, reach_high, created_at, submission_id, content_submissions!inner(target_platform, goal, media_url, caption, audience_description, audience_tags, organization_id)",
        )
        .gte("created_at", since)
        .eq("content_submissions.organization_id", profile.default_organization_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[history]", error);
        setLoading(false);
        return;
      }

      type Row = {
        id: string;
        virality_score: number | null;
        confidence: Confidence | null;
        reach_low: number | null;
        reach_high: number | null;
        created_at: string;
        submission_id: string;
        content_submissions: {
          target_platform: TargetPlatform;
          goal: Goal | null;
          media_url: string | null;
          caption: string | null;
          audience_description: string | null;
          audience_tags: string[] | null;
        };
      };

      setRuns(
        (data as unknown as Row[]).map((r) => ({
          id: r.id,
          score: r.virality_score,
          confidence: r.confidence,
          reach_low: r.reach_low,
          reach_high: r.reach_high,
          created_at: r.created_at,
          submission_id: r.submission_id,
          platform: r.content_submissions.target_platform,
          goal: r.content_submissions.goal,
          filename: (r.content_submissions.media_url ?? "video").split("/").pop() ?? "video",
          caption: r.content_submissions.caption,
          audience_description: r.content_submissions.audience_description,
          audience_tags: r.content_submissions.audience_tags,
        })),
      );
      setLoading(false);
    })();
  }, [profile?.default_organization_id]);

  const filtered = useMemo(() => {
    let r = [...runs];
    if (platformFilter !== "all") r = r.filter((x) => x.platform === platformFilter);
    if (goalFilter !== "all") r = r.filter((x) => x.goal === goalFilter);
    if (sort === "recent") {
      r.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    } else if (sort === "highest") {
      r.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    } else {
      r.sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
    }
    return r;
  }, [runs, platformFilter, goalFilter, sort]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Your simulations</h1>
        <p className="mt-1 text-sm" style={{ opacity: 0.7 }}>
          Last 30 days. Older simulations available on Pro and above.
        </p>
      </header>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as typeof platformFilter)}>
          <SelectTrigger className="h-9 w-[150px] border-white/15 bg-white/5 text-sm text-teal-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORM_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "all" ? "All platforms" : PLATFORM_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={goalFilter} onValueChange={(v) => setGoalFilter(v as GoalFilter)}>
          <SelectTrigger className="h-9 w-[150px] border-white/15 bg-white/5 text-sm text-teal-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GOAL_OPTIONS.map((g) => (
              <SelectItem key={g} value={g}>
                {g === "all" ? "All goals" : g.charAt(0).toUpperCase() + g.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="h-9 w-[160px] border-white/15 bg-white/5 text-sm text-teal-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="highest">Highest score</SelectItem>
            <SelectItem value="lowest">Lowest score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm" style={{ opacity: 0.6 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState hasAny={runs.length > 0} />
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <RunRow
              key={r.id}
              run={r}
              expanded={expanded === r.id}
              onToggle={() => setExpanded((cur) => (cur === r.id ? null : r.id))}
            />
          ))}
        </ul>
      )}

      {tier.id === "free" && runs.length > 0 && (
        <div
          className="rounded-2xl border border-dashed p-5 text-center text-sm"
          style={{
            borderColor: "color-mix(in oklab, var(--mint) 25%, transparent)",
            opacity: 0.85,
          }}
        >
          <Lock className="mx-auto mb-2 h-5 w-5 opacity-60" />
          Simulations older than 30 days are available on Creator and above.{" "}
          <Link to="/account/plan" className="font-semibold text-mint hover:underline">
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div
      className="rounded-2xl border border-dashed p-10 text-center"
      style={{ borderColor: "color-mix(in oklab, var(--mint) 25%, transparent)" }}
    >
      <FileVideo className="mx-auto h-12 w-12 text-mint/50" />
      <p className="mt-4 text-base font-medium">
        {hasAny ? "No simulations match your filters." : "No simulations yet."}
      </p>
      {!hasAny && (
        <>
          <p className="mt-1 text-sm" style={{ opacity: 0.65 }}>
            Upload your first video to see it here.
          </p>
          <Link
            to="/app"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
          >
            <Upload className="h-4 w-4" /> Run a simulation
          </Link>
        </>
      )}
    </div>
  );
}

function RunRow({
  run,
  expanded,
  onToggle,
}: {
  run: Run;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = PLATFORM_ICONS[run.platform];
  return (
    <li
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
        background: "color-mix(in oklab, var(--mint) 3%, transparent)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "color-mix(in oklab, var(--mint) 12%, transparent)", color: "var(--mint)" }}
        >
          <FileVideo className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{run.filename}</p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ opacity: 0.65 }}>
            <Icon className="h-3.5 w-3.5" /> {PLATFORM_LABELS[run.platform]} · {relativeDate(run.created_at)}
          </div>
        </div>
        {run.score !== null && (
          <span
            className="shrink-0 rounded-full px-3 py-1 text-base font-bold tabular-nums"
            style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
          >
            {run.score}
          </span>
        )}
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 opacity-60 transition-transform", expanded && "rotate-180")}
        />
      </button>

      {expanded && <RunDetails run={run} />}
    </li>
  );
}

type DetailData = {
  reactions: Persona[];
  recommendations: StoredRecommendation[];
  patterns: ReferencePattern[];
  references: SimilarReference[];
};

function RunDetails({ run }: { run: Run }) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [reactionsRes, recsRes, patternsRes, refsRes] = await Promise.all([
        supabase
          .from("audience_reactions")
          .select("persona_label, age_range, persona_description, reaction_text, sentiment_label")
          .eq("run_id", run.id),
        supabase
          .from("recommendations")
          .select("id, category, title, detail, predicted_lift, is_done")
          .eq("run_id", run.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("reference_patterns")
          .select("id, category, title, description, match_status, sort_order")
          .eq("run_id", run.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("similar_references")
          .select("id, platform, reference_title, creator_handle, view_count, reasoning, thumbnail_seed, sort_order")
          .eq("run_id", run.id)
          .order("sort_order", { ascending: true }),
      ]);

      const reactions: Persona[] = (reactionsRes.data ?? []).map((r) => ({
        name: r.persona_label,
        age_range: r.age_range ?? "",
        description: r.persona_description ?? "",
        quote: r.reaction_text ?? "",
        sentiment: ((r.sentiment_label as Sentiment | null) ?? "neutral") as Sentiment,
      }));

      const recommendations: StoredRecommendation[] = (recsRes.data ?? []).map((r) => ({
        id: r.id,
        category: (r.category ?? "hook") as StoredRecommendation["category"],
        title: r.title ?? "",
        detail: r.detail ?? "",
        predicted_lift: r.predicted_lift ?? 0,
        is_done: r.is_done ?? false,
      }));

      const patterns: ReferencePattern[] = (patternsRes.data ?? []).map((p) => ({
        id: p.id,
        category: p.category as ReferencePattern["category"],
        title: p.title,
        description: p.description,
        match_status: p.match_status as ReferencePattern["match_status"],
      }));

      const references: SimilarReference[] = (refsRes.data ?? []).map((r) => ({
        id: r.id,
        platform: (r.platform ?? run.platform) as TargetPlatform,
        title: r.reference_title ?? "",
        creator_handle: r.creator_handle ?? "",
        view_count: r.view_count ?? 0,
        reason: r.reasoning ?? "",
        thumbnail_seed: r.thumbnail_seed ?? "",
      }));

      setData({ reactions, recommendations, patterns, references });
      setLoading(false);
    })();
  }, [run.id, run.platform]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center border-t border-white/10 py-10">
        <Loader2 className="h-5 w-5 animate-spin text-mint" />
      </div>
    );
  }

  const reachMid =
    run.reach_low !== null && run.reach_high !== null
      ? Math.round((run.reach_low + run.reach_high) / 2)
      : 0;
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
        : `${n}`;
  const metrics: MetricTile[] = reachMid
    ? [
        {
          label: "Views",
          value: fmt(reachMid),
          range: `${fmt(run.reach_low ?? 0)} – ${fmt(run.reach_high ?? 0)}`,
        },
      ]
    : [];

  return (
    <div className="border-t border-white/10 p-5">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col items-stretch gap-6 lg:col-span-3 [&>*]:w-full">
          {run.score !== null && run.confidence && (
            <ViralityScoreCard
              score={run.score}
              verdict="Saved simulation result"
              confidence={run.confidence}
            />
          )}
          {run.reach_low !== null && run.reach_high !== null && (
            <EstimatedReachCard
              reach_low={run.reach_low}
              reach_high={run.reach_high}
              platform_label={PLATFORM_LABELS[run.platform]}
            />
          )}
          {data.reactions.length > 0 && (
            <AudienceResponseCard
              goal={run.goal}
              metrics={metrics}
              personas={data.reactions}
            />
          )}
        </div>
        <div className="flex flex-col items-stretch gap-6 lg:col-span-2 [&>*]:w-full">
          {data.recommendations.length > 0 && (
            <RecommendationsCard recommendations={data.recommendations} />
          )}
          {data.patterns.length > 0 && (
            <ReferencePatternsCard
              patterns={data.patterns}
              platformLabel={PLATFORM_LABELS[run.platform]}
            />
          )}
          {data.references.length > 0 && (
            <SimilarReferencesCard references={data.references} />
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Button
          asChild
          variant="outline"
          className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <Link to="/app" search={{ submission_id: run.submission_id } as never}>
            <Repeat2 className="mr-1.5 h-4 w-4" />
            Re-run this simulation with current improvements
          </Link>
        </Button>
      </div>
    </div>
  );
}
