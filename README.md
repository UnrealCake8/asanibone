# ASANIBONE

Mobile-first Next.js PWA for requesting an item from a physical shop and having it purchased and delivered.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Supabase Cloud (planned: Auth, Postgres, Storage, Realtime)
- Ziina (server-side payment integration)
- Manual courier workflow for MVP
- Vercel deployment

## MVP flow

1. Customer describes an item.
2. Customer chooses the shop/branch.
3. Customer sets an expected price and a maximum buffer.
4. The app calculates item allowance + delivery + service fee + payment processing fee.
5. Payment is handled server-side through Ziina.
6. Courier assignment stays manual for V1.
7. Final item cost can trigger a partial refund if it is below the allowance.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your project credentials.

## Security

Never put the Supabase secret key or Ziina API key in browser-side code or `NEXT_PUBLIC_` variables.
