import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ReportBuilder } from "./report-builder";
import { DATASETS } from "@/lib/reports";

export default async function ReportsPage() {
  await requireUser();
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate a report from any module, preview it, and export to Excel or PDF."
      />
      <ReportBuilder datasets={DATASETS.map((d) => ({ key: d.key, label: d.label }))} />
    </div>
  );
}
