This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Admin database

Admin accounts, sign-in sessions and booking vouchers are stored in a Neon Postgres
database (Vercel → Storage → `jacmiya-db`). Everything else in the admin (tours,
leads, sales, invoices, receipts, expenses, HR, reviews, settings) is still kept in
each browser's local storage.

- `vercel env pull .env.local` — fetch the database connection settings.
- `npm run db:migrate` — create or update the tables from `db/schema.sql` (safe to re-run).

**First-time setup:** while the database has no accounts, `/admin/login` shows a
"create the owner account" form. Do this straight after the first deploy — once one
account exists the form is gone for good. The owner then adds staff under
Admin → Users, choosing full access or specific sections per person.

**Moving old data in:** accounts and vouchers created before the database existed
live in the browser they were made in. Export a backup there (Settings → Backup &
Restore) and upload it on the Users page; existing emails and voucher numbers are skipped.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
