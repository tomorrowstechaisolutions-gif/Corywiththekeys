import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { GALLERY, STAFF } from "@/data/about";

export function Community() {
  return (
    <section className="bg-navy-950 py-8 lg:py-12">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-keyblue-400">
          Built on Community
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Giving Back &amp; Growing Together
        </h2>

        {GALLERY.length > 0 ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map((item) => (
              <li
                key={item.src}
                className={`group relative h-52 overflow-hidden rounded-xl border border-white/10 sm:h-56 lg:h-64 ${
                  item.wide ? "sm:col-span-2" : ""
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={`object-cover transition duration-500 group-hover:scale-[1.04] ${
                    item.objectPosition ?? "object-center"
                  }`}
                />

                {item.caption ? (
                  <>
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/85 to-transparent"
                    />
                    <p className="absolute bottom-3 left-4 right-4 text-xs font-semibold text-white">
                      {item.caption}
                    </p>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {STAFF.length > 0 ? (
          <>
            <h3 className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-keyblue-400">
              The Team
            </h3>

            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {STAFF.map((person) => (
                <li
                  key={person.name}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                  <div className="relative h-28 shrink-0 sm:h-32">
                    <Image
                      src={person.photo}
                      alt={`${person.name} of The Key Konnect`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-white">{person.name}</p>
                    {person.role ? (
                      <p className="text-xs text-white/55">{person.role}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Container>
    </section>
  );
}
