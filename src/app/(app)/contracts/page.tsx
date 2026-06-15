import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const columns: Column[] = [
  { key: "partnerName", header: "Partner", type: "text", sortable: true },
  { key: "type", header: "Type", type: "label", labelMap: "PARTNER_TYPE", filter: true },
  { key: "subcategory", header: "Subcategory", type: "text" },
  { key: "status", header: "Status", type: "status", labelMap: "CONTRACT_STATUS", filter: true },
  { key: "issuer", header: "Issuer", type: "text", filter: true },
  { key: "contractIssuingDate", header: "Issuing date", type: "date", sortable: true },
  { key: "contractRenewal", header: "Renewal", type: "date", sortable: true },
  { key: "commissionPct", header: "Comm. %", type: "pct", align: "right" },
];

export default async function ContractsPage() {
  await requireUser();
  const contracts = await prisma.contract.findMany({
    include: { issuer: { select: { name: true } }, subcategory: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = contracts.map((c) => ({
    id: c.id,
    partnerName: c.partnerName,
    type: c.type,
    subcategory: c.subcategory?.name ?? "—",
    status: c.status,
    issuer: c.issuer.name,
    contractIssuingDate: c.contractIssuingDate?.toISOString() ?? null,
    contractRenewal: c.contractRenewal?.toISOString() ?? null,
    commissionPct: c.commissionPct,
  }));

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle="All venue & vendor partners. Filter by status, issuing date, renewal, or issuer; search by partner name."
        action={
          <Link href="/contracts/new">
            <Button>
              <Plus className="h-4 w-4" /> New contract
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        hrefBase="/contracts"
        searchKeys={["partnerName"]}
        searchPlaceholder="Search partner name…"
        dateFilterKey="contractIssuingDate"
        dateFilterLabel="Issuing date"
      />
    </div>
  );
}
