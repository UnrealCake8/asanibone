# ASANIBONE

Mobile-first Next.js PWA for requesting an item from a physical shop and having it purchased and delivered.

## Architecture

- Next.js 16 App Router / React 19 / Tailwind CSS 4
- Vercel target deployment
- Supabase Auth + Postgres with RLS
- Network International N-Genius hosted payment integration (server-side; credentials required)
- Manual courier dispatch for the first production phase
- Installable PWA shell and service worker

## Order flow

Customer request → delivery details → server-owned quote → authenticated order creation → Network International payment → manual courier assignment → purchase → delivery → receipt/final adjustment.

Pricing is always recalculated on the server. Client-supplied totals are never trusted.

## Setup

1. Create a dedicated Supabase project.
2. Apply `supabase/migrations/0001_initial.sql`.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase project URL, publishable key and secret key.
5. Add Network International API key and outlet ID.
6. Run:

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ZIINA_API_KEY=
ZIINA_API_BASE_URL=
```

Only the two `NEXT_PUBLIC_` Supabase values may be exposed to the browser. Never expose the Supabase secret key or Ziina API key.

## Database security

All exposed application tables have RLS enabled. Customers can read only their own orders/events. Direct customer writes to orders are revoked: order creation and status/payment mutations go through authenticated server endpoints, which recalculate monetary fields.

Admin authorization should be stored in trusted app metadata or a server-managed database field, never user-editable user metadata.

## Production checklist

Before accepting real orders:

- Dedicated Supabase project connected and migration applied
- Auth redirect URLs configured for production domain
- Network International production credentials configured in Vercel
- Network International webhook status verification configured in the merchant portal
- Admin route protected with verified claims + server-managed admin authorization
- Real courier operating process/partner confirmed
- Refund and cancellation paths tested
- PWA icons/screenshots added
- Legal terms, privacy policy, refund/cancellation policy and UAE business/licensing review completed
- Rate limiting/abuse protection enabled for order/payment endpoints
- Monitoring/error reporting configured
- Lockfile generated and CI changed from `npm install` to `npm ci`

## Current limitations

The repository is production-shaped but not yet safe to accept real money. Live Supabase and Ziina credentials have intentionally not been invented or committed. Courier dispatch remains manual.
