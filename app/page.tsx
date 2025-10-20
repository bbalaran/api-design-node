import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getReportSummaries } from "@/lib/data/report";

export default async function HomePage() {
  const reports = await getReportSummaries();
  return <DashboardShell initialReports={reports} />;
}
