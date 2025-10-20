"use client";

import clsx from "clsx";
import { MetricDetail } from "@/lib/data/report";

const statusColors: Record<string, string> = {
  on_track: "text-success",
  watch: "text-warning",
  breach: "text-danger"
};

function formatValue(value: number, unit?: string | null) {
  if (unit === "%") {
    return `${value.toFixed(1)}%`;
  }
  if (unit === "ms") {
    return `${value.toFixed(0)} ms`;
  }
  return unit ? `${value.toFixed(2)} ${unit}` : value.toFixed(2);
}

function latestPoint(points: MetricDetail["points"]) {
  return points.at(-1);
}

export default function KPIGrid({ metrics }: { metrics: MetricDetail[] }) {
  if (metrics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
        Upload a report with KPI definitions to see summary cards.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const point = latestPoint(metric.points);
        const statusClass = point?.status ? statusColors[point.status] ?? "text-slate-300" : "text-slate-300";
        return (
          <article
            key={metric.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm"
          >
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{metric.name}</h3>
              {metric.isKpi && (
                <span className="rounded-full border border-sky-500 px-2 py-0.5 text-xs text-sky-400">
                  KPI
                </span>
              )}
            </header>
            {metric.description && (
              <p className="mt-1 text-xs text-slate-400">{metric.description}</p>
            )}
            <div className="mt-4 flex items-baseline gap-2">
              <p className={clsx("text-3xl font-semibold", statusClass)}>
                {point ? formatValue(point.value, metric.unit) : "--"}
              </p>
              {point?.target !== undefined && point?.target !== null && (
                <p className="text-xs text-slate-400">
                  Target {formatValue(point.target, metric.unit)}
                </p>
              )}
            </div>
            {point?.status && (
              <p className={clsx("mt-2 text-xs uppercase tracking-wide", statusClass)}>
                Status: {point.status.replace("_", " ")}
              </p>
            )}
            {metric.dimensions.length > 0 && (
              <div className="mt-3 text-xs text-slate-400">
                <p className="font-medium text-slate-300">Dimensions</p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {metric.dimensions.map((dimension, index) => (
                    <li
                      key={`${dimension.name}-${dimension.value}-${index}`}
                      className="rounded-full bg-slate-800 px-2 py-0.5"
                    >
                      {dimension.name}: {dimension.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
