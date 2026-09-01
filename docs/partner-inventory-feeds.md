# Partner Lot Inventory Feeds

Working sheet for bringing partner-lot inventory into The Key Konnect.

Cory sells for these lots; their cars appear on our site alongside his own.
The schema was built for this from day one — `partner_lots`, `inventory_staging`,
`inventory_sync_runs` and `feed_upsert_vehicle()` — so the work left is getting
each lot to authorise a feed, then writing one connector per feed format.

## The lots

| Lot | Address | Platform | Units | Feed status |
|---|---|---|---|---|
| Performance Motors | 2200 E Rancier Ave, Killeen TX 76543 | DealerSync | ~43 | Not requested |
| McLeod Auto Sales | 3405 E Stan Schlueter Loop, Killeen TX 76542 | DealerOn | 200+ | Not requested |
| Platinum Autoplex | 217 W Veterans Memorial Blvd, Killeen TX 76541 | AutoRevolution | Unknown | Not requested |
| Shelley's Auto Sales | 727 S Main St, Belton TX 76513 | DealerCenter | Unknown | Not requested |
| **(5th lot — link never arrived)** | | | | |

All four are already loaded in `partner_lots` with `display_on_site = false`.

Four different platforms across four lots, so there is no single integration
that covers them. Each connector is written once against that vendor's export
format; if a fifth lot turns out to also be on DealerSync or DealerCenter, it
reuses the connector already written and costs almost nothing to add.

## Feeds, not scraping

Two of the four sites — Performance Motors and Shelley's — publish a
`robots.txt` that blocks scrapers and AI crawlers with a blanket `Disallow: /`
(CCBot, Bytespider, Diffbot, AI2Bot, GPTBot, Googlebot-Extended). That is a
refusal in the only machine-readable form a website has. We honour it.

The practical case is just as strong:

- Every one of these lots already syndicates to Cars.com, Autotrader or
  Facebook Marketplace, so the export pipeline exists at each vendor. The
  dealer authorising one more recipient is a routine request, usually free.
- A feed carries VIN, trim, mileage, price, options and full photo URLs as
  structured data, and it updates when they update.
- Scraped HTML carries guesses that break silently the next time a vendor
  restyles a template — and the failure mode is publishing a wrong price on
  Cory's site for a car he does not own. That is the one mistake a dealer
  cannot afford, and the one a customer will remember.

## What to ask each lot for

The request has to come from the dealer, since it is their data and their
vendor account. Ask each lot's owner to open a ticket with their website
provider (named per lot in the table above) requesting:

1. **An outbound third-party inventory feed** delivered to The Key Konnect
2. **Format:** XML or CSV — whichever is standard for that vendor
3. **Delivery:** SFTP push, or a URL we can poll on a schedule
4. **Frequency:** every 4–24 hours (anything under 24h is fine)
5. **Photos:** confirm the feed carries *all* photo URLs, not just the primary
6. **Fields:** VIN, year, make, model, trim, mileage, price, exterior/interior
   colour, transmission, drivetrain, body style, options, description, stock #

VIN is the join key — it is how we dedupe against Cory's own stock and how we
detect a car that has sold off the partner's lot and needs archiving here.

Also settle two business questions per lot, which are site-visible decisions:

- **Naming.** Do they want to be credited publicly on our vehicle cards, or
  stay unbranded? `partner_lots.display_on_site` defaults to `false`, so
  nobody is named until someone deliberately turns it on.
- **Pricing.** Are we advertising their price as-is, or is there a markup or
  commission structure? Record it in `commission_notes`.

## Request template

> Hi — Cory with The Key Konnect here. We're listing your inventory on our
> site and sending you buyers. To keep your listings accurate, we need an
> inventory feed rather than copying from your website.
>
> Could you ask [VENDOR] to set up an outbound third-party inventory feed for
> us? It's the same thing they already do for Cars.com and Autotrader — they
> just add us as a recipient. XML or CSV, by SFTP or a URL, refreshed daily,
> with all photo URLs included.
>
> Two quick things on our end: do you want your dealership named on the
> listings, or shown unbranded? And are we advertising your listed price
> as-is?

## Once a feed exists

1. Add the credentials to Vercel env — never to the repo
2. Write the connector for that vendor's format, mapping into `inventory_staging`
3. Dry-run it and inspect staging before promoting anything
4. `feed_upsert_vehicle()` promotes staged rows; `feed_archive_missing()` retires
   cars that fell off the feed
5. Field-level overrides survive every sync — anything staff edits by hand is
   locked and the feed will not overwrite it
