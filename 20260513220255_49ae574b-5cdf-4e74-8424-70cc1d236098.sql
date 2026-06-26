import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CREATOR_TYPES,
  NICHES,
  GOALS,
  AUDIENCE_SIZES,
  CADENCES,
  COUNTRIES,
  detectCountry,
  type CreatorType,
} from "@/lib/onboarding-options";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: OnboardingPage,
  head: () => ({
    meta: [{ title: "Welcome to Oraclip — Set up your profile" }],
  }),
});

type State = {
  creator_type: CreatorType | null;
  primary_niche: string | null;
  niche_custom: string;
  primary_goal: string | null;
  primary_goal_custom: string;
  audience_size: string | null;
  audience_description: string;
  posting_cadence: string | null;
  country: string;
};

const TOTAL_STEPS = 5;

function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<State>({
    creator_type: null,
    primary_niche: null,
    niche_custom: "",
    primary_goal: null,
    primary_goal_custom: "",
    audience_size: null,
    audience_description: "",
    posting_cadence: null,
    country: "",
  });

  // Pre-fill from profile + detect country once profile loads.
  useEffect(() => {
    if (!profile) return;
    setState((s) => ({
      creator_type: (profile.creator_type as CreatorType | null) ?? s.creator_type,
      primary_niche: profile.primary_niche ?? s.primary_niche,
      niche_custom: profile.niche_custom ?? s.niche_custom,
      primary_goal: profile.primary_goal ?? s.primary_goal,
      primary_goal_custom: profile.primary_goal_custom ?? s.primary_goal_custom,
      audience_size: profile.audience_size ?? s.audience_size,
      audience_description: profile.audience_description ?? s.audience_description,
      posting_cadence: profile.posting_cadence ?? s.posting_cadence,
      country: profile.country ?? (s.country || detectCountry()),
    }));
  }, [profile]);

  const update = <K extends keyof State>(key: K, value: State[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const requiredOk = useMemo(() => {
    if (step === 1) return !!state.creator_type;
    if (step === 2) {
      if (!state.primary_niche) return false;
      if (state.primary_niche === "other" && !state.niche_custom.trim()) return false;
      return true;
    }
    if (step === 3) {
      if (!state.primary_goal) return false;
      if (state.primary_goal === "other" && !state.primary_goal_custom.trim()) return false;
      return true;
    }
    return true;
  }, [step, state]);

  const isOptional = step >= 4;

  const persist = async (markComplete: boolean, skipped: boolean) => {
    if (!user) return false;
    setError(null);
    setSubmitting(true);
    const payload = {
      creator_type: state.creator_type,
      primary_niche: state.primary_niche,
      niche_custom: state.primary_niche === "other" ? state.niche_custom.trim() || null : null,
      primary_goal: state.primary_goal,
      primary_goal_custom:
        state.primary_goal === "other" ? state.primary_goal_custom.trim() || null : null,
      audience_size: state.audience_size,
      audience_description: state.audience_description.trim() || null,
      posting_cadence: state.posting_cadence,
      country: state.country || null,
      ...(markComplete
        ? {
            onboarding_completed_at: new Date().toISOString(),
            onboarding_skipped: skipped,
          }
        : {}),
    };
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    if (error) {
      setSubmitting(false);
      setError(error.message);
      return false;
    }
    if (markComplete) {
      // Refresh local profile so the /app guard sees onboarding_completed_at
      // and doesn't bounce back to /onboarding.
      await refreshProfile();
    }
    setSubmitting(false);
    return true;
  };

  const goNext = async () => {
    if (!requiredOk) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    // Last step → finish
    const ok = await persist(true, false);
    if (ok) setDone(true);
  };

  const skip = async () => {
    if (!isOptional) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    const ok = await persist(true, true);
    if (ok) setDone(true);
  };

  const goBack = () => {
    if (done) {
      setDone(false);
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  if (done) {
    return (
      <ConfirmationScreen
        firstName={(profile?.display_name ?? user?.email ?? "there").split(/[\s@]/)[0]}
        state={state}
        onContinue={() => navigate({ to: "/app" })}
      />
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{ background: "var(--teal-deep)", color: "var(--teal-foreground)" }}
    >
      {/* Progress bar */}
      <div className="h-1 w-full bg-white/5">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: "var(--mint)" }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5 py-8 md:py-14">
        <div className="mb-6 flex items-center justify-between text-xs">
          <span style={{ opacity: 0.6 }}>
            Step {step} of {TOTAL_STEPS}
          </span>
          {isOptional && (
            <button
              type="button"
              onClick={skip}
              disabled={submitting}
              className="text-xs underline-offset-4 hover:underline"
              style={{ opacity: 0.7 }}
            >
              Skip for now
            </button>
          )}
        </div>

        <div className="flex-1">
          <div
            key={step}
            className="duration-250 animate-in fade-in slide-in-from-right-4"
          >
            {step === 1 && <Step1 value={state.creator_type} onChange={(v) => update("creator_type", v)} />}
            {step === 2 && (
              <Step2
                value={state.primary_niche}
                custom={state.niche_custom}
                onChange={(v) => update("primary_niche", v)}
                onCustomChange={(v) => update("niche_custom", v)}
              />
            )}
            {step === 3 && (
              <Step3
                value={state.primary_goal}
                custom={state.primary_goal_custom}
                onChange={(v) => update("primary_goal", v)}
                onCustomChange={(v) => update("primary_goal_custom", v)}
              />
            )}
            {step === 4 && (
              <Step4
                size={state.audience_size}
                desc={state.audience_description}
                onSize={(v) => update("audience_size", v)}
                onDesc={(v) => update("audience_description", v)}
              />
            )}
            {step === 5 && (
              <Step5
                cadence={state.posting_cadence}
                country={state.country}
                onCadence={(v) => update("posting_cadence", v)}
                onCountry={(v) => update("country", v)}
              />
            )}
          </div>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || submitting}
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-100 disabled:invisible"
            style={{ opacity: 0.7 }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Button
            onClick={goNext}
            disabled={!requiredOk || submitting}
            className="rounded-full px-6"
            style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {step === TOTAL_STEPS ? "Finish" : "Continue"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}

/* ---------- Shared UI ---------- */

function StepHeader({ title, subtext }: { title: string; subtext: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold leading-tight md:text-3xl">{title}</h1>
      <p className="mt-2 text-sm md:text-base" style={{ opacity: 0.7 }}>
        {subtext}
      </p>
    </div>
  );
}

function chipClasses(selected: boolean) {
  return cn(
    "rounded-full border px-4 py-2 text-sm font-medium transition-all",
    selected
      ? "border-transparent shadow-sm"
      : "border-white/15 hover:border-white/35 hover:bg-white/5",
  );
}

function chipStyle(selected: boolean): React.CSSProperties {
  return selected
    ? { background: "var(--mint)", color: "var(--teal-deep)" }
    : {};
}

/* ---------- Step 1: creator type ---------- */

function Step1({
  value,
  onChange,
}: {
  value: CreatorType | null;
  onChange: (v: CreatorType) => void;
}) {
  return (
    <>
      <StepHeader
        title="Which best describes you?"
        subtext="We'll tailor your recommendations to your context."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {CREATOR_TYPES.map((c) => {
          const selected = value === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              className={cn(
                "flex h-full flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all",
                selected ? "shadow-sm" : "hover:bg-white/[0.03]",
              )}
              style={
                selected
                  ? {
                      borderColor: "var(--mint)",
                      background: "color-mix(in oklab, var(--mint) 14%, transparent)",
                    }
                  : { borderColor: "color-mix(in oklab, var(--mint) 18%, transparent)" }
              }
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: "color-mix(in oklab, var(--mint) 18%, transparent)",
                  color: "var(--mint)",
                }}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{c.label}</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ opacity: 0.7 }}>
                  {c.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Step 2: niche ---------- */

function Step2({
  value,
  custom,
  onChange,
  onCustomChange,
}: {
  value: string | null;
  custom: string;
  onChange: (v: string) => void;
  onCustomChange: (v: string) => void;
}) {
  return (
    <>
      <StepHeader
        title="What's your main content niche?"
        subtext="Pick the closest match. You can refine later per video."
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {NICHES.map((n) => {
          const selected = value === n.value;
          return (
            <button
              key={n.value}
              type="button"
              onClick={() => onChange(n.value)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                selected ? "border-transparent" : "border-white/15 hover:border-white/35 hover:bg-white/5",
              )}
              style={
                selected
                  ? {
                      background: "color-mix(in oklab, var(--mint) 18%, transparent)",
                      borderColor: "var(--mint)",
                    }
                  : {}
              }
            >
              <n.icon
                className="h-4 w-4 shrink-0"
                style={{ color: selected ? "var(--mint)" : "currentColor", opacity: selected ? 1 : 0.7 }}
              />
              <span className="truncate">{n.label}</span>
            </button>
          );
        })}
      </div>
      {value === "other" && (
        <div className="mt-4">
          <Label htmlFor="niche-custom" className="text-sm" style={{ opacity: 0.85 }}>
            Describe your niche
          </Label>
          <Input
            id="niche-custom"
            value={custom}
            onChange={(e) => onCustomChange(e.target.value)}
            maxLength={120}
            className="mt-1.5 border-white/15 bg-white/5 text-white placeholder:text-white/40"
          />
        </div>
      )}
    </>
  );
}

/* ---------- Step 3: goal ---------- */

function Step3({
  value,
  custom,
  onChange,
  onCustomChange,
}: {
  value: string | null;
  custom: string;
  onChange: (v: string) => void;
  onCustomChange: (v: string) => void;
}) {
  return (
    <>
      <StepHeader
        title="What's your main goal with content?"
        subtext="We'll prioritize this in your predictions and recommendations. You can change it per video later."
      />
      <div className="flex flex-wrap gap-2">
        {GOALS.map((g) => {
          const selected = value === g.value;
          return (
            <button
              key={g.value}
              type="button"
              onClick={() => onChange(g.value)}
              className={chipClasses(selected)}
              style={chipStyle(selected)}
            >
              {g.label}
            </button>
          );
        })}
      </div>
      {value === "other" && (
        <div className="mt-4">
          <Label htmlFor="goal-custom" className="text-sm" style={{ opacity: 0.85 }}>
            Describe your goal
          </Label>
          <Input
            id="goal-custom"
            value={custom}
            onChange={(e) => onCustomChange(e.target.value)}
            maxLength={200}
            className="mt-1.5 border-white/15 bg-white/5 text-white placeholder:text-white/40"
          />
        </div>
      )}
    </>
  );
}

/* ---------- Step 4: audience (optional) ---------- */

function Step4({
  size,
  desc,
  onSize,
  onDesc,
}: {
  size: string | null;
  desc: string;
  onSize: (v: string) => void;
  onDesc: (v: string) => void;
}) {
  return (
    <>
      <StepHeader
        title="Tell us about your audience"
        subtext="Helps us personalize predictions. Skip anything you don't know yet."
      />
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">How big is your current audience?</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {AUDIENCE_SIZES.map((s) => {
              const selected = size === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onSize(s.value)}
                  className={chipClasses(selected)}
                  style={chipStyle(selected)}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label htmlFor="audience-desc" className="text-sm font-medium">
            Tell us about your target audience{" "}
            <span className="font-normal" style={{ opacity: 0.6 }}>
              (optional)
            </span>
          </Label>
          <Textarea
            id="audience-desc"
            value={desc}
            onChange={(e) => onDesc(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="e.g., French students 18-24 into productivity hacks, or US-based small business owners in legal services."
            className="mt-2 resize-y border-white/15 bg-white/5 text-white placeholder:text-white/40"
          />
          <p className="mt-1.5 text-xs" style={{ opacity: 0.55 }}>
            More specific = better personalization. You can skip this and add it per video later.
          </p>
        </div>
      </div>
    </>
  );
}

/* ---------- Step 5: cadence + country (optional) ---------- */

function Step5({
  cadence,
  country,
  onCadence,
  onCountry,
}: {
  cadence: string | null;
  country: string;
  onCadence: (v: string) => void;
  onCountry: (v: string) => void;
}) {
  return (
    <>
      <StepHeader
        title="A few last details"
        subtext="Helps Oraclip benchmark your simulations."
      />
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">How often do you post?</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {CADENCES.map((c) => {
              const selected = cadence === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onCadence(c.value)}
                  className={chipClasses(selected)}
                  style={chipStyle(selected)}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label htmlFor="country" className="text-sm font-medium">
            Which country are you primarily based in?
          </Label>
          <Select value={country} onValueChange={onCountry}>
            <SelectTrigger
              id="country"
              className="mt-2 border-white/15 bg-white/5 text-white"
            >
              <SelectValue placeholder="Choose a country" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}

/* ---------- Confirmation ---------- */

function ConfirmationScreen({
  firstName,
  state,
  onContinue,
}: {
  firstName: string;
  state: State;
  onContinue: () => void;
}) {
  const creatorLabel = CREATOR_TYPES.find((c) => c.value === state.creator_type)?.label;
  const nicheLabel =
    state.primary_niche === "other"
      ? state.niche_custom || "Other"
      : NICHES.find((n) => n.value === state.primary_niche)?.label;
  const goalLabel =
    state.primary_goal === "other"
      ? state.primary_goal_custom || "Other"
      : GOALS.find((g) => g.value === state.primary_goal)?.label;

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5"
      style={{ background: "var(--teal-deep)", color: "var(--teal-foreground)" }}
    >
      <div className="w-full max-w-[560px] text-center">
        <div
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
        >
          <Check className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          You're all set, {firstName}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm md:text-base" style={{ opacity: 0.75 }}>
          Your simulations will be personalized based on what you told us. The more you use
          Oraclip, the better predictions get.
        </p>

        <div
          className="mx-auto mt-8 rounded-2xl border p-5 text-left text-sm"
          style={{
            borderColor: "color-mix(in oklab, var(--mint) 18%, transparent)",
            background: "color-mix(in oklab, var(--mint) 4%, transparent)",
          }}
        >
          <p className="mb-3 text-xs font-mono uppercase" style={{ color: "var(--mint)", opacity: 0.8 }}>
            Your profile
          </p>
          <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
            <dt style={{ opacity: 0.55 }}>Creator type</dt>
            <dd className="col-span-2">{creatorLabel ?? "—"}</dd>
            <dt style={{ opacity: 0.55 }}>Niche</dt>
            <dd className="col-span-2">{nicheLabel ?? "—"}</dd>
            <dt style={{ opacity: 0.55 }}>Main goal</dt>
            <dd className="col-span-2">{goalLabel ?? "—"}</dd>
          </dl>
        </div>

        <Button
          onClick={onContinue}
          className="mt-8 rounded-full px-8 py-6 text-base font-semibold"
          style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
        >
          Run your first simulation
        </Button>
      </div>
    </main>
  );
}
