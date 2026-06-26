import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { TIERS, tierById, tierOrder, type TierId } from "@/lib/account-tiers";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/account/plan")({
  component: PlanPage,
});

function PlanPage() {
  const { profile } = useAuth();
  const current = tierById(profile?.subscription_tier);
  const [usedThisMonth, setUsedThisMonth] = useState(0);

  useEffect(() => {
    if (!profile?.default_organization_id) return;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    (async () => {
      const { count } = await supabase
        .from("simulation_runs")
        .select("id, content_submissions!inner(organization_id)", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString())
        .eq("content_submissions.organization_id", profile.default_organization_id);
      setUsedThisMonth(count ?? 0);
    })();
  }, [profile?.default_organization_id]);

  const limit = current.monthlyAnalyses;
  const isUnlimited = !Number.isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((usedThisMonth / Math.max(1, limit)) * 100));

  // Days until end of month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.max(0, Math.ceil((endOfMonth.getTime() - now.getTime()) / 86_400_000));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Plan & billing</h1>
        <p className="mt-1 text-sm" style={{ opacity: 0.7 }}>
          Manage your subscription and view usage.
        </p>
      </header>

      {/* Current plan */}
      <section
        className="rounded-2xl border p-6 md:p-8"
        style={{
          borderColor: "color-mix(in oklab, var(--mint) 35%, transparent)",
          background: "color-mix(in oklab, var(--mint) 6%, transparent)",
          boxShadow: "0 0 40px color-mix(in oklab, var(--mint) 12%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-mint" />
              <span className="text-xs uppercase tracking-wider" style={{ opacity: 0.7 }}>
                Current plan
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-bold">{current.name}</h2>
            <p className="mt-1 text-sm" style={{ opacity: 0.75 }}>
              {current.subtitle}
            </p>
          </div>
          {current.id === "free" ? (
            <Link
              to="/account/plan"
              hash="compare"
              className="rounded-full px-5 py-2 text-sm font-semibold"
              style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
            >
              Upgrade
            </Link>
          ) : (
            <button
              onClick={() => alert("Billing portal coming soon.")}
              className="rounded-full border px-5 py-2 text-sm font-semibold"
              style={{ borderColor: "color-mix(in oklab, var(--mint) 40%, transparent)" }}
            >
              Manage billing
            </button>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span style={{ opacity: 0.75 }}>
              {isUnlimited
                ? `${usedThisMonth} analyses this month`
                : `${usedThisMonth} of ${limit} analyses used this month`}
            </span>
            {!isUnlimited && (
              <span className="tabular-nums" style={{ opacity: 0.6 }}>
                {pct}%
              </span>
            )}
          </div>
          {!isUnlimited && (
            <Progress value={pct} className="mt-2 h-2 bg-white/10" />
          )}
          <p className="mt-3 text-xs" style={{ opacity: 0.6 }}>
            {current.id === "free"
              ? `Resets in ${daysUntilReset} day${daysUntilReset === 1 ? "" : "s"}.`
              : "Next billing: $— on —. Real billing wires up once Stripe is connected."}
          </p>
        </div>
      </section>

      {/* Compare plans */}
      <section id="compare">
        <h2 className="mb-4 text-lg font-semibold">Compare plans</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <MiniTierCard key={t.id} tier={t} currentId={current.id} />
          ))}
        </div>
      </section>

      {/* Billing history */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Billing history</h2>
        <div
          className="rounded-2xl border border-dashed p-8 text-center text-sm"
          style={{
            borderColor: "color-mix(in oklab, var(--mint) 20%, transparent)",
            opacity: 0.7,
          }}
        >
          No billing history yet. Once you upgrade, your invoices will appear here.
        </div>
      </section>
    </div>
  );
}

function MiniTierCard({
  tier,
  currentId,
}: {
  tier: (typeof TIERS)[number];
  currentId: TierId;
}) {
  const isCurrent = tier.id === currentId;
  const direction =
    tierOrder(tier.id) > tierOrder(currentId) ? "Upgrade" : "Downgrade";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-5",
        tier.highlight && !isCurrent && "shadow-[0_0_30px_color-mix(in_oklab,var(--mint)_20%,transparent)]",
      )}
      style={{
        borderColor: isCurrent
          ? "color-mix(in oklab, var(--mint) 60%, transparent)"
          : tier.highlight
            ? "color-mix(in oklab, var(--mint) 45%, transparent)"
            : "color-mix(in oklab, var(--mint) 15%, transparent)",
        background: isCurrent
          ? "color-mix(in oklab, var(--mint) 10%, transparent)"
          : "color-mix(in oklab, var(--mint) 3%, transparent)",
      }}
    >
      {isCurrent && (
        <span
          className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
        >
          Current
        </span>
      )}
      <h3 className="text-lg font-semibold">{tier.name}</h3>
      <p className="mt-0.5 text-xs" style={{ opacity: 0.65 }}>{tier.subtitle}</p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold">${tier.monthly}</span>
        <span className="text-xs" style={{ opacity: 0.55 }}>/ mo</span>
      </div>
      <p className="mt-1 text-xs" style={{ opacity: 0.55 }}>
        {!Number.isFinite(tier.monthlyAnalyses) ? "Unlimited analyses" : `${tier.monthlyAnalyses} analyses / mo`}
      </p>

      {isCurrent ? (
        <div
          className="mt-5 flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
          style={{
            background: "color-mix(in oklab, var(--mint) 18%, transparent)",
            color: "var(--mint)",
          }}
        >
          <Check className="h-3.5 w-3.5" /> Current plan
        </div>
      ) : (
        <Link
          to="/checkout/$tier"
          params={{ tier: tier.id }}
          className="mt-5 block rounded-full px-4 py-2 text-center text-xs font-semibold transition-transform hover:scale-[1.02]"
          style={
            tier.highlight
              ? { background: "var(--mint)", color: "var(--teal-deep)" }
              : {
                  background: "transparent",
                  border: "1px solid color-mix(in oklab, var(--mint) 40%, transparent)",
                  color: "var(--teal-foreground)",
                }
          }
        >
          {direction} to {tier.name}
        </Link>
      )}
    </div>
  );
}
