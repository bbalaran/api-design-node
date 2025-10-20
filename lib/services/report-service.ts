import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db/client";
import {
  ProdLensReportInput,
  prodLensReportSchema
} from "@/lib/schema/report";
import { Prisma } from "@prisma/client";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "reports");

export async function ingestProdLensReport(payload: unknown) {
  const parsed = prodLensReportSchema.parse(payload);
  await fs.mkdir(STORAGE_ROOT, { recursive: true });

  const fileName = `${parsed.id}-${Date.now()}.json`;
  const absolutePath = path.join(STORAGE_ROOT, fileName);
  await fs.writeFile(absolutePath, JSON.stringify(parsed, null, 2), "utf-8");

  // Remove any existing report so the prototype stays idempotent.
  try {
    await prisma.report.delete({ where: { id: parsed.id } });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2025") {
      throw error;
    }
  }

  await prisma.report.create({
    data: buildReportCreateInput(parsed, path.relative(process.cwd(), absolutePath))
  });

  return parsed.id;
}

function buildReportCreateInput(report: ProdLensReportInput, relativePath: string) {
  return {
    id: report.id,
    title: report.title,
    description: report.description,
    product: report.product,
    generatedAt: new Date(report.generatedAt),
    timeRangeStart: new Date(report.timeRange.start),
    timeRangeEnd: new Date(report.timeRange.end),
    rawPath: relativePath,
    metrics: {
      create: report.metrics.map((metric) => ({
        id: metric.id,
        name: metric.name,
        description: metric.description,
        type: metric.type,
        unit: metric.unit,
        isKpi: metric.isKpi ?? false,
        dimensions: {
          create: metric.dimensions?.map((dimension) => ({
            name: dimension.name,
            value: dimension.value
          }))
        },
        points: {
          create: metric.points.map((point) => ({
            timestamp: new Date(point.timestamp),
            value: point.value,
            target: point.target,
            status: point.status
          }))
        },
        annotations: {
          create: metric.annotations?.map((annotation) => ({
            timestamp: new Date(annotation.timestamp),
            note: annotation.note,
            author: annotation.author
          }))
        }
      }))
    }
  } satisfies Prisma.ReportCreateInput;
}
