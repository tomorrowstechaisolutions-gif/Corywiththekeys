import { permanentRedirect } from "next/navigation";

/**
 * /apply predates /finance and is linked from older material.
 *
 * A 308 rather than a rebuilt page: there is one financing entry point now,
 * and search engines should forget this one rather than index two.
 */
export default function ApplyPage(): never {
  permanentRedirect("/finance");
}
