import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { getUserNameMap } from "@/lib/crm-options";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const columns: Column[] = [
  { key: "customerName", header: "Customer", type: "text", sortable: true },
  { key: "companyName", header: "Company", type: "text" },
  { key: "city", header: "City", type: "text", filter: true },
  { key: "source", header: "Source", type: "text", filter: true },
  { key: "priority", header: "Priority", type: "text", filter: true },
  { key: "stage1", header: "Stage", type: "status", labelMap: "CRM_STAGE", filter: true },
  { key: "assignedTo", header: "Assigned to", type: "text", filter: true },
  { key: "date", header: "Date", type: "date", sortable: true },
];

export default async function CrmPage() {
  await requireUser();
  const [customers, names] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
    getUserNameMap(),
  ]);

  const rows = customers.map((c) => ({
    id: c.id,
    customerName: c.customerName,
    companyName: c.companyName ?? "—",
    city: c.city ?? "—",
    source: c.source ?? "—",
    priority: c.priority ?? "—",
    stage1: c.stage1,
    assignedTo: c.assignedToId ? names[c.assignedToId] ?? "—" : "—",
    date: c.date?.toISOString() ?? null,
  }));

  return (
    <div>
      <PageHeader
        title="CRM"
        subtitle="Sales pipeline. Filter by city, source, priority, stage, or owner; search by customer name."
        action={
          <Link href="/crm/new">
            <Button>
              <Plus className="h-4 w-4" /> New customer
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        hrefBase="/crm"
        searchKeys={["customerName", "companyName"]}
        searchPlaceholder="Search customer or company…"
        dateFilterKey="date"
        dateFilterLabel="Date"
      />
    </div>
  );
}
