import { z } from "zod";

const annotationSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string().datetime(),
  note: z.string().min(1),
  author: z.string().optional()
});

const metricPointSchema = z.object({
  timestamp: z.string().datetime(),
  value: z.number(),
  target: z.number().optional(),
  status: z.enum(["on_track", "watch", "breach"]).optional()
});

const dimensionSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1)
});

const metricSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z
    .enum(["percentage", "number", "duration", "currency", "ratio", "custom"])
    .default("number"),
  unit: z.string().optional(),
  isKpi: z.boolean().default(false),
  dimensions: z.array(dimensionSchema).default([]),
  points: z.array(metricPointSchema).min(1),
  annotations: z.array(annotationSchema).default([])
});

export const prodLensReportSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  product: z.string().min(1),
  generatedAt: z.string().datetime(),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  metrics: z.array(metricSchema).min(1)
});

export type ProdLensReportInput = z.infer<typeof prodLensReportSchema>;
export type ProdLensMetricInput = z.infer<typeof metricSchema>;
