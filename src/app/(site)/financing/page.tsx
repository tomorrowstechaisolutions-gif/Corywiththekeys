import { permanentRedirect } from "next/navigation";

/** Superseded by /finance. Kept only so existing links do not break. */
export default function FinancingPage(): never {
  permanentRedirect("/finance");
}
