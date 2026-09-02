"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/admin/Avatar";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_BUCKET } from "@/lib/buckets";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "@/lib/validation/team";

import { removeMyAvatar, setMyAvatar } from "./actions";

function extensionFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "jpg";
}

/**
 * Upload your own picture.
 *
 * The file goes browser → Storage directly on your own session, so Storage's
 * own policies decide whether it is allowed: the path has to begin with your
 * user id, and nobody can write into anybody else's folder. A Server Action
 * is told the path afterwards and checks it again.
 */
export function AvatarUploader({
  userId,
  initialUrl,
  initials,
}: {
  userId: string;
  initialUrl: string | null;
  initials: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [hasPhoto, setHasPhoto] = useState(Boolean(initialUrl));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);

    if (!AVATAR_MIME_TYPES.includes(file.type as (typeof AVATAR_MIME_TYPES)[number])) {
      setError("Use a JPG, PNG, WebP or AVIF image.");
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      setError(
        `That picture is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${AVATAR_MAX_BYTES / 1024 / 1024} MB.`,
      );
      return;
    }

    setBusy(true);

    // Shown immediately, so the picture appears while the upload runs.
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const path = `${userId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setBusy(false);
      setPreview(initialUrl);
      setError("That upload did not go through. Please try again.");
      return;
    }

    const result = await setMyAvatar(path);
    setBusy(false);

    if (result.error) {
      setPreview(initialUrl);
      setError(result.error);
      return;
    }

    setHasPhoto(true);
    startTransition(() => router.refresh());
  }

  async function remove() {
    setBusy(true);
    setError(null);
    const result = await removeMyAvatar();
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setPreview(null);
    setHasPhoto(false);
    startTransition(() => router.refresh());
  }

  const working = busy || pending;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar url={preview} initials={initials} size={96} />

      <div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={working}
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-keyblue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working ? "Working…" : hasPhoto ? "Change picture" : "Add a picture"}
          </button>

          {hasPhoto ? (
            <button
              type="button"
              disabled={working}
              onClick={remove}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
        </div>

        <p className="mt-2 max-w-sm text-xs leading-relaxed text-navy-700/70">
          Square photos look best. Up to{" "}
          {AVATAR_MAX_BYTES / 1024 / 1024} MB. This is only ever shown inside
          the admin console — it does not go on the website.
        </p>

        {error ? (
          <p role="alert" className="mt-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_MIME_TYPES.join(",")}
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
