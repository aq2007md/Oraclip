import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Circle, ChevronDown, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: "Pricing — Oraclip" },
      {
        name: "description",
        content:
          "Simple pricing for Oraclip. Start free, upgrade when you're ready. Plans for creators, pros, and agencies.",
      },
      { property: "og:title", content: "Pricing — Oraclip" },
      {
        property: "og:description",
        content: "Plans that grow with you. Start free, cancel anytime.",
      },
    ],
  }),
});

type TierId = "free" | "creator" | "pro" | "agency";
type Billing = "monthly" | "annual";

interface Tier {
  id: TierId;
  name: string;
  subtitle: string;
  monthly: number;
  annual: number;
  ctaSignedOut: string;
  ctaSignedIn: string;
  ctaExternal?: string;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    subtitle: "Try before you commit",
    monthly: 0,
    annual: 0,
    ctaSignedOut: "Get started",
    ctaSignedIn: "Current plan",
    features: [
      { label: "2 video analyses per month", included: true },
      { label: "Virality score + predicted reach", included: true },
      { label: "Audience response simulation (3 personas)", included: true },
      { label: "Full recommendations with score breakdown", included: false },
      { label: "Reference patterns analysis", included: false },
      { label: "Platform-specific tips", included: false },
      { label: "Goal-specific metrics", included: false },
      { label: "Trend alerts & best-time-to-post", included: false },
    ],
  },
  {
    id: "creator",
    name: "Creator",
    subtitle: "For growing channels",
    monthly: 24,
    annual: 19,
    ctaSignedOut: "Start 7-day free trial",
    ctaSignedIn: "Upgrade to Creator",
    features: [
      { label: "20 analyses per month", included: true },
      { label: "Everything in Free, plus:", included: true },
      { label: "Full recommendations with score breakdown", included: true },
      { label: "Reference patterns analysis", included: true },
      { label: "Platform-specific tips (TikTok, IG, YouTube, Facebook)", included: true },
      { label: "Goal-specific metrics (followers, leads, engagement…)", included: true },
      { label: "Full audience simulation (6 personas)", included: true },
      { label: "Competitor benchmarking", included: false },
      { label: "Trend alerts", included: false },
      { label: "Bulk upload", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "For serious creators",
    monthly: 49,
    annual: 39,
    ctaSignedOut: "Start 7-day free trial",
    ctaSignedIn: "Upgrade to Pro",
    highlight: true,
    features: [
      { label: "Unlimited analyses", included: true },
      { label: "Everything in Creator, plus:", included: true },
      { label: "Competitor benchmarking", included: true },
      { label: "Trend alerts & best-time-to-post", included: true },
      { label: "Priority processing (results in <10s)", included: true },
      { label: "Save & compare past simulations", included: true },
      { label: "Style learning — predictions improve as you upload more", included: true },
      { label: "Team workspaces", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    id: "agency",
    name: "Agency",
    subtitle: "For teams & brands",
    monthly: 249,
    annual: 199,
    ctaSignedOut: "Book a demo",
    ctaSignedIn: "Book a demo",
    ctaExternal: "mailto:sales@oraclip.com?subject=Agency%20plan%20demo",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "5 brand workspaces", included: true },
      { label: "Bulk upload (up to 50 videos at once)", included: true },
      { label: "API access", included: true },
      { label: "White-label PDF reports", included: true },
      { label: "Dedicated onboarding & success manager", included: true },
      { label: "Custom audience profile training", included: true },
      { label: "SSO + advanced security", included: true },
    ],
  },
];

function Pricing() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--teal-deep)", color: "var(--teal-foreground)" }}
    >
      <Header scrolled={scrolled} />
      <Hero billing={billing} setBilling={setBilling} />
      <TierCards billing={billing} />
      <ComparisonTable billing={billing} />
      <FAQ />
      <EnterpriseBlock />
      <Footer />
    </div>
  );
}

/* ---------- Header (mirrors landing) ---------- */

function Header({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        background: scrolled
          ? "color-mix(in oklab, var(--teal-deep) 92%, black)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid color-mix(in oklab, var(--mint) 15%, transparent)"
          : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Oraclip home">
          <Logo size={28} wordmarkClassName="text-xl" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/" hash="features" className="opacity-80 hover:opacity-100">
            Features
          </Link>
          <Link to="/" hash="how-it-works" className="opacity-80 hover:opacity-100">
            How it works
          </Link>
          <Link to="/pricing" className="opacity-80 hover:opacity-100">
            Pricing
          </Link>
          <Link to="/" hash="demo" className="opacity-80 hover:opacity-100">
            Demo
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm opacity-80 hover:opacity-100">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:scale-105"
            style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
          >
            Try free
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------- Hero + billing toggle ---------- */

function Hero({
  billing,
  setBilling,
}: {
  billing: Billing;
  setBilling: (b: Billing) => void;
}) {
  return (
    <section className="px-6 pb-16 pt-16 text-center md:pt-24">
      <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
        Pricing that{" "}
        <span style={{ color: "var(--mint)" }}>grows with you.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base md:text-lg" style={{ opacity: 0.78 }}>
        Start free. Upgrade when you're ready. Cancel anytime.
      </p>
      <div className="mt-10 flex justify-center">
        <BillingToggle billing={billing} setBilling={setBilling} />
      </div>
    </section>
  );
}

function BillingToggle({
  billing,
  setBilling,
}: {
  billing: Billing;
  setBilling: (b: Billing) => void;
}) {
  return (
    <div
      className="relative inline-flex items-center gap-1 rounded-full border p-1"
      style={{
        borderColor: "color-mix(in oklab, var(--mint) 20%, transparent)",
        background: "color-mix(in oklab, var(--mint) 4%, transparent)",
      }}
    >
      <button
        onClick={() => setBilling("monthly")}
        className="relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors"
        style={{
          color: billing === "monthly" ? "var(--teal-deep)" : "var(--teal-foreground)",
          background: billing === "monthly" ? "var(--mint)" : "transparent",
        }}
      >
        Monthly
      </button>
      <button
        onClick={() => setBilling("annual")}
        className="relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors"
        style={{
          color: billing === "annual" ? "var(--teal-deep)" : "var(--teal-foreground)",
          background: billing === "annual" ? "var(--mint)" : "transparent",
        }}
      >
        Annual
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            background:
              billing === "annual"
                ? "color-mix(in oklab, var(--teal-deep) 80%, transparent)"
                : "color-mix(in oklab, var(--mint) 18%, transparent)",
            color: billing === "annual" ? "var(--mint)" : "var(--mint)",
          }}
        >
          Save 20%
        </span>
      </button>
    </div>
  );
}

/* ---------- Tier cards ---------- */

function TierCards({ billing }: { billing: Billing }) {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
        {TIERS.map((t) => (
          <TierCard key={t.id} tier={t} billing={billing} />
        ))}
      </div>
    </section>
  );
}

function TierCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const isHighlight = tier.highlight;
  return (
    <div
      className="relative flex flex-col rounded-2xl border p-6 transition-all"
      style={{
        borderColor: isHighlight
          ? "color-mix(in oklab, var(--mint) 60%, transparent)"
          : "color-mix(in oklab, var(--mint) 15%, transparent)",
        background: isHighlight
          ? "color-mix(in oklab, var(--mint) 8%, transparent)"
          : "color-mix(in oklab, var(--mint) 3%, transparent)",
        transform: isHighlight ? "scale(1.03)" : "none",
        boxShadow: isHighlight
          ? "0 0 50px color-mix(in oklab, var(--mint) 25%, transparent)"
          : "none",
      }}
    >
      {isHighlight && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
        >
          Most popular
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <p className="mt-1 text-sm" style={{ opacity: 0.65 }}>
          {tier.subtitle}
        </p>
      </div>

      <div className="mt-5 min-h-[88px]">
        <PriceDisplay tier={tier} billing={billing} />
      </div>

      <CTAButton tier={tier} billing={billing} />

      <ul className="mt-6 space-y-3 text-sm">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            {f.included ? (
              <Check
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--mint)" }}
              />
            ) : (
              <Circle
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ opacity: 0.35 }}
              />
            )}
            <span style={{ opacity: f.included ? 0.9 : 0.45 }}>{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceDisplay({ tier, billing }: { tier: Tier; billing: Billing }) {
  if (tier.monthly === 0) {
    return (
      <div key={billing} className="animate-in fade-in duration-200">
        <div className="text-4xl font-bold">$0</div>
        <div className="mt-1 text-sm" style={{ opacity: 0.6 }}>
          Free forever
        </div>
      </div>
    );
  }
  const price = billing === "annual" ? tier.annual : tier.monthly;
  const annualTotal = tier.annual * 12;
  return (
    <div key={billing} className="animate-in fade-in duration-200">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-sm" style={{ opacity: 0.6 }}>
          / mo
        </span>
        {billing === "annual" && (
          <span
            className="text-base line-through"
            style={{ opacity: 0.45 }}
          >
            ${tier.monthly}
          </span>
        )}
      </div>
      <div className="mt-1 text-xs" style={{ opacity: 0.55 }}>
        {billing === "annual"
          ? `Billed $${annualTotal.toLocaleString()} annually`
          : "Billed monthly"}
      </div>
    </div>
  );
}

function CTAButton({ tier, billing }: { tier: Tier; billing: Billing }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHighlight = tier.highlight;
  const label = user ? tier.ctaSignedIn : tier.ctaSignedOut;

  const trackAndGo = async () => {
    // Fire-and-forget click tracking.
    supabase
      .from("pricing_clicks")
      .insert({
        user_id: user?.id ?? null,
        tier_clicked: tier.id,
        billing_period: billing,
        came_from_route: "/pricing",
      })
      .then(({ error }) => {
        if (error) console.warn("[pricing_clicks]", error.message);
      });

    if (tier.ctaExternal) {
      window.location.href = tier.ctaExternal;
      return;
    }
    if (user) {
      navigate({ to: "/checkout/$tier", params: { tier: tier.id } });
    } else {
      navigate({ to: "/signup", search: { plan: tier.id } as never });
    }
  };

  const filled = isHighlight;
  const baseClasses =
    "mt-6 inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]";
  const styles: React.CSSProperties = filled
    ? {
        background: "var(--mint)",
        color: "var(--teal-deep)",
        boxShadow: "0 0 30px color-mix(in oklab, var(--mint) 30%, transparent)",
      }
    : {
        background: "transparent",
        color: "var(--teal-foreground)",
        border: "1px solid color-mix(in oklab, var(--mint) 40%, transparent)",
      };

  return (
    <button onClick={trackAndGo} className={baseClasses} style={styles}>
      {label}
      {tier.ctaExternal && <ArrowUpRight className="h-3.5 w-3.5" />}
    </button>
  );
}

/* ---------- Comparison table ---------- */

interface CompareRow {
  label: string;
  values: [string | boolean, string | boolean, string | boolean, string | boolean];
}
interface CompareSection {
  title: string;
  rows: CompareRow[];
}

const COMPARE: CompareSection[] = [
  {
    title: "Core Analysis",
    rows: [
      { label: "Video analyses", values: ["2/mo", "20/mo", "Unlimited", "Unlimited"] },
      { label: "Virality score", values: [true, true, true, true] },
      { label: "Predicted reach range", values: [true, true, true, true] },
      { label: "Priority processing", values: [false, false, true, true] },
    ],
  },
  {
    title: "Recommendations & Insights",
    rows: [
      { label: "Basic recommendations", values: [true, true, true, true] },
      { label: "Score breakdown", values: [false, true, true, true] },
      { label: "Reference patterns analysis", values: [false, true, true, true] },
      { label: "Platform-specific tips", values: [false, true, true, true] },
    ],
  },
  {
    title: "Audience & Goals",
    rows: [
      { label: "Audience personas", values: ["3", "6", "6", "6"] },
      { label: "Goal-specific metrics", values: [false, true, true, true] },
      { label: "Custom audience training", values: [false, false, false, true] },
    ],
  },
  {
    title: "Trends & Timing",
    rows: [
      { label: "Trend alerts", values: [false, false, true, true] },
      { label: "Best-time-to-post", values: [false, false, true, true] },
      { label: "Competitor benchmarking", values: [false, false, true, true] },
    ],
  },
  {
    title: "Team & Workflow",
    rows: [
      { label: "Save & compare past sims", values: [false, false, true, true] },
      { label: "Style learning", values: [false, false, true, true] },
      { label: "Brand workspaces", values: ["1", "1", "1", "5"] },
      { label: "Bulk upload", values: [false, false, false, "50 at once"] },
      { label: "API access", values: [false, false, false, true] },
      { label: "White-label PDF reports", values: [false, false, false, true] },
    ],
  },
  {
    title: "Support & Security",
    rows: [
      { label: "Community support", values: [true, true, true, true] },
      { label: "Email support", values: [false, true, true, true] },
      { label: "Dedicated success manager", values: [false, false, false, true] },
      { label: "SSO + advanced security", values: [false, false, false, true] },
    ],
  },
];

function ComparisonTable({ billing }: { billing: Billing }) {
  const [mobileTier, setMobileTier] = useState<TierId>("pro");
  const tierIndex = TIERS.findIndex((t) => t.id === mobileTier);
  const activeTier = TIERS[tierIndex];

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
          Compare every feature.
        </h2>

        {/* Desktop table */}
        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)" }}>
            <div
              className="sticky top-[72px] z-20 grid grid-cols-5 gap-4 border-b p-5"
              style={{
                background: "color-mix(in oklab, var(--teal-deep) 95%, black)",
                borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div />
              {TIERS.map((t) => (
                <div key={t.id} className="text-center">
                  <div className="font-semibold">{t.name}</div>
                  <div className="mt-1 text-xs" style={{ opacity: 0.6 }}>
                    {t.monthly === 0
                      ? "Free"
                      : `$${billing === "annual" ? t.annual : t.monthly}/mo`}
                  </div>
                  <div className="mt-3">
                    <CTAButton tier={t} billing={billing} />
                  </div>
                </div>
              ))}
            </div>

            {COMPARE.map((section) => (
              <div key={section.title}>
                <div
                  className="border-y px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: "color-mix(in oklab, var(--mint) 5%, transparent)",
                    borderColor: "color-mix(in oklab, var(--mint) 12%, transparent)",
                    color: "var(--mint)",
                  }}
                >
                  {section.title}
                </div>
                {section.rows.map((row, i) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-5 items-center gap-4 px-5 py-3.5 text-sm"
                    style={{
                      borderTop:
                        i > 0
                          ? "1px solid color-mix(in oklab, var(--mint) 8%, transparent)"
                          : "none",
                    }}
                  >
                    <div style={{ opacity: 0.85 }}>{row.label}</div>
                    {row.values.map((v, j) => (
                      <div key={j} className="text-center">
                        <CellValue value={v} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile accordion */}
        <div className="lg:hidden">
          <div
            className="mb-4 flex flex-wrap gap-2 rounded-full border p-1"
            style={{ borderColor: "color-mix(in oklab, var(--mint) 20%, transparent)" }}
          >
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setMobileTier(t.id)}
                className="flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors"
                style={{
                  background: mobileTier === t.id ? "var(--mint)" : "transparent",
                  color:
                    mobileTier === t.id ? "var(--teal-deep)" : "var(--teal-foreground)",
                }}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div
            className="rounded-2xl border"
            style={{ borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)" }}
          >
            <div
              className="border-b p-4 text-center"
              style={{ borderColor: "color-mix(in oklab, var(--mint) 12%, transparent)" }}
            >
              <div className="font-semibold">{activeTier.name}</div>
              <div className="mt-1 text-xs" style={{ opacity: 0.6 }}>
                {activeTier.monthly === 0
                  ? "Free"
                  : `$${billing === "annual" ? activeTier.annual : activeTier.monthly}/mo`}
              </div>
              <div className="mt-3">
                <CTAButton tier={activeTier} billing={billing} />
              </div>
            </div>

            {COMPARE.map((section) => (
              <div key={section.title}>
                <div
                  className="border-y px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: "color-mix(in oklab, var(--mint) 5%, transparent)",
                    borderColor: "color-mix(in oklab, var(--mint) 12%, transparent)",
                    color: "var(--mint)",
                  }}
                >
                  {section.title}
                </div>
                {section.rows.map((row, i) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    style={{
                      borderTop:
                        i > 0
                          ? "1px solid color-mix(in oklab, var(--mint) 8%, transparent)"
                          : "none",
                    }}
                  >
                    <div style={{ opacity: 0.85 }}>{row.label}</div>
                    <CellValue value={row.values[tierIndex]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-4 w-4" style={{ color: "var(--mint)" }} />;
  if (value === false) return <Circle className="mx-auto h-4 w-4" style={{ opacity: 0.35 }} />;
  return (
    <span className="text-xs font-medium" style={{ color: "var(--mint)" }}>
      {value}
    </span>
  );
}

/* ---------- FAQ ---------- */

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade anytime — the new tier kicks in immediately. Downgrade takes effect at the end of your current billing cycle.",
  },
  {
    q: "What counts as one analysis?",
    a: "Each video you upload and run a simulation on. Re-running on the same video after edits counts as a new analysis.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — full refund within 14 days, no questions asked.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Creator and Pro both include a 7-day free trial. No credit card required to start.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard in two clicks. No retention emails, no friction.",
  },
  {
    q: "What if I exceed my monthly analyses?",
    a: "On Free or Creator, you'll see a prompt to upgrade or wait until next month. Pro and Agency are unlimited.",
  },
  {
    q: "Do you support team billing?",
    a: "Yes — Agency plan includes 5 brand workspaces with separate seats. Contact us for larger teams.",
  },
  {
    q: "How accurate are the simulations?",
    a: "Our predictions are calibrated against thousands of viral short-form videos. Accuracy improves over time as the model learns from your uploaded content (Pro and above).",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
          Frequently asked.
        </h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-xl border"
                style={{
                  borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
                  background: "color-mix(in oklab, var(--mint) 3%, transparent)",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform"
                    style={{
                      color: "var(--mint)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    className="px-5 pb-4 text-sm leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200"
                    style={{ opacity: 0.75 }}
                  >
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Enterprise block ---------- */

function EnterpriseBlock() {
  return (
    <section className="px-6 pb-24">
      <div
        className="mx-auto max-w-3xl rounded-2xl border p-8 text-center"
        style={{
          borderColor: "color-mix(in oklab, var(--mint) 25%, transparent)",
          background: "color-mix(in oklab, var(--mint) 5%, transparent)",
        }}
      >
        <h3 className="text-2xl font-bold">Need something bigger?</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm" style={{ opacity: 0.75 }}>
          Custom plans for media companies, large agencies, and platforms with &gt;50 seats.
        </p>
        <a
          href="mailto:sales@oraclip.com?subject=Custom%20plan%20inquiry"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
          style={{ borderColor: "color-mix(in oklab, var(--mint) 40%, transparent)" }}
        >
          Talk to sales →
        </a>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer
      className="border-t px-6 py-12"
      style={{ borderColor: "color-mix(in oklab, var(--mint) 12%, transparent)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <Logo size={24} wordmarkClassName="text-lg" />
          <p className="mt-1 text-xs" style={{ opacity: 0.5 }}>
            © 2026 Oraclip · Built in Paris
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ opacity: 0.7 }}>
          <a href="#" className="hover:opacity-100">About</a>
          <Link to="/pricing" className="hover:opacity-100">Pricing</Link>
          <a href="#" className="hover:opacity-100">Contact</a>
          <a href="#" className="hover:opacity-100">Privacy</a>
          <a href="#" className="hover:opacity-100">Terms</a>
        </nav>
      </div>
    </footer>
  );
}
