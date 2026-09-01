import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";

function Stars({ rating }: { rating: number }) {
  return (
    <p className="text-sm tracking-widest text-amber-400" aria-label={`${rating} out of 5`}>
      <span aria-hidden>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
    </p>
  );
}

/**
 * Customer reviews, read from the `reviews` table.
 *
 * The approved comp showed three testimonials with names attached. Those are
 * the designer's placeholder copy, not real customers, so they are NOT
 * hard-coded here — publishing invented testimonials as genuine would be
 * misleading to buyers and is the kind of thing that gets a dealer in
 * trouble. The section renders real published reviews and stays hidden until
 * there are some.
 */
export async function CustomerReviews() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, author_name, rating, body, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="bg-navy-950 text-white">
      <Container className="py-12 lg:py-16">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          What Our <span className="text-keyblue-400">Customers</span> Are Saying
        </h2>

        <ul className="mt-9 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <Stars rating={review.rating} />
              <blockquote className="mt-3 text-sm leading-relaxed text-white/85">
                &ldquo;{review.body}&rdquo;
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-white/70">
                — {review.author_name}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-keyblue-400 transition hover:gap-2.5"
          >
            Read all reviews <span aria-hidden>→</span>
          </Link>
        </p>
      </Container>
    </section>
  );
}
