"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import {
  BRAND_MAX_BYTES,
  BRAND_MIME_TYPES,
  BRAND_SLOT_LABELS,
  type BrandSlot,
} from "@/lib/brand";
import { MEDIA_BUCKET } from "@/lib/buckets";
import { createClient } from "@/lib/supabase/client";

import { clearBrandImage, setBrandImage } from "./actions";

function extensionFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "jpg";
}

/**
 * Upload one brand mark.
 *
 * The file goes browser → Storage on the signed-in user's own session, so the
 * bucket's policies decide whether it is allowed rather than a service key,
 * and a Server Action is told the path afterwards and checks it again. Same
 * shape as the staff avatar uploader, for the same reasons.
 */
export function BrandUploader({
  slot,
  currentUrl,
  isCustom,
  hint,
  preview = "dark",
}: {
  slot: BrandSlot;
  /** What is showing today — an upload, or the mark built into the code. */
  currentUrl: string | null;
  /** True when the current image was uploaded, so it can be put back. */
  isCustom: boolean;
  hint: string;
  /** Marks are drawn for navy; a white tile would flatter a bad file. */
  preview?: "dark" | "light";
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const [shown, setShown] = useState<string | null>(currentUrl);
  const [custom, setCustom] = useState(isCustom);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);

    if (!BRAND_MIME_TYPES.includes(file.type as (typeof BRAND_MIME_TYPES)[number])) {
      setError("Use a PNG, WebP, AVIF or JPG. SVG files are not accepted.");
      return;
    }

    if (file.size > BRAND_MAX_BYTES) {
      setError(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${BRAND_MAX_BYTES / 1024 / 1024} MB.`,
      );
      return;
    }

    setBusy(true);

    const localPreview = URL.createObjectURL(file);
    setShown(localPreview);

    // A fresh name every time, never the original. Overwriting one fixed path
    // would leave the old picture cached in browsers and on the CDN for hours,
    // which reads as "the upload did not work".
    const path = `brand/${slot}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setBusy(false);
      setShown(currentUrl);
      setError("That upload did not go through. Please try again.");
      return;
    }

    const result = await setBrandImage(slot, path);
    setBusy(false);

    if (result.error) {
      setShown(currentUrl);
      setError(result.error);
      return;
    }

    setCustom(true);
    startTransition(() => router.refresh());
  }

  async function reset() {
    setBusy(true);
    setError(null);
    const result = await clearBrandImage(slot);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setCustom(false);
    startTransition(() => router.refresh());
  }

  const working = busy || pending;

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-start gap-4">
        <span
          className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg ${
            preview === "dark" ? "bg-navy-950" : "border border-slate-200 bg-white"
          }`}
        >
          {shown ? (
            <Image
              src={shown}
              alt=""
              width={160}
              height={160}
              unoptimized
              className="h-16 w-16 object-contain"
            />
          ) : (
            <span className="px-1 text-center text-[9px] font-semibold uppercase leading-tight text-slate-400">
              None set
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy-900">
            {BRAND_SLOT_LABELS[slot]}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-navy-700">{hint}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={working}
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-keyblue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {working ? "Working…" : custom ? "Replace" : "Upload"}
            </button>

            {custom ? (
              <button
                type="button"
                disabled={working}
                onClick={reset}
                className="rounded-md border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-navy-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Put the original back
              </button>
            ) : null}
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            PNG, WebP, AVIF or JPG, up to {BRAND_MAX_BYTES / 1024 / 1024} MB.
            {preview === "dark"
              ? " Shown on navy, so a transparent PNG works best."
              : null}
          </p>

          {error ? (
            <p role="alert" className="mt-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={BRAND_MIME_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so choosing the same file twice still fires a change.
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
