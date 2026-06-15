# Deploying Attnd Backoffice

The app is built as a single deployable Next.js application. Local development uses SQLite;
production should use **PostgreSQL**. Below is the recommended path (Vercel + a hosted
Postgres), plus what to change.

## 1. Switch the database to Postgres
In `prisma/schema.prisma`, change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Create a free Postgres database (e.g. **Neon** at neon.tech or **Supabase**) and copy its
connection string.

## 2. Environment variables
Set these in your host (Vercel → Project → Settings → Environment Variables):

| Variable        | Value                                                            |
|-----------------|------------------------------------------------------------------|
| `DATABASE_URL`  | your Postgres connection string                                  |
| `AUTH_SECRET`   | a long random string (e.g. `openssl rand -base64 48`)            |
| `UPLOAD_DIR`    | not needed once you move uploads to cloud storage (see step 5)   |

## 3. Create tables + seed
From your machine (pointing DATABASE_URL at Postgres), or via a one-off job:

```bash
npx prisma migrate deploy   # or: npx prisma db push
npm run db:seed             # creates admin@attnd.sa / Admin@123  (change immediately)
```

## 4. Deploy
```bash
npm i -g vercel
vercel            # follow prompts, link the project
vercel --prod
```
Vercel runs `npm run build` (which runs `prisma generate` first). The app boots on Node —
no ARM64/x64 concerns on the server (Vercel is x64 Linux).

## 5. File uploads (service-provider invoice attachments)
Local dev writes uploads to `/uploads`. Serverless hosts have an ephemeral filesystem, so
for production swap the storage layer in `src/lib/storage.ts` to an S3-compatible bucket
(AWS S3, Cloudflare R2, Supabase Storage). Only `saveUpload()` and the `/api/files/[id]`
route read/write files — update those two and store the object key in `attachmentPath`.

## 6. Branding
Replace `public/logo.svg` and the values in `src/lib/brand.ts` (and the `--brand*` colors in
`src/app/globals.css`) with the official Attnd assets.

## Other hosts
Any Node host works (Render, Railway, Fly.io, a VPS). Build with `npm run build`, start with
`npm run start`, and provide the same environment variables. For a VPS you can keep using the
local filesystem for uploads and even SQLite, but Postgres is recommended for concurrent use.
