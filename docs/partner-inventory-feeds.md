# Partner Lot Inventory Feeds

Working sheet for bringing partner-lot inventory into The Key Konnect.

Cory sells for these lots; their cars appear on our site alongside his own.
The schema was built for this from day one — `partner_lots`, `inventory_feeds`,
`inventory_staging`, `inventory_sync_runs` and `feed_upsert_vehicle()` — so the
work left is getting each lot to authorise a feed, then writing one connector
per feed format.

Status as of the last check: five lots loaded, all `display_on_site = false`;
zero feeds configured; zero partner vehicles. Nothing technical is blocking
this. The data has not arrived yet.

## The lots

| Lot | Address | Platform | Units | Feed status |
|---|---|---|---|---|
| McLeod Auto Sales | 3405 E Stan Schlueter Loop, Killeen TX 76542 | DealerOn | 200+ | Not requested |
| Performance Motors | 2200 E Rancier Ave, Killeen TX 76543 | DealerSync | ~43 | Not requested |
| Platinum Autoplex | 217 W Veterans Memorial Blvd, Killeen TX 76541 | AutoRevolution | Unknown | Not requested |
| Shelley's Auto Sales | 727 S Main St, Belton TX 76513 | DealerCenter | Unknown | Not requested |
| Drive Away Auto Sales | 4301 E Stan Schlueter Loop Bldg 2, Killeen TX 76542 | DealerCenter | Unknown | Not requested |

All five are loaded in `partner_lots` with `display_on_site = false`.

### Four connectors, not five

| Platform | Lots | Priority |
|---|---|---|
| DealerCenter | Shelley's, Drive Away | Build first — covers two lots |
| DealerOn | McLeod | Build first — 200+ units, the largest single source |
| DealerSync | Performance Motors | Then |
| AutoRevolution | Platinum Autoplex | Then |

DealerCenter is the only platform serving more than one lot, so that connector
earns its keep twice. McLeod alone carries more inventory than the other four
combined as far as we know, so between them those two connectors are most of
the value in the project.

Geography worth knowing: McLeod and Drive Away are both on E Stan Schlueter
Loop, and Platinum Autoplex sits on W Veterans Memorial a few blocks from The
Key Konnect's own lot. Four of the five are in Killeen; only Shelley's is out
in Belton.

## What each lot's robots.txt actually says

Checked directly, not from memory. An earlier version of this document claimed
three of the five publish a blanket `Disallow: /`. **That was wrong.** None of
them does.

| Lot | `User-agent: *` | AI crawlers |
|---|---|---|
| McLeod Auto Sales | Allowed, `crawl-delay: 10` — but `/rss-usedinventory.aspx` and `/rss-newinventory.aspx` are explicitly disallowed | not mentioned |
| Platinum Autoplex | Allowed, everything (`Disallow:` empty, `crawl-delay: 2`) | not mentioned |
| Performance Motors | Allowed on general paths | ~20 named, `Disallow: /` |
| Shelley's Auto Sales | Allowed on general paths | 30+ named, `Disallow: /` |
| Drive Away Auto Sales | Allowed on general paths | 31 named, `Disallow: /` |

Three of the five name AI crawlers — GPTBot, CCBot, Bytespider, Diffbot,
PerplexityBot, Google-Extended, Amazonbot, cohere-ai and the rest — and refuse
them the whole site. A scraper written to ingest their inventory into another
system is the thing being refused there, whatever user-agent string it sends.
Choosing a neutral one to get past a list like that is circumventing a stated
no, so we do not do it for those three.

McLeod is worth reading closely. The site is crawlable, but the two DealerOn
RSS inventory endpoints — precisely the structured data we would want — are the
paths they singled out to block. That looks deliberate.

Platinum Autoplex raises no objection of any kind.

Note also that robots.txt permission is not terms-of-service permission. Dealer
sites commonly prohibit automated extraction in their ToS, and that is a legal
question for the business to answer, not a technical one.

## Feeds beat scraping anyway

Even where crawling is permitted, a feed is the better instrument:

- Every one of these lots already syndicates to Cars.com, Autotrader or
  Facebook Marketplace, so the export pipeline exists at each vendor. The
  dealer authorising one more recipient is a routine request, usually free.
- A feed carries VIN, trim, mileage, price, options and full photo URLs as
  structured data, and it updates when they update.
- Scraped HTML carries guesses that break silently the next time a vendor
  restyles a template — and the failure mode is publishing a wrong price on
  Cory's site for a car he does not own. That is the one mistake a dealer
  cannot afford, and the one a customer will remember.

And the shortest path of all is a phone call. These are Cory's partners, not
strangers. Asking converts a grey area into a documented yes, and the naming
and pricing questions below have to be asked either way.

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
