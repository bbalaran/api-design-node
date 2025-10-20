import { NextResponse } from "next/server";
import { getReportDetail } from "@/lib/data/report";

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const report = await getReportDetail(params.id);

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ report });
}
