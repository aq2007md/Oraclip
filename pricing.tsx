import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { tierById } from "@/lib/account-tiers";
import {
  Sparkles,
  TrendingUp,
  Trophy,
  ArrowRight,
  Upload,
  UserCog,
  Plug,
  Crown,
  FileVideo,
  Music2,
  Instagram,
  Youtube,
  Facebook,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/")({
  component: AccountOverview,
});

type Stat = { label: string; value: string };
type RecentRun = {
  id: string;
  score: number | null;
  created_at: string;
  platform: string;
  filename: string;
};

const PLATFORM_ICON: Record<string, typeof Music2> = {
  tiktok: Music2,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
};

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 86_400_000;
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return d.toLocaleDateString();
}

function AccountOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stat[]>([
    { label: "Simulations this month", value: "—" },
    { label: "Average virality score", value: "—" },
    { label: "Highest score this month", value: "—" },
  ]);
  const [recent, setRecent] = useState<RecentRun[]>([]);
  const [loading, setLoading] = useState(true);

  const tier = tierById(profile?.subscription_tier);
  const firstName = (profile?.display_name ?? user?.email ?? "there").split(/[\s@]/)[0];

  useEffect(() => {
    if (!profile?.default_organization_id) return;
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("simulation_runs")
        .select(
          "id, virality_score, created_at, content_submissions!inner(target_platform, media_url, organization_id)",
        )
        .gte("created_at", since)
        .eq("content_submissions.organization_id", profile.default_organization_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[overview]", error);
        setLoading(false);
        return;
      }

      const rows = data ?? [];
      const scores = rows
        .map((r) => r.virality_score)
        .filter((s): s is number => typeof s === "number");

      setStats([
        { label: "Simulations this month", value: rows.length.toString() },
        {
          label: "Average virality score",
          value: scores.length
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length).toString()
            : "—",
        },
        {
          label: "Highest score this month",
          value: scores.length ? Math.max(...scores).toString() : "—",
        },
      ]);

      setRecent(
        rows.slice(0, 3).map((r) => {
          // Supabase typed join returns an object, but treat defensively.
          const sub = (r as unknown as {
            content_submissions: { target_platform: string; media_url: string | null };
          }).content_submissions;
          return {
            id: r.id,
            score: r.virality_score,
            created_at: r.created_at,
            platform: sub?.target_platform ?? "tiktok",
            filename: (sub?.media_url ?? "video").split("/").pop() ?? "video",
          };
        }),
      );
      setLoading(false);
    })();
  }, [profile?.default_organization_id]);

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Welcome back, {firstName}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm" style={{ opacity: 0.75 }}>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
          >
            <Sparkles className="h-3 w-3" />
            {tier.name} plan
          </span>
          <span>{tier.subtitle}</span>
        </div>
      </header>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="rounded-2xl border p-5"
            style={{
              borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
              background: "color-mix(in oklab, var(--mint) 4%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ opacity: 0.6 }}>
              {i === 0 && <FileVideo className="h-3.5 w-3.5" />}
              {i === 1 && <TrendingUp className="h-3.5 w-3.5" />}
              {i === 2 && <Trophy className="h-3.5 w-3.5" />}
              <span>{s.label}</span>
            </div>
            <p
              className="mt-3 text-4xl font-bold tabular-nums"
              style={{ color: "var(--mint)", filter: "drop-shadow(0 0 12px var(--mint-glow))" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {/* Recent simulations */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent simulations</h2>
          <Link
            to="/account/history"
            className="flex items-center gap-1 text-xs font-medium text-mint hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="text-sm" style={{ opacity: 0.6 }}>Loading…</p>
        ) : recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {recent.map((r) => {
              const Icon = PLATFORM_ICON[r.platform] ?? Music2;
              return (
                <Link
                  key={r.id}
                  to="/account/history"
                  search={{ expand: r.id } as never}
                  className="group flex flex-col gap-3 rounded-xl border p-4 transition-all hover:border-mint/40 hover:bg-white/[0.04]"
                  style={{
                    borderColor: "color-mix(in oklab, var(--mint) 12%, transparent)",
                    background: "color-mix(in oklab, var(--mint) 3%, transparent)",
                  }}
                >
                  <div
                    className="flex h-24 items-center justify-center rounded-lg"
                    style={{ background: "color-mix(in oklab, var(--mint) 8%, transparent)" }}
                  >
                    <FileVideo className="h-8 w-8 text-mint/60" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-1.5 text-xs" style={{ opacity: 0.7 }}>
                      <Icon className="h-3.5 w-3.5" />
                      <span className="truncate">{r.filename}</span>
                    </div>
                    {r.score !== null && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
                        style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
                      >
                        {r.score}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ opacity: 0.55 }}>
                    {relativeDate(r.created_at)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard to="/app" icon={Upload} title="Run a new simulation" desc="Upload a video and get insights in seconds." />
          <ActionCard to="/account/profile" icon={UserCog} title="Edit your profile" desc="Refine your niche, goal, and audience." />
          <ActionCard to="/account/connections" icon={Plug} title="Connect a social account" desc="Personalize predictions to your style." />
          {tier.id === "free" && (
            <ActionCard to="/account/plan" icon={Crown} title="Upgrade your plan" desc="Unlock unlimited simulations and pro features." highlight />
          )}
        </div>
      </section>
    </div>
  );
}

function ActionCard({
  to,
  icon: Icon,
  title,
  desc,
  highlight,
}: {
  to: "/app" | "/account/profile" | "/account/connections" | "/account/plan";
  icon: typeof Upload;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-start gap-3 rounded-xl border p-4 transition-all hover:scale-[1.01] hover:border-mint/50",
        highlight && "shadow-[0_0_30px_color-mix(in_oklab,var(--mint)_25%,transparent)]",
      )}
      style={{
        borderColor: highlight
          ? "color-mix(in oklab, var(--mint) 50%, transparent)"
          : "color-mix(in oklab, var(--mint) 15%, transparent)",
        background: highlight
          ? "color-mix(in oklab, var(--mint) 8%, transparent)"
          : "color-mix(in oklab, var(--mint) 3%, transparent)",
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "color-mix(in oklab, var(--mint) 18%, transparent)", color: "var(--mint)" }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-teal-foreground">{title}</p>
        <p className="mt-0.5 text-xs" style={{ opacity: 0.65 }}>{desc}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 self-center opacity-0 transition-opacity group-hover:opacity-60" />
    </Link>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl border border-dashed p-8 text-center"
      style={{ borderColor: "color-mix(in oklab, var(--mint) 25%, transparent)" }}
    >
      <FileVideo className="mx-auto h-10 w-10 text-mint/50" />
      <p className="mt-3 text-sm font-medium">No simulations yet.</p>
      <p className="mt-1 text-xs" style={{ opacity: 0.6 }}>
        Upload your first video to see it here.
      </p>
      <Link
        to="/app"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
        style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
      >
        <Upload className="h-4 w-4" /> Run your first simulation
      </Link>
    </div>
  );
}
