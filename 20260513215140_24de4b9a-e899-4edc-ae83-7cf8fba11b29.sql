import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Upload,
  Target,
  Sparkles,
  Gauge,
  Users,
  TrendingUp,
  LineChart,
  Crosshair,
  Lightbulb,
  Music2,
  Camera,
  Youtube,
  Facebook,
  Play,
  X,
  Linkedin,
  Instagram,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Oraclip — Know your content will work, before you publish" },
      {
        name: "description",
        content:
          "Oraclip simulates how your short-form video will perform on TikTok, Instagram, YouTube Shorts, and Facebook Reels. Get a virality score, audience reactions, and recommendations in seconds.",
      },
      { property: "og:title", content: "Oraclip — Your content confidence companion" },
      {
        property: "og:description",
        content:
          "Simulate virality, audience reactions, and reach for your short-form video before you publish.",
      },
    ],
  }),
});

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  // Side-effect redirect for signed-in users. Landing still renders
  // immediately so signed-out visitors never see a loading gate.
  useEffect(() => {
    if (user) navigate({ to: "/app" });
  }, [user, navigate]);

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
      <Hero onWatchDemo={() => setDemoOpen(true)} />
      <DemoBlock onPlay={() => setDemoOpen(true)} />
      <HowItWorks />
      <SocialProof />
      <FeatureGrid />
      <PlatformSupport />
      <PricingTeaser />
      <FinalCTA />
      <Footer />
      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
      <style>{marqueeKeyframes}</style>
    </div>
  );
}

/* ---------- Header ---------- */

function Header({ scrolled }: { scrolled: boolean }) {
  const { user } = useAuth();
  return (
    <header
      className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-[920px] -translate-x-1/2 rounded-full transition-all duration-300"
      style={{
        background: scrolled
          ? "color-mix(in oklab, var(--teal-deep) 88%, black)"
          : "color-mix(in oklab, var(--teal-deep) 75%, black)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(127, 227, 196, 0.15)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex items-center justify-between gap-4 py-2 pl-5 pr-3">
        <Link to={user ? "/app" : "/"} aria-label="Oraclip home" className="shrink-0">
          <img src="/oraclip-logo.svg" alt="Oraclip" className="h-12 w-auto" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          <a href="#features" className="opacity-80 transition-opacity hover:opacity-100">
            Features
          </a>
          <a href="#how-it-works" className="opacity-80 transition-opacity hover:opacity-100">
            How it works
          </a>
          <Link to="/pricing" className="opacity-80 transition-opacity hover:opacity-100">
            Pricing
          </Link>
          <a href="#demo" className="opacity-80 transition-opacity hover:opacity-100">
            Demo
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm opacity-80 transition-opacity hover:opacity-100 sm:inline">
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

/* ---------- Hero ---------- */

function Hero({ onWatchDemo }: { onWatchDemo: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <AnimatedGradient />
      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center md:pb-32 md:pt-32">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
          Know your content will work —{" "}
          <span style={{ color: "var(--mint)" }}>before you publish.</span>
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
          style={{ opacity: 0.78 }}
        >
          Oraclip simulates how your video will perform on TikTok, Instagram, YouTube Shorts,
          and Facebook Reels. Get a virality score, audience reactions, and specific
          recommendations — in seconds, not guesses.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="rounded-full px-8 py-3.5 text-base font-semibold transition-all hover:scale-105"
            style={{
              background: "var(--mint)",
              color: "var(--teal-deep)",
              boxShadow: "0 0 40px color-mix(in oklab, var(--mint) 30%, transparent)",
            }}
          >
            Try free — no credit card
          </Link>
          <button
            onClick={onWatchDemo}
            className="flex items-center gap-2 rounded-full border px-8 py-3.5 text-base font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: "color-mix(in oklab, var(--mint) 40%, transparent)" }}
          >
            <Play className="h-4 w-4" /> Watch 30s demo
          </button>
        </div>
        <p className="mt-6 text-sm" style={{ opacity: 0.55 }}>
          Your content confidence companion.
        </p>
      </div>
    </section>
  );
}

function AnimatedGradient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
        style={{
          background: "var(--mint)",
          animation: "breathe1 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-32 top-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "var(--mint)",
          animation: "breathe2 16s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
        style={{
          background: "var(--mint)",
          animation: "breathe1 18s ease-in-out infinite",
        }}
      />
    </div>
  );
}

/* ---------- Demo block ---------- */

function DemoBlock({ onPlay }: { onPlay: () => void }) {
  return (
    <section id="demo" className="px-6 pb-24 pt-8 md:pb-32">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onPlay}
          className="group relative block w-full overflow-hidden rounded-2xl border-2 transition-all hover:scale-[1.01]"
          style={{
            aspectRatio: "16 / 9",
            borderColor: "color-mix(in oklab, var(--mint) 50%, transparent)",
            boxShadow: "0 0 60px color-mix(in oklab, var(--mint) 25%, transparent)",
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--teal-deep) 60%, black), color-mix(in oklab, var(--mint) 20%, var(--teal-deep)))",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full transition-transform group-hover:scale-110"
              style={{
                background: "var(--mint)",
                boxShadow: "0 0 40px color-mix(in oklab, var(--mint) 60%, transparent)",
              }}
            >
              <Play
                className="h-8 w-8 translate-x-0.5"
                style={{ color: "var(--teal-deep)", fill: "var(--teal-deep)" }}
              />
            </div>
          </div>
        </button>
        <p className="mt-4 text-center text-sm" style={{ opacity: 0.65 }}>
          Watch a 30-second demo of Oraclip on a real TikTok before publication.
        </p>
      </div>
    </section>
  );
}

function DemoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border"
        style={{
          aspectRatio: "16 / 9",
          background: "var(--teal-deep)",
          borderColor: "color-mix(in oklab, var(--mint) 40%, transparent)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-full items-center justify-center text-sm" style={{ opacity: 0.6 }}>
          Demo video coming soon.
        </div>
      </div>
    </div>
  );
}

/* ---------- How it works ---------- */

const STEPS = [
  {
    icon: Upload,
    title: "Upload your video before posting",
    desc: "Drop in your draft — TikTok, Reels, Shorts, or Facebook. We never publish it.",
  },
  {
    icon: Target,
    title: "Set your goal and audience",
    desc: "Tell us who it's for and what success looks like — reach, follows, leads, engagement.",
  },
  {
    icon: Sparkles,
    title: "Get your virality score + how to improve it",
    desc: "Score, audience reactions, and a ranked list of fixes — each with an estimated lift.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker="How it works" title="Three steps. Sixty seconds." />
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl border p-8 transition-colors hover:bg-white/[0.02]"
              style={{
                borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
                background: "color-mix(in oklab, var(--mint) 3%, transparent)",
              }}
            >
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: "color-mix(in oklab, var(--mint) 15%, transparent)",
                  color: "var(--mint)",
                }}
              >
                <s.icon className="h-6 w-6" />
              </div>
              <div className="mb-3 text-xs font-mono" style={{ color: "var(--mint)", opacity: 0.7 }}>
                STEP {i + 1}
              </div>
              <h3 className="mb-3 text-xl font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ opacity: 0.7 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Social proof marquee ---------- */

const TESTIMONIALS = [
  { quote: "I stopped posting blind. Two of my last three videos hit 50K+ and I knew they would.", name: "Maya", role: "content creator", location: "Paris" },
  { quote: "Saved me from publishing a flop that would have hurt my client retention.", name: "Tom", role: "freelance marketer", location: "Berlin" },
  { quote: "The audience simulation caught a tone mismatch I would have missed.", name: "Sarah", role: "brand strategist", location: "NYC" },
  { quote: "Honestly the recommendations alone are worth it. Specific, not generic.", name: "Léo", role: "TikTok creator", location: "Lyon" },
  { quote: "I run 4 client accounts. This cut my pre-publish review time in half.", name: "Aïcha", role: "social media manager", location: "Lisbon" },
  { quote: "First tool that didn't tell me 'add a hook' and actually told me which hook.", name: "Hugo", role: "YouTube Shorts creator", location: "Madrid" },
  { quote: "Caught that my CTA was burying the link. 3x more clicks the next day.", name: "Zoe", role: "indie founder", location: "Amsterdam" },
  { quote: "Used to A/B test by posting and praying. Now I A/B before posting.", name: "Noah", role: "growth marketer", location: "London" },
  { quote: "The audience tab is uncanny. It surfaced an objection I'd never thought of.", name: "Camille", role: "course creator", location: "Brussels" },
  { quote: "I'm not a creator full-time. This makes me feel like I have a team.", name: "Kenji", role: "side-project builder", location: "Tokyo" },
];

function SocialProof() {
  const row1 = TESTIMONIALS.slice(0, 5);
  const row2 = TESTIMONIALS.slice(5, 10);
  return (
    <section className="overflow-hidden pb-24 md:pb-32">
      <div className="mx-auto mb-12 max-w-6xl px-6 text-center">
        <div
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: "color-mix(in oklab, var(--mint) 12%, transparent)",
            color: "var(--mint)",
          }}
        >
          From early beta testers
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          What creators are saying
        </h2>
        <p className="mt-3 text-sm" style={{ opacity: 0.55 }}>
          Quotes from our early access cohort. Not yet a public user base — that's coming.
        </p>
      </div>
      <Marquee items={row1} direction="left" />
      <div className="h-6" />
      <Marquee items={row2} direction="right" />
    </section>
  );
}

function Marquee({
  items,
  direction,
}: {
  items: typeof TESTIMONIALS;
  direction: "left" | "right";
}) {
  const doubled = [...items, ...items];
  return (
    <div className="relative">
      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: `marquee-${direction} 50s linear infinite`,
        }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
  location,
}: {
  quote: string;
  name: string;
  role: string;
  location: string;
}) {
  const colors = ["#7dd3c0", "#5fb8a3", "#9ae6cd", "#4a9b85", "#6fc7b0"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border p-5"
      style={{
        background: "color-mix(in oklab, var(--mint) 4%, var(--teal-deep))",
        borderColor: "color-mix(in oklab, var(--mint) 12%, transparent)",
      }}
    >
      <p className="text-sm leading-relaxed" style={{ opacity: 0.9 }}>
        "{quote}"
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
          style={{ background: color, color: "var(--teal-deep)" }}
        >
          {name[0]}
        </div>
        <div className="text-xs" style={{ opacity: 0.7 }}>
          <div className="font-semibold" style={{ opacity: 1 }}>
            {name}
          </div>
          <div>
            {role} · {location}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Feature grid ---------- */

const FEATURES = [
  { icon: Gauge, title: "Virality score", desc: "0–100 prediction with confidence band, calibrated per platform." },
  { icon: Users, title: "Audience simulation", desc: "Six personas react in their own voice — sentiment included." },
  { icon: TrendingUp, title: "Reach prediction", desc: "Estimated view range based on score, platform, and audience." },
  { icon: LineChart, title: "Pattern analysis", desc: "Which proven patterns your video uses — and which it's missing." },
  { icon: Crosshair, title: "Goal-specific metrics", desc: "Followers, leads, engagement — KPIs that match your intent." },
  { icon: Lightbulb, title: "Actionable recommendations", desc: "Ranked fixes with estimated lift. No 'add a hook' platitudes." },
];

function FeatureGrid() {
  return (
    <section id="features" className="px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker="What's inside" title="Everything you need to ship with confidence." />
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border p-6 transition-all hover:-translate-y-0.5"
              style={{
                borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
                background: "color-mix(in oklab, var(--mint) 3%, transparent)",
              }}
            >
              <f.icon className="mb-4 h-6 w-6" style={{ color: "var(--mint)" }} />
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ opacity: 0.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Platform support ---------- */

const PLATFORMS = [
  { icon: Music2, name: "TikTok" },
  { icon: Camera, name: "Instagram Reels" },
  { icon: Youtube, name: "YouTube Shorts" },
  { icon: Facebook, name: "Facebook Reels" },
];

const COMING_SOON = [
  { icon: Instagram, name: "Instagram" },
  { icon: Music2, name: "TikTok" },
  { icon: Youtube, name: "Youtube" },
  { icon: Facebook, name: "Facebook" },
];

function PlatformSupport() {
  return (
    <section className="px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-8 text-sm uppercase tracking-widest" style={{ opacity: 0.5 }}>
          Built for short-form video on
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <p.icon className="h-6 w-6" style={{ color: "var(--mint)" }} />
              <span className="text-base font-medium">{p.name}</span>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-16 max-w-2xl text-sm" style={{ opacity: 0.6 }}>
          Coming soon: connect your accounts for personalized predictions that learn from your
          past content.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          {COMING_SOON.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 rounded-full border px-4 py-2"
              style={{
                borderColor: "color-mix(in oklab, var(--mint) 12%, transparent)",
                opacity: 0.55,
              }}
            >
              <p.icon className="h-4 w-4" />
              <span className="text-xs">{p.name}</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: "color-mix(in oklab, var(--mint) 15%, transparent)",
                  color: "var(--mint)",
                }}
              >
                Coming Q3
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing teaser ---------- */

const TIERS = [
  { name: "Free", price: "$0", desc: "2 simulations / month. Forever." },
  { name: "Creator", price: "$19", desc: "Unlimited for solo creators." },
  { name: "Pro", price: "$49", desc: "For power users with multiple brands." },
  { name: "Agency", price: "$149", desc: "Team seats, client workspaces." },
];

function PricingTeaser() {
  return (
    <section className="px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker="Pricing" title="Plans for every stage." />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border p-6"
              style={{
                borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
                background: "color-mix(in oklab, var(--mint) 3%, transparent)",
              }}
            >
              <div className="text-sm font-medium" style={{ color: "var(--mint)" }}>
                {t.name}
              </div>
              <div className="mt-3 text-3xl font-bold">
                {t.price}
                <span className="text-sm font-normal" style={{ opacity: 0.6 }}>
                  /mo
                </span>
              </div>
              <p className="mt-3 text-sm" style={{ opacity: 0.7 }}>
                {t.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: "var(--mint)" }}
          >
            See full plans →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="px-6 pb-24 md:pb-32">
      <div
        className="mx-auto max-w-5xl rounded-3xl border p-12 text-center md:p-20"
        style={{
          borderColor: "color-mix(in oklab, var(--mint) 30%, transparent)",
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--mint) 10%, transparent), transparent 70%)",
        }}
      >
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Stop publishing blind.{" "}
          <span style={{ color: "var(--mint)" }}>Start posting with confidence.</span>
        </h2>
        <Link
          to="/signup"
          className="mt-10 inline-block rounded-full px-10 py-4 text-base font-semibold transition-transform hover:scale-105"
          style={{
            background: "var(--mint)",
            color: "var(--teal-deep)",
            boxShadow: "0 0 50px color-mix(in oklab, var(--mint) 35%, transparent)",
          }}
        >
          Try Oraclip free
        </Link>
        <p className="mt-5 text-sm" style={{ opacity: 0.6 }}>
          No credit card. 2 analyses per month, free forever.
        </p>
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

/* ---------- Helpers ---------- */

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center">
      <div
        className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
        style={{
          background: "color-mix(in oklab, var(--mint) 12%, transparent)",
          color: "var(--mint)",
        }}
      >
        {kicker}
      </div>
      <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
    </div>
  );
}

const marqueeKeyframes = `
@keyframes marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes marquee-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
@keyframes breathe1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, 30px) scale(1.1); }
}
@keyframes breathe2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 40px) scale(1.15); }
}
`;
