"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";

export type PhotoActionResult = { ok?: boolean; error?: string };

/**
 * The four writes this manager needs. Passing them in rather than importing
 * them is what lets one component serve both the vehicle gallery and the
 * product gallery — server actions are valid props.
 */
export type PhotoActions = {
  register: (entityId: string, paths: string[]) => Promise<PhotoActionResult>;
  setPrimary: (photoId: string, entityId: string) => Promise<void>;
  move: (photoId: string, entityId: string, direction: "up" | "down") => Promise<void>;
  remove: (photoId: string, entityId: string) => Promise<void>;
};

export type PhotoItem = {
  id: string;
  url: string;
  isPrimary: boolean;
  alt: string;
};

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type Upload = {
  key: string;
  name: string;
  preview: string;
  status: "uploading" | "error";
  message?: string;
};

/**
 * Photo gallery manager: drag-and-drop upload, reorder, choose the main image.
 *
 * Uploads go straight from the browser to Storage on the visitor's own
 * session. They cannot go through a Server Action — those cap request bodies
 * at 1 MB, which a single phone photo exceeds. The action is only told the
 * paths afterwards, and verifies each one really landed in the right folder
 * before writing a row.
 */
export function PhotoManager({
  entityId,
  bucket,
  photos,
  canEdit,
  actions,
  mainPhotoHint,
  emptyHint,
  primaryLabel = "Shown on the card",
  maxPhotos,
}: {
  entityId: string;
  bucket: string;
  photos: PhotoItem[];
  canEdit: boolean;
  actions: PhotoActions;
  mainPhotoHint: React.ReactNode;
  emptyHint: string;
  primaryLabel?: string;
  /** Cap on how many images this entity may carry. Omitted means no cap. */
  maxPhotos?: number;
}) {
  const router = useRouter();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Blob URLs leak until revoked.
  const previewsRef = useRef<string[]>([]);
  useEffect(() => {
    const urls = previewsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      setError(null);
      const files = Array.from(fileList);

      // Checked here for a fast, specific message; the server checks again,
      // because a cap enforced only in the browser is not a cap.
      if (maxPhotos !== undefined) {
        const room = maxPhotos - photos.length;
        if (room <= 0) {
          setError(
            `That is already ${maxPhotos} images. Delete one before adding another.`,
          );
          return;
        }
        if (files.length > room) {
          setError(
            `Only room for ${room} more image${room === 1 ? "" : "s"} — you picked ${files.length}.`,
          );
          return;
        }
      }

      const rejected = files.find(
        (f) => !ALLOWED.includes(f.type) || f.size > MAX_BYTES,
      );
      if (rejected) {
        setError(
          !ALLOWED.includes(rejected.type)
            ? `${rejected.name} is not a JPEG, PNG, WebP or AVIF image.`
            : `${rejected.name} is larger than 10 MB.`,
        );
        return;
      }

      const pending: Upload[] = files.map((file) => {
        const preview = URL.createObjectURL(file);
        previewsRef.current.push(preview);
        return {
          key: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          name: file.name,
          preview,
          status: "uploading",
        };
      });

      setUploads((current) => [...current, ...pending]);

      // Straight to Storage on the user's own session. Never through the
      // Next.js server, which caps Server Action bodies at 1 MB.
      const supabase = createClient();
      const uploaded: string[] = [];

      await Promise.all(
        files.map(async (file, index) => {
          const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const path = `${entityId}/${crypto.randomUUID()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, { contentType: file.type, upsert: false });

          if (uploadError) {
            setUploads((current) =>
              current.map((item) =>
                item.key === pending[index].key
                  ? { ...item, status: "error", message: uploadError.message }
                  : item,
              ),
            );
            return;
          }

          uploaded.push(path);
        }),
      );

      if (uploaded.length === 0) {
        setError("Nothing uploaded. Check the errors below and try again.");
        return;
      }

      startTransition(async () => {
        const result = await actions.register(entityId, uploaded);

        if (result.error) {
          setError(result.error);
          return;
        }

        setUploads((current) => current.filter((u) => u.status === "error"));
        router.refresh();
      });

      if (inputRef.current) inputRef.current.value = "";
    },
    [router, entityId, bucket, actions, maxPhotos, photos.length],
  );

  const busy = uploads.some((u) => u.status === "uploading") || isPending;
  const full = maxPhotos !== undefined && photos.length >= maxPhotos;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-bold text-navy-900">Photos</h2>
        <p className="text-xs text-navy-700">
          {photos.length}
          {maxPhotos !== undefined ? ` of ${maxPhotos}` : ""} image
          {photos.length === 1 && maxPhotos === undefined ? "" : "s"}
        </p>
      </div>

      {canEdit && full ? (
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-navy-700">
          All {maxPhotos} image slots are used. Delete one below to add another.
        </p>
      ) : null}

      {canEdit && !full ? (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!busy) void handleFiles(event.dataTransfer.files);
          }}
          className={[
            "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition",
            dragging
              ? "border-keyblue-500 bg-keyblue-500/5"
              : "border-slate-300 hover:border-keyblue-400 hover:bg-slate-50",
            busy ? "pointer-events-none opacity-60" : "",
          ].join(" ")}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={busy}
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <span className="text-sm font-semibold text-navy-900">
            {busy ? "Uploading…" : "Drop photos here, or click to choose"}
          </span>
          <span className="mt-1 text-xs text-navy-700">
            JPEG, PNG, WebP or AVIF · up to 10 MB each · uploads start
            immediately
            {maxPhotos !== undefined
              ? ` · ${maxPhotos - photos.length} slot${maxPhotos - photos.length === 1 ? "" : "s"} left`
              : ""}
          </span>
        </label>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      {uploads.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {uploads.map((upload) => (
            <li
              key={upload.key}
              className={[
                "overflow-hidden rounded-lg border",
                upload.status === "error"
                  ? "border-red-300"
                  : "border-keyblue-400 ring-2 ring-keyblue-500/20",
              ].join(" ")}
            >
              <div className="relative aspect-4/3 bg-slate-100">
                {/* Local blob URL — next/image cannot optimise it. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={upload.preview}
                  alt={upload.name}
                  className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 grid place-items-center px-2">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-center text-xs font-semibold text-white",
                      upload.status === "error" ? "bg-red-700" : "bg-navy-900/85",
                    ].join(" ")}
                  >
                    {upload.status === "error" ? "Failed" : "Uploading…"}
                  </span>
                </div>
              </div>
              {upload.message ? (
                <p className="px-2 py-1 text-[11px] text-red-700">
                  {upload.message}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {photos.length === 0 && uploads.length === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-navy-700">
          {emptyHint}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <>
          <p className="mt-5 text-xs text-navy-700">
{mainPhotoHint}
          </p>

          <ul className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                className={[
                  "overflow-hidden rounded-lg border bg-white",
                  photo.isPrimary
                    ? "border-keyblue-500 ring-2 ring-keyblue-500/25"
                    : "border-slate-200",
                ].join(" ")}
              >
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block aspect-4/3 bg-slate-100"
                  title="Open full size"
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                  {photo.isPrimary ? (
                    <span className="absolute left-2 top-2 rounded bg-keyblue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Main photo
                    </span>
                  ) : null}
                </a>

                {canEdit ? (
                  <div className="border-t border-slate-200 p-2">
                    {photo.isPrimary ? (
                      <p className="py-1 text-center text-[11px] font-semibold text-keyblue-700">
{primaryLabel}
                      </p>
                    ) : (
                      <form
                        action={actions.setPrimary.bind(null, photo.id, entityId)}
                      >
                        <button
                          type="submit"
                          className="w-full rounded-md border border-keyblue-500 px-2 py-1.5 text-[11px] font-semibold text-keyblue-700 transition hover:bg-keyblue-500 hover:text-white"
                        >
                          Set as main photo
                        </button>
                      </form>
                    )}

                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <div className="flex gap-1">
                        <form
                          action={actions.move.bind(null, photo.id, entityId, "up")}
                        >
                          <button
                            type="submit"
                            disabled={index === 0}
                            aria-label="Move earlier"
                            className="rounded border border-slate-300 px-2 py-0.5 text-xs text-navy-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ←
                          </button>
                        </form>
                        <form
                          action={actions.move.bind(null, photo.id, entityId, "down")}
                        >
                          <button
                            type="submit"
                            disabled={index === photos.length - 1}
                            aria-label="Move later"
                            className="rounded border border-slate-300 px-2 py-0.5 text-xs text-navy-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            →
                          </button>
                        </form>
                      </div>

                      <form
                        action={actions.remove.bind(null, photo.id, entityId)}
                      >
                        <button
                          type="submit"
                          className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
