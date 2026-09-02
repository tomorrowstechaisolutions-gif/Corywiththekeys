# Brand palette — blue and gold

The colours come off Cory's truck: royal blue body, gold lettering. They are on
the truck, the billboard, the cap and the merch, and people in Killeen
recognise them before they read a word. Every page runs on them.

All of it lives in `src/app/globals.css` as CSS custom properties, exposed to
Tailwind through `@theme inline`. **Change the value there, not in a
component** — there are ~400 uses of these tokens across the site and none of
them hard-code a hex.

## The ramps

| Token | Value | Where it belongs |
| --- | --- | --- |
| `navy-950` | `#040a1c` | Page background on dark sections, header, footer |
| `navy-900` | `#071231` | Dark panels and cards, body text on white |
| `navy-800` | `#0c1e56` | Raised panels, secondary badges |
| `navy-700` | `#12296d` | The truck's body colour; secondary text on white |
| `keyblue-700` | `#14349b` | Deep links on white |
| `keyblue-600` | `#1c46c4` | Primary buttons, links on white, button hover on dark |
| `keyblue-500` | `#2f61e8` | Display accents on dark, focus rings |
| `keyblue-400` | `#6a92ff` | Links and eyebrow links on dark |
| `keyblue-300` | `#a3bcff` | Quiet text on dark |
| `keyblue-electric` | `#2a5cff` | The store's primary button |
| `gold-300` | `#f6d878` | Gold text on very dark panels |
| `gold-400` | `#edc451` | Gold hover |
| `gold-500` | `#d9a92b` | The lettering gold — the default gold |
| `gold-600` | `#b98613` | The only gold dark enough for large type on white |

## Two rules that keep it readable

**1. Gold is for dark backgrounds.**

On navy, `gold-500` clears 8:1 and looks like the truck. On white it is
**2.2:1** — invisible to tired eyes and a WCAG failure. On light sections the
accent is blue; gold appears there only as a filled shape with dark text on it
(the "Featured" badge, the rule under a section heading), never as text on
white. `gold-600` is the one exception, and only for large type.

**2. Gold marks the approval action. Blue is everything else.**

Applying for financing is the thing Cory most wants people to do, so it gets
the one colour nothing else uses:

- gold — "Get Approved" in the header and mobile nav, "Apply Now" in the hero,
  "Get Pre-Approved" on inventory, "Start Secure Application" on Financing, and
  the submit button on the Get Approved Fast panel
- blue — every other primary button: View Inventory, Send A Message, Add To
  Bag, Get Directions, Search

Structure follows the truck too: blue panels and borders, gold lettering on
top. That is why the Financing cards have blue borders and gold numerals rather
than the other way round.

## Contrast

Every pairing in use was checked against WCAG AA before it was written down.
The tight ones worth knowing:

| Pairing | Ratio |
| --- | --- |
| white on `keyblue-600` | 7.7:1 |
| white on `keyblue-electric` | 5.2:1 |
| `gold-500` on `navy-950` | 9.1:1 |
| `navy-950` on `gold-500` | 9.1:1 |
| `keyblue-600` on white | 7.7:1 |
| `gold-500` on white | **2.2:1 — never do this** |

Button hovers **darken** rather than lighten. A lighter blue drops 12px bold
uppercase text below 4.5:1, so hover goes to `keyblue-600`, not to a brighter
blue.

## No pure black

Black belongs to no brand. Opaque backgrounds live in the blue family —
`navy-950`, `shop-ink`, `finance-bg` are all tinted blue rather than neutral.
Translucent scrims over photographs (`bg-black/40` and friends) are fine; they
are shadow, not colour.
