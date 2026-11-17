# JIP Group

Online store for **JIP Group** (plastic tanks, waste containers, table-and-chair
sets and plumbing fittings; Chinnibozor 1 qator 16 do‘kon), a tenant of the
dukonline.uz ERP. Built with Next.js 16 (App Router), React 19 and CSS Modules,
and deployed as a Cloudflare Worker through OpenNext.

Products, prices, stock, categories, category images, banners and customer
accounts come from the dukonline Storefront API. The only thing the site writes
back is an order.

Public address: <https://jipgroupchinnibozor1-qator16-dukon.uz> (`SITE_URL` in `wrangler.jsonc` and
`src/lib/site.ts`). Before the domain is attached the Worker also answers at
`https://jip-group.dukonline.workers.dev`.

## Getting started

```bash
npm ci
cp .env.example .env.local     # then paste the storefront key
npm run dev                    # http://localhost:3000
```

| Variable | Purpose |
| --- | --- |
| `DUKONLINE_API_URL` | `https://api.dukonline.uz/api`. Same host for every tenant. |
| `DUKONLINE_STOREFRONT_KEY` | Selects the tenant (`X-Storefront-Key`). ERP SuperAdmin → organization → Online Store. Server-side only. |
| `SITE_URL` | The public `https://` address, for link previews, robots.txt and sitemap.xml. |

`.env.local` and `.dev.vars` are git-ignored. Sign-in, account data, orders and
reverse geocoding go through route handlers in `src/app/api/`, so the key never
reaches the browser.

## Scripts

```bash
npm run dev         # dev server
npm run build       # Next.js production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm test            # node --test over tests/*.test.ts
npm run cf:build    # Worker bundle in .open-next/
npm run cf:preview  # build + run the Worker locally in workerd (reads .dev.vars)
npm run cf:deploy   # build + deploy to Cloudflare
```

## Deploying to Cloudflare

The Worker is named `jip-group` (`wrangler.jsonc`). Once per account:

```bash
npx wrangler login
npx wrangler secret put DUKONLINE_STOREFRONT_KEY
```

Then `SITE_URL=https://jipgroupchinnibozor1-qator16-dukon.uz npm run cf:deploy` (robots.txt
is prerendered, so the build needs the same value). For `cf:preview`, put the
same variables in `.dev.vars` (a copy of `.env.local` works). `next/image` is
optimised by Cloudflare Images through the `IMAGES` binding.

## How it works

- **Pages:** home (the ERP banners with the headline over their clear left side,
  then all products),
  `/catalog` (category chips, search results, sort), `/product/[id]`, `/cart`,
  `/checkout`, `/account`, `/privacy`.
- **Categories** open from the header's menu button as a sheet from the left,
  like the cart's sheet from the right (`ShopOverlays.tsx`).
- **Scroll animation** (after bekplast.uz): product cards drop in from 100px
  above as they come into view, the first row on page load and the rest as
  the visitor scrolls, 160ms apart along a row (`RevealList.tsx`). Cards
  arrive hidden from the server; if scripts never run, a CSS fallback shows
  them after 2.5s. Off with reduced motion.
- **Product cards** (bekplast.uz layout): the photo fills a square, then the
  name, the price, and a quantity stepper with "Savatga". 4 per row on
  desktop, 3 on tablets, 2 on phones; pages run wide with small side gaps.
- **Categories** are rebuilt from the product rows in the order the feed first
  names them. Category images come from the ERP (`category_images`), else from a
  product photo in that category.
- **Banners** (`/storefront/info/` → `banners`) are the top of the home page,
  image only, at 3:1 (upload them at 1920×640); several rotate every 5 s.
- **Units and variants** work as the ERP defines them (today every product is
  "Dona"). Units of one product share its stock; rules in
  `src/lib/product/units.ts` and `options.ts`.
- **Orders** send each line in its own unit, with `unit_id` only for a non-base
  unit. `/api/orders` re-checks stock first, because the ERP has answered
  over-stock on products without variants with a bare 500. Delivery is never
  priced on the site: the shop agrees it by phone after the order.

## Shop details

Brand, phone numbers and the pickup address are not in the API. They go in
`src/config/store.ts`; empty fields are simply not shown. The checkout map opens on Tashkent (`MAP_CENTER`).

## Layout

```text
src/
├── app/                routes only: layout, pages, loading/error/not-found, api/, robots, sitemap
├── features/
│   ├── home/           Hero, HeroBanners, ProductSection
│   ├── catalog/        SortSelect, URL params
│   ├── product/        ProductDetail, Gallery, OptionPicker, BuyBox, SpecTable
│   ├── cart/           CartView, CartLine
│   ├── checkout/       CheckoutForm, MapPicker, OrderSuccess
│   └── account/        AccountView, LoginForm, CustomerPortal
├── components/
│   ├── layout/         Header, SearchBox, CartButton, NavActions, ShopOverlays (cart sheet), Footer, Breadcrumbs
│   ├── product/        ProductCard, ProductGrid, RevealList
│   └── ui/             Button, Container, Dialog, Stepper, Segmented, Price, SafeImage, ...
├── config/             brand and contact details
├── lib/
│   ├── storefront/     API client, store (the one data seam), catalog logic, types, currency
│   ├── product/        units, buy options, spec rows
│   ├── cart/           pure reducers (lines.ts), quantities, useCart, CartSync
│   └── customer/       session cookie, useCustomer
└── styles/             tokens.css (design tokens), reset.css
```

### Styling

- Every component has its own `*.module.css` next to it.
- `src/styles/tokens.css` is the only place colours, type sizes, spacing, radii
  and shadows are defined: the logo's navy (`#0b0f3c`, footer), one bright
  plastic blue (`#1d5bd6`, header, hero and buttons) and light grey-blue
  surfaces under the product photos.
- Manrope everywhere, with Cyrillic for product names typed in Russian.
- The logo is `public/logo-white.png` (white on transparent, made from the
  shop's navy square logo); the favicon is `src/app/icon.png`.

### Notes

- The API has no per-product, category or pagination endpoint. The whole
  catalog comes in one response (cached 60 s), and categories, search and
  similar products are derived from it in `src/lib/storefront/catalog.ts`.
- The cart is in localStorage (`jip_cart`) and is re-checked against the
  catalog on every load (prices, stock caps, removed products).
- Customers sign in with the in-store code (`CUST-XXXXXX`), kept in
  localStorage (`jip_customer`) and mirrored into an httpOnly cookie
  (`jip_customer_code`) so the server can fetch their personal prices.
  Foreign-currency balances come from `customer.currency_advances`.
- Copy is Uzbek (Latin). Payment copy is exactly "To‘lov naqd yoki karta orqali."
