"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { ReportSummary } from "@/lib/data/report";
import ReportDetailPanel from "@/components/dashboard/report-detail-panel";

async function fetchReports() {
  const response = await fetch("/api/reports");
  if (!response.ok) {
    throw new Error("Failed to load reports");
  }
  const data = await response.json();
  return data.reports as ReportSummary[];
}

export default function DashboardShell({
  initialReports
}: {
  initialReports: ReportSummary[];
}) {
  const { data: reports = initialReports } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    initialData: initialReports,
    refetchInterval: 120_000
  });

  const [selectedReportId, setSelectedReportId] = useState(
    reports[0]?.id ?? null
  );

  useEffect(() => {
    if (reports.length === 0) {
      setSelectedReportId(null);
      return;
    }

    const stillExists = reports.some((report) => report.id === selectedReportId);
    if (!stillExists) {
      setSelectedReportId(reports[0]?.id ?? null);
    }
  }, [reports, selectedReportId]);

  return (
    <div className="flex h-screen max-h-screen">
      <aside className="w-80 border-r border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-xl font-semibold text-white">ProdLens Reports</h1>
        <p className="mt-1 text-sm text-slate-400">
          Browse ingested exports and drill into KPI health.
        </p>
        <nav className="mt-6 space-y-2 overflow-y-auto pr-2">
          {reports.length === 0 ? (
            <p className="text-sm text-slate-500">
              No reports have been uploaded yet.
            </p>
          ) : (
            reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => setSelectedReportId(report.id)}
                className={clsx(
                  "w-full rounded-md border border-transparent bg-slate-800/60 p-3 text-left transition hover:border-sky-400",
                  selectedReportId === report.id
                    ? "border-sky-400 bg-slate-800"
                    : ""
                )}
              >
                <p className="text-sm font-semibold text-white">{report.title}</p>
                <p className="text-xs text-slate-400">{report.product}</p>
                <p className="text-xs text-slate-500">
                  Generated {new Date(report.generatedAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <ReportDetailPanel reportId={selectedReportId} />
      </main>
    </div>
  );
}
