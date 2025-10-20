"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportDetail } from "@/lib/data/report";
import KPIGrid from "@/components/dashboard/kpi-grid";

const MetricTrendChart = dynamic(
  () => import("@/components/charts/metric-trend-chart"),
  { ssr: false }
);

async function fetchReport(reportId: string) {
  const response = await fetch(`/api/reports/${reportId}`);
  if (!response.ok) {
    throw new Error("Failed to load report");
  }
  const data = await response.json();
  return data.report as ReportDetail;
}

export default function ReportDetailPanel({
  reportId
}: {
  reportId: string | null;
}) {
  const enabled = Boolean(reportId);
  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => fetchReport(reportId as string),
    enabled,
    staleTime: 60_000
  });

  const firstKpiMetric = useMemo(() => {
    if (!report) return null;
    return report.metrics.find((metric) => metric.isKpi) ?? report.metrics[0] ?? null;
  }, [report]);

  if (!reportId) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center text-slate-400">
        <h2 className="text-lg font-semibold text-white">Select a report</h2>
        <p className="max-w-md text-sm">
          Ingest a ProdLens export to begin exploring key performance indicators.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-2 p-10 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
        <p className="text-sm">Loading report…</p>
      </section>
    );
  }

  if (isError || !report) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-slate-400">
        <h2 className="text-lg font-semibold text-danger">Unable to load report</h2>
        <p className="max-w-sm text-sm">
          Check that the ingestion API returned success and try again.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-h-full flex-col gap-6 bg-slate-950/60 p-10">
      <header className="flex flex-col gap-2 border-b border-slate-800 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {report.product}
            </p>
            <h2 className="text-2xl font-semibold text-white">{report.title}</h2>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Generated {new Date(report.generatedAt).toLocaleString()}</p>
            <p>
              Range {new Date(report.timeRange.start).toLocaleDateString()} –
              {" "}
              {new Date(report.timeRange.end).toLocaleDateString()}
            </p>
            <p>{report.metricsCount} metrics ({report.kpiCount} KPIs)</p>
          </div>
        </div>
        {report.description && (
          <p className="max-w-3xl text-sm text-slate-300">{report.description}</p>
        )}
      </header>

      <KPIGrid metrics={report.metrics} />

      {firstKpiMetric ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white">{firstKpiMetric.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {firstKpiMetric.description ?? "Primary KPI trend"}
          </p>
          <div className="mt-4 h-80">
            <MetricTrendChart metricId={firstKpiMetric.id} reportId={report.id} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
          No metrics were parsed for this report.
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold text-white">Annotations</h3>
        {report.metrics.every((metric) => metric.annotations.length === 0) ? (
          <p className="mt-2 text-sm text-slate-400">
            No annotations supplied in the ProdLens export.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {report.metrics.map((metric) =>
              metric.annotations.length > 0 ? (
                <article key={metric.id} className="rounded-lg border border-slate-800 p-4">
                  <h4 className="text-sm font-semibold text-white">{metric.name}</h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {metric.annotations.map((annotation) => (
                      <li key={annotation.id} className="border-l-2 border-sky-500 pl-3">
                        <p className="text-xs text-slate-400">
                          {new Date(annotation.timestamp).toLocaleString()} •{" "}
                          {annotation.author ?? "Unknown analyst"}
                        </p>
                        <p>{annotation.note}</p>
                      </li>
                    ))}
                  </ul>
                </article>
              ) : null
            )}
          </div>
        )}
      </section>
    </section>
  );
}
