import { NextResponse } from "next/server";
import { getReportSummaries } from "@/lib/data/report";
import { ingestProdLensReport } from "@/lib/services/report-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product") ?? undefined;
  const kpiOnly = searchParams.get("kpiOnly") === "true";

  const summaries = await getReportSummaries({ product, kpiOnly });
  return NextResponse.json({ reports: summaries });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const reportId = await ingestProdLensReport(payload);
    return NextResponse.json({ reportId }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to ingest report" }, { status: 400 });
  }
}
