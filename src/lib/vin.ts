/**
 * VIN handling for the phone intake.
 *
 * Scanners misread. A door-jamb barcode read in bad light returns a string
 * that looks like a VIN and is not one, and a wrong VIN quietly attaches the
 * wrong history to a real car. Every VIN is therefore checked against its own
 * check digit before we touch it, so a bad scan is caught on the lot rather
 * than at review.
 */

/** I, O and Q are not used in VINs — they are too easily confused with 1 and 0. */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

const TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/** Uppercase, strip anything a scanner may have padded the read with. */
export function normalizeVin(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hasVinShape(vin: string): boolean {
  return VIN_PATTERN.test(vin);
}

/**
 * The 9th character is a checksum over the other sixteen.
 *
 * Note this is a North American rule. Plenty of legitimately imported cars
 * fail it, so a failure is a warning the person can override — never a wall.
 */
export function hasValidCheckDigit(vin: string): boolean {
  if (!hasVinShape(vin)) return false;

  let sum = 0;
  for (let i = 0; i < 17; i += 1) {
    const char = vin[i];
    const value = /\d/.test(char) ? Number(char) : TRANSLITERATION[char];
    if (value === undefined) return false;
    sum += value * WEIGHTS[i];
  }

  const remainder = sum % 11;
  const expected = remainder === 10 ? "X" : String(remainder);

  return vin[8] === expected;
}

export type VinCheck =
  | { ok: true; vin: string; suspect: boolean }
  | { ok: false; reason: string };

export function checkVin(raw: string): VinCheck {
  const vin = normalizeVin(raw);

  if (vin.length === 0) return { ok: false, reason: "Enter or scan a VIN." };

  if (vin.length !== 17) {
    return {
      ok: false,
      reason: `A VIN is 17 characters — that one is ${vin.length}.`,
    };
  }

  if (!hasVinShape(vin)) {
    return {
      ok: false,
      reason: "A VIN never contains the letters I, O or Q. Check the read.",
    };
  }

  return { ok: true, vin, suspect: !hasValidCheckDigit(vin) };
}

export type DecodedVin = {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  bodyType: string | null;
  engine: string | null;
  fuelType: string | null;
  drivetrain: string | null;
  transmission: string | null;
};

type VpicRow = Record<string, string | null | undefined>;

const clean = (value: string | null | undefined): string | null => {
  const trimmed = (value ?? "").trim();
  // vPIC returns "Not Applicable" and bare "0" for fields it has no answer for.
  if (!trimmed || trimmed === "0" || /^not applicable$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
};

/** "2.998832712" litres is technically true and useless on a listing. */
function engineText(row: VpicRow): string | null {
  const litres = clean(row.DisplacementL);
  const cylinders = clean(row.EngineCylinders);
  const rounded = litres ? `${Number(litres).toFixed(1)}L` : null;

  const parts = [rounded, cylinders ? `${cylinders}-cyl` : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : clean(row.EngineModel);
}

/**
 * Decode a VIN against the free NHTSA vPIC database.
 *
 * Returns null on any failure — unreachable, slow, rate limited, garbage
 * response. The caller falls back to manual entry and says so; a lookup being
 * down must never stop somebody adding a car that is sitting in front of them.
 */
export async function decodeVin(vin: string): Promise<DecodedVin | null> {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`,
      { signal: AbortSignal.timeout(8000), headers: { accept: "application/json" } },
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as { Results?: VpicRow[] };
    const row = payload.Results?.[0];
    if (!row) return null;

    const year = clean(row.ModelYear);
    const parsedYear = year ? Number(year) : NaN;

    return {
      year: Number.isInteger(parsedYear) ? parsedYear : null,
      make: clean(row.Make),
      model: clean(row.Model),
      trim: clean(row.Trim),
      bodyType: clean(row.BodyClass),
      engine: engineText(row),
      fuelType: clean(row.FuelTypePrimary),
      drivetrain: clean(row.DriveType),
      transmission: clean(row.TransmissionStyle),
    };
  } catch {
    return null;
  }
}
