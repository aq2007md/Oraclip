import type { TargetPlatform, Goal } from "@/components/ContentUploader";

export type PatternCategory =
  | "hook"
  | "pacing"
  | "audio"
  | "caption"
  | "cta"
  | "structure"
  | "visual";

export type MatchStatus = "uses_this" | "worth_trying" | "missing";

export interface PatternSeed {
  category: PatternCategory;
  title: string;
  description: string;
  match_status: MatchStatus;
  sort_order: number;
}

interface PatternDef {
  category: PatternCategory;
  title: string;
  description: string;
}

const POOL: PatternDef[] = [
  // HOOK
  { category: "hook", title: "The cold open question",
    description: "Drops viewers into a question they need answered. \"Why does no one talk about this?\"" },
  { category: "hook", title: "Show the result first",
    description: "Open with the finished thing, then backtrack. \"This is what I made in 60 seconds.\"" },
  { category: "hook", title: "Visual disruption",
    description: "First frame is unexpected — wrong angle, odd object, or text that stops the scroll." },
  // PACING
  { category: "pacing", title: "Cuts every 1–2 seconds",
    description: "No shot held longer than 2s. Audio drives the rhythm." },
  { category: "pacing", title: "One continuous take",
    description: "Single shot, 15–22s. Works when the content itself is compelling." },
  { category: "pacing", title: "Speed ramp at the reveal",
    description: "Slow build, then a fast cut at the payoff. Rewards anyone still watching." },
  // AUDIO
  { category: "audio", title: "Trending sound, original audio low",
    description: "Algorithm rewards trending audio in the first 7 days of its life cycle." },
  { category: "audio", title: "Voiceover over silence",
    description: "Clear voice, music removed or quiet. Good for explainers." },
  { category: "audio", title: "Audio hook in the first second",
    description: "A sound effect or vocal hit on frame 1. Stops the scroll before the eye catches up." },
  // CAPTION
  { category: "caption", title: "Big text, one phrase per cut",
    description: "Hard-coded captions changing with each beat. Drives sound-off retention." },
  { category: "caption", title: "Caption is the script",
    description: "Reading the captions = watching the video. Most feed views are silent." },
  { category: "caption", title: "Hook line burned into frame 1",
    description: "The first caption is the whole pitch. If it doesn't land, nothing else gets watched." },
  // CTA
  { category: "cta", title: "Mid-video ask",
    description: "Request the follow/comment at the 1/3 mark, not the end. Most viewers leave before the outro." },
  { category: "cta", title: "Comment-bait question",
    description: "End with a question demanding an opinion, not yes/no." },
  { category: "cta", title: "One CTA, said twice",
    description: "A single ask (link, follow, save) repeated once early and once late. No mixed signals." },
  // STRUCTURE
  { category: "structure", title: "Loop-back ending",
    description: "Last frame matches the first so rewatch feels seamless. Boosts completion rate." },
  { category: "structure", title: "List format with on-screen counter",
    description: "Numbered points (\"3 things…\") give viewers a contract to stay through." },
  // VISUAL
  { category: "visual", title: "Face in first 0.5s",
    description: "Human face in the opening frame increases hold rate. Algorithm reads it as social." },
  { category: "visual", title: "On-screen counter or progress",
    description: "Progress bar, numbered list, or countdown gives viewers a reason to stay to the end." },
  { category: "visual", title: "High-contrast color in frame 1",
    description: "A single saturated color against a neutral background grabs the thumb mid-scroll." },
];

const GOAL_WEIGHTS: Record<NonNullable<Goal> | "other", Partial<Record<PatternCategory, number>>> = {
  followers:  { hook: 3, visual: 2, structure: 2, pacing: 1, caption: 1, audio: 1, cta: 1 },
  engagement: { cta: 3, caption: 2, hook: 2, structure: 2, pacing: 1, audio: 1, visual: 1 },
  leads:      { cta: 4, caption: 3, hook: 1, structure: 1, pacing: 1, audio: 1, visual: 1 },
  reach:      { audio: 3, hook: 3, pacing: 2, visual: 2, caption: 1, structure: 1, cta: 1 },
  awareness:  { visual: 3, hook: 2, caption: 2, structure: 2, pacing: 1, audio: 1, cta: 1 },
  traffic:    { cta: 4, caption: 2, hook: 2, structure: 1, visual: 1, pacing: 1, audio: 1 },
  other:      { hook: 2, pacing: 2, caption: 2, audio: 1, visual: 1, cta: 1, structure: 1 },
};

const PLATFORM_BOOST: Record<TargetPlatform, Partial<Record<PatternCategory, number>>> = {
  tiktok:    { pacing: 2, audio: 2, hook: 1 },
  instagram: { visual: 2, caption: 1, hook: 1 },
  youtube:   { structure: 2, hook: 1, cta: 1 },
  facebook:  { caption: 2, cta: 1, visual: 1 },
};

export interface PatternsContext {
  platform: TargetPlatform;
  goal: Goal | null;
}

function weightedSample(pool: PatternDef[], ctx: PatternsContext, n: number): PatternDef[] {
  const goalW = GOAL_WEIGHTS[ctx.goal ?? "other"];
  const platW = PLATFORM_BOOST[ctx.platform];
  const items = pool.map((p) => ({
    p,
    w: 1 + (goalW[p.category] ?? 0) + (platW[p.category] ?? 0),
  }));

  const picked: PatternDef[] = [];
  const remaining = [...items];
  for (let k = 0; k < n && remaining.length > 0; k++) {
    const total = remaining.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < remaining.length; i++) {
      r -= remaining[i].w;
      if (r <= 0) { idx = i; break; }
    }
    picked.push(remaining[idx].p);
    remaining.splice(idx, 1);
  }
  return picked;
}

export function generateReferencePatterns(ctx: PatternsContext): PatternSeed[] {
  const chosen = weightedSample(POOL, ctx, 4);
  // Distribution: 1 uses_this, 2 worth_trying, 1 missing — order shuffled.
  const statuses: MatchStatus[] = ["uses_this", "worth_trying", "worth_trying", "missing"];
  for (let i = statuses.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [statuses[i], statuses[j]] = [statuses[j], statuses[i]];
  }
  return chosen.map((p, i) => ({
    category: p.category,
    title: p.title,
    description: p.description,
    match_status: statuses[i],
    sort_order: i,
  }));
}

export const CATEGORY_LABEL: Record<PatternCategory, string> = {
  hook: "HOOK",
  pacing: "PACING",
  audio: "AUDIO",
  caption: "CAPTION",
  cta: "CTA",
  structure: "STRUCTURE",
  visual: "VISUAL",
};
