import { Container } from "@/components/ui/Container";

const REASONS = [
  {
    icon: "⏱",
    title: "Fast Approvals",
    body: "Get approved quickly so you can get back on the road.",
  },
  {
    icon: "🤝",
    title: "Personal Service",
    body: "You work with Cory directly. Real people, real help.",
  },
  {
    icon: "🛡",
    title: "Quality Vehicles",
    body: "Hand-picked cars, trucks and SUVs you can trust.",
  },
  {
    icon: "💲",
    title: "Flexible Financing",
    body: "Solutions for all credit types with payments that fit your budget.",
  },
] as const;

export function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <Container className="py-12 lg:py-14">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
          Why Choose The <span className="text-keyblue-600">Key Konnect</span>?
        </h2>

        <ul className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <li key={reason.title} className="text-center">
              <span
                aria-hidden
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-keyblue-600/10 text-2xl"
              >
                {reason.icon}
              </span>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-navy-900">
                {reason.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-navy-700">
                {reason.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
