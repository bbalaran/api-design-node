import { NextResponse } from "next/server";
import { getMetricSeries } from "@/lib/data/report";

interface Params {
  params: { id: string; metricId: string };
}

export async function GET(_request: Request, { params }: Params) {
  const series = await getMetricSeries(params.id, params.metricId);

  if (!series) {
    return NextResponse.json({ message: "Metric not found" }, { status: 404 });
  }

  return NextResponse.json({ metric: series });
}
