import type { TargetPlatform, Goal } from "@/components/ContentUploader";

export interface SimilarRefSeed {
  platform: TargetPlatform;
  title: string;
  creator_handle: string;
  view_count: number;
  reason: string;
  thumbnail_seed: string;
  sort_order: number;
}

export interface SimilarRefContext {
  platform: TargetPlatform;
  goal: Goal | null;
  audienceDescription: string | null;
  audienceTags: string[];
}

const AUDIENCE_TAG_LABELS: Record<string, string> = {
  gen_z: "Gen Z",
  millennials: "Millennials",
  gen_x: "Gen X",
  boomers: "Boomers",
  students: "students",
  parents: "parents",
  professionals: "professionals",
  independent_creators: "creators",
  smes: "small business",
  enterprises: "enterprise",
  consumers_b2c: "consumers",
  businesses_b2b: "B2B",
  niche_hobbyists: "hobbyists",
};

const REASONS_BY_GOAL: Record<NonNullable<Goal> | "other", string[]> = {
  followers: [
    "Strong hook in 0–2s pulled profile visits",
    "Distinct on-camera personality, easy to follow",
    "Series format teased a follow-for-part-2 payoff",
    "Pattern-interrupt opening locked attention",
    "Niche identity claim resonated with target audience",
  ],
  engagement: [
    "Polarizing take sparked comment debate",
    "Direct question to viewer in caption",
    "Save-worthy info dense enough to rewatch",
    "Relatable specific moment people tagged friends in",
    "Clear take + invite to disagree",
  ],
  leads: [
    "Crisp single CTA pointing to link in bio",
    "Specific offer mentioned within first 5s",
    "Demonstrated outcome before the ask",
    "Comment-to-DM funnel triggered by keyword",
    "Problem framing targeted decision-makers directly",
  ],
  reach: [
    "Trending audio matched broad mood",
    "Visually striking first frame stopped the scroll",
    "Universal hook, no niche jargon",
    "Tight 7s loop encouraged rewatches",
    "Native-feeling format, low ad signal",
  ],
  awareness: [
    "Brand woven into the story, not bolted on",
    "Memorable visual signature on every cut",
    "Repeated tagline lifted recall",
    "Founder face built trust-by-association",
    "Distinctive color/sound combo viewers remembered",
  ],
  traffic: [
    "Urgency CTA — limited time offer in caption",
    "Bio link mentioned twice with clear payoff",
    "Cliffhanger drove clicks to read full piece",
    "Promised resource gated behind link",
    "Comment pinned with the link, easy to find",
  ],
  other: [
    "Strong hook in 0–2s",
    "Trending audio + clear CTA",
    "Pattern-interrupt opening",
    "Tight pacing, no dead frames",
    "Clear single message, easy to share",
  ],
};

// Archetypal pattern descriptors — NOT fake video titles. These read as
// "the kind of video this card would surface" rather than pretend content.
const ARCHETYPE_TITLES = [
  "Cold open + payoff reveal",
  "Trending audio walkthrough",
  "Voiceover explainer, fast cuts",
  "Loop-back ending",
  "Comment-bait question close",
  "List format with on-screen counter",
  "Single continuous take",
  "Big text per cut, sound-off friendly",
];

// Honest framing labels — replace fake @handles. Picked from audience context.
const FRAMING_LABELS = [
  "Top performer in your niche",
  "High-engagement reference",
  "Viral last 30 days",
];

const FALLBACK_TOPICS = [
  "morning routines",
  "productivity",
  "small habits",
  "side hustles",
  "self-discipline",
  "mindset shifts",
];

const PLATFORM_VIEW_WEIGHT: Record<TargetPlatform, number> = {
  tiktok: 1.4,
  instagram: 1.0,
  youtube: 1.1,
  facebook: 0.55,
};

function extractTopics(ctx: SimilarRefContext): string[] {
  const topics: string[] = [];
  if (ctx.audienceDescription) {
    const words = ctx.audienceDescription
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4);
    topics.push(...words.slice(0, 6));
  }
  for (const t of ctx.audienceTags) {
    const label = AUDIENCE_TAG_LABELS[t] ?? t;
    topics.push(label.toLowerCase());
  }
  if (topics.length === 0) topics.push(...FALLBACK_TOPICS);
  return Array.from(new Set(topics));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildFramingLabel(ctx: SimilarRefContext, i: number): string {
  if (ctx.audienceTags.length > 0 && i % 3 === 0) {
    const tagKey = ctx.audienceTags[i % ctx.audienceTags.length];
    const tagLabel = AUDIENCE_TAG_LABELS[tagKey] ?? tagKey;
    return `Trending in ${tagLabel}`;
  }
  return FRAMING_LABELS[i % FRAMING_LABELS.length];
}

function buildTitle(i: number): string {
  return ARCHETYPE_TITLES[i % ARCHETYPE_TITLES.length];
}

function buildViews(platform: TargetPlatform): number {
  const w = PLATFORM_VIEW_WEIGHT[platform];
  const r = Math.random();
  const base = 100_000 * Math.pow(80, r);
  const v = base * w;
  if (v >= 1_000_000) return Math.round(v / 100_000) * 100_000;
  if (v >= 100_000) return Math.round(v / 10_000) * 10_000;
  return Math.round(v / 5_000) * 5_000;
}

function buildSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function generateSimilarReferences(ctx: SimilarRefContext): SimilarRefSeed[] {
  // topics still used to inform extractTopics-side analytics in future; not used for titles anymore.
  void extractTopics;
  const reasons = REASONS_BY_GOAL[ctx.goal ?? "other"];
  const usedReasons = new Set<string>();
  const out: SimilarRefSeed[] = [];

  // Shuffle archetype indices so each simulation shows a different mix.
  const titleOrder = [...Array(ARCHETYPE_TITLES.length).keys()].sort(
    () => Math.random() - 0.5,
  );

  for (let i = 0; i < 5; i++) {
    let reason = reasons[i % reasons.length];
    let attempts = 0;
    while (usedReasons.has(reason) && attempts < reasons.length) {
      reason = pick(reasons);
      attempts++;
    }
    usedReasons.add(reason);

    out.push({
      platform: ctx.platform,
      title: buildTitle(titleOrder[i]),
      creator_handle: buildFramingLabel(ctx, i),
      view_count: buildViews(ctx.platform),
      reason,
      thumbnail_seed: buildSeed(),
      sort_order: i,
    });
  }
  out.sort((a, b) => b.view_count - a.view_count);
  out.forEach((r, i) => (r.sort_order = i));
  return out;
}

export function formatViewCount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `${n}`;
}

export function gradientFromSeed(seed: string): string {
  let h1 = 0;
  for (let i = 0; i < seed.length; i++) h1 = (h1 * 31 + seed.charCodeAt(i)) >>> 0;
  const a = h1 % 360;
  const b = (a + 40 + ((h1 >> 8) % 80)) % 360;
  const angle = (h1 >> 16) % 360;
  return `linear-gradient(${angle}deg, oklch(0.55 0.18 ${a}), oklch(0.42 0.16 ${b}))`;
}
