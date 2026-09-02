"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { checkVin, normalizeVin } from "@/lib/vin";

import { startIntake, type IntakeState } from "./actions";

type ScanState =
  | { phase: "idle" }
  | { phase: "starting" }
  | { phase: "scanning" }
  | { phase: "unsupported"; reason: string }
  | { phase: "denied"; reason: string };

/** Chrome on Android ships this; Safari does not, hence the ZXing fallback. */
type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetectorLike;
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

/** Door-jamb VIN stickers are Code 39; some newer plates use Data Matrix. */
const FORMATS = ["code_39", "code_128", "data_matrix", "qr_code", "itf"];

function StartButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-md bg-keyblue-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Looking it up…" : "Start intake"}
    </button>
  );
}

/**
 * Step one of the phone intake: get a VIN.
 *
 * The camera is the fast path, not the only path. Barcode reads fail for
 * ordinary reasons — a sticker under road film, low light, a peeling plate —
 * so manual entry is always visible rather than hidden behind a failure. The
 * VIN is checked in the browser first so a bad read is caught here, standing
 * next to the car, rather than after a round trip.
 */
export function VinCapture() {
  const [state, formAction] = useActionState<IntakeState, FormData>(
    startIntake,
    {},
  );

  const [vin, setVin] = useState("");
  const [scan, setScan] = useState<ScanState>({ phase: "idle" });
  const [scanNote, setScanNote] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const local = vin.trim() ? checkVin(vin) : null;
  const localError = local && !local.ok ? local.reason : null;
  const suspect = local?.ok ? local.suspect : false;

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScan({ phase: "idle" });
  }, []);

  // Never leave the camera running when the page goes away.
  useEffect(() => stop, [stop]);

  const accept = useCallback(
    (raw: string) => {
      const candidate = normalizeVin(raw);
      const result = checkVin(candidate);
      if (!result.ok) {
        setScanNote(`Read "${candidate}" — that is not a VIN. Keep scanning.`);
        return false;
      }

      setVin(result.vin);
      setScanNote(
        result.suspect
          ? "Scanned. That VIN fails its check digit — common on imports, but read it back off the car before continuing."
          : "Scanned and checked.",
      );
      stop();
      return true;
    },
    [stop],
  );

  const start = useCallback(async () => {
    setScanNote(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setScan({
        phase: "unsupported",
        reason: "This browser cannot open the camera. Type the VIN instead.",
      });
      return;
    }

    if (!window.isSecureContext) {
      setScan({
        phase: "unsupported",
        reason:
          "The camera only works over a secure (https) connection. Type the VIN instead.",
      });
      return;
    }

    setScan({ phase: "starting" });

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
    } catch {
      setScan({
        phase: "denied",
        reason:
          "The camera was blocked. Allow camera access for this site, or type the VIN instead.",
      });
      return;
    }

    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    video.srcObject = stream;
    await video.play().catch(() => undefined);
    setScan({ phase: "scanning" });

    // Native detector first — it is faster and uses far less battery.
    if (window.BarcodeDetector) {
      try {
        const detector = new window.BarcodeDetector({ formats: FORMATS });
        let cancelled = false;
        stopRef.current = () => {
          cancelled = true;
        };

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const found = await detector.detect(videoRef.current);
            for (const code of found) {
              if (accept(code.rawValue)) return;
            }
          } catch {
            // A single failed frame is normal. Keep going.
          }
          if (!cancelled) requestAnimationFrame(() => void tick());
        };

        void tick();
        return;
      } catch {
        // Fall through to ZXing.
      }
    }

    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();

      const controls = await reader.decodeFromVideoElement(video, (result) => {
        if (result) accept(result.getText());
      });

      stopRef.current = () => controls.stop();
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setScan({
        phase: "unsupported",
        reason:
          "Barcode scanning is not available on this phone. Type the VIN instead — it is on the driver's door jamb or the base of the windscreen.",
      });
    }
  }, [accept]);

  const scanning = scan.phase === "scanning" || scan.phase === "starting";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="relative aspect-[4/3] bg-navy-950">
          <video
            ref={videoRef}
            playsInline
            muted
            className={
              scanning ? "h-full w-full object-cover" : "hidden h-full w-full"
            }
          />

          {!scanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-white/70">
                Point the camera at the VIN barcode on the driver&rsquo;s door
                jamb.
              </p>
              <button
                type="button"
                onClick={() => void start()}
                className="rounded-md bg-white px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-white/90"
              >
                Scan VIN
              </button>
            </div>
          ) : (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 rounded-lg border-2 border-keyblue-400/80"
              />
              <button
                type="button"
                onClick={stop}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-white/90 px-4 py-2 text-sm font-semibold text-navy-900"
              >
                Stop camera
              </button>
            </>
          )}
        </div>

        {scan.phase === "unsupported" || scan.phase === "denied" ? (
          <p
            role="alert"
            className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            {scan.reason}
          </p>
        ) : null}

        {scanNote ? (
          <p
            role="status"
            className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-navy-800"
          >
            {scanNote}
          </p>
        ) : null}
      </div>

      <form action={formAction} className="space-y-3">
        <div>
          <label
            htmlFor="vin"
            className="text-xs font-semibold uppercase tracking-wider text-navy-700"
          >
            VIN
          </label>
          <input
            id="vin"
            name="vin"
            value={vin}
            onChange={(event) => {
              setVin(normalizeVin(event.target.value));
              setScanNote(null);
            }}
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={17}
            placeholder="Or type the 17 characters"
            aria-invalid={Boolean(localError || state.fieldErrors?.vin)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-3 font-mono text-lg tracking-[0.12em] text-navy-900 outline-none transition focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25"
          />

          <p className="mt-1.5 text-xs text-navy-700/70">
            {vin.length}/17 characters
          </p>

          {localError ? (
            <p role="alert" className="mt-1 text-xs font-medium text-red-700">
              {localError}
            </p>
          ) : null}

          {state.fieldErrors?.vin ? (
            <p role="alert" className="mt-1 text-xs font-medium text-red-700">
              {state.fieldErrors.vin}
            </p>
          ) : null}

          {suspect ? (
            <p className="mt-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              This VIN fails its built-in check digit. That is normal for some
              imports — read it back off the car before you continue.
            </p>
          ) : null}
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {state.error}
          </p>
        ) : null}

        <StartButton disabled={!local?.ok} />

        <p className="text-center text-xs text-navy-700/70">
          We look the VIN up automatically, so year, make and model are usually
          filled in for you.
        </p>
      </form>
    </div>
  );
}
