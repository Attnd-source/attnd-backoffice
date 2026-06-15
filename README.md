# Attnd Backoffice

Internal back-office / CRM system for **Attnd** (corporate events). Tracks partners
(contracts), organizers, events, finance/invoices, with dashboards, reports, and full
**edit tracking** (who changed what, when) on every record.

## Modules
- **Admin** — staff accounts (email + mobile + password, unlimited users) and editable
  venue/vendor categories.
- **Contracts** — venue/vendor partner registry with create, filterable/searchable
  dashboard, and detail page with inline edit + edit history.
- **Organizers** — organizer leads with the same create / dashboard / history pattern.
- **Events** — events linked to organizers, with services-needed multiselect and partner
  service-provider selection.
- **Finance** — service-provider invoices (attachment + supplier line items with live net
  revenue) and generated invoices (downloadable branded **PDF letter**).
- **Dashboard** — KPI cards, charts, and clickable recent-activity feed.
- **Reports** — pick any module + date range, preview, and export to **Excel** or **PDF**.

## Tech stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma (SQLite locally, Postgres in
production) · custom JWT auth (jose + bcryptjs) · Recharts · pdf-lib · ExcelJS.

## Running locally (Windows)

> This machine is ARM64 Windows. Prisma's query engine needs **x64 Node** (run under
> Windows' x64 emulation). A portable copy lives at `C:\Users\laila\node-x64`. Put it first
> on PATH for every command:

```powershell
$env:Path = "C:\Users\laila\node-x64;" + $env:Path
cd C:\Users\laila\attnd-backoffice
```

Then:

```powershell
npm install          # install dependencies
npm run db:push      # create the local SQLite database
npm run db:seed      # seed admin user + placeholder categories
npm run dev          # start the dev server on http://localhost:3000
```

Or run the already-built production server with `npm run start` (port 3000), or the helper
`run-server.cmd` which sets PATH automatically.

### First login
- **Email:** `admin@attnd.sa`
- **Password:** `Admin@123`  ← change this after first sign-in (Admin → Users).

## Branding
All colors are CSS variables in `src/app/globals.css`; logo/app-name/PDF colors live in
`src/lib/brand.ts`. Replace `public/logo.svg` and those values with the official Attnd
assets — nothing else needs to change.

## Finance formulas (confirmed)
- Generated invoice: `commission = actualCost × commission%`, `VAT = commission × 0.15`,
  `invoiced = actualCost − commission − VAT`.
- Service-provider line: `netRevenue = offerCost − actualCost + (actualCost × commission%)`.

See `DEPLOY.md` to put this online for remote staff.
