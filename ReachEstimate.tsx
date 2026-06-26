import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UploadCloud, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Mirrors the user-facing subset of the public.platform enum.
// DB also accepts 'other' as an internal escape hatch (not surfaced in UI).
export type TargetPlatform = "tiktok" | "instagram" | "youtube" | "facebook";

const PLATFORMS: { value: TargetPlatform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram (Reels)" },
  { value: "youtube", label: "YouTube Shorts" },
  { value: "facebook", label: "Facebook (Reels)" },
];

export type Goal =
  | "reach"
  | "followers"
  | "engagement"
  | "leads"
  | "awareness"
  | "traffic"
  | "other";

const GOALS: { value: Goal; label: string }[] = [
  { value: "reach", label: "Reach new audiences (maximize views)" },
  { value: "followers", label: "Gain followers" },
  { value: "engagement", label: "Drive engagement (likes, comments, shares)" },
  { value: "leads", label: "Generate qualified leads" },
  { value: "awareness", label: "Build brand awareness" },
  { value: "traffic", label: "Drive traffic (clicks to link in bio)" },
  { value: "other", label: "Other" },
];

const AUDIENCE_TAGS_ROW_1 = [
  { value: "gen_z", label: "Gen Z" },
  { value: "millennials", label: "Millennials" },
  { value: "gen_x", label: "Gen X" },
  { value: "boomers", label: "Boomers" },
  { value: "students", label: "Students" },
  { value: "parents", label: "Parents" },
  { value: "professionals", label: "Professionals" },
];

const AUDIENCE_TAGS_ROW_2 = [
  { value: "independent_creators", label: "Independent creators" },
  { value: "smes", label: "SMEs" },
  { value: "enterprises", label: "Enterprises" },
  { value: "consumers_b2c", label: "Consumers (B2C)" },
  { value: "businesses_b2b", label: "Businesses (B2B)" },
  { value: "niche_hobbyists", label: "Niche hobbyists" },
];

export type UploaderResult = {
  mediaPath: string; // bucket path: {uid}/{uuid}/{filename}
  sizeBytes: number;
  mimeType: string;
  durationSeconds?: number;
  caption?: string;
  script?: string;
  platform: TargetPlatform;
  goal?: Goal;
  goalCustom?: string;
  audienceDescription?: string;
  audienceTags?: string[];
};

export interface ContentUploaderDefaults {
  goal?: Goal;
  audienceDescription?: string;
  audienceTags?: string[];
}

export interface ContentUploaderProps {
  /** Hard cap enforced client-side. Default = free tier. */
  maxFileSizeMB?: number;
  /** Storage bucket id. */
  bucket?: string;
  /** Fired when the user clicks Run Simulation. Parent handles the DB insert. */
  onSubmit: (payload: UploaderResult) => void | Promise<void>;
  /** Per-user defaults (from profile / onboarding). Pre-fill, but user can edit. */
  defaults?: ContentUploaderDefaults;
  /** When true, render a small muted note linking to /onboarding. */
  showDefaultsNote?: boolean;
  className?: string;
}

const ACCEPTED_VIDEO = ["video/mp4", "video/quicktime", "video/webm"];

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; progress: number }
  | { phase: "done"; mediaPath: string; durationSeconds?: number }
  | { phase: "error"; message: string };

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedVideo(mime: string): boolean {
  return ACCEPTED_VIDEO.includes(mime);
}

async function probeVideoDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const d = isFinite(v.duration) ? v.duration : undefined;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    v.src = url;
  });
}

// Reusable chip styling — pill-shaped, mint when selected, dark teal text.
function chipClasses(selected: boolean): string {
  return cn(
    "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
    selected
      ? "border-mint bg-mint text-teal-deep shadow-sm"
      : "border-border bg-muted/40 text-foreground hover:border-primary/60 hover:bg-muted",
  );
}

export function ContentUploader({
  maxFileSizeMB = 50,
  bucket = "submissions",
  onSubmit,
  defaults,
  showDefaultsNote,
  className,
}: ContentUploaderProps) {
  const [platform, setPlatform] = useState<TargetPlatform | "">("");
  const [caption, setCaption] = useState("");
  const [script, setScript] = useState("");
  const [goal, setGoal] = useState<Goal | "">(defaults?.goal ?? "");
  const [goalCustom, setGoalCustom] = useState("");
  const [audienceDescription, setAudienceDescription] = useState(
    defaults?.audienceDescription ?? "",
  );
  const [audienceTags, setAudienceTags] = useState<string[]>(defaults?.audienceTags ?? []);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [upload, setUpload] = useState<UploadState>({ phase: "idle" });
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Manage object URL lifecycle.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const reset = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setFile(null);
    setUpload({ phase: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const startUpload = useCallback(
    async (chosen: File) => {
      if (!isAcceptedVideo(chosen.type)) {
        setUpload({
          phase: "error",
          message: "Unsupported file. Use MP4, MOV, or WebM video.",
        });
        return;
      }
      const maxBytes = maxFileSizeMB * 1024 * 1024;
      if (chosen.size > maxBytes) {
        setUpload({
          phase: "error",
          message: `File is ${formatBytes(chosen.size)}. Limit is ${maxFileSizeMB} MB on this plan.`,
        });
        return;
      }

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData.session) {
        setUpload({ phase: "error", message: "You must be signed in to upload." });
        return;
      }
      const session = sessionData.session;
      const userId = session.user.id;

      const submissionId = crypto.randomUUID();
      const safeName = chosen.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${submissionId}/${safeName}`;

      const durationSeconds = await probeVideoDuration(chosen);

      const baseUrl = (
        import.meta.env.VITE_SUPABASE_URL as string | undefined
      )?.replace(/\/+$/, "");
      if (!baseUrl) {
        setUpload({ phase: "error", message: "Storage endpoint missing." });
        return;
      }
      const endpoint = `${baseUrl}/storage/v1/object/${bucket}/${path}`;

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("POST", endpoint, true);
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.setRequestHeader("Content-Type", chosen.type);
      xhr.setRequestHeader("Cache-Control", "max-age=3600");

      setUpload({ phase: "uploading", progress: 0 });

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const pct = Math.round((e.loaded / e.total) * 100);
        setUpload({ phase: "uploading", progress: pct });
      };
      xhr.onerror = () => {
        setUpload({ phase: "error", message: "Network error during upload." });
        xhrRef.current = null;
      };
      xhr.onabort = () => {
        xhrRef.current = null;
      };
      xhr.onload = () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          setUpload({ phase: "done", mediaPath: path, durationSeconds });
        } else {
          let msg = `Upload failed (${xhr.status}).`;
          try {
            const body = JSON.parse(xhr.responseText);
            if (body?.message) msg = body.message;
          } catch {
            /* noop */
          }
          setUpload({ phase: "error", message: msg });
        }
      };

      xhr.send(chosen);
    },
    [bucket, maxFileSizeMB],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      setFile(f);
      void startUpload(f);
    },
    [startUpload],
  );

  // DnD handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const videoReady = upload.phase === "done";
  // Goal + audience are intentionally optional — only video + platform required.
  const canSubmit = !!platform && !submitting && videoReady && !!file;

  const toggleAudienceTag = (value: string) => {
    setAudienceTags((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = async () => {
    if (!platform || !file || upload.phase !== "done") return;
    setSubmitting(true);
    try {
      await onSubmit({
        mediaPath: upload.mediaPath,
        sizeBytes: file.size,
        mimeType: file.type,
        durationSeconds: upload.durationSeconds,
        caption: caption.trim() || undefined,
        script: script.trim() || undefined,
        platform,
        goal: goal || undefined,
        goalCustom:
          goal === "other" && goalCustom.trim() ? goalCustom.trim() : undefined,
        audienceDescription: audienceDescription.trim() || undefined,
        audienceTags: audienceTags.length > 0 ? audienceTags : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dropZoneClasses = useMemo(
    () =>
      cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/40 hover:border-primary/60 hover:bg-muted/60",
      ),
    [dragActive],
  );

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      {showDefaultsNote && (
        <p className="mb-4 text-xs text-muted-foreground">
          Pre-filled from your profile. Edit anything for this specific video.{" "}
          <a href="/onboarding" className="underline-offset-4 hover:underline">
            Update defaults
          </a>
          .
        </p>
      )}
      {!file ? (
        <label
          htmlFor="content-uploader-input"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={dropZoneClasses}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Drop your video here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              MP4, MOV, or WebM · up to {maxFileSizeMB} MB
            </p>
          </div>
          <input
            ref={inputRef}
            id="content-uploader-input"
            type="file"
            accept={ACCEPTED_VIDEO.join(",")}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      ) : (
        <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-border">
            {previewUrl ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                  {upload.phase === "done" &&
                    upload.durationSeconds &&
                    ` · ${upload.durationSeconds.toFixed(1)}s`}
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {upload.phase === "uploading" && (
              <div className="space-y-1">
                <Progress value={upload.progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  Uploading… {upload.progress}%
                </p>
              </div>
            )}
            {upload.phase === "done" && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Upload complete
              </p>
            )}
            {upload.phase === "error" && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {upload.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="content-uploader-platform" className="text-sm font-medium">
            Target platform
          </Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as TargetPlatform)}>
            <SelectTrigger id="content-uploader-platform" className="w-full sm:w-72">
              <SelectValue placeholder="Choose a platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content-uploader-caption" className="text-sm font-medium">
            Caption{" "}
            <span className="font-normal text-muted-foreground">
              (optional but recommended)
            </span>
          </Label>
          <Textarea
            id="content-uploader-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="resize-y"
            maxLength={2200}
          />
          <p className="text-xs text-muted-foreground">
            The caption you plan to publish with this video. Improves simulation accuracy.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content-uploader-script" className="text-sm font-medium">
            Script or voiceover text{" "}
            <span className="font-normal text-muted-foreground">
              (optional but recommended)
            </span>
          </Label>
          <Textarea
            id="content-uploader-script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={5}
            className="resize-y"
            maxLength={10000}
          />
          <p className="text-xs text-muted-foreground">
            Paste your script if you have one. Helps the simulation understand spoken content
            before transcription.
          </p>
        </div>

        {/* Goal section */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            What's the goal of this video?{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGoal(goal === g.value ? "" : g.value)}
                className={chipClasses(goal === g.value)}
                aria-pressed={goal === g.value}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Tells us what success looks like for this video.
          </p>
          {goal === "other" && (
            <div className="pt-1">
              <Input
                value={goalCustom}
                onChange={(e) => setGoalCustom(e.target.value)}
                placeholder="Describe your goal."
                maxLength={200}
              />
            </div>
          )}
        </div>

        {/* Audience section */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="content-uploader-audience"
              className="text-sm font-medium"
            >
              Who's your target audience?{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="content-uploader-audience"
              value={audienceDescription}
              onChange={(e) => setAudienceDescription(e.target.value)}
              rows={4}
              className="resize-y"
              maxLength={1000}
              placeholder="e.g., French students aged 18-22 preparing for finals, interested in productivity and study hacks"
            />
            <p className="text-xs text-muted-foreground">
              The more specific, the better the simulation.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Or pick a starting point:
            </Label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_TAGS_ROW_1.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggleAudienceTag(t.value)}
                  className={chipClasses(audienceTags.includes(t.value))}
                  aria-pressed={audienceTags.includes(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_TAGS_ROW_2.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggleAudienceTag(t.value)}
                  className={chipClasses(audienceTags.includes(t.value))}
                  aria-pressed={audienceTags.includes(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full sm:w-auto"
          size="lg"
        >
          {submitting ? "Starting…" : "Run Simulation"}
        </Button>
      </div>
    </div>
  );
}

export default ContentUploader;
