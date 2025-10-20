import { prisma } from "@/lib/db/client";

export interface ReportSummary {
  id: string;
  title: string;
  description?: string | null;
  product: string;
  generatedAt: string;
  timeRange: { start: string; end: string };
  metricsCount: number;
  kpiCount: number;
}

export interface MetricPoint {
  timestamp: string;
  value: number;
  target?: number | null;
  status?: string | null;
}

export interface MetricDetail {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  unit?: string | null;
  isKpi: boolean;
  dimensions: { name: string; value: string }[];
  points: MetricPoint[];
  annotations: { id: number; timestamp: string; note: string; author?: string | null }[];
}

export interface ReportDetail extends ReportSummary {
  metrics: MetricDetail[];
}

export async function getReportSummaries({
  product,
  kpiOnly
}: {
  product?: string;
  kpiOnly?: boolean;
} = {}): Promise<ReportSummary[]> {
  const reports = await prisma.report.findMany({
    where: {
      ...(product ? { product } : {}),
      ...(kpiOnly ? { metrics: { some: { isKpi: true } } } : {})
    },
    orderBy: { generatedAt: "desc" },
    include: {
      _count: { select: { metrics: true } },
      metrics: kpiOnly
        ? { select: { id: true, isKpi: true }, where: { isKpi: true } }
        : { select: { id: true, isKpi: true } }
    }
  });

  return reports.map((report) => ({
    id: report.id,
    title: report.title,
    description: report.description,
    product: report.product,
    generatedAt: report.generatedAt.toISOString(),
    timeRange: {
      start: report.timeRangeStart.toISOString(),
      end: report.timeRangeEnd.toISOString()
    },
    metricsCount: report._count.metrics,
    kpiCount: report.metrics.filter((metric) => metric.isKpi).length
  }));
}

export async function getReportDetail(reportId: string): Promise<ReportDetail | null> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      metrics: {
        orderBy: { name: "asc" },
        include: {
          dimensions: true,
          points: { orderBy: { timestamp: "asc" } },
          annotations: { orderBy: { timestamp: "desc" } }
        }
      }
    }
  });

  if (!report) return null;

  return {
    id: report.id,
    title: report.title,
    description: report.description,
    product: report.product,
    generatedAt: report.generatedAt.toISOString(),
    timeRange: {
      start: report.timeRangeStart.toISOString(),
      end: report.timeRangeEnd.toISOString()
    },
    metricsCount: report.metrics.length,
    kpiCount: report.metrics.filter((metric) => metric.isKpi).length,
    metrics: report.metrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      description: metric.description,
      type: metric.type,
      unit: metric.unit,
      isKpi: metric.isKpi,
      dimensions: metric.dimensions.map((dimension) => ({
        name: dimension.name,
        value: dimension.value
      })),
      points: metric.points.map((point) => ({
        timestamp: point.timestamp.toISOString(),
        value: point.value,
        target: point.target,
        status: point.status
      })),
      annotations: metric.annotations.map((annotation) => ({
        id: annotation.id,
        timestamp: annotation.timestamp.toISOString(),
        note: annotation.note,
        author: annotation.author
      }))
    }))
  };
}

export async function getMetricSeries(reportId: string, metricId: string) {
  const metric = await prisma.metric.findFirst({
    where: { id: metricId, reportId },
    include: { points: { orderBy: { timestamp: "asc" } } }
  });

  if (!metric) return null;

  return {
    id: metric.id,
    name: metric.name,
    unit: metric.unit,
    type: metric.type,
    points: metric.points.map((point) => ({
      timestamp: point.timestamp.toISOString(),
      value: point.value,
      target: point.target,
      status: point.status
    }))
  };
}

export async function getReportRawPath(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { rawPath: true }
  });

  if (!report) return null;
  return report.rawPath;
}
