import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus2, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

const invoiceCols: Column[] = [
  { key: "provider", header: "Service provider", type: "text", sortable: true },
  { key: "event", header: "Event", type: "text" },
  { key: "suppliers", header: "Suppliers", type: "number", align: "right" },
  { key: "totalNet", header: "Total net revenue", type: "money", align: "right" },
  { key: "createdBy", header: "Created by", type: "text", filter: true },
  { key: "createdAt", header: "Created", type: "date", sortable: true },
];

const generatedCols: Column[] = [
  { key: "number", header: "Invoice #", type: "text", sortable: true },
  { key: "provider", header: "Service provider", type: "text", sortable: true },
  { key: "event", header: "Event", type: "text" },
  { key: "invoicedAmount", header: "Invoiced amount", type: "money", align: "right" },
  { key: "createdBy", header: "Created by", type: "text", filter: true },
  { key: "createdAt", header: "Created", type: "date", sortable: true },
];

export default async function FinancePage() {
  await requireUser();
  const [invoices, generated] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        serviceProvider: { select: { partnerName: true } },
        event: { select: { eventName: true } },
        createdBy: { select: { name: true } },
        suppliers: { select: { netRevenue: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.generatedInvoice.findMany({
      include: {
        serviceProvider: { select: { partnerName: true } },
        event: { select: { eventName: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const invoiceRows = invoices.map((i) => ({
    id: i.id,
    provider: i.serviceProvider.partnerName,
    event: i.event.eventName,
    suppliers: i.suppliers.length,
    totalNet: i.suppliers.reduce((s, r) => s + r.netRevenue, 0),
    createdBy: i.createdBy.name,
    createdAt: i.createdAt.toISOString(),
  }));

  const generatedRows = generated.map((g) => ({
    id: g.id,
    number: `INV-${g.number}`,
    provider: g.serviceProvider.partnerName,
    event: g.event.eventName,
    invoicedAmount: g.invoicedAmount,
    createdBy: g.createdBy.name,
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance"
        subtitle="Requests for invoice and generated partner invoices."
        action={
          <div className="flex gap-2">
            <Link href="/finance/invoices/new">
              <Button variant="outline">
                <FilePlus2 className="h-4 w-4" /> New request for invoice
              </Button>
            </Link>
            <Link href="/finance/generate">
              <Button>
                <Receipt className="h-4 w-4" /> Generate invoice
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Requests for invoice</CardTitle>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={invoiceCols}
            rows={invoiceRows}
            hrefBase="/finance/invoices"
            searchKeys={["provider", "event"]}
            searchPlaceholder="Search provider or event…"
            dateFilterKey="createdAt"
            dateFilterLabel="Created"
            pageSize={8}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated invoices (PDF letters)</CardTitle>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={generatedCols}
            rows={generatedRows}
            hrefBase="/finance/generate"
            searchKeys={["provider", "event", "number"]}
            searchPlaceholder="Search invoice, provider, or event…"
            dateFilterKey="createdAt"
            dateFilterLabel="Created"
            pageSize={8}
          />
        </CardBody>
      </Card>
    </div>
  );
}
