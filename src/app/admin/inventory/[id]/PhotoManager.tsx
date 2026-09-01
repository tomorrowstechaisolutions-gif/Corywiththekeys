"use client";

import Image from "next/image";
import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteVehiclePhoto,
  setPrimaryPhoto,
  uploadVehiclePhotos,
  type FormState,
} from "../actions";

export type PhotoItem = {
  id: string;
  url: string;
  isPrimary: boolean;
  alt: string;
};

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Uploading…" : "Upload"}
    </button>
  );
}

export function PhotoManager({
  vehicleId,
  photos,
  canEdit,
}: {
  vehicleId: string;
  photos: PhotoItem[];
  canEdit: boolean;
}) {
  const uploadAction = uploadVehiclePhotos.bind(null, vehicleId);
  const [state, formAction] = useActionState<FormState, FormData>(
    uploadAction,
    {},
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-bold text-navy-900">Photos</h2>
        <p className="text-xs text-navy-700">
          {photos.length} image{photos.length === 1 ? "" : "s"}
        </p>
      </div>

      {canEdit ? (
        <form action={formAction} className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            name="photos"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block w-full max-w-sm text-sm text-navy-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-800"
          />
          <UploadButton />
        </form>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-navy-700/70">
        JPEG, PNG, WebP or AVIF, up to 10 MB each. The first upload becomes the
        lead image.
      </p>

      {photos.length === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-navy-700">
          No photos yet. A listing without photos will not sell.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-lg border border-slate-200"
            >
              <div className="relative aspect-4/3 bg-slate-100">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover"
                />
                {photo.isPrimary ? (
                  <span className="absolute left-2 top-2 rounded bg-keyblue-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Lead
                  </span>
                ) : null}
              </div>

              {canEdit ? (
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-2 py-1.5">
                  {photo.isPrimary ? (
                    <span className="text-[11px] text-navy-700/60">
                      Lead image
                    </span>
                  ) : (
                    <form action={setPrimaryPhoto.bind(null, photo.id, vehicleId)}>
                      <button
                        type="submit"
                        className="text-[11px] font-semibold text-keyblue-600 hover:underline"
                      >
                        Make lead
                      </button>
                    </form>
                  )}

                  <form
                    action={deleteVehiclePhoto.bind(null, photo.id, vehicleId)}
                  >
                    <button
                      type="submit"
                      className="text-[11px] font-semibold text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
