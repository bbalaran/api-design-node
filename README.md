# ProdLens Reporting Prototype

A Next.js 14 prototype that ingests ProdLens metric exports, stores them locally, and exposes a Tailwind-powered React dashboard for visualizing KPIs with Apache ECharts.

## Prerequisites
- Node.js 18+
- SQLite (bundled with Prisma via `sqlite` driver)

## Setup
1. Install dependencies (requires access to the npm registry):
   ```bash
   npm install
   ```
2. Generate the Prisma client and apply the initial schema:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The app runs on [http://localhost:3000](http://localhost:3000).

## Data ingestion
- Upload ProdLens exports via `POST /api/reports` with a JSON payload matching `lib/schema/report.ts`.
- Raw payloads are stored under `storage/reports/` and normalized into SQLite tables.
- Browse ingested reports at the root route, which surfaces KPI cards, trend charts, and annotations.

## Testing
No automated tests are configured yet. Use the API routes manually to verify ingestion and visualization flows.
