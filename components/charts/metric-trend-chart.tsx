"use client";

import ReactECharts from "echarts-for-react";
import { useQuery } from "@tanstack/react-query";

interface MetricSeriesPoint {
  timestamp: string;
  value: number;
  target?: number | null;
  status?: string | null;
}

interface MetricSeriesResponse {
  metric: {
    id: string;
    name: string;
    unit?: string | null;
    type: string;
    points: MetricSeriesPoint[];
  };
}

async function fetchMetricSeries(reportId: string, metricId: string) {
  const response = await fetch(`/api/reports/${reportId}/metrics/${metricId}`);
  if (!response.ok) {
    throw new Error("Failed to load metric series");
  }
  const data = (await response.json()) as MetricSeriesResponse;
  return data.metric;
}

function buildOption(series: MetricSeriesResponse["metric"]) {
  const timestamps = series.points.map((point) => point.timestamp);
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const [point, target] = params;
        const date = new Date(point.axisValue).toLocaleString();
        const value = point.data?.value ?? point.data;
        const parts = [`<strong>${date}</strong>`, `Value: ${value}`];
        if (target && target.seriesName === "Target" && target.data != null) {
          parts.push(`Target: ${target.data}`);
        }
        return parts.join("<br/>");
      }
    },
    legend: {
      textStyle: { color: "#cbd5f5" }
    },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: timestamps,
      axisLine: { lineStyle: { color: "#64748b" } },
      axisLabel: {
        color: "#94a3b8",
        formatter: (value: string) => new Date(value).toLocaleDateString()
      }
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#64748b" } },
      splitLine: { lineStyle: { color: "#1e293b" } },
      axisLabel: { color: "#94a3b8" }
    },
    series: [
      {
        name: "Value",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: series.points.map((point) => point.value),
        lineStyle: { color: "#38bdf8", width: 3 },
        areaStyle: { color: "rgba(56, 189, 248, 0.2)" }
      },
      {
        name: "Target",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: series.points.map((point) => point.target ?? null),
        lineStyle: { color: "#facc15", width: 2, type: "dashed" }
      }
    ]
  };
}

export default function MetricTrendChart({
  reportId,
  metricId
}: {
  reportId: string;
  metricId: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["metric", reportId, metricId],
    queryFn: () => fetchMetricSeries(reportId, metricId),
    staleTime: 60_000
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Loading trend…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-danger">
        Unable to load trend data.
      </div>
    );
  }

  if (data.points.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        No data points available for this metric.
      </div>
    );
  }

  return <ReactECharts style={{ height: "100%", width: "100%" }} option={buildOption(data)} />;
}
