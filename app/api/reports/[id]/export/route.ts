import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { getReportRawPath } from "@/lib/data/report";

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const rawPath = await getReportRawPath(params.id);

  if (!rawPath) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  const absolutePath = path.isAbsolute(rawPath)
    ? rawPath
    : path.join(process.cwd(), rawPath);

  const file = await fs.readFile(absolutePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename=\"${params.id}.json\"`
    }
  });
}
