import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  formatViewCount,
  gradientFromSeed,
} from "@/lib/similar-references";
import type { TargetPlatform } from "@/components/ContentUploader";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Music2, Instagram, Youtube, Facebook, Info } from "lucide-react";

export interface SimilarReference {
  id: string;
  platform: TargetPlatform;
  title: string;
  creator_handle: string; // legacy field — repurposed as honest archetype framing
  view_count: number;
  reason: string;
  thumbnail_seed: string;
}

export interface SimilarReferencesCardProps {
  references: SimilarReference[];
  className?: string;
}

const PLATFORM_LABEL: Record<TargetPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube Shorts",
  facebook: "Facebook Reels",
};

function PlatformIcon({
  platform,
  className,
}: {
  platform: TargetPlatform;
  className?: string;
}) {
  const cls = cn("h-3.5 w-3.5", className);
  switch (platform) {
    case "tiktok":
      return <Music2 className={cls} aria-label="TikTok" />;
    case "instagram":
      return <Instagram className={cls} aria-label="Instagram" />;
    case "youtube":
      return <Youtube className={cls} aria-label="YouTube" />;
    case "facebook":
      return <Facebook className={cls} aria-label="Facebook" />;
  }
}

export function SimilarReferencesCard({
  references,
  className,
}: SimilarReferencesCardProps) {
  const [openRef, setOpenRef] = useState<SimilarReference | null>(null);

  if (references.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "w-full max-w-md rounded-2xl bg-teal-deep p-6 text-teal-foreground shadow-xl ring-1 ring-white/5",
          className,
        )}
        role="group"
        aria-label="Reference videos we'd surface"
      >
        <h3 className="text-lg font-semibold text-mint">
          Reference videos we'd surface
        </h3>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-black/25 px-3 py-3 ring-1 ring-white/5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-mint/80" />
          <p className="text-xs leading-snug text-teal-foreground/80">
            Preview of an upcoming feature — real similar-video discovery is in
            development. The examples below are illustrative placeholders.
          </p>
        </div>

        <div className="mt-4 -mx-6 overflow-x-auto px-6 pb-1">
          <ul className="flex gap-3 snap-x snap-mandatory">
            {references.map((ref) => (
              <li
                key={ref.id}
                className="snap-start shrink-0"
                style={{ width: "150px" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenRef(ref)}
                  className="group flex w-full flex-col gap-2 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
                >
                  <div
                    className="relative w-full overflow-hidden rounded-lg ring-1 ring-white/10 transition-transform group-hover:scale-[1.02]"
                    style={{
                      aspectRatio: "9 / 16",
                      background: gradientFromSeed(ref.thumbnail_seed),
                    }}
                  >
                    <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/40 text-white backdrop-blur-sm">
                      <PlatformIcon platform={ref.platform} />
                    </div>
                    <div
                      className="absolute bottom-2 left-2 text-xs font-semibold tabular-nums text-white"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                    >
                      {formatViewCount(ref.view_count)} views
                    </div>
                  </div>
                  <p className="line-clamp-2 text-xs font-medium text-teal-foreground/90">
                    {ref.title}
                  </p>
                  <span className="inline-block w-fit rounded-full bg-mint/10 px-2 py-0.5 text-[10px] text-mint">
                    {ref.reason}
                  </span>
                  <p className="text-[11px] italic text-teal-foreground/55">
                    {ref.creator_handle}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Sheet open={!!openRef} onOpenChange={(o) => !o && setOpenRef(null)}>
        <SheetContent
          side="right"
          className="w-full border-none bg-teal-deep p-0 text-teal-foreground sm:max-w-[400px]"
        >
          {openRef && (
            <div className="flex h-full flex-col">
              <SheetHeader className="space-y-2 border-b border-white/10 p-6 text-left">
                <span className="text-[10px] uppercase tracking-wider text-mint/70">
                  {PLATFORM_LABEL[openRef.platform]} · {formatViewCount(openRef.view_count)} views
                </span>
                <SheetTitle className="text-mint">{openRef.title}</SheetTitle>
                <p className="text-xs text-teal-foreground/60">
                  {openRef.creator_handle}
                </p>
              </SheetHeader>

              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                <p className="text-sm text-teal-foreground/80">
                  Deep breakdown coming soon. This will show: detailed analysis
                  of what made this video perform, frame-by-frame hook analysis,
                  audio choice, caption structure, and a side-by-side comparison
                  with your video.
                </p>

                {[
                  "Hook analysis",
                  "Pacing breakdown",
                  "What you can apply to your video",
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4 opacity-60"
                  >
                    <p className="mb-2 text-xs uppercase tracking-wider text-teal-foreground/50">
                      {label}
                    </p>
                    <div className="h-12 rounded bg-white/[0.03]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

export default SimilarReferencesCard;
